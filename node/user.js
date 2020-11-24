/*** modules ***/
	if (!CORE) { var CORE = require("../node/core") }
	module.exports = {}

/*** creates ***/
	/* createOne */
		module.exports.createOne = createOne
		function createOne(REQUEST, callback) {
			try {
				// validate
					if (!REQUEST.post.user) {
						callback({success: false, message: "invalid user object"})
						return
					}
					if (!REQUEST.post.user.name || !CORE.isNumLet(REQUEST.post.user.name) || REQUEST.post.user.name.length < 8) {
						callback({success: false, message: "name must be 8+ numbers and letters"})
						return
					}
					if (!REQUEST.post.user.password || REQUEST.post.user.password.length < 8) {
						callback({success: false, message: "password must be 8+ characters"})
						return
					}

				// query
					var query = CORE.getSchema("query")
						query.collection = "users"
						query.command = "find"
						query.filters = {name: REQUEST.post.user.name}

				// find
					CORE.accessDatabase(query, function(results) {
						if (results.success && results.count) {
							callback({success: false, message: "name in use"})
							return
						}

						// new user
							var user = CORE.getSchema("user")
								user.name = REQUEST.post.user.name
								user.secret.salt = CORE.generateRandom()
								user.secret.password = CORE.hashRandom(REQUEST.post.user.password, user.secret.salt)

						// query
							var query = CORE.getSchema("query")
								query.collection = "users"
								query.command = "insert"
								query.document = user

						// insert
							CORE.accessDatabase(query, function(results) {
								if (!results.success) {
									callback(results)
									return
								}

								// query
									var query = CORE.getSchema("query")
										query.collection = "sessions"
										query.command = "update"
										query.filters = {id: REQUEST.session.id}
										query.document = {userId: results.documents[0].id, updated: new Date().getTime()}

								// update
									CORE.accessDatabase(query, function(results) {
										if (!results.success) {
											callback(results)
											return
										}

										// refresh
											callback({success: true, location: "/"})
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

/*** reads ***/
	/* readOneSelf */
		module.exports.readOneSelf = readOneSelf
		function readOneSelf(REQUEST, callback) {
			try {
				// authenticated?
					if (!REQUEST.session.userId) {
						callback({success: false, message: "not signed in"})
						return
					}

				// query
					var query = CORE.getSchema("query")
						query.collection = "users"
						query.command = "find"
						query.filters = {id: REQUEST.session.userId}

				// user
					CORE.accessDatabase(query, function(results) {
						if (!results.success) {
							REQUEST.session.userId = null
							callback({success: false, message: "unable to find user"})
							return
						}

						// user
							REQUEST.user = results.documents[0]
							delete REQUEST.user.secret

						// return
							callback({success: true})
							return
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
					if (!REQUEST.post.user) {
						callback({success: false, message: "invalid user object", recipients: [REQUEST.user.id]})
						return
					}

				// name
					if (REQUEST.post.action == "updateUserName") {
						updateName(REQUEST, callback)
						return
					}

				// password
					if (REQUEST.post.action == "updateUserPassword") {
						updatePassword(REQUEST, callback)
						return
					}

				// settings
					if (REQUEST.post.action == "updateUserSettings") {
						updateSettings(REQUEST, callback)
						return
					}

				// games
					if (REQUEST.post.action == "updateUserGames") {
						updateGames(REQUEST, callback)
						return
					}

				// characters
					if (REQUEST.post.action == "updateUserCharacter") {
						updateCharacter(REQUEST, callback)
						return
					}

				// content
					if (REQUEST.post.action == "updateUserContent") {
						updateContent(REQUEST, callback)
						return
					}

				// other
					callback({success: false, message: "unknown user update operation", recipients: [REQUEST.user.id]})
					return
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
					if (!REQUEST.post.user.name || !CORE.isNumLet(REQUEST.post.user.name) || REQUEST.post.user.name.length < 8) {
						callback({success: false, message: "name must be 8+ numbers and letters", recipients: [REQUEST.user.id]})
						return
					}

				// name
					var oldName = REQUEST.user.name
					var newName = REQUEST.post.user.name
					if (!newName || newName == oldName) {
						callback({success: false, message: "invalid name", recipients: [REQUEST.user.id]})
						return
					}

				// query
					var query = CORE.getSchema("query")
						query.collection = "users"
						query.command = "find"
						query.filters = {name: newName}

				// find
					CORE.accessDatabase(query, function(results) {
						if (results.success && results.count) {
							callback({success: false, message: "name in use", recipients: [REQUEST.user.id]})
							return
						}

						// query
							var query = CORE.getSchema("query")
								query.collection = "users"
								query.command = "update"
								query.filters = {id: REQUEST.user.id}
								query.document = {name: newName}

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

								// respond
									callback({success: true, message: "name updated to " + REQUEST.user.name, user: REQUEST.user, recipients: [REQUEST.user.id]})

								// update current game
									if (REQUEST.user.gameId) {
										// query
											var query = CORE.getSchema("query")
												query.collection = "games"
												query.command = "find"
												query.filters = {id: REQUEST.user.gameId}
											
										// find
											CORE.accessDatabase(query, function(results) {
												if (!results.success) {
													results.recipients = [REQUEST.user.id]
													callback(results)
													return
												}

												// change game users
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

														// send message to all users
															var game = results.documents[0]
															var recipients = Object.keys(game.users)
															callback({success: true, message: oldName + " is now " + newName, game: game, recipients: recipients})
													})
											})
									}
							})
					})
			}
			catch (error) {
				CORE.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* updatePassword */
		module.exports.updatePassword = updatePassword
		function updatePassword(REQUEST, callback) {
			try {
				// authenticated?
					if (!REQUEST.user || !REQUEST.user.id) {
						callback({success: false, message: "not signed in"})
						return
					}

				// validate
					if (!REQUEST.post.user.newPassword || REQUEST.post.user.newPassword.length < 8) {
						callback({success: false, message: "password must be 8+ characters", recipients: [REQUEST.user.id]})
						return
					}

				// password
					var newPassword = REQUEST.post.user.newPassword
					var oldPassword = REQUEST.post.user.oldPassword

				// query
					var query = CORE.getSchema("query")
						query.collection = "users"
						query.command = "find"
						query.filters = {id: REQUEST.user.id}

				// find
					CORE.accessDatabase(query, function(results) {
						if (!results.success) {
							results.recipients = [REQUEST.user.id]
							callback(results)
							return
						}

						// not found
							if (!results.documents || !results.documents[0] || !results.documents[0].secret || !results.documents[0].secret.password) {
								callback({success: false, message: "user not found", recipients: [REQUEST.user.id]})
								return
							}

						// authenticate old password
							if (CORE.hashRandom(oldPassword, results.documents[0].secret.salt) !== results.documents[0].secret.password) {
								callback({success: false, message: "old password is incorrect", recipients: [REQUEST.user.id]})
								return
							}

						// new salt
							var salt = CORE.generateRandom()

						// query
							var query = CORE.getSchema("query")
								query.collection = "users"
								query.command = "update"
								query.filters = {id: REQUEST.user.id}
								query.document = {secret: {salt: salt, password: CORE.hashRandom(newPassword, salt)}}

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

								// respond
									callback({success: true, message: "password updated", user: REQUEST.user, recipients: [REQUEST.user.id]})
									return
							})
					})
			}
			catch (error) {
				CORE.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* updateSettings */
		module.exports.updateSettings = updateSettings
		function updateSettings(REQUEST, callback) {
			try {
				// authenticated?
					if (!REQUEST.user || !REQUEST.user.id) {
						callback({success: false, message: "not signed in"})
						return
					}

				// validate
					if (!REQUEST.post.user || !REQUEST.post.user.settings) {
						callback({success: false, message: "invalid user object", recipients: [REQUEST.user.id]})
						return
					}

				// loop through settings
					REQUEST.user.settings.volume = Math.max(0, Math.min(1, REQUEST.post.user.settings.volume))

				// query
					var query = CORE.getSchema("query")
						query.collection = "users"
						query.command = "update"
						query.filters = {id: REQUEST.user.id}
						query.document = {settings: REQUEST.user.settings}

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

						// return user + character
							callback({success: true, user: REQUEST.user, recipients: [REQUEST.user.id]})
							return
					})
			}
			catch (error) {
				CORE.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* updateGames */
		module.exports.updateGames = updateGames
		function updateGames(REQUEST, callback) {
			try {
				// authenticated?
					if (!REQUEST.user || !REQUEST.user.id) {
						callback({success: false, message: "not signed in"})
						return
					}

				// validate
					if (!REQUEST.post.user) {
						callback({success: false, message: "invalid user object", recipients: [REQUEST.user.id]})
						return
					}

				// game
					var game = REQUEST.post.user.game || null

				// query
					var query = CORE.getSchema("query")
						query.collection = "users"
						query.command = "find"
						query.filters = {id: REQUEST.user.id}

				// user
					CORE.accessDatabase(query, function(results) {
						if (!results.success) {
							callback({success: false, message: "unable to find user", recipients: [REQUEST.user.id]})
							return
						}

						// update list of user's games
							var user = results.documents[0]
							if (game) {
								user.games[game.id] = {
									id: game.id,
									name: game.name
								}
							}

						// query
							var query = CORE.getSchema("query")
								query.collection = "users"
								query.command = "update"
								query.filters = {id: REQUEST.user.id}
								query.document = {games: user.games, gameId: game ? game.id : null, characterId: game ? user.characterId : null, contentId: game ? user.contentId : null}

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

								// return user + game
									callback({success: true, user: REQUEST.user, game: game || {id: null, delete: true}, recipients: [REQUEST.user.id]})
									return
							})
					})
			}
			catch (error) {
				CORE.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* updateCharacter */
		module.exports.updateCharacter = updateCharacter
		function updateCharacter(REQUEST, callback) {
			try {
				// authenticated?
					if (!REQUEST.user || !REQUEST.user.id) {
						callback({success: false, message: "not signed in"})
						return
					}

				// validate
					if (!REQUEST.post.user) {
						callback({success: false, message: "invalid user object", recipients: [REQUEST.user.id]})
						return
					}

				// get character
					var character = REQUEST.post.user.character

				// query
					var query = CORE.getSchema("query")
						query.collection = "users"
						query.command = "update"
						query.filters = {id: REQUEST.user.id}
						query.document = {characterId: character ? character.id : null}

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

						// return user + character
							callback({success: true, user: REQUEST.user, character: character || {id: null, delete: true}, recipients: [REQUEST.user.id]})
							return
					})
			}
			catch (error) {
				CORE.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* updateContent */
		module.exports.updateContent = updateContent
		function updateContent(REQUEST, callback) {
			try {
				// authenticated?
					if (!REQUEST.user || !REQUEST.user.id) {
						callback({success: false, message: "not signed in"})
						return
					}

				// validate
					if (!REQUEST.post.user) {
						callback({success: false, message: "invalid user object", recipients: [REQUEST.user.id]})
						return
					}

				// get content
					var content = REQUEST.post.user.content

				// query
					var query = CORE.getSchema("query")
						query.collection = "users"
						query.command = "update"
						query.filters = {id: REQUEST.user.id}
						query.document = {contentId: content ? content.id : null}

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

						// return user + content
							callback({success: true, user: REQUEST.user, content: content || {id: null, delete: true}, recipients: [REQUEST.user.id]})
							return
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

				// authenticate password
					if (CORE.hashRandom(REQUEST.post.user.password, REQUEST.user.salt) !== REQUEST.user.password) {
						callback({success: false, message: "password is incorrect", recipients: [REQUEST.user.id]})
						return
					}

				// query
					var query = CORE.getSchema("query")
						query.collection = "users"
						query.command = "delete"
						query.filters = {id: REQUEST.user.id}

				// delete
					CORE.accessDatabase(query, function(results) {
						if (!results.success) {
							results.recipients = [REQUEST.user.id]
							callback(results)
							return
						}

						// query
							var query = CORE.getSchema("query")
								query.collection = "sessions"
								query.command = "update"
								query.filters = {id: REQUEST.session.id}
								query.document = {userId: null, updated: new Date().getTime()}

						// update
							CORE.accessDatabase(query, function(results) {
								if (!results.success) {
									results.recipients = [REQUEST.user.id]
									callback(results)
									return
								}

								// refresh
									callback({success: true, location: "/"})
									return
							})
					})

			}
			catch (error) {
				CORE.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}
