window.onload = function() {
	/*** onload ***/
		/* libraries */
			var TRIGGERS = window.TRIGGERS
			var FUNCTIONS = window.FUNCTIONS
			var ELEMENTS = window.ELEMENTS = {}
			var RULES = window.RULES || {}
			var USER = window.USER || null
			var GAME = window.GAME || null
			var CHARACTER = window.CHARACTER || null
			var CONTENT = window.CONTENT || null
			var SOCKET = window.SOCKET = null
			var SOCKETCHECK = null

		/* initiateApp */
			initiateApp()
			function initiateApp() {
				try {
					// elements
						findElements()

					// games
						displayGameList()

					// character lists
						displayCharacterListTemplates()
						displayCharacterListRaces()
						displayCharacterListSkills()
						displayCharacterListConditions()
						displayCharacterListItems()

					// listeners
						attachListeners()

					// user
						if (window.USER) {
							receiveUser(USER)
						}

					// connect
						createSocket()
						checkSocket()
				} catch (error) {console.log(error)}
			}

		/* findElements */
			function findElements() {
				try {
					// top-level
						ELEMENTS.body = document.body
						ELEMENTS.structure = {
							top: document.getElementById("top"),
							left: document.getElementById("left"),
							right: document.getElementById("right")
						}

					// special
						ELEMENTS.stream = {
							history: document.getElementById("stream-history")
						}
						ELEMENTS.tools = {
							element: document.getElementById("tools"),
							settings: document.getElementById("tools-settings"),
							rules: document.getElementById("tools-rules"),
							character: document.getElementById("tools-character"),
							chat: document.getElementById("tools-chat"),
							content: document.getElementById("tools-content"),
							notification: document.getElementById("tools-chat-notification")
						}
						ELEMENTS.gametable = {
							element: document.getElementById("gametable"),
							grabbed: null,
							canvas: {
								element: null,
								context: null,
								offsetX: 0,
								offsetY: 0,
								zoomPower: 0,
								panLoops: {},
								cellSize: 50,
								gridColor: "#dddddd",
								gridBackground: "#555555",
								images: {}
							}
						}

					// settings
						ELEMENTS.settings = {
							element: document.getElementById("settings"),
							game: {
								element: document.getElementById("settings-game"),
								form: document.getElementById("settings-game-form"),
								select: {
									element: document.getElementById("settings-game-select"),
									custom: document.getElementById("settings-game-select-custom"),
									none: document.getElementById("settings-game-select-none"),
									new: document.getElementById("settings-game-select-new"),
									search: document.getElementById("settings-game-select-search")
								},
								input: document.getElementById("settings-game-input"),
								clearChat: {
									form: document.getElementById("settings-game-clearChat-form"),
									button: document.getElementById("settings-game-clearChat-button"),
								},
								clearRolls: {
									form: document.getElementById("settings-game-clearRolls-form"),
									button: document.getElementById("settings-game-clearRolls-button"),
								},
								delete: {
									gate: document.getElementById("settings-game-delete-gate"),
									form: document.getElementById("settings-game-delete-form"),
									button: document.getElementById("settings-game-delete-button")
								}
							},
							audio: {
								volume: document.getElementById("settings-audio-volume")
							},
							user: {
								element: document.getElementById("settings-user"),
								name: {
									form: document.getElementById("settings-user-name-form"),
									input: document.getElementById("settings-user-name-input")
								},
								password: {
									form: document.getElementById("settings-user-password-form"),
									old: document.getElementById("settings-user-password-input-old"),
									new: document.getElementById("settings-user-password-input-new")
								}
							},
							auth: {
								signout: {
									form: document.getElementById("settings-auth-signout-form")
								}
							}
						}

					// rules
						ELEMENTS.rules = {
							element: document.getElementById("rules"),
							search: {
								form: document.getElementById("rules-search-form"),
								input: document.getElementById("rules-search-input"),
								button: document.getElementById("rules-search-button"),
							},
							results: document.getElementById("rules-results"),
							link: document.getElementById("rules-link")
						}

					// character
						ELEMENTS.character = {
							element: document.getElementById("character"),
							content: document.getElementById("character-content"),
							modes: {
								settings: document.getElementById("character-modes-settings"),
								play: document.getElementById("character-modes-play"),
								edit: document.getElementById("character-modes-edit"),
								items: document.getElementById("character-modes-items"),
								conditions: document.getElementById("character-modes-conditions"),
								damage: document.getElementById("character-modes-damage")
							},
							settings: {
								element: document.getElementById("character-settings"),
								select: {
									form: document.getElementById("character-settings-form"),
									element: document.getElementById("character-settings-select"),
									custom: document.getElementById("character-settings-select-custom"),
									upload: document.getElementById("character-settings-select-upload"),
									none: document.getElementById("character-settings-select-none"),
									new: document.getElementById("character-settings-select-new"),
									templates: document.getElementById("character-settings-select-templates"),
									blank: document.getElementById("character-settings-select-blank")
								},
								upload: document.getElementById("character-settings-upload"),
								metadata: document.getElementById("character-settings-metadata"),
								access: {
									form: document.getElementById("character-settings-access-form"),
									select: {
										element: document.getElementById("character-settings-access-select"),
										all: document.getElementById("character-settings-access-select-all"),
										me: document.getElementById("character-settings-access-select-me")
									}
								},
								download: {
									form: document.getElementById("character-settings-download-form")
								},
								duplicate: {
									form: document.getElementById("character-settings-duplicate-form"),
									button: document.getElementById("character-settings-duplicate-button")
								},
								delete: {
									gate: document.getElementById("character-settings-delete-gate"),
									form: document.getElementById("character-settings-delete-form")
								},
								rng: {
									form: document.getElementById("character-settings-rng-form"),
									count: document.getElementById("character-settings-rng-count"),
									d: document.getElementById("character-settings-rng-d"),
									label: document.getElementById("character-settings-rng-label"),
									button: document.getElementById("character-settings-rng-button")
								},
								recipient: {
									form: document.getElementById("character-settings-recipient-form"),
									select: document.getElementById("character-settings-recipient-select"),
									none: document.getElementById("character-settings-recipient-none"),
									environment: document.getElementById("character-settings-recipient-environment"),
									characters: document.getElementById("character-settings-recipient-characters"),
									arena: document.getElementById("character-settings-recipient-arena")
								}
							},
							info: {
								element: document.getElementById("character-info"),
								name: document.getElementById("character-info-name"),
								nameText: document.getElementById("character-info-name-text"),
								image: document.getElementById("character-info-image"),
								imageReset: document.getElementById("character-info-image-reset"),
								imageForm: document.getElementById("character-info-image-form"),
								imageUpload: document.getElementById("character-info-image-upload"),
								burden: document.getElementById("character-info-burden"),
								points: document.getElementById("character-info-points"),
								damage: document.getElementById("character-info-damage"),
								race: document.getElementById("character-info-race"),
								raceDisabled: document.getElementById("character-info-race-disabled"),
								raceAbility: document.getElementById("character-info-race-ability"),
								age: document.getElementById("character-info-age"),
								sex: document.getElementById("character-info-sex"),
								height: document.getElementById("character-info-height"),
								weight: document.getElementById("character-info-weight"),
								description: document.getElementById("character-info-description"),
								run: document.getElementById("character-info-run"),
								move: document.getElementById("character-info-move"),
								swim: document.getElementById("character-info-swim"),
								jump: document.getElementById("character-info-jump"),
								throw: document.getElementById("character-info-throw"),
								carry: document.getElementById("character-info-carry"),
								recover: document.getElementById("character-info-recover"),
							},
							statistics: {
								perception: document.getElementById("character-perception"),
								memory: document.getElementById("character-memory"),
								logic: document.getElementById("character-logic"),
								strength: document.getElementById("character-strength"),
								dexterity: document.getElementById("character-dexterity"),
								immunity: document.getElementById("character-immunity"),
								speed: document.getElementById("character-speed")
							},
							items: {
								element: document.getElementById("character-items"),
								select: document.getElementById("character-items-select"),
								disabled: document.getElementById("character-items-disabled"),
								equipped: document.getElementById("character-items-equipped"),
								unequipped: document.getElementById("character-items-unequipped"),
							},
							conditions: {
								element: document.getElementById("character-conditions"),
								list: document.getElementById("character-conditions-list"),
								select: document.getElementById("character-conditions-select"),
								disabled: document.getElementById("character-conditions-disabled"),
							},
						}

					// chat
						ELEMENTS.chat = {
							element: document.getElementById("chat"),
							messages: document.getElementById("chat-messages"),
							send: {
								form: document.getElementById("chat-send-form"),
								sender: {
									select: document.getElementById("chat-send-sender"),
									anonymous: document.getElementById("chat-send-sender-anonymous"),
									user: document.getElementById("chat-send-sender-user"),
									character: document.getElementById("chat-send-sender-character")
								},
								recipients: {
									select: document.getElementById("chat-send-recipients"),
									all: document.getElementById("chat-send-recipients-all")
								},
								input: document.getElementById("chat-send-input"),
								button: document.getElementById("chat-send-button"),
							}
						}

					// content
						ELEMENTS.content = {
							element: document.getElementById("content"),
							send: document.getElementById("content-send"),
							choose: {
								form: document.getElementById("content-choose-form"),
								select: {
									element: document.getElementById("content-choose-select"),
									none: document.getElementById("content-choose-select-none"),
									new: document.getElementById("content-choose-select-new"),
									arena: document.getElementById("content-choose-select-arena"),
									text: document.getElementById("content-choose-select-text"),
									image: document.getElementById("content-choose-select-image"),
									audio: document.getElementById("content-choose-select-audio"),
									embed: document.getElementById("content-choose-select-embed"),
									component: document.getElementById("content-choose-select-component"),
								},
								types: {
									element: document.getElementById("content-choose-types"),
									arena: document.getElementById("content-choose-types-arena"),
									text: document.getElementById("content-choose-types-text"),
									image: document.getElementById("content-choose-types-image"),
									audio: document.getElementById("content-choose-types-audio"),
									embed: document.getElementById("content-choose-types-embed"),
									component: document.getElementById("content-choose-types-component")
								}
							},
							name: {
								form: document.getElementById("content-name-form"),
								input: document.getElementById("content-name-input")
							},
							access: {
								form: document.getElementById("content-access-form"),
								select: document.getElementById("content-access-select"),
								all: document.getElementById("content-access-select-all"),
								me: document.getElementById("content-access-select-me")
							},
							code: {
								form: document.getElementById("content-code-form"),
								input: document.getElementById("content-code-input"),
								button: document.getElementById("content-code-button")
							},
							url: {
								form: document.getElementById("content-url-form"),
								input: document.getElementById("content-url-input"),
								button: document.getElementById("content-url-button")
							},
							data: {
								form: document.getElementById("content-data-form"),
								button: document.getElementById("content-data-button")
							},
							upload: {
								form: document.getElementById("content-upload-form"),
								input: document.getElementById("content-upload-input"),
								button: document.getElementById("content-upload-button")
							},
							duplicate: {
								form: document.getElementById("content-duplicate-form"),
								button: document.getElementById("content-duplicate-button")
							},
							delete: {
								gate: document.getElementById("content-delete-gate"),
								form: document.getElementById("content-delete-form"),
								button: document.getElementById("content-delete-button")
							},
							controls: {
								zoom: {
									form: document.getElementById("content-controls-zoom-form"),
									out: document.getElementById("content-controls-zoom-out"),
									zero: document.getElementById("content-controls-zoom-zero"),
									in: document.getElementById("content-controls-zoom-in")
								},
								pan: {
									form: document.getElementById("content-controls-pan-form"),
									left: document.getElementById("content-controls-pan-left"),
									up: document.getElementById("content-controls-pan-up"),
									down: document.getElementById("content-controls-pan-down"),
									right: document.getElementById("content-controls-pan-right")
								},
								turn: {
									form: document.getElementById("content-controls-turn-form"),
									button: document.getElementById("content-controls-turn-button")
								}
							},
							objects: {
								form: document.getElementById("content-objects-form"),
								select: document.getElementById("content-objects-select"),
								blank: document.getElementById("content-objects-select-blank"),
								characters: document.getElementById("content-objects-select-characters"),
								images: document.getElementById("content-objects-select-images"),
								button: document.getElementById("content-objects-button"),
								list: document.getElementById("content-objects-list")
							}
						}
				} catch (error) {console.log(error)}
			}

		/* attachListeners */
			function attachListeners() {
				try {
					// tools
						ELEMENTS.tools.element.querySelectorAll(".tool").forEach(function(button) { button.addEventListener(TRIGGERS.click, displayTool) })

					// settings
						ELEMENTS.settings.game.select.element.addEventListener(TRIGGERS.change, displayGameListSelection)
						ELEMENTS.settings.game.form.addEventListener(TRIGGERS.submit, submitGameRead)
						ELEMENTS.settings.game.clearChat.form.addEventListener(TRIGGERS.submit, submitGameUpdateChatDelete)
						ELEMENTS.settings.game.clearRolls.form.addEventListener(TRIGGERS.submit, submitGameUpdateRollsDelete)
						ELEMENTS.settings.game.delete.form.addEventListener(TRIGGERS.submit, submitGameDelete)
						ELEMENTS.settings.audio.volume.addEventListener(TRIGGERS.change, submitUserUpdateVolume)
						ELEMENTS.settings.user.name.form.addEventListener(TRIGGERS.submit, submitUserUpdateName)
						ELEMENTS.settings.user.password.form.addEventListener(TRIGGERS.submit, submitUserUpdatePassword)
						ELEMENTS.settings.auth.signout.form.addEventListener(TRIGGERS.submit, submitUserUpdateSignout)

					// rules
						ELEMENTS.rules.search.form.addEventListener(TRIGGERS.submit, submitRulesSearch)

					// character
						ELEMENTS.character.element.querySelectorAll(".mode").forEach(function(button) { button.addEventListener(TRIGGERS.click, displayCharacterMode) })
						ELEMENTS.character.settings.select.element.addEventListener(TRIGGERS.change, displayCharacterListSelection)
						ELEMENTS.character.settings.select.form.addEventListener(TRIGGERS.submit, submitCharacterRead)
						ELEMENTS.character.settings.download.form.addEventListener(TRIGGERS.submit, displayCharacterDownload)
						ELEMENTS.character.settings.access.form.addEventListener(TRIGGERS.submit, submitCharacterUpdateAccess)
						ELEMENTS.character.settings.duplicate.form.addEventListener(TRIGGERS.submit, submitCharacterCreateDuplicate)
						ELEMENTS.character.settings.delete.form.addEventListener(TRIGGERS.submit, submitCharacterDelete)
						ELEMENTS.character.settings.rng.form.addEventListener(TRIGGERS.submit, submitRollGroupCreateCustom)
						ELEMENTS.character.content.querySelectorAll(".statistic-current").forEach(function(d20) { d20.addEventListener(TRIGGERS.click, submitRollGroupCreateD20) })
						ELEMENTS.character.info.imageForm.addEventListener(TRIGGERS.submit, submitCharacterUpdateImage)
						ELEMENTS.character.info.imageReset.addEventListener(TRIGGERS.click, submitCharacterUpdateImageDelete)
						ELEMENTS.character.info.element.querySelectorAll(".editable").forEach(function(element) { element.addEventListener(TRIGGERS.change, submitCharacterUpdateInfo) })
						ELEMENTS.character.content.querySelectorAll(".statistic-maximum").forEach(function(statistic) { statistic.addEventListener(TRIGGERS.change, submitCharacterUpdateStatistic) })
						ELEMENTS.character.content.querySelectorAll(".statistic select").forEach(function(select) { select.addEventListener(TRIGGERS.change, submitCharacterUpdateSkillCreate) })
						ELEMENTS.character.items.select.addEventListener(TRIGGERS.change, submitCharacterUpdateItemCreate)
						ELEMENTS.character.conditions.select.addEventListener(TRIGGERS.change, submitCharacterUpdateConditionCreate)
						ELEMENTS.character.info.damage.addEventListener(TRIGGERS.change, submitCharacterUpdateDamage)
						ELEMENTS.character.info.recover.addEventListener(TRIGGERS.click, submitRollGroupCreateRecover)
						ELEMENTS.character.content.querySelectorAll(".statistic-damage").forEach(function(element) { element.addEventListener(TRIGGERS.change, submitCharacterUpdateDamageStatistic) })

					// chat
						ELEMENTS.chat.send.form.addEventListener(TRIGGERS.submit, submitChatCreate)

					// content
						ELEMENTS.content.choose.select.element.addEventListener(TRIGGERS.change, displayContentListSelection)
						ELEMENTS.content.choose.form.addEventListener(TRIGGERS.submit, submitContentRead)
						ELEMENTS.content.send.addEventListener(TRIGGERS.click, submitChatCreateContent)
						ELEMENTS.content.name.form.addEventListener(TRIGGERS.submit, submitContentUpdateName)
						ELEMENTS.content.access.form.addEventListener(TRIGGERS.submit, submitContentUpdateAccess)
						ELEMENTS.content.code.form.addEventListener(TRIGGERS.submit, submitContentUpdateData)
						ELEMENTS.content.url.form.addEventListener(TRIGGERS.submit, submitContentUpdateData)
						ELEMENTS.content.data.form.addEventListener(TRIGGERS.submit, submitContentUpdateData)
						ELEMENTS.content.upload.form.addEventListener(TRIGGERS.submit, submitContentUpdateFile)
						ELEMENTS.content.duplicate.form.addEventListener(TRIGGERS.submit, submitContentCreateDuplicate)
						ELEMENTS.content.delete.form.addEventListener(TRIGGERS.submit, submitContentDelete)
						ELEMENTS.body.addEventListener(TRIGGERS.mousemove, moveContent)
						ELEMENTS.body.addEventListener(TRIGGERS.mouseup, ungrabContent)
						ELEMENTS.content.controls.zoom.form.addEventListener(TRIGGERS.submit, zoomContent)
						ELEMENTS.content.controls.turn.form.addEventListener(TRIGGERS.submit, submitContentArenaTurnOrder)
						ELEMENTS.content.objects.form.addEventListener(TRIGGERS.submit, submitContentArenaObjectCreate)
						window.addEventListener(TRIGGERS.resize, displayContentArena)
						ELEMENTS.content.controls.pan.form.addEventListener(TRIGGERS.submit, panContentArena)
				} catch (error) {console.log(error)}
			}

	/*** SOCKET ***/
		/* createSocket */
			function createSocket() {
				try {
					SOCKET = new WebSocket(location.href.replace("http","ws"))
					SOCKET.onopen = function() {
						SOCKET.send(null)
					}
					SOCKET.onerror = function(error) {
						FUNCTIONS.showToast({success: false, message: error})
					}
					SOCKET.onclose = function() {
						FUNCTIONS.showToast({success: false, message: "disconnected"})
						SOCKET = null
						checkSocket()
					}
					SOCKET.onmessage = function(message) {
						try {
							var post = JSON.parse(message.data)
							if (post && (typeof post == "object")) {
								receiveSocket(post)
							}
						}
						catch (error) {console.log(error)}
					}
				}
				catch (error) {console.log(error)}
			}

		/* checkSocket */
			function checkSocket() {
				SOCKETCHECK = setInterval(function() {
					try {
						if (!SOCKET) {
							try {
								createSocket()
							}
							catch (error) {console.log(error)}
						}
						else {
							clearInterval(SOCKETCHECK)
						}
					}
					catch (error) {console.log(error)}
				}, 5000)
			}

		/* receiveSocket */
			function receiveSocket(data) {
				try {
					// meta
						// failure
							if (!data || !data.success) {
								FUNCTIONS.showToast({success: false, message: data.message || "unknown websocket error"})
								return
							}

						// redirect
							if (data.location) {
								window.location = data.location
								return
							}

						// toast
							if (data.message) {
								FUNCTIONS.showToast(data)
							}

					// account
						// user
							if (data.user) {
								receiveUser(data.user)
							}

						// game
							if (data.game) {
								receiveGame(data.game)
							}

					// character
						// character
							if (data.character) {
								receiveCharacter(data.character, data.selectCharacter)
							}

						// characterList
							if (data.characterList) {
								displayCharacterList(data.characterList)
							}

					// content
						// content
							if (data.content) {
								receiveContent(data.content, data.selectContent)
							}

						// contentList
							if (data.contentList) {
								displayContentList(data.contentList)
							}

					// other
						// chat
							if (data.chat) {
								receiveChat(data.chat)
							}

						// roll
							if (data.roll) {
								receiveRollGroups(data.roll)
							}
				} catch (error) {console.log(error)}
			}

	/*** TOOLS ***/
		/** display **/
			/* displayTool */
				function displayTool(event) {
					try {
						// get tool
							var tool = event.target.id.replace("tools-", "")

						// check for game
							if ((tool == "character" || tool == "chat" || tool == "content") && !GAME) {
								FUNCTIONS.showToast({success: false, message: "no game selected"})
								return false
							}

						// switch
							ELEMENTS.structure.left.setAttribute("tool", tool)

						// chat notification
							if (tool == "chat") {
								ELEMENTS.tools.notification.setAttribute("visibility", false)
							}
					} catch (error) {console.log(error)}
				}

	/*** SETTINGS - GAME ***/
			/* receiveGame */
				function receiveGame(game) {
					try {
						// no GAME object
							if (!GAME) {
								GAME = {}
							}

						// loop through game properties
							for (var i in game) {
								GAME[i] = game[i]
							}

						// delete?
							if (GAME.delete) {
								GAME = {}
							}

						// relist content
							displayChatListRecipients()
							displayGameList()
					} catch (error) {console.log(error)}
				}

		/** display **/
			/* displayGameList */
				function displayGameList() {
					try {
						// close option?
							ELEMENTS.settings.game.select.none.disabled = (GAME && GAME.id) ? false : true

						// edit forms?
							ELEMENTS.settings.game.clearChat.form.setAttribute("visibility", (GAME && GAME.id && GAME.userId == USER.id) ? true : false)
							ELEMENTS.settings.game.clearRolls.form.setAttribute("visibility", (GAME && GAME.id && GAME.userId == USER.id) ? true : false)
							ELEMENTS.settings.game.delete.gate.setAttribute("visibility", (GAME && GAME.id && GAME.userId == USER.id) ? true : false)

						// remove extra games
							var gameOptions = Array.from(ELEMENTS.settings.game.select.custom.querySelectorAll("option"))
							var gameKeys = Object.keys(USER.games)
							for (var g in gameOptions) {
								if (!gameKeys.includes(gameOptions[g].value)) {
									gameOptions[g].remove()
								}
							}

						// custom games, from USER object
							for (var g in USER.games) {
								var game = USER.games[g]
								var option = ELEMENTS.settings.game.select.custom.querySelector("option[value='" + game.id + "']")
								if (option) {
									option.innerText = game.name
								}
								else {
									option = document.createElement("option")
									option.value = game.id
									option.innerText = game.name
									ELEMENTS.settings.game.select.custom.appendChild(option)
								}

								if (GAME && GAME.id == game.id) {
									option.selected = true
									ELEMENTS.settings.game.select.element.value = game.id
									ELEMENTS.settings.game.select.element.className = "form-pair"
									ELEMENTS.settings.game.input.setAttribute("visibility", false)
								}
							}
					} catch (error) {console.log(error)}
				}

			/* displayGameListSelection */
				function displayGameListSelection(event) {
					try {
						// reveal
							if (ELEMENTS.settings.game.select.element.value == ELEMENTS.settings.game.select.search.value) {
								ELEMENTS.settings.game.input.setAttribute("visibility", true)
								ELEMENTS.settings.game.select.element.className = ""
								return
							}
							
							if (ELEMENTS.settings.game.select.element.value == ELEMENTS.settings.game.select.new.value) {
								ELEMENTS.settings.game.input.setAttribute("visibility", true)
								ELEMENTS.settings.game.select.element.className = ""
								return
							}

						// hide
							ELEMENTS.settings.game.input.setAttribute("visibility", false)
							ELEMENTS.settings.game.select.element.className = "form-pair"
							return
					} catch (error) {console.log(error)}
				}

		/** submit **/
			/* submitGameRead */
				function submitGameRead(event) {
					try {
						// select value
							var value = ELEMENTS.settings.game.select.element.value

						// none
							if (value == ELEMENTS.settings.game.select.none.value) {
								submitGameUnread()
								return
							}

						// create
							else if (value == ELEMENTS.settings.game.select.new.value) {
								var post = {
									action: "createGame",
									game: {
										id: null,
										name: ELEMENTS.settings.game.input.value
									}
								}

								if (!post.game.name) {
									FUNCTIONS.showToast({success: false, message: "no game name"})
									return
								}
							}

						// search
							else if (value == ELEMENTS.settings.game.select.search.value) {
								var post = {
									action: "readGame",
									game: {
										id: null,
										name: ELEMENTS.settings.game.input.value
									}
								}

								if (!post.game.name) {
									FUNCTIONS.showToast({success: false, message: "no game name"})
									return
								}
							}

						// selection
							else {
								var post = {
									action: "readGame",
									game: {
										id: value,
										name: null
									}
								}
							}

						// leave?
							if (GAME && GAME.id) {
								submitGameUnread()
							}

						// send socket request
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

			/* submitGameUnread */
				function submitGameUnread(event) {
					try {
						// post
							var post = {
								action: "unreadGame",
								game: {
									id: GAME.id || null
								}
							}

						// clear game object
							GAME = null
							displayChatListRecipients()
							ELEMENTS.stream.history.innerHTML = ""
							ELEMENTS.chat.messages.innerHTML = ""
						
						// content
							CONTENT = null
							displayContent()
							displayContentList()

						// character
							CHARACTER = null
							displayCharacter()
							displayCharacterList()
						
						// send
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

			/* submitGameUpdateChatDelete */
				function submitGameUpdateChatDelete(event) {
					try {
						// post
							var post = {
								action: "clearGameChat",
								game: {
									id: GAME ? GAME.id : null,
									userId: USER ? USER.id : null
								}
							}

						// validate
							if (!post.game || !post.game.id) {
								FUNCTIONS.showToast({success: false, message: "no game selected"})
								return
							}

						// send
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

			/* submitGameUpdateRollsDelete */
				function submitGameUpdateRollsDelete(event) {
					try {
						// post
							var post = {
								action: "clearGameRolls",
								game: {
									id: GAME ? GAME.id : null,
									userId: USER ? USER.id : null
								}
							}

						// validate
							if (!post.game || !post.game.id) {
								FUNCTIONS.showToast({success: false, message: "no game selected"})
								return
							}

						// send
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

			/* submitGameDelete */
				function submitGameDelete(event) {
					try {
						// post
							var post = {
								action: "deleteGame",
								game: {
									id: GAME ? GAME.id : null,
									name: GAME ? GAME.name : null
								}
							}

						// validate
							if (!post.game.id) {
								FUNCTIONS.showToast({success: false, message: "no game found"})
								return
							}

						// send socket request
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

	/*** SETTINGS - USER ***/
		/** receive **/	
			/* receiveUser */
				function receiveUser(user) {
					try {
						// no user?
							if (!USER) { USER = {} }

						// loop through properties
							for (var i in user) {
								USER[i] = user[i]
							}

						// display
							displayUser(user)
					} catch (error) {console.log(error)}
				}

		/** display **/
			/* displayUser */
				function displayUser(user) {
					try {
						// username
							ELEMENTS.settings.user.name.input.value = USER.name

						// password
							ELEMENTS.settings.user.password.old.value = null
							ELEMENTS.settings.user.password.new.value = null

						// volume
							ELEMENTS.settings.audio.volume.value = Math.max(0, Math.min(1, USER.settings.volume))
							var audios = Array.from(ELEMENTS.body.querySelectorAll("audio"))
							for (var a in audios) {
								audios[a].volume = Math.max(0, Math.min(1, volume))
							}

						// chat
							ELEMENTS.chat.send.sender.user.innerText = user.name

						// relist games
							displayGameList()
					} catch (error) {console.log(error)}
				}

		/** submit **/
			/* submitUserUpdateVolume */
				function submitUserUpdateVolume(event) {
					try {
						// connected?
							if (!SOCKET) {
								FUNCTIONS.showToast({success: false, message: "no websocket connection"})
								return
							}

						// get number
							var volume = Math.max(0, Math.min(1, Number(event.target.value)))

						// save
							USER.settings.volume = volume

						// post
							var post = {
								action: "updateUserSettings",
								user: {
									settings: USER.settings
								}
							}

						// send
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

			/* submitUserUpdateName */
				function submitUserUpdateName(event) {
					try {
						// connected?
							if (!SOCKET) {
								FUNCTIONS.showToast({success: false, message: "no websocket connection"})
								return
							}

						// build data
							var post = {
								action: "updateUserName",
								user: {
									name: ELEMENTS.settings.user.name.input.value
								}
							}

						// validate
							if (!post.user.name || !FUNCTIONS.isNumLet(post.user.name) || post.user.name.length < 8) {
								FUNCTIONS.showToast({success: false, message: "name must be 8+ numbers and letters"})
								return
							}

						// send
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

			/* submitUserUpdatePassword */
				function submitUserUpdatePassword(event) {
					try {
						// connected?
							if (!SOCKET) {
								FUNCTIONS.showToast({success: false, message: "no websocket connection"})
								return
							}

						// build data
							var post = {
								action: "updateUserPassword",
								user: {
									oldPassword: ELEMENTS.settings.user.password.old.value,
									newPassword: ELEMENTS.settings.user.password.new.value,
								}
							}

						// validate
							if (!post.user.oldPassword || post.user.oldPassword.length < 8) {
								FUNCTIONS.showToast({success: false, message: "old password must be 8+ characters"})
								return
							}
							if (!post.user.newPassword || post.user.newPassword.length < 8) {
								FUNCTIONS.showToast({success: false, message: "new password must be 8+ characters"})
								return
							}
							if (post.user.newPassword == post.user.oldPassword) {
								FUNCTIONS.showToast({success: false, message: "new password is the same"})
								return
							}

							console.log(post)

						// send
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

			/* submitUserUpdateSignout */
				function submitUserUpdateSignout(event) {
					try {
						// data
							var post = {
								action: "signOut"
							}

						// un-authenticate
							FUNCTIONS.sendPost(post, function(response) {
								if (!response.success) {
									return
								}

								window.location = response.location
						})
					} catch (error) {console.log(error)}
				}

	/*** ROLLS ***/
		/** receive **/
			/* receiveRollGroups */
				function receiveRollGroups(rollGroups) {
					try {
						// delete?
							if (rollGroups.delete) {
								ELEMENTS.stream.history.innerHTML = ""
								return
							}

						// redisplay section
							displayRollGroups(rollGroups)
					} catch (error) {console.log(error)}
				}

		/** display **/
			/* displayRollGroups */
				function displayRollGroups(rollGroups) {
					try {
						// loop through rollGroups
							for (var i in rollGroups) {
								// already exists
									if (ELEMENTS.stream.history.querySelector("#roll-" + rollGroups[i].id)) {
										displayRollGroupUpdate(rollGroups[i])
										continue
									}

								// new
									displayRollGroupCreate(rollGroups[i])
							}
					} catch (error) {console.log(error)}
				}

			/* displayRollGroupCreate */
				function displayRollGroupCreate(rollGroup) {
					try {
						// group element
							var rollGroupElement = document.createElement("div")
								rollGroupElement.className = "roll-group"
								rollGroupElement.id = "roll-" + rollGroup.id
							ELEMENTS.stream.history.appendChild(rollGroupElement)

						// loop through rolls
							for (var j in rollGroup.rolls) {
								// data
									var data = rollGroup.rolls[j]
							
								// spacer
									if (data.display.spacer) {
										var spacerElement = document.createElement("div")
											spacerElement.id = "roll-" + rollGroup.id + "-" + data.id
											spacerElement.className = "spacer"
											spacerElement.innerText = data.display.text
										rollGroupElement.appendChild(spacerElement)
									}

								// d20
									else if (data.display.success !== null && !data.display.dice.length) {
										var label = document.createElement("label")
											label.id = "roll-" + rollGroup.id + "-" + data.id
										rollGroupElement.appendChild(label)

										var text = document.createElement("span")
											text.innerText = data.display.text
										label.appendChild(text)

										var d20 = document.createElement("div")
											d20.className = "d20"
											d20.innerText = data.display.total
											d20.setAttribute("success", data.display.success)
										label.prepend(d20)
									}

								// d6
									else {
										var label = document.createElement("label")
											label.id = "roll-" + rollGroup.id + "-" + data.id
										rollGroupElement.appendChild(label)

										var text = document.createElement("span")
											text.innerText = data.display.text
										label.prepend(text)

										var total = document.createElement("div")
											total.className = "d6 total"
											total.id = "roll-" + rollGroup.id + "-" + data.id + "-total"
											total.innerText = data.display.total
											total.setAttribute("type", data.display.type)
										label.prepend(total)

										var equals = document.createElement("div")
											equals.className = "equals"
											equals.innerHTML = "&rarr;"
										label.prepend(equals)

										for (var r in data.display.dice) {
											var d6 = document.createElement("div")
												d6.id = "roll-" + rollGroup.id + "-" + data.id + "-" + r
												d6.className = "d6"
												d6.setAttribute("counting", data.display.dice[r].counting)
												d6.addEventListener(TRIGGERS.click, submitRollGroupUpdate)
												d6.innerText = data.display.dice[r].number
											label.prepend(d6)
										}
									}
							}

						// scroll
							ELEMENTS.stream.history.scrollLeft = 1000000
					} catch (error) {console.log(error)}
				}

			/* displayRollGroupUpdate */
				function displayRollGroupUpdate(rollGroup) {
					try {
						// element
							var rollGroupElement = ELEMENTS.stream.history.querySelector("#roll-" + rollGroup.id)
							if (!rollGroupElement) {
								return
							}

						// loop through rolls
							for (var j in rollGroup.rolls) {
								// data
									var data = rollGroup.rolls[j]
							
								// spacer
									if (data.display.spacer) {
										continue
									}

								// d20
									else if (data.display.d == 20) {
										continue
									}

								// d6
									else {
										// update total
											var total = rollGroupElement.querySelector("#roll-" + rollGroup.id + "-" + data.id + "-total")
												total.innerText = data.display.total

										// update dice
											for (var r in data.display.dice) {
												var d6 = rollGroupElement.querySelector("#roll-" + rollGroup.id + "-" + data.id + "-" + r)
													d6.setAttribute("counting", data.display.dice[r].counting)
													d6.innerText = data.display.dice[r].number
											}
									}
							}
					} catch (error) {console.log(error)}
				}

		/** submit **/
			/* submitRollGroupCreate */
				function submitRollGroupCreate(rolls) {
					try {
						// post
							var post = {
								action: "createRollGroup",
								rollGroup: {
									userId: USER ? USER.id : null,
									gameId: GAME ? GAME.id : null,
									characterId: CHARACTER ? CHARACTER.id : null,
									rolls: rolls
								}
							}

						// validate
							if (!post.rollGroup.gameId) {
								FUNCTIONS.showToast({success: false, message: "no game selected"})
								return
							}

						// send socket request
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

			/* submitRollGroupCreateD20 */
				function submitRollGroupCreateD20(event) {
					try {
						// play?
							if (ELEMENTS.character.element.getAttribute("mode") !== "play") {
								return
							}

						// rolls
							var rolls = []

						// spacer
							rolls.push({
								spacer: true,
								text: CHARACTER.info.name
							})

						// within an item ?
							if (event.target.closest(".item")) {
								// item
									var id = event.target.closest(".item").id
									var item = CHARACTER.items.find(function (i) {
										return i.id == id
									})

								// usage ?
									if (event.target.closest(".item-usage")) {
										var usages = event.target.closest(".item-usages")
										var usage = event.target.closest(".item-usage")
										var index = Array.prototype.indexOf.call(usages.children, usage)
										var skillName = item.usage[index].skill
										var statistic = item.usage[index].statistic
										var skill = RULES.skills[statistic].find(function(k) {
											return k.name == skillName
										})
									}

								// otherwise
									else {
										var skillName = ""
										var statistic = ""
										var skill = null
									}
							}

						// from a skill
							else if (event.target.closest(".skill")) {
								var item = null
								var skillName = event.target.closest(".skill").querySelector(".skill-name-text").value.replace(/\s/g, "_")
								var statistic = event.target.closest(".statistic").id.replace("character-", "")
								var skill = RULES.skills[statistic].find(function(k) {
									return k.name == skillName
								}) || {name: skillName}
							}

						// from a statistic
							else if (event.target.closest(".statistic")) {
								var item = null
								var skillName = ""
								var statistic = event.target.closest(".statistic").id.replace("character-", "")
								var skill = null
							}

						// from nowhere
							else {
								var item = null
								var skillName = ""
								var statistic = ""
								var skill = null
							}

						// compile roll
							var roll = {
								d: 20,
								target: Number(event.target.value),
								text: skill ? skill.name.replace(/_/g, " ") : statistic ? statistic : item ? item.name : "",
								recipient: ELEMENTS.character.settings.recipient.select.value || null
							}

						// charisma
							if (roll.recipient && skill && skill.charisma) {
								roll.charisma = true
								roll.counters = []
								for (var c in skill.counters) {
									roll.counters[c] = skill.counters[c]
								}
							}

						// immunity check ?
							var immunity_checks = []
							var conditions = CHARACTER.info.status.conditions || []
							for (var c in conditions) {
								if (conditions[c].immunity_check && conditions[c].immunity_check.before) {
									if ((skillName && conditions[c].immunity_check.before.includes(skillName)) 
									 || (statistic && conditions[c].immunity_check.before.includes(statistic))) {
										// get target
											var target = CHARACTER.statistics.immunity.maximum + CHARACTER.statistics.immunity.damage + CHARACTER.statistics.immunity.condition
											if (conditions[c].immunity_check.skill) {
												var immunitySkill = CHARACTER.statistics.immunity.skills.find(function(s) {
													return s.name == conditions[c].immunity_check.skill
												}) || {name: null, maximum: 0, condition: 0}
												target += immunitySkill.maximum + immunitySkill.condition
											}

										// add to history
											immunity_checks.push({
												d: 20,
												target: Math.max(0, target),
												text: immunitySkill.name ? immunitySkill.name.replace(/_/g, " ") : "immunity",
											})
									}
								}
							}

						// add to history
							if (!immunity_checks.length) {
								rolls.push(roll)
							}
							else {
								for (var i = 0; i < immunity_checks.length - 1; i++) {
									immunity_checks[i].ifSuccess = immunity_checks[i + 1]
								}
								immunity_checks[immunity_checks.length - 1].ifSuccess = roll
								rolls.push(immunity_checks[0])
							}

						// post
							submitRollGroupCreate(rolls)
					} catch (error) {console.log(error)}
				}

			/* submitRollGroupCreateD6 */
				function submitRollGroupCreateD6(event) {
					try {
						// play?
							if (ELEMENTS.character.element.getAttribute("mode") !== "play" && ELEMENTS.character.element.getAttribute("mode") !== "damage") {
								return
							}

						// rolls
							var rolls = []

						// spacer
							rolls.push({
								spacer: true,
								text: CHARACTER.info.name
							})

						// within an item ?
							if (event.target.closest(".item")) {
								// item
									var id = event.target.closest(".item").id
									var item = CHARACTER.items.find(function (i) {
										return i.id == id
									})
									var type = item.type || "item"
									var count = Number(event.target.value)

								// usage
									if (event.target.closest(".item-usage")) {
										var usages = event.target.closest(".item-usages")
										var usage = event.target.closest(".item-usage")
										var index = Array.prototype.indexOf.call(usages.children, usage)
										var skillName = item.usage[index].skill
										var statistic = item.usage[index].statistic
										var skill = RULES.skills[statistic].find(function(k) {
											return k.name == skillName
										})

										if (skill.combat) {
											type = "weapon"
										}
									}

								// condition
									if (event.target.closest(".item-condition")) {
										var condition = event.target.closest(".item-condition").querySelector(".item-condition-name").value.replace(/\_/gi, " ")
									}

								// otherwise
									else {
										var skill = null
										var statistic = null
									}
							}

						// from a skill
							else if (event.target.closest(".skill")) {
								var item = null
								var type = ""
								var count = Number(event.target.value)
								var skillName = event.target.closest(".skill").querySelector(".skill-name-text").value.replace(/\s/g, "_")
								var statistic = Object.keys(RULES.skills).find(function(s) {
									return RULES.skills[s].find(function(k) {
										return k.name.includes(skillName)
									})
								})
								var skill = RULES.skills[statistic].find(function(k) {
									return k.name.includes(skillName)
								})
							}

						// from nowhere
							else {
								var item = null
								var type = ""
								var count = Number(event.target.value)
								var skillName = ""
								var statistic = ""
								var skill = null
							}

						// special skill
							if (!item && skill && skill.combat) {
								type = "weapon"
							}
							else if (item && skill && skill.combat) {
								type = "weapon"
								var specialSkill = CHARACTER.statistics[statistic].skills.find(function(s) {
									return s.name == skill.name
								})
								if (specialSkill && specialSkill.d6) {
									count += specialSkill.d6
								}
							}
							else if (skill && (skill.name == "recover" || skill.name == "defend")) {
								type = "healing"
							}

						// condition?
							if (item && event.target.closest(".item-condition")) {
								type = "potion"
							}

						// add to history
							rolls.push({
								type: type,
								d: 6,
								count: count,
								text: condition ? condition : item ? item.name : skill ? skill.name.replace(/_/g, " ") : statistic ? statistic : "",
								recipient: ELEMENTS.character.settings.recipient.select.value || null
							})

						// post
							submitRollGroupCreate(rolls)
					} catch (error) {console.log(error)}
				}

			/* submitRollGroupCreateRecover */
				function submitRollGroupCreateRecover(event) {
					try {
						// rolls
							var rolls = []

						// spacer
							rolls.push({
								spacer: true,
								text: CHARACTER.info.name
							})

						// recover skill
							var skill = CHARACTER.statistics.immunity.skills.find(function (s) { return s.name == "recover" }) || {maximum: 0, condition: 0, d6: 2}
							var target = Math.max(0, CHARACTER.statistics.immunity.maximum + CHARACTER.statistics.immunity.damage + CHARACTER.statistics.immunity.condition + skill.maximum + skill.condition)

							rolls.push({
								d: 20,
								target: target,
								text: "recover",
								ifSuccess: {
									type: "healing",
									d: 6,
									count: skill.d6,
									text: "recover"
								},
								ifFailure: {
									type: "healing",
									d: 6,
									count: 1,
									text: "recover"
								}
							})

						// post
							submitRollGroupCreate(rolls)
					} catch (error) {console.log(error)}
				}

			/* submitRollGroupCreateCustom */
				function submitRollGroupCreateCustom(event) {
					try {
						// rolls
							var rolls = []

						// spacer
							rolls.push({
								spacer: true,
								text: CHARACTER ? CHARACTER.info.name : "environment"
							})

						// add to history
							var d = Math.max(2, ELEMENTS.character.settings.rng.d.value || 6)
							var count = Math.max(1, ELEMENTS.character.settings.rng.count.value)
							var text = (ELEMENTS.character.settings.rng.label.value || "?") + " (" + count + "d" + d + ")" 
							rolls.push({
								type: "environment",
								d: d,
								count: count,
								text: text,
								recipient: ELEMENTS.character.settings.recipient.select.value || null
							})

						// post
							submitRollGroupCreate(rolls)
					} catch (error) {console.log(error)}
				}

			/* submitRollGroupUpdate */
				function submitRollGroupUpdate(event) {
					try {
						// directory
							var directory = event.target.id.split("-")

						// post
							var post = {
								action: "updateRollGroup",
								rollGroup: {
									userId: USER ? USER.id : null,
									gameId: GAME ? GAME.id : null,
									characterId: CHARACTER ? CHARACTER.id : null,
									id: directory[1],
									rollId: directory[2],
									index: directory[3],
									counting: String(event.target.getAttribute("counting")) == "true" ? false : true
								}
							}

						// validate
							if (!post.rollGroup.gameId) {
								FUNCTIONS.showToast({success: false, message: "no game selected"})
								return
							}
							if (!post.rollGroup.id || !post.rollGroup.rollId) {
								FUNCTIONS.showToast({success: false, message: "no dice selected"})
								return
							}

						// send socket request
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

	/*** RULES ***/
		/** display **/
			/* displayRulesSearch */
				function displayRulesSearch(resultsList) {
					try {
						// clear
							ELEMENTS.rules.results.innerHTML = ""

						// spit out results
							for (var r in resultsList) {
								displayRulesSearchResult(resultsList[r], ELEMENTS.rules.results)
							}

						// lose focus
							ELEMENTS.rules.search.input.blur()
							ELEMENTS.rules.search.button.blur()
					} catch (error) {console.log(error)}
				}

			/* displayRulesSearchResult */
				function displayRulesSearchResult(result, parent) {
					try {
						// element
							var resultElement = document.createElement("div")
								resultElement.className = "search-result"
								resultElement.setAttribute("type", result.type)
								resultElement.setAttribute("data", JSON.stringify(result))
							parent.appendChild(resultElement)

						// actions
							var resultSend = document.createElement("button")
								resultSend.className = "search-result-send minor-button"
								resultSend.innerHTML = "&#x1f4ac;"
								resultSend.addEventListener(TRIGGERS.click, submitChatCreateRules)
							resultElement.appendChild(resultSend)

							if (result.addable) {
								var resultAdd = document.createElement("button")
									resultAdd.className = "search-result-add minor-button"
									resultAdd.innerHTML = "&#x1f464;"
									resultAdd.addEventListener(TRIGGERS.click, submitCharacterUpdateRules)
								resultElement.appendChild(resultAdd)
							}
							
						// name
							var resultName = document.createElement("h3")
								resultName.className = "search-result-name"
								resultName.innerText = result.name.replace(/_/gi, " ")
							resultElement.appendChild(resultName)

						// data
							var resultDataList = document.createElement("ul")
								resultDataList.className = "search-result-data"
							resultElement.appendChild(resultDataList)

							for (var i in result.data) {
								var resultDataItem = document.createElement("li")
									resultDataItem.className = "search-result-data-item"
								resultDataList.appendChild(resultDataItem)

								var resultDataItemProperty = document.createElement("span")
									resultDataItemProperty.className = "search-result-data-item-property"
									resultDataItemProperty.innerText = i.replace(/_/gi, " ")
								resultDataItem.appendChild(resultDataItemProperty)

								if (["string","number","boolean"].includes(typeof result.data[i])) {
									var resultDataItemValue = document.createElement("span")
										resultDataItemValue.className = "search-result-data-item-value"
										resultDataItemValue.innerText = result.data[i]
									resultDataItem.appendChild(resultDataItemValue)
								}
								else {
									var resultDataItemSublist = document.createElement("ul")
										resultDataItemSublist.className = "search-result-data-item-sublist"
									resultDataItem.appendChild(resultDataItemSublist)

									for (var j in result.data[i]) {
										var resultDataItemSubitem = document.createElement("li")
											resultDataItemSubitem.className = "search-result-data-item-subitem"
										resultDataItemSublist.appendChild(resultDataItemSubitem)

										if (isNaN(j)) {
											var resultDataItemSubproperty = document.createElement("span")
												resultDataItemSubproperty.className = "search-result-data-item-subproperty"
												resultDataItemSubproperty.innerText = j.replace(/_/gi, " ")
											resultDataItemSubitem.appendChild(resultDataItemSubproperty)
										}

										var resultDataItemSubvalue = document.createElement("span")
											resultDataItemSubvalue.className = "search-result-data-item-subvalue"
											resultDataItemSubvalue.innerText = JSON.stringify(result.data[i][j], null, 2).replace(/\{|\}|\[|\]|\"/gi,"").replace(/_/gi, " ").trim()
										resultDataItemSubitem.appendChild(resultDataItemSubvalue)
									}
								}
							}
					} catch (error) {console.log(error)}
				}

		/** submit **/
			/* submitRulesSearch */
				function submitRulesSearch(event) {
					try {
						// results list
							var resultsList = []

						// input
							var searchText = ELEMENTS.rules.search.input.value.toLowerCase()
							if (!searchText) {
								displayRulesSearch(resultsList)
								return
							}
							var similarSearchText = searchText.replace(/\s/gi, "_")

						// go through rules
							// overviews
								for (var o in RULES.overviews) {
									if (o.includes(searchText) || o.includes(similarSearchText)) {
										var result = FUNCTIONS.duplicateObject(RULES.overviews[o])
										delete result.name
										resultsList.push({name: o, type: "overview", data: result})
									}
								}

							// races
								for (var r in RULES.races) {
									if (r.includes(searchText) || r.includes(similarSearchText)) {
										var result = FUNCTIONS.duplicateObject(RULES.races[r])
										resultsList.push({name: r, type: "race", data: result, addable: true})
									}
								}

							// classes
								for (var c in RULES.classes) {
									if (c.includes(searchText) || c.includes(similarSearchText)) {
										var result = FUNCTIONS.duplicateObject(RULES.classes[c])
										resultsList.push({name: c, type: "class", data: result})
									}
								}

							// statistics
								for (var s in RULES.statistics) {
									if (s.includes(searchText) || s.includes(similarSearchText)) {
										var description = FUNCTIONS.duplicateObject(RULES.statistics[s])
										var skills = FUNCTIONS.duplicateObject(RULES.skills[s]).map(function(k) {
											return k.name
										})
										var result = {description: description, skills: skills}
										resultsList.push({name: s, type: "statistic", data: result})
									}
								}

							// skills
								for (var s in RULES.skills) {
									for (var i in RULES.skills[s]) {
										if (RULES.skills[s][i].name.includes(searchText) || RULES.skills[s][i].name.includes(similarSearchText)) {
											var name = RULES.skills[s][i].name
											var result = FUNCTIONS.duplicateObject(RULES.skills[s][i])
												result.statistic = s
											delete result.name
											resultsList.push({name: name, type: "skill", data: result, addable: true})
										}
									}
								}

							// damage
								for (var d in RULES.damage) {
									if (d.includes(searchText) || d.includes(similarSearchText)) {
										var result = FUNCTIONS.duplicateObject(RULES.damage[d])
										resultsList.push({name: d, type: "damage", data: result})
									}
								}

							// conditions
								for (var c in RULES.conditions) {
									if (c.includes(searchText) || c.includes(similarSearchText)) {
										var result = FUNCTIONS.duplicateObject(RULES.conditions[c])
										delete result.name
										resultsList.push({name: c, type: "condition", data: result, addable: true})
									}
								}

							// items
								for (var i in RULES.items) {
									for (var j in RULES.items[i]) {
										if (RULES.items[i][j].name && (RULES.items[i][j].name.includes(searchText) || RULES.items[i][j].name.includes(similarSearchText))) {
											var result = FUNCTIONS.duplicateObject(RULES.items[i][j])
											delete result.name
											resultsList.push({name: RULES.items[i][j].name, type: "item", data: result, addable: true})
										}
									}
								}

							// puzzles
								for (var p in RULES.puzzles) {
									if (RULES.puzzles[p].name.includes(searchText) || RULES.puzzles[p].name.includes(similarSearchText)) {
										var result = FUNCTIONS.duplicateObject(RULES.puzzles[p])
										var name = result.name
										delete result.name
										resultsList.push({name: name, type: "puzzle", data: result})
									}
								}

							// npcs
								for (var n in RULES.npcs) {
									if (RULES.npcs[n].info.name.includes(searchText) || RULES.npcs[n].info.name.includes(similarSearchText)) {
										var result = FUNCTIONS.duplicateObject(RULES.npcs[n])
										var name = result.info.name
										delete result.info.name
										resultsList.push({name: name, type: "npc", data: result})
									}
								}

							// animals
								for (var a in RULES.animals) {
									if (RULES.animals[a].info.name.includes(searchText) || RULES.animals[a].info.name.includes(similarSearchText)) {
										var result = FUNCTIONS.duplicateObject(RULES.animals[a])
										var name = result.info.name
										delete result.info.name
										resultsList.push({name: name, type: "npc", data: result})
									}
								}

							// creatures
								for (var c in RULES.creatures) {
									if (RULES.creatures[c].info.name.includes(searchText) || RULES.creatures[c].info.name.includes(similarSearchText)) {
										var result = FUNCTIONS.duplicateObject(RULES.creatures[c])
										var name = result.info.name
										delete result.info.name
										resultsList.push({name: name, type: "npc", data: result})
									}
								}

							// services
								for (var s in RULES.services) {
									if (RULES.services[s].name.includes(searchText) || RULES.services[s].name.includes(similarSearchText)) {
										var result = FUNCTIONS.duplicateObject(RULES.services[s])
										var name = result.name
										delete result.name
										result = result.tasks
										resultsList.push({name: name, type: "service", data: result})
									}
								}

						// display
							displayRulesSearch(resultsList)
					} catch (error) {console.log(error)}
				}

	/*** CHARACTER ***/
		/** receive **/
			/* receiveCharacter */
				function receiveCharacter(character, selectCharacter) {
					try {
						// selecting character?
							if (selectCharacter) {
								CHARACTER = {id: selectCharacter}
							}

						// current content?
							if (CHARACTER && CHARACTER.id == character.id) {
								CHARACTER = character.delete ? null : character
								displayCharacter()
							}

						// relist
							displayCharacterList()
					} catch (error) {console.log(error)}
				}

		/** display - onload **/
			/* displayCharacterListTemplates */
				function displayCharacterListTemplates() {
					try {
						// NPCs
							var optgroup = document.createElement("optgroup")
								optgroup.label = "NPCs"
							ELEMENTS.character.settings.select.templates.appendChild(optgroup)

							for (var n in RULES.npcs) {
								var option = document.createElement("option")
									option.value = "[template-npcs-" + RULES.npcs[n].info.name + "]"
									option.innerText = RULES.npcs[n].info.name
								optgroup.appendChild(option)
							}

						// animals
							var optgroup = document.createElement("optgroup")
								optgroup.label = "animals"
							ELEMENTS.character.settings.select.templates.appendChild(optgroup)

							for (var a in RULES.animals) {
								var option = document.createElement("option")
									option.value = "[template-animals-" + RULES.animals[a].info.name + "]"
									option.innerText = RULES.animals[a].info.name
								optgroup.appendChild(option)
							}

						// creatures
							var optgroup = document.createElement("optgroup")
								optgroup.label = "creatures"
							ELEMENTS.character.settings.select.templates.appendChild(optgroup)

							for (var c in RULES.creatures) {
								var option = document.createElement("option")
									option.value = "[template-creatures-" + RULES.creatures[c].info.name + "]"
									option.innerText = RULES.creatures[c].info.name
								optgroup.appendChild(option)
							}
					} catch (error) {console.log(error)}
				}

			/* displayCharacterListRaces */
				function displayCharacterListRaces() {
					try {
						var container = ELEMENTS.character.info.race
						for (var i in RULES.races) {
							if (!container.querySelector("option[value=" + i + "]")) {
								var option = document.createElement("option")
									option.value = i
									option.innerText = i
								container.appendChild(option)
							}
						}
						ELEMENTS.character.info.raceDisabled.selected = true
					} catch (error) {console.log(error)}
				}

			/* displayCharacterListSkills */
				function displayCharacterListSkills() {
					try {
						for (var i in RULES.skills) {
							var container = ELEMENTS.character.statistics[i].querySelector("select")

							for (var j in RULES.skills[i]) {
								if (!container.querySelector("option[value=" + RULES.skills[i][j].name + "]")) {
									var option = document.createElement("option")
										option.value = RULES.skills[i][j].name
										option.innerText = RULES.skills[i][j].name.replace(/_/g, " ")
									container.appendChild(option)
								}
							}
						}
					} catch (error) {console.log(error)}
				}

			/* displayCharacterListItems */
				function displayCharacterListItems() {
					try {
						var container = ELEMENTS.character.items.select

						// add group
							for (var i in RULES.items) {
								var optgroup = document.createElement("optgroup")
									optgroup.label = i
								container.appendChild(optgroup)

								// add items
									for (var j in RULES.items[i]) {
										if (!container.querySelector("option[value='" + RULES.items[i][j].name + "']")) {
											var option = document.createElement("option")
												option.value = RULES.items[i][j].name
												option.innerText = RULES.items[i][j].name
											optgroup.appendChild(option)
										}
									}
							}
					} catch (error) {console.log(error)}
				}

			/* displayCharacterListConditions */
				function displayCharacterListConditions() {
					try {
						var container = ELEMENTS.character.conditions.select

						// add conditions
							for (var i in RULES.conditions) {
								if (!container.querySelector("option[value='" + i + "']")) {
									var condition = document.createElement("option")
										condition.value = i
										condition.innerText = i.replace(/_/g, " ")
									container.appendChild(condition)
								}
							}
					} catch (error) {console.log(error)}
				}

		/** display - settings **/
			/* displayCharacterMode */
				function displayCharacterMode(event) {
					try {
						// mode
							var mode = event.target.id.replace("character-modes-", "")

							if (!CHARACTER && mode !== "settings") {
								FUNCTIONS.showToast({success: false, message: "no character selected"})
								return
							}

							ELEMENTS.character.element.setAttribute("mode", mode)

							if (!CHARACTER) {
								return
							}

						// close up inputs
							ELEMENTS.character.content.querySelectorAll(".editable").forEach(function(input) {
								input.setAttribute("readonly", true)
							})

							ELEMENTS.character.content.querySelectorAll(".statistic-damage").forEach(function(input) {
								input.setAttribute("readonly", true)
							})

						// disable selects
							ELEMENTS.character.content.querySelectorAll("select").forEach(function(select) {
								select.setAttribute("disabled", true)
							})

						// play
							if (mode == "play") {
								// close info & items
									ELEMENTS.character.info.element.removeAttribute("open")
									ELEMENTS.character.items.element.removeAttribute("open")
							}

						// edit
							if (mode == "edit") {
								// open info
									ELEMENTS.character.info.element.setAttribute("open", true)

								// info
									ELEMENTS.character.info.element.querySelectorAll(".editable").forEach(function(input) {
										input.removeAttribute("readonly")
									})
									ELEMENTS.character.info.race.removeAttribute("disabled")

								// statistics
									ELEMENTS.character.content.querySelectorAll(".statistic input.editable").forEach(function(input) {
										input.removeAttribute("readonly")
									})

								// skills
									ELEMENTS.character.content.querySelectorAll(".statistic select").forEach(function(select) {
										select.removeAttribute("disabled")
									})
							}

						// items
							else if (mode == "items") {
								// items
									ELEMENTS.character.content.querySelectorAll(".item .editable").forEach(function(input) {
										input.removeAttribute("readonly")
									})

									ELEMENTS.character.content.querySelectorAll(".item select.editable").forEach(function(select) {
										select.removeAttribute("disabled")
									})

								// items select
									ELEMENTS.character.items.select.removeAttribute("disabled")

								// open items
									ELEMENTS.character.items.element.setAttribute("open", true)
							}

						// conditions
							else if (mode == "conditions") {
								// conditions select
									ELEMENTS.character.conditions.select.removeAttribute("disabled")
							}

						// damage
							else if (mode == "damage") {
								// open items
									ELEMENTS.character.items.element.setAttribute("open", true)

								// statistics
									ELEMENTS.character.content.querySelectorAll(".statistic-damage").forEach(function(input) {
										input.removeAttribute("readonly")
									})
							}
					} catch (error) {console.log(error)}
				}

			/* displayCharacterList */
				function displayCharacterList(characterList) {
					try {
						// close option?
							ELEMENTS.character.settings.select.none.disabled = (CHARACTER && CHARACTER.id) ? false : true

						// no game?
							if (!GAME) {
								ELEMENTS.character.settings.select.custom.innerHTML = ""
								ELEMENTS.character.settings.recipient.characters.innerHTML = ""
								ELEMENTS.character.settings.recipient.arena.innerHTML = ""
								ELEMENTS.content.objects.characters.innerHTML = ""
								ELEMENTS.content.objects.images.innerHTML = ""
								return
							}

						// custom characters, from USER object
							for (var c in characterList) {
								// character
									var character = characterList[c]

								// character select
									var option = ELEMENTS.character.settings.select.custom.querySelector("option[value='" + character.id + "']")
									if (option && character.delete) {
										if (ELEMENTS.character.settings.select.element.value == option.value) {
											ELEMENTS.character.settings.select.element.value = ELEMENTS.character.settings.select.new.value
											ELEMENTS.character.settings.select.element.className = ""
											ELEMENTS.character.settings.select.templates.setAttribute("visibility", true)
										}
										option.remove()
									}
									else if (option) {
										option.innerText = character.name
									}
									else {
										option = document.createElement("option")
										option.value = character.id
										option.innerText = character.name
										ELEMENTS.character.settings.select.custom.appendChild(option)
									}

									if (option && CHARACTER && CHARACTER.id == character.id) {
										option.selected = true
										ELEMENTS.character.settings.select.element.value = character.id
										ELEMENTS.character.settings.select.element.className = "form-pair"
										ELEMENTS.character.settings.select.templates.setAttribute("visibility", false)
									}

								// character targeting
									var targetOption = ELEMENTS.character.settings.recipient.characters.querySelector("option[value='" + character.id + "']")
									if (targetOption && character.delete) {
										if (ELEMENTS.character.settings.recipient.select.value == targetOption.value) {
											ELEMENTS.character.settings.recipient.select.value = ELEMENTS.character.settings.recipient.none.value
										}
										targetOption.remove()
									}
									else if (targetOption) {
										targetOption.innerText = character.name
									}
									else {
										targetOption = document.createElement("option")
										targetOption.value = character.id
										targetOption.innerText = character.name
										ELEMENTS.character.settings.recipient.characters.appendChild(targetOption)
									}

								// arena content objects select
									var contentOption = ELEMENTS.content.objects.characters.querySelector("option[value='" + character.id + "']")
									if (contentOption && character.delete) {
										if (ELEMENTS.content.objects.select.value == contentOption.value) {
											ELEMENTS.content.objects.select.value = ELEMENTS.content.objects.blank.value
										}
										contentOption.remove()
									}
									else if (contentOption) {
										contentOption.innerText = character.name
									}
									else {
										contentOption = document.createElement("option")
										contentOption.value = character.id
										contentOption.innerText = character.name
										contentOption.setAttribute("type", "character")
										ELEMENTS.content.objects.characters.appendChild(contentOption)
									}
							}
					} catch (error) {console.log(error)}
				}

			/* displayCharacterListSelection */
				function displayCharacterListSelection(event) {
					try {
						// reveal
							if (ELEMENTS.character.settings.select.element.value == ELEMENTS.character.settings.select.new.value) {
								ELEMENTS.character.settings.select.templates.setAttribute("visibility", true)
								ELEMENTS.character.settings.select.element.className = ""
								return
							}

						// hide
							ELEMENTS.character.settings.select.templates.setAttribute("visibility", false)
							ELEMENTS.character.settings.select.element.className = "form-pair"
							return
					} catch (error) {console.log(error)}
				}

			/* displayCharacterDownload */
				function displayCharacterDownload(event) {
					try {
						// package up
							var downloadLink = document.createElement("a")
								downloadLink.id = "download-link"
								downloadLink.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(CHARACTER)))
								downloadLink.setAttribute("download", CHARACTER.info.name + ".json")
								downloadLink.addEventListener(TRIGGERS.click, function() {
									var downloadLink = ELEMENTS.body.querySelector("#download-link")
									ELEMENTS.body.removeChild(downloadLink)
								})
						
						// click
							ELEMENTS.body.appendChild(downloadLink)
							downloadLink.click()
					} catch (error) {console.log(error)}
				}

		/** display - gameplay **/
			/* displayCharacter */
				function displayCharacter() {
					try {
						// no character?
							if (!CHARACTER) {
								ELEMENTS.character.element.setAttribute("mode", "settings")
								ELEMENTS.character.settings.metadata.setAttribute("visibility", false)

								ELEMENTS.chat.send.sender.character.disabled = true
								ELEMENTS.chat.send.sender.character.innerText = ELEMENTS.chat.send.sender.character.value
								ELEMENTS.chat.send.sender.select.value = ELEMENTS.chat.send.sender.user.value
								return
							}

						// metadata
							ELEMENTS.character.settings.metadata.setAttribute("visibility", true)
							ELEMENTS.character.settings.access.select.element.value = CHARACTER.access ? ELEMENTS.character.settings.access.select.me.value : ELEMENTS.character.settings.access.select.all.value
							ELEMENTS.character.settings.access.form.setAttribute("visibility", (CHARACTER && CHARACTER.id && CHARACTER.userId == USER.id) ? true : false)
							ELEMENTS.character.settings.delete.gate.setAttribute("visibility", (CHARACTER && CHARACTER.id && CHARACTER.userId == USER.id) ? true : false)

						// mode
							var mode = ELEMENTS.character.element.getAttribute("mode") || "play"

						// conditions
							displayCharacterConditions(CHARACTER, ELEMENTS.character.conditions.element)

						// items
							displayCharacterItems(CHARACTER, ELEMENTS.character.items.equipped, ELEMENTS.character.items.unequipped, mode == "items")

						// statistics
							for (var i in CHARACTER.statistics) {
								// statistic
									var container = ELEMENTS.character.statistics[i]
									displayCharacterStatistic(CHARACTER, container, i, mode == "edit")

								// skills
									container.querySelector(".skills-list").innerHTML = ""
									for (var s in CHARACTER.statistics[i].skills) {
										displayCharacterSkill(CHARACTER, container, i, CHARACTER.statistics[i].skills[s], mode == "edit")
									}
							}

						// info
							displayCharacterInfo(CHARACTER)

						// chat
							ELEMENTS.chat.send.sender.character.disabled = CHARACTER ? false : true
							ELEMENTS.chat.send.sender.character.innerText = CHARACTER ? CHARACTER.info.name : ELEMENTS.chat.send.sender.character.value
					} catch (error) {console.log(error)}
				}

			/* displayCharacterInfo */
				function displayCharacterInfo(character) {
					try {
						// name
							ELEMENTS.character.info.name.innerText = CHARACTER.info.name
							ELEMENTS.character.info.nameText.value = CHARACTER.info.name

						// image
							if (character.info.image) {
								ELEMENTS.character.info.image.style.backgroundImage = "url(" + character.info.image + (character.info.file ? ("?" + new Date().getTime()) : "") + ")"
								ELEMENTS.character.info.image.setAttribute("visibility", true)
							}
							else {
								ELEMENTS.character.info.image.style.backgroundImage = ""
								ELEMENTS.character.info.image.setAttribute("visibility", false)
							}

						// damage
							ELEMENTS.character.info.damage.value = CHARACTER.info.status.damage

						// demographics
							for (var i in CHARACTER.info.demographics) {
								if (i == "race" && !ELEMENTS.character.info.race.querySelector("option[value='" + CHARACTER.info.demographics[i] + "']")) {
									var option = document.createElement("option")
										option.innerText = option.value = CHARACTER.info.demographics[i]
									ELEMENTS.character.info.race.appendChild(option)
								}
								ELEMENTS.character.info[i].value = CHARACTER.info.demographics[i]
							}

						// carrying
							ELEMENTS.character.info.burden.value = CHARACTER.info.status.burden

						// points
							ELEMENTS.character.info.points.value = CHARACTER.info.status.points

						// description
							ELEMENTS.character.info.description.value = CHARACTER.info.description
							if (CHARACTER.info.demographics.race && RULES.races[CHARACTER.info.demographics.race]) {
								ELEMENTS.character.info.raceAbility.value = RULES.races[CHARACTER.info.demographics.race].info.ability
							}

						// abilities
							var run   = CHARACTER.statistics.speed.skills.find(   function(skill) { return skill.name == "run"  }) || {maximum: 0, condition: 0}
							var swim  = CHARACTER.statistics.speed.skills.find(   function(skill) { return skill.name == "swim" }) || {maximum: 0, condition: 0}
							var jump  = CHARACTER.statistics.speed.skills.find(   function(skill) { return skill.name == "jump" }) || {maximum: 0, condition: 0}
							var carry = CHARACTER.statistics.strength.skills.find(function(skill) { return skill.name == "carry"}) || {maximum: 0, condition: 0}
							var thro  = CHARACTER.statistics.strength.skills.find(function(skill) { return skill.name == "throw"}) || {maximum: 0, condition: 0}

							ELEMENTS.character.info.run.value   = Math.max(0, ((CHARACTER.statistics.speed.maximum    + CHARACTER.statistics.speed.damage    + CHARACTER.statistics.speed.condition)    + (run.maximum   + run.condition  ))     )
							ELEMENTS.character.info.move.value  = Math.max(0, ((CHARACTER.statistics.speed.maximum    + CHARACTER.statistics.speed.damage    + CHARACTER.statistics.speed.condition)    + (run.maximum   + run.condition  ))     )
							ELEMENTS.character.info.swim.value  = Math.max(0, ((CHARACTER.statistics.speed.maximum    + CHARACTER.statistics.speed.damage    + CHARACTER.statistics.speed.condition)    + (swim.maximum  + swim.condition )) / 4 )
							ELEMENTS.character.info.jump.value  = Math.max(0, ((CHARACTER.statistics.speed.maximum    + CHARACTER.statistics.speed.damage    + CHARACTER.statistics.speed.condition)    + (jump.maximum  + jump.condition )) * 10)
							ELEMENTS.character.info.carry.value = Math.max(0, ((CHARACTER.statistics.strength.maximum + CHARACTER.statistics.strength.damage + CHARACTER.statistics.strength.condition) + (carry.maximum + carry.condition)) * 10)
							ELEMENTS.character.info.throw.value = Math.max(0, ((CHARACTER.statistics.strength.maximum + CHARACTER.statistics.strength.damage + CHARACTER.statistics.strength.condition) + (thro.maximum  + thro.condition )) * 10)

							if (CHARACTER.info.status.burden > ELEMENTS.character.info.carry.value) {
								ELEMENTS.character.info.burden.setAttribute("overburdened", true)
							}
							else {
								ELEMENTS.character.info.burden.removeAttribute("overburdened")
							}
					} catch (error) {console.log(error)}
				}

			/* displayCharacterStatistic */
				function displayCharacterStatistic(character, container, statistic, enable) {
					try {
						// statistic
							container.querySelector(".statistic-maximum"  ).value = character.statistics[statistic].maximum
							container.querySelector(".statistic-damage"   ).value = Math.max(-99, Math.min(99, character.statistics[statistic].damage))    || ""
							container.querySelector(".statistic-condition").value = Math.max(-99, Math.min(99, character.statistics[statistic].condition)) || ""
							container.querySelector(".statistic-current"  ).value = Math.max(0, character.statistics[statistic].maximum + character.statistics[statistic].damage + character.statistics[statistic].condition)

						// skill list
							var select = ELEMENTS.character.statistics[statistic].querySelector("select")
							var options = Array.from(select.querySelectorAll("option"))
							for (var o in options) {
								options[o].removeAttribute("disabled")
							}
							ELEMENTS.character.statistics[statistic].querySelector("#character-" + statistic + "-disabled").selected = true
					} catch (error) {console.log(error)}
				}

			/* displayCharacterSkill */
				function displayCharacterSkill(character, container, statistic, skill, enable) {
					try {
						// block
							var block = document.createElement("div")
								block.className = "skill"
							container.querySelector(".skills-list").appendChild(block)

							if (skill.unremovable) {
								block.className += " unremovable"
							}
							else {
								var remove = document.createElement("button")
									remove.className = "skill-remove"
									remove.innerText = "x"
									remove.addEventListener(TRIGGERS.click, submitCharacterUpdateSkillDelete)
								block.prepend(remove)
							}

						// left column
							var left = document.createElement("div")
								left.className = "column-left"
							block.appendChild(left)

							var name = document.createElement("div")
								name.className = "skill-name"
							left.appendChild(name)

							if (skill.d6 !== undefined) {
								var d6 = document.createElement("input")
									d6.type = "number"
									d6.step = 1
									d6.min = 0
									if (!enable) {
										d6.setAttribute("readonly", true)
									}
									d6.className = "d6 editable"
									d6.placeholder = "d6"
									d6.value = skill.d6
									d6.addEventListener(TRIGGERS.click, submitRollGroupCreateD6)
									d6.addEventListener(TRIGGERS.change, submitCharacterUpdateSkillUpdate)
								name.appendChild(d6)
							}

							var text = document.createElement("input")
								text.className = "skill-name-text"
								text.type = "text"
								text.setAttribute("disabled", true)
								text.value = skill.name.replace(/_/g, " ")
							name.appendChild(text)

						// right column
							var right = document.createElement("div")
								right.className = "column-right"
							block.appendChild(right)

							var maximum = document.createElement("input")
								maximum.type = "number"
								if (!enable) {
									maximum.setAttribute("readonly", true)
								}
								maximum.className = "skill-maximum editable"
								maximum.value = skill.maximum
								maximum.placeholder = "↑"
								maximum.addEventListener(TRIGGERS.change, submitCharacterUpdateSkillUpdate)
							right.appendChild(maximum)

							var condition = document.createElement("input")
								condition.type = "number"
								condition.setAttribute("readonly", true)
								condition.className = "skill-condition"
								condition.value = Math.max(-99, Math.min(99, skill.condition)) || ""
							right.appendChild(condition)

							var damage = document.createElement("input")
								damage.type = "number"
								damage.setAttribute("readonly", true)
								damage.className = "skill-damage"
								damage.value = ""
							right.appendChild(damage)

							var current = document.createElement("input")
								current.type = "number"
								current.setAttribute("readonly", true)
								current.className = "skill-current d20"
								current.value = Math.max(0, character.statistics[statistic].maximum + character.statistics[statistic].damage + character.statistics[statistic].condition + skill.maximum + skill.condition)
								current.addEventListener(TRIGGERS.click, submitRollGroupCreateD20)
							right.appendChild(current)
						
						// disable in select
							var option = ELEMENTS.character.statistics[statistic].querySelector("option[value=" + skill.name + "]")
							if (option) { option.setAttribute("disabled", true) }
					} catch (error) {console.log(error)}
				}

			/* displayCharacterItems */
				function displayCharacterItems(character, equipped, unequipped, enable) {
					try {
						// clear
							equipped.innerHTML   = ""
							unequipped.innerHTML = ""

						// loop through items
							for (var i in character.items) {
								// data
									var item = character.items[i]

								// block
									var block = document.createElement("div")
										block.className = "item " + (item.type || "miscellaneous")
										block.id = item.id

										if (item.equipped) {
											equipped.prepend(block)
										}
										else {
											unequipped.prepend(block)
										}

								// remove
									var remove = document.createElement("button")
										remove.className = "item-remove"
										remove.innerText = "x"
										remove.addEventListener(TRIGGERS.click, submitCharacterUpdateItemDelete)
									block.prepend(remove)

								// equip
									var equip = document.createElement("button")
										equip.className = "item-equip"
										equip.innerHTML = "&#x2713;"
										if (item.equipped) {
											equip.setAttribute("equipped", true)
										}
										equip.addEventListener(TRIGGERS.click, submitCharacterUpdateItemEquip)
									block.prepend(equip)

								// name
									var name = document.createElement("div")
										name.className = "item-name"
									block.appendChild(name)

								// d6
									var d6 = document.createElement("input")
										d6.type = "number"
										if (!enable) {
											d6.setAttribute("readonly", true)
										}
										d6.step = 1
										d6.min = 0
										d6.className = "d6 editable"
										d6.placeholder = "d6"
										d6.addEventListener(TRIGGERS.change, submitCharacterUpdateItemUpdate)
										d6.addEventListener(TRIGGERS.click, submitRollGroupCreateD6)
										d6.value = item.d6 || 0
										if (!item.d6) {
											d6.className += " d6-zero"
										}
									name.appendChild(d6)

								// name text & count
									var text = document.createElement("input")
										text.type = "text"
										if (!enable) {
											text.setAttribute("readonly", true)
										}
										text.className = "item-name-text editable"
										text.placeholder = "item"
										text.value = item.name
										text.addEventListener(TRIGGERS.change, submitCharacterUpdateItemUpdate)
									name.appendChild(text)

									var count = document.createElement("input")
										count.type = "number"
										count.step = 1
										count.min = 0
										count.className = "item-count editable"
										if (!enable) {
											count.setAttribute("readonly", true)
										}
										count.placeholder = "#"
										count.value = item.count
										count.addEventListener(TRIGGERS.change, submitCharacterUpdateItemUpdate)
									name.appendChild(count)

								// usage
									if (item.usage) {
										var usages = document.createElement("div")
											usages.className = "item-usages"
										block.appendChild(usages)

										for (var u in item.usage) {
											var usage = item.usage[u]
											
											if (usage.skill) {
												var skill = character.statistics[usage.statistic].skills.find(function(skill) { return skill.name == usage.skill }) || {maximum: 0, condition: 0}
											}

											var usageElement = document.createElement("div")
												usageElement.className = "item-usage"
											usages.appendChild(usageElement)

											var d6 = document.createElement("input")
												d6.type = "number"
												if (!enable) {
													d6.setAttribute("readonly", true)
												}
												d6.step = 1
												d6.min = 0
												d6.className = "d6 editable"
												if (skill.combat) {
													d6.className += " combat"
												}
												d6.placeholder = "d6"
												d6.addEventListener(TRIGGERS.change, submitCharacterUpdateItemUpdate)
												d6.addEventListener(TRIGGERS.click, submitRollGroupCreateD6)
												d6.value = usage.d6 || 0
											usageElement.appendChild(d6)

											var select = document.createElement("select")
												for (var s in RULES.skills) {
													var optgroup = document.createElement("optgroup")
														optgroup.label = s
													select.appendChild(optgroup)

													for (var k in RULES.skills[s]) {
														var option = document.createElement("option")
															option.value = RULES.skills[s][k].name
															option.innerText = RULES.skills[s][k].name.replace(/_/g, " ")
														optgroup.appendChild(option)
													}
												}
												if (!enable) {
													select.setAttribute("disabled", true)
												}
												select.className = "item-usage-skill editable"
												select.placeholder = "skill"
												select.value = usage.skill
												select.addEventListener(TRIGGERS.change, submitCharacterUpdateItemUpdate)
											usageElement.appendChild(select)

											var d20 = document.createElement("input")
												d20.type = "number"
												d20.setAttribute("readonly", true)
												d20.step = 1
												d20.className = "d20"
												d20.value = Math.max(0, character.statistics[usage.statistic].maximum + character.statistics[usage.statistic].damage + character.statistics[usage.statistic].condition + (usage.skill ? skill.maximum + skill.condition : 0) + (usage.modifier ? usage.modifier : 0))
												d20.addEventListener(TRIGGERS.click, submitRollGroupCreateD20)
											usageElement.appendChild(d20)
										}
									}

								// conditions
									if (item.conditions) {
										var conditions = document.createElement("div")
											conditions.className = "item-conditions"
										block.appendChild(conditions)

										for (var i in item.conditions) {
											var condition = document.createElement("div")
												condition.className = "item-condition"
											conditions.append(condition)

											var d6 = document.createElement("input")
												d6.type = "number"
												if (!enable) {
													d6.setAttribute("readonly", true)
												}
												d6.step = 1
												d6.min = 0
												d6.className = "d6 editable"
												d6.addEventListener(TRIGGERS.change, submitCharacterUpdateItemUpdate)
												d6.addEventListener(TRIGGERS.click, submitRollGroupCreateD6)
												d6.value = item.conditions[i] || 0
												d6.placeholder = "d6"
											condition.appendChild(d6)

											var select = document.createElement("select")
												for (var c in RULES.conditions) {
													var option = document.createElement("option")
														option.innerText = c.replace(/_/g, " ")
														option.value = c
													select.appendChild(option)
												}

												if (!enable) {
													select.setAttribute("disabled", true)
												}
												select.className = "item-condition-name editable"
												select.value = i
												select.addEventListener(TRIGGERS.change, submitCharacterUpdateItemUpdate)
											condition.appendChild(select)

											
											if (!item.conditions[i]) {
												select.className += " item-condition-remove"
											}
										}
									}

								// other info
									// weight
										var label = document.createElement("label")
											label.className = "item-info-label"
										block.appendChild(label)

										var input = document.createElement("input")
											input.type = "number"
											input.className = "item-info-input editable"
											input.placeholder = "weight"
											input.value = item.weight || 0
											input.setAttribute("field", "weight")
											input.addEventListener(TRIGGERS.change, submitCharacterUpdateItemUpdate)
											if (!enable) {
												input.setAttribute("readonly", true)
											}
										label.appendChild(input)

										var span = document.createElement("span")
											span.className = "item-info-label-text"
											span.innerText = "lbs"
										label.appendChild(span)

									// cost
										var label = document.createElement("label")
											label.className = "item-info-label"
										block.appendChild(label)

										var input = document.createElement("input")
											input.type = "number"
											input.className = "item-info-input editable"
											input.placeholder = "cost"
											input.value = item.cost || 0
											input.setAttribute("field", "cost")
											input.addEventListener(TRIGGERS.change, submitCharacterUpdateItemUpdate)
											if (!enable) {
												input.setAttribute("readonly", true)
											}
										label.appendChild(input)

										var span = document.createElement("span")
											span.className = "item-info-label-text"
											span.innerText = "❑"
										label.appendChild(span)

									// fuel
										var label = document.createElement("label")
											label.className = "item-info-label"
										block.appendChild(label)

										var input = document.createElement("input")
											input.type = "number"
											input.className = "item-info-input editable"
											input.placeholder = "fuel"
											input.value = item.fuel || 0
											input.setAttribute("field", "fuel")
											input.addEventListener(TRIGGERS.change, submitCharacterUpdateItemUpdate)
											if (!enable) {
												input.setAttribute("readonly", true)
											}
										label.appendChild(input)

										var span = document.createElement("span")
											span.className = "item-info-label-text"
											span.innerText = "d6 fuel"
										label.appendChild(span)

									// magnetic
										var label = document.createElement("label")
											label.className = "item-info-label"
										block.appendChild(label)

										var input = document.createElement("select")
											input.className = "item-info-input editable"
											input.setAttribute("field", "magnetic")
											input.addEventListener(TRIGGERS.change, submitCharacterUpdateItemUpdate)
											if (!enable) {
												input.setAttribute("disabled", true)
											}
										label.appendChild(input)

										var option = document.createElement("option")
											option.value = false
											option.innerText = "nonmagnetic"
											if (!item.magnetic) { option.selected = true }
										input.appendChild(option)

										var option = document.createElement("option")
											option.value = true
											option.innerText = "magnetic"
											if (item.magnetic) { option.selected = true }
										input.appendChild(option)

									// hands
										var label = document.createElement("label")
											label.className = "item-info-label"
										block.appendChild(label)

										var input = document.createElement("input")
											input.type = "number"
											input.className = "item-info-input editable"
											input.placeholder = "hands"
											input.value = item.hands || 0
											input.setAttribute("field", "hands")
											input.addEventListener(TRIGGERS.change, submitCharacterUpdateItemUpdate)
											if (!enable) {
												input.setAttribute("readonly", true)
											}
										label.appendChild(input)

										var span = document.createElement("span")
											span.className = "item-info-label-text"
											span.innerText = "handed"
										label.appendChild(span)

									// materials
										var label = document.createElement("label")
											label.className = "item-info-label"
										block.appendChild(label)

										var input = document.createElement("input")
											input.type = "text"
											input.className = "item-info-input editable"
											input.placeholder = "materials"
											input.value = item.materials || ""
											input.setAttribute("field", "materials")
											input.addEventListener(TRIGGERS.change, submitCharacterUpdateItemUpdate)
											if (!enable) {
												input.setAttribute("readonly", true)
											}
										label.appendChild(input)

								// description
									var description = document.createElement("textarea")
										if (!enable) {
											description.setAttribute("readonly", true)
										}
										description.className = "item-description editable"
										description.addEventListener(TRIGGERS.change, submitCharacterUpdateItemUpdate)
										description.placeholder = "description"
										description.value = ""
									block.appendChild(description)
									
									if (item.weapons)      { description.value += " | for use with " + item.weapons.join(", ")}
									if (item.recipe)       { description.value += " | recipe: " + JSON.stringify(item.recipe).replace(/{|}|"|:/g,"").replace(/,/g,", ")}
									if (item.costPerPound) { description.value += " | cost per pound: " + item.costPerPound + "❑"}
									if (item.description)  { description.value += " | " + item.description                    }

									description.value = description.value.slice(3)
							}

						// open all?
							if (enable) {
								ELEMENTS.character.items.element.setAttribute("open", true)
								event.preventDefault()
							}
					} catch (error) {console.log(error)}
				}

			/* displayCharacterConditions */
				function displayCharacterConditions(character, container) {
					try {
						// unset
							var conditionElements = Array.from(container.querySelectorAll(".condition"))
							for (var i in conditionElements) {
								conditionElements[i].remove()
							}

							var options = Array.from(ELEMENTS.character.conditions.select.querySelectorAll("option"))
							for (var i in options) {
								options[i].removeAttribute("disabled")
							}

						// loop through
							for (var i in character.info.status.conditions) {
								// data
									var condition = character.info.status.conditions[i]

								// container
									var conditionElement = document.createElement("div")
										conditionElement.className = "condition"
										conditionElement.setAttribute("value", condition.name)
									ELEMENTS.character.conditions.list.prepend(conditionElement)

								// name
									var name = document.createElement("div")
										name.className = "condition-name"
										name.innerText = condition.name.replace(/_/g, " ")
									conditionElement.appendChild(name)

								// description
									var description = document.createElement("div")
										description.className = "condition-description"
										description.innerText = condition.description || ""
									conditionElement.appendChild(description)

								// remove
									var remove = document.createElement("button")
										remove.className = "condition-remove"
										remove.innerText = "x"
										remove.addEventListener(TRIGGERS.click, submitCharacterUpdateConditionDelete)
									conditionElement.prepend(remove)

								// disable in select
									var conditionOption = ELEMENTS.character.conditions.select.querySelector("[value=" + condition.name + "]")
									if (conditionOption) {
										conditionOption.setAttribute("disabled", true)
									}
							}

						// disabled
							ELEMENTS.character.conditions.disabled.setAttribute("disabled", true)
							ELEMENTS.character.conditions.disabled.selected = true
					} catch (error) {console.log(error)}
				}

		/** submit - settings **/
			/* submitCharacterRead */
				function submitCharacterRead(event) {
					try {
						// value
							var value = ELEMENTS.character.settings.select.element.value

						// none
							if (value == ELEMENTS.character.settings.select.none.value) {
								var post = {
									action: "unreadCharacter",
									character: {
										userId: USER ? USER.id : null,
										gameId: GAME ? GAME.id : null,
										id: CHARACTER.id || null
									}
								}

								CHARACTER = null
								displayCharacter()
								displayCharacterList()
							}

						// upload
							else if (value == ELEMENTS.character.settings.select.upload.value) {
								submitCharacterCreateUpload()
								return
							}

						// new
							else if (value == ELEMENTS.character.settings.select.new.value) {
								// blank template
									if (ELEMENTS.character.settings.select.templates.value == ELEMENTS.character.settings.select.blank.value) {
										var post = {
											action: "createCharacter",
											character: {
												userId: USER ? USER.id : null,
												gameId: GAME ? GAME.id : null,
												template: {
													type: null,
													name: null
												}
											}
										}
									}

								// new from template
									else {
										var value = ELEMENTS.character.settings.select.templates.value
										var directory = value.slice(1,value.length - 1).split("-")
										var post = {
											action: "createCharacter",
											character: {
												userId: USER ? USER.id : null,
												gameId: GAME ? GAME.id : null,
												template: {
													type: directory[1],
													name: directory[2]
												}
											}
										}

										if (!post.character.template.type || !post.character.template.name) {
											FUNCTIONS.showToast({success: false, message: "invalid template selection"})
											return
										}
									}
							}
						
						// find in user
							else {
								var post = {
									action: "readCharacter",
									character: {
										userId: USER ? USER.id : null,
										gameId: GAME ? GAME.id : null,
										id: value
									}
								}
							}

						// validate
							if (!post.character.gameId) {
								FUNCTIONS.showToast({success: false, message: "no game selected"})
								return
							}

						// send socket request
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

			/* submitCharacterCreateUpload */
				function submitCharacterCreateUpload(event) {
					try {
						ELEMENTS.character.settings.upload.click()
						ELEMENTS.character.settings.upload.addEventListener(TRIGGERS.change, function(event) {
							if (ELEMENTS.character.settings.upload.value && ELEMENTS.character.settings.upload.value.length) {
								// start reading
									var reader = new FileReader()
										reader.readAsText(event.target.files[0])

								// end reading
									reader.onload = function(event) {
										var obj = String(event.target.result)
										try {
											// parse character
												var post = {
													action: "createCharacter",
													character: JSON.parse(obj)
												}

											// assign
												post.character.userId = USER ? USER.id : null
												post.character.gameId = GAME ? GAME.id : null

											// validate
												if (!post.character.gameId) {
													FUNCTIONS.showToast({success: false, message: "no game selected"})
													return
												}

											// send socket request
												SOCKET.send(JSON.stringify(post))
										}
										catch (error) {
											FUNCTIONS.showToast({success: false, message: "unable to read file"})
											return
										}
									}
							}
						})
					} catch (error) {console.log(error)}
				}

			/* submitCharacterCreateDuplicate */
				function submitCharacterCreateDuplicate(event) {
					try {
						// post
							var post = {
								action: "createCharacter",
								character: CHARACTER || null
							}

						// validate
							if (!post.character) {
								FUNCTIONS.showToast({success: false, message: "no character to duplicate"})
								return
							}

						// assign
							post.character.userId = USER ? USER.id : null
							post.character.gameId = GAME ? GAME.id : null

						// validate
							if (!post.character.gameId) {
								FUNCTIONS.showToast({success: false, message: "no game selected"})
								return
							}

						// send socket request
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

			/* submitCharacterDelete */
				function submitCharacterDelete(event) {
					try {
						// post
							var post = {
								action: "deleteCharacter",
								character: CHARACTER
							}

						// validate
							if (!post.character.id) {
								FUNCTIONS.showToast({success: false, message: "no character selected"})
								return
							}

						// send socket request
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

			/* submitCharacterUpdate */
				function submitCharacterUpdate(character) {
					try {
						// post
							var post = {
								action: "updateCharacterData",
								character: character
							}

						// validate
							if (!post.character || !post.character.id) {
								FUNCTIONS.showToast({success: false, message: "no character selected"})
								return	
							}
							if (!post.character.gameId) {
								FUNCTIONS.showToast({success: false, message: "no game selected"})
								return
							}

						// socket
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

			/* submitCharacterUpdateAccess */
				function submitCharacterUpdateAccess(event) {
					try {
						// post
							var post = {
								action: "updateCharacterAccess",
								character: {
									id: CHARACTER ? CHARACTER.id : null,
									userId: USER ? USER.id : null,
									gameId: GAME ? GAME.id : null,
									access: ELEMENTS.character.settings.access.select.element.value
								}
							}

						// validate
							if (!post.character || !post.character.id) {
								FUNCTIONS.showToast({success: false, message: "no character selected"})
								return	
							}
							if (!post.character.gameId) {
								FUNCTIONS.showToast({success: false, message: "no game selected"})
								return
							}
								
						// set
							if (post.character.access == ELEMENTS.character.settings.access.select.all.value) {
								post.character.access = null
							}
							if (post.character.access == ELEMENTS.character.settings.access.select.me.value) {
								post.character.access = USER.id
							}

						// send socket request
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

		/** submit - gameplay **/
			/* submitCharacterUpdateName */
				function submitCharacterUpdateName(event) {
					try {
						// update name
							CHARACTER.info.name = event.target.value

						// post
							var post = {
								action: "updateCharacterName",
								character: CHARACTER
							}

						// validate
							if (!post.character || !post.character.id) {
								FUNCTIONS.showToast({success: false, message: "no character selected"})
								return	
							}
							if (!post.character.gameId) {
								FUNCTIONS.showToast({success: false, message: "no game selected"})
								return
							}

						// send
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

			/* submitCharacterUpdateImage */
				function submitCharacterUpdateImage(event) {
					try {
						ELEMENTS.character.info.imageUpload.click()
						ELEMENTS.character.info.imageUpload.addEventListener(TRIGGERS.change, function(event) {
							if (ELEMENTS.character.info.imageUpload.value && ELEMENTS.character.info.imageUpload.value.length) {
								// start reading
									var file = ELEMENTS.character.info.imageUpload.files[0]
									var reader = new FileReader()
										reader.readAsBinaryString(file)

								// end reading
									reader.onload = function(event) {
										try {
											// parse character
												var post = {
													action: "uploadCharacterImage",
													character: CHARACTER
												}
												
												post.character.file = {
													name: file.name,
													data: event.target.result
												}

											// validate
												if (!post.character.id) {
													FUNCTIONS.showToast({success: false, message: "no character selected"})
													return
												}
												if (!post.character.file || !post.character.file.name || !post.character.file.data) {
													FUNCTIONS.showToast({success: false, message: "no image uploaded"})
													return
												}

											// send socket request
												FUNCTIONS.sendPost(post, function(response) {
													FUNCTIONS.showToast(response)
												})
										}
										catch (error) {
											console.log(error)
											FUNCTIONS.showToast({success: false, message: "unable to read image"})
											return
										}
									}
							}
						})
					} catch (error) {console.log(error)}
				}

			/* submitCharacterUpdateImageDelete */
				function submitCharacterUpdateImageDelete(event) {
					try {
						// change image
							CHARACTER.info.image = null

						// save
							submitCharacterUpdate(CHARACTER)
					} catch (error) {console.log(error)}
				}

			/* submitCharacterUpdateInfo */
				function submitCharacterUpdateInfo(event) {
					try {
						// name
							if (event.target.id == "character-info-name-text") {
								submitCharacterUpdateName(event)
								return
							}

						// race & sex
							if (event.target.id == "character-info-race") {
								submitCharacterUpdateRace({name: event.target.value.toLowerCase().trim()})
								return
							}
							else if (event.target.id == "character-info-sex") {
								CHARACTER.info.demographics.sex = event.target.value
							}

						// age, weight, height
							else if (event.target.id == "character-info-age") {
								CHARACTER.info.demographics.age = Math.max(0, Number(event.target.value))
							}
							else if (event.target.id == "character-info-weight") {
								CHARACTER.info.demographics.weight = Math.max(0, Number(event.target.value))
							}
							else if (event.target.id == "character-info-height") {
								CHARACTER.info.demographics.height = Math.max(0, Number(event.target.value))
							}

						// points
							else if (event.target.id == "character-info-points") {
								CHARACTER.info.status.points = Math.max(0, Number(event.target.value))
							}

						// description
							else if (event.target.id == "character-info-description") {
								CHARACTER.info.description = event.target.value
							}

						// save
							submitCharacterUpdate(CHARACTER)
					} catch (error) {console.log(error)}
				}

			/* submitCharacterUpdateRace */
				function submitCharacterUpdateRace(event) {
					try {
						// names
							var beforeName = CHARACTER.info.demographics.race || null
							var afterName = event.name

						// no change?
							if (beforeName == afterName) {
								return
							}

						// before race
							var beforeRace = RULES.races[beforeName] || {}

						// unset perks
							if (beforeRace) {
								// statistics
									for (var s in beforeRace.statistics) {
										CHARACTER.statistics[s].maximum -= beforeRace.statistics[s]
									}

								// skills
									for (var s in beforeRace.skills) {
										for (var i in beforeRace.skills[s]) {
											var skill = CHARACTER.statistics[s].skills.find(function(j) {
												return j.name == i
											})

											if (skill) {
												skill.maximum -= beforeRace.skills[s][i]

												if (!skill.maximum && !skill.unremovable) {
													CHARACTER.statistics[s].skills = CHARACTER.statistics[s].skills.filter(function(j) {
														return j.name !== i
													})
												}
											}
										}
									}

								// d6
									for (var d in beforeRace.d6changes) {
										var change = beforeRace.d6changes[d]
										var skill = CHARACTER.statistics[change.statistic].skills.find(function(s) {
											return s.name == change.skill
										})
										if (skill) {
											skill.d6 = Math.max((skill.d6 || 0) - change.d6, 0)
										}
									}
							}

						// after race
							var afterRace = event.data ? (event.data || {}) : RULES.races[afterName] || {}
								afterRace.name = afterName

						// set new perks
							if (afterRace) {
								// statistics
									for (var s in afterRace.statistics) {
										CHARACTER.statistics[s].maximum += afterRace.statistics[s]
									}

								// skills
									for (var s in afterRace.skills) {
										for (var i in afterRace.skills[s]) {
											var skill = CHARACTER.statistics[s].skills.find(function(j) {
												return j.name == i
											})

											if (skill) {
												skill.maximum += afterRace.skills[s][i]
											}
											else {
												var rulesSkill = RULES.skills[s].find(function(k) {
													return k.name == i
												})
												var skill = FUNCTIONS.duplicateObject(rulesSkill)
													skill.maximum = afterRace.skills[s][i]
													skill.condition = 0
												CHARACTER.statistics[s].skills.push(skill)
											}
										}
									}

								// d6
									for (var d in afterRace.d6changes) {
										var change = afterRace.d6changes[d]
										var skill = CHARACTER.statistics[change.statistic].skills.find(function(s) {
											return s.name == change.skill
										})
										if (skill) {
											skill.d6 = Math.max((skill.d6 || 0) + change.d6, 0)
										}
									}
							}

						// set new info
							CHARACTER.info.demographics.race = afterRace.name
							if (afterRace.info) {
								CHARACTER.info.demographics.age    = afterRace.info.age
								CHARACTER.info.demographics.height = afterRace.info.height
								CHARACTER.info.demographics.weight = afterRace.info.weight
							}

						// save
							submitCharacterUpdate(CHARACTER)
					} catch (error) {console.log(error)}
				}

			/* submitCharacterUpdateStatistic */
				function submitCharacterUpdateStatistic(event) {
					try {
						// get statistic
							var statistic = event.target.closest(".statistic").id.replace("character-", "")
						
						// update value
							var old = CHARACTER.statistics[statistic].maximum
							CHARACTER.statistics[statistic].maximum = Math.min(20, Math.max(0, Math.round(Number(event.target.value))))
						
						// update points
							var cost = (old - CHARACTER.statistics[statistic].maximum) * 28
							CHARACTER.info.status.points += cost

						// save
							submitCharacterUpdate(CHARACTER)
					} catch (error) {console.log(error)}
				}

			/* submitCharacterUpdateRules */
				function submitCharacterUpdateRules(event) {
					try {
						// no character
							if (!CHARACTER) {
								FUNCTIONS.showToast({success: false, message: "no character selected"})
								return
							}

						// get data
							var resultElement = event.target.closest(".search-result")
							var result = JSON.parse(resultElement.getAttribute("data") || "{}")

						// race
							if (result.type == "race") {
								submitCharacterUpdateRace(result)
								displayTool({target: ELEMENTS.tools.character})
								displayCharacterMode({target: ELEMENTS.character.modes.edit})
							}
							
						// skill
							else if (result.type == "skill") {
								submitCharacterUpdateSkillCreate(result)
								displayTool({target: ELEMENTS.tools.character})
								displayCharacterMode({target: ELEMENTS.character.modes.edit})
							}

						// item
							else if (result.type == "item") {
								submitCharacterUpdateItemCreate(result)
								displayTool({target: ELEMENTS.tools.character})
								displayCharacterMode({target: ELEMENTS.character.modes.items})
							}

						// condition
							else if (result.type == "condition") {
								submitCharacterUpdateConditionCreate(result)
								displayTool({target: ELEMENTS.tools.character})
								displayCharacterMode({target: ELEMENTS.character.modes.conditions})
							}
					} catch (error) {console.log(error)}
				}

			/* submitCharacterUpdateSkillCreate */
				function submitCharacterUpdateSkillCreate(event) {
					try {
						// from dropdown
							if (event.target) {
								var skillName = event.target.value.replace(/\s/g, "_")
								var statistic = event.target.id.replace("character-", "").replace("-select", "")
							}

						// from conditions
							else if (event.fromConditions) {
								var skillName = event.skillName
								var statistic = event.statistic
							}

						// from search result
							else {
								var skillName = event.name
								var statistic = event.data.statistic
								var skill = event.data
									skill.name = skillName
							}

						// already have it?
							if (CHARACTER.statistics[statistic].skills.find(function(k) { return k.name == skillName })) {
								return false
							}

						// add to skills
							if (!skill) {
								var skill = FUNCTIONS.duplicateObject(RULES.skills[statistic].find(function(k) {
									return k.name.includes(skillName)
								})) || {name: skillName}
							}
							skill.maximum = skill.condition = 0

							CHARACTER.statistics[statistic].skills.push(skill)

						// conditions ?
							if (event.fromConditions) {
								return
							}

						// regular add - loop through conditions
							for (var i in CHARACTER.info.status.conditions) {
								var condition = RULES.conditions[CHARACTER.info.status.conditions[i]]
								for (var e in condition.effects) {
									for (var s in condition.effects[e]) {
										if (s == skill.name) {
											CHARACTER.statistics[statistic].skills[CHARACTER.statistics[statistic].skills.length - 1].condition += condition.effects[e][s]
										}
									}
								}
							}

						// save
							submitCharacterUpdate(CHARACTER)
					} catch (error) {console.log(error)}
				}

			/* submitCharacterUpdateSkillUpdate */
				function submitCharacterUpdateSkillUpdate(event) {
					try {
						// get statistic
							var name = event.target.closest(".skill").querySelector(".skill-name-text").value.replace(/\s/g, "_")
							var statistic = event.target.closest(".statistic").id.replace("character-", "")
						
						// get skill
							var skill = CHARACTER.statistics[statistic].skills.find(function(s) {
								return s.name == name
							})

						// changing d6?
							if (event.target.className.includes("d6")) {
								// update d6
									skill.d6 = Math.max(0, Math.round(Number(event.target.value)))
							}

						// changing skill points?
							else {
								// set maximum
									var old = skill.maximum
									skill.maximum = Math.min(20, Math.max(0, Math.round(Number(event.target.value))))

								// update points
									var cost = (old - skill.maximum)
									CHARACTER.info.status.points += cost
							}

						// save
							submitCharacterUpdate(CHARACTER)
					} catch (error) {console.log(error)}
				}

			/* submitCharacterUpdateSkillDelete */
				function submitCharacterUpdateSkillDelete(event) {
					try {
						// from dropdown
							if (event.target) {
								var skillName = event.target.closest(".skill").querySelector(".skill-name-text").value
								var statistic = event.target.closest(".statistic").id.replace("character-", "")
							}

						// from conditions
							else if (event.fromConditions) {
								var skillName = event.skillName
								var statistic = event.statistic
							}

						// remove skill
							for (var i = 0; i < CHARACTER.statistics[statistic].skills.length; i++) {
								if (CHARACTER.statistics[statistic].skills[i].name == skillName.replace(/\s/g, "_")) {
									if (CHARACTER.statistics[statistic].skills[i].unremovable) {
										return
									}

									var cost = CHARACTER.statistics[statistic].skills[i].maximum
									CHARACTER.statistics[statistic].skills.splice(i, 1)
									break
								}
							}

						// update points
							CHARACTER.info.status.points += cost || 0

						// conditions ?
							if (event.fromConditions) {
								return
							}

						// save
							submitCharacterUpdate(CHARACTER)
					} catch (error) {console.log(error)}
				}

			/* submitCharacterUpdateItemCreate */
				function submitCharacterUpdateItemCreate(event) {
					try {
						// from dropdown
							if (event.target) {
								var name = event.target.value
								var category = event.target.querySelector("[value='" + event.target.value + "']").parentNode.label
								var item = FUNCTIONS.duplicateObject(RULES.items[category].find(function(i) {
									return i.name == name
								}))
							}

						// from search result
							else {
								var item = event.data
									item.name = event.name
							}

						// add to items
							item.id = FUNCTIONS.generateRandom()
							CHARACTER.items.push(item)

						// update burden
							CHARACTER.info.status.burden += ((item.weight || 0) * (item.count || 0))

						// save
							submitCharacterUpdate(CHARACTER)
					}
					catch (error) {console.log(error)}
				}

			/* submitCharacterUpdateItemUpdate */
				function submitCharacterUpdateItemUpdate(event) {
					try {
						// get item
							var id = event.target.closest(".item").id
							var item = CHARACTER.items.find(function(item) {
								return item.id == id
							})

						// count
							if (event.target.className.includes("item-count")) {
								item.count = Number(event.target.value)
							}

						// name
							if (event.target.className.includes("item-name-text")) {
								item.name = event.target.value
							}

						// skill
							else if (event.target.className.includes("item-usage-skill")) {
								var statistic = Object.keys(RULES.skills).find(function(stat) {
									return RULES.skills[stat].find(function(k) {
										return k.name.includes(event.target.value)
									})
								})

								if (statistic) {
									var usages = event.target.closest(".item-usages")
									var usage = event.target.closest(".item-usage")
									var index = Array.prototype.indexOf.call(usages.children, usage)
									item.usage[index].statistic = statistic
									item.usage[index].skill = event.target.value
								}
							}

						// d6
							else if (event.target.className.includes("d6")) {
								if (event.target.closest(".item-usage")) {
									var usages = event.target.closest(".item-usages")
									var usage = event.target.closest(".item-usage")
									var index = Array.prototype.indexOf.call(usages.children, usage)
									item.usage[index].d6 = Number(event.target.value)
								}
								else if (event.target.closest(".item-condition")) {
									item.conditions[event.target.closest(".item-condition").querySelector(".item-condition-name").value] = Number(event.target.value)
								}
								else {
									item.d6 = Number(event.target.value)
								}
							}

						// condition
							else if (event.target.className.includes("item-condition-name")) {
								var itemConditions = event.target.closest(".item").querySelectorAll(".condition")

								for (var x = 0; x < itemConditions.length; x++) {
									if (itemConditions[x].querySelector(".item-condition-name") == event.target) {
										break
									}
								}

								item.conditions[event.target.value] = item.conditions[Object.keys(item.conditions)[x]]
								delete item.conditions[Object.keys(item.conditions)[x]]
							}

						// info
							else if (event.target.className.includes("item-info-input")) {
								var field = event.target.getAttribute("field")
								if (event.target.type == "number") {
									item[field] = Number(event.target.value)
								}
								else if (event.target.value.toLowerCase() == "true") {
									item[field] = true
								}
								else if (event.target.value.toLowerCase() == "false") {
									item[field] = false
								}
								else {
									item[field] = event.target.value
								}
							}

						// description
							else if (event.target.className.includes("item-description")) {
								item.magnetic = false
								var description = []
								
								var list = event.target.value.split(" | ")
								for (var l in list) {
									if (list[l].toLowerCase().includes("for use with")) {
										var weapons = list[l].toLowerCase().replace("for use with", "").split(",")
											for (var w in weapons) {
												weapons[w] = weapons[w].trim()
											}
										item.weapons = weapons
									}
									else if (list[l].toLowerCase().includes("recipe:")) {
										var recipe = list[l].toLowerCase().replace("recipe:", "").trim().split(", ")
										item.recipe = {}
										for (var r in recipe) {
											recipe[r] = recipe[r].trim()
											if (["w", "r", "g", "b"].includes(recipe[r][0])) {
												item.recipe[recipe[r][0]] = Number(recipe[r].slice(1))
											}
										}
									}
									else if (list[l].toLowerCase().includes("cost per pound:")) {
										item.costPerPound = Number(list[l].toLowerCase().replace("cost per pound:", "").replace("❑", "").trim())
									}
									else {
										description.push(list[l])
									}
								}
								item.description = description.join(" | ")
							}

						// save
							submitCharacterUpdate(CHARACTER)
					} catch (error) {console.log(error)}
				}

			/* submitCharacterUpdateItemEquip */
				function submitCharacterUpdateItemEquip(event) {
					try {
						// get item
							var id = event.target.closest(".item").id
							var item = CHARACTER.items.find(function(item) {
								return item.id == id
							})

						// flip equipped
							item.equipped = !item.equipped
					
						// save
							submitCharacterUpdate(CHARACTER)
					}
					catch (error) {console.log(error)}
				}

			/* submitCharacterUpdateItemDelete */
				function submitCharacterUpdateItemDelete(event) {
					try {
						// item name
							var id = event.target.closest(".item").id

						// remove item
							for (var i = 0; i < CHARACTER.items.length; i++) {
								if (CHARACTER.items[i].id == id) {
									// update burden
										CHARACTER.info.status.burden -= (CHARACTER.items[i].weight * CHARACTER.items[i].count)

									// remove
										CHARACTER.items.splice(i, 1)
										break
								}
							}

						// save
							submitCharacterUpdate(CHARACTER)
					} catch (error) {console.log(error)}
				}

			/* submitCharacterUpdateConditionCreate	*/
				function submitCharacterUpdateConditionCreate(event) {
					try {
						// from dropdown
							if (event.target) {
								var conditionName = event.target.value
								var condition = RULES.conditions[conditionName] || {name: conditionName}
							}

						// from search result
							else {
								var conditionName = event.name
								var condition = event.data
									condition.name = conditionName
							}

						// apply condition
							if (!CHARACTER.info.status.conditions.includes(condition.name)) {
								// add to conditions array
									CHARACTER.info.status.conditions.push(condition)

								// add effects
									var effects = condition.effects
									for (var i in effects) {
										for (var j in effects[i]) {
											if (j == "statistic") {
												CHARACTER.statistics[i].condition += effects[i][j]
											}
											else {
												var skill = CHARACTER.statistics[i].skills.find(function (skill) { return skill.name == j })
												if (!skill) {
													submitCharacterUpdateSkillCreate({skillName: j, statistic: i, fromConditions: true})
													var skill = CHARACTER.statistics[i].skills.find(function (skill) { return skill.name == j })
												}

												skill.condition += effects[i][j]
											}
										}
									}
							}

						// save
							submitCharacterUpdate(CHARACTER)
					} catch (error) {console.log(error)}
				}

			/* submitCharacterUpdateConditionDelete */
				function submitCharacterUpdateConditionDelete(event) {
					try {
						// get condition
							var conditionName = event.target.parentNode.getAttribute("value")
							var condition = CHARACTER.info.status.conditions.find(function(c) {
								return c.name == conditionName
							}) || {name: conditionName}

						// remove from conditions array
							CHARACTER.info.status.conditions = CHARACTER.info.status.conditions.filter(function(c) {
								return c.name !== conditionName
							})

						// remove effects
							var effects = condition.effects
							for (var i in effects) {
								for (var j in effects[i]) {
									if (j == "statistic") {
										CHARACTER.statistics[i].condition -= effects[i][j]
									}
									else {
										var skill = CHARACTER.statistics[i].skills.find(function (skill) { return skill.name == j })
										if (skill) {
											skill.condition -= effects[i][j]

											if (!skill.maximum && !skill.unremovable) {
												submitCharacterUpdateSkillDelete({skillName: j, statistic: i, fromConditions: true})
											}
										}
									}
								}
							}

						// save
							submitCharacterUpdate(CHARACTER)
					} catch (error) {console.log(error)}
				}

			/* submitCharacterUpdateDamage */
				function submitCharacterUpdateDamage(event) {
					try {
						// change damage
							CHARACTER.info.status.damage = Number(event.target.value)

						// save
							submitCharacterUpdate(CHARACTER)
					} catch (error) {console.log(error)}
				}

			/* submitCharacterUpdateDamageStatistic */
				function submitCharacterUpdateDamageStatistic(event) {
					try {
						// change statistic
							var statistic = event.target.closest(".statistic").id.replace("character-", "")
							var difference = CHARACTER.statistics[statistic].damage - event.target.value
							CHARACTER.statistics[statistic].damage = Number(event.target.value)

						// change damage
							CHARACTER.info.status.damage += difference
							var outstandingDamage = 0
							for (var s in CHARACTER.statistics) {
								outstandingDamage += CHARACTER.statistics[s].damage
							}
							if (!outstandingDamage) {
								CHARACTER.info.status.damage = 0
							}

						// save
							submitCharacterUpdate(CHARACTER)
					} catch (error) {console.log(error)}
				}

	/*** CHAT ***/
		/** receive **/
			/* receiveChat */
				function receiveChat(messages) {
					try {
						// clear messages?
							if (messages.delete) {
								ELEMENTS.chat.messages.innerHTML = ""
								return
							}

						// display messages
							displayChat(messages)
					} catch (error) {console.log(error)}
				}

		/** display **/
			/* displayChatListRecipients */
				function displayChatListRecipients() {
					try {
						// remove existing
							var allValue = ELEMENTS.chat.send.recipients.all.value
							var recipientsList = Array.from(ELEMENTS.chat.send.recipients.select.querySelectorAll("option"))
							for (var i in recipientsList) {
								if (recipientsList[i].value !== allValue) {
									recipientsList[i].remove()
								}
							}

						// no game?
							if (!GAME) {
								ELEMENTS.chat.send.sender.select.value = ELEMENTS.chat.send.sender.user.value
								return
							}

						// loop through
							for (var i in GAME.users) {
								if (i == USER.id) { continue }
								var option = document.createElement("option")
									option.innerText = GAME.users[i].name
									option.value = GAME.users[i].id
								ELEMENTS.chat.send.recipients.select.appendChild(option)
							}
					} catch (error) {console.log(error)}
				}

			/* displayChat */
				function displayChat(messages) {
					try {
						// no new messages
							var newMessages = false

						// loop through messages
							for (var i in messages) {
								// already exists?
									if (ELEMENTS.chat.messages.querySelector("#chat-" + messages[i].id)) {
										continue
									}

								// search result
									if (messages[i].display.data) {
										newMessages = true
										displayRulesSearchResult(messages[i].display.data, ELEMENTS.chat.messages)
										continue
									}

								// content
									if (messages[i].display.content) {
										newMessages = true
										displayChatContent(messages[i].display.content)
										continue
									}

								// new
									newMessages = true
									displayChatMessage(messages[i])
							}

						// scroll
							ELEMENTS.chat.messages.scrollTop = 1000000

						// one message, and it's a sound?
							if (messages && messages.length == 1 && messages[0].display.content && messages[0].display.content.type == "audio") {
								var parent = ELEMENTS.chat.messages.querySelector("#chat-" + messages[0].display.content.id)
									parent.querySelector("audio").play()
							}

						// notification
							if (newMessages && ELEMENTS.structure.left.getAttribute("tool") !== "chat") {
								ELEMENTS.tools.notification.setAttribute("visibility", true)
							}
					} catch (error) {console.log(error)}
				}

			/* displayChatMessage */
				function displayChatMessage(message) {
					try {
						// element
							var messageElement = document.createElement("div")
								messageElement.className = "chat-message" + (message.recipientId ? " chat-secret" : "")
								messageElement.id = "chat-" + message.id
							ELEMENTS.chat.messages.appendChild(messageElement)

						// left
							var messageLeft = document.createElement("div")
								messageLeft.className = "chat-message-left"
							messageElement.appendChild(messageLeft)

							var messageName = document.createElement("div")
								messageName.className = "chat-message-name"
								messageName.innerText = message.display.sender
							messageLeft.appendChild(messageName)

							var messageTime = document.createElement("div")
								messageTime.className = "chat-message-time"
								messageTime.innerText = new Date(message.display.time).toLocaleTimeString()
							messageLeft.appendChild(messageTime)

						// text
							var messageText = document.createElement("div")
								messageText.className = "chat-message-text"
								messageText.innerText = message.display.text
							messageElement.appendChild(messageText)
					} catch (error) {console.log(error)}
				}

			/* displayChatContent */
				function displayChatContent(content) {
					try {
						// validate
							if (!content) {
								return
							}

						// element
							var messageElement = document.createElement("div")
								messageElement.className = "content-chat"
								messageElement.id = "chat-" + content.id
							ELEMENTS.chat.messages.appendChild(messageElement)
							
						// name
							var messageName = document.createElement("h3")
								messageName.className = "content-chat-name"
								messageName.innerText = content.name
							messageElement.appendChild(messageName)

						// open
							var messageButton = document.createElement("button")
								messageButton.className = "content-chat-button minor-button"
								messageButton.innerHTML = "&rarr;"
								messageButton.addEventListener(TRIGGERS.click, submitContentReadChat)
							messageElement.appendChild(messageButton)

						// arena
							if (content.type == "arena") {
								var messageDataContent = document.createElement("div")
									messageDataContent.className = "content-chat-data"
									messageDataContent.innerHTML = ""
								messageElement.appendChild(messageDataContent)
								return
							}

						// text
							if (content.type == "text") {
								var messageDataContent = document.createElement("div")
									messageDataContent.className = "content-chat-data"
									messageDataContent.innerHTML = content.text
								messageElement.appendChild(messageDataContent)
								return
							}

						// image
							if (content.type == "image") {
								var messageDataContent = document.createElement("img")
									messageDataContent.className = "content-chat-data content-image"
									messageDataContent.src = content.url ? (content.url + (content.file ? ("?" + new Date().getTime()) : "")) : "#"
								messageElement.appendChild(messageDataContent)
								return
							}

						// audio
							if (content.type == "audio") {
								var messageDataContent = document.createElement("audio")
									messageDataContent.className = "content-chat-data content-audio"
									messageDataContent.volume = USER.settings.volume || 0
									messageDataContent.setAttribute("controls", true)
								messageElement.appendChild(messageDataContent)

								var fileType = content.url.slice(-3).toLowerCase()

								var source = document.createElement("source")
									source.src = content.url
									source.setAttribute("type", "audio/" + (fileType == "wav" ? "wav" : fileType == "ogg" ? "ogg" : "mpeg"))
								messageDataContent.appendChild(source)
								return
							}

						// embed
							if (content.type == "embed") {
								var messageDataContent = document.createElement("div")
									messageDataContent.className = "content-chat-data"
									if (content.code) {
										messageDataContent.innerText = content.code
									}
									else if (content.url) {
										messageDataContent.innerHTML = `<a target="_blank" href="` + content.url + `">` + content.url + `</a>`
									}
								messageElement.appendChild(messageDataContent)
								return
							}

						// component
							if (content.type == "component") {
								try {
									var code = JSON.parse(content.code)
								} catch (error) {
									var code = {name: (content.text || "custom component"), type: "error", data: {error: "malformed JSON"}}
								}

								displayRulesSearchResult(code, ELEMENTS.chat.messages)
								return
							}
					} catch (error) {console.log(error)}
				}

		/** submit **/
			/* submitChatCreate */
				function submitChatCreate(event) {
					try {
						// post
							var post = {
								action: "createChat",
								chat: {
									userId: USER ? USER.id : null,
									gameId: GAME ? GAME.id : null,
									recipientId: ELEMENTS.chat.send.recipients.select.value,
									display: {
										sender: ELEMENTS.chat.send.sender.select.value,
										time: new Date().getTime(),
										text: ELEMENTS.chat.send.input.value
									}
								}
							}

						// validate
							if (!post.chat.display.text) {
								return
							}
							if (!post.chat.gameId) {
								FUNCTIONS.showToast({success: false, message: "no game selected"})
								return
							}

						// convert
							if (post.chat.recipientId == ELEMENTS.chat.send.recipients.all.value) {
								post.chat.recipientId = null
							}

							if (post.chat.display.sender == ELEMENTS.chat.send.sender.character.value) {
								post.chat.display.sender = CHARACTER ? CHARACTER.info.name : ELEMENTS.chat.send.sender.anonymous.value
							}
							if (post.chat.display.sender == ELEMENTS.chat.send.sender.user.value) {
								post.chat.display.sender = USER ? USER.name : ELEMENTS.chat.send.sender.anonymous.value
							}

						// clear input
							ELEMENTS.chat.send.input.value = ""

						// send socket request
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

			/* submitChatCreateRules */
				function submitChatCreateRules(event) {
					try {
						// post
							var post = {
								action: "createChat",
								chat: {
									userId: USER ? USER.id : null,
									gameId: GAME ? GAME.id : null,
									display: {
										data: JSON.parse(event.target.closest(".search-result").getAttribute("data"))
									}
								}
							}
						
						// validate
							if (!post.chat.gameId) {
								FUNCTIONS.showToast({success: false, message: "no game selected"})
								return
							}
							if (!post.chat.display.data) {
								FUNCTIONS.showToast({success: false, message: "invalid search result"})
								return
							}

						// send socket request
							SOCKET.send(JSON.stringify(post))
							displayTool({target: ELEMENTS.tools.chat})
					} catch (error) {console.log(error)}
				}

			/* submitChatCreateContent */
				function submitChatCreateContent(event) {
					try {
						// post
							var post = {
								action: "createChat",
								chat: {
									userId: USER ? USER.id : null,
									gameId: GAME ? GAME.id : null,
									display: {
										content: CONTENT
									}
								}
							}
						
						// validate
							if (!post.chat.gameId) {
								FUNCTIONS.showToast({success: false, message: "no game selected"})
								return
							}
							if (!post.chat.display.content) {
								FUNCTIONS.showToast({success: false, message: "invalid content"})
								return
							}

						// send socket request
							SOCKET.send(JSON.stringify(post))
							displayTool({target: ELEMENTS.tools.chat})
					} catch (error) {console.log(error)}
				}

	/*** CONTENT ***/
		/** receive **/
			/* receiveContent */
				function receiveContent(content, selectContent) {
					try {
						// selecting content?
							if (selectContent) {
								CONTENT = {id: selectContent}
							}

						// current content?
							if (CONTENT && CONTENT.id == content.id) {
								CONTENT = content.delete ? null : content
								displayContent()
							}

						// relist
							displayContentList()
					} catch (error) {console.log(error)}
				}

		/** display **/
			/* displayContent */
				function displayContent() {
					try {
						// no content?
							if (!CONTENT) {
								ELEMENTS.character.settings.recipient.arena.innerHTML = ""
							}

						// sidebar panel
							displayContentPanel()

						// gametable
							displayContentGametable()
					} catch (error) {console.log(error)}
				}

			/* displayContentPanel */
				function displayContentPanel() {
					try {
						// no content?
							if (!CONTENT) {
								ELEMENTS.content.element.setAttribute("mode", "none")
								return
							}

						// name
							ELEMENTS.content.name.input.value = CONTENT.name

						// access
							ELEMENTS.content.access.select.value = CONTENT.access ? ELEMENTS.content.access.me.value : ELEMENTS.content.access.all.value
							ELEMENTS.content.access.form.setAttribute("visibility", (CONTENT && CONTENT.id && CONTENT.userId == USER.id) ? true : false)

						// data
							ELEMENTS.content.url.input.value = CONTENT.url || null
							ELEMENTS.content.code.input.value = CONTENT.code || null

						// delete gate
							ELEMENTS.content.delete.gate.setAttribute("visibility", (CONTENT && CONTENT.id && CONTENT.userId == USER.id) ? true : false)

						// mode
							ELEMENTS.content.element.setAttribute("mode", CONTENT.type || "none")
					} catch (error) {console.log(error)}
				}

			/* displayContentGametable */
				function displayContentGametable() {
					try {
						// no content?
							if (!CONTENT || !CONTENT.type) {
								ELEMENTS.gametable.element.innerHTML = ""
								return
							}

						// arena
							if (CONTENT.type == "arena") {
								// content
									var arena = ELEMENTS.gametable.element.querySelector(".content-arena")
									if (!arena) {
										// canvas
											ELEMENTS.gametable.element.innerHTML = ""
												arena = document.createElement("canvas")
												arena.className = "content-arena"
												arena.addEventListener(TRIGGERS.mousedown, grabContent)
											ELEMENTS.gametable.element.appendChild(arena)

										// panning
											var directions = ["-y", "-y -x", "-x", "-x y", "y", "y x", "x", "x -y"]
											for (var i in directions) {
												var panningOverlay = document.createElement("div")
													panningOverlay.setAttribute("directions", directions[i])
													panningOverlay.className = "content-arena-panning"
													panningOverlay.addEventListener(TRIGGERS.mouseenter, startPanningContentArena)
													panningOverlay.addEventListener(TRIGGERS.mouseleave, stopPanningContentArena)
												ELEMENTS.gametable.element.appendChild(panningOverlay)
											}
									}

								// update
									ELEMENTS.gametable.canvas.element = arena
									ELEMENTS.gametable.canvas.context = ELEMENTS.gametable.canvas.element.getContext("2d")
									displayContentArena()
									return
							}

						// text
							if (CONTENT.type == "text") {
								// content
									var text = ELEMENTS.gametable.element.querySelector(".content-text")
									if (!text) {
										// contenteditable
											ELEMENTS.gametable.element.innerHTML = ""
												text = document.createElement("div")
												text.className = "content-text"
												text.setAttribute("contenteditable", true)
											ELEMENTS.gametable.element.appendChild(text)
									}

								// update
									if (text.innerHTML !== CONTENT.text) {
										text.innerHTML = CONTENT.text
									}
									return
							}

						// image
							if (CONTENT.type == "image") {
								// content
									var image = ELEMENTS.gametable.element.querySelector(".content-image")
									if (!image) {
										// grabbable image
											ELEMENTS.gametable.element.innerHTML = ""
												image = document.createElement("img")
												image.className = "content-image content-grabbable"
												image.addEventListener(TRIGGERS.mousedown, grabContent)
											ELEMENTS.gametable.element.appendChild(image)
									}

								// update
									if (CONTENT.url) {
										image.src = CONTENT.url + (CONTENT.file ? ("?" + new Date().getTime()) : "")
									}

								// zoom
									if (!CONTENT.zoom) {
										CONTENT.zoomPower = 0
										CONTENT.zoom = 1
									}
									return
							}

						// audio
							if (CONTENT.type == "audio") {
								// content
									var audio = ELEMENTS.gametable.element.querySelector(".content-audio")
									if (!audio) {
										// audio player
											ELEMENTS.gametable.element.innerHTML = ""
												audio = document.createElement("audio")
												audio.className = "content-audio"
												audio.volume = USER.settings.volume || 0
												audio.setAttribute("controls", true)
											ELEMENTS.gametable.element.appendChild(audio)
									}

								// update
									if (CONTENT.url) {
										// remove old source
											var source = audio.querySelector("source")
											if (source) { source.remove() }

										// add new source
											var fileType = CONTENT.url.slice(-3).toLowerCase()
												fileType = (fileType == "wav" ? "wav" : fileType == "ogg" ? "ogg" : "mpeg")
											var source = document.createElement("source")
												source.setAttribute("type", "audio/" + fileType)
												source.setAttribute("src", CONTENT.url)
											audio.appendChild(source)
									}
									return
							}

						// embed
							if (CONTENT.type == "embed") {
								// code
									if (CONTENT.code) {
										var embed = ELEMENTS.gametable.element.querySelector("div.content-embed")
										if (!embed) {
											// embedded html
												ELEMENTS.gametable.element.innerHTML = ""
													embed = document.createElement("div")
													embed.className = "content-embed"
												ELEMENTS.gametable.element.appendChild(embed)
										}

										if (embed.innerHTML !== CONTENT.code) {
											embed.innerHTML = CONTENT.code
										}
									}

								// url
									else if (CONTENT.url) {
										var embed = ELEMENTS.gametable.element.querySelector("iframe.content-embed")
										if (!embed) {
											// iframe
												ELEMENTS.gametable.element.innerHTML = ""
													embed = document.createElement("iframe")
													embed.className = "content-embed"
													embed.setAttribute("frameborder", "none")
												ELEMENTS.gametable.element.appendChild(embed)
										}

										if (embed.src !== CONTENT.url) {
											embed.src = CONTENT.url
										}
									}

								// neither
									else {
										ELEMENTS.gametable.element.innerHTML = ""
									}
									return
							}

						// component
							if (CONTENT.type == "component") {
								ELEMENTS.gametable.element.innerHTML = ""
							}
					} catch (error) {console.log(error)}
				}

			/* displayContentList */
				function displayContentList(contentList) {
					try {
						// close option?
							ELEMENTS.content.choose.select.none.disabled = (CONTENT && CONTENT.id) ? false : true
							if (!CONTENT) {
								ELEMENTS.content.choose.select.element.value = ELEMENTS.content.choose.select.new.value
							}
							displayContentListSelection()

						// no game?
							if (!GAME) {
								ELEMENTS.content.choose.select.arena.innerHTML = ""
								ELEMENTS.content.choose.select.text.innerHTML = ""
								ELEMENTS.content.choose.select.image.innerHTML = ""
								ELEMENTS.content.choose.select.audio.innerHTML = ""
								ELEMENTS.content.choose.select.embed.innerHTML = ""
								ELEMENTS.content.choose.select.component.innerHTML = ""
								return
							}

						// custom content, from list
							for (var i in contentList) {
								var content = contentList[i]
								var option = ELEMENTS.content.choose.select.element.querySelector("option[value='" + content.id + "']")
								if (option && content.delete) {
									if (ELEMENTS.content.choose.select.element.value == option.value) {
										ELEMENTS.content.choose.select.element.value = ELEMENTS.content.choose.select.new.value
									}
									option.remove()

									var contentOption = ELEMENTS.content.objects.images.querySelector("option[value='" + content.id + "']")
									if (contentOption) {
										contentOption.remove()
									}
									continue
								}

								if (option) {
									option.innerText = content.name
								}
								else {
									option = document.createElement("option")
									option.value = content.id
									option.innerText = content.name
									ELEMENTS.content.choose.select[content.type].appendChild(option)
								}

								if (CONTENT && CONTENT.id == content.id) {
									option.selected = true
									ELEMENTS.content.choose.select.element.value = content.id
									ELEMENTS.content.choose.select.element.className = "form-pair"
									ELEMENTS.content.choose.types.element.setAttribute("visibility", false)
								}

								// arena
									if (content.type == "image") {
										var contentOption = ELEMENTS.content.objects.images.querySelector("option[value='" + content.id + "']")
										if (contentOption && content.delete) {
											if (ELEMENTS.content.objects.select.value == contentOption.value) {
												ELEMENTS.content.objects.select.value = ELEMENTS.content.objects.blank.value
											}
											contentOption.remove()
										}
										else if (contentOption) {
											contentOption.innerText = content.name
										}
										else {
											contentOption = document.createElement("option")
											contentOption.value = content.id
											contentOption.innerText = content.name
											contentOption.setAttribute("type", "content")
											ELEMENTS.content.objects.images.appendChild(contentOption)
										}
									}
							}
					} catch (error) {console.log(error)}
				}

			/* displayContentListSelection */
				function displayContentListSelection(event) {
					try {
						// reveal
							if (ELEMENTS.content.choose.select.element.value == ELEMENTS.content.choose.select.new.value) {
								ELEMENTS.content.choose.types.element.setAttribute("visibility", true)
								ELEMENTS.content.choose.select.element.className = ""
								return
							}

						// hide
							ELEMENTS.content.choose.types.element.setAttribute("visibility", false)
							ELEMENTS.content.choose.select.element.className = "form-pair"
							return
					} catch (error) {console.log(error)}
				}

		/** display - arena **/
			/* displayContentArena */
				function displayContentArena() {
					try {
						// no arena
							if (!CONTENT || !CONTENT.arena || !ELEMENTS.gametable.canvas.element) {
								return
							}

						// clear old targeting
							var arenaObjectKeys = Object.keys(CONTENT.arena.objects)
							var targetingOptions = Array.from(ELEMENTS.character.settings.recipient.arena.querySelectorAll("option"))
							for (var i in targetingOptions) {
								if (!arenaObjectKeys.find(function(o) { return CONTENT.arena.objects[o].characterId == targetingOptions[i].value })) {
									targetingOptions[i].remove()
								}
							}
						
						// sidebar panel
							displayContentArenaPanel()

						// gametable
							displayContentArenaGametable()
					} catch (error) {console.log(error)}
				}

			/* displayContentArenaPanel */
				function displayContentArenaPanel() {
					try {
						// clear old sidebar
							var listingElements = Array.from(ELEMENTS.content.objects.list.querySelectorAll(".arena-object"))
							for (var i in listingElements) {
								if (!CONTENT.arena.objects[listingElements[i].id.replace("arena-object-", "")]) {
									listingElements[i].remove()
								}
							}

						// update sidebar
							for (var i in CONTENT.arena.objects) {
								displayContentArenaObjectListing(CONTENT.arena.objects[i])
							}
					} catch (error) {console.log(error)}
				}

			/* displayContentArenaObjectListing */
				function displayContentArenaObjectListing(object) {
					try {
						// listing
							var listing = ELEMENTS.content.objects.list.querySelector("#arena-object-" + object.id)

						// create
							if (!listing) {
								// block
									var listing = document.createElement("div")
										listing.id = "arena-object-" + object.id
										listing.className = "arena-object"
									ELEMENTS.content.objects.list.appendChild(listing)

								// inputs
									// visible
										var inputVisible = document.createElement("input")
											inputVisible.className = "arena-object-visible"
											inputVisible.setAttribute("property", "visible")
											inputVisible.type = "checkbox"
											inputVisible.addEventListener(TRIGGERS.change, submitContentArenaObjectUpdate)
										listing.appendChild(inputVisible)

									// z
										var upButton = document.createElement("button")
											upButton.className = "arena-object-up"
											upButton.innerHTML = "&uarr;"
											upButton.setAttribute("property", "z")
											upButton.value = "1"
											upButton.addEventListener(TRIGGERS.click, submitContentArenaObjectUpdate)
										listing.appendChild(upButton)

										var downButton = document.createElement("button")
											downButton.className = "arena-object-down"
											downButton.innerHTML = "&darr;"
											downButton.value = "-1"
											downButton.setAttribute("property", "z")
											downButton.addEventListener(TRIGGERS.click, submitContentArenaObjectUpdate)
										listing.appendChild(downButton)

									// remove
										var removeButton = document.createElement("button")
											removeButton.className = "arena-object-remove"
											removeButton.innerText = "x"
											removeButton.addEventListener(TRIGGERS.click, submitContentArenaObjectDelete)
										listing.appendChild(removeButton)

									// text
										var labelText = document.createElement("label")
											labelText.className = "arena-object-label arena-object-text"
										listing.appendChild(labelText)

										var inputText = document.createElement("input")
											inputText.className = "arena-object-input"
											inputText.setAttribute("property", "text")
											inputText.placeholder = "text"
											inputText.type = "text"
											inputText.addEventListener(TRIGGERS.change, submitContentArenaObjectUpdate)
										labelText.appendChild(inputText)

										var spanText = document.createElement("span")
											spanText.className = "arena-object-label-text"
											spanText.innerText = "text"
										labelText.appendChild(spanText)

									// x
										var labelX = document.createElement("label")
											labelX.className = "arena-object-label"
										listing.appendChild(labelX)

										var inputX = document.createElement("input")
											inputX.className = "arena-object-input"
											inputX.setAttribute("property", "x")
											inputX.placeholder = "x"
											inputX.step = 0.5
											inputX.type = "number"
											inputX.addEventListener(TRIGGERS.change, submitContentArenaObjectUpdate)
										labelX.appendChild(inputX)

										var spanX = document.createElement("span")
											spanX.className = "arena-object-label-text"
											spanX.innerText = "x"
										labelX.appendChild(spanX)

									// y
										var labelY = document.createElement("label")
											labelY.className = "arena-object-label"
										listing.appendChild(labelY)

										var inputY = document.createElement("input")
											inputY.className = "arena-object-input"
											inputY.setAttribute("property", "y")
											inputY.placeholder = "y"
											inputY.step = 0.5
											inputY.type = "number"
											inputY.addEventListener(TRIGGERS.change, submitContentArenaObjectUpdate)
										labelY.appendChild(inputY)

										var spanY = document.createElement("span")
											spanY.className = "arena-object-label-text"
											spanY.innerText = "y"
										labelY.appendChild(spanY)

									// width
										var labelWidth = document.createElement("label")
											labelWidth.className = "arena-object-label"
										listing.appendChild(labelWidth)

										var inputWidth = document.createElement("input")
											inputWidth.className = "arena-object-input"
											inputWidth.setAttribute("property", "width")
											inputWidth.placeholder = "width"
											inputWidth.step = 1
											inputWidth.min = 0
											inputWidth.type = "number"
											inputWidth.addEventListener(TRIGGERS.change, submitContentArenaObjectUpdate)
										labelWidth.appendChild(inputWidth)

										var spanWidth = document.createElement("span")
											spanWidth.className = "arena-object-label-text"
											spanWidth.innerText = "width"
										labelWidth.appendChild(spanWidth)

									// height
										var labelHeight = document.createElement("label")
											labelHeight.className = "arena-object-label"
										listing.appendChild(labelHeight)

										var inputHeight = document.createElement("input")
											inputHeight.className = "arena-object-input"
											inputHeight.setAttribute("property", "height")
											inputHeight.placeholder = "height"
											inputHeight.step = 1
											inputHeight.min = 0
											inputHeight.type = "number"
											inputHeight.addEventListener(TRIGGERS.change, submitContentArenaObjectUpdate)
										labelHeight.appendChild(inputHeight)

										var spanHeight = document.createElement("span")
											spanHeight.className = "arena-object-label-text"
											spanHeight.innerText = "height"
										labelHeight.appendChild(spanHeight)

									// corners
										var labelCorners = document.createElement("label")
											labelCorners.className = "arena-object-label"
										listing.appendChild(labelCorners)

										var inputCorners = document.createElement("input")
											inputCorners.className = "arena-object-input"
											inputCorners.setAttribute("property", "corners")
											inputCorners.step = 1
											inputCorners.min = 0
											inputCorners.max = 50
											inputCorners.type = "range"
											inputCorners.addEventListener(TRIGGERS.change, submitContentArenaObjectUpdate)
										labelCorners.appendChild(inputCorners)

										var spanCorners = document.createElement("span")
											spanCorners.className = "arena-object-label-text"
											spanCorners.innerText = "corners"
										labelCorners.appendChild(spanCorners)

									// rotation
										var labelRotation = document.createElement("label")
											labelRotation.className = "arena-object-label"
										listing.appendChild(labelRotation)

										var inputRotation = document.createElement("input")
											inputRotation.className = "arena-object-input"
											inputRotation.setAttribute("property", "rotation")
											inputRotation.step = 45
											inputRotation.min = 0
											inputRotation.max = 360
											inputRotation.type = "range"
											inputRotation.addEventListener(TRIGGERS.change, submitContentArenaObjectUpdate)
										labelRotation.appendChild(inputRotation)

										var spanRotation = document.createElement("span")
											spanRotation.className = "arena-object-label-text"
											spanRotation.innerText = "rotation"
										labelRotation.appendChild(spanRotation)

									// glow
										var labelGlow = document.createElement("label")
											labelGlow.className = "arena-object-label"
										listing.appendChild(labelGlow)

										var inputGlow = document.createElement("input")
											inputGlow.className = "arena-object-input"
											inputGlow.setAttribute("property", "glow")
											inputGlow.step = 0.01
											inputGlow.min = 0
											inputGlow.type = "number"
											inputGlow.addEventListener(TRIGGERS.change, submitContentArenaObjectUpdate)
										labelGlow.appendChild(inputGlow)

										var spanGlow = document.createElement("span")
											spanGlow.className = "arena-object-label-text"
											spanGlow.innerText = "glow"
										labelGlow.appendChild(spanGlow)

									// shadow
										var labelShadow = document.createElement("label")
											labelShadow.className = "arena-object-label"
										listing.appendChild(labelShadow)

										var inputShadow = document.createElement("input")
											inputShadow.className = "arena-object-input"
											inputShadow.setAttribute("property", "shadow")
											inputShadow.type = "color"
											inputShadow.addEventListener(TRIGGERS.change, submitContentArenaObjectUpdate)
										labelShadow.appendChild(inputShadow)

										var spanShadow = document.createElement("span")
											spanShadow.className = "arena-object-label-text"
											spanShadow.innerText = "shadow"
										labelShadow.appendChild(spanShadow)

									// opacity
										var labelOpacity = document.createElement("label")
											labelOpacity.className = "arena-object-label"
										listing.appendChild(labelOpacity)

										var inputOpacity = document.createElement("input")
											inputOpacity.className = "arena-object-input"
											inputOpacity.setAttribute("property", "opacity")
											inputOpacity.step = 0.01
											inputOpacity.min = 0
											inputOpacity.max = 1
											inputOpacity.type = "range"
											inputOpacity.addEventListener(TRIGGERS.change, submitContentArenaObjectUpdate)
										labelOpacity.appendChild(inputOpacity)

										var spanOpacity = document.createElement("span")
											spanOpacity.className = "arena-object-label-text"
											spanOpacity.innerText = "opacity"
										labelOpacity.appendChild(spanOpacity)

									// color
										var labelColor = document.createElement("label")
											labelColor.className = "arena-object-label"
										listing.appendChild(labelColor)

										var inputColor = document.createElement("input")
											inputColor.className = "arena-object-input"
											inputColor.setAttribute("property", "color")
											inputColor.type = "color"
											inputColor.addEventListener(TRIGGERS.change, submitContentArenaObjectUpdate)
										labelColor.appendChild(inputColor)

										var spanColor = document.createElement("span")
											spanColor.className = "arena-object-label-text"
											spanColor.innerText = "color"
										labelColor.appendChild(spanColor)

									// image
										var labelImage = document.createElement("label")
											labelImage.className = "arena-object-label arena-object-image"
										listing.appendChild(labelImage)

										var inputImage = document.createElement("input")
											inputImage.className = "arena-object-input"
											inputImage.setAttribute("property", "image")
											inputImage.placeholder = "image"
											inputImage.type = "text"
											inputImage.addEventListener(TRIGGERS.change, submitContentArenaObjectUpdate)
										labelImage.appendChild(inputImage)

										var spanImage = document.createElement("span")
											spanImage.className = "arena-object-label-text"
											spanImage.innerText = "image"
										labelImage.appendChild(spanImage)
							}

						// find
							else {
								var inputVisible = listing.querySelector("input[property='visible']")
								var inputText = listing.querySelector("input[property='text']")
								var inputX = listing.querySelector("input[property='x']")
								var inputY = listing.querySelector("input[property='y']")
								var inputWidth = listing.querySelector("input[property='width']")
								var inputHeight = listing.querySelector("input[property='height']")
								var inputCorners = listing.querySelector("input[property='corners']")
								var inputRotation = listing.querySelector("input[property='rotation']")
								var inputGlow = listing.querySelector("input[property='glow']")
								var inputShadow = listing.querySelector("input[property='shadow']")
								var inputOpacity = listing.querySelector("input[property='opacity']")
								var inputColor = listing.querySelector("input[property='color']")
								var inputImage = listing.querySelector("input[property='image']")
								var inputCharacter = listing.querySelector("select[property='character']")
							}

						// set values
							listing.style.order = object.z || 0
							inputVisible.checked = object.visible || false
							inputText.value = object.text || ""
							inputX.value = object.x || 0
							inputY.value = object.y || 0
							inputWidth.value = object.width || 0
							inputHeight.value = object.height || 0
							inputCorners.value = object.corners || 0
							inputRotation.value = object.rotation || 0
							inputGlow.value = object.glow || 0
							inputShadow.value = object.shadow || ELEMENTS.gametable.canvas.gridBackground
							inputOpacity.value = object.opacity || 0
							inputColor.value = object.color || ELEMENTS.gametable.canvas.gridColor
							inputImage.value = object.image || ""
							inputCharacter = object.character || "[none]"

						// targeting
							if (object.characterId) {
								if (!ELEMENTS.character.settings.recipient.arena.querySelector("option[value='" + object.characterId + "']")) {
									var targetOption = document.createElement("option")
										targetOption.value = object.characterId
										targetOption.innerText = object.text || "[?]"
									ELEMENTS.character.settings.recipient.arena.appendChild(targetOption)
								}
							}
					} catch (error) {console.log(error)}
				}

			/* displayContentArenaGametable */
				function displayContentArenaGametable() {
					try {
						// sort objects
							var sortedKeys = Object.keys(CONTENT.arena.objects) || []
								sortedKeys = sortedKeys.sort(function(a, b) {
									return CONTENT.arena.objects[a].z - CONTENT.arena.objects[b].z
								})

						// update images
							var unloadedCount = 0
							for (var i in sortedKeys) {
								var key = sortedKeys[i]
								var imageURL = CONTENT.arena.objects[key].image
								if (!imageURL) {
									continue
								}

								if (!ELEMENTS.gametable.canvas.images[key]) {
									ELEMENTS.gametable.canvas.images[key] = document.createElement("img")
								}

								if (ELEMENTS.gametable.canvas.images[key].getAttribute("src") !== imageURL) {
									unloadedCount++
									ELEMENTS.gametable.canvas.images[key].src = imageURL
									ELEMENTS.gametable.canvas.images[key].onload = ELEMENTS.gametable.canvas.images[key].onerror = function() {
										unloadedCount--
										if (!unloadedCount) { displayContentArenaCanvas(sortedKeys) }
									}
								}
							}

						// display canvas
							if (!unloadedCount) { displayContentArenaCanvas(sortedKeys) }
					} catch (error) {console.log(error)}
				}

			/* displayContentArenaCanvas */
				function displayContentArenaCanvas(sortedKeys) {
					try {
						// resize & clear canvas
							FUNCTIONS.resizeCanvas(ELEMENTS.gametable.canvas.element)
							FUNCTIONS.clearCanvas(ELEMENTS.gametable.canvas.element, ELEMENTS.gametable.canvas.context)
							FUNCTIONS.drawRectangle(ELEMENTS.gametable.canvas.element, ELEMENTS.gametable.canvas.context, 0, 0, ELEMENTS.gametable.canvas.element.width, ELEMENTS.gametable.canvas.element.height, {color: ELEMENTS.gametable.canvas.gridBackground})
							FUNCTIONS.translateCanvas(ELEMENTS.gametable.canvas.element, ELEMENTS.gametable.canvas.context, ELEMENTS.gametable.canvas.offsetX, ELEMENTS.gametable.canvas.offsetY)							

						// loop through to display
							for (var i in sortedKeys) {
								displayContentArenaObject(CONTENT.arena.objects[sortedKeys[i]])
							}

						// display grid
							displayContentArenaGrid()
					} catch (error) {console.log(error)}
				}

			/* displayContentArenaObject */
				function displayContentArenaObject(object) {
					try {
						// not visible?
							if (!object.visible) {
								return
							}

						// dimensions
							var cellSize = Math.round(ELEMENTS.gametable.canvas.cellSize)
							var x = (object.x - (object.width / 2)) * cellSize
							var y = (object.y - (object.height / 2)) * cellSize
							var rotateX = object.x * cellSize
							var rotateY = ELEMENTS.gametable.canvas.element.height - object.y * cellSize
							var width = object.width * cellSize
							var height = object.height * cellSize
							var options = {
								color: object.color,
								opacity: object.opacity,
								rotation: 1 * object.rotation
							}

						// corners
							var corners = Number(object.corners)
							if (corners) {
								var absoluteRadius = corners / 100 * (width + height) / 2
								options.radii = {
									topLeft: absoluteRadius,
									topRight: absoluteRadius,
									bottomRight: absoluteRadius,
									bottomLeft: absoluteRadius
								}
							}

						// shadow
							if (object.glow) {
								options.shadow = object.shadow
								options.blur = cellSize * object.glow
							}

						// image
							if (object.image) {
								options.image = ELEMENTS.gametable.canvas.images[object.id]
								FUNCTIONS.rotateCanvas(ELEMENTS.gametable.canvas.element, ELEMENTS.gametable.canvas.context, rotateX, rotateY, options.rotation, function() {
									FUNCTIONS.drawImage(ELEMENTS.gametable.canvas.element, ELEMENTS.gametable.canvas.context, x, y, width, height, options)
								})
							}

						// draw
							else {
								FUNCTIONS.rotateCanvas(ELEMENTS.gametable.canvas.element, ELEMENTS.gametable.canvas.context, rotateX, rotateY, options.rotation, function() {
									FUNCTIONS.drawRectangle(ELEMENTS.gametable.canvas.element, ELEMENTS.gametable.canvas.context, x, y, width, height, options)
								})
							}

						// text
							if (object.text) {
								FUNCTIONS.drawText(ELEMENTS.gametable.canvas.element, ELEMENTS.gametable.canvas.context, x + width / 2, y + height / 2, object.text, {color: ELEMENTS.gametable.canvas.gridColor, blur: cellSize / 10, shadow:ELEMENTS.gametable.canvas.gridBackground, size: cellSize / 2})
							}
					} catch (error) {console.log(error)}
				}

			/* displayContentArenaGrid */
				function displayContentArenaGrid() {
					try {
						// move canvas
							var halfWidth = Math.round(ELEMENTS.gametable.canvas.element.width / 2)
							var halfHeight = Math.round(ELEMENTS.gametable.canvas.element.height / 2)

						// edges
							var pannedLeft = Math.round(-ELEMENTS.gametable.canvas.offsetX - halfWidth)
							var pannedRight = Math.round(-ELEMENTS.gametable.canvas.offsetX + halfWidth)
							var pannedBottom = Math.round(-ELEMENTS.gametable.canvas.offsetY - halfHeight)
							var pannedTop = Math.round(-ELEMENTS.gametable.canvas.offsetY + halfHeight)

						// based on zoom
							var cellSize = Math.round(ELEMENTS.gametable.canvas.cellSize)

						// x
							for (var x = pannedLeft; x < pannedRight; x++) {
								if (x % cellSize == 0) {
									FUNCTIONS.drawLine(ELEMENTS.gametable.canvas.element, ELEMENTS.gametable.canvas.context, x, pannedBottom, x, pannedTop, {color: ELEMENTS.gametable.canvas.gridColor, opacity: 0.5})
								}
							}

						// y
							for (var y = pannedBottom; y < pannedTop; y++) {
								if (y % cellSize == 0) {
									FUNCTIONS.drawLine(ELEMENTS.gametable.canvas.element, ELEMENTS.gametable.canvas.context, pannedLeft, y, pannedRight, y, {color: ELEMENTS.gametable.canvas.gridColor, opacity: 0.5})
								}
							}

						// origin
							FUNCTIONS.drawCircle(ELEMENTS.gametable.canvas.element, ELEMENTS.gametable.canvas.context, 0, 0, (ELEMENTS.gametable.canvas.cellSize / 4), {color: ELEMENTS.gametable.canvas.gridColor, opacity: 0.5})
					} catch (error) {console.log(error)}
				}

		/** submit **/
			/* submitContentRead */
				function submitContentRead(event) {
					try {
						// select value
							var value = ELEMENTS.content.choose.select.element.value

						// none
							if (value == ELEMENTS.content.choose.select.none.value) {
								var post = {
									action: "unreadContent",
									content: {
										userId: USER ? USER.id : null,
										gameId: GAME ? GAME.id : null,
										id: CONTENT.id || null
									}
								}

								CONTENT = null
								displayContent()
								displayContentList()
							}

						// create
							else if (value == ELEMENTS.content.choose.select.new.value) {
								var post = {
									action: "createContent",
									content: {
										userId: USER ? USER.id : null,
										gameId: GAME ? GAME.id : null,
										type: ELEMENTS.content.choose.types.element.value
									}
								}

								if (!post.content.type) {
									FUNCTIONS.showToast({success: false, message: "invalid content type"})
									return
								}
							}

						// selection
							else {
								var post = {
									action: "readContent",
									content: {
										id: value,
										userId: USER ? USER.id : null,
										gameId: GAME ? GAME.id : null,
									}
								}
							}

						// send socket request
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

			/* submitContentReadChat */
				function submitContentReadChat(event) {
					try {
						// select value
							var value = event.target.closest(".content-chat").id.replace("chat-", "")

						// selection
							var post = {
								action: "readContent",
								content: {
									id: value,
									userId: USER ? USER.id : null,
									gameId: GAME ? GAME.id : null,
								}
							}

						// send socket request
							SOCKET.send(JSON.stringify(post))
							displayTool({target: ELEMENTS.tools.content})
					} catch (error) {console.log(error)}
				}

			/* submitContentUpdateName */
				function submitContentUpdateName(event) {
					try {
						// post
							var post = {
								action: "updateContentName",
								content: {
									id: CONTENT.id,
									userId: USER ? USER.id : null,
									gameId: GAME ? GAME.id : null,
									name: ELEMENTS.content.name.input.value
								}
							}

						// validate
							if (!post.content.id) {
								FUNCTIONS.showToast({success: false, message: "no content selected"})
								return
							}
							if (!post.content.name) {
								FUNCTIONS.showToast({success: false, message: "no name entered"})
								return
							}

						// send socket request
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

			/* submitContentUpdateAccess */
				function submitContentUpdateAccess(event) {
					try {
						// post
							var post = {
								action: "updateContentAccess",
								content: {
									id: CONTENT.id,
									userId: USER ? USER.id : null,
									gameId: GAME ? GAME.id : null,
									access: ELEMENTS.content.access.select.value
								}
							}

						// validate
							if (!post.content.id) {
								FUNCTIONS.showToast({success: false, message: "no content selected"})
								return
							}
							if (post.content.access == ELEMENTS.content.access.all.value) {
								post.content.access = null
							}
							if (post.content.access == ELEMENTS.content.access.me.value) {
								post.content.access = USER.id
							}

						// send socket request
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

			/* submitContentUpdateData */
				function submitContentUpdateData(event) {
					try {
						// post
							var post = {
								action: "updateContentData",
								content: {
									id: CONTENT.id,
									userId: USER ? USER.id : null,
									gameId: GAME ? GAME.id : null,
									url: ELEMENTS.content.url.input.value || null,
									code: ELEMENTS.content.code.input.value || null,
									text: CONTENT.type == "text" ? ELEMENTS.gametable.element.querySelector(".content-text").innerHTML : null
								}
							}

						// validate
							if (!post.content.id) {
								FUNCTIONS.showToast({success: false, message: "no content selected"})
								return
							}
							if (CONTENT.type == "embed" && !post.content.url && !post.content.code) {
								FUNCTIONS.showToast({success: false, message: "no url or embed code entered"})
								return
							}

						// send socket request
							SOCKET.send(JSON.stringify(post))
							FUNCTIONS.showToast({success: true, message: "content saved"})
					} catch (error) {console.log(error)}
				}

			/* submitContentUpdateFile */
				function submitContentUpdateFile(event) {
					try {
						ELEMENTS.content.upload.input.click()
						ELEMENTS.content.upload.input.addEventListener(TRIGGERS.change, function(event) {
							if (ELEMENTS.content.upload.input.value && ELEMENTS.content.upload.input.value.length) {
								// start reading
									var file = ELEMENTS.content.upload.input.files[0]
									var reader = new FileReader()
										reader.readAsBinaryString(file)

								// end reading
									reader.onload = function(event) {
										try {
											// parse character
												var post = {
													action: "uploadContentFile",
													content: {
														id: CONTENT.id,
														gameId: GAME ? GAME.id : null,
														userId: USER ? USER.id : null,
														type: CONTENT.type,
														name: CONTENT.name,
														file: {
															name: file.name,
															data: event.target.result
														}
													}
												}

											// validate
												if (!post.content.id || !post.content.type || !post.content.name) {
													FUNCTIONS.showToast({success: false, message: "no content selected"})
													return
												}
												if (!post.content.file || !post.content.file.name || !post.content.file.data) {
													FUNCTIONS.showToast({success: false, message: "no file uploaded"})
													return
												}

											// send socket request
												FUNCTIONS.sendPost(post, function(response) {
													FUNCTIONS.showToast(response)
												})
										}
										catch (error) {
											console.log(error)
											FUNCTIONS.showToast({success: false, message: "unable to read file"})
											return
										}
									}
							}
						})
					} catch (error) {console.log(error)}
				}

			/* submitContentCreateDuplicate */
				function submitContentCreateDuplicate(event) {
					try {
						// post
							var post = {
								action: "createContent",
								content: CONTENT || null
							}

						// validate
							if (!post.content) {
								FUNCTIONS.showToast({success: false, message: "no content to duplicate"})
								return
							}

						// assign
							post.content.userId = USER ? USER.id : null
							post.content.gameId = GAME ? GAME.id : null

						// validate
							if (!post.content.gameId) {
								FUNCTIONS.showToast({success: false, message: "no game selected"})
								return
							}

						// send socket request
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

			/* submitContentDelete */
				function submitContentDelete(event) {
					try {
						// post
							var post = {
								action: "deleteContent",
								content: {
									id: CONTENT.id,
									userId: USER ? USER.id : null,
									gameId: GAME ? GAME.id : null,
									name: CONTENT.name,
									url: CONTENT.url || null
								}
							}

						// validate
							if (!post.content.id) {
								FUNCTIONS.showToast({success: false, message: "no content selected"})
								return
							}

						// send socket request
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

		/** submit - arena **/
			/* submitContentArenaTurnOrder */
				function submitContentArenaTurnOrder(event) {
					try {
						// post
							var post = {
								action: "createTurnOrder",
								rollGroup: {
									userId: USER ? USER.id : null,
									gameId: GAME ? GAME.id : null,
									contentId: CONTENT ? CONTENT.id : null
								}
							}

						// validate
							if (!post.rollGroup || !post.rollGroup.gameId) {
								FUNCTIONS.showToast({success: false, message: "no game selected"})
							}
							if (!post.rollGroup || !post.rollGroup.contentId) {
								FUNCTIONS.showToast({success: false, message: "no content selected"})
							}

						// send
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

			/* submitContentArenaObjectCreate */
				function submitContentArenaObjectCreate(event) {
					try {
						// new object
							var post = {
								action: "updateContentData",
								content: {
									id: CONTENT.id,
									userId: USER ? USER.id : null,
									gameId: GAME ? GAME.id : null,
									arena: {
										objects: {
											new: true
										}
									}
								}
							}

						// character / image
							if (ELEMENTS.content.objects.select.value !== ELEMENTS.content.objects.blank.value) {
								var option = ELEMENTS.content.objects.select.querySelector("option[value='" + ELEMENTS.content.objects.select.value + "']")
								var type = option.getAttribute("type")
								post.content.arena.objects.new = {}
								post.content.arena.objects.new[type + "Id"] = ELEMENTS.content.objects.select.value
							}

						// validate
							if (!post.content.id) {
								FUNCTIONS.showToast({success: false, message: "no content selected"})
								return
							}

						// send socket request
							SOCKET.send(JSON.stringify(post))
							FUNCTIONS.showToast({success: true, message: "object added"})
					} catch (error) {console.log(error)}
				}

			/* submitContentArenaObjectUpdate */
				function submitContentArenaObjectUpdate(event) {
					try {
						// update object
							var post = {
								action: "updateContentData",
								content: {
									id: CONTENT.id,
									userId: USER ? USER.id : null,
									gameId: GAME ? GAME.id : null,
									arena: {
										objects: {}
									}
								}
							}

						// validate
							if (!post.content.id) {
								FUNCTIONS.showToast({success: false, message: "no content selected"})
								return
							}

						// specify object
							var id = event.target.closest(".arena-object").id.replace("arena-object-", "")
							if (!id) {
								FUNCTIONS.showToast({success: false, message: "no arena object selected"})
								return
							}
							post.content.arena.objects[id] = {}

						// set property
							var property = event.target.getAttribute("property")
							if (!property) {
								FUNCTIONS.showToast({success: false, message: "no property updated"})
								return
							}
							post.content.arena.objects[id][property] = (event.target.type == "checkbox") ? event.target.checked : event.target.value

						// send socket request
							SOCKET.send(JSON.stringify(post))
							FUNCTIONS.showToast({success: true, message: "object updated"})
					} catch (error) {console.log(error)}
				}

			/* submitContentArenaObjectDelete */
				function submitContentArenaObjectDelete(event) {
					try {
						// new object
							var post = {
								action: "updateContentData",
								content: {
									id: CONTENT.id,
									userId: USER ? USER.id : null,
									gameId: GAME ? GAME.id : null,
									arena: {
										objects: {
											delete: true,
										}
									}
								}
							}

						// validate
							if (!post.content.id) {
								FUNCTIONS.showToast({success: false, message: "no content selected"})
								return
							}

						// specify object
							var id = event.target.closest(".arena-object").id.replace("arena-object-", "")
							if (!id) {
								FUNCTIONS.showToast({success: false, message: "no arena object selected"})
								return
							}
							post.content.arena.objects[id] = true

						// send socket request
							SOCKET.send(JSON.stringify(post))
							FUNCTIONS.showToast({success: true, message: "object removed"})
					} catch (error) {console.log(error)}
				}

		/** controls **/
			/* grabContent */
				function grabContent(event) {
					try {
						// content?
							if (!CONTENT) {
								return
							}

						// prevent default
							event.preventDefault()

						// grabbing style
							ELEMENTS.body.setAttribute("grabbing", true)

						// get cursor
							var cursor = {
								x: (event.touches ? event.touches[0].clientX : event.clientX),
								y: (event.touches ? event.touches[0].clientY : event.clientY)
							}

						// arena
							if (CONTENT.type == "arena") {
								grabContentArenaObject(cursor)
								return
							}

						// get center
							var rectangle = event.target.getBoundingClientRect()
							var center = {
								x: (rectangle.left + (rectangle.width / 2)),
								y: (rectangle.top + (rectangle.height / 2))
							}

						// set as global
							ELEMENTS.gametable.grabbed = {
								element: event.target,
								grabOffset: {
									x: (cursor.x - center.x * CONTENT.zoom),
									y: (cursor.y - center.y * CONTENT.zoom)
								}
							}
					} catch (error) {console.log(error)}
				}

			/* moveContent */
				function moveContent(event) {
					try {
						// nothing grabbed
							if (!CONTENT || !ELEMENTS.gametable.grabbed) {
								return false
							}

						// get cursor
							var cursor = {
								x: (event.touches ? event.touches[0].clientX : event.clientX),
								y: (event.touches ? event.touches[0].clientY : event.clientY)
							}

						// arena
							if (ELEMENTS.gametable.grabbed.arenaObject) {
								moveContentArenaObject(cursor)
								return
							}

						// calculate offset
							var parentRectangle = ELEMENTS.gametable.grabbed.element.parentNode.getBoundingClientRect()
							var offset = {
								x: (cursor.x - ELEMENTS.gametable.grabbed.grabOffset.x),
								y: (cursor.y - ELEMENTS.gametable.grabbed.grabOffset.y)
							}
						
						// move content
							ELEMENTS.gametable.grabbed.element.style.left = (offset.x - parentRectangle.left) / CONTENT.zoom + "px"
							ELEMENTS.gametable.grabbed.element.style.top = (offset.y - parentRectangle.top) / CONTENT.zoom + "px"
					} catch (error) {console.log(error)}
				}

			/* ungrabContent */
				function ungrabContent(event) {
					try {
						// reset grabbing styling
							if (ELEMENTS.body.getAttribute("grabbing")) {
								ELEMENTS.body.removeAttribute("grabbing")
							}

						// arena
							if (ELEMENTS.gametable.grabbed && ELEMENTS.gametable.grabbed.arenaObject) {
								ungrabContentArenaObject()
								return
							}

						// ungrab
							ELEMENTS.gametable.grabbed = null
					} catch (error) {console.log(error)}
				}

			/* zoomContent */
				function zoomContent(event) {
					try {
						// no content
							if (!CONTENT) {
								return
							}

						// arena
							if (CONTENT.type == "arena") {
								zoomContentArena(event)
								return
							}

						// get submitter
							var modifier = Number(event.submitter.value) || 0
							CONTENT.zoomPower = modifier ? (CONTENT.zoomPower * 4 + modifier * 4) / 4 : 0
							CONTENT.zoom = Math.pow(2, CONTENT.zoomPower)
						
						// set zoom
							ELEMENTS.gametable.element.querySelector(".content-grabbable").style.zoom = CONTENT.zoom
					} catch (error) {console.log(error)}
				}

		/** controls - arena **/
			/* panContentArena */
				function panContentArena(event) {
					try {
						// get value
							var value = event.submitter.value
							var distance = Math.round(ELEMENTS.gametable.canvas.cellSize / 2) * (event.submitter.distance || 1)
						
						// adjust
							if (value.includes("x")) {
								ELEMENTS.gametable.canvas.offsetX += (value.includes("-") ? -distance : distance)
							}
							else if (value.includes("y")) {
								ELEMENTS.gametable.canvas.offsetY += (value.includes("-") ? -distance : distance)
							}

						// redraw
							displayContentArena()
					} catch (error) {console.log(error)}
				}

			/* startPanningContentArena */
				function startPanningContentArena(event) {
					try {
						// get direction
							var directions = event.target.getAttribute("directions").split(/\s/gi)

						// start loops
							for (var i in directions) {
								var direction = directions[i]
								ELEMENTS.gametable.canvas.panLoops[direction] = setInterval(function(direction) {
									panContentArena({submitter: {value: direction, distance: 0.1}})
								}, 10, direction)
							}
					} catch (error) {console.log(error)}
				}

			/* stopPanningContentArena */
				function stopPanningContentArena(event) {
					try {
						// get direction
							var directions = event.target.getAttribute("directions").split(/\s/gi)

						// stop loop
							for (var i in directions) {
								var direction = directions[i]
								clearInterval(ELEMENTS.gametable.canvas.panLoops[direction])
								delete ELEMENTS.gametable.canvas.panLoops[direction]
							}
					} catch (error) {console.log(error)}
				}

			/* grabContentArenaObject */
				function grabContentArenaObject(cursor) {
					try {
						// no content or canvas?
							if (!CONTENT || !ELEMENTS.gametable.canvas.element) {
								return
							}

						// get center
							var rectangle = ELEMENTS.gametable.canvas.element.getBoundingClientRect()
							var center = {
								x: (rectangle.left + (rectangle.width / 2)),
								y: (rectangle.top + (rectangle.height / 2))
							}

						// get offset
							var actualOffset = {
								x: cursor.x - center.x,
								y: cursor.y - center.y
							}

						// get coordinates
							var cellSize = Math.round(ELEMENTS.gametable.canvas.cellSize)
							var coordinates = {
								x: (actualOffset.x - Number(ELEMENTS.gametable.canvas.offsetX)) / cellSize,
								y: (actualOffset.y + Number(ELEMENTS.gametable.canvas.offsetY)) / cellSize * -1,
							}

						// sort keys
							var sortedKeys = Object.keys(CONTENT.arena.objects) || []
								sortedKeys = sortedKeys.sort(function(a, b) {
									return CONTENT.arena.objects[b].z - CONTENT.arena.objects[a].z
								})

						// loop through to find top-most object
							for (var i in sortedKeys) {
								var arenaObject = CONTENT.arena.objects[sortedKeys[i]]
								if (!arenaObject.visible) { continue }

								var xRadius = (arenaObject.width / 2)
								var yRadius = (arenaObject.height / 2)

								var top = Number(arenaObject.y) + yRadius
								var right = Number(arenaObject.x) + xRadius
								var bottom = Number(arenaObject.y) - yRadius
								var left = Number(arenaObject.x) - xRadius

								if ((left <= coordinates.x && coordinates.x <= right)
								 && (bottom <= coordinates.y && coordinates.y <= top)) {
									ELEMENTS.gametable.grabbed = {
										arenaObject: arenaObject
									}
									return
								}
							}
					} catch (error) {console.log(error)}
				}

			/* moveContentArenaObject */
				function moveContentArenaObject(cursor) {
					try {
						// no content or canvas?
							if (!CONTENT || !ELEMENTS.gametable.canvas.element) {
								return
							}

						// get center
							var rectangle = ELEMENTS.gametable.canvas.element.getBoundingClientRect()
							var center = {
								x: (rectangle.left + (rectangle.width / 2)),
								y: (rectangle.top + (rectangle.height / 2))
							}

						// get offset
							var actualOffset = {
								x: cursor.x - center.x,
								y: cursor.y - center.y
							}

						// get coordinates
							var cellSize = Math.round(ELEMENTS.gametable.canvas.cellSize)
							var coordinates = {
								x: (actualOffset.x - ELEMENTS.gametable.canvas.offsetX) / cellSize,
								y: (actualOffset.y + ELEMENTS.gametable.canvas.offsetY) / cellSize * -1,
							}

						// get object
							var arenaObject = ELEMENTS.gametable.grabbed.arenaObject
								arenaObject.x = Math.round(coordinates.x * 2) / 2
								arenaObject.y = Math.round(coordinates.y * 2) / 2

						// display
							displayContentArena()
					} catch (error) {console.log(error)}
				}

			/* ungrabContentArenaObject */
				function ungrabContentArenaObject() {
					try {
						// no content
							if (!CONTENT || !ELEMENTS.gametable.grabbed || !ELEMENTS.gametable.grabbed.arenaObject) {
								return
							}

						// post
							var post = {
								action: "updateContentData",
								content: {
									id: CONTENT.id,
									userId: USER ? USER.id : null,
									gameId: GAME ? GAME.id : null,
									arena: {
										objects: {}
									}
								}
							}

						// snap object
							var arenaObject = ELEMENTS.gametable.grabbed.arenaObject
							post.content.arena.objects[arenaObject.id] = {
								x: Math.round(arenaObject.x * 2) / 2,
								y: Math.round(arenaObject.y * 2) / 2
							}

						// unselect
							ELEMENTS.gametable.grabbed = null
						
						// send
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

			/* zoomContentArena */
				function zoomContentArena() {
					try {
						// get submitter
							var modifier = Number(event.submitter.value) || 0
							ELEMENTS.gametable.canvas.zoomPower = modifier ? (ELEMENTS.gametable.canvas.zoomPower * 4 + modifier * 4) / 4 : 0
							ELEMENTS.gametable.canvas.cellSize = 50 * Math.pow(2, ELEMENTS.gametable.canvas.zoomPower)
						
						// redraw
							displayContentArena()
					} catch (error) {console.log(error)}
				}
}
