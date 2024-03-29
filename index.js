/*** modules ***/
	var HTTP = require("http")
	var FS   = require("fs")
	var QS   = require("querystring")
	var WS   = require("websocket").server

	var CORE = require("./node/core")
	var HOME = require("./node/home")
	var USER = require("./node/user")
	var SESSION = require("./node/session")
	var CHARACTER = require("./node/character")
	var CONTENT = require("./node/content")
	var CHAT = require("./node/chat")
	var ROLL = require("./node/roll")
	var GAME = require("./node/game")

/*** constants ***/
	var ENVIRONMENT = CORE.getEnvironment()

/*** server ***/
	/* server */
		var SERVER = HTTP.createServer(handleRequest)
			SERVER.listen(ENVIRONMENT.port, launchServer)

	/* launchServer */
		function launchServer(error) {
			if (error) {
				CORE.logError(error)
				return
			}
			CORE.logStatus("listening on port " + ENVIRONMENT.port)
		}

	/* handleRequest */
		function handleRequest(REQUEST, RESPONSE) {
			try {
				// collect data
					var data = ""
					REQUEST.on("data", function (chunk) { data += chunk })
					REQUEST.on("end", function() {
						parseRequest(REQUEST, RESPONSE, data)
					})
			}
			catch (error) {
				CORE.logError(error)
				return
			}
		}

	/* parseRequest */
		function parseRequest(REQUEST, RESPONSE, data) {
			try {
				// get request info
					REQUEST.get    = QS.parse(REQUEST.url.split("?")[1]) || {}
					REQUEST.path   = REQUEST.url.split("?")[0].split("/") || []
					REQUEST.url    = REQUEST.url.split("?")[0] || "/"
					REQUEST.post   = data ? JSON.parse(data) : {}
					REQUEST.cookie = REQUEST.headers.cookie ? QS.parse(REQUEST.headers.cookie.replace(/; /g, "&")) : {}
					REQUEST.ip     = REQUEST.headers["x-forwarded-for"] || REQUEST.connection.remoteAddress || REQUEST.socket.remoteAddress || REQUEST.connection.socket.remoteAddress
					REQUEST.contentType = CORE.getContentType(REQUEST.url)
					REQUEST.fileType = (/[.]([a-zA-Z0-9])+$/).test(REQUEST.url) ? (REQUEST.path[REQUEST.path.length - 1].split(".")[1] || null) : null

				// log it
					if (REQUEST.url !== "/favicon.ico") {
						CORE.logStatus((REQUEST.cookie.session || "new") + " @ " + REQUEST.ip + "\n" + 
						"[" + REQUEST.method + "] " + REQUEST.path.join("/") + "\n" + 
						JSON.stringify(REQUEST.method == "GET" ? REQUEST.get : REQUEST.post.action + ": " + Object.keys(REQUEST.post).filter(function(k) { return k !== "action" })))
					}
					
				// readSession
					SESSION.readOne(REQUEST, RESPONSE, routeRequest)
			}
			catch (error) {_403(REQUEST, RESPONSE, "unable to " + arguments.callee.name)}
		}

	/* routeRequest */
		function routeRequest(REQUEST, RESPONSE) {
			try {
				// get
					if (REQUEST.method == "GET") {
						switch (true) {
							// ping
								case (/^\/ping\/?$/).test(REQUEST.url):
									try {
										RESPONSE.writeHead(200, {
											"Content-Type": "text/json"
										})
										RESPONSE.end( JSON.stringify({success: true, timestamp: new Date().getTime()}) )
									}
									catch (error) {_403(error)}
								break
								
							// favicon
								case (/\/favicon[.]ico$/).test(REQUEST.url):
								case (/\/icon[.]png$/).test(REQUEST.url):
								case (/\/apple\-touch\-icon[.]png$/).test(REQUEST.url):
								case (/\/apple\-touch\-icon\-precomposed[.]png$/).test(REQUEST.url):
								case (/\/logo[.]png$/).test(REQUEST.url):
									try {
										RESPONSE.writeHead(200, CORE.constructHeaders(REQUEST))
										FS.readFile("./assets/logo.png", function (error, file) {
											if (error) {
												_404(REQUEST, RESPONSE, error)
												return
											}
											
											RESPONSE.end(file, "binary")
										})
									}
									catch (error) {_404(REQUEST, RESPONSE, error)}
								break

							// css
								case (REQUEST.fileType == "css"):
									try {
										RESPONSE.writeHead(200, CORE.constructHeaders(REQUEST))
										FS.readFile("./css/" + REQUEST.path[REQUEST.path.length - 1], function (error, file) {
											if (error) {
												_404(REQUEST, RESPONSE, error)
												return
											}
											
											RESPONSE.end(file, "binary")
										})
									}
									catch (error) {_404(REQUEST, RESPONSE, error)}
								break

							// js
								case (REQUEST.fileType == "js"):
									try {
										RESPONSE.writeHead(200, CORE.constructHeaders(REQUEST))
										FS.readFile("./js/" + REQUEST.path[REQUEST.path.length - 1], function (error, file) {
											if (error) {
												_404(REQUEST, RESPONSE, error)
												return
											}
											
											RESPONSE.end(file, "binary")
										})
									}
									catch (error) {_404(REQUEST, RESPONSE, error)}
								break

							// asset
								case (/[.]([a-zA-Z0-9])+$/).test(REQUEST.url):
									try {
										RESPONSE.writeHead(200, CORE.constructHeaders(REQUEST))
										FS.readFile("./assets/" + REQUEST.path[REQUEST.path.length - 1], function (error, file) {
											if (error) {
												_404(REQUEST, RESPONSE, error)
												return
											}
											
											RESPONSE.end(file, "binary")
										})
									}
									catch (error) {_404(REQUEST, RESPONSE, error)}
								break
						
							// home
								case (/^\/?$/).test(REQUEST.url):
									try {
										RESPONSE.writeHead(200, CORE.constructHeaders(REQUEST))

										// not authenticated?
											if (!REQUEST.user || !REQUEST.user.id) {
												CORE.renderHTML(REQUEST, "./html/home.html", function (html) {
													RESPONSE.end(html)
												})
												return
											}

										// authenticated
											CORE.renderHTML(REQUEST, "./html/game.html", function (html) {
												RESPONSE.end(html)
											})
									}
									catch (error) {_404(REQUEST, RESPONSE, error)}
								break

							// data
								case (/^\/data$/).test(REQUEST.url):
									try {
										if (!ENVIRONMENT.debug) {
											_404(REQUEST, RESPONSE)
											return
										}

										CORE.accessDatabase(null, function(data) {
											REQUEST.method = "POST"
											RESPONSE.writeHead(200, CORE.constructHeaders(REQUEST))
											RESPONSE.end(JSON.stringify(data, null, 2))
										})
									}
									catch (error) {_404(REQUEST, RESPONSE, error)}
								break

							// other
								default:
									_404(REQUEST, RESPONSE, REQUEST.url)
									return
								break
						}
					}

				// post
					else if (REQUEST.method == "POST" && REQUEST.post.action) {
						switch (REQUEST.post.action) {
							// session
								// signIn
									case "signIn":
										try {
											RESPONSE.writeHead(200, CORE.constructHeaders(REQUEST))
											HOME.signIn(REQUEST, function (data) {
												RESPONSE.end(JSON.stringify(data))
											})
										}
										catch (error) {_403(REQUEST, RESPONSE, error)}
									break

								// signOut
									case "signOut":
										try {
											RESPONSE.writeHead(200, CORE.constructHeaders(REQUEST))
											HOME.signOut(REQUEST, function (data) {
												RESPONSE.end(JSON.stringify(data))
											})
										}
										catch (error) {_403(REQUEST, RESPONSE, error)}
									break

							// user
								// create
									case "signUp":
										try {
											RESPONSE.writeHead(200, CORE.constructHeaders(REQUEST))
											USER.createOne(REQUEST, function (data) {
												RESPONSE.end(JSON.stringify(data))
											})
										}
										catch (error) {_403(REQUEST, RESPONSE, error)}
									break

							// character
								// uploadCharacterImage
									case "uploadCharacterImage":
										try {
											RESPONSE.writeHead(200, CORE.constructHeaders(REQUEST))
											REQUEST.post.action = "updateCharacterImage"
											CHARACTER.updateOne(REQUEST, function (data) {
												sendSocketData(data)
												RESPONSE.end(JSON.stringify({success: true, message: "image uploaded"}))
											})
										}
										catch (error) {_403(REQUEST, RESPONSE, error)}
									break

							// content
								// uploadContent
									case "uploadContentFile":
										try {
											RESPONSE.writeHead(200, CORE.constructHeaders(REQUEST))
											REQUEST.post.action = "updateContentFile"
											CONTENT.updateOne(REQUEST, function (data) {
												sendSocketData(data)
												RESPONSE.end(JSON.stringify({success: true, message: "content uploaded"}))
											})
										}
										catch (error) {_403(REQUEST, RESPONSE, error)}
									break

							// others
								default:
									_403(REQUEST, RESPONSE)
								break
						}
					}

				// others
					else {_403(REQUEST, RESPONSE, "unknown route")}
			}
			catch (error) {_403(REQUEST, RESPONSE, "unable to " + arguments.callee.name)}
		}

	/* _302 */
		function _302(REQUEST, RESPONSE, data) {
			CORE.logStatus("redirecting to " + (data || "/"))
			RESPONSE.writeHead(302, {Location: data || "../../../../"})
			RESPONSE.end()
		}

	/* _403 */
		function _403(REQUEST, RESPONSE, data) {
			CORE.logError(data)
			REQUEST.contentType = "application/json"
			RESPONSE.writeHead(403, CORE.constructHeaders(REQUEST))
			RESPONSE.end( JSON.stringify({success: false, error: data}) )
		}

	/* _404 */
		function _404(REQUEST, RESPONSE, data) {
			CORE.logError(data)
			REQUEST.contentType = "text/html"
			RESPONSE.writeHead(404, CORE.constructHeaders(REQUEST))
			CORE.renderHTML(REQUEST, "./html/_404.html", function (html) {
				RESPONSE.end(html)
			})
		}

