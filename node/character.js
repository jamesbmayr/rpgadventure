/*** modules ***/
	if (!CORE) { var CORE = require("../node/core") }
	if (!USER) { var USER = require("../node/user") }

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
					if (!REQUEST.post.character) {
						callback({success: false, message: "no character object", recipients: [REQUEST.user.id]})
						return
					}
					if (!REQUEST.post.character.gameId) {
						callback({success: false, message: "no game selected", recipients: [REQUEST.user.id]})
						return
					}

				// query
					var query = CORE.getSchema("query")
						query.collection = "games"
						query.command = "find"
						query.filters = {id: REQUEST.post.character.gameId}

				// find
					CORE.accessDatabase(query, function(results) {
						if (!results.success) {
							callback({success: false, message: "game not found", recipients: [REQUEST.user.id]})
							return
						}

						// get game creator
							var gameUserId = results.documents[0].userId

						// upload or template?
							if (REQUEST.post.character.info && REQUEST.post.character.statistics) {
								var character = CORE.getSchema("character")

								for (var i in REQUEST.post.character) {
									character[i] = REQUEST.post.character[i]
								}

								character.info.name = "Copy of " + character.info.name
							}
							else if (!REQUEST.post.character.template) {
								callback({success: false, message: "no character template", recipients: [REQUEST.user.id]})
								return
							}
							else if (!REQUEST.post.character.template.type) {
								var character = CORE.getSchema("character")
							}
							else {
								// template validation
									var templates = CORE.getAsset(REQUEST.post.character.template.type)
									if (REQUEST.post.character.template.type && !templates) {
										callback({success: false, message: "invalid character template type", recipients: [REQUEST.user.id]})
										return
									}
									if (!REQUEST.post.character.template.name) {
										callback({success: false, message: "invalid character template name", recipients: [REQUEST.user.id]})
										return
									}

								// find
									var original = templates.find(function(c) {
										return c.info && c.info.name == REQUEST.post.character.template.name
									})
									if (!original) {
										callback({success: false, message: "invalid character template name", recipients: [REQUEST.user.id]})
										return
									}
									
									var character = CORE.getSchema("character")
									var duplicate = CORE.duplicateObject(original)
									for (var i in duplicate) {
										character[i] = duplicate[i]
									}
							}

						// assign
							character.id = CORE.generateRandom()
							character.userId = REQUEST.user.id
							character.gameId = REQUEST.post.character.gameId
							character.gameUserId = gameUserId
							character.access = REQUEST.user.id

						// query
							var query = CORE.getSchema("query")
								query.collection = "characters"
								query.command = "insert"
								query.document = character

						// insert
							CORE.accessDatabase(query, function(results) {
								if (!results.success) {
									results.recipients = [REQUEST.user.id]
									callback(results)
									return
								}

								// character
									var character = results.documents[0]
									var characterList = [{
										id: character.id,
										name: character.info.name,
										access: character.access
									}]

								// return character
									callback({success: true, message: "created " + character.info.name, characterList: characterList, recipients: [REQUEST.user.id]})

								// game creator is different?
									if (character.gameUserId !== REQUEST.user.id) {
										callback({success: true, characterList: characterList, recipients: [character.gameUserId]})
									}

								// add to list of user's characters
									REQUEST.post.action = "updateUserCharacter"
									REQUEST.post.user = {character: character}
									USER.updateOne(REQUEST, callback)
									return
							})
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
					if (!REQUEST.post.character || !REQUEST.post.character.id) {
						callback({success: false, message: "no character object selected", recipients: [REQUEST.user.id]})
						return
					}
					if (!REQUEST.post.character.gameId) {
						callback({success: false, message: "no game selected", recipients: [REQUEST.user.id]})
						return
					}

				// query
					var query = CORE.getSchema("query")
						query.collection = "characters"
						query.command = "find"
						query.filters = {gameId: REQUEST.post.character.gameId, id: REQUEST.post.character.id}

				// find
					CORE.accessDatabase(query, function(results) {
						if (!results.success) {
							callback({success: false, message: "character not found", recipients: [REQUEST.user.id]})
							return
						}

						// no access
							if (results.documents[0].access && results.documents[0].access !== REQUEST.user.id) {
								if (!results.documents[0].gameUserId || results.documents[0].gameUserId !== REQUEST.user.id) {
									callback({success: false, message: "no access", recipients: [REQUEST.user.id]})
									return
								}
							}

						// return character
							var character = results.documents[0]
							var characterList = [{
								id: character.id,
								name: character.info.name,
								access: character.access
							}]
							callback({success: true, message: "opening " + character.info.name, characterList: characterList, recipients: [REQUEST.user.id]})

						// set as user's current character
							REQUEST.post.action = "updateUserCharacter"
							REQUEST.post.user = {character: character}
							USER.updateOne(REQUEST, callback)
							return
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

				// inform
					callback({success: true, message: "closed character", recipients: [REQUEST.user.id]})

				// unset current character
					if (!REQUEST.post.character.stay) {
						REQUEST.post.action = "updateUserCharacter"
						REQUEST.post.user = {character: null}
						USER.updateOne(REQUEST, callback)
						return
					}
			}
			catch (error) {
				CORE.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* readAll */
		module.exports.readAll = readAll
		function readAll(REQUEST, callback) {
			try {
				// authenticated?
					if (!REQUEST.user || !REQUEST.user.id) {
						callback({success: false, message: "not signed in"})
						return
					}

				// validate
					if (!REQUEST.post.character) {
						callback({success: false, message: "no character request", recipients: [REQUEST.user.id]})
						return
					}
					if (!REQUEST.post.character.gameId) {
						callback({success: false, message: "no game selected", recipients: [REQUEST.user.id]})
						return
					}

				// query
					var query = CORE.getSchema("query")
						query.collection = "characters"
						query.command = "find"
						query.filters = {gameId: REQUEST.post.character.gameId}

				// find
					CORE.accessDatabase(query, function(results) {
						// filter characters
							var characters = results.documents || []
								characters = characters.filter(function(i) {
									return !i.access || (i.access == REQUEST.user.id) || (i.gameUserId && i.gameUserId == REQUEST.user.id)
								}) || []
							var characterList = characters.map(function(i) {
								return {
									id: i.id,
									name: i.info.name,
									access: i.access
								}
							}) || []

						// return data
							callback({success: true, characterList: characterList, recipients: [REQUEST.user.id]})
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
					if (!REQUEST.post.character || !REQUEST.post.character.id) {
						callback({success: false, message: "no character object", recipients: [REQUEST.user.id]})
						return
					}
					if (!REQUEST.post.character.gameId) {
						callback({success: false, message: "no game selected", recipients: [REQUEST.user.id]})
						return
					}

				// name
					if (REQUEST.post.action == "updateCharacterName") {
						updateName(REQUEST, callback)
						return
					}

				// access
					if (REQUEST.post.action == "updateCharacterAccess") {
						updateAccess(REQUEST, callback)
						return
					}

				// data
					if (REQUEST.post.action == "updateCharacterData") {
						updateData(REQUEST, callback)
						return
					}

				// image
					if (REQUEST.post.action == "updateCharacterImage") {
						updateImage(REQUEST, callback)
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
					if (!REQUEST.post.character || !REQUEST.post.character.id) {
						callback({success: false, message: "no character object", recipients: [REQUEST.user.id]})
						return
					}
					if (!REQUEST.post.character.info || !REQUEST.post.character.info.name) {
						callback({success: false, message: "no character name", recipients: [REQUEST.user.id]})
						return
					}

				// query
					var query = CORE.getSchema("query")
						query.collection = "characters"
						query.command = "update"
						query.filters = {id: REQUEST.post.character.id}
						query.document = REQUEST.post.character

				// update
					CORE.accessDatabase(query, function(results) {
						if (!results.success) {
							results.recipients = [REQUEST.user.id]
							callback(results)
							return
						}

						// character
							var character = results.documents[0]
							var characterList = [{
								id: character.id,
								name: character.info.name,
								access: character.access
							}]

						// query
							var query = CORE.getSchema("query")
								query.collection = "users"
								query.command = "find"
								query.filters = {gameId: REQUEST.post.character.gameId}

						// find
							CORE.accessDatabase(query, function(results) {
								if (!results.success) {
									results.recipients = [REQUEST.user.id]
									callback(results)
									return
								}

								// ids
									var ids = results.documents.map(function(u) {
										return u.id
									}) || []

								// return character
									var recipients = character.access ? (character.access == character.gameUserId ? [character.access] : [character.access, character.gameUserId]) : ids
									callback({success: true, message: REQUEST.user.name + " renamed character to " + character.info.name, character: character, characterList: characterList, recipients: recipients})
							})
					})
			}
			catch (error) {
				CORE.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* updateAccess */
		module.exports.updateAccess = updateAccess
		function updateAccess(REQUEST, callback) {
			try {
				// authenticated?
					if (!REQUEST.user || !REQUEST.user.id) {
						callback({success: false, message: "not signed in"})
						return
					}

				// validate
					if (!REQUEST.post.character || !REQUEST.post.character.id) {
						callback({success: false, message: "no character object", recipients: [REQUEST.user.id]})
						return
					}
					if (REQUEST.post.character.userId !== REQUEST.user.id && REQUEST.post.character.gameUserId !== REQUEST.user.id) {
						callback({success: false, message: "only the creator or game owner may change access", recipients: [REQUEST.user.id]})
						return
					}

				// query
					var query = CORE.getSchema("query")
						query.collection = "characters"
						query.command = "update"
						query.filters = {id: REQUEST.post.character.id}
						query.document = {access: REQUEST.post.character.access}

				// update
					CORE.accessDatabase(query, function(results) {
						if (!results.success) {
							results.recipients = [REQUEST.user.id]
							callback(results)
							return
						}

						// character
							var character = results.documents[0]
							var characterList = [{
								id: character.id,
								name: character.info.name,
								access: character.access
							}]

						// query
							var query = CORE.getSchema("query")
								query.collection = "users"
								query.command = "find"
								query.filters = {gameId: REQUEST.post.character.gameId}

						// find
							CORE.accessDatabase(query, function(results) {
								if (!results.success) {
									results.recipients = [REQUEST.user.id]
									callback(results)
									return
								}

								// ids
									var ids = results.documents.map(function(u) {
										return u.id
									}) || []

								// return character
									var recipients = character.access ? (character.access == character.gameUserId ? [character.access] : [character.access, character.gameUserId]) : ids
									callback({success: true, message: REQUEST.user.name + " changed access to " + character.info.name, character: character, characterList: characterList, recipients: recipients})

								// pretend to have deleted character
									if (character.access) {
										var recipients = ids.filter(function(i) { return i !== character.access && i !== character.gameUserId }) || []
										callback({success: true, characterList: [{id: character.id, delete: true}], message: REQUEST.user.name + " restricted access to " + character.info.name, recipients: recipients})

										// unset characterId for other users
											var ids = results.documents.filter(function(u) { return u.characterId == character.id && u.id !== character.access && u.id !== character.gameUserId }) || []
											if (!ids.length) { return }
											ids = ids.map(function(u) { return u.id }) || []
											if (!ids.length) { return }

											for (var i in ids) {
												var query = CORE.getSchema("query")
													query.collection = "users"
													query.command = "update"
													query.filters = {id: ids[i]}
													query.document = {characterId: null}

												CORE.accessDatabase(query, function(results) {
													if (!results.success) {
														return
													}

													// get updated user
														var user = results.documents[0]
														delete user.secret

													// return user + character
														callback({success: true, user: user, character: {id: null, delete: true}, recipients: [user.id]})
														return
												})
											}
									}
							})
					})
			}
			catch (error) {
				CORE.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* updateData */
		module.exports.updateData = updateData
		function updateData(REQUEST, callback) {
			try {
				// authenticated?
					if (!REQUEST.user || !REQUEST.user.id) {
						callback({success: false, message: "not signed in"})
						return
					}

				// validate
					if (!REQUEST.post.character || !REQUEST.post.character.id) {
						callback({success: false, message: "no character object", recipients: [REQUEST.user.id]})
						return
					}
					if (!REQUEST.post.character.gameId) {
						callback({success: false, message: "no game selected", recipients: [REQUEST.user.id]})
						return
					}
					if (!REQUEST.post.character.info || !REQUEST.post.character.statistics) {
						callback({success: false, message: "invalid character object", recipients: [REQUEST.user.id]})
						return
					}

				// ??? - TEMPORARY - backfill skill.statistic - ???
					for (var i in REQUEST.post.character.statistics) {
						for (var j in REQUEST.post.character.statistics[i].skills) {
							if (!REQUEST.post.character.statistics[i].skills[j].statistic) {
								REQUEST.post.character.statistics[i].skills[j].statistic = i
							}
						}
					}

				// query
					var query = CORE.getSchema("query")
						query.collection = "characters"
						query.command = "update"
						query.filters = {id: REQUEST.post.character.id}
						query.document = REQUEST.post.character

				// update
					CORE.accessDatabase(query, function(results) {
						if (!results.success) {
							results.recipients = [REQUEST.user.id]
							callback(results)
							return
						}

						// character
							var character = results.documents[0]
							var characterList = [{
								id: character.id,
								name: character.info.name,
								access: character.access
							}]

						// query
							var query = CORE.getSchema("query")
								query.collection = "users"
								query.command = "find"
								query.filters = {gameId: REQUEST.post.character.gameId}

						// find
							CORE.accessDatabase(query, function(results) {
								if (!results.success) {
									results.recipients = [REQUEST.user.id]
									callback(results)
									return
								}

								// ids
									var ids = results.documents.filter(function(u) {
										return u.characterId == character.id
									}).map(function(u) {
										return u.id
									}) || []

								// return character
									var recipients = ids
									callback({success: true, message: character.info.name + " updated", character: character, characterList: characterList, recipients: recipients})
							})
					})
			}
			catch (error) {
				CORE.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* updateImage */
		module.exports.updateImage = updateImage
		function updateImage(REQUEST, callback) {
			try {
				// authenticated?
					if (!REQUEST.user || !REQUEST.user.id) {
						callback({success: false, message: "not signed in"})
						return
					}

				// validate
					if (!REQUEST.post.character || !REQUEST.post.character.id) {
						callback({success: false, message: "invalid character object", recipients: [REQUEST.user.id]})
						return
					}
					if (!REQUEST.post.character.file || !REQUEST.post.character.file.name || !REQUEST.post.character.file.data) {
						callback({success: false, message: "no image uploaded", recipients: [REQUEST.user.id]})
						return
					}

				// file type
					var extension = REQUEST.post.character.file.name.split(".")
						extension = extension[extension.length - 1]
					var contentType = CORE.getContentType(extension)
					var detectedDataType = contentType.split("/")[0]
					if (!detectedDataType || detectedDataType !== "image") {
						callback({success: false, message: "invalid data type", recipients: [REQUEST.user.id]})
						return
					}

				// write file
					CORE.accessFiles({command: "write", path: REQUEST.post.character.id + "." + extension, content: REQUEST.post.character.file.data, contentType: contentType, encoding: "binary"}, function(results) {
						if (!results.success || !results.path) {
							results.recipients = [REQUEST.user.id]
							callback(results)
							return
						}

						// update character
							delete REQUEST.post.character.file
							REQUEST.post.character.info.image = results.path
							REQUEST.post.character.info.file = REQUEST.post.character.id + "." + extension

						// query
							var query = CORE.getSchema("query")
								query.collection = "characters"
								query.command = "update"
								query.filters = {id: REQUEST.post.character.id}
								query.document = REQUEST.post.character

						// update
							CORE.accessDatabase(query, function(results) {
								if (!results.success) {
									results.recipients = [REQUEST.user.id]
									callback(results)
									return
								}

								// character
									var character = results.documents[0]
									var characterList = [{
										id: character.id,
										name: character.info.name,
										access: character.access
									}]

								// query
									var query = CORE.getSchema("query")
										query.collection = "users"
										query.command = "find"
										query.filters = {gameId: REQUEST.post.character.gameId}

								// find
									CORE.accessDatabase(query, function(results) {
										if (!results.success) {
											results.recipients = [REQUEST.user.id]
											callback(results)
											return
										}

										// ids
											var ids = results.documents.filter(function(u) {
												return u.characterId == character.id
											}).map(function(u) {
												return u.id
											}) || []

										// return character
											var recipients = ids
											callback({success: true, character: character, characterList: characterList, recipients: recipients})
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
					if (!REQUEST.post.character || !REQUEST.post.character.id) {
						callback({success: false, message: "no character object", recipients: [REQUEST.user.id]})
						return
					}

				// query
					var query = CORE.getSchema("query")
						query.collection = "characters"
						query.command = "find"
						query.filters = {id: REQUEST.post.character.id}

				// delete
					CORE.accessDatabase(query, function(results) {
						if (!results.success) {
							results.recipients = [REQUEST.user.id]
							callback(results)
							return
						}

						// validate
							var character = results.documents[0]
							if (character.userId !== REQUEST.user.id && character.gameUserId !== REQUEST.user.id) {
								callback({success: false, message: "only the creator or game owner may delete the character", recipients: [REQUEST.user.id]})
								return
							}

						// query
							var query = CORE.getSchema("query")
								query.collection = "characters"
								query.command = "delete"
								query.filters = {id: character.id}

						// delete
							CORE.accessDatabase(query, function(results) {
								if (!results.success) {
									results.recipients = [REQUEST.user.id]
									callback(results)
									return
								}

								// query
									var query = CORE.getSchema("query")
										query.collection = "users"
										query.command = "find"
										query.filters = {gameId: character.gameId}

								// find
									CORE.accessDatabase(query, function(results) {
										if (!results.success) {
											results.recipients = [REQUEST.user.id]
											callback(results)
											return
										}

										// ids
											var ids = results.documents.map(function(u) {
												return u.id
											}) || []

										// return character
											var recipients = character.access ? (character.access == character.gameUserId ? [character.access] : [character.access, character.gameUserId]) : ids
											callback({success: true, characterList: [{id: character.id, delete: true}], message: REQUEST.user.name + " deleted " + REQUEST.post.character.info.name, recipients: recipients})

										// unset characterId for users
											var ids = results.documents.filter(function(u) { return u.characterId == character.id }) || []
											if (!ids.length) { return }
											ids = ids.map(function(u) { return u.id }) || []
											if (!ids.length) { return }

											for (var i in ids) {
												var query = CORE.getSchema("query")
													query.collection = "users"
													query.command = "update"
													query.filters = {id: ids[i]}
													query.document = {characterId: null}

												CORE.accessDatabase(query, function(results) {
													if (!results.success) {
														return
													}

													// get updated user
														var user = results.documents[0]
														delete user.secret

													// return user + character
														callback({success: true, user: user, character: {id: null, delete: true}, recipients: [user.id]})
														return
												})
											}
									})

								// delete actual file
									if (character.info.image && character.info.file) {
										CORE.accessFiles({command: "delete", path: character.info.file}, function(data) {
											CORE.logMessage(JSON.stringify(data))
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
