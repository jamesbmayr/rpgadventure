/*** modules ***/
	if (!CORE) { var CORE = require("../node/core") }
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
					if (!REQUEST.post.chat || !REQUEST.post.chat.display) {
						callback({success: false, message: "invalid chat object", recipients: [REQUEST.user.id]})
						return
					}
					if (!REQUEST.post.chat.gameId) {
						callback({success: false, message: "no game selected", recipients: [REQUEST.user.id]})
						return
					}

				// create chat
					var chat = CORE.getSchema("chat")
						chat.userId = REQUEST.user.id
						chat.gameId = REQUEST.post.chat.gameId
						chat.recipientId = REQUEST.post.chat.recipientId || null

				// regular message
					if (REQUEST.post.chat.display.sender && REQUEST.post.chat.display.time && REQUEST.post.chat.display.text) {
						chat.display.color = REQUEST.post.chat.display.color || CORE.getAsset("colors")["medium-gray"]
						chat.display.sender = REQUEST.post.chat.display.sender
						chat.display.recipient = chat.recipientId ? (REQUEST.post.chat.display.recipient || "") : null
						chat.display.time = REQUEST.post.chat.display.time
						chat.display.text = REQUEST.post.chat.display.text
					}

				// search results
					else if (REQUEST.post.chat.display.data) {
						chat.display.data = REQUEST.post.chat.display.data
					}

				// content share
					else if (REQUEST.post.chat.display.content) {
						chat.display.content = REQUEST.post.chat.display.content
					}

				// query
					var query = CORE.getSchema("query")
						query.collection = "chats"
						query.command = "insert"
						query.document = chat

				// insert
					CORE.accessDatabase(query, function(results) {
						if (!results.success) {
							results.recipients = [REQUEST.user.id]
							callback(results)
							return
						}

						// chats
							var chats = [results.documents[0]]

						// query
							var query = CORE.getSchema("query")
								query.collection = "users"
								query.command = "find"
								query.filters = {gameId: chats[0].gameId}

						// find
							CORE.accessDatabase(query, function(results) {
								if (!results.success) {
									results.recipients = [REQUEST.user.id]
									callback(results)
									return
								}

								var ids = results.documents.map(function(u) {
									return u.id
								}) || []
								var recipients = chats[0].recipientId ? [REQUEST.user.id, chats[0].recipientId] : ids
								callback({success: true, chat: chats, recipients: recipients})
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
	/* readAll */
		module.exports.readAll = readAll
		function readAll(REQUEST, callback) {
			try {
				// authenticated?
					if (!REQUEST.user || !REQUEST.user.id) {
						callback({success: false, message: "not signed in"})
						return
					}

				// no game?
					if (!REQUEST.post || !REQUEST.post.chat || !REQUEST.post.chat.gameId) {
						callback({success: false, message: "no game specified for chat", recipients: [REQUEST.user.id]})
					}

				// query
					var query = CORE.getSchema("query")
						query.collection = "chats"
						query.command = "find"
						query.filters = {gameId: REQUEST.post.chat.gameId}

				// find
					CORE.accessDatabase(query, function(results) {
						// sort & limit
							var chats = results.documents.sort(function(a, b) {
								return b.time - a.time
							}) || []

						// filter
							chats = chats.filter(function(c) { 
								return (c.userId == REQUEST.user.id) || (c.recipientId == REQUEST.user.id) || !c.recipientId
							})
							chats = chats.slice(0, 100) || []

						// return
							callback({success: true, chat: chats, recipients: [REQUEST.user.id]})
							return
					})
			}
			catch (error) {
				CORE.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}
