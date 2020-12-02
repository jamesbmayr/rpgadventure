/*** modules ***/
	if (!HTTP)   { var HTTP   = require("http") }
	if (!FS)     { var FS     = require("fs") }
	if (!CRYPTO) { var CRYPTO = require("crypto") }
	if (!RULES)  { var RULES  = require("../node/rules") }
	module.exports = {}

/*** environment ***/
	var ENVIRONMENT = getEnvironment()

	/* mongo db */
		if (ENVIRONMENT.db_url) {
			var MONGO = require("mongodb").MongoClient
		}

	/* amazon s3 */
		if (ENVIRONMENT.storage_key && ENVIRONMENT.storage_secret) {
			var AWS = require("aws-sdk")
				AWS.config.update({
					accessKeyId: ENVIRONMENT.storage_key,
					secretAccessKey: ENVIRONMENT.storage_secret
				})
		}

/*** logs ***/
	/* logError */
		module.exports.logError = logError
		function logError(error) {
			if (ENVIRONMENT.debug) {
				console.log("\n*** ERROR @ " + new Date().toLocaleString() + " ***")
				console.log(" - " + error)
				console.dir(arguments)
			}
		}

	/* logStatus */
		module.exports.logStatus = logStatus
		function logStatus(status) {
			if (ENVIRONMENT.debug) {
				console.log("\n--- STATUS @ " + new Date().toLocaleString() + " ---")
				console.log(" - " + status)

			}
		}

	/* logMessage */
		module.exports.logMessage = logMessage
		function logMessage(message) {
			if (ENVIRONMENT.debug) {
				console.log(" - " + new Date().toLocaleString() + ": " + message)
			}
		}

	/* logTime */
		module.exports.logTime = logTime
		function logTime(flag, callback) {
			if (ENVIRONMENT.debug) {
				var before = process.hrtime()
				callback()
				
				var after = process.hrtime(before)[1] / 1e6
				if (after > 5) {
					logMessage(flag + " " + after)
				}
			}
			else {
				callback()
			}
		}

