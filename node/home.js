/*** modules ***/
	if (!CORE) { var CORE = require("../node/core") }
	module.exports = {}

/*** authentication ***/
	/* signIn */
		module.exports.signIn = signIn
		function signIn(REQUEST, callback) {
			try {
				// validate
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
						if (!results.success) {
							callback({success: false, message: "invalid name or password"})
							return
						}

						// compare passwords
							var salt = results.documents[0].secret.salt
							if (CORE.hashRandom(REQUEST.post.user.password, salt) !== results.documents[0].secret.password) {
								callback({success: false, message: "invalid name or password"})
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
			}
			catch (error) {
				CORE.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* signOut */
		module.exports.signOut = signOut
		function signOut(REQUEST, callback) {
			try {
				// query
					var query = CORE.getSchema("query")
						query.collection = "sessions"
						query.command = "update"
						query.filters = {id: REQUEST.session.id}
						query.document = {userId: null, updated: new Date().getTime()}

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
			}
			catch (error) {
				CORE.logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}
