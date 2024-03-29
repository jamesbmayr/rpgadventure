/*** modules ***/
	if (!CORE) { var CORE = require("../node/core") }
	if (!USER) { var USER = require("../node/user") }
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
					if (!REQUEST.post.content) {
						callback({success: false, message: "no content object", recipients: [REQUEST.user.id]})
						return
					}
					if (!REQUEST.post.content.gameId) {
						callback({success: false, message: "no game selected", recipients: [REQUEST.user.id]})
						return
					}
					if (!REQUEST.post.content.type) {
						callback({success: false, message: "no content type", recipients: [REQUEST.user.id]})
						return
					}

				// query
					var query = CORE.getSchema("query")
						query.collection = "games"
						query.command = "find"
						query.filters = {id: REQUEST.post.content.gameId}

				// find
					CORE.accessDatabase(query, function(results) {
						if (!results.success) {
							callback({success: false, message: "game not found", recipients: [REQUEST.user.id]})
							return
						}

						// get game creator
							var gameUserId = results.documents[0].userId

						// create new content fresh
							if (REQUEST.post.content.name) {
								var content = CORE.getSchema("content")

								for (var i in REQUEST.post.content) {
									if (i !== "id") {
										content[i] = REQUEST.post.content[i]
									}
								}

								content.name = "Copy of " + content.name
							}

						// create content from template
							else {
								var content = CORE.getSchema("content")
									content.type = REQUEST.post.content.type
									content.name = "unnamed " + content.type
								if (content.type == "arena") {
									content.arena = CORE.getSchema("arena")
								}
							}

						// assign
							content.userId = REQUEST.user.id
							content.gameId = REQUEST.post.content.gameId
							content.gameUserId = gameUserId
							content.access = REQUEST.user.id

						// query
							var query = CORE.getSchema("query")
								query.collection = "content"
								query.command = "insert"
								query.document = content

						// insert
							CORE.accessDatabase(query, function(results) {
								if (!results.success) {
									results.recipients = [REQUEST.user.id]
									callback(results)
									return
								}

								// content
									var content = results.documents[0]
									var contentList = [{
										id: content.id,
										type: content.type,
										name: content.name,
										userId: content.userId,
										gameUserId: content.gameUserId,
										access: content.access
									}]

								// return content
									callback({success: true, message: "created " + content.name, contentList: contentList, recipients: [REQUEST.user.id]})

								// game creator is different?
									if (content.gameUserId !== REQUEST.user.id) {
										callback({success: true, contentList: contentList, recipients: [content.gameUserId]})
									}

								// set as user's current content
									REQUEST.post.action = "updateUserContent"
									REQUEST.post.user = {content: content}
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
					if (!REQUEST.post.content || !REQUEST.post.content.id) {
						callback({success: false, message: "no content object selected", recipients: [REQUEST.user.id]})
						return
					}
					if (!REQUEST.post.content.gameId) {
						callback({success: false, message: "no game selected", recipients: [REQUEST.user.id]})
						return
					}

				// query
					var query = CORE.getSchema("query")
						query.collection = "content"
						query.command = "find"
						query.filters = {gameId: REQUEST.post.content.gameId, id: REQUEST.post.content.id}

				// find
					CORE.accessDatabase(query, function(results) {
						if (!results.success) {
							callback({success: false, message: "content not found", recipients: [REQUEST.user.id]})
							return
						}

						// no access
							if (results.documents[0].access && results.documents[0].access !== REQUEST.user.id) {
								if (!results.documents[0].gameUserId || results.documents[0].gameUserId !== REQUEST.user.id) {
									callback({success: false, message: "no access", recipients: [REQUEST.user.id]})
									return
								}
							}

						// return content
							var content = results.documents[0]
							var contentList = [{
								id: content.id,
								type: content.type,
								name: content.name,
								userId: content.userId,
								gameUserId: content.gameUserId,
								access: content.access
							}]
							callback({success: true, message: "opening " + content.name, contentList: contentList, recipients: [REQUEST.user.id]})

						// set as user's current content
							REQUEST.post.action = "updateUserContent"
							REQUEST.post.user = {content: content}
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
					callback({success: true, message: "closed content", recipients: [REQUEST.user.id]})

				// unset current content
					if (!REQUEST.post.content.stay) {
						REQUEST.post.action = "updateUserContent"
						REQUEST.post.user = {content: null}
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
					if (!REQUEST.post.content) {
						callback({success: false, message: "no content request", recipients: [REQUEST.user.id]})
						return
					}
					if (!REQUEST.post.content.gameId) {
						callback({success: false, message: "no game selected", recipients: [REQUEST.user.id]})
						return
					}

				// query
					var query = CORE.getSchema("query")
						query.collection = "content"
						query.command = "find"
						query.filters = {gameId: REQUEST.post.content.gameId}

				// find
					CORE.accessDatabase(query, function(results) {
						// filter content
							var content = results.documents || []
								content = content.filter(function(i) {
									return !i.access || (i.access == REQUEST.user.id) || (i.gameUserId && i.gameUserId == REQUEST.user.id)
								}) || []
							var contentList = content.map(function(i) {
								return {
									id: i.id,
									type: i.type,
									name: i.name,
									userId: i.userId,
									gameUserId: i.gameUserId,
									access: i.access
								}
							}) || []

						// return data
							callback({success: true, contentList: contentList, recipients: [REQUEST.user.id]})
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
					if (!REQUEST.post.content || !REQUEST.post.content.id) {
						callback({success: false, message: "no content object", recipients: [REQUEST.user.id]})
						return
					}
					if (!REQUEST.post.content.gameId) {
						callback({success: false, message: "no game selected", recipients: [REQUEST.user.id]})
						return
					}

				// name
					if (REQUEST.post.action == "updateContentName") {
						updateName(REQUEST, callback)
						return
					}

				// access
					if (REQUEST.post.action == "updateContentAccess") {
						updateAccess(REQUEST, callback)
						return
					}

				// data
					if (REQUEST.post.action == "updateContentData") {
						updateData(REQUEST, callback)
						return
					}

				// file
					if (REQUEST.post.action == "updateContentFile") {
						updateFile(REQUEST, callback)
						return
					}

				// other
					callback({success: false, message: "unknown content update operation", recipients: [REQUEST.user.id]})
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
					if (!REQUEST.post.content || !REQUEST.post.content.id) {
						callback({success: false, message: "no content object", recipients: [REQUEST.user.id]})
						return
					}
					if (!REQUEST.post.content.name) {
						callback({success: false, message: "no content name", recipients: [REQUEST.user.id]})
						return
					}

				// query
					var query = CORE.getSchema("query")
						query.collection = "content"
						query.command = "update"
						query.filters = {id: REQUEST.post.content.id}
						query.document = {name: REQUEST.post.content.name}

				// update
					CORE.accessDatabase(query, function(results) {
						if (!results.success) {
							results.recipients = [REQUEST.user.id]
							callback(results)
							return
						}

						// content
							var content = results.documents[0]
							var contentList = [{
								id: content.id,
								type: content.type,
								name: content.name,
								userId: content.userId,
								gameUserId: content.gameUserId,
								access: content.access
							}]

						// query
							var query = CORE.getSchema("query")
								query.collection = "users"
								query.command = "find"
								query.filters = {gameId: content.gameId}

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

								// return content
									var recipients = content.access ? (content.access == content.gameUserId ? [content.access] : [content.access, content.gameUserId]) : ids
									callback({success: true, message: REQUEST.user.name + " renamed content to " + content.name, content: content, contentList: contentList, recipients: recipients})
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
					if (!REQUEST.post.content || !REQUEST.post.content.id) {
						callback({success: false, message: "no content object", recipients: [REQUEST.user.id]})
						return
					}
					if (REQUEST.post.content.userId !== REQUEST.user.id && REQUEST.post.content.gameUserId !== REQUEST.user.id) {
						callback({success: false, message: "only the creator or game owner may change access", recipients: [REQUEST.user.id]})
						return
					}

				// query
					var query = CORE.getSchema("query")
						query.collection = "content"
						query.command = "update"
						query.filters = {id: REQUEST.post.content.id}
						query.document = {access: REQUEST.post.content.access}

				// update
					CORE.accessDatabase(query, function(results) {
						if (!results.success) {
							results.recipients = [REQUEST.user.id]
							callback(results)
							return
						}

						// content
							var content = results.documents[0]
							var contentList = [{
								id: content.id,
								type: content.type,
								name: content.name,
								userId: content.userId,
								gameUserId: content.gameUserId,
								access: content.access
							}]

						// query
							var query = CORE.getSchema("query")
								query.collection = "users"
								query.command = "find"
								query.filters = {gameId: content.gameId}

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

								// return content
									var recipients = content.access ? (content.access == content.gameUserId ? [content.access] : [content.access, content.gameUserId]) : ids
									callback({success: true, message: REQUEST.user.name + " changed access to " + content.name, content: content, contentList: contentList, recipients: recipients})

								// pretend to have deleted content
									if (content.access) {
										var recipients = ids.filter(function(i) { return i !== content.access && i !== content.gameUserId }) || []
										callback({success: true, contentList: [{id: content.id, delete: true}], message: REQUEST.user.name + " restricted access to " + content.name, recipients: recipients})

										// unset contentId for other users
											var ids = results.documents.filter(function(u) { return u.contentId == content.id && u.id !== content.access && u.id !== content.gameUserId }) || []
											if (!ids.length) { return }
											ids = ids.map(function(u) { return u.id }) || []
											if (!ids.length) { return }

											for (var i in ids) {
												var query = CORE.getSchema("query")
													query.collection = "users"
													query.command = "update"
													query.filters = {id: ids[i]}
													query.document = {contentId: null}

												CORE.accessDatabase(query, function(results) {
													if (!results.success) {
														return
													}

													// get updated user
														var user = results.documents[0]
														delete user.secret

													// return user + content
														callback({success: true, user: user, content: {id: null, delete: true}, recipients: [user.id]})
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
					if (!REQUEST.post.content || !REQUEST.post.content.id) {
						callback({success: false, message: "no content object", recipients: [REQUEST.user.id]})
						return
					}

				// arena?
					if (REQUEST.post.content.arena) {
						updateArena(REQUEST, callback)
						return
					}

				// query
					var query = CORE.getSchema("query")
						query.collection = "content"
						query.command = "update"
						query.filters = {id: REQUEST.post.content.id}
						query.document = {url: REQUEST.post.content.url, code: REQUEST.post.content.code, text: REQUEST.post.content.text}

				// update
					CORE.accessDatabase(query, function(results) {
						if (!results.success) {
							results.recipients = [REQUEST.user.id]
							callback(results)
							return
						}

						// content
							var content = results.documents[0]
							var contentList = [{
								id: content.id,
								type: content.type,
								name: content.name,
								userId: content.userId,
								gameUserId: content.gameUserId,
								access: content.access
							}]

						// query
							var query = CORE.getSchema("query")
								query.collection = "users"
								query.command = "find"
								query.filters = {gameId: content.gameId}

						// find
							CORE.accessDatabase(query, function(results) {
								if (!results.success) {
									results.recipients = [REQUEST.user.id]
									callback(results)
									return
								}

								// ids
									var ids = results.documents.filter(function(u) {
										return u.contentId == content.id
									}).map(function(u) {
										return u.id
									}) || []

								// return content
									var recipients = ids
									callback({success: true, content: content, contentList: contentList, recipients: recipients})
									return
							})
					})
			}
			catch (error) {
				CORE.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* updateFile */
		module.exports.updateFile = updateFile
		function updateFile(REQUEST, callback) {
			try {
				// authenticated?
					if (!REQUEST.user || !REQUEST.user.id) {
						callback({success: false, message: "not signed in"})
						return
					}

				// validate
					if (!REQUEST.post.content || !REQUEST.post.content.id || !REQUEST.post.content.name || !REQUEST.post.content.type) {
						callback({success: false, message: "no content object", recipients: [REQUEST.user.id]})
						return
					}
					if (!REQUEST.post.content.file || !REQUEST.post.content.file.name || !REQUEST.post.content.file.data) {
						callback({success: false, message: "no file uploaded", recipients: [REQUEST.user.id]})
						return
					}

				// id
					var contentId = REQUEST.post.content.id

				// file type
					var extension = REQUEST.post.content.file.name.split(".")
						extension = extension[extension.length - 1]
					var contentType = CORE.getContentType(extension)
					var detectedDataType = contentType.split("/")[0]
					if (!detectedDataType || detectedDataType !== REQUEST.post.content.type) {
						callback({success: false, message: "invalid data type", recipients: [REQUEST.user.id]})
						return
					}

				// remove headers
					var data = REQUEST.post.content.file.data.split(",")[1]

				// write file
					CORE.accessFiles({command: "write", path: contentId + "." + extension, content: new Buffer.from(data, 'base64'), contentType: contentType, encoding: "base64"}, function(results) {
						if (!results.success || !results.path) {
							results.recipients = [REQUEST.user.id]
							callback(results)
							return
						}

						// query
							var query = CORE.getSchema("query")
								query.collection = "content"
								query.command = "update"
								query.filters = {id: contentId}
								query.document = {url: results.path, file: contentId + "." + extension}

						// update
							CORE.accessDatabase(query, function(results) {
								if (!results.success) {
									results.recipients = [REQUEST.user.id]
									callback(results)
									return
								}

								// content
									var content = results.documents[0]
									var contentList = [{
										id: content.id,
										type: content.type,
										name: content.name,
										userId: content.userId,
										gameUserId: content.gameUserId,
										access: content.access
									}]

								// query
									var query = CORE.getSchema("query")
										query.collection = "users"
										query.command = "find"
										query.filters = {gameId: content.gameId}

								// find
									CORE.accessDatabase(query, function(results) {
										if (!results.success) {
											results.recipients = [REQUEST.user.id]
											callback(results)
											return
										}

										// ids
											var ids = results.documents.filter(function(u) {
												return u.contentId == content.id
											}).map(function(u) {
												return u.id
											}) || []

										// return content
											var recipients = ids
											callback({success: true, content: content, contentList: contentList, recipients: recipients})
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

	/* updateArena */
		module.exports.updateArena = updateArena
		function updateArena(REQUEST, callback) {
			try {
				// query
					var query = CORE.getSchema("query")
						query.collection = "content"
						query.command = "find"
						query.filters = {id: REQUEST.post.content.id}

				// objects
					var arenaObjects = REQUEST.post.content.arena.objects || null
					var signal = REQUEST.post.content.arena.signal || null
					if (!arenaObjects && !signal) {
						callback({success: false, message: "invalid arena object", recipients: [REQUEST.user.id]})
						return
					}

				// find
					CORE.accessDatabase(query, function(results) {
						if (!results.success) {
							results.recipients = [REQUEST.user.id]
							callback(results)
							return
						}

						// arena
							var arena = results.documents[0].arena

						// no arena
							if (!arena) {
								callback({success: false, message: "invalid arena", recipients: [REQUEST.user.id]})
								return
							}

						// signal
							if (signal) {
								if (!arena.signals) { arena.signals = {} }
									
								var arenaSignal = CORE.getSchema("arenaSignal")
									arenaSignal.x = Number(signal.x) || 0
									arenaSignal.y = Number(signal.y) || 0
								arena.signals[arenaSignal.id] = arenaSignal

								saveArenaObject(REQUEST, arena, callback)
								return
							}

						// new object
							else if (arenaObjects.new) {
								var count = Object.keys(arena.objects).length
								var object = CORE.getSchema("arenaObject")
									object.z = count
									object.userId = REQUEST.user.id
								arena.objects[object.id] = object
								
								if (arenaObjects.new.characterId) {
									// query
										var query = CORE.getSchema("query")
											query.collection = "characters"
											query.command = "find"
											query.filters = {id: arenaObjects.new.characterId}

									// find
										CORE.accessDatabase(query, function(results) {
											if (!results.success) {
												saveArenaObject(REQUEST, arena, callback)
												return
											}

											var character = results.documents[0]
											object.characterId = character.id
											
											// arenaPresets
												if (character.arenaPresets) {
													for (var i in character.arenaPresets) {
														object[i] = character.arenaPresets[i]
													}
												}

												if (!object.name) {
													object.name = character.info.name
												}
												
											saveArenaObject(REQUEST, arena, callback)
											return
										})
									return
								}
								else if (arenaObjects.new.contentId) {
									// query
										var query = CORE.getSchema("query")
											query.collection = "content"
											query.command = "find"
											query.filters = {id: arenaObjects.new.contentId}

									// find
										CORE.accessDatabase(query, function(results) {
											if (!results.success) {
												saveArenaObject(REQUEST, arena, callback)
												return
											}

											var content = results.documents[0]
											object.contentId = content.id
											object.image = content.url
											object.name = content.name
											saveArenaObject(REQUEST, arena, callback)
											return
										})
									return
								}
								else if (arenaObjects.new.id) {
									// don't overwrite new values
										delete arenaObjects.new.id
										delete arenaObjects.new.time
										delete arenaObjects.new.z
										delete arenaObjects.new.userId

									// set all other values
										for (var i in arenaObjects.new) {
											object[i] = arenaObjects.new[i]
										}

									// save
										saveArenaObject(REQUEST, arena, callback)
										return
								}
								else {
									saveArenaObject(REQUEST, arena, callback)
									return
								}
							}

						// delete object
							else if (arenaObjects.delete) {
								for (var i in arenaObjects) {
									if (!arena.objects[i]) {
										continue
									}
									
									var z = arena.objects[i].z
									delete arena.objects[i]

									for (var j in arena.objects) {
										if (arena.objects[j].z >= z) {
											arena.objects[j].z -= 1
										}
									}
								}
								saveArenaObject(REQUEST, arena, callback)
								return
							} 

						// update object
							else {
								var count = Object.keys(arena.objects).length
								for (var i in arenaObjects) {
									if (arena.objects[i]) {
										for (var j in arenaObjects[i]) {
											if (j == "z") {
												var currentZ = arena.objects[i].z
												var newZ = currentZ + Number(arenaObjects[i][j])

												if (newZ < 0 || newZ >= count) {
													continue
												}

												var switchId = Object.keys(arena.objects).find(function(o) {
													return arena.objects[o].z == newZ
												})
												arena.objects[switchId].z = currentZ
												arena.objects[i].z = newZ
												continue
											}

											if (["x","y","z","width","height","textSize","corners","rotation","glow","opacity"].includes(j)) {
												arena.objects[i][j] = Number(arenaObjects[i][j]) || 0
											}
											else {
												arena.objects[i][j] = arenaObjects[i][j]
											}
										}
									}
								}
								saveArenaObject(REQUEST, arena, callback)
								return
							}
					})
			}
			catch (error) {
				CORE.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* saveArenaObject */
		module.exports.saveArenaObject = saveArenaObject
		function saveArenaObject(REQUEST, arena, callback) {
			try {
				// no arena?
					if (!arena || !REQUEST.post || !REQUEST.post.content) {
						callback({success: false, message: "arena inaccessible", recipients: [REQUEST.user.id]})
						return
					}

				// signals
					var now = new Date().getTime()
					for (var i in arena.signals) {
						if (arena.signals[i].expiration < now) {
							delete arena.signals[i]
						}
					}

				// query
					var query = CORE.getSchema("query")
						query.collection = "content"
						query.command = "update"
						query.filters = {id: REQUEST.post.content.id}
						query.document = {arena: arena}

				// update
					CORE.accessDatabase(query, function(results) {
						if (!results.success) {
							results.recipients = [REQUEST.user.id]
							callback(results)
							return
						}

						// content
							var content = results.documents[0]
							var contentList = [{
								id: content.id,
								type: content.type,
								name: content.name,
								userId: content.userId,
								gameUserId: content.gameUserId,
								access: content.access
							}]

						// query
							var query = CORE.getSchema("query")
								query.collection = "users"
								query.command = "find"
								query.filters = {gameId: content.gameId}

						// find
							CORE.accessDatabase(query, function(results) {
								if (!results.success) {
									results.recipients = [REQUEST.user.id]
									callback(results)
									return
								}

								// ids
									var ids = results.documents.filter(function(u) {
										return u.contentId == content.id
									}).map(function(u) {
										return u.id
									}) || []

								// return content
									var recipients = ids
									callback({success: true, content: content, contentList: contentList, recipients: recipients})
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
					if (!REQUEST.post.content || !REQUEST.post.content.id) {
						callback({success: false, message: "no content object", recipients: [REQUEST.user.id]})
						return
					}

				// query
					var query = CORE.getSchema("query")
						query.collection = "content"
						query.command = "find"
						query.filters = {id: REQUEST.post.content.id}

				// delete
					CORE.accessDatabase(query, function(results) {
						if (!results.success) {
							results.recipients = [REQUEST.user.id]
							callback(results)
							return
						}

						// validate
							var content = results.documents[0]
							if (content.userId !== REQUEST.user.id && content.gameUserId !== REQUEST.user.id) {
								callback({success: false, message: "only the creator or game owner may delete the content", recipients: [REQUEST.user.id]})
								return
							}

						// query
							var query = CORE.getSchema("query")
								query.collection = "content"
								query.command = "delete"
								query.filters = {id: content.id}

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
										query.filters = {gameId: content.gameId}

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

										// return content
											var recipients = content.access ? (content.access == content.gameUserId ? [content.access] : [content.access, content.gameUserId]) : ids
											callback({success: true, contentList: [{id: content.id, delete: true}], message: REQUEST.user.name + " deleted " + content.name, recipients: recipients})

										// unset contentId for users
											var ids = results.documents.filter(function(u) { return u.contentId == content.id }) || []
											if (!ids.length) { return }
											ids = ids.map(function(u) { return u.id }) || []
											if (!ids.length) { return }

											for (var i in ids) {
												var query = CORE.getSchema("query")
													query.collection = "users"
													query.command = "update"
													query.filters = {id: ids[i]}
													query.document = {contentId: null}

												CORE.accessDatabase(query, function(results) {
													if (!results.success) {
														return
													}

													// get updated user
														var user = results.documents[0]
														delete user.secret

													// return user + content
														callback({success: true, user: user, content: {id: null, delete: true}, recipients: [user.id]})
														return
												})
											}
									})

								// delete actual file
									if (content.url && content.file) {
										CORE.accessFiles({command: "delete", path: content.file}, function(data) {
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