/*** maps ***/
	/* getEnvironment */
		module.exports.getEnvironment = getEnvironment
		function getEnvironment() {
			try {
				if (process.env.DOMAIN !== undefined) {
					return {
						port:            process.env.PORT,
						domain:          process.env.DOMAIN,
						debug:           process.env.DEBUG || false,
						cache:           process.env.CACHE || false,
						db_username:     process.env.DB_USERNAME,
						db_password:     process.env.DB_PASSWORD,
						db_url:          process.env.DB_URL,
						db_name:         process.env.DB_NAME,
						db:              "mongodb+srv://" + process.env.DB_USERNAME + ":" + process.env.DB_PASSWORD + "@" + process.env.DB_URL,
						db_cache: {
							sessions: {},
							users: {},
							games: {},
							chats: {},
							rolls: {},
							characters: {},
							content: {}
						},
						storage_key:     process.env.STORAGE_KEY,
						storage_secret:  process.env.STORAGE_PASSWORD,
						storage_region:  process.env.STORAGE_REGION,
						storage_bucket:  process.env.STORAGE_BUCKET,
						ws_config: {
							autoAcceptConnections: false
						}
					}
				}
				else {
					return {
						port:            3000,
						domain:          "localhost",
						debug:           true,
						cache:           true,
						db_username:     null,
						db_password:     null,
						db_url:          null,
						db_name:         null,
						db_cache: {
							sessions: {},
							users: {},
							games: {},
							chats: {},
							rolls: {},
							characters: {},
							content: {}
						},
						storage_key:    false,
						storage_secret: false,
						storage_region: false,
						storage_bucket: "./assets/",
						ws_config: {
							autoAcceptConnections: false
						}
					}
				}
			}
			catch (error) {
				logError(error)
				return false
			}
		}

	/* getContentType */
		module.exports.getContentType = getContentType
		function getContentType(string) {
			try {
				var array = string.split(".")
				var extension = array[array.length - 1].toLowerCase()

				switch (extension) {
					// application
						case "json":
						case "pdf":
						case "rtf":
						case "xml":
						case "zip":
							return "application/" + extension
						break

					// font
						case "otf":
						case "ttf":
						case "woff":
						case "woff2":
							return "font/" + extension
						break

					// audio
						case "aac":
						case "midi":
						case "wav":
							return "audio/" + extension
						break
						case "mid":
							return "audio/midi"
						break
						case "mp3":
							return "audio/mpeg"
						break
						case "oga":
							return "audio/ogg"
						break
						case "weba":
							return "audio/webm"
						break

					// images
						case "iso":
						case "bmp":
						case "gif":
						case "jpeg":
						case "png":
						case "tiff":
						case "webp":
							return "image/" + extension
						break
						case "jpg":
							return "image/jpeg"
						break
						case "svg":
							return "image/svg+xml"
						break
						case "tif":
							return "image/tiff"
						break

					// video
						case "mpeg":
						case "webm":
							return "video/" + extension
						break
						case "ogv":
							return "video/ogg"
						break

					// text
						case "css":
						case "csv":
						case "html":
							return "text/" + extension
						break

						case "md":
							return "text/html"
						break

						case "js":
							return "text/javascript"
						break

						case "txt":
						default:
							return "text/plain"
						break
				}
			}
			catch (error) {logError(error)}
		}

	/* getSchema */
		module.exports.getSchema = getSchema
		function getSchema(index) {
			try {
				switch (index) {
					// core
						case "query":
							return {
								collection: null,
								command: null,
								filters: null,
								document: null,
								options: {}
							}
						break

						case "session":
							return {
								id: generateRandom(),
								updated: new Date().getTime(),
								userId: null,
								info: {
									"ip":         null,
						 			"user-agent": null,
						 			"language":   null
								}
							}
						break

					// large structures
						case "user":
							return {
								id: generateRandom(),
								name: null,
								secret: {
									password: null,
									salt: null
								},
								settings: {
									color: getAsset("colors")["medium-gray"],
									volume: 1
								},
								gameId: null,
								characterId: null,
								contentId: null,
								games: {}
							}
						break

						case "game":
							return {
								id: generateRandom(),
								name: generateRandom(),
								userId: null,
								users: {},
								allUsers: {},
								bannedUsers: {},
							}
						break

					// in-game
						case "chat":
							return {
								id: generateRandom(),
								time: new Date().getTime(),
								userId: null,
								gameId: null,
								recipientId: null,
								display: {
									sender: null,
									recipient: null,
									time: null,
									text: null
								}
							}
						break

						case "rollGroup":
							return {
								id: generateRandom(),
								time: new Date().getTime(),
								userId: null,
								gameId: null,
								contentId: null,
								characterId: null,
								rolls: [],
								options: {}
							}
						break

						case "roll":
							return {
								id: generateRandom(),
								display: {
									spacer: false,
									d: 0,
									success: null,
									total: 0,
									dice: [],
									type: null,
									text: null,
									recipient: null
								}
							}
						break

						case "dice":
							return {
								number: 0,
								counting: true
							}
						break

						case "character":
							var character = getAsset("character")
								character.id = generateRandom()
								character.gameId = null
								character.userId = null
								character.gameUserId = null
								character.access = null
								character.image = null
								character.file = null
								character.arenaPresets = getSchema("arenaObject")
									delete character.arenaPresets.id
									delete character.arenaPresets.time
									delete character.arenaPresets.userId
									delete character.arenaPresets.characterId
									delete character.arenaPresets.contentId
									delete character.arenaPresets.locked
									delete character.arenaPresets.visible
									delete character.arenaPresets.x
									delete character.arenaPresets.y
									delete character.arenaPresets.z
									delete character.arenaPresets.width
									delete character.arenaPresets.height
							return character
						break

						case "content":
							return {
								id: generateRandom(),
								time: new Date().getTime(),
								gameId: null,
								userId: null,
								gameUserId: null,
								access: null,
								type: null,
								name: null,
								url: null,
								code: null,
								file: null,
								text: null,
								arena: null
							}
						break

						case "arena":
							return {
								signals: {},
								objects: {}
							}
						break

						case "arenaObject":
							var colors = getAsset("colors")
							return {
								id: generateRandom(),
								time: new Date().getTime(),
								userId: null,
								characterId: null,
								contentId: null,
								locked: false,
								visible: true,
								text: null,
								textColor: colors["light-gray"],
								textSize: 50,
								x: 0,
								y: 0,
								z: 0,
								width: 1,
								height: 1,
								corners: 0,
								rotation: 0,
								glow: 0.1,
								shadow: colors["medium-gray"],
								opacity: 1,
								color: colors["light-gray"],
								image: null
							}
						break

						case "arenaSignal":
							return {
								id: generateRandom(),
								x: null,
								y: null,
								expiration: new Date().getTime() + 1000
							}
						break

					// other
						default:
							return null
						break
				}
			}
			catch (error) {
				logError(error)
				return false
			}
		}

	/* getAsset */
		module.exports.getAsset = getAsset
		function getAsset(index) {
			try {
				switch (index) {
					// web
						case "logo":
							return `<link rel="shortcut icon" href="logo.png"/>`
						break
						case "meta":
							return `<meta charset="UTF-8"/>
									<meta name="description" content="Adventure is a fantasy tabletop RPG created by James Mayr"/>
									<meta name="author" content="James Mayr"/>
									<meta property="og:title" content="Adventure"/>
									<meta property="og:url" content="https://jamesmayr.com/adventure/"/>
									<meta property="og:description" content="Adventure is a fantasy tabletop RPG created by James Mayr"/>
									<meta property="og:image" content="https://jamesmayr.com/adventure/d20.png"/>
									<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0"/>`
						break
						case "fonts":
							return `<link href="https://fonts.googleapis.com/css?family=Questrial&display=swap" rel="stylesheet">`
						break
						case "css-variables":
							// output
								var output = ""

							// colors
								var colors = getAsset("colors")
								for (var i in colors) {
									output += ("--" + i + ": " + colors[i] + "; ")
								}

							// sizes
								var sizes = getAsset("sizes")
								for (var i in sizes) {
									output += ("--" + i + ": " + sizes[i] + "; ")
								}

							// fonts
								var fonts = getAsset("fonts")
									fonts = fonts.slice(fonts.indexOf("family=") + 7, fonts.indexOf("&display="))
									fonts = fonts.split("|")
								for (var i in fonts) {
									output += ("--font-" + i + ": '" + fonts[i].replace(/\+/i, " ") + "', sans-serif; ")
								}

							// return data
								return `<style>:root {` + 
									output +
									`}</style>`
						break

						case "rules-doc":
							return "https://docs.google.com/document/d/1RQF1dKAb19yVgWsmagPAzSqaGjjm2ZPHnCLDD-FyQXw/edit"
						break

						case "colors":
							return {
								"light-gray": "#dddddd",
								"medium-gray": "#555555",
								"dark-gray": "#111111",
								"light-red": "#ddaaaa",
								"medium-red": "#aa5555",
								"dark-red": "#551111",
								"light-yellow": "#ddddaa",
								"medium-yellow": "#aaaa55",
								"dark-yellow": "#555511",
								"light-green": "#aaddaa",
								"medium-green": "#55aa55",
								"dark-green": "#115511",
								"light-blue": "#aaaadd",
								"medium-blue": "#5555aa",
								"dark-blue": "#111155",
								"light-purple": "#ddaadd",
								"medium-purple": "#aa55aa",
								"dark-purple": "#551155",
							}
						break

						case "sizes":
							return {
								"shadow-size": "5px",
								"border-radius": "5px",
								"border-size": "2px",
								"small-gap-size": "5px",
								"medium-gap-size": "10px",
								"large-gap-size": "20px",
								"small-font-size": "15px",
								"medium-font-size": "20px",
								"large-font-size": "35px",
								"huge-font-size": "50px",
								"edge-size": "100px",
								"panel-size": "400px"
							}
						break

						case "constants":
							return {
								cookieLength: 1000 * 60 * 60 * 24 * 7,
								contentDuration: 1000 * 60 * 60 * 24 * 7
							}
						break

					// other
						default:
							return RULES.getRule(index)
						break
				}
			}
			catch (error) {
				logError(error)
				return false
			}
		}

