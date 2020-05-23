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
								access: content.access
							}]

						// return content
							callback({success: true, message: "created " + content.name, content: content, contentList: contentList, selectContent: content.id, recipients: [REQUEST.user.id]})

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
							results.recipients = [REQUEST.user.id]
							callback(results)
							return
						}

						// no access
							if (results.documents[0].access && results.documents[0].access !== REQUEST.user.id) {
								callback({success: false, message: "no access", recipients: [REQUEST.user.id]})
								return
							}

						// return content
							var content = results.documents[0]
							var contentList = [{
								id: content.id,
								type: content.type,
								name: content.name,
								access: content.access
							}]
							callback({success: true, message: "opening " + content.name, content: content, contentList: contentList, selectContent: content.id, recipients: [REQUEST.user.id]})

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
					callback({success: true, message: "closed content", selectContent: null, recipients: [REQUEST.user.id]})

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
									return !i.access || (i.access == REQUEST.user.id)
								}) || []
							var contentList = content.map(function(i) {
								return {
									id: i.id,
									type: i.type,
									name: i.name,
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
								access: content.access
							}]

						// query
							var query = CORE.getSchema("query")
								query.collection = "users"
								query.command = "find"
								query.filters = {gameId: REQUEST.post.content.gameId}

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
									var recipients = content.access ? [content.access] : ids
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
					if (REQUEST.post.content.userId !== REQUEST.user.id) {
						callback({success: false, message: "only the creator may change access", recipients: [REQUEST.user.id]})
						return
					}

				// query
					var query = CORE.getSchema("query")
						query.collection = "content"
						query.command = "update"
						query.filters = {id: REQUEST.post.content.id, userId: REQUEST.post.content.userId}
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
								access: content.access
							}]

						// query
							var query = CORE.getSchema("query")
								query.collection = "users"
								query.command = "find"
								query.filters = {gameId: REQUEST.post.content.gameId}

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
									var recipients = content.access ? [content.access] : ids
									callback({success: true, message: REQUEST.user.name + " changed access to " + content.name, content: content, contentList: contentList, recipients: recipients})

								// pretend to have deleted content
									if (content.access) {
										var recipients = ids.filter(function(i) { return i !== content.access }) || []
										callback({success: true, content: {id: content.id, delete: true}, contentList: [{id: content.id, delete: true}], message: REQUEST.user.name + " restricted access to " + content.name, recipients: recipients})

										// unset contentId for other users
											var ids = results.documents.filter(function(u) { return u.contentId == content.id && u.id !== content.access }) || []
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

													// return user + character
														callback({success: true, user: user, recipients: [user.id]})
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
						query.document = {url: REQUEST.post.content.url, embedCode: REQUEST.post.content.embedCode, text: REQUEST.post.content.text}

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
								access: content.access
							}]

						// query
							var query = CORE.getSchema("query")
								query.collection = "users"
								query.command = "find"
								query.filters = {gameId: REQUEST.post.content.gameId}

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
									var recipients = content.access ? [content.access] : ids
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

				// file type
					var extension = REQUEST.post.content.file.name.split(".")
						extension = extension[extension.length - 1]
					var contentType = CORE.getContentType(extension)
					var detectedDataType = contentType.split("/")[0]
					if (!detectedDataType || detectedDataType !== REQUEST.post.content.type) {
						callback({success: false, message: "invalid data type", recipients: [REQUEST.user.id]})
						return
					}

				// write file
					CORE.accessFiles({command: "write", path: REQUEST.post.content.id + "." + extension, content: REQUEST.post.content.file.data, contentType: contentType, encoding: "binary"}, function(results) {
						if (!results.success || !results.path) {
							results.recipients = [REQUEST.user.id]
							callback(results)
							return
						}

						// query
							var query = CORE.getSchema("query")
								query.collection = "content"
								query.command = "update"
								query.filters = {id: REQUEST.post.content.id}
								query.document = {url: results.path, file: REQUEST.post.content.id + "." + extension}

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
										access: content.access
									}]

								// query
									var query = CORE.getSchema("query")
										query.collection = "users"
										query.command = "find"
										query.filters = {gameId: REQUEST.post.content.gameId}

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
											var recipients = content.access ? [content.access] : ids
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

						// objects?
							if (REQUEST.post.content.arena.objects) {
								// new
									if (REQUEST.post.content.arena.objects.new) {
										var count = Object.keys(arena.objects).length
										var object = CORE.getSchema("arenaObject")
											object.z = count
										arena.objects[object.id] = object
										
										if (REQUEST.post.content.arena.objects.new.characterId) {
											// query
												var query = CORE.getSchema("query")
													query.collection = "characters"
													query.command = "find"
													query.filters = {id: REQUEST.post.content.arena.objects.new.characterId}

											// find
												CORE.accessDatabase(query, function(results) {
													if (!results.success) {
														saveArenaObject()
														return
													}

													var character = results.documents[0]
													object.characterId = character.id
													object.image = character.info.image
													object.text = character.info.name
													saveArenaObject()
													return
												})
											return
										}
										else if (REQUEST.post.content.arena.objects.new.contentId) {
											// query
												var query = CORE.getSchema("query")
													query.collection = "content"
													query.command = "find"
													query.filters = {id: REQUEST.post.content.arena.objects.new.contentId}

											// find
												CORE.accessDatabase(query, function(results) {
													if (!results.success) {
														saveArenaObject()
														return
													}

													var content = results.documents[0]
													object.contentId = content.id
													object.image = content.url
													object.text = content.name
													saveArenaObject()
													return
												})
											return
										}
										else {
											saveArenaObject()
											return
										}
									}

								// delete
									else if (REQUEST.post.content.arena.objects.delete) {
										for (var i in REQUEST.post.content.arena.objects) {
											if (arena.objects[i]) {
												var z = arena.objects[i].z
												delete arena.objects[i]
											}

											for (var j in arena.objects) {
												if (arena.objects[j] >= z) {
													arena.objects[j].z -= 1
												}
											}
										}
										saveArenaObject()
										return
									} 

								// update object
									else {
										var count = Object.keys(arena.objects).length
										for (var i in REQUEST.post.content.arena.objects) {
											if (arena.objects[i]) {
												for (var j in REQUEST.post.content.arena.objects[i]) {
													if (j == "z") {
														var currentZ = arena.objects[i].z
														var newZ = currentZ + Number(REQUEST.post.content.arena.objects[i][j])

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

													arena.objects[i][j] = REQUEST.post.content.arena.objects[i][j]
												}
											}
										}
										saveArenaObject()
										return
									}
							}

						// save
							function saveArenaObject() {
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
												access: content.access
											}]

										// query
											var query = CORE.getSchema("query")
												query.collection = "users"
												query.command = "find"
												query.filters = {gameId: REQUEST.post.content.gameId}

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
													var recipients = content.access ? [content.access] : ids
													callback({success: true, content: content, contentList: contentList, recipients: recipients})
													return
											})
									})
							}
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
							if (content.access && content.access !== REQUEST.user.id) {
								callback({success: false, message: "no access to this content", recipients: [REQUEST.user.id]})
								return
							}
							if (content.userId !== REQUEST.user.id) {
								callback({success: false, message: "only the creator may delete the content", recipients: [REQUEST.user.id]})
								return
							}

						// query
							var query = CORE.getSchema("query")
								query.collection = "content"
								query.command = "delete"
								query.filters = {id: content.id, userId: REQUEST.user.id}

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
											var recipients = content.access ? [content.access] : ids
											callback({success: true, content: {id: content.id, delete: true}, contentList: [{id: content.id, delete: true}], message: REQUEST.user.name + " deleted " + REQUEST.post.content.name, recipients: recipients})

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

													// return user + character
														callback({success: true, user: user, recipients: [user.id]})
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
