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
					if (!REQUEST.post.game.name) {
						callback({success: false, message: "no game name", recipients: [REQUEST.user.id]})
						return
					}

				// create
					var game = CORE.getSchema("game")
						game.name = REQUEST.post.game.name
						game.users[REQUEST.user.id] = {
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
							callback({success: true, message: REQUEST.user.name + " created " + game.name, game: game, recipients: [REQUEST.user.id]})

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

				// query
					var query = CORE.getSchema("query")
						query.collection = "games"
						query.command = "find"
						query.filters = REQUEST.post.game.id ? {id: REQUEST.post.game.id} : {name: REQUEST.post.game.name}

				// find
					CORE.accessDatabase(query, function(results) {
						if (!results.success) {
							callback({success: false, message: "no game found", recipients: [REQUEST.user.id]})
							return
						}

						// join game
							var game = results.documents[0]
								game.users[REQUEST.user.id] = {
									id: REQUEST.user.id, 
									name: REQUEST.user.name
								}

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
									callback({success: true, message: REQUEST.user.name + " joined " + game.name, game: game, recipients: Object.keys(game.users)})

								// add to list of user's games
									REQUEST.post.action = "updateUserGames"
									REQUEST.post.user = {game: game}
									USER.updateOne(REQUEST, callback)

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
									callback({success: true, message: REQUEST.user.name + " left " + game.name, game: null, content: null, character: null, recipients: [REQUEST.user.id]})

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
