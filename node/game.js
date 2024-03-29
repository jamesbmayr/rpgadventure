/*** modules ***/
	if (!CORE) { var CORE = require("../node/core") }
	if (!USER) { var USER = require("../node/user") }
	if (!CHAT) { var CHAT = require("../node/chat") }
	if (!ROLL) { var ROLL = require("../node/roll") }
	if (!CHARACTER) { var CHARACTER = require("../node/character") }
	if (!CONTENT) { var CONTENT = require("../node/content") }
	module.exports = {}

/*** creates ***/
	/* createOne */
		module.exports.createOne = createOne
		function createOne(REQUEST, callback) {
			try {
				// authenticated?
					if (!REQUEST.user || !REQUEST.user.id) {
						callback({success: false, message: "not signed in"})
						return
					}

				// validate
					if (!REQUEST.post.game) {
						callback({success: false, message: "no game object", recipients: [REQUEST.user.id]})
						return
					}

				// create
					var game = CORE.getSchema("game")
						game.userId = REQUEST.user.id
						game.users[REQUEST.user.id] = {
							id: REQUEST.user.id,
							name: REQUEST.user.name
						}
						game.allUsers[REQUEST.user.id] = {
							id: REQUEST.user.id,
							name: REQUEST.user.name
						}

				// query
					var query = CORE.getSchema("query")
						query.collection = "games"
						query.command = "insert"
						query.document = game

				// insert
					CORE.accessDatabase(query, function(results) {
						if (!results.success) {
							results.recipients = [REQUEST.user.id]
							callback(results)
							return
						}

						// game
							var game = results.documents[0]
							callback({success: true, message: REQUEST.user.name + " created game " + game.name, recipients: [REQUEST.user.id]})

						// add to list of user's games
							REQUEST.post.action = "updateUserGames"
							REQUEST.post.user = {game: game}
							USER.updateOne(REQUEST, callback)
					})
			}
			catch (error) {
				CORE.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

/*** reads ***/
	/* readOne */
		module.exports.readOne = readOne
		function readOne(REQUEST, callback) {
			try {
				// authenticated?
					if (!REQUEST.user || !REQUEST.user.id) {
						callback({success: false, message: "not signed in"})
						return
					}

				// validate
					if (!REQUEST.post.game) {
						callback({success: false, message: "no game object selected", recipients: [REQUEST.user.id]})
						return
					}

				// id or name?
					if (!REQUEST.post.game.id && !REQUEST.post.game.name) {
						callback({success: false, message: "no game search criteria", recipients: [REQUEST.user.id]})
						return
					}

				// id
					var gameId = REQUEST.post.game.id || null
					var gameName = REQUEST.post.game.name ? REQUEST.post.game.name.trim() || null : null

				// query
					var query = CORE.getSchema("query")
						query.collection = "games"
						query.command = "find"
						query.filters = gameId ? {id: gameId} : {name: gameName}

				// find
					CORE.accessDatabase(query, function(results) {
						// not found
							if (!results.success || Object.keys(results.documents[0].bannedUsers).includes(REQUEST.user.id)) {
								// callback
									callback({success: false, message: "no game found", recipients: [REQUEST.user.id]})

								// game is in user's list?
									if (REQUEST.user.games[gameId]) {
										// remove from user
											delete REQUEST.user.games[gameId]
									
										// query
											var query = CORE.getSchema("query")
												query.collection = "users"
												query.command = "update"
												query.filters = {id: REQUEST.user.id}
												query.document = {games: REQUEST.user.games}

										// update
											CORE.accessDatabase(query, function(results) {
												if (!results.success) {
													results.recipients = [REQUEST.user.id]
													callback(results)
													return
												}

												// get updated user
													REQUEST.user = results.documents[0]
													delete REQUEST.user.secret

												// send update
													callback({success: true, user: REQUEST.user, recipients: [REQUEST.user.id]})
											})
									}

								return
							}

						// join game
							var game = results.documents[0]
								game.users[REQUEST.user.id] = {
									id: REQUEST.user.id, 
									name: REQUEST.user.name
								}
								game.allUsers[REQUEST.user.id] = {
									id: REQUEST.user.id, 
									name: REQUEST.user.name
								}

						// query
							var query = CORE.getSchema("query")
								query.collection = "games"
								query.command = "update"
								query.filters = {id: game.id}
								query.document = {users: game.users, allUsers: game.allUsers}

						// update
							CORE.accessDatabase(query, function(results) {
								if (!results.success) {
									results.recipients = [REQUEST.user.id]
									callback(results)
									return
								}

								// inform other players
									var game = results.documents[0]
									var ids = Object.keys(game.users)
										ids = ids.filter(function(id) { return id !== REQUEST.user.id }) || []
									callback({success: true, message: REQUEST.user.name + " joined " + game.name, game: game, recipients: ids})
									callback({success: true, message: REQUEST.user.name + " joined " + game.name, recipients: [REQUEST.user.id]})

								// add to list of user's games
									REQUEST.post.action = "updateUserGames"
									REQUEST.post.user = {game: game}
									USER.updateOne(REQUEST, function(data) {
										// join
											callback(data)

										// load chats
											REQUEST.post.action = "readChats"
											REQUEST.post.chat = {gameId: game.id}
											CHAT.readAll(REQUEST, callback)

										// load rolls
											REQUEST.post.action = "readRolls"
											REQUEST.post.rollGroup = {gameId: game.id}
											ROLL.readAll(REQUEST, callback)

										// load characters
											REQUEST.post.action = "readCharacters"
											REQUEST.post.character = {gameId: game.id}
											CHARACTER.readAll(REQUEST, callback)

										// load content
											REQUEST.post.action = "readContent"
											REQUEST.post.content = {gameId: game.id}
											CONTENT.readAll(REQUEST, callback)
									})
							})
					})
			}
			catch (error) {
				CORE.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* unreadOne */
		module.exports.unreadOne = unreadOne
		function unreadOne(REQUEST, callback) {
			try {
				// authenticated?
					if (!REQUEST.user || !REQUEST.user.id) {
						callback({success: false, message: "not signed in"})
						return
					}

				// validate
					if (!REQUEST.post.game) {
						callback({success: false, message: "no game object selected", recipients: [REQUEST.user.id]})
						return
					}

				// id 
					if (!REQUEST.post.game.id) {
						callback({success: false, message: "no game search criteria", recipients: [REQUEST.user.id]})
						return
					}

				// query
					var query = CORE.getSchema("query")
						query.collection = "games"
						query.command = "find"
						query.filters = {id: REQUEST.post.game.id}

				// find
					CORE.accessDatabase(query, function(results) {
						if (!results.success) {
							results.recipients = [REQUEST.user.id]
							callback(results)
							return
						}

						// leave game
							var game = results.documents[0]
							delete game.users[REQUEST.user.id]

						// query
							var query = CORE.getSchema("query")
								query.collection = "games"
								query.command = "update"
								query.filters = {id: game.id}
								query.document = {users: game.users}

						// update
							CORE.accessDatabase(query, function(results) {
								if (!results.success) {
									results.recipients = [REQUEST.user.id]
									callback(results)
									return
								}

								// inform other players
									var game = results.documents[0]
									callback({success: true, message: REQUEST.user.name + " left " + game.name, game: game, recipients: Object.keys(game.users)})
									callback({success: true, message: REQUEST.user.name + " left " + game.name, recipients: [REQUEST.user.id]})

								// unset current game
									if (!REQUEST.post.stay) {
										REQUEST.post.action = "updateUserGames"
										REQUEST.post.user = {game: null}
										USER.updateOne(REQUEST, callback)
										return
									}
							})
					})
			}
			catch (error) {
				CORE.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

/*** updates ***/
	/* updateOne */
		module.exports.updateOne = updateOne
		function updateOne(REQUEST, callback) {
			try {
				// authenticated?
					if (!REQUEST.user || !REQUEST.user.id) {
						callback({success: false, message: "not signed in"})
						return
					}

				// validate
					if (!REQUEST.post.game || !REQUEST.post.game.id) {
						callback({success: false, message: "no game object", recipients: [REQUEST.user.id]})
						return
					}

				// action
					if (REQUEST.post.action == "updateGameName") {
						updateName(REQUEST, callback)
						return
					}
					else if (REQUEST.post.action == "updateGameBanUser") {
						updateBanUser(REQUEST, callback)
						return
					}
					else if (REQUEST.post.action == "clearGameChat") {
						updateClearChatOrRolls(REQUEST, "chats", callback)
						return
					}
					else if (REQUEST.post.action == "clearGameRolls") {
						updateClearChatOrRolls(REQUEST, "rolls", callback)
						return
					}
					else {
						callback({success: false, message: "unknown game update action", recipients: [REQUEST.user.id]})
						return
					}
			}
			catch (error) {
				CORE.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* updateName */
		module.exports.updateName = updateName
		function updateName(REQUEST, callback) {
			try {
				// authenticated?
					if (!REQUEST.user || !REQUEST.user.id) {
						callback({success: false, message: "not signed in"})
						return
					}

				// validate
					if (!REQUEST.post.game || !REQUEST.post.game.id) {
						callback({success: false, message: "no game object", recipients: [REQUEST.user.id]})
						return
					}

				// game name
					var gameName = REQUEST.post.game.name.trim()

				// query
					var query = CORE.getSchema("query")
						query.collection = "games"
						query.command = "find"
						query.filters = {name: REQUEST.post.game.name}

				// find
					CORE.accessDatabase(query, function(results) {
						if (results.success && results.count) {
							callback({success: false, message: "name in use", recipients: [REQUEST.user.id]})
							return
						}

						// query
							var query = CORE.getSchema("query")
								query.collection = "games"
								query.command = "find"
								query.filters = {id: REQUEST.post.game.id}

						// find
							CORE.accessDatabase(query, function(results) {
								if (!results.success) {
									results.recipients = [REQUEST.user.id]
									callback(results)
									return
								}

								// validate
									var game = results.documents[0]
									if (game.userId !== REQUEST.user.id) {
										callback({success: false, message: "only the game creator may rename the game", recipients: [REQUEST.user.id]})
										return
									}

								// query
									var query = CORE.getSchema("query")
										query.collection = "games"
										query.command = "update"
										query.filters = {id: game.id, userId: REQUEST.user.id}
										query.document = {name: gameName}

								// update
									CORE.accessDatabase(query, function(results) {
										if (!results.success) {
											results.recipients = [REQUEST.user.id]
											callback(results)
											return
										}

										// game
											var game = results.documents[0]

										// query
											var query = CORE.getSchema("query")
												query.collection = "users"
												query.command = "find"
												query.filters = {gameId: game.id}
										
										// find
											CORE.accessDatabase(query, function(results) {
												if (!results.success) {
													results.recipients = [REQUEST.user.id]
													callback(results)
													return
												}

												// ids
													var users = results.documents
													var ids = results.documents.map(function(u) {
														return u.id
													}) || []

												// update games
													for (var i in users) {
														// games
															var games = users[i].games
																games[game.id].name = game.name

														// query
															var query = CORE.getSchema("query")
																query.collection = "users"
																query.command = "update"
																query.filters = {id: users[i].id}
																query.document = {games: games}

														// update
															CORE.accessDatabase(query, function(results) {
																if (!results.success) {
																	results.recipients = [REQUEST.user.id]
																	callback(results)
																	return
																}

																// get updated user
																	var updatedUser = results.documents[0]
																	delete updatedUser.secret

																// send update
																	callback({success: true, message: REQUEST.user.name + " renamed the game to " + game.name, game: game, user: updatedUser, recipients: [updatedUser.id]})
																	return
															})
													}
											})
									})
							})
					})
			}
			catch (error) {
				CORE.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* updateBanUser */
		module.exports.updateBanUser = updateBanUser
		function updateBanUser(REQUEST, callback) {
			try {
				// authenticated?
					if (!REQUEST.user || !REQUEST.user.id) {
						callback({success: false, message: "not signed in"})
						return
					}

				// validate
					if (!REQUEST.post.game || !REQUEST.post.game.id) {
						callback({success: false, message: "no game object", recipients: [REQUEST.user.id]})
						return
					}

				// query
					var query = CORE.getSchema("query")
						query.collection = "games"
						query.command = "find"
						query.filters = {id: REQUEST.post.game.id}

				// find
					CORE.accessDatabase(query, function(results) {
						if (!results.success) {
							results.recipients = [REQUEST.user.id]
							callback(results)
							return
						}

						// validate
							var game = results.documents[0]
							if (game.userId !== REQUEST.user.id) {
								callback({success: false, message: "only the game creator may ban or unban players", recipients: [REQUEST.user.id]})
								return
							}
							if (!REQUEST.post.game.banUserId) {
								callback({success: false, message: "no player selected for ban or unban", recipients: [REQUEST.user.id]})
								return
							}

						// prevent banning self
							if (game.userId == REQUEST.post.game.banUserId) {
								callback({success: false, message: "cannot ban game creator", recipients: [REQUEST.user.id]})
								return
							}

						// ban user
							if (REQUEST.post.game.ban) {
								// find user
									var banUser = game.allUsers[REQUEST.post.game.banUserId]
									if (!banUser) {
										callback({success: false, message: "unable to find user in game", recipients: [REQUEST.user.id]})
										return
									}

								// add to banned users
									if (!game.bannedUsers) { game.bannedUsers = {} }
									game.bannedUsers[banUser.id] = {
										id: banUser.id,
										name: banUser.name
									}

								// delete user from game
									if (game.users[banUser.id]) {
										delete game.users[banUser.id]
									}
									delete game.allUsers[banUser.id]

								// query
									var query = CORE.getSchema("query")
										query.collection = "games"
										query.command = "update"
										query.filters = {id: game.id, userId: REQUEST.user.id}
										query.document = {users: game.users, allUsers: game.allUsers, bannedUsers: game.bannedUsers}

								// update
									CORE.accessDatabase(query, function(results) {
										if (!results.success) {
											results.recipients = [REQUEST.user.id]
											callback(results)
											return
										}

										// update other players
											var game = results.documents[0]
											var ids = Object.keys(game.users)
												ids = ids.filter(function(id) { return id !== banUser.id }) || []
											callback({success: true, message: REQUEST.user.name + " banned player " + banUser.name, game: game, recipients: ids})

										// remove game from banned user / kick them out
											// query
												var query = CORE.getSchema("query")
													query.collection = "users"
													query.command = "find"
													query.filters = {id: banUser.id}

											// find
												CORE.accessDatabase(query, function(results) {
													if (!results.success) {
														return
													}

													// remove game from user
														var thatUser = results.documents[0]
														delete thatUser.games[game.id]

													// currently playing that game?
														if (thatUser.gameId == game.id) {
															var currentlyPlaying = true
															thatUser.gameId = null
															thatUser.characterId = null
															thatUser.contentId = null
														}
														else {
															var currentlyPlaying = false
														}

													// query
														var query = CORE.getSchema("query")
															query.collection = "users"
															query.command = "update"
															query.filters = {id: thatUser.id}
															query.document = {games: thatUser.games, gameId: thatUser.gameId, characterId: thatUser.characterId, contentId: thatUser.contentId}

													// update
														CORE.accessDatabase(query, function(results) {
															if (!results.success) {
																results.recipients = [REQUEST.user.id]
																callback(results)
																return
															}

															// get updated user
																var updatedUser = results.documents[0]
																delete updatedUser.secret

															// send update
																if (currentlyPlaying) {
																	callback({success: true, user: updatedUser, game: {id: null, delete: true}, location: "/", recipients: [updatedUser.id]})
																	return
																}
																else {
																	callback({success: true, user: updatedUser, recipients: [updatedUser.id]})
																	return
																}
														})
												})
									})
							}

						// unban user
							else {
								// find user
									var unbanUser = game.bannedUsers[REQUEST.post.game.banUserId]
									if (!unbanUser) {
										callback({success: false, message: "unable to find banned user in game", recipients: [REQUEST.user.id]})
										return
									}

								// add to allUsers
									game.allUsers[unbanUser.id] = {
										id: unbanUser.id,
										name: unbanUser.name
									}

								// delete user from banned users
									delete game.bannedUsers[unbanUser.id]

								// query
									var query = CORE.getSchema("query")
										query.collection = "games"
										query.command = "update"
										query.filters = {id: game.id, userId: REQUEST.user.id}
										query.document = {allUsers: game.allUsers, bannedUsers: game.bannedUsers}

								// update
									CORE.accessDatabase(query, function(results) {
										if (!results.success) {
											results.recipients = [REQUEST.user.id]
											callback(results)
											return
										}

										// update other players
											var game = results.documents[0]
											var ids = Object.keys(game.users)
											callback({success: true, game: game, recipients: ids})
									})
							}
					})
			}
			catch (error) {
				CORE.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* updateClearChatOrRolls */
		module.exports.updateClearChatOrRolls = updateClearChatOrRolls
		function updateClearChatOrRolls(REQUEST, collection, callback) {
			try {
				// authenticated?
					if (!REQUEST.user || !REQUEST.user.id) {
						callback({success: false, message: "not signed in"})
						return
					}

				// validate
					if (!REQUEST.post.game || !REQUEST.post.game.id) {
						callback({success: false, message: "no game object", recipients: [REQUEST.user.id]})
						return
					}
					if (!collection || !["chats", "rolls"].includes(collection)) {
						callback({success: false, message: "invalid collection to clear", recipients: [REQUEST.user.id]})
						return
					}

				// query
					var query = CORE.getSchema("query")
						query.collection = "games"
						query.command = "find"
						query.filters = {id: REQUEST.post.game.id}

				// find
					CORE.accessDatabase(query, function(results) {
						if (!results.success) {
							results.recipients = [REQUEST.user.id]
							callback(results)
							return
						}

						// validate
							var game = results.documents[0]
							if (game.userId !== REQUEST.user.id) {
								callback({success: false, message: "only the game creator may clear chat or rolls", recipients: [REQUEST.user.id]})
								return
							}

						// query
							var query = CORE.getSchema("query")
								query.collection = collection
								query.command = "delete"
								query.filters = {gameId: game.id}

						// delete
							CORE.accessDatabase(query, function(results) {
								if (!results.success) {
									results.recipients = [REQUEST.user.id]
									callback(results)
									return
								}

								// ids
									var ids = Object.keys(game.users)

								// send update
									if (collection == "chats") {
										callback({success: true, message: REQUEST.user.name + " cleared the chat", chat: {delete: true}, recipients: ids})
									}
									else if (collection == "rolls") {
										callback({success: true, message: REQUEST.user.name + " cleared all rolls", roll: {delete: true}, recipients: ids})	
									}
									return
							})
					})
			}
			catch (error) {
				CORE.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

/*** deletes ***/
	/* deleteOne */
		module.exports.deleteOne = deleteOne
		function deleteOne(REQUEST, callback) {
			try {
				// authenticated?
					if (!REQUEST.user || !REQUEST.user.id) {
						callback({success: false, message: "not signed in"})
						return
					}

				// validate
					if (!REQUEST.post.game || !REQUEST.post.game.id) {
						callback({success: false, message: "no game object", recipients: [REQUEST.user.id]})
						return
					}

				// query
					var query = CORE.getSchema("query")
						query.collection = "games"
						query.command = "find"
						query.filters = {id: REQUEST.post.game.id}

				// find
					CORE.accessDatabase(query, function(results) {
						if (!results.success) {
							results.recipients = [REQUEST.user.id]
							callback(results)
							return
						}

						// validate
							var game = results.documents[0]
							if (game.userId !== REQUEST.user.id) {
								callback({success: false, message: "only the game creator may delete the game", recipients: [REQUEST.user.id]})
								return
							}

						// query
							var query = CORE.getSchema("query")
								query.collection = "games"
								query.command = "delete"
								query.filters = {id: game.id, userId: REQUEST.user.id}

						// delete
							CORE.accessDatabase(query, function(results) {
								if (!results.success) {
									results.recipients = [REQUEST.user.id]
									callback(results)
									return
								}

								// remove game from all users who have ever opened it
									for (var i in game.allUsers) {
										// query
											var query = CORE.getSchema("query")
												query.collection = "users"
												query.command = "find"
												query.filters = {id: game.allUsers[i].id}

										// find
											CORE.accessDatabase(query, function(results) {
												if (!results.success) {
													return
												}

												// remove game from user
													var thatUser = results.documents[0]
													delete thatUser.games[game.id]

												// currently playing that game?
													if (thatUser.gameId == game.id) {
														var currentlyPlaying = true
														thatUser.gameId = null
														thatUser.characterId = null
														thatUser.contentId = null
													}
													else {
														var currentlyPlaying = false
													}

												// query
													var query = CORE.getSchema("query")
														query.collection = "users"
														query.command = "update"
														query.filters = {id: thatUser.id}
														query.document = {games: thatUser.games, gameId: thatUser.gameId, characterId: thatUser.characterId, contentId: thatUser.contentId}

												// update
													CORE.accessDatabase(query, function(results) {
														if (!results.success) {
															results.recipients = [REQUEST.user.id]
															callback(results)
															return
														}

														// get updated user
															var updatedUser = results.documents[0]
															delete updatedUser.secret

														// send update
															if (currentlyPlaying) {
																callback({success: true, user: updatedUser, game: {id: null, delete: true}, location: "/", recipients: [updatedUser.id]})
															}
															else {
																callback({success: true, user: updatedUser, recipients: [updatedUser.id]})
															}
													})
											})
									}

								// delete chats
									// query
										var query = CORE.getSchema("query")
											query.collection = "chats"
											query.command = "delete"
											query.filters = {gameId: game.id}

									// delete
										CORE.accessDatabase(query, function(results) {
											return
										})

								// delete rolls
									// query
										var query = CORE.getSchema("query")
											query.collection = "rolls"
											query.command = "delete"
											query.filters = {gameId: game.id}

									// delete
										CORE.accessDatabase(query, function(results) {
											return
										})

								// delete content
									// query
										var query = CORE.getSchema("query")
											query.collection = "content"
											query.command = "delete"
											query.filters = {gameId: game.id}

									// delete
										CORE.accessDatabase(query, function(results) {
											return
										})

								// delete characters
									// query
										var query = CORE.getSchema("query")
											query.collection = "characters"
											query.command = "delete"
											query.filters = {gameId: game.id}

									// delete
										CORE.accessDatabase(query, function(results) {
											return
										})
							})
					})
			}
			catch (error) {
				CORE.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}