/*** socket ***/
	/* socket */
		ENVIRONMENT.ws_config.httpServer = SERVER
		var SOCKET = new WS(ENVIRONMENT.ws_config)
			SOCKET.on("request", handleSocket)
		var CONNECTIONS = {}

	/* handleSocket */
		function handleSocket(REQUEST) {
			try {
				// reject
					if ((REQUEST.origin.replace("https://","").replace("http://","") !== ENVIRONMENT.domain)
					 && (REQUEST.origin !== "http://" + ENVIRONMENT.domain + ":" + ENVIRONMENT.port)) {
						CORE.logStatus("[REJECTED]: " + REQUEST.origin + " @ " + (REQUEST.socket._peername.address || "?"))
						REQUEST.reject()
						return
					}
				
				// create connection
					if (!REQUEST.connection) {
						REQUEST.connection = REQUEST.accept(null, REQUEST.origin)
					}
				
				// parse connection
					parseSocket(REQUEST)
			}
			catch (error) {
				CORE.logError(error)
				return
			}
		}

	/* parseSocket */
		function parseSocket(REQUEST) {
			try {
				// get request info
					REQUEST.url     = (REQUEST.httpRequest.headers.host || "") + (REQUEST.httpRequest.url || "")
					REQUEST.path    =  REQUEST.httpRequest.url.split("?")[0].split("/") || []
					REQUEST.cookie  =  REQUEST.httpRequest.headers.cookie ? QS.parse(REQUEST.httpRequest.headers.cookie.replace(/; /g, "&")) : {}
					REQUEST.headers = {}
					REQUEST.headers["user-agent"] = REQUEST.httpRequest.headers["user-agent"]
					REQUEST.headers["accept-language"] = REQUEST.httpRequest.headers["accept-language"]
					REQUEST.ip      =  REQUEST.connection.remoteAddress || REQUEST.socket._peername.address

				// log it
					CORE.logStatus((REQUEST.cookie.session || "new") + " @ " + REQUEST.ip + "\n[WEBSOCKET] " + REQUEST.path.join("/"))

				// get session and wait for messages
					SESSION.readOne(REQUEST, null, saveSocket)
			}
			catch (error) {_400(REQUEST, "unable to " + arguments.callee.name)}
		}

	/* saveSocket */
		function saveSocket(REQUEST) {
			try {
				// authenticated?
					if (!REQUEST.user || !REQUEST.user.id) {
						REQUEST.connection.close()
						return
					}

				// on connect - save connection & fetch game / character / content
					CONNECTIONS[REQUEST.user.id] = REQUEST.connection
					sendSocketData({success: true, message: "connected", recipients: [REQUEST.user.id]})

					// in a game?
						if (REQUEST.user.gameId) {
							// get all other data before character / content
								var properties = {
									user: false,
									game: false,
									characterList: false,
									contentList: false,
									character: false,
									content: false
								}

							// get game
								REQUEST.post = {game: {id: REQUEST.user.gameId}}
								GAME.readOne(REQUEST, function(data) {
									// update properties
										for (var i in properties) {
											if (data[i] != undefined) {
												properties[i] = true
											}
										}

									// send data
										sendSocketData(data)

									// load character, if applicable
										if (REQUEST.user.characterId && properties.user && properties.game && properties.characterList && !properties.character) {
											properties.character = true
											REQUEST.post = {character: {id: REQUEST.user.characterId, gameId: REQUEST.user.gameId}}
											CHARACTER.readOne(REQUEST, sendSocketData)
										}

									// load content, if applicable
										if (REQUEST.user.contentId && properties.user && properties.game && properties.contentList && !properties.content) {
											properties.content = true
											REQUEST.post = {content: {id: REQUEST.user.contentId, gameId: REQUEST.user.gameId}}
											CONTENT.readOne(REQUEST, sendSocketData)
										}
								})
						}

				// on close
					REQUEST.connection.on("close", function (reasonCode, description) {
						delete CONNECTIONS[REQUEST.user.id]

						// remove from game
							if (REQUEST.user.gameId) {
								REQUEST.post = {stay: true, game: {id: REQUEST.user.gameId}}
								GAME.unreadOne(REQUEST, sendSocketData)
								return
							}
					})

				// on message
					REQUEST.connection.on("message", function (message) {
						try {
							// get post data
								data = JSON.parse(message.utf8Data) || null

							// invalid data?
								if (!data || typeof data !== "object") {
									return
								}

							// route
								REQUEST.post = data
								routeSocket(REQUEST)
						}
						catch (error) {
							CORE.logError(error)
						}
					})
			}
			catch (error) {_400(REQUEST, "unable to " + arguments.callee.name)}
		}

	/* routeSocket */
		function routeSocket(REQUEST) {
			try {
				switch (REQUEST.post.action) {
					// user
						// update
							case "updateUserName":
							case "updateUserPassword":
							case "updateUserSettings":
								try {
									USER.updateOne(REQUEST, sendSocketData)
								}
								catch (error) {_400(REQUEST, "unable to " + REQUEST.post.action)}
							break

					// game
						// create
							case "createGame":
								try {
									GAME.createOne(REQUEST, sendSocketData)
								}
								catch (error) {_400(REQUEST, "unable to " + REQUEST.post.action)}
							break

						// read
							case "readGame":
								try {
									GAME.readOne(REQUEST, sendSocketData)
								}
								catch (error) {_400(REQUEST, "unable to " + REQUEST.post.action)}
							break
							case "unreadGame":
								try {
									GAME.unreadOne(REQUEST, sendSocketData)
								}
								catch (error) {_400(REQUEST, "unable to " + REQUEST.post.action)}
							break

						// update
							case "updateGameName":
							case "updateGameBanUser":
							case "clearGameChat":
							case "clearGameRolls":
								try {
									GAME.updateOne(REQUEST, sendSocketData)
								}
								catch (error) {_400(REQUEST, "unable to " + REQUEST.post.action)}
							break

						// delete
							case "deleteGame":
								try {
									GAME.deleteOne(REQUEST, sendSocketData)
								}
								catch (error) {_400(REQUEST, "unable to " + REQUEST.post.action)}
							break

					// character
						// create
							case "createCharacter":
								try {
									CHARACTER.createOne(REQUEST, sendSocketData)
								}
								catch (error) {_400(REQUEST, "unable to " + REQUEST.post.action)}
							break

						// read
							case "readCharacter":
								try {
									CHARACTER.readOne(REQUEST, sendSocketData)
								}
								catch (error) {_400(REQUEST, "unable to " + REQUEST.post.action)}
							break
							case "unreadCharacter":
								try {
									CHARACTER.unreadOne(REQUEST, sendSocketData)
								}
								catch (error) {_400(REQUEST, "unable to " + REQUEST.post.action)}
							break

						// update
							case "updateCharacterName":
							case "updateCharacterAccess":
							case "updateCharacterData":
								try {
									CHARACTER.updateOne(REQUEST, sendSocketData)
								}
								catch (error) {_400(REQUEST, "unable to " + REQUEST.post.action)}
							break

						// delete
							case "deleteCharacter":
								try {
									CHARACTER.deleteOne(REQUEST, sendSocketData)
								}
								catch (error) {_400(REQUEST, "unable to " + REQUEST.post.action)}
							break

					// chat
						// create
							case "createChat":
								try {
									CHAT.createOne(REQUEST, sendSocketData)
								}
								catch (error) {_400(REQUEST, "unable to " + REQUEST.post.action)}
							break

					// stream
						// create
							case "createTurnOrder":
							case "createRollGroup":
								try {
									ROLL.createOne(REQUEST, sendSocketData)
								}
								catch (error) {_400(REQUEST, "unable to " + REQUEST.post.action)}
							break

						// update
							case "updateRollGroup":
								try {
									ROLL.updateOne(REQUEST, sendSocketData)
								}
								catch (error) {_400(REQUEST, "unable to " + REQUEST.post.action)}
							break

					// content
						// create
							case "createContent":
								try {
									CONTENT.createOne(REQUEST, sendSocketData)
								}
								catch (error) {_400(REQUEST, "unable to " + REQUEST.post.action)}
							break

						// read
							case "readContent":
								try {
									CONTENT.readOne(REQUEST, sendSocketData)
								}
								catch (error) {_400(REQUEST, "unable to " + REQUEST.post.action)}
							break
							case "unreadContent":
								try {
									CONTENT.unreadOne(REQUEST, sendSocketData)
								}
								catch (error) {_400(REQUEST, "unable to " + REQUEST.post.action)}
							break

						// update
							case "updateContentName":
							case "updateContentAccess":
							case "updateContentData":
								try {
									CONTENT.updateOne(REQUEST, sendSocketData)
								}
								catch (error) {_400(REQUEST, "unable to " + REQUEST.post.action)}
							break

						// delete
							case "deleteContent":
								try {
									CONTENT.deleteOne(REQUEST, sendSocketData)
								}
								catch (error) {_400(REQUEST, "unable to " + REQUEST.post.action)}
							break

					// other
						default:
							return
						break
				}
			}
			catch (error) {_400(REQUEST, "unable to " + arguments.callee.name)}
		}

	/* sendSocketData */
		function sendSocketData(data) {
			try {
				// prevent sending to no one (such as telling an empty room that you're leaving)
					if (!data.recipients) {
						return
					}
					
				// get recipients
					var recipients = data.recipients.slice() || []
					delete data.recipients

				// stringify
					data = JSON.stringify(data)

				// loop through recipients
					for (var r in recipients) {
						if (!recipients[r]) {
							continue
						}
						try {
							var connection = CONNECTIONS[recipients[r]]
							if (connection) {
								connection.sendUTF(data)
							}
						}
						catch (error) {
							CORE.logError(error)
							return
						}
					}
			}
			catch (error) {
				CORE.logError(error)
				return
			}
		}

	/* _400 */
		function _400(REQUEST, data) {
			CORE.logError(data)
			REQUEST.connection.sendUTF(JSON.stringify({success: false, message: (data || "unknown websocket error")}))
		}