/*** checks ***/
	/* isNumLet */
		module.exports.isNumLet = isNumLet
		function isNumLet(string) {
			try {
				return (/^[a-zA-Z0-9]+$/).test(string)
			}
			catch (error) {
				logError(error)
				return false
			}
		}

/*** tools ***/
	/* renderHTML */
		module.exports.renderHTML = renderHTML
		function renderHTML(REQUEST, path, callback) {
			try {
				var html = {}
				FS.readFile(path, "utf8", function (error, file) {
					if (error) {
						logError(error)
						callback("")
						return
					}
					
					html.original = file
					html.array = html.original.split(/<script\snode>|<\/script>node>/gi)

					for (html.count = 1; html.count < html.array.length; html.count += 2) {
						try {
							html.temp = eval(html.array[html.count])
						}
						catch (error) {
							html.temp = ""
							logError("<sn>" + Math.ceil(html.count / 2) + "</sn>\n" + error)
						}
						html.array[html.count] = html.temp
					}

					callback(html.array.join(""))
				})
			}
			catch (error) {
				logError(error)
				callback("")
			}
		}

	/* constructHeaders */
		module.exports.constructHeaders = constructHeaders
		function constructHeaders(REQUEST) {
			try {
				// asset
					if (REQUEST.method == "GET" && (REQUEST.fileType || !REQUEST.session)) {
						return  {
							"Content-Type": REQUEST.contentType
						}
					}

				// get
					if (REQUEST.method == "GET") {
						return  {
							"Set-Cookie": ("session=" + REQUEST.session.id + "; expires=" + (new Date(new Date().getTime() + ENVIRONMENT.cookieLength).toUTCString()) + "; path=/; domain=" + ENVIRONMENT.domain) + "; SameSite=Lax",
							"Content-Type": "text/html; charset=utf-8"
						}
					}

				// post
					else if (REQUEST.method == "POST") {
						return {
							"Content-Type": "application/json"
						}
					}
			}
			catch (error) {
				logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* duplicateObject */
		module.exports.duplicateObject = duplicateObject
		function duplicateObject(object) {
			try {
				return JSON.parse(JSON.stringify(object))
			}
			catch (error) {
				logError(error)
				return null
			}
		}

	/* alphabetizeArray */
		module.exports.alphabetizeArray = alphabetizeArray
		function alphabetizeArray(array, key) {
			try {
				if (!Array.isArray(array)) {
					return array
				}

				var alphabet = "0123456789abcdefghijklmnopqrstuvwxyz"
				return array.sort(function(a, b) {
					return alphabet.indexOf(a[key][0].toLowerCase()) - alphabet.indexOf(b[key][0].toLowerCase())
				}) || array
			}
			catch (error) {
				logError(error)
				return null
			}
		}

/*** randoms ***/
	/* hashRandom */
		module.exports.hashRandom = hashRandom
		function hashRandom(string, salt) {
			try {
				return CRYPTO.createHmac("sha512", salt).update(string).digest("hex")
			}
			catch (error) {
				logError(error)
				return null
			}
		}

	/* generateRandom */
		module.exports.generateRandom = generateRandom
		function generateRandom(set, length) {
			try {
				set = set || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
				length = length || 32
				
				var output = ""
				for (var i = 0; i < length; i++) {
					output += (set[Math.floor(Math.random() * set.length)])
				}

				return output
			}
			catch (error) {
				logError(error)
				return null
			}
		}

	/* chooseRandom */
		module.exports.chooseRandom = chooseRandom
		function chooseRandom(options) {
			try {
				if (!Array.isArray(options)) {
					return false
				}
				
				return options[Math.floor(Math.random() * options.length)]
			}
			catch (error) {
				logError(error)
				return false
			}
		}

	/* rollRandom */
		module.exports.rollRandom = rollRandom
		function rollRandom(d) {
			try {
				if (isNaN(d)) {
					return false
				}
				
				return Math.floor(Math.random() * d) + 1
			}
			catch (error) {
				logError(error)
				return false
			}
		}

/*** file storage ***/
	/* accessFiles */
		module.exports.accessFiles = accessFiles
		function accessFiles(data, callback) {
			try {
				// validate
					if (!data || !data.command) {
						callback({success: false, message: "no command specified"})
						return
					}
					if (!data.path) {
						callback({success: false, message: "no path specified"})
						return
					}
					if (data.command == "write" && !data.content) {
						callback({success: false, message: "no content specified"})
						return
					}

				// go to S3
					if (ENVIRONMENT.storage_key && ENVIRONMENT.storage_secret) {
						accessS3(data, callback)
						return
					}

				// write
					if (data.command == "write") {
						data.path = ENVIRONMENT.storage_bucket + data.path
						FS.writeFile(data.path, data.content, data.encoding || "binary", function (error) {
							if (error) {
								callback({success: false, message: error})
								return
							}

							callback({success: true, message: "file saved", path: data.path})
							return
						})
						return
					}

				// delete
					if (data.command == "delete") {
						data.path = ENVIRONMENT.storage_bucket + data.path
						FS.unlink(data.path, function (error) {
							if (error) {
								callback({success: false, message: error})
								return
							}

							callback({success: true, message: "file deleted", path: data.path})
						})
						return
					}

				// all others
					callback({success: false, message: "invalid command", path: null})
					return
			}
			catch (error) {
				logError(error)
				return null
			}
		}

	/* accessS3 */
		module.exports.accessS3 = accessS3
		function accessS3(data, callback) {
			try {
				// write
					if (data.command == "write") {
						// get s3
							var s3 = new AWS.S3()
							var base64data = Buffer.from(data.content, "binary")
							var options = {
								Bucket: ENVIRONMENT.storage_bucket,
								Body: base64data,
								Key: data.path,
								ContentEncoding: data.encoding || "binary",
								ContentType: data.contentType || "text/plain",
								ACL: "public-read"
							}

						// upload
							s3.upload(options, function(error, results) {
								if (error) {
									callback(error)
									return
								}

								callback({success: true, message: "file uploaded", path: results.Location})
								return
							})

						return
					}

				// delete
					if (data.command == "delete") {
						// get s3
							var url = "https://" + ENVIRONMENT.storage_bucket + ".s3.amazonaws.com/"
							var url2 = "https://" + ENVIRONMENT.storage_bucket + ".s3." + ENVIRONMENT.storage_region + ".amazonaws.com/"
							var s3 = new AWS.S3()
							var options = {
								Bucket: ENVIRONMENT.storage_bucket,
								Key: data.path.replace(url, "").replace(url2, "")
							}

						// delete
							s3.deleteObject(options, function(error, results) {
								if (error) {
									callback(error)
									return
								}

								callback({success: true, message: "file deleted", path: results.Location || data.path})
								return
							})

						return
					}

				// all others
					callback({success: false, message: "invalid command", path: null})
					return
			}
			catch (error) {
				logError(error)
				return null
			}
		}

/*** database ***/
	/* accessDatabase */
		module.exports.accessDatabase = accessDatabase
		function accessDatabase(query, callback) {
			try {
				// no query?
					if (!query) {
						if (typeof ENVIRONMENT.db_cache !== "object") {
							callback({success: false, message: "invalid database"})
							return
						}
						callback(ENVIRONMENT.db_cache)
						return
					}

				// log
					logMessage("db: " + query.command + " " + query.collection)

				// go to Mongo
					if (ENVIRONMENT.db_url) {
						accessMongo(query, callback)
						return
					}

				// fake database?
					if (!ENVIRONMENT.db_cache) {
						logError("database not found")
						callback({success: false, message: "database not found"})
						return
					}

				// collection
					if (!ENVIRONMENT.db_cache[query.collection]) {
						logError("collection not found")
						callback({success: false, message: "collection not found"})
						return
					}

				// find
					if (query.command == "find") {
						// all documents
							var documentKeys = Object.keys(ENVIRONMENT.db_cache[query.collection])

						// apply filters
							var filters = Object.keys(query.filters)
							for (var f in filters) {
								var property = filters[f]
								var filter = query.filters[property]

								if (filter instanceof RegExp) {
									documentKeys = documentKeys.filter(function(key) {
										return filter.test(ENVIRONMENT.db_cache[query.collection][key][property])
									})
								}
								else {
									documentKeys = documentKeys.filter(function(key) {
										return filter == ENVIRONMENT.db_cache[query.collection][key][property]
									})
								}
							}

						// get documents
							var documents = []
							for (var d in documentKeys) {
								documents.push(duplicateObject(ENVIRONMENT.db_cache[query.collection][documentKeys[d]]))
							}

						// no documents
							if (!documents.length) {
								callback({success: false, count: 0, documents: []})
								return
							}

						// yes documents
							callback({success: true, count: documentKeys.length, documents: documents})
							return
					}

				// insert
					if (query.command == "insert") {
						// unique id
							do {
								var id = generateRandom()
							}
							while (ENVIRONMENT.db_cache[query.collection][id])

						// insert document
							ENVIRONMENT.db_cache[query.collection][id] = duplicateObject(query.document)

						// return document
							callback({success: true, count: 1, documents: [query.document]})
							return
					}

				// update
					if (query.command == "update") {
						// all documents
							var documentKeys = Object.keys(ENVIRONMENT.db_cache[query.collection])

						// apply filters
							var filters = Object.keys(query.filters)
							for (var f in filters) {
								documentKeys = documentKeys.filter(function(key) {
									return ENVIRONMENT.db_cache[query.collection][key][filters[f]] == query.filters[filters[f]]
								})
							}

						// update keys
							var updateKeys = Object.keys(query.document)

						// update
							for (var d in documentKeys) {
								var document = ENVIRONMENT.db_cache[query.collection][documentKeys[d]]

								for (var u in updateKeys) {
									document[updateKeys[u]] = query.document[updateKeys[u]]
								}
							}

						// update documents
							var documents = []
							for (var d in documentKeys) {
								documents.push(duplicateObject(ENVIRONMENT.db_cache[query.collection][documentKeys[d]]))
							}

						// no documents
							if (!documents.length) {
								callback({success: false, count: 0, documents: []})
								return
							}

						// yes documents
							callback({success: true, count: documentKeys.length, documents: documents})
							return
					}

				// delete
					if (query.command == "delete") {
						// all documents
							var documentKeys = Object.keys(ENVIRONMENT.db_cache[query.collection])

						// apply filters
							var filters = Object.keys(query.filters)
							for (var f in filters) {
								documentKeys = documentKeys.filter(function(key) {
									return ENVIRONMENT.db_cache[query.collection][key][filters[f]] == query.filters[filters[f]]
								})
							}

						// delete
							for (var d in documentKeys) {
								delete ENVIRONMENT.db_cache[query.collection][documentKeys[d]]
							}

						// no documents any more
							callback({success: true, count: documentKeys.length})
							return
					}
			}
			catch (error) {
				logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* accessMongo */
		module.exports.accessMongo = accessMongo
		function accessMongo(query, callback) {
			try {
				// find
					if (query.command == "find") {
						// find in cache
							if (ENVIRONMENT.cache) {
								// all documents
									var documentKeys = Object.keys(ENVIRONMENT.db_cache[query.collection])

								// apply filters
									var filters = Object.keys(query.filters)
									for (var f in filters) {
										var property = filters[f]
										var filter = query.filters[property]

										if (filter instanceof RegExp) {
											documentKeys = documentKeys.filter(function(key) {
												return filter.test(ENVIRONMENT.db_cache[query.collection][key][property])
											})
										}
										else {
											documentKeys = documentKeys.filter(function(key) {
												return filter == ENVIRONMENT.db_cache[query.collection][key][property]
											})
										}
									}

								// get documents
									var documents = []
									for (var d in documentKeys) {
										documents.push(duplicateObject(ENVIRONMENT.db_cache[query.collection][documentKeys[d]]))
									}

								// documents in cache
									if (documents && documents.length) {
										callback({success: true, count: documentKeys.length, documents: documents})
										return
									}
							}

						// connect
							logMessage("db: connecting")
							MONGO.connect(ENVIRONMENT.db, { useNewUrlParser: true, useUnifiedTopology: true }, function(error, client) {
								// connect
									if (error) {
										logError(error)
										callback({success: false, message: error})
										try { client.close() } catch (error) {}
										return
									}

									var db = client.db(ENVIRONMENT.db_name)

								// execute query
									db.collection(query.collection).find(query.filters).toArray(function (error, documents) {
										// error
											if (error) {
												callback({success: false, message: JSON.stringify(error)})
												client.close()
												return
											}

										// no documents
											if (!documents.length) {
												callback({success: false, count: 0, documents: []})
												client.close()
												return
											}

										// yes documents
											// update cache
												if (ENVIRONMENT.cache) {
													for (var i in documents) {
														ENVIRONMENT.db_cache[query.collection][documents[i]._id] = duplicateObject(documents[i])
													}
												}

											// return documents
												callback({success: true, count: documents.length, documents: documents})
												client.close()
												return
									})
							})
					}

				// insert
					if (query.command == "insert") {
						// prevent duplicate _id
							if (query.document._id) {
								delete query.document._id
							}

						// connect
							logMessage("db: connecting")
							MONGO.connect(ENVIRONMENT.db, { useNewUrlParser: true, useUnifiedTopology: true }, function(error, client) {
								// connect
									if (error) {
										logError(error)
										callback({success: false, message: error})
										try { client.close() } catch (error) {}
										return
									}

									var db = client.db(ENVIRONMENT.db_name)

								// execute query
									db.collection(query.collection).insertOne(query.document, function (error, results) {
										// error
											if (error) {
												callback({success: false, message: JSON.stringify(error)})
												client.close()
												return
											}

										// success
											// update cache
												if (ENVIRONMENT.cache) {
													ENVIRONMENT.db_cache[query.collection][results.insertedId] = duplicateObject(query.document)
												}

											// return documents
												callback({success: true, count: results.nInserted, documents: [query.document]})
												client.close()
												return
									})
							})
					}

				// update
					if (query.command == "update") {
						// prevent updating _id
							if (query.document._id) {
								delete query.document._id
							}

						// connect
							logMessage("db: connecting")
							MONGO.connect(ENVIRONMENT.db, { useNewUrlParser: true, useUnifiedTopology: true }, function(error, client) {
								// connect
									if (error) {
										logError(error)
										callback({success: false, message: error})
										try { client.close() } catch (error) {}
										return
									}

									var db = client.db(ENVIRONMENT.db_name)

								// execute query
									db.collection(query.collection).updateOne(query.filters, {$set: query.document}, function(error, results) {
										// error
											if (error) {
												callback({success: false, message: JSON.stringify(error)})
												client.close()
												return
											}

										// find
											db.collection(query.collection).find(query.filters).toArray(function (error, documents) {
												// error
													if (error) {
														callback({success: false, message: JSON.stringify(error)})
														client.close()
														return
													}

												// no documents
													if (!documents.length) {
														callback({success: false, count: 0, documents: []})
														client.close()
														return
													}

												// yes documents
													// update cache
														if (ENVIRONMENT.cache) {
															for (var i in documents) {
																ENVIRONMENT.db_cache[query.collection][documents[i]._id] = duplicateObject(documents[i])
															}
														}

													// return documents
														callback({success: true, count: documents.length, documents: documents})
														client.close()
														return
											})
									})
							})
					}

				// delete
					if (query.command == "delete") {
						// connect
							logMessage("db: connecting")
							MONGO.connect(ENVIRONMENT.db, { useNewUrlParser: true, useUnifiedTopology: true }, function(error, client) {
								// connect
									if (error) {
										logError(error)
										callback({success: false, message: error})
										try { client.close() } catch (error) {}
										return
									}

									var db = client.db(ENVIRONMENT.db_name)

								// get _ids
									db.collection(query.collection).find(query.filters).toArray(function (error, documents) {
										// error
											if (error) {
												callback({success: false, message: JSON.stringify(error)})
												client.close()
												return
											}

										// no documents
											if (!documents.length) {
												callback({success: true, count: 0})
												client.close()
												return
											}

										// yes documents --> store _ids
											var _ids = []
											for (var i in documents) {
												_ids.push(documents[i]._id)
											}
										
										// delete
											db.collection(query.collection).deleteMany(query.filters, function(error, results) {
												// error
													if (error) {
														callback({success: false, message: JSON.stringify(error)})
														client.close()
														return
													}

												// no documents any more
													// update cache
														if (ENVIRONMENT.cache) {
															for (var i in _ids) {
																delete ENVIRONMENT.db_cache[query.collection][_ids[i]]
															}
														}

													// return documents
														callback({success: true, count: results.deletedCount})
														client.close()
														return
											})
									})
							})
					}
			}
			catch (error) {
				logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}
