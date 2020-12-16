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
			var CHARACTERLIST = window.CHARACTERLIST || null
			var CONTENT = window.CONTENT || null
			var CONTENTLIST = window.CONTENTLIST || null
			var SIGNALS = window.SIGNALS || {}
			var SOCKET = window.SOCKET = null
			var SOCKETCHECK = null

		/* regex */
			var PROTOCOLREGEX = /^(http|https|rtsp|ftp):\/\//i
			var URLREGEX = /((?:(http|https|rtsp|ftp):\/\/(?:(?:[a-z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-f0-9]{2})){1,64}(?:\:(?:[a-z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-f0-9]{2})){1,25})?\@)?)?((?:(?:[a-z0-9][a-z0-9\-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-f0-9]{2}))*)?(?:\b|$)/gi
			var IMAGEURLREGEX = /\.(jpeg|jpg|png|svg|gif|tiff|tif|bmp|iso|webp)(\?.*)?(\#.*)?$/i
			var AUDIOURLREGEX = /\.(aac|midi|wav|mid|mp3|oga|weba)(\?.*)?(\#.*)?$/i
			var YOUTUBEURLREGEX = /youtube\.com\/[a-zA-Z0-9]+/i

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

					// content code list
						displayContentListSamples()

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
							right: document.getElementById("right"),
							toggle: {
								form: document.getElementById("left-toggle-form"),
								close: document.getElementById("left-toggle-close"),
								open: document.getElementById("left-toggle-open")
							}
						}

					// special
						ELEMENTS.stream = {
							history: document.getElementById("stream-history"),
							rng: {
								form: document.getElementById("rng-form"),
								count: document.getElementById("rng-count"),
								d: document.getElementById("rng-d"),
								label: document.getElementById("rng-label")
							}
						}
						ELEMENTS.tools = {
							element: document.getElementById("tools"),
							form: document.getElementById("tools-form"),
							settings: document.getElementById("tools-settings"),
							settingsRadio: document.getElementById("tools-settings-radio"),
							rules: document.getElementById("tools-rules"),
							rulesRadio: document.getElementById("tools-rules-radio"),
							character: document.getElementById("tools-character"),
							characterRadio: document.getElementById("tools-character-radio"),
							chat: document.getElementById("tools-chat"),
							chatRadio: document.getElementById("tools-chat-radio"),
							content: document.getElementById("tools-content"),
							contentRadio: document.getElementById("tools-content-radio"),
							notification: document.getElementById("tools-chat-notification")
						}
						ELEMENTS.gametable = {
							element: document.getElementById("gametable"),
							focus: false,
							grabbed: null,
							selected: null,
							canvas: {
								element: null,
								context: null,
								offsetX: 0,
								offsetY: 0,
								cursorX: null,
								cursorY: null,
								moveStartX: null,
								moveStartY: null,
								moveOffsetX: null,
								moveOffsetY: null,
								measureStartX: null,
								measureStartY: null,
								zoomPower: 0,
								panLoops: {},
								cellSize: 50,
								gridColor: "#dddddd",
								gridBackground: "#555555",
								gridHighlight: "#5555aa",
								images: {}
							}
						}

					// settings
						ELEMENTS.settings = {
							element: document.getElementById("settings"),
							game: {
								element: document.getElementById("settings-game"),
								search: {
									title: document.getElementById("settings-game-search-title"),
									form: document.getElementById("settings-game-search-form"),
									input: document.getElementById("settings-game-search-input")
								},
								select: {
									element: document.getElementById("settings-game-select"),
									custom: document.getElementById("settings-game-select-custom"),
									none: document.getElementById("settings-game-select-none"),
									new: document.getElementById("settings-game-select-new")
								},
								name: {
									input: document.getElementById("settings-game-name-input")
								},
								players: {
									list: document.getElementById("settings-game-players-list")
								},
								banned: {
									element: document.getElementById("settings-game-banned"),
									list: document.getElementById("settings-game-banned-list")
								},
								data: {
									element: document.getElementById("settings-game-data")
								},
								clearChat: {
									form: document.getElementById("settings-game-clearChat-form")
								},
								clearRolls: {
									form: document.getElementById("settings-game-clearRolls-form")
								},
								delete: {
									gate: document.getElementById("settings-game-delete-gate"),
									form: document.getElementById("settings-game-delete-form")
								}
							},
							user: {
								element: document.getElementById("settings-user"),
								name: {
									input: document.getElementById("settings-user-name-input")
								},
								color: {
									input: document.getElementById("settings-user-color-input")
								},
								audio: {
									input: document.getElementById("settings-user-audio-input")
								},
								password: {
									form: document.getElementById("settings-user-password-form"),
									old: document.getElementById("settings-user-password-input-old"),
									new: document.getElementById("settings-user-password-input-new")
								},
								signout: {
									form: document.getElementById("settings-user-signout-form")
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
							results: document.getElementById("rules-results")
						}

					// character
						ELEMENTS.character = {
							element: document.getElementById("character"),
							choose: {
								element: document.getElementById("character-choose"),
								title: document.getElementById("character-choose-title"),
								upload: document.getElementById("character-choose-upload"),
								form: document.getElementById("character-choose-form"),
								select: {
									element: document.getElementById("character-choose-select"),
									mine: document.getElementById("character-choose-select-mine"),
									shared: document.getElementById("character-choose-select-shared"),
									upload: document.getElementById("character-choose-select-upload"),
									none: document.getElementById("character-choose-select-none"),
									new: document.getElementById("character-choose-select-new")
								}
							},
							settings: {
								element: document.getElementById("character-settings"),
								name: {
									form: document.getElementById("character-settings-name-form"),
									input: document.getElementById("character-settings-name-input")
								},
								access: {
									form: document.getElementById("character-settings-access-form"),
									select: {
										element: document.getElementById("character-settings-access-select"),
										public: document.getElementById("character-settings-access-select-public"),
										private: document.getElementById("character-settings-access-select-private")
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
								}
							},
							arena: {
								presets: document.getElementById("character-arena-presets"),
								preview: document.getElementById("character-arena-preview")
							},
							info: {
								element: document.getElementById("character-info"),
								race: document.getElementById("character-info-race"),
								raceDisabled: document.getElementById("character-info-race-disabled"),
								raceAbility: document.getElementById("character-info-race-ability"),
								sex: document.getElementById("character-info-sex"),
								age: document.getElementById("character-info-age"),
								height: document.getElementById("character-info-height"),
								weight: document.getElementById("character-info-weight"),
								points: document.getElementById("character-info-points"),
								run: document.getElementById("character-info-run"),
								move: document.getElementById("character-info-move"),
								swim: document.getElementById("character-info-swim"),
								jump: document.getElementById("character-info-jump"),
								throw: document.getElementById("character-info-throw"),
								carry: document.getElementById("character-info-carry"),
								burden: document.getElementById("character-info-burden"),
								description: document.getElementById("character-info-description")
							},
							status: {
								targeting: {
									form: document.getElementById("character-status-targeting-form"),
									select: {
										element: document.getElementById("character-status-targeting-select"),
										none: document.getElementById("character-status-targeting-select-none"),
										environment: document.getElementById("character-status-targeting-select-environment"),
										myCharacters: document.getElementById("character-status-targeting-select-characters-mine"),
										sharedCharacters: document.getElementById("character-status-targeting-select-characters-shared"),
										arena: document.getElementById("character-status-targeting-select-arena")
									}
								},
								recover: {
									form: document.getElementById("character-status-recover-form")
								},
								health: {
									form: document.getElementById("character-status-health-form"),
									input: document.getElementById("character-status-health-input")
								},
								damage: {
									form: document.getElementById("character-status-damage-form"),
									input: document.getElementById("character-status-damage-input")
								},
								conditions: {
									element: document.getElementById("character-status-conditions"),
									search: {
										form: document.getElementById("character-status-conditions-search-form")
									},
									select: document.getElementById("character-status-conditions-select"),
									list: document.getElementById("character-status-conditions-list")
								}
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
								dragging: null,
								equipped: {
									element: document.getElementById("character-items-equipped"),
									count: document.getElementById("character-items-equipped-count"),
									form: document.getElementById("character-items-equipped-form"),
									list: document.getElementById("character-items-equipped-list")
								},
								unequipped: {
									element: document.getElementById("character-items-unequipped"),
									count: document.getElementById("character-items-unequipped-count"),
									form: document.getElementById("character-items-unequipped-form"),
									list: document.getElementById("character-items-unequipped-list")
								},
								search: {
									form: document.getElementById("character-items-search-form")
								},
								select: document.getElementById("character-items-select")
							}
						}

					// chat
						ELEMENTS.chat = {
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
									all: document.getElementById("chat-send-recipients-all"),
									players: document.getElementById("chat-send-recipients-players")
								},
								input: document.getElementById("chat-send-input")
							}
						}

					// content
						ELEMENTS.content = {
							element: document.getElementById("content"),
							send: {
								form: document.getElementById("content-send-form")
							},
							add: {
								form: document.getElementById("content-add-form")
							},
							choose: {
								title: document.getElementById("content-choose-title"),
								form: document.getElementById("content-choose-form"),
								select: {
									element: document.getElementById("content-choose-select"),
									none: document.getElementById("content-choose-select-none"),
									new: {
										arena: document.getElementById("content-choose-select-new-arena"),
										text: document.getElementById("content-choose-select-new-text"),
										image: document.getElementById("content-choose-select-new-image"),
										audio: document.getElementById("content-choose-select-new-audio"),
										embed: document.getElementById("content-choose-select-new-embed"),
										component: document.getElementById("content-choose-select-new-component")
									},
									arena: document.getElementById("content-choose-select-arena"),
									text: document.getElementById("content-choose-select-text"),
									image: document.getElementById("content-choose-select-image"),
									audio: document.getElementById("content-choose-select-audio"),
									embed: document.getElementById("content-choose-select-embed"),
									component: document.getElementById("content-choose-select-component"),
								}
							},
							name: {
								input: document.getElementById("content-name-input")
							},
							access: {
								form: document.getElementById("content-access-form"),
								select: {
									element: document.getElementById("content-access-select"),
									public: document.getElementById("content-access-select-public"),
									private: document.getElementById("content-access-select-private")
								},
							},
							code: {
								input: document.getElementById("content-code-input"),
								select: document.getElementById("content-component-code-select"),
								sample: document.getElementById("content-component-code-sample"),
								search: {
									form: document.getElementById("content-component-code-search-form"),
									races: document.getElementById("content-component-code-select-races"),
									skills: document.getElementById("content-component-code-select-skills"),
									conditions: document.getElementById("content-component-code-select-conditions"),
									items: document.getElementById("content-component-code-select-items")
								}
							},
							url: {
								input: document.getElementById("content-url-input")
							},
							data: {
								form: document.getElementById("content-data-form")
							},
							// upload: {
							// 	form: document.getElementById("content-upload-form"),
							// 	input: document.getElementById("content-upload-input")
							// },
							duplicate: {
								form: document.getElementById("content-duplicate-form")
							},
							delete: {
								gate: document.getElementById("content-delete-gate"),
								form: document.getElementById("content-delete-form")
							},
							turnOrder: {
								form: document.getElementById("content-turn-order-form"),
								list: document.getElementById("content-turn-order-list")
							},
							controls: {
								zoom: {
									out: {
										form: document.getElementById("content-controls-zoom-out-form")
									},
									zero: {
										form: document.getElementById("content-controls-zoom-zero-form")
									},
									in: {
										form: document.getElementById("content-controls-zoom-in-form")
									}
								},
								pan: {
									left: {
										form: document.getElementById("content-controls-pan-left-form")
									},
									up: {
										form: document.getElementById("content-controls-pan-up-form")
									},
									down: {
										form: document.getElementById("content-controls-pan-down-form")
									},
									right: {
										form: document.getElementById("content-controls-pan-right-form")
									}
								}
							},
							objects: {
								search: {
									form: document.getElementById("content-objects-search-form")
								},
								select: {
									element: document.getElementById("content-objects-select"),
									blank: document.getElementById("content-objects-select-blank"),
									myCharacters: document.getElementById("content-objects-select-characters-mine"),
									sharedCharacters: document.getElementById("content-objects-select-characters-shared"),
									images: document.getElementById("content-objects-select-images")
								},
								list: document.getElementById("content-objects-list")
							}
						}
				} catch (error) {console.log(error)}
			}

		/* attachListeners */
			function attachListeners() {
				try {
					// stream
						ELEMENTS.stream.rng.form.addEventListener(TRIGGERS.submit, submitRollGroupCreateCustom)

					// tools
						ELEMENTS.structure.toggle.form.addEventListener(TRIGGERS.submit, displaySidebar)
						ELEMENTS.tools.form.addEventListener(TRIGGERS.change, displayTool)

					// gametable
						ELEMENTS.body.addEventListener(TRIGGERS.keydown, nudgeContentArenaObject)

					// settings
						ELEMENTS.settings.game.search.form.addEventListener(TRIGGERS.submit, submitGameRead)
						ELEMENTS.settings.game.name.input.addEventListener(TRIGGERS.change, submitGameUpdateName)
						ELEMENTS.settings.game.clearChat.form.addEventListener(TRIGGERS.submit, submitGameUpdateChatDelete)
						ELEMENTS.settings.game.clearRolls.form.addEventListener(TRIGGERS.submit, submitGameUpdateRollsDelete)
						ELEMENTS.settings.game.delete.form.addEventListener(TRIGGERS.submit, submitGameDelete)
						ELEMENTS.settings.user.name.input.addEventListener(TRIGGERS.change, submitUserUpdateName)
						ELEMENTS.settings.user.color.input.addEventListener(TRIGGERS.change, submitUserUpdateColor)
						ELEMENTS.settings.user.audio.input.addEventListener(TRIGGERS.change, submitUserUpdateVolume)
						ELEMENTS.settings.user.password.old.addEventListener(TRIGGERS.change, submitUserUpdatePassword)
						ELEMENTS.settings.user.password.new.addEventListener(TRIGGERS.change, submitUserUpdatePassword)
						ELEMENTS.settings.user.signout.form.addEventListener(TRIGGERS.submit, submitUserUpdateSignout)

					// rules
						ELEMENTS.rules.search.form.addEventListener(TRIGGERS.submit, submitRulesSearch)

					// character
						ELEMENTS.character.choose.form.addEventListener(TRIGGERS.submit, submitCharacterRead)
						ELEMENTS.character.settings.download.form.addEventListener(TRIGGERS.submit, displayCharacterDownload)
						ELEMENTS.character.settings.name.input.addEventListener(TRIGGERS.change, submitCharacterUpdateName)
						ELEMENTS.character.settings.access.select.element.addEventListener(TRIGGERS.change, submitCharacterUpdateAccess)
						ELEMENTS.character.settings.duplicate.form.addEventListener(TRIGGERS.submit, submitCharacterCreateDuplicate)
						ELEMENTS.character.settings.delete.form.addEventListener(TRIGGERS.submit, submitCharacterDelete)
						ELEMENTS.character.info.element.querySelectorAll(".editable").forEach(function(element) { element.addEventListener(TRIGGERS.change, submitCharacterUpdateInfo) })
						ELEMENTS.character.status.recover.form.addEventListener(TRIGGERS.submit, submitCharacterUpdateDamage)
						ELEMENTS.character.status.health.form.addEventListener(TRIGGERS.submit, submitCharacterUpdateDamage)
						ELEMENTS.character.status.damage.form.addEventListener(TRIGGERS.submit, submitCharacterUpdateDamage)
						ELEMENTS.character.status.conditions.search.form.addEventListener(TRIGGERS.submit, submitCharacterUpdateConditionCreate)
						ELEMENTS.character.element.querySelectorAll(".statistic-current").forEach(function(d20) { d20.addEventListener(TRIGGERS.click, submitRollGroupCreateD20) })
						ELEMENTS.character.element.querySelectorAll(".statistic-maximum").forEach(function(statistic) { statistic.addEventListener(TRIGGERS.change, submitCharacterUpdateStatistic) })
						ELEMENTS.character.element.querySelectorAll(".statistic .option-search-form").forEach(function(form) { form.addEventListener(TRIGGERS.submit, submitCharacterUpdateSkillCreate) })
						ELEMENTS.character.element.querySelectorAll(".statistic-damage").forEach(function(element) { element.addEventListener(TRIGGERS.change, submitCharacterUpdateDamageStatistic) })
						ELEMENTS.character.items.search.form.addEventListener(TRIGGERS.submit, submitCharacterUpdateItemCreate)
						ELEMENTS.character.items.equipped.form.addEventListener(TRIGGERS.submit, displayCharacterItemMode)
						ELEMENTS.character.items.unequipped.form.addEventListener(TRIGGERS.submit, displayCharacterItemMode)
						ELEMENTS.character.arena.presets.querySelectorAll("input").forEach(function(element) { element.addEventListener(TRIGGERS.change, submitCharacterUpdateArenaPresets) })
						ELEMENTS.character.arena.presets.querySelectorAll("select").forEach(function(element) { element.addEventListener(TRIGGERS.change, submitCharacterUpdateArenaPresets) })

					// chat
						ELEMENTS.chat.send.form.addEventListener(TRIGGERS.submit, submitChatCreate)

					// content
						ELEMENTS.content.choose.form.addEventListener(TRIGGERS.submit, submitContentRead)
						ELEMENTS.content.add.form.addEventListener(TRIGGERS.submit, submitCharacterUpdateRules)
						ELEMENTS.content.send.form.addEventListener(TRIGGERS.submit, submitChatCreateContent)
						ELEMENTS.content.name.input.addEventListener(TRIGGERS.change, submitContentUpdateName)
						ELEMENTS.content.access.select.element.addEventListener(TRIGGERS.change, submitContentUpdateAccess)
						ELEMENTS.content.duplicate.form.addEventListener(TRIGGERS.submit, submitContentCreateDuplicate)
						ELEMENTS.content.delete.form.addEventListener(TRIGGERS.submit, submitContentDelete)
						ELEMENTS.content.url.input.addEventListener(TRIGGERS.change, submitContentUpdateData)
						ELEMENTS.content.data.form.addEventListener(TRIGGERS.submit, submitContentUpdateData)
						ELEMENTS.content.code.input.addEventListener(TRIGGERS.change, submitContentUpdateData)
						ELEMENTS.content.code.search.form.addEventListener(TRIGGERS.submit, submitContentComponentSearch)
						// ELEMENTS.content.upload.form.addEventListener(TRIGGERS.submit, submitContentUpdateFile)
						ELEMENTS.content.turnOrder.form.addEventListener(TRIGGERS.submit, submitRollGroupCreateTurnOrder)
						ELEMENTS.content.controls.zoom.in.form.addEventListener(TRIGGERS.submit, zoomContent)
						ELEMENTS.content.controls.zoom.zero.form.addEventListener(TRIGGERS.submit, zoomContent)
						ELEMENTS.content.controls.zoom.out.form.addEventListener(TRIGGERS.submit, zoomContent)
						ELEMENTS.content.controls.pan.left.form.addEventListener(TRIGGERS.submit, panContentArena)
						ELEMENTS.content.controls.pan.up.form.addEventListener(TRIGGERS.submit, panContentArena)
						ELEMENTS.content.controls.pan.down.form.addEventListener(TRIGGERS.submit, panContentArena)
						ELEMENTS.content.controls.pan.right.form.addEventListener(TRIGGERS.submit, panContentArena)
						ELEMENTS.content.objects.search.form.addEventListener(TRIGGERS.submit, submitContentArenaObjectCreate)

					// special
						ELEMENTS.body.addEventListener(TRIGGERS.mousemove, moveContent)
						ELEMENTS.body.addEventListener(TRIGGERS.mouseup, ungrabContent)
						window.addEventListener(TRIGGERS.resize, displayContentArena)

					// select search
						var selectSearchInputs = Array.from(ELEMENTS.body.querySelectorAll(".option-search-input"))
							selectSearchInputs.forEach(function(input) {
								input.addEventListener(TRIGGERS.input, FUNCTIONS.searchSelect)
								input.addEventListener(TRIGGERS.focus, FUNCTIONS.searchSelect)
								input.addEventListener(TRIGGERS.blur, FUNCTIONS.cancelSearch)
							})
						var selectSearchCancels = Array.from(ELEMENTS.body.querySelectorAll(".option-search-form"))
							selectSearchCancels.forEach(function(form) {
								form.addEventListener(TRIGGERS.reset, FUNCTIONS.cancelSearch)
							})
						var selectSearchCloses = Array.from(ELEMENTS.body.querySelectorAll(".option-search-close-form"))
							selectSearchCloses.forEach(function(form) {
								form.addEventListener(TRIGGERS.submit, FUNCTIONS.selectOption)
							})
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
								receiveCharacter(data.character)
							}

						// characterList
							if (data.characterList && FUNCTIONS.isDifferent(CHARACTERLIST, data.characterList)) {
								displayCharacterList(data.characterList)
							}

					// content
						// content
							if (data.content) {
								receiveContent(data.content)
							}

						// contentList
							if (data.contentList && FUNCTIONS.isDifferent(CONTENTLIST, data.contentList)) {
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
			/* displaySidebar */
				function displaySidebar(event) {
					try {
						// toggle current left status
							if (ELEMENTS.structure.left.getAttribute("closed")) {
								ELEMENTS.structure.left.removeAttribute("closed")
								ELEMENTS.structure.right.removeAttribute("full")
								ELEMENTS.structure.toggle.close.focus()
							}
							else {
								ELEMENTS.structure.left.setAttribute("closed", true)
								ELEMENTS.structure.right.setAttribute("full", true)
								ELEMENTS.structure.toggle.open.focus()
							}

						// arena?
							if (CONTENT && CONTENT.arena) {
								setTimeout(function() {
									displayContentArena()
								}, 500)
							}
					} catch (error) {console.log(error)}
				}

			/* displayTool */
				function displayTool(event) {
					try {
						// no target?
							if (!event || !event.target) {
								return false
							}

						// get tool
							var tool = event.target.value

						// check for game
							if ((tool == "character" || tool == "chat" || tool == "content") && !GAME) {
								FUNCTIONS.showToast({success: false, message: "no game selected"})
								displayTool({target: ELEMENTS.tools.settingsRadio, forceSet: true})
								return false
							}

						// force set
							if (event.forceSet) {
								event.target.checked = true
							}

						// switch
							ELEMENTS.structure.left.setAttribute("tool", tool)
							if (ELEMENTS.structure.left.getAttribute("closed")) {
								ELEMENTS.structure.left.removeAttribute("closed")
								ELEMENTS.structure.right.removeAttribute("full")

								// arena?
									if (CONTENT && CONTENT.arena) {
										setTimeout(function() {
											displayContentArena()
										}, 500)
									}
							}

						// chat notification & scroll
							if (tool == "chat") {
								ELEMENTS.tools.notification.setAttribute("visibility", false)
								ELEMENTS.chat.messages.scrollTop = ELEMENTS.chat.messages.scrollHeight
							}

						// character preset
							if (tool == "character" && CHARACTER) {
								displayCharacterArenaPresets(CHARACTER)
							}
					} catch (error) {console.log(error)}
				}

	/*** SETTINGS - GAME ***/
		/** receive **/
			/* receiveGame */
				function receiveGame(game) {
					try {
						// selecting game?
							if ((!GAME || GAME.id !== game.id) && (USER.gameId == game.id)) {
								GAME = {id: USER.gameId}
							}

						// current game?
							if (GAME && GAME.id == game.id) {
								GAME = game.delete ? null : game
							}

						// display
							displayGame()
							displayGameList()
					} catch (error) {console.log(error)}
				}

		/** display **/
			/* displayGame */
				function displayGame() {
					try {
						// no game?
							if (!GAME) {
								// clear stream & chat
									ELEMENTS.stream.history.innerHTML = ""
									ELEMENTS.chat.messages.innerHTML = ""
								
								// clear content
									CONTENT = null
									displayContent()
									displayContentList()

								// clear character
									CHARACTER = null
									displayCharacter()
									displayCharacterList()
							}

						// mode
							ELEMENTS.body.setAttribute("mode", GAME ? "game" : "none")

						// relist chat
							displayChatListSenders()
							displayChatListRecipients()

						// display game settings
							displayGameSettings()
							displayGamePlayers()
					} catch (error) {console.log(error)}
				}

			/* displayGameSettings */
				function displayGameSettings() {
					try {
						// no game
							if (!GAME || !GAME.id) {
								ELEMENTS.settings.game.search.title.innerText = ""
								ELEMENTS.settings.game.name.input.value = ""
								return
							}

						// owned by another player
							if (GAME.userId !== USER.id) {
								ELEMENTS.settings.game.search.title.innerText = GAME.name
								ELEMENTS.settings.game.name.input.setAttribute("disabled", true)
								ELEMENTS.settings.game.name.input.value = GAME.name
								ELEMENTS.settings.game.banned.element.setAttribute("visibility", false)
								ELEMENTS.settings.game.data.element.setAttribute("visibility", false)
							}

						// owned by this player
							else {
								ELEMENTS.settings.game.search.title.innerText = GAME.name
								ELEMENTS.settings.game.name.input.removeAttribute("disabled")
								ELEMENTS.settings.game.name.input.value = GAME.name
								ELEMENTS.settings.game.banned.element.setAttribute("visibility", true)
								ELEMENTS.settings.game.data.element.setAttribute("visibility", true)
							}
					} catch (error) {console.log(error)}
				}

			/* displayGamePlayers */
				function displayGamePlayers() {
					try {
						// clear
							ELEMENTS.settings.game.players.list.innerHTML = ""
							ELEMENTS.settings.game.banned.list.innerHTML = ""

						// no game
							if (!GAME || !GAME.id) {
								return
							}

						// show players
							var sortedPlayers = Object.keys(GAME.allUsers).sort()
							for (var i in sortedPlayers) {
								var playerElement = document.createElement("li")
									playerElement.className = "settings-game-players-listing"
								ELEMENTS.settings.game.players.list.appendChild(playerElement)

								var playerIndicator = document.createElement("span")
									playerIndicator.className = "settings-game-players-listing-indicator"
									playerIndicator.innerHTML = GAME.users[sortedPlayers[i]] ? "&#x1f4bb;" : "&#x1f4a4;"
								playerElement.appendChild(playerIndicator)

								var playerName = document.createElement("span")
									playerName.className = "settings-game-players-listing-name"
									playerName.innerText = GAME.allUsers[sortedPlayers[i]].name
								playerElement.appendChild(playerName)

								if (GAME.userId == USER.id && GAME.allUsers[sortedPlayers[i]].id !== GAME.userId) {
									var flagForm = document.createElement("form")
										flagForm.setAttribute("method", "post")
										flagForm.setAttribute("action", "javascript:;")
										flagForm.className = "settings-game-players-listing-flag-form"
										flagForm.addEventListener(TRIGGERS.submit, submitGameUpdateBanUser)
									playerElement.appendChild(flagForm)

									var flagButton = document.createElement("button")
										flagButton.className = "settings-game-players-listing-flag minor-button"
										flagButton.innerHTML = "&#x1f6a9;"
										flagButton.title = "ban player"
										flagButton.value = GAME.allUsers[sortedPlayers[i]].id
									flagForm.appendChild(flagButton)
								}
							}

						// banned users
							if (GAME.userId == USER.id) {
								// 1+ banned
									if (Object.keys(GAME.bannedUsers).length) {
										var sortedBanned = Object.keys(GAME.bannedUsers).sort()
										for (var i in sortedBanned) {
											var playerElement = document.createElement("li")
												playerElement.className = "settings-game-players-listing"
											ELEMENTS.settings.game.banned.list.appendChild(playerElement)

											var playerIndicator = document.createElement("span")
												playerIndicator.className = "settings-game-players-listing-indicator"
											playerElement.appendChild(playerIndicator)

											var playerName = document.createElement("span")
												playerName.className = "settings-game-players-listing-name"
												playerName.innerText = GAME.bannedUsers[sortedBanned[i]].name
											playerElement.appendChild(playerName)

											var flagForm = document.createElement("form")
												flagForm.setAttribute("method", "post")
												flagForm.setAttribute("action", "javascript:;")
												flagForm.className = "settings-game-players-listing-flag-form"
												flagForm.addEventListener(TRIGGERS.submit, submitGameUpdateBanUser)
											playerElement.appendChild(flagForm)


											var flagButton = document.createElement("button")
												flagButton.className = "settings-game-players-listing-flag minor-button"
												flagButton.innerHTML = "&#x2705;"
												flagButton.title = "unban player"
												flagButton.value = GAME.bannedUsers[sortedBanned[i]].id
											flagForm.appendChild(flagButton)
										}
									}

								// 0 banned
									else {
										ELEMENTS.settings.game.banned.list.innerHTML = "<i>no banned players</i>"
									}
							}
					} catch (error) {console.log(error)}
				}

			/* displayGameList */
				function displayGameList() {
					try {
						// close option?
							ELEMENTS.settings.game.select.none.disabled = (GAME && GAME.id) ? false : true

						// remove extra games
							var gameOptions = Array.from(ELEMENTS.settings.game.select.custom.querySelectorAll("option"))
							var gameKeys = Object.keys(USER.games)
							for (var g in gameOptions) {
								if (!gameKeys.includes(gameOptions[g].value)) {
									gameOptions[g].remove()
								}
							}

						// custom games, from USER object
							var gameList = []
							if (USER.games) {
								for (var g in USER.games) {
									gameList.push(USER.games[g])
								}
							}
							for (var g in gameList) {
								// find game
									var game = gameList[g]
									var option = ELEMENTS.settings.game.select.custom.querySelector("option[value='" + game.id + "']")

								// rename
									if (option) {
										option.innerText = game.name
									}

								// create
									else {
										option = document.createElement("option")
										option.value = game.id
										option.innerText = game.name
										ELEMENTS.settings.game.select.custom.appendChild(option)
									}
							}

						// unselected
							ELEMENTS.settings.game.select.element.value = null
					} catch (error) {console.log(error)}
				}

		/** submit **/
			/* submitGameRead */
				function submitGameRead(event) {
					try {
						// select value
							var value = ELEMENTS.settings.game.select.element.value
							ELEMENTS.settings.game.select.element.value = null

						// none --> close
							if (value == ELEMENTS.settings.game.select.none.value) {
								submitGameUnread()
								return
							}

						// no value --> search
							if (!value) {
								var post = {
									action: "readGame",
									game: {
										id: null,
										name: ELEMENTS.settings.game.search.input.value.trim()
									}
								}

								if (!post.game.name) {
									FUNCTIONS.showToast({success: false, message: "no game name"})
									return
								}
							}

						// create
							else if (value == ELEMENTS.settings.game.select.new.value) {
								var post = {
									action: "createGame",
									game: {
										id: null,
										name: null
									}
								}
							}

						// selection
							else if (value) {
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
							ELEMENTS.settings.game.search.input.value = null
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
									id: GAME ? GAME.id : null
								}
							}

						// no game?
							if (!GAME) {
								return false
							}
						
						// send
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

			/* submitGameUpdateName */
				function submitGameUpdateName(event) {
					try {
						// post
							var post = {
								action: "updateGameName",
								game: {
									id: GAME ? GAME.id : null,
									userId: USER ? USER.id : null,
									name: ELEMENTS.settings.game.name.input.value || null
								}
							}

						// validate
							if (!post.game || !post.game.id) {
								FUNCTIONS.showToast({success: false, message: "no game selected"})
								return
							}
							if (!post.game.name) {
								FUNCTIONS.showToast({success: false, message: "no game name"})
								return
							}

						// send
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

			/* submitGameUpdateBanUser */
				function submitGameUpdateBanUser(event) {
					try {
						// post
							var post = {
								action: "updateGameBanUser",
								game: {
									id: GAME ? GAME.id : null,
									userId: USER ? USER.id : null,
									ban: event.target.closest("#settings-game-players") ? true : false,
									banUserId: event.target.querySelector(".settings-game-players-listing-flag").value || null
								}
							}

						// validate
							if (!post.game || !post.game.id) {
								FUNCTIONS.showToast({success: false, message: "no game selected"})
								return
							}
							if (!post.game.banUserId) {
								FUNCTIONS.showToast({success: false, message: "no user selected"})
								return
							}

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
							ELEMENTS.settings.game.delete.gate.open = false
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
							displayUserSettings()
					} catch (error) {console.log(error)}
				}

		/** display **/
			/* displayUserSettings */
				function displayUserSettings() {
					try {
						// no user?
							if (!USER) {
								return false
							}

						// settings
							if (USER.settings) {
								// volume
									ELEMENTS.settings.user.audio.input.value = Math.max(0, Math.min(1, USER.settings.volume))
									var audios = Array.from(ELEMENTS.body.querySelectorAll("audio"))
									for (var a in audios) {
										audios[a].volume = Math.max(0, Math.min(1, USER.settings.volume))
									}

								// color
									ELEMENTS.settings.user.color.input.value = USER.settings.color || "#000000"
							}

						// username
							ELEMENTS.settings.user.name.input.value = USER.name

						// password
							ELEMENTS.settings.user.password.old.value = null
							ELEMENTS.settings.user.password.new.value = null

						// relist chat senders
							displayChatListSenders()

						// relist games
							displayGameList()
					} catch (error) {console.log(error)}
				}

		/** submit **/
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

			/* submitUserUpdateColor */
				function submitUserUpdateColor(event) {
					try {
						// connected?
							if (!SOCKET) {
								FUNCTIONS.showToast({success: false, message: "no websocket connection"})
								return
							}

						// get color
							var color = event.target.value

						// save
							USER.settings.color = color

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
										displayRollGroupCreateSpacer(rollGroupElement, rollGroup, data)
									}

								// d20
									else if (data.display.success !== null && !data.display.dice.length) {
										displayRollGroupCreateD20(rollGroupElement, rollGroup, data)
									}

								// d6
									else {
										displayRollGroupCreateD6(rollGroupElement, rollGroup, data)
									}
							}

						// scroll
							ELEMENTS.stream.history.scrollLeft = ELEMENTS.stream.history.scrollWidth

						// turn order?
							if (rollGroup.options && rollGroup.options.turnOrder && CONTENT && CONTENT.id == rollGroup.contentId) {
								ELEMENTS.content.turnOrder.list.innerHTML = ""
								for (var i in rollGroup.rolls) {
									if (!rollGroup.rolls[i].display.spacer) {
										var turnOrderItem = document.createElement("li")
											turnOrderItem.className = "content-turn-order-item"
											turnOrderItem.innerHTML = rollGroup.rolls[i].display.text + " " + rollGroup.rolls[i].display.total
										ELEMENTS.content.turnOrder.list.appendChild(turnOrderItem)
									}
								}
							}
					} catch (error) {console.log(error)}
				}

			/* displayRollGroupCreateSpacer */
				function displayRollGroupCreateSpacer(rollGroupElement, rollGroup, data) {
					try {
						// element
							var spacerElement = document.createElement("div")
								spacerElement.id = "roll-" + rollGroup.id + "-" + data.id
								spacerElement.className = "spacer"
								spacerElement.innerText = data.display.text
							rollGroupElement.appendChild(spacerElement)
					} catch (error) {console.log(error)}
				}

			/* displayRollGroupCreateD6 */
				function displayRollGroupCreateD6(rollGroupElement, rollGroup, data) {
					try {
						// element
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

						// dice
							for (var r in data.display.dice) {
								var d6 = document.createElement("div")
									d6.id = "roll-" + rollGroup.id + "-" + data.id + "-" + r
									d6.className = "d6"
									d6.title = "toggle die"
									d6.setAttribute("counting", data.display.dice[r].counting)
									d6.addEventListener(TRIGGERS.click, submitRollGroupUpdate)
									d6.innerText = data.display.dice[r].number
								label.prepend(d6)
							}

						// healing?
							if (data.display.type == "healing" && CHARACTER && CHARACTER.id == rollGroup.characterId) {
								ELEMENTS.character.status.health.input.value = data.display.total
							}
					} catch (error) {console.log(error)}
				}

			/* displayRollGroupCreateD20 */
				function displayRollGroupCreateD20(rollGroupElement, rollGroup, data) {
					try {
						// element
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
									else if (data.display.success !== null) {
										continue
									}

								// d6
									else {
										displayRollGroupUpdateD6(rollGroupElement, rollGroup, data)
									}
							}
					} catch (error) {console.log(error)}
				}

			/* displayRollGroupUpdateD6 */
				function displayRollGroupUpdateD6(rollGroupElement, rollGroup, data) {
					try {
						// update total
							var total = rollGroupElement.querySelector("#roll-" + rollGroup.id + "-" + data.id + "-total")
								total.innerText = data.display.total

						// update dice
							for (var r in data.display.dice) {
								var d6 = rollGroupElement.querySelector("#roll-" + rollGroup.id + "-" + data.id + "-" + r)
									d6.setAttribute("counting", data.display.dice[r].counting)
									d6.innerText = data.display.dice[r].number
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
									contentId: CONTENT ? CONTENT.id : null,
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
						// animate
							if (event.target.getAttribute("rolling")) {
								return
							}
							event.target.setAttribute("rolling", true)
							setTimeout(function() {
								event.target.removeAttribute("rolling")
							}, 1000)

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
								recipient: ELEMENTS.character.status.targeting.select.element.value || null
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
						// edit mode on item?
							if (event.target.closest(".item") && ELEMENTS.character.element.getAttribute("mode") !== "play") {
								return
							}

						// animate
							if (event.target.getAttribute("rolling")) {
								return
							}
							event.target.setAttribute("rolling", true)
							setTimeout(function() {
								event.target.removeAttribute("rolling")
							}, 1000)

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
								recipient: ELEMENTS.character.status.targeting.select.element.value || null
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
									count: 0,
									text: "recover"
								}
							})

						// post
							submitRollGroupCreate(rolls)

						// post
							submitCharacterUpdate(CHARACTER)
					} catch (error) {console.log(error)}
				}

			/* submitRollGroupCreateCustom */
				function submitRollGroupCreateCustom(event) {
					try {
						// animate
							if (event.target.getAttribute("rolling")) {
								return
							}
							event.target.setAttribute("rolling", true)
							setTimeout(function() {
								event.target.removeAttribute("rolling")
							}, 1000)
							
						// rolls
							var rolls = []

						// spacer
							rolls.push({
								spacer: true,
								text: CHARACTER && CHARACTER.info ? CHARACTER.info.name : "environment"
							})

						// add to history
							var d = Math.max(2, ELEMENTS.stream.rng.d.value || 6)
							var count = Math.max(1, ELEMENTS.stream.rng.count.value)
							var text = (ELEMENTS.stream.rng.label.value || "?") + " (" + count + "d" + d + ")" 
							rolls.push({
								type: "environment",
								d: d,
								count: count,
								text: text,
								recipient: ELEMENTS.character.status.targeting.select.element.value || null
							})

						// post
							submitRollGroupCreate(rolls)
					} catch (error) {console.log(error)}
				}

			/* submitRollGroupCreateTurnOrder */
				function submitRollGroupCreateTurnOrder(event) {
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
								displayRulesSearchResult(resultsList[r])
							}

						// scroll to top
							ELEMENTS.rules.element.scrollTop = 0

						// lose focus
							ELEMENTS.rules.search.input.blur()
							ELEMENTS.rules.search.button.blur()
					} catch (error) {console.log(error)}
				}

			/* displayRulesSearchResult */
				function displayRulesSearchResult(result, message_id) {
					try {
						// element
							var resultElement = document.createElement("div")
								resultElement.className = "search-result"
								resultElement.setAttribute("type", result.type)
								resultElement.setAttribute("data", JSON.stringify(result))

						// search tool or chat tool?
							if (message_id) {
								resultElement.id = message_id
								ELEMENTS.chat.messages.appendChild(resultElement)
							}
							else {
								ELEMENTS.rules.results.appendChild(resultElement)
							}

						// name
							var resultName = document.createElement("h3")
								resultName.className = "search-result-name"
								resultName.innerText = (result.data.name || (result.data.info ? result.data.info.name : "?") || "?").replace(/_/gi, " ")
							resultElement.appendChild(resultName)

						// send to chat
							var resultSendForm = document.createElement("form")
								resultSendForm.setAttribute("method", "post")
								resultSendForm.setAttribute("action", "javascript:;")
								resultSendForm.addEventListener(TRIGGERS.submit, submitChatCreateRules)
							resultElement.appendChild(resultSendForm)

							var resultSend = document.createElement("button")
								resultSend.className = "search-result-send minor-button"
								resultSend.title = "send to chat"
								resultSend.innerHTML = "&#x1f4ac;"
							resultSendForm.appendChild(resultSend)

						// addable?
							if (result.addable) {
								var resultAddForm = document.createElement("form")
									resultAddForm.setAttribute("method", "post")
									resultAddForm.setAttribute("action", "javascript:;")
									resultAddForm.addEventListener(TRIGGERS.submit, submitCharacterUpdateRules)
								resultElement.appendChild(resultAddForm)

								var resultAdd = document.createElement("button")
									resultAdd.className = "search-result-add minor-button"
									resultAdd.title = "add to character"
									resultAdd.innerHTML = "&#x1f464;"
								resultAddForm.appendChild(resultAdd)
							}

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

						// return result
							return resultElement
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
										resultsList.push({type: "overview", data: result})
									}
								}

							// races
								for (var r in RULES.races) {
									if (r.includes(searchText) || r.includes(similarSearchText)) {
										var result = FUNCTIONS.duplicateObject(RULES.races[r])
										resultsList.push({type: "race", data: result, addable: true})
									}
								}

							// classes
								for (var c in RULES.classes) {
									if (c.includes(searchText) || c.includes(similarSearchText)) {
										var result = FUNCTIONS.duplicateObject(RULES.classes[c])
										resultsList.push({type: "class", data: result})
									}
								}

							// statistics
								for (var s in RULES.statistics) {
									if (s.includes(searchText) || s.includes(similarSearchText)) {
										var result = FUNCTIONS.duplicateObject(RULES.statistics[s])
											result.skills = FUNCTIONS.duplicateObject(RULES.skills[s]).map(function(k) {
												return k.name
											})
										resultsList.push({type: "statistic", data: result})
									}
								}

							// skills
								for (var s in RULES.skills) {
									for (var i in RULES.skills[s]) {
										if (RULES.skills[s][i].name.includes(searchText) || RULES.skills[s][i].name.includes(similarSearchText)) {
											var result = FUNCTIONS.duplicateObject(RULES.skills[s][i])
											resultsList.push({type: "skill", data: result, addable: true})
										}
									}
								}

							// damage
								for (var d in RULES.damage) {
									if (d.includes(searchText) || d.includes(similarSearchText)) {
										var result = FUNCTIONS.duplicateObject(RULES.damage[d])
										resultsList.push({type: "damage", data: result})
									}
								}

							// conditions
								for (var c in RULES.conditions) {
									if (c.includes(searchText) || c.includes(similarSearchText)) {
										var result = FUNCTIONS.duplicateObject(RULES.conditions[c])
										resultsList.push({type: "condition", data: result, addable: true})
									}
								}

							// items
								for (var i in RULES.items) {
									for (var j in RULES.items[i]) {
										if (RULES.items[i][j].name && (RULES.items[i][j].name.includes(searchText) || RULES.items[i][j].name.includes(similarSearchText))) {
											var result = FUNCTIONS.duplicateObject(RULES.items[i][j])
											resultsList.push({type: "item", data: result, addable: true})
										}
									}
								}

							// puzzles
								for (var p in RULES.puzzles) {
									if (RULES.puzzles[p].name.includes(searchText) || RULES.puzzles[p].name.includes(similarSearchText)) {
										var result = FUNCTIONS.duplicateObject(RULES.puzzles[p])
										resultsList.push({type: "puzzle", data: result})
									}
								}

							// npcs
								for (var n in RULES.npcs) {
									if (RULES.npcs[n].info.name.includes(searchText) || RULES.npcs[n].info.name.includes(similarSearchText)) {
										var result = FUNCTIONS.duplicateObject(RULES.npcs[n])
										resultsList.push({type: "npc", data: result})
									}
								}

							// animals
								for (var a in RULES.animals) {
									if (RULES.animals[a].info.name.includes(searchText) || RULES.animals[a].info.name.includes(similarSearchText)) {
										var result = FUNCTIONS.duplicateObject(RULES.animals[a])
										resultsList.push({type: "npc", data: result})
									}
								}

							// creatures
								for (var c in RULES.creatures) {
									if (RULES.creatures[c].info.name.includes(searchText) || RULES.creatures[c].info.name.includes(similarSearchText)) {
										var result = FUNCTIONS.duplicateObject(RULES.creatures[c])
										resultsList.push({type: "npc", data: result})
									}
								}

							// services
								for (var s in RULES.services) {
									if (RULES.services[s].name.includes(searchText) || RULES.services[s].name.includes(similarSearchText)) {
										var result = FUNCTIONS.duplicateObject(RULES.services[s])
										resultsList.push({type: "service", data: result})
									}
								}

						// display
							displayRulesSearch(resultsList)
					} catch (error) {console.log(error)}
				}

	/*** CHARACTER ***/
		/** receive **/
			/* receiveCharacter */
				function receiveCharacter(character) {
					try {
						// selecting character?
							if ((!CHARACTER || CHARACTER.id !== character.id) && (USER.characterId == character.id)) {
								CHARACTER = {id: USER.characterId}
							}

						// current character?
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
							ELEMENTS.character.choose.select.element.appendChild(optgroup)

							for (var n in RULES.npcs) {
								var option = document.createElement("option")
									option.value = "[template-npcs-" + RULES.npcs[n].info.name + "]"
									option.innerText = RULES.npcs[n].info.name
								optgroup.appendChild(option)
							}

						// animals
							var optgroup = document.createElement("optgroup")
								optgroup.label = "animals"
							ELEMENTS.character.choose.select.element.appendChild(optgroup)

							for (var a in RULES.animals) {
								var option = document.createElement("option")
									option.value = "[template-animals-" + RULES.animals[a].info.name + "]"
									option.innerText = RULES.animals[a].info.name
								optgroup.appendChild(option)
							}

						// creatures
							var optgroup = document.createElement("optgroup")
								optgroup.label = "creatures"
							ELEMENTS.character.choose.select.element.appendChild(optgroup)

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

							// optgroups
								var optgroupCharacters = document.createElement("optgroup")
									optgroupCharacters.setAttribute("label", "characters")
								container.appendChild(optgroupCharacters)

								if (i == "memory") {
									var optgroupLanguage = document.createElement("optgroup")
										optgroupLanguage.setAttribute("label", "language")
									container.appendChild(optgroupLanguage)
								}

								if (i == "logic") {
									var optgroupCharisma = document.createElement("optgroup")
										optgroupCharisma.setAttribute("label", "charisma")
									container.appendChild(optgroupCharisma)
								}

								var optgroupCreatures = document.createElement("optgroup")
									optgroupCreatures.setAttribute("label", "creatures")
								container.appendChild(optgroupCreatures)

							// loop through skills
								for (var j in RULES.skills[i]) {
									if (!container.querySelector("option[value=" + RULES.skills[i][j].name + "]")) {
										var option = document.createElement("option")
											option.value = RULES.skills[i][j].name
											option.innerText = RULES.skills[i][j].name.replace(/_/g, " ")
										if (RULES.skills[i][j].animals) {
											optgroupCreatures.appendChild(option)
										}
										else if (RULES.skills[i][j].language) {
											optgroupLanguage.appendChild(option)
										}
										else if (RULES.skills[i][j].charisma) {
											optgroupCharisma.appendChild(option)
										}
										else {
											optgroupCharacters.appendChild(option)
										}
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
												option.innerText = RULES.items[i][j].name + " (" + ((RULES.items[i][j].cost * RULES.items[i][j].count) || (RULES.items[i][j].costPerPound * RULES.items[i][j].weight * RULES.items[i][j].count) || "?") + "❑)"
												option.setAttribute("category", i)
											optgroup.appendChild(option)
										}
									}
							}
					} catch (error) {console.log(error)}
				}

			/* displayCharacterListConditions */
				function displayCharacterListConditions() {
					try {
						var container = ELEMENTS.character.status.conditions.select

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
			/* displayCharacterList */
				function displayCharacterList(characterList) {
					try {
						// characterList?
							if (characterList) { CHARACTERLIST = characterList }

						// close option?
							ELEMENTS.character.choose.select.none.disabled = (CHARACTER && CHARACTER.id) ? false : true

						// no game?
							if (!GAME) {
								CHARACTERLIST = null
								ELEMENTS.character.choose.select.mine.innerHTML = ""
								ELEMENTS.character.choose.select.shared.innerHTML = ""
								displayCharacterListRecipients(characterList, null)
								displayContentArenaObjectList(characterList, null)
								return
							}

						// custom characters, from USER object
							for (var c in characterList) {
								// character
									var character = characterList[c]

								// find character
									var option = ELEMENTS.character.choose.select.element.querySelector("option[value='" + character.id + "']")

								// delete?
									if (option && character.delete) {
										option.remove()
									}

								// rename
									else if (option) {
										option.innerText = character.name
									}

								// create
									else {
										option = document.createElement("option")
										option.value = character.id
										option.innerText = character.name
										if (character.userId == USER.id) {
											ELEMENTS.character.choose.select.mine.appendChild(option)
										}
										else {
											ELEMENTS.character.choose.select.shared.appendChild(option)	
										}
									}
							}

						// targeting
							displayCharacterListRecipients(characterList, null)

						// arena objects
							displayContentArenaObjectList(characterList, null)
					} catch (error) {console.log(error)}
				}

			/* displayCharacterListRecipients */
				function displayCharacterListRecipients(characterList, contentList) {
					try {
						// no game
							if (!GAME) {
								ELEMENTS.character.status.targeting.select.myCharacters.innerHTML = ""
								ELEMENTS.character.status.targeting.select.sharedCharacters.innerHTML = ""
								ELEMENTS.character.status.targeting.select.arena.innerHTML = ""
							}

						// sort
							if (characterList) {
								characterList.sort(function(a, b) { return (a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : 1 })
							}

						// loop through characterList
							for (var i in characterList) {
								// find character
									var character = characterList[i]
									var targetOption = ELEMENTS.character.status.targeting.select.element.querySelector("option[value='" + character.id + "']")

								// delete?
									if (targetOption && character.delete) {
										if (ELEMENTS.character.status.targeting.select.element.value == targetOption.value) {
											ELEMENTS.character.status.targeting.select.element.value = ELEMENTS.character.status.targeting.select.none.value
										}
										targetOption.remove()
									}

								// rename
									else if (targetOption) {
										targetOption.innerText = character.name
									}

								// create
									else {
										targetOption = document.createElement("option")
										targetOption.value = character.id
										targetOption.innerText = character.name
										if (character.userId == USER.id) {
											ELEMENTS.character.status.targeting.select.myCharacters.appendChild(targetOption)
										}
										else {
											ELEMENTS.character.status.targeting.select.sharedCharacters.appendChild(targetOption)	
										}
									}
							}

						// contentList? remove deleted objects
							if (contentList) {
								// get ids
									var ids = Object.keys(contentList).filter(function(k) { 
										return contentList[k].visible && contentList[k].characterId
									}) || []

									var characterIds = ids.map(function(k) {
										return contentList[k].characterId
									}) || []

								// loop through existing options
									var targetingOptions = Array.from(ELEMENTS.character.status.targeting.select.arena.querySelectorAll("option"))
									for (var i in targetingOptions) {
										var targetOption = targetingOptions[i]
										if (!characterIds.includes(targetOption.value)) {
											if (ELEMENTS.character.status.targeting.select.element.value == targetOption.value) {
												ELEMENTS.character.status.targeting.select.element.value = ELEMENTS.character.status.targeting.select.none.value
											}

											targetOption.remove()
										}
									}
							}

						// sort
							if (ids) {
								ids.sort(function(a, b) { return (contentList[a].text || "").toLowerCase() < (contentList[b].text || "").toLowerCase() ? -1 : 1 })
							}

						// loop through contentList
							for (var i in ids) {
								// find character
									var character = contentList[ids[i]]
									var targetOption = ELEMENTS.character.status.targeting.select.arena.querySelector("option[value='" + character.characterId + "']")

								// rename
									if (targetOption) {
										targetOption.innerText = character.text
									}

								// create
									else {
										targetOption = document.createElement("option")
										targetOption.value = character.characterId
										targetOption.innerText = character.text || "[?]"
										ELEMENTS.character.status.targeting.select.arena.appendChild(targetOption)
									}
							}
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
								ELEMENTS.character.choose.title.innerText = ""
								ELEMENTS.character.element.setAttribute("mode", "none")
								displayChatListSenders()
								return
							}

						// metadata
							ELEMENTS.character.choose.title.innerText = CHARACTER.info.name
							ELEMENTS.character.settings.access.select.element.value = CHARACTER.access ? ELEMENTS.character.settings.access.select.private.value : ELEMENTS.character.settings.access.select.public.value
							ELEMENTS.character.settings.access.form.setAttribute("visibility", (CHARACTER && CHARACTER.id && (CHARACTER.userId == USER.id || CHARACTER.gameUserId == USER.id)) ? true : false)
							ELEMENTS.character.settings.delete.gate.setAttribute("visibility", (CHARACTER && CHARACTER.id && (CHARACTER.userId == USER.id || CHARACTER.gameUserId == USER.id)) ? true : false)

						// mode
							var mode = ELEMENTS.character.element.getAttribute("mode") || "play"
							if (ELEMENTS.character.element.getAttribute("mode") == "none") {
								mode = "play"
								ELEMENTS.character.element.setAttribute("mode", "play")
							}

						// conditions
							displayCharacterConditions(CHARACTER)

						// items
							displayCharacterItems(CHARACTER, mode == "items")

						// statistics
							displayCharacterStatistics(CHARACTER)

						// info
							displayCharacterInfo(CHARACTER)

						// arena presets
							displayCharacterArenaPresets(CHARACTER)

						// chat
							displayChatListSenders()
					} catch (error) {console.log(error)}
				}

			/* displayCharacterArenaPresets */
				function displayCharacterArenaPresets(character) {
					try {
						// current field?
							var currentField = document.activeElement
							if (currentField.closest("#character-settings-arena-presets")) {
								var currentFieldProperty = currentField.getAttribute("property")
							}

						// loop through fields
							var presets = character.arenaPresets || {}
							var fields = Array.from(ELEMENTS.character.arena.presets.querySelectorAll("input")).concat(Array.from(ELEMENTS.character.arena.presets.querySelectorAll("select")))
							for (var i in fields) {
								var property = fields[i].getAttribute("property")
								if (property) {
									fields[i].value = presets[property] || (fields[i].type == "number" || fields[i].type == "range" ? 0 : null)
								}
							}

						// currentField ?
							if (currentFieldProperty) {
								(document.querySelector("input[property='" + currentFieldProperty + "']") || document.querySelector("select[property='" + currentFieldProperty + "']")).focus()
							}

						// get canvas
							var canvas = ELEMENTS.character.arena.preview
								canvas.height = Number(canvas.height)
								canvas.width = Number(canvas.width)
							var context = canvas.getContext("2d")

						// clear & background
							FUNCTIONS.clearCanvas(canvas, context)
							FUNCTIONS.drawRectangle(canvas, context, 0, 0, canvas.width, canvas.height, {color: ELEMENTS.gametable.canvas.gridBackground})
							FUNCTIONS.translateCanvas(canvas, context, 0, 0)
							FUNCTIONS.drawLine(canvas, context, -canvas.width / 2, 0, canvas.width / 2, 0, {color: ELEMENTS.gametable.canvas.gridColor})
							FUNCTIONS.drawLine(canvas, context, 0, -canvas.height / 2, 0, canvas.height / 2, {color: ELEMENTS.gametable.canvas.gridColor})

						// presets
							if (!character.arenaPresets) {
								return
							}

						// dimensions
							var cellSize = 200
							var x = -cellSize / 2
							var y = -cellSize / 2
							var rotateX = 0
							var rotateY = canvas.height
							var width = cellSize
							var height = cellSize
							var options = {
								color: character.arenaPresets.color,
								opacity: 1,
								rotation: 1 * (character.arenaPresets.rotation || 0)
							}

						// corners
							var corners = Number(character.arenaPresets.corners)
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
							if (character.arenaPresets.glow) {
								options.shadow = character.arenaPresets.shadow
								options.blur = cellSize * character.arenaPresets.glow
							}

						// text
							if (character.arenaPresets.text && character.arenaPresets.textSize && character.arenaPresets.textPlacement && character.arenaPresets.textPlacement !== "none") {
								options.textSize = (character.arenaPresets.textSize || 0) * cellSize / 100
								options.alignment = character.arenaPresets.textPlacement == "left" ? "right" : character.arenaPresets.textPlacement == "right" ? "left" : "center"
								options.textX = character.arenaPresets.textPlacement == "left" ? (x - options.textSize / 4) : character.arenaPresets.textPlacement == "right" ? (x + width + options.textSize / 4) : (x + width / 2)
								options.textY = character.arenaPresets.textPlacement == "top" ? (y + height + options.textSize / 2) : character.arenaPresets.textPlacement == "bottom" ? (y - options.textSize / 2) : (y + height / 2)
							}

						// image
							if (character.arenaPresets.image) {
								var image = document.createElement("img")
									image.src = character.arenaPresets.image
									image.onload = image.onerror = function() {
										options.image = image
										FUNCTIONS.rotateCanvas(canvas, context, rotateX, rotateY, character.arenaPresets.rotation, function() {
											FUNCTIONS.drawImage(canvas, context, x, y, width, height, options)
										})

										if (character.arenaPresets.text) {
											FUNCTIONS.drawText(canvas, context, options.textX, options.textY, character.arenaPresets.text, {color: character.arenaPresets.textColor, blur: cellSize / 10, shadow: character.arenaPresets.textShadow, size: options.textSize, alignment: options.alignment})
										}
									}
							}

						// draw
							else {
								FUNCTIONS.rotateCanvas(canvas, context, rotateX, rotateY, character.arenaPresets.rotation, function() {
									FUNCTIONS.drawRectangle(canvas, context, x, y, width, height, options)
								})

								if (character.arenaPresets.text) {
									var textSize = (character.arenaPresets.textSize || 0) * cellSize / 100
									FUNCTIONS.drawText(canvas, context, options.textX, options.textY, character.arenaPresets.text, {color: character.arenaPresets.textColor, blur: cellSize / 10, shadow: character.arenaPresets.textShadow, size: options.textSize, alignment: options.alignment})
								}
							}
					} catch (error) {console.log(error)}
				}

			/* displayCharacterInfo */
				function displayCharacterInfo(character) {
					try {
						// current field?
							var currentField = document.activeElement
							if (currentField.closest("#character-info")) {
								var currentFieldId = currentField.id
							}

						// name
							ELEMENTS.character.settings.name.input.value = CHARACTER.info.name

						// demographics
							for (var i in CHARACTER.info.demographics) {
								if (i == "race" && !ELEMENTS.character.info.race.querySelector("option[value='" + CHARACTER.info.demographics[i] + "']")) {
									var option = document.createElement("option")
										option.innerText = option.value = CHARACTER.info.demographics[i]
									ELEMENTS.character.info.race.appendChild(option)
								}
								ELEMENTS.character.info[i].value = CHARACTER.info.demographics[i]
							}

						// points
							ELEMENTS.character.info.points.value = CHARACTER.info.status.points

						// description
							ELEMENTS.character.info.description.value = CHARACTER.info.description
							if (CHARACTER.info.demographics.race && RULES.races[CHARACTER.info.demographics.race]) {
								ELEMENTS.character.info.raceAbility.value = RULES.races[CHARACTER.info.demographics.race].info.ability
							}
							else {
								ELEMENTS.character.info.raceAbility.value = ""
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

						// carrying
							ELEMENTS.character.info.burden.value = Math.round((CHARACTER.items.length ? (CHARACTER.items.reduce(function(a, b) { return a + (b.equipped ? (b.weight || 0) * (b.count || 0) : 0) }, 0) || 0) : 0) * 100) / 100
							if (Number(ELEMENTS.character.info.burden.value) > Number(ELEMENTS.character.info.carry.value)) {
								ELEMENTS.character.info.burden.setAttribute("overburdened", true)
							}
							else {
								ELEMENTS.character.info.burden.removeAttribute("overburdened")
							}

						// currentField ?
							if (currentFieldId) {
								document.querySelector("#" + currentFieldId).focus()
							}
					} catch (error) {console.log(error)}
				}

			/* displayCharacterStatistics */
				function displayCharacterStatistics(character) {
					try {
						// current statistic
							var currentStatistic = document.activeElement.closest(".statistic")
							if (currentStatistic) {
								var currentStatisticId = currentStatistic.id
								var currentSkill = document.activeElement.closest(".skill")
								if (!currentSkill) {
									var currentStatisticType = document.activeElement.className.includes("statistic-maximum") ? "statistic-maximum" : "statistic-damage"
								}
								else {
									var currentSkillId = currentSkill.querySelector(".skill-name-text").value
									var currentSkillType = document.activeElement.className.includes("skill-maximum") ? "skill-maximum" : "d6"
								}
							}

						// loop through statistics
							for (var i in CHARACTER.statistics) {
								// statistic
									var container = ELEMENTS.character.statistics[i]
									displayCharacterStatistic(CHARACTER, container, i)

								// skills
									container.querySelector(".skills-list").innerHTML = ""
									for (var s in CHARACTER.statistics[i].skills) {
										displayCharacterSkill(CHARACTER, container, i, CHARACTER.statistics[i].skills[s])
									}
							}

						// currentStatistic?
							if (currentStatisticId && currentStatisticType) {
								document.querySelector("#" + currentStatisticId + " ." + currentStatisticType).focus()
							}
							else if (currentStatisticId && currentSkillId && currentSkillType) {
								var refocusSkills = Array.from(document.querySelectorAll("#" + currentStatisticId + " .skill-name-text"))
								var refocusSkill = refocusSkills.find(function(element) { return element.value == currentSkillId }) || null
								if (refocusSkill) {
									refocusSkill.closest(".skill").querySelector("." + currentSkillType).focus()
								}
							}
					} catch (error) {console.log(error)}
				}

			/* displayCharacterStatistic */
				function displayCharacterStatistic(character, container, statistic) {
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
					} catch (error) {console.log(error)}
				}

			/* displayCharacterSkill */
				function displayCharacterSkill(character, container, statistic, skill) {
					try {
						// block
							var block = document.createElement("div")
								block.className = "skill"
							container.querySelector(".skills-list").appendChild(block)

						// left column
							var left = document.createElement("div")
								left.className = "column-left"
							block.appendChild(left)

							var name = document.createElement("div")
								name.className = "skill-name"
							left.appendChild(name)

							// d6?
								if (skill.d6 !== undefined) {
									var d6 = document.createElement("input")
										d6.type = "number"
										d6.step = 1
										d6.min = 0
										d6.className = "d6 editable"
										d6.placeholder = "d6"
										d6.title = "roll skill d6"
										d6.value = skill.d6
										d6.addEventListener(TRIGGERS.click, submitRollGroupCreateD6)
										d6.addEventListener(TRIGGERS.change, submitCharacterUpdateSkillUpdate)
									name.appendChild(d6)
								}

							// text
								var text = document.createElement("input")
									text.className = "skill-name-text"
									text.type = "text"
									text.setAttribute("disabled", true)
									text.value = skill.name.replace(/_/g, " ")
								name.appendChild(text)

							// remove?
								if (skill.unremovable) {
									block.className += " unremovable"
								}
								else if (!skill.maximum) {
									var removeForm = document.createElement("form")
										removeForm.className = "skill-remove-form"
										removeForm.setAttribute("method", "post")
										removeForm.setAttribute("action", "javascript:;")
										removeForm.addEventListener(TRIGGERS.submit, submitCharacterUpdateSkillDelete)
									left.prepend(removeForm)

									var remove = document.createElement("button")
										remove.className = "skill-remove"
										remove.title = "remove skill"
										remove.innerText = "x"
									removeForm.appendChild(remove)
								}

						// right column
							var right = document.createElement("div")
								right.className = "column-right"
							block.appendChild(right)

							// numbers
								var maximum = document.createElement("input")
									maximum.type = "number"
									maximum.className = "skill-maximum editable"
									maximum.value = skill.maximum
									maximum.placeholder = "#"
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

							// d20
								var d20 = document.createElement("input")
									d20.type = "number"
									d20.setAttribute("readonly", true)
									d20.className = "skill-current d20"
									d20.title = "roll skill"
									d20.value = Math.max(0, character.statistics[statistic].maximum + character.statistics[statistic].damage + character.statistics[statistic].condition + skill.maximum + skill.condition)
									d20.addEventListener(TRIGGERS.click, submitRollGroupCreateD20)
								right.appendChild(d20)
						
						// disable in select
							var option = ELEMENTS.character.statistics[statistic].querySelector("option[value=" + skill.name + "]")
							if (option) { option.setAttribute("disabled", true) }
					} catch (error) {console.log(error)}
				}

			/* displayCharacterItemMode */
				function displayCharacterItemMode(event) {
					try {
						// no character
							if (!CHARACTER || !CHARACTER.items) {
								return
							}

						// stop editing
							if (ELEMENTS.character.element.getAttribute("mode") == "items") {
								ELEMENTS.character.element.setAttribute("mode", "play")
								displayCharacterItems(CHARACTER, false)
								return
							}

						// start editing
							ELEMENTS.character.element.setAttribute("mode", "items")
							displayCharacterItems(CHARACTER, true)
					} catch (error) {console.log(error)}
				}

			/* displayCharacterItems */
				function displayCharacterItems(character, enable) {
					try {
						// current item
							var currentItem = document.activeElement.closest(".item")
							if (currentItem) {
								var currentItemId = currentItem.id
								var currentItemField = document.activeElement.getAttribute("field")	
							}
						
						// clear
							ELEMENTS.character.items.equipped.list.innerHTML   = ""
							ELEMENTS.character.items.unequipped.list.innerHTML = ""
							
						// stop dragging
							ELEMENTS.character.items.dragging = null
							ELEMENTS.character.items.equipped.element.removeAttribute("dragging")
							ELEMENTS.character.items.unequipped.element.removeAttribute("dragging")

						// loop through items
							var equippedCount = 0
							var unequippedCount = 0
							for (var i in character.items) {
								if (character.items[i].equipped) {
									equippedCount++
									displayCharacterItem(character, character.items[i], ELEMENTS.character.items.equipped.list, enable)
								}
								else {
									unequippedCount++
									displayCharacterItem(character, character.items[i], ELEMENTS.character.items.unequipped.list, enable)	
								}
							}

						// equip / unequip count
							ELEMENTS.character.items.equipped.count.innerText = equippedCount
							ELEMENTS.character.items.unequipped.count.innerText = unequippedCount

						// open all?
							if (enable) {
								ELEMENTS.character.items.equipped.element.setAttribute("open", true)
								ELEMENTS.character.items.unequipped.element.setAttribute("open", true)
							}

						// currentItem?
							if (currentItemId && currentItemField) {
								document.querySelector("#" + currentItemId + " [field='" + currentItemField + "']").focus()
							}
					} catch (error) {console.log(error)}
				}

			/* displayCharacterItem */
				function displayCharacterItem(character, item, parent, enable) {
					try {
						// shell
							var shell = document.createElement("div")
								shell.className = "item-shell"
								shell.addEventListener(TRIGGERS.drop, submitCharacterUpdateItemPosition)
							parent.append(shell)

						// block
							var block = document.createElement("details")
								block.className = "item " + (item.type || "miscellaneous")
								block.id = item.id
								block.draggable = true
								block.setAttribute("ondragstart", "event.dataTransfer.setData('text/plain',null)")
								block.addEventListener(TRIGGERS.dragstart, displayCharacterItemDragging)
								block.addEventListener(TRIGGERS.dragend, displayCharacterItemDragging)
								block.addEventListener(TRIGGERS.dragenter, function(event) {
									(event.target.closest(".item") || event.target).setAttribute("draggedOver", true)
								})
								block.addEventListener(TRIGGERS.dragleave, function(event) {
									var newTarget = (event.target.closest(".item") || event.target)
									var nextTarget = (event.relatedTarget || event.fromElement)
									if (!nextTarget || !(nextTarget == newTarget || nextTarget.closest(".item") == newTarget)) { newTarget.removeAttribute("draggedOver") }
								})
								if (enable) {
									block.setAttribute("open", true)
								}
							shell.append(block)

						// summary
							var summary = document.createElement("summary")
								summary.className = "item-summary"
							block.appendChild(summary)

						// remove
							var removeForm = document.createElement("form")
								removeForm.className = "item-remove-form"
								removeForm.setAttribute("method", "post")
								removeForm.setAttribute("action", "javascript:;")
								removeForm.addEventListener(TRIGGERS.submit, submitCharacterUpdateItemDelete)
							summary.prepend(removeForm)

							var remove = document.createElement("button")
								remove.className = "item-remove"
								remove.title = "remove item"
								remove.innerText = "x"
							removeForm.prepend(remove)

						// equip
							var equipForm = document.createElement("form")
								equipForm.className = "item-equip-form"
								equipForm.setAttribute("method", "post")
								equipForm.setAttribute("action", "javascript:;")
								equipForm.addEventListener(TRIGGERS.submit, submitCharacterUpdateItemEquip)
							summary.prepend(equipForm)

							var equip = document.createElement("button")
								equip.className = "item-equip"
								equip.title = item.equipped ? "move to stockpile" : "move to inventory"
								equip.innerHTML = "&#x2713;"
								if (item.equipped) {
									equip.setAttribute("equipped", true)
								}
							equipForm.prepend(equip)

						// name
							var name = document.createElement("div")
								name.className = "item-name"
							summary.appendChild(name)

						// d6
							var d6 = document.createElement("input")
								d6.type = "number"
								if (!enable) {
									d6.setAttribute("readonly", true)
								}
								d6.step = 1
								d6.min = 0
								d6.className = "d6 editable"
								d6.setAttribute("field", "d6")
								d6.placeholder = "d6"
								d6.title = "roll item d6"
								d6.addEventListener(TRIGGERS.change, submitCharacterUpdateItemUpdate)
								d6.addEventListener(TRIGGERS.click, submitRollGroupCreateD6)
								d6.value = item.d6 || 0
								if (!item.d6) {
									d6.className += " input-zero"
								}
							name.appendChild(d6)

						// name text & count
							var text = document.createElement("input")
								text.type = "text"
								if (!enable) {
									text.setAttribute("readonly", true)
								}
								text.className = "item-name-text editable"
								text.setAttribute("field", "name")
								text.placeholder = "item"
								text.value = item.name
								text.addEventListener(TRIGGERS.change, submitCharacterUpdateItemUpdate)
							name.appendChild(text)

							var count = document.createElement("input")
								count.type = "number"
								count.step = 1
								count.min = 0
								count.className = "item-count editable always-editable"
								count.setAttribute("field", "count")
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
										d6.title = "roll item usage d6"
										d6.setAttribute("field", "skills-" + u + "-d6")
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
										select.setAttribute("field", "skills-" + u + "-name")
										select.placeholder = "skill"
										select.value = usage.skill
										select.addEventListener(TRIGGERS.change, submitCharacterUpdateItemUpdate)
									usageElement.appendChild(select)

									var modifier = document.createElement("input")
										modifier.type = "number"
										if (!enable) {
											modifier.setAttribute("readonly", true)
										}
										modifier.step = 1
										modifier.className = "item-usage-modifier editable"
										if (!usage.modifier || usage.modifier == 0) {
											modifier.className += " input-zero"
										}
										modifier.placeholder = "#"
										modifier.setAttribute("field", "skills-" + u + "-modifier")
										modifier.addEventListener(TRIGGERS.change, submitCharacterUpdateItemUpdate)
										modifier.value = usage.modifier || 0
									usageElement.appendChild(modifier)

									var d20 = document.createElement("input")
										d20.type = "number"
										d20.setAttribute("readonly", true)
										d20.step = 1
										d20.className = "d20"
										d20.title = "roll skill"
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

								var index = 0
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
										d6.setAttribute("field", "conditions-" + index + "-d6")
										d6.addEventListener(TRIGGERS.change, submitCharacterUpdateItemUpdate)
										d6.addEventListener(TRIGGERS.click, submitRollGroupCreateD6)
										d6.value = item.conditions[i] || 0
										d6.placeholder = "d6"
										d6.title = "roll item condition d6"
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
										select.setAttribute("field", "conditions-" + index + "-name")
										select.value = i
										select.addEventListener(TRIGGERS.change, submitCharacterUpdateItemUpdate)
									condition.appendChild(select)

									
									if (!item.conditions[i]) {
										select.className += " item-condition-remove"
									}

									index++
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
								description.setAttribute("field", "description")
								description.addEventListener(TRIGGERS.change, submitCharacterUpdateItemUpdate)
								description.placeholder = "description"
								description.value = ""
							block.appendChild(description)
							
							if (item.weapons)      { description.value += " | for use with " + item.weapons.join(", ")}
							if (item.recipe)       { description.value += " | recipe: " + JSON.stringify(item.recipe).replace(/{|}|"|:/g,"").replace(/,/g,", ")}
							if (item.costPerPound) { description.value += " | cost per pound: " + item.costPerPound + "❑"}
							if (item.description)  { description.value += " | " + item.description}

							description.value = description.value.slice(3)
					} catch (error) {console.log(error)}
				}

			/* displayCharacterItemDragging */
				function displayCharacterItemDragging(event) {
					try {
						// validate
							if (!event.target || !event.target.draggable || !event.target.className.includes("item")) {
								return false
							}

						// stop dragging
							if (event.type !== "dragstart") {
								// item being dragged
									if (ELEMENTS.character.items.dragging) {
										ELEMENTS.character.items.dragging.removeAttribute("dragging")
										ELEMENTS.character.items.dragging = null
									}

								// items dragged over
									var draggedOvers = Array.from(document.querySelectorAll(".item[draggedOver='true']")) || []
									for (var i in draggedOvers) {
										draggedOvers[i].removeAttribute("draggedOver")
									}

								// container
									ELEMENTS.character.items.equipped.element.removeAttribute("dragging")
									ELEMENTS.character.items.unequipped.element.removeAttribute("dragging")
									return
							}

						// input ?
							if (document.activeElement.tagName.toLowerCase() == "input" || document.activeElement.tagName.toLowerCase() == "textarea") {
								event.preventDefault()
								return false
							}

						// start dragging
							ELEMENTS.character.items.dragging = event.target
							ELEMENTS.character.items.dragging.setAttribute("dragging", true)
							event.target.closest(".subsection").setAttribute("dragging", true)
					} catch (error) {console.log(error)}
				}

			/* displayCharacterConditions */
				function displayCharacterConditions(character) {
					try {
						// unset
							ELEMENTS.character.status.conditions.list.innerHTML = ""
							var options = Array.from(ELEMENTS.character.status.conditions.select.querySelectorAll("option"))
							for (var i in options) {
								options[i].removeAttribute("disabled")
							}

						// loop through
							character.info.status.conditions.sort(function(a, b) {
								return (a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : 1
							})
							for (var i in character.info.status.conditions) {
								displayCharacterCondition(character.info.status.conditions[i])
							}
					} catch (error) {console.log(error)}
				}

			/* displayCharacterCondition */
				function displayCharacterCondition(condition) {
					try {
						// container
							var conditionElement = document.createElement("div")
								conditionElement.className = "condition"
								conditionElement.setAttribute("value", condition.name)
							ELEMENTS.character.status.conditions.list.append(conditionElement)

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
							var removeForm = document.createElement("form")
								removeForm.className = "condition-remove-form"
								removeForm.setAttribute("method", "post")
								removeForm.setAttribute("action", "javascript:;")
								removeForm.addEventListener(TRIGGERS.submit, submitCharacterUpdateConditionDelete)
							conditionElement.prepend(removeForm)

							var remove = document.createElement("button")
								remove.className = "condition-remove"
								remove.title = "remove condition"
								remove.innerText = "x"
							removeForm.prepend(remove)

						// disable in select
							var conditionOption = ELEMENTS.character.status.conditions.select.querySelector("[value=" + condition.name + "]")
							if (conditionOption) {
								conditionOption.setAttribute("disabled", true)
							}
					} catch (error) {console.log(error)}
				}

		/** submit - settings **/
			/* submitCharacterRead */
				function submitCharacterRead(event) {
					try {
						// no search
							if (!ELEMENTS.character.choose.select.element.value) {
								return false
							}

						// value
							var value = ELEMENTS.character.choose.select.element.value

						// none
							if (value == ELEMENTS.character.choose.select.none.value) {
								var post = {
									action: "unreadCharacter",
									character: {
										userId: USER ? USER.id : null,
										gameId: GAME ? GAME.id : null,
										id: CHARACTER ? CHARACTER.id : null
									}
								}

								if (!CHARACTER) {
									return false
								}

								CHARACTER = null
								displayCharacter()
								displayCharacterList()
							}

						// upload
							else if (value == ELEMENTS.character.choose.select.upload.value) {
								submitCharacterCreateUpload()
								return
							}

						// new
							else if (value == ELEMENTS.character.choose.select.new.value) {
								// blank template
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
							else if (value[0] == "[" && value[value.length - 1] == "]") {
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
						
						// load existing character
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
						ELEMENTS.character.choose.upload.click()
						ELEMENTS.character.choose.upload.addEventListener(TRIGGERS.change, function(event) {
							if (ELEMENTS.character.choose.upload.value && ELEMENTS.character.choose.upload.value.length) {
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
							ELEMENTS.character.settings.delete.gate.open = false
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
							if (post.character.access == ELEMENTS.character.settings.access.select.public.value) {
								post.character.access = null
							}
							if (post.character.access == ELEMENTS.character.settings.access.select.private.value) {
								post.character.access = CHARACTER.userId
							}

						// send socket request
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

		/** submit - gameplay **/
			/* submitCharacterUpdateRules */
				function submitCharacterUpdateRules(event) {
					try {
						// no character
							if (!CHARACTER) {
								FUNCTIONS.showToast({success: false, message: "no character selected"})
								return
							}

						// custom component
							if (event.target.id == "content-add-form") {
								var code = ELEMENTS.content.code.input.value || ""
								try {
									var result = JSON.parse(code.trim())
								} catch (error) {
									FUNCTIONS.showToast({success: false, message: "invalid component code"})
									return
								}
							}

						// get data from search result
							else {
								var resultElement = event.target.closest(".search-result")
								var result = JSON.parse(resultElement.getAttribute("data") || "{}")
							}

						// result
							if (!result || !result.data) {
								FUNCTIONS.showToast({success: false, message: "invalid component data"})
								return
							}

						// race
							if (result.type == "race") {
								submitCharacterUpdateRace(result.data)
								displayTool({target: ELEMENTS.tools.characterRadio, forceSet: true})
							}
							
						// skill
							else if (result.type == "skill") {
								submitCharacterUpdateSkillCreate(result.data)
								displayTool({target: ELEMENTS.tools.characterRadio, forceSet: true})
							}

						// item
							else if (result.type == "item") {
								submitCharacterUpdateItemCreate(result.data)
								displayTool({target: ELEMENTS.tools.characterRadio, forceSet: true})
							}

						// condition
							else if (result.type == "condition") {
								submitCharacterUpdateConditionCreate(result.data)
								displayTool({target: ELEMENTS.tools.characterRadio, forceSet: true})
							}
					} catch (error) {console.log(error)}
				}

			/* submitCharacterUpdateInfo */
				function submitCharacterUpdateInfo(event) {
					try {
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

			/* submitCharacterUpdateConditionCreate	*/
				function submitCharacterUpdateConditionCreate(event) {
					try {
						// from dropdown (search)
							if (event.target) {
								// no search
									if (!ELEMENTS.character.status.conditions.select.value) {
										return false
									}

								var conditionName = ELEMENTS.character.status.conditions.select.value
								var condition = RULES.conditions[conditionName] || {name: conditionName}
								document.activeElement.blur()
							}

						// from search result
							else {
								var condition = event
							}

						// already there?
							if (CHARACTER.info.status.conditions.find(function(c) { return c.name == condition.name })) {
								return
							}

						// add to conditions array
							CHARACTER.info.status.conditions.push(condition)

						// add effects
							if (condition.effects) {
								for (var i in condition.effects) {
									for (var j in condition.effects[i]) {
										if (j == "statistic") {
											CHARACTER.statistics[i].condition += condition.effects[i][j]
										}
										else {
											var skill = CHARACTER.statistics[i].skills.find(function (skill) { return skill.name == j })
											if (!skill) {
												submitCharacterUpdateSkillCreate({skillName: j, statistic: i, fromConditions: true})
												var skill = CHARACTER.statistics[i].skills.find(function (skill) { return skill.name == j })
											}

											skill.condition += condition.effects[i][j]
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
						// validate
							if (!CHARACTER) {
								return
							}

						// rest recover
							if (event.target == ELEMENTS.character.status.recover.form) {
								// loop through statistics
									var actualChange = 0
									for (var i in CHARACTER.statistics) {
										if (CHARACTER.statistics[i].damage) {
											CHARACTER.statistics[i].damage++
											actualChange++
										}
									}

								// no actualChange
									if (!actualChange) {
										return false
									}

								// update actual
									CHARACTER.info.status.damage = Math.min(0, CHARACTER.info.status.damage + actualChange)
									submitRollGroupCreateRecover()
							}

						// damage
							else if (event.target == ELEMENTS.character.status.damage.form) {
								// get amount
									var amount = ELEMENTS.character.status.damage.input.value
										ELEMENTS.character.status.damage.input.value = null
									if (!amount || isNaN(amount)) {
										return false
									}
									amount = Math.round(Math.abs(amount))
									var actualChange = 0

								// only stats with remaining health
									var statisticNames = Object.keys(CHARACTER.statistics)
										statisticNames = statisticNames.filter(function(a) {
											return CHARACTER.statistics[a].maximum + CHARACTER.statistics[a].damage
										})

								// send damage to highest current stat
									while (amount && statisticNames.length) {
										statisticNames.sort(function(a, b) {
											return (CHARACTER.statistics[b].maximum + CHARACTER.statistics[b].damage) - (CHARACTER.statistics[a].maximum + CHARACTER.statistics[a].damage)
										})

										CHARACTER.statistics[statisticNames[0]].damage--
										amount--
										actualChange--

										statisticNames = statisticNames.filter(function(a) {
											return CHARACTER.statistics[a].maximum + CHARACTER.statistics[a].damage
										})
									}

								// no actualChange
									if (!actualChange) {
										return false
									}

								// update actual
									CHARACTER.info.status.damage = Math.min(0, CHARACTER.info.status.damage + actualChange)
							}

						// health
							else if (event.target == ELEMENTS.character.status.health.form) {
								// get amount
									var amount = ELEMENTS.character.status.health.input.value
										ELEMENTS.character.status.health.input.value = null
									if (!amount || isNaN(amount)) {
										return false
									}
									amount = Math.round(Math.abs(amount))
									var actualChange = 0

								// only stats with damage
									var statisticNames = Object.keys(CHARACTER.statistics)
										statisticNames = statisticNames.filter(function(a) {
											return CHARACTER.statistics[a].damage
										})

								// send health to lowest current stat
									while (amount && statisticNames.length) {
										statisticNames.sort(function(a, b) {
											return (CHARACTER.statistics[a].maximum + CHARACTER.statistics[a].damage) - (CHARACTER.statistics[b].maximum + CHARACTER.statistics[b].damage)
										})

										CHARACTER.statistics[statisticNames[0]].damage++
										amount--
										actualChange++

										statisticNames = statisticNames.filter(function(a) {
											return CHARACTER.statistics[a].damage
										})
									}

								// no actualChange
									if (!actualChange) {
										return false
									}

								// update actual
									CHARACTER.info.status.damage = Math.min(0, CHARACTER.info.status.damage + actualChange)
							}

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

			/* submitCharacterUpdateSkillCreate */
				function submitCharacterUpdateSkillCreate(event) {
					try {
						// from dropdown (search)
							if (event.target) {
								var select = event.target.closest(".option-search").querySelector(".option-search-select")

								// no search
									if (!select.value) {
										return false
									}

								var skillName = select.value.replace(/\s/g, "_")
								var statistic = select.id.replace("character-", "").replace("-select", "")
							}

						// from conditions
							else if (event.fromConditions) {
								var skillName = event.skillName
								var statistic = event.statistic
							}

						// from search result
							else {
								var skillName = event.name
								var statistic = event.statistic
								var skill = event
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
								var condition = CHARACTER.info.status.conditions[i]
								if (condition.effects) {
									for (var e in condition.effects) {
										for (var s in condition.effects[e]) {
											if (s == skill.name) {
												CHARACTER.statistics[statistic].skills[CHARACTER.statistics[statistic].skills.length - 1].condition += condition.effects[e][s]
											}
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
						// from dropdown (search)
							if (event.target) {
								// no search
									if (!ELEMENTS.character.items.select.value) {
										return false
									}

								var name = ELEMENTS.character.items.select.value
								var option = ELEMENTS.character.items.select.querySelector("option[value='" + name + "']")
								var category = option.getAttribute("category")
								var item = FUNCTIONS.duplicateObject(RULES.items[category].find(function(i) {
									return i.name == name
								}))
							}

						// from search result
							else {
								var item = event
							}

						// add to items
							item.id = FUNCTIONS.generateRandom()
							item.equipped = true
							CHARACTER.items.unshift(item)
							document.activeElement.blur()

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

						// modifier
							else if (event.target.className.includes("item-usage-modifier")) {
								if (event.target.closest(".item-usage")) {
									var usages = event.target.closest(".item-usages")
									var usage = event.target.closest(".item-usage")
									var index = Array.prototype.indexOf.call(usages.children, usage)
									item.usage[index].modifier = Number(event.target.value)
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
					} catch (error) {console.log(error)}
				}

			/* submitCharacterUpdateItemPosition */
				function submitCharacterUpdateItemPosition(event) {
					try {
						// no dragging?
							if (!ELEMENTS.character.items.dragging) {
								return false
							}

						// item ids
							var ids = CHARACTER.items.map(function (item) {
								return item.id
							})
						
						// get dragging item
							var draggedItemIndex = ids.indexOf(ELEMENTS.character.items.dragging.id)
							var draggedItem = CHARACTER.items[draggedItemIndex]

						// get position
							if (event.target.closest(".item")) {
								var targetItemIndex = ids.indexOf(event.target.closest(".item").id)
							}
							else if (event.target.querySelector(".item")) {
								var targetItemIndex = ids.indexOf(event.target.querySelector(".item").id)
							}
							else {
								return false
							}

						// same position
							if (targetItemIndex == draggedItemIndex) {
								return false
							}

						// set equipped
							var targetItem = CHARACTER.items[targetItemIndex]
							draggedItem.equipped = targetItem.equipped

						// update order
							if (targetItemIndex > draggedItemIndex) {
								CHARACTER.items.splice(targetItemIndex + 1, 0, draggedItem)
								CHARACTER.items.splice(draggedItemIndex, 1)
							}
							else {
								CHARACTER.items.splice(targetItemIndex, 0, draggedItem)
								CHARACTER.items.splice(draggedItemIndex + 1, 1)
							}

						// save
							ELEMENTS.character.items.dragging = null
							submitCharacterUpdate(CHARACTER)
					} catch (error) {console.log(error)}
				}

			/* submitCharacterUpdateItemDelete */
				function submitCharacterUpdateItemDelete(event) {
					try {
						// item name
							var id = event.target.closest(".item").id

						// remove item
							for (var i = 0; i < CHARACTER.items.length; i++) {
								if (CHARACTER.items[i].id == id) {
									// remove
										CHARACTER.items.splice(i, 1)
										break
								}
							}

						// save
							submitCharacterUpdate(CHARACTER)
					} catch (error) {console.log(error)}
				}

			/* submitCharacterUpdateArenaPresets */
				function submitCharacterUpdateArenaPresets(event) {
					try {
						// no preset?
							if (!CHARACTER.arenaPresets) {
								CHARACTER.arenaPresets = {}
							}

						// property
							var type = event.target.type || event.target.getAttribute("type")
							var property = event.target.getAttribute("property")

						// set value
							if (type == "checkbox") {
								var value = !event.target.checked
							}
							else if (type == "range" || type == "number") {
								var value = Number(event.target.value) || 0
							}
							else {
								var value = event.target.value
							}

						// image?
							if (property == "image") {
								CHARACTER.info.image = value
							}

						// update
							CHARACTER.arenaPresets[property] = value
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
								ELEMENTS.tools.notification.setAttribute("visibility", false)
								return
							}

						// display messages
							displayChat(messages)
					} catch (error) {console.log(error)}
				}

		/** display **/
			/* displayChatListSenders */
				function displayChatListSenders() {
					try {
						// user name
							ELEMENTS.chat.send.sender.user.innerText = USER.name

						// no game?
							if (!GAME || !CHARACTER) {
								ELEMENTS.chat.send.sender.select.value = ELEMENTS.chat.send.sender.user.value
								ELEMENTS.chat.send.sender.character.disabled = true
								ELEMENTS.chat.send.sender.character.innerText = ELEMENTS.chat.send.sender.character.value
								return
							}

						// character name
							ELEMENTS.chat.send.sender.character.disabled = false
							ELEMENTS.chat.send.sender.character.innerText = CHARACTER.info.name || ELEMENTS.chat.send.sender.character.value
					} catch (error) {console.log(error)}
				}

			/* displayChatListRecipients */
				function displayChatListRecipients() {
					try {
						// remove existing
							ELEMENTS.chat.send.recipients.players.innerHTML = ""

						// no game?
							if (!GAME) {
								return
							}

						// loop through
							for (var i in GAME.users) {
								if (i == USER.id) { continue }
								var option = document.createElement("option")
									option.innerText = GAME.users[i].name
									option.value = GAME.users[i].id
								ELEMENTS.chat.send.recipients.players.appendChild(option)
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
								// already exists
									if (ELEMENTS.chat.messages.querySelector("#chat-" + messages[i].id)) {
										continue
									}

								// search result
									if (messages[i].display.data) {
										newMessages = true
										messages[i].element = displayRulesSearchResult(messages[i].display.data, messages[i].id)
										continue
									}

								// content
									if (messages[i].display.content) {
										newMessages = true
										messages[i].element = displayChatContent(messages[i])
										continue
									}

								// chat message
									newMessages = true
									messages[i].element = displayChatMessage(messages[i])
							}

						// scroll
							ELEMENTS.chat.messages.scrollTop = ELEMENTS.chat.messages.scrollHeight

						// one message, and it's a sound?
							if (messages && messages.length == 1 && messages[0].element.querySelector("audio")) {
								try {
									messages[0].element.querySelector("audio").play()
								} catch (error) {}
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
								if (message.display.color) {
									messageElement.style.backgroundColor = message.display.color
								}
							ELEMENTS.chat.messages.appendChild(messageElement)

						// left
							var messageLeft = document.createElement("div")
								messageLeft.className = "chat-message-left"
							messageElement.appendChild(messageLeft)

							var messageName = document.createElement("div")
								messageName.className = "chat-message-name"
								messageName.innerText = message.display.sender
							messageLeft.appendChild(messageName)

							if (message.display.recipient) {
								var messageRecipient = document.createElement("div")
									messageRecipient.className = "chat-message-recipient"
									messageRecipient.innerHTML = "&rarr; " + message.display.recipient
								messageLeft.appendChild(messageRecipient)
							}

							var messageTime = document.createElement("div")
								messageTime.className = "chat-message-time"
								messageTime.innerText = new Date(message.display.time).toLocaleTimeString()
							messageLeft.appendChild(messageTime)

						// text
							var messageImages = []
							var messageAudios = []
							var messageYoutubes = []
							var messageText = document.createElement("div")
								messageText.className = "chat-message-text"
								messageText.innerHTML = message.display.text.replace(URLREGEX, function(url) {
									if (IMAGEURLREGEX.test(url)) { messageImages.push(url) }
									if (AUDIOURLREGEX.test(url)) { messageAudios.push(url) }
									if (YOUTUBEURLREGEX.test(url)) { messageYoutubes.push(url) }
									return "<a target='_blank' href='" + (PROTOCOLREGEX.test(url) ? "" : "http://") + url + "'>" + url + "</a>"
								})
							messageElement.appendChild(messageText)

						// images
							for (var i in messageImages) {
								var messageImage = document.createElement("img")
									messageImage.className = "chat-message-image"
									messageImage.src = (PROTOCOLREGEX.test(messageImages[i]) ? "" : "http://") + messageImages[i]
								messageText.append(messageImage)
							}

						// audios
							for (var i in messageAudios) {
								var messageAudio = document.createElement("audio")
									messageAudio.className = "chat-message-audio"
									messageAudio.volume = USER.settings.volume || 0
									messageAudio.setAttribute("controls", true)
									messageAudio.setAttribute("controlsList", "nodownload")
								messageText.append(messageAudio)

								var fileType = messageAudios[i].split("?")[0].slice(-3).toLowerCase()
									fileType = (fileType == "wav" ? "wav" : fileType == "ogg" ? "ogg" : "mpeg")
								var source = document.createElement("source")
									source.src = (PROTOCOLREGEX.test(messageAudios[i]) ? "" : "http://") + messageAudios[i]
									source.setAttribute("type", "audio/" + fileType)
								messageAudio.appendChild(source)
							}

						// youtube
							for (var i in messageYoutubes) {
								var messageYoutube = document.createElement("iframe")
									messageYoutube.className = "chat-message-youtube"
									messageYoutube.height = "100%"
									messageYoutube.width = "100%"
									messageYoutube.setAttribute("allowfullscreen", true)
									if (messageYoutubes[i].includes("/embed/")) {
										messageYoutube.src = messageYoutubes[i]
									}
									else {
										var queryString = messageYoutubes[i].split("?")[1].split("&")
										var queryParameters = {}
										for (var i in queryString) {
											var pair = queryString[i].split("=")
											queryParameters[pair[0]] = pair[1]
										}
										messageYoutube.src = "https://www.youtube.com/embed/" + (queryParameters.v || "")
									}
								messageText.append(messageYoutube)
							}

						// return
							return messageElement
					} catch (error) {console.log(error)}
				}

			/* displayChatContent */
				function displayChatContent(message) {
					try {
						// validate
							if (!message || !message.display || !message.display.content) {
								return
							}
							var content = message.display.content

						// element
							var messageElement = document.createElement("div")
								messageElement.className = "content-chat"
								messageElement.id = "chat-" + message.id
								messageElement.setAttribute("content-id", content.id)
							ELEMENTS.chat.messages.appendChild(messageElement)
							
						// name
							var messageName = document.createElement("h3")
								messageName.className = "content-chat-name"
								messageName.innerText = content.name
							messageElement.appendChild(messageName)

						// open
							var messageForm = document.createElement("form")
								messageForm.className = "content-chat-form"
								messageForm.setAttribute("method", "post")
								messageForm.setAttribute("action", "javascript:;")
								messageForm.addEventListener(TRIGGERS.submit, submitContentReadChat)
							messageElement.appendChild(messageForm)

							var messageButton = document.createElement("button")
								messageButton.className = "content-chat-button minor-button"
								messageButton.title = "open content"
								messageButton.innerHTML = "&#x1f5fa;"
							messageForm.appendChild(messageButton)

						// arena
							if (content.type == "arena") {
								return displayChatContentArena(messageElement, content)
							}

						// text
							if (content.type == "text") {
								return displayChatContentText(messageElement, content)								
							}

						// image
							if (content.type == "image") {
								return displayChatContentImage(messageElement, content)
							}

						// audio
							if (content.type == "audio") {
								return displayChatContentAudio(messageElement, content)
							}

						// embed
							if (content.type == "embed") {
								return displayChatContentEmbed(messageElement, content)
							}

						// component
							if (content.type == "component") {
								return displayChatContentComponent(messageElement, content)
							}
					} catch (error) {console.log(error)}
				}

			/* displayChatContentArena */
				function displayChatContentArena(messageElement, content) {
					try {
						// element
							var messageDataContent = document.createElement("div")
								messageDataContent.className = "content-chat-data"
								messageDataContent.innerHTML = ""
							messageElement.appendChild(messageDataContent)

						// return
							return messageElement
					} catch (error) {console.log(error)}
				}

			/* displayChatContentText */
				function displayChatContentText(messageElement, content) {
					try {
						// element
							var messageDataContent = document.createElement("div")
								messageDataContent.className = "content-chat-data"
								messageDataContent.innerHTML = content.text
							messageElement.appendChild(messageDataContent)

						// return
							return messageElement
					} catch (error) {console.log(error)}
				}

			/* displayChatContentImage */
				function displayChatContentImage(messageElement, content) {
					try {
						// var url
							var url = content.url ? (content.url + (content.file ? ("?" + new Date().getTime()) : "")) : "#"

						// element
							var messageDataContent = document.createElement("img")
								messageDataContent.className = "content-chat-data content-image"
								messageDataContent.src = url
							messageElement.appendChild(messageDataContent)

						// return
							return messageElement
					} catch (error) {console.log(error)}
				}

			/* displayChatContentAudio */
				function displayChatContentAudio(messageElement, content) {
					try {
						// element
							var messageDataContent = document.createElement("audio")
								messageDataContent.className = "content-chat-data content-audio"
								messageDataContent.volume = USER.settings.volume || 0
								messageDataContent.setAttribute("controls", true)
								messageDataContent.setAttribute("controlsList", "nodownload")
							messageElement.appendChild(messageDataContent)

						// file
							if (content.url) {
								var fileType = content.url.slice(-3).toLowerCase()
									fileType = (fileType == "wav" ? "wav" : fileType == "ogg" ? "ogg" : "mpeg")
								var source = document.createElement("source")
									source.src = content.url
									source.setAttribute("type", "audio/" + fileType)
								messageDataContent.appendChild(source)
							}

						// return
							return messageElement
					} catch (error) {console.log(error)}
				}

			/* displayChatContentEmbed */
				function displayChatContentEmbed(messageElement, content) {
					try {
						// element
							var messageDataContent = document.createElement("div")
								messageDataContent.className = "content-chat-data"
							messageElement.appendChild(messageDataContent)

						// code
							if (content.code) {
								messageDataContent.innerText = content.code

								// youtube
									if (YOUTUBEURLREGEX.test(content.code)) {
										messageDataContent.innerHTML += content.code
									}
							}

						// embed
							else if (content.url) {
								messageDataContent.innerHTML = `<a target="_blank" href="` + content.url + `">` + content.url + `</a>`

								// youtube
									if (YOUTUBEURLREGEX.test(content.url)) {
										var messageYoutube = document.createElement("iframe")
											messageYoutube.className = "chat-message-youtube"
											messageYoutube.height = "100%"
											messageYoutube.width = "100%"
											messageYoutube.setAttribute("allowfullscreen", true)
											if (content.url.includes("/embed/")) {
												messageYoutube.src = content.url
											}
											else {
												var queryString = content.url.split("?")[1].split("&")
												var queryParameters = {}
												for (var i in queryString) {
													var pair = queryString[i].split("=")
													queryParameters[pair[0]] = pair[1]
												}
												messageYoutube.src = "https://www.youtube.com/embed/" + (queryParameters.v || "")
											}
										messageDataContent.append(messageYoutube)
									}
							}

						// return
							return messageElement
					} catch (error) {console.log(error)}
				}

			/* displayChatContentComponent */
				function displayChatContentComponent(messageElement, content) {
					try {
						// code
							try {
								var code = JSON.parse(content.code)
							} catch (error) {
								var code = {name: (content.text || "custom component"), type: "error", data: {error: "malformed JSON"}}
							}

						// display as search result
							return displayRulesSearchResult(code, messageElement.id + "-data")
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
										color: USER.settings.color ? USER.settings.color : null,
										sender: ELEMENTS.chat.send.sender.select.value,
										recipient: ELEMENTS.chat.send.recipients.select.querySelector("option[value='" + ELEMENTS.chat.send.recipients.select.value + "']").innerText,
										time: new Date().getTime(),
										text: ELEMENTS.chat.send.input.value
									}
								}
							}

						// color
							if (ELEMENTS.chat.send.sender.select.value == ELEMENTS.chat.send.sender.anonymous.value) {
								post.chat.display.color = null
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
							displayTool({target: ELEMENTS.tools.chatRadio, forceSet: true})
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
							displayTool({target: ELEMENTS.tools.chatRadio, forceSet: true})
					} catch (error) {console.log(error)}
				}

	/*** CONTENT ***/
		/** receive **/
			/* receiveContent */
				function receiveContent(content) {
					try {
						// selecting content?
							if ((!CONTENT || CONTENT.id !== content.id) && (USER.contentId == content.id)) {
								CONTENT = {id: USER.contentId}
							}

						// current content?
							if (CONTENT && CONTENT.id == content.id) {
								CONTENT = content.delete ? null : content
								window.CONTENT = CONTENT
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
								ELEMENTS.character.status.targeting.select.arena.innerHTML = ""
							}

						// sidebar panel
							displayContentPanel()

						// gametable
							displayContentGametable()

						// arena? --> targeting
							if (CONTENT && CONTENT.type == "arena") {
								displayCharacterListRecipients(null, CONTENT.arena.objects)
							}
					} catch (error) {console.log(error)}
				}

			/* displayContentPanel */
				function displayContentPanel() {
					try {
						// no content?
							if (!CONTENT) {
								ELEMENTS.content.element.setAttribute("mode", "none")
								ELEMENTS.content.choose.title.innerText = ""
								return
							}

						// name
							ELEMENTS.content.choose.title.innerText = CONTENT.name
							ELEMENTS.content.name.input.value = CONTENT.name

						// access
							ELEMENTS.content.access.select.element.value = CONTENT.access ? ELEMENTS.content.access.select.private.value : ELEMENTS.content.access.select.public.value
							ELEMENTS.content.access.form.setAttribute("visibility", (CONTENT && CONTENT.id && (CONTENT.userId == USER.id || CONTENT.gameUserId == USER.id)) ? true : false)

						// data
							ELEMENTS.content.url.input.value = CONTENT.url || null
							ELEMENTS.content.code.input.value = CONTENT.code || null

						// delete gate
							ELEMENTS.content.delete.gate.setAttribute("visibility", (CONTENT && CONTENT.id && (CONTENT.userId == USER.id || CONTENT.gameUserId == USER.id)) ? true : false)

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
								ELEMENTS.gametable.selected = ELEMENTS.gametable.grabbed = null
								return
							}

						// selection
							if (CONTENT.type !== "arena") {
								ELEMENTS.gametable.selected = ELEMENTS.gametable.grabbed = null
							}

						// arena
							if (CONTENT.type == "arena") {
								displayContentGametableArena()
								return
							}

						// text
							if (CONTENT.type == "text") {
								displayContentGametableText()
								return
							}

						// image
							if (CONTENT.type == "image") {
								displayContentGametableImage()
								return
							}

						// audio
							if (CONTENT.type == "audio") {
								displayContentGametableAudio()
								return
							}

						// embed
							if (CONTENT.type == "embed") {
								displayContentGametableEmbed()
								return
							}

						// component
							if (CONTENT.type == "component") {
								ELEMENTS.gametable.element.innerHTML = ""
								return
							}
					} catch (error) {console.log(error)}
				}

			/* displayContentGametableArena */
				function displayContentGametableArena() {
					try {
						// element
							var arena = ELEMENTS.gametable.element.querySelector(".content-arena")

						// new
							if (!arena) {
								// canvas
									ELEMENTS.gametable.element.innerHTML = ""
										arena = document.createElement("canvas")
										arena.className = "content-arena"
										arena.setAttribute("tabindex", 1)
										arena.addEventListener(TRIGGERS.mouseenter, focusContentArena)
										arena.addEventListener(TRIGGERS.mouseleave, blurContentArena)
										arena.addEventListener(TRIGGERS.rightclick, measureContentArena)
										arena.addEventListener(TRIGGERS.doubleclick, grabContentArena)
										arena.addEventListener(TRIGGERS.mousedown, grabContentArena)
										arena.addEventListener(TRIGGERS.scroll, zoomContentArena, {passive: true})
									ELEMENTS.gametable.element.appendChild(arena)

								// panning
									var directions = ["-y", "-y -x", "-x", "-x y", "y", "y x", "x", "x -y"]
									for (var i in directions) {
										var panningOverlay = document.createElement("div")
											panningOverlay.setAttribute("directions", directions[i])
											panningOverlay.setAttribute("multiplier", 1)
											panningOverlay.className = "content-arena-panning"
											panningOverlay.addEventListener(TRIGGERS.mouseenter, startPanningContentArena)
											panningOverlay.addEventListener(TRIGGERS.mouseleave, stopPanningContentArena)
										ELEMENTS.gametable.element.appendChild(panningOverlay)

										var panningOverlay = document.createElement("div")
											panningOverlay.setAttribute("directions", directions[i])
											panningOverlay.setAttribute("multiplier", 2)
											panningOverlay.className = "content-arena-panning"
											panningOverlay.addEventListener(TRIGGERS.mouseenter, startPanningContentArena)
											panningOverlay.addEventListener(TRIGGERS.mouseleave, stopPanningContentArena)
										ELEMENTS.gametable.element.appendChild(panningOverlay)
									}
							}

						// save canvas / context
							ELEMENTS.gametable.canvas.element = arena
							ELEMENTS.gametable.canvas.context = ELEMENTS.gametable.canvas.element.getContext("2d")

						// draw canvas
							displayContentArena()
					} catch (error) {console.log(error)}
				}

			/* displayContentGametableText */
				function displayContentGametableText() {
					try {
						// element
							var text = ELEMENTS.gametable.element.querySelector(".content-text")

						// new
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
					} catch (error) {console.log(error)}
				}

			/* displayContentGametableImage */
				function displayContentGametableImage() {
					try {
						// element
							var image = ELEMENTS.gametable.element.querySelector(".content-image")

						// new
							if (!image) {
								// grabbable image
									ELEMENTS.gametable.element.innerHTML = ""
										image = document.createElement("img")
										image.className = "content-image content-grabbable"
										image.addEventListener(TRIGGERS.mousedown, grabContent)
										image.addEventListener(TRIGGERS.scroll, zoomContent, {passive: true})
									ELEMENTS.gametable.element.appendChild(image)
							}

						// reset
							image.src = ""
							image.style.height = "auto"
							image.style.width = "auto"

							var rect = ELEMENTS.gametable.element.getBoundingClientRect()
							image.style.top = (rect.height / 2) + "px"
							image.style.left = (rect.width / 2) + "px"

						// update
							if (CONTENT.url) {
								image.src = CONTENT.url + (CONTENT.file ? ("?" + new Date().getTime()) : "")
								image.addEventListener("load", function() {
									var rect = image.getBoundingClientRect()
										image.setAttribute("data-width", rect.width)
										image.setAttribute("data-height", rect.height)
								})
							}

						// zoom
							CONTENT.zoomPower = 0
							CONTENT.zoom = 1
					} catch (error) {console.log(error)}
				}

			/* displayContentGametableAudio */
				function displayContentGametableAudio() {
					try {
						// element
							var audio = ELEMENTS.gametable.element.querySelector(".content-audio")

						// new
							if (!audio) {
								// audio player
									ELEMENTS.gametable.element.innerHTML = ""
										audio = document.createElement("audio")
										audio.className = "content-audio"
										audio.volume = USER.settings.volume || 0
										audio.setAttribute("controls", true)
										audio.setAttribute("controlsList", "nodownload")
									ELEMENTS.gametable.element.appendChild(audio)
							}

						// remove old source
							var source = audio.querySelector("source")
							if (source) { source.remove() }
							audio.load()

						// update
							if (CONTENT.url) {
								// add new source
									var fileType = CONTENT.url.slice(-3).toLowerCase()
										fileType = (fileType == "wav" ? "wav" : fileType == "ogg" ? "ogg" : "mpeg")
									var source = document.createElement("source")
										source.setAttribute("type", "audio/" + fileType)
										source.setAttribute("src", CONTENT.url)
									audio.appendChild(source)
									audio.load()
							}
					} catch (error) {console.log(error)}
				}

			/* displayContentGametableEmbed */
				function displayContentGametableEmbed() {
					try {
						// code
							if (CONTENT.code) {
								// element
									var embed = ELEMENTS.gametable.element.querySelector("div.content-embed")

								// new
									if (!embed) {
										// embedded html
											ELEMENTS.gametable.element.innerHTML = ""
												embed = document.createElement("div")
												embed.className = "content-embed"
											ELEMENTS.gametable.element.appendChild(embed)
									}

								// update
									if (embed.innerHTML !== CONTENT.code) {
										embed.innerHTML = CONTENT.code
									}

								return
							}

						// url
							if (CONTENT.url) {
								// element
									var embed = ELEMENTS.gametable.element.querySelector("iframe.content-embed")

								// new
									if (!embed) {
										// iframe
											ELEMENTS.gametable.element.innerHTML = ""
												embed = document.createElement("iframe")
												embed.className = "content-embed"
												embed.setAttribute("frameborder", "none")
											ELEMENTS.gametable.element.appendChild(embed)
									}

								// youtube
									if (YOUTUBEURLREGEX.test(CONTENT.url)) {
										if (CONTENT.url.includes("/embed/")) {
											youtubeUrl = CONTENT.url
										}
										else {
											var queryString = CONTENT.url.split("?")[1].split("&")
											var queryParameters = {}
											for (var i in queryString) {
												var pair = queryString[i].split("=")
												queryParameters[pair[0]] = pair[1]
											}
											youtubeUrl = "https://www.youtube.com/embed/" + (queryParameters.v || "")
										}

										if (embed.src !== youtubeUrl) {
											embed.setAttribute("allowfullscreen", true)
											embed.src = youtubeUrl
											return
										}
									}

								// update
									if (embed.src !== CONTENT.url) {
										embed.src = CONTENT.url
									}

								return
							}

						// neither
							ELEMENTS.gametable.element.innerHTML = ""
					} catch (error) {console.log(error)}
				}

			/* displayContentList */
				function displayContentList(contentList) {
					try {
						// contentList?
							if (contentList) { CONTENTLIST = contentList }

						// close option?
							ELEMENTS.content.choose.select.none.disabled = (CONTENT && CONTENT.id) ? false : true
							if (!CONTENT) {
								ELEMENTS.content.choose.select.element.value = ELEMENTS.content.choose.select.new.value
							}

						// no game?
							if (!GAME) {
								CONTENTLIST = null
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
								// find content
									var content = contentList[i]
									var option = ELEMENTS.content.choose.select.element.querySelector("option[value='" + content.id + "']")

								// delete?
									if (option && content.delete) {
										if (ELEMENTS.content.choose.select.element.value == option.value) {
											ELEMENTS.content.choose.select.element.value = ELEMENTS.content.choose.select.new.value
										}
										option.remove()
										continue
									}

								// rename
									if (option) {
										option.innerText = content.name
									}

								// create
									else {
										option = document.createElement("option")
										option.value = content.id
										option.innerText = content.name
										ELEMENTS.content.choose.select[content.type].appendChild(option)
									}
							}

						// selected?
							if (CONTENT && CONTENT.id) {
								var selectedOption = ELEMENTS.content.choose.select.element.querySelector("option[value='" + CONTENT.id + "']")
								if (selectedOption) {
									ELEMENTS.content.choose.select.element.value = CONTENT.id
								}
							}
							else {
								ELEMENTS.content.choose.select.element.value = ELEMENTS.content.choose.select.new.value
							}


						// arena objects
							displayContentArenaObjectList(null, contentList)
					} catch (error) {console.log(error)}
				}

			/* displayContentListSamples */
				function displayContentListSamples() {
					try {
						// races
							var container = ELEMENTS.content.code.search.races
							for (var i in RULES.races) {
								var option = document.createElement("option")
									option.value = "race-" + i
									option.innerText = i
								container.appendChild(option)
							}

						// skills
							var container = ELEMENTS.content.code.search.skills
							for (var i in RULES.skills) {
								for (var j in RULES.skills[i]) {
									var option = document.createElement("option")
										option.value = "skill-" + i + "-" + RULES.skills[i][j].name
										option.innerText = RULES.skills[i][j].name.replace(/_/g," ")
									container.appendChild(option)
								}
							}

						// conditions
							var container = ELEMENTS.content.code.search.conditions
							for (var i in RULES.conditions) {
								var option = document.createElement("option")
									option.value = "condition-" + i
									option.innerText = i.replace(/_/g," ")
								container.appendChild(option)
							}

						// items
							var container = ELEMENTS.content.code.search.items
							for (var i in RULES.items) {
								for (var j in RULES.items[i]) {
									var option = document.createElement("option")
										option.value = "item-" + i + "-" + RULES.items[i][j].name
										option.innerText = RULES.items[i][j].name.replace(/_/g," ")
									container.appendChild(option)
								}
							}
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

						// sidebar panel
							displayContentArenaPanel()

						// gametable
							displayContentArenaImages()
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

			/* displayContentArenaObjectList */
				function displayContentArenaObjectList(characterList, contentList) {
					try {
						// no game?
							if (!GAME) {
								ELEMENTS.content.objects.select.myCharacters.innerHTML = ""
								ELEMENTS.content.objects.select.sharedCharacters.innerHTML = ""
								ELEMENTS.content.objects.select.images.innerHTML = ""
							}

						// loop through characterList
							for (var i in characterList) {
								// find option
									var character = characterList[i]
									var contentOption = ELEMENTS.content.objects.select.element.querySelector("option[value='" + character.id + "']")

								// delete?
									if (contentOption && character.delete) {
										if (ELEMENTS.content.objects.select.element.value == contentOption.value) {
											ELEMENTS.content.objects.select.element.value = ELEMENTS.content.objects.select.blank.value
										}
										contentOption.remove()
									}

								// rename
									else if (contentOption) {
										contentOption.innerText = character.name
									}

								// create
									else {
										contentOption = document.createElement("option")
										contentOption.value = character.id
										contentOption.innerText = character.name
										contentOption.setAttribute("type", "character")

										if (character.userId == USER.id) {
											ELEMENTS.content.objects.select.myCharacters.appendChild(contentOption)
										}
										else {
											ELEMENTS.content.objects.select.sharedCharacters.appendChild(contentOption)	
										}
									}
							}

						// loop through contentList
							for (var i in contentList) {
								// only images
									if (!contentList[i].delete && contentList[i].type !== "image") {
										continue
									}

								// find option
									var content = contentList[i]
									var contentOption = ELEMENTS.content.objects.select.images.querySelector("option[value='" + content.id + "']")

								// delete?
									if (contentOption && content.delete) {
										if (ELEMENTS.content.objects.select.element.value == contentOption.value) {
											ELEMENTS.content.objects.select.element.value = ELEMENTS.content.objects.select.blank.value
										}
										contentOption.remove()
									}
									else if (content.delete) {
										continue
									}

								// rename
									else if (contentOption) {
										contentOption.innerText = content.name
									}

								// create
									else {
										contentOption = document.createElement("option")
										contentOption.value = content.id
										contentOption.innerText = content.name
										contentOption.setAttribute("type", "content")
										ELEMENTS.content.objects.select.images.appendChild(contentOption)
									}
							}
					} catch (error) {console.log(error)}
				}

			/* displayContentArenaObjectListing */
				function displayContentArenaObjectListing(object) {
					try {
						// not owned
							if (CONTENT.userId !== USER.id && object.userId !== USER.id && (!CHARACTER || object.characterId !== CHARACTER.id)) {
								return
							}

						// listing
							var listing = ELEMENTS.content.objects.list.querySelector("#arena-object-" + object.id)

						// create
							if (!listing) {
								// block
									var listing = document.createElement("div")
										listing.id = "arena-object-" + object.id
										listing.className = "arena-object"
										listing.addEventListener(TRIGGERS.click, selectContentArenaObject)
									ELEMENTS.content.objects.list.appendChild(listing)

								// inputs
									// locked
										var labelLocked = document.createElement("label")
											labelLocked.className = "arena-object-locked-label"
										listing.appendChild(labelLocked)

										var spanLocked = document.createElement("div")
											spanLocked.innerHTML = "&#x1f512;"
											spanLocked.title = "lock"
										labelLocked.appendChild(spanLocked)

										var inputLocked = document.createElement("input")
											inputLocked.className = "arena-object-locked"
											inputLocked.setAttribute("property", "locked")
											inputLocked.type = "checkbox"
											inputLocked.title = "lock"
											inputLocked.addEventListener(TRIGGERS.change, submitContentArenaObjectUpdate)
										labelLocked.appendChild(inputLocked)

									// visible
										var labelVisible = document.createElement("label")
											labelVisible.className = "arena-object-visible-label"
										listing.appendChild(labelVisible)

										var spanVisible = document.createElement("div")
											spanVisible.innerHTML = "&#x1f441;"
											spanVisible.title = "visibility"
										labelVisible.appendChild(spanVisible)

										var inputVisible = document.createElement("input")
											inputVisible.className = "arena-object-visible"
											inputVisible.setAttribute("property", "visible")
											inputVisible.type = "checkbox"
											inputVisible.title = "visibility"
											inputVisible.addEventListener(TRIGGERS.change, submitContentArenaObjectUpdate)
										labelVisible.appendChild(inputVisible)

									// z
										var upForm = document.createElement("form")
											upForm.className = "arena-object-up-form"
											upForm.setAttribute("method", "post")
											upForm.setAttribute("action", "javascript:;")
											upForm.setAttribute("property", "z")
											upForm.setAttribute("value", 1)
											upForm.addEventListener(TRIGGERS.submit, submitContentArenaObjectUpdate)
										listing.appendChild(upForm)

										var upButton = document.createElement("button")
											upButton.className = "arena-object-up"
											upButton.title = "raise object"
											upButton.innerHTML = "&#x1f53c;"
										upForm.appendChild(upButton)

										var downForm = document.createElement("form")
											downForm.className = "arena-object-up-form"
											downForm.setAttribute("method", "post")
											downForm.setAttribute("action", "javascript:;")
											downForm.setAttribute("property", "z")
											downForm.setAttribute("value", -1)
											downForm.addEventListener(TRIGGERS.submit, submitContentArenaObjectUpdate)
										listing.appendChild(downForm)

										var downButton = document.createElement("button")
											downButton.className = "arena-object-down"
											downButton.title = "lower object"
											downButton.innerHTML = "&#x1f53d;"
										downForm.appendChild(downButton)

									// duplicate
										var duplicateForm = document.createElement("form")
											duplicateForm.className = "arena-object-duplicate-form"
											duplicateForm.setAttribute("method", "post")
											duplicateForm.setAttribute("action", "javascript:;")
											duplicateForm.addEventListener(TRIGGERS.submit, submitContentArenaObjectDuplicate)
										listing.appendChild(duplicateForm)

										var duplicateButton = document.createElement("button")
											duplicateButton.className = "arena-object-duplicate"
											duplicateButton.title = "duplicate object"
											duplicateButton.innerHTML = "&#x1f4d1;"
										duplicateForm.appendChild(duplicateButton)

									// remove
										var removeForm = document.createElement("form")
											removeForm.className = "arena-object-remove-form"
											removeForm.setAttribute("method", "post")
											removeForm.setAttribute("action", "javascript:;")
											removeForm.addEventListener(TRIGGERS.submit, submitContentArenaObjectDelete)
										listing.appendChild(removeForm)

										var removeButton = document.createElement("button")
											removeButton.className = "arena-object-remove"
											removeButton.title = "remove object"
											removeButton.innerText = "x"
										removeForm.appendChild(removeButton)

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

									// image
										var labelImage = document.createElement("label")
											labelImage.className = "arena-object-label arena-object-image"
										listing.appendChild(labelImage)

										var inputImage = document.createElement("input")
											inputImage.className = "arena-object-input"
											inputImage.setAttribute("property", "image")
											inputImage.placeholder = "image url"
											inputImage.type = "text"
											inputImage.addEventListener(TRIGGERS.change, submitContentArenaObjectUpdate)
										labelImage.appendChild(inputImage)

										var spanImage = document.createElement("span")
											spanImage.className = "arena-object-label-text"
											spanImage.innerText = "image"
										labelImage.appendChild(spanImage)

										var labelEmpty = document.createElement("label")
											labelEmpty.className = "arena-object-label arena-object-empty"
										listing.appendChild(labelEmpty)

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

									// glow
										var labelGlow = document.createElement("label")
											labelGlow.className = "arena-object-label"
										listing.appendChild(labelGlow)

										var inputGlow = document.createElement("input")
											inputGlow.className = "arena-object-input"
											inputGlow.setAttribute("property", "glow")
											inputGlow.step = 0.05
											inputGlow.min = 0
											inputGlow.max = 1
											inputGlow.type = "range"
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
											spanCorners.innerText = "roundness"
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

										var labelEmpty = document.createElement("label")
											labelEmpty.className = "arena-object-label arena-object-empty"
										listing.appendChild(labelEmpty)

									// textSize
										var labelTextSize = document.createElement("label")
											labelTextSize.className = "arena-object-label"
										listing.appendChild(labelTextSize)

										var inputTextSize = document.createElement("input")
											inputTextSize.className = "arena-object-input"
											inputTextSize.setAttribute("property", "textSize")
											inputTextSize.step = 1
											inputTextSize.min = 0
											inputTextSize.max = 100
											inputTextSize.type = "number"
											inputTextSize.addEventListener(TRIGGERS.change, submitContentArenaObjectUpdate)
										labelTextSize.appendChild(inputTextSize)

										var spanTextSize = document.createElement("span")
											spanTextSize.className = "arena-object-label-text"
											spanTextSize.innerText = "text size"
										labelTextSize.appendChild(spanTextSize)

									// textColor
										var labelTextColor = document.createElement("label")
											labelTextColor.className = "arena-object-label"
										listing.appendChild(labelTextColor)

										var inputTextColor = document.createElement("input")
											inputTextColor.className = "arena-object-input"
											inputTextColor.setAttribute("property", "textColor")
											inputTextColor.type = "color"
											inputTextColor.addEventListener(TRIGGERS.change, submitContentArenaObjectUpdate)
										labelTextColor.appendChild(inputTextColor)

										var spanTextColor = document.createElement("span")
											spanTextColor.className = "arena-object-label-text"
											spanTextColor.innerText = "text color"
										labelTextColor.appendChild(spanTextColor)

									// textPlacement
										var labelTextPlacement = document.createElement("label")
											labelTextPlacement.className = "arena-object-label"
										listing.appendChild(labelTextPlacement)

										var inputTextPlacement = document.createElement("select")
											inputTextPlacement.className = "arena-object-select"
											inputTextPlacement.setAttribute("property", "textPlacement")
											inputTextPlacement.addEventListener(TRIGGERS.change, submitContentArenaObjectUpdate)
										labelTextPlacement.appendChild(inputTextPlacement)

										var options = ["top", "left", "center", "right", "bottom", "none"]
										for (var i in options) {
											var option = document.createElement("option")
												option.value = options[i]
												option.innerText = options[i]
											inputTextPlacement.appendChild(option)
										}

										var spanTextPlacement = document.createElement("span")
											spanTextPlacement.className = "arena-object-label-text"
											spanTextPlacement.innerText = "placement"
										labelTextPlacement.appendChild(spanTextPlacement)

									// textShadow
										var labelTextShadow = document.createElement("label")
											labelTextShadow.className = "arena-object-label"
										listing.appendChild(labelTextShadow)

										var inputTextShadow = document.createElement("input")
											inputTextShadow.className = "arena-object-input"
											inputTextShadow.setAttribute("property", "textShadow")
											inputTextShadow.type = "color"
											inputTextShadow.addEventListener(TRIGGERS.change, submitContentArenaObjectUpdate)
										labelTextShadow.appendChild(inputTextShadow)

										var spanTextShadow = document.createElement("span")
											spanTextShadow.className = "arena-object-label-text"
											spanTextShadow.innerText = "text shadow"
										labelTextShadow.appendChild(spanTextShadow)
							}

						// find
							else {
								var inputLocked = listing.querySelector("input[property='locked']")
								var inputVisible = listing.querySelector("input[property='visible']")
								var inputX = listing.querySelector("input[property='x']")
								var inputY = listing.querySelector("input[property='y']")
								var inputWidth = listing.querySelector("input[property='width']")
								var inputHeight = listing.querySelector("input[property='height']")
								var inputImage = listing.querySelector("input[property='image']")
								var inputOpacity = listing.querySelector("input[property='opacity']")
								var inputColor = listing.querySelector("input[property='color']")
								var inputGlow = listing.querySelector("input[property='glow']")
								var inputShadow = listing.querySelector("input[property='shadow']")
								var inputCorners = listing.querySelector("input[property='corners']")
								var inputRotation = listing.querySelector("input[property='rotation']")
								var inputText = listing.querySelector("input[property='text']")
								var inputTextSize = listing.querySelector("input[property='textSize']")
								var inputTextColor = listing.querySelector("input[property='textColor']")
								var inputTextPlacement = listing.querySelector("select[property='textPlacement']")
								var inputTextShadow = listing.querySelector("input[property='textShadow']")
							}

						// set values
							var activeElement = document.activeElement
							listing.setAttribute("selected", ELEMENTS.gametable.selected && Object.keys(ELEMENTS.gametable.selected).includes(object.id))
							if (										listing.style.order			!== object.z) { 			listing.style.order = object.z || 0 }
							if (										inputLocked.checked 		!== object.locked) { 		inputLocked.checked = object.locked || false }
							if (										inputVisible.checked 		!== object.visible) { 		inputVisible.checked = object.visible || false }
							if (inputX != activeElement && 				inputX.value 				!== object.x) { 			inputX.value = object.x || 0 }
							if (inputY != activeElement && 				inputY.value 				!== object.y) { 			inputY.value = object.y || 0 }
							if (inputWidth != activeElement && 			inputWidth.value 			!== object.width) { 		inputWidth.value = object.width || 0 }
							if (inputHeight != activeElement && 		inputHeight.value 			!== object.height) { 		inputHeight.value = object.height || 0 }
							if (inputImage != activeElement && 			inputImage.value 			!== object.image) { 		inputImage.value = object.image || "" }
							if (inputOpacity != activeElement && 		inputOpacity.value 			!== object.opacity) { 		inputOpacity.value = object.opacity || 0 }
							if (inputColor != activeElement && 			inputColor.value 			!== object.color) { 		inputColor.value = object.color || ELEMENTS.gametable.canvas.gridColor }
							if (inputGlow != activeElement && 			inputGlow.value 			!== object.glow) { 			inputGlow.value = object.glow || 0 }
							if (inputShadow != activeElement && 		inputShadow.value 			!== object.shadow) { 		inputShadow.value = object.shadow || ELEMENTS.gametable.canvas.gridBackground }
							if (inputCorners != activeElement && 		inputCorners.value 			!== object.corners) { 		inputCorners.value = object.corners || 0 }
							if (inputRotation != activeElement && 		inputRotation.value 		!== object.rotation) { 		inputRotation.value = object.rotation || 0 }
							if (inputText != activeElement && 			inputText.value 			!== object.text) { 			inputText.value = object.text || "" }
							if (inputTextSize != activeElement && 		inputTextSize.value 		!== object.textSize) { 		inputTextSize.value = object.textSize || 0 }
							if (inputTextColor != activeElement && 		inputTextColor.value 		!== object.textColor) { 	inputTextColor.value = object.textColor || ELEMENTS.gametable.canvas.gridColor }
							if (inputTextPlacement != activeElement && 	inputTextPlacement.value 	!== object.textPlacement) { inputTextPlacement.value = object.textPlacement || null }
							if (inputTextShadow != activeElement && 	inputTextShadow.value 		!== object.textShadow) { 	inputTextShadow.value = object.textShadow || ELEMENTS.gametable.canvas.gridBackground }
					} catch (error) {console.log(error)}
				}

			/* displayContentArenaImages */
				function displayContentArenaImages() {
					try {
						// sort objects
							var sortedKeys = Object.keys(CONTENT.arena.objects) || []
								sortedKeys = sortedKeys.sort(function(a, b) {
									return CONTENT.arena.objects[a].z - CONTENT.arena.objects[b].z
								})

						// update images
							var unloadedCount = 0
							for (var i in sortedKeys) {
								// get url
									var key = sortedKeys[i]
									var imageURL = CONTENT.arena.objects[key].image
									if (!imageURL) {
										continue
									}

								// new
									if (!ELEMENTS.gametable.canvas.images[key]) {
										ELEMENTS.gametable.canvas.images[key] = document.createElement("img")
									}

								// update src
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

						// measure
							displayContentArenaRuler()

						// display grid
							displayContentArenaGrid()

						// signals
							if (CONTENT.arena && CONTENT.arena.signals) {
								for (var i in SIGNALS) {
									if (!CONTENT.arena.signals[i]) {
										delete SIGNALS[i]
									}
								}

								var now = new Date().getTime()
								var expiration = now + 500
								for (var i in CONTENT.arena.signals) {
									if (!SIGNALS[i] && CONTENT.arena.signals[i].expiration > now) {
										SIGNALS[i] = {
											x: CONTENT.arena.signals[i].x,
											y: CONTENT.arena.signals[i].y,
											expiration: expiration
										}
									}
								}

								displayContentArenaSignals()
							}
					} catch (error) {console.log(error)}
				}

			/* displayContentArenaObject */
				function displayContentArenaObject(object) {
					try {
						// not visible?
							var visibilityMultiplier = 1
							if (!object.visible) {
								// half opacity if arena owner or object creator
									if (object.userId == USER.id || CONTENT.userId == USER.id) {
										visibilityMultiplier = 0.5
									}

								// skip for others
									else {
										return
									}
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
								opacity: object.opacity * visibilityMultiplier,
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

						// selected
							if (ELEMENTS.gametable.selected && ELEMENTS.gametable.selected[object.id]) {
								options.shadow = ELEMENTS.gametable.canvas.gridHighlight
								options.blur = cellSize
							}

						// text
							if (object.text && object.textSize && object.textPlacement && object.textPlacement !== "none") {
								options.textSize = (object.textSize || 0) * cellSize / 100
								options.alignment = object.textPlacement == "left" ? "right" : object.textPlacement == "right" ? "left" : "center"
								options.textX = object.textPlacement == "left" ? (x - options.textSize / 4) : object.textPlacement == "right" ? (x + width + options.textSize / 4) : (x + width / 2)
								options.textY = object.textPlacement == "top" ? (y + height + options.textSize / 2) : object.textPlacement == "bottom" ? (y - options.textSize / 2) : (y + height / 2)
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
								FUNCTIONS.drawText(ELEMENTS.gametable.canvas.element, ELEMENTS.gametable.canvas.context, options.textX, options.textY, object.text, {color: object.textColor, blur: cellSize / 10, shadow: object.textShadow, size: options.textSize, alignment: options.alignment})
							}
					} catch (error) {console.log(error)}
				}

			/* displayContentArenaSignals */
				function displayContentArenaSignals(partOfLoop) {
					try {
						// no signals
							if (!SIGNALS || !Object.keys(SIGNALS)) {
								return
							}

						// non-expired signals?
							var signals = []
							var now = new Date().getTime()
							for (var i in SIGNALS) {
								if (SIGNALS[i].expiration - now > 0) {
									signals.push(SIGNALS[i])
								}
							}

						// dimensions
							if (signals.length) {
								var cellSize = Math.round(ELEMENTS.gametable.canvas.cellSize)
						
								for (var i in signals) {
									var timeRemaining = signals[i].expiration - now
									if (timeRemaining > 0) {
										var x = signals[i].x * cellSize
										var y = signals[i].y * cellSize
										var radius = timeRemaining
										FUNCTIONS.drawCircle(ELEMENTS.gametable.canvas.element, ELEMENTS.gametable.canvas.context, x, y, radius, {border: 2, color: "white"})
									}
								}

								setTimeout(function() {
									displayContentArenaSignals(true)
								}, 10)

								return
							}

						// from loop?
							else if (partOfLoop) {
								displayContentArenaImages()
							}
					} catch (error) {console.log(error)}
				}

			/* displayContentArenaRuler */
				function displayContentArenaRuler() {
					try {
						// validate
							if (ELEMENTS.gametable.canvas.measureStartX === null || ELEMENTS.gametable.canvas.measureStartY === null || ELEMENTS.gametable.canvas.cursorX === null || ELEMENTS.gametable.canvas.cursorY === null) {
								return
							}

						// cellSize
							var cellSize = Math.round(ELEMENTS.gametable.canvas.cellSize)

						// snap
							var startX = ELEMENTS.gametable.canvas.measureStartX
							var startY = ELEMENTS.gametable.canvas.measureStartY
							var endX = Math.round(ELEMENTS.gametable.canvas.cursorX * 2) / 2
							var endY = Math.round(ELEMENTS.gametable.canvas.cursorY * 2) / 2

						// distance
							var distance = Math.round(Math.pow(Math.pow(startX - endX, 2) + Math.pow(startY - endY, 2), (1 / 2)))
								distance = distance + " (" + (distance * 5) + ")"

						// scale
							startX = startX * cellSize
							startY = startY * cellSize
							endX = endX  * cellSize
							endY = endY * cellSize

						// midpoint
							var midX = (startX + endX) / 2
							var midY = (startY + endY) / 2

						// line
							FUNCTIONS.drawLine(ELEMENTS.gametable.canvas.element, ELEMENTS.gametable.canvas.context, startX, startY, endX, endY, {color: ELEMENTS.gametable.canvas.gridColor, opacity: 1, border: cellSize / 10})

						// text
							FUNCTIONS.drawText(ELEMENTS.gametable.canvas.element, ELEMENTS.gametable.canvas.context, midX, midY, distance, {color: ELEMENTS.gametable.canvas.gridColor, blur: cellSize / 10, shadow: ELEMENTS.gametable.canvas.gridBackground, size: cellSize / 2})
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
							var thickness = cellSize / 50

						// x
							for (var x = pannedLeft; x < pannedRight; x++) {
								if (x % cellSize == 0) {
									FUNCTIONS.drawLine(ELEMENTS.gametable.canvas.element, ELEMENTS.gametable.canvas.context, x, pannedBottom, x, pannedTop, {color: ELEMENTS.gametable.canvas.gridColor, opacity: 0.5, border: thickness})
								}
							}

						// y
							for (var y = pannedBottom; y < pannedTop; y++) {
								if (y % cellSize == 0) {
									FUNCTIONS.drawLine(ELEMENTS.gametable.canvas.element, ELEMENTS.gametable.canvas.context, pannedLeft, y, pannedRight, y, {color: ELEMENTS.gametable.canvas.gridColor, opacity: 0.5, border: thickness})
								}
							}

						// origin
							FUNCTIONS.drawCircle(ELEMENTS.gametable.canvas.element, ELEMENTS.gametable.canvas.context, 0, 0, (ELEMENTS.gametable.canvas.cellSize / 10), {color: ELEMENTS.gametable.canvas.gridColor, opacity: 0.5})
					} catch (error) {console.log(error)}
				}

		/** submit **/
			/* submitContentRead */
				function submitContentRead(event) {
					try {
						// no search
							if (!ELEMENTS.content.choose.select.element.value) {
								return false
							}

						// select value
							var value = ELEMENTS.content.choose.select.element.value

						// none
							if (value == ELEMENTS.content.choose.select.none.value) {
								var post = {
									action: "unreadContent",
									content: {
										userId: USER ? USER.id : null,
										gameId: GAME ? GAME.id : null,
										id: CONTENT ? CONTENT.id : null
									}
								}

								if (!CONTENT) {
									return false
								}

								CONTENT = null
								displayContent()
								displayContentList()
							}

						// create
							else if (value == ELEMENTS.content.choose.select.new.arena.value) {
								var post = {
									action: "createContent",
									content: {
										userId: USER ? USER.id : null,
										gameId: GAME ? GAME.id : null,
										type: "arena"
									}
								}
							}
							else if (value == ELEMENTS.content.choose.select.new.text.value) {
								var post = {
									action: "createContent",
									content: {
										userId: USER ? USER.id : null,
										gameId: GAME ? GAME.id : null,
										type: "text"
									}
								}
							}
							else if (value == ELEMENTS.content.choose.select.new.image.value) {
								var post = {
									action: "createContent",
									content: {
										userId: USER ? USER.id : null,
										gameId: GAME ? GAME.id : null,
										type: "image"
									}
								}
							}
							else if (value == ELEMENTS.content.choose.select.new.audio.value) {
								var post = {
									action: "createContent",
									content: {
										userId: USER ? USER.id : null,
										gameId: GAME ? GAME.id : null,
										type: "audio"
									}
								}
							}
							else if (value == ELEMENTS.content.choose.select.new.embed.value) {
								var post = {
									action: "createContent",
									content: {
										userId: USER ? USER.id : null,
										gameId: GAME ? GAME.id : null,
										type: "embed"
									}
								}
							}
							else if (value == ELEMENTS.content.choose.select.new.component.value) {
								var post = {
									action: "createContent",
									content: {
										userId: USER ? USER.id : null,
										gameId: GAME ? GAME.id : null,
										type: "component"
									}
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
							var value = event.target.closest(".content-chat").getAttribute("content-id")

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
							displayTool({target: ELEMENTS.tools.contentRadio, forceSet: true})
					} catch (error) {console.log(error)}
				}

			/* submitContentComponentSearch */
				function submitContentComponentSearch(event) {
					try {
						// no search
							if (!ELEMENTS.content.code.select.value) {
								return false
							}

						// identify value
							var value = ELEMENTS.content.code.select.value.split("-")
							var type = value.shift()
							var name = value.join("-")

						// invalid search
							if (!name || !type || !["race", "skill", "condition", "item"].includes(type)) {
								return false
							}

						// find in rules
							if (type == "race") {
								var sample = FUNCTIONS.duplicateObject(RULES.races[name])
							}
							else if (type == "skill") {
									name = name.split("-")
								var statistic = name.shift()
									name = name.join("-")
								var sample = FUNCTIONS.duplicateObject(RULES.skills[statistic].find(function(i) { return i.name == name }))
									sample.statistic = statistic
							}
							else if (type == "condition") {
								var sample = FUNCTIONS.duplicateObject(RULES.conditions[name])
							}
							else if (type == "item") {
									name = name.split("-")
								var category = name.shift()
									name = name.join("-")
								var sample = FUNCTIONS.duplicateObject(RULES.items[category].find(function(i) { return i.name == name }))
							}

						// sample?
							if (!sample) {
								return false
							}

						// reformat
							sample = {
								addable: true,
								type: type,
								data: sample
							}

						// populate pre
							ELEMENTS.content.code.sample.innerText = JSON.stringify(sample, null, 2)
							document.activeElement.blur()
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
									access: ELEMENTS.content.access.select.element.value
								}
							}

						// validate
							if (!post.content.id) {
								FUNCTIONS.showToast({success: false, message: "no content selected"})
								return
							}
							if (post.content.access == ELEMENTS.content.access.select.public.value) {
								post.content.access = null
							}
							if (post.content.access == ELEMENTS.content.access.select.private.value) {
								post.content.access = CONTENT.userId
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
				// function submitContentUpdateFile(event) {
				// 	try {
				// 		ELEMENTS.content.upload.input.click()
				// 		ELEMENTS.content.upload.input.addEventListener(TRIGGERS.change, function(event) {
				// 			if (ELEMENTS.content.upload.input.value && ELEMENTS.content.upload.input.value.length) {
				// 				// start reading
				// 					var file = ELEMENTS.content.upload.input.files[0]
				// 					var reader = new FileReader()
				// 						reader.readAsBinaryString(file)

				// 				// end reading
				// 					reader.onload = function(event) {
				// 						try {
				// 							// parse content
				// 								var post = {
				// 									action: "uploadContentFile",
				// 									content: {
				// 										id: CONTENT.id,
				// 										gameId: GAME ? GAME.id : null,
				// 										userId: USER ? USER.id : null,
				// 										type: CONTENT.type,
				// 										name: CONTENT.name,
				// 										file: {
				// 											name: file.name,
				// 											data: event.target.result
				// 										}
				// 									}
				// 								}

				// 							// validate
				// 								if (!post.content.id || !post.content.type || !post.content.name) {
				// 									FUNCTIONS.showToast({success: false, message: "no content selected"})
				// 									return
				// 								}
				// 								if (!post.content.file || !post.content.file.name || !post.content.file.data) {
				// 									FUNCTIONS.showToast({success: false, message: "no file uploaded"})
				// 									return
				// 								}

				// 							// send socket request
				// 								FUNCTIONS.sendPost(post, function(response) {
				// 									FUNCTIONS.showToast(response)
				// 								})
				// 						}
				// 						catch (error) {
				// 							console.log(error)
				// 							FUNCTIONS.showToast({success: false, message: "unable to read file"})
				// 							return
				// 						}
				// 					}
				// 			}
				// 		})
				// 	} catch (error) {console.log(error)}
				// }

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
							ELEMENTS.content.delete.gate.open = false
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

		/** submit - arena **/
			/* submitContentArenaObjectCreate */
				function submitContentArenaObjectCreate(event) {
					try {
						// value
							if (!ELEMENTS.content.objects.select.element.value) {
								return false
							}

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
							if (ELEMENTS.content.objects.select.element.value !== ELEMENTS.content.objects.select.blank.value) {
								var option = ELEMENTS.content.objects.select.element.querySelector("option[value='" + ELEMENTS.content.objects.select.element.value + "']")
								var type = option.getAttribute("type")
								post.content.arena.objects.new = {}
								post.content.arena.objects.new[type + "Id"] = ELEMENTS.content.objects.select.element.value
							}

						// validate
							if (!post.content.id) {
								FUNCTIONS.showToast({success: false, message: "no content selected"})
								return
							}

						// send socket request
							ELEMENTS.content.objects.select.element.value = ELEMENTS.content.objects.select.blank.value
							document.activeElement.blur()
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
							var type = event.target.type || event.target.getAttribute("type")
							var property = event.target.getAttribute("property")

							if (!property) {
								FUNCTIONS.showToast({success: false, message: "no property updated"})
								return
							}

						// locked
							if (property !== "locked" && CONTENT.arena.objects[id].locked) {
								FUNCTIONS.showToast({success: false, message: "arena object locked"})
								return
							}

						// set value
							if (property == "z") {
								post.content.arena.objects[id][property] = Number(event.target.getAttribute("value"))
							}
							else if (type == "checkbox") {
								post.content.arena.objects[id][property] = !event.target.checked
							}
							else if (type == "range" || type == "number") {
								post.content.arena.objects[id][property] = Number(event.target.value) || 0
							}
							else {
								post.content.arena.objects[id][property] = event.target.value
							}

						// send socket request
							SOCKET.send(JSON.stringify(post))
							FUNCTIONS.showToast({success: true, message: "object updated"})
					} catch (error) {console.log(error)}
				}

			/* submitContentArenaObjectDuplicate */
				function submitContentArenaObjectDuplicate(event) {
					try {
						// id
							var id = event.target.closest(".arena-object").id.replace("arena-object-", "")
							if (!id) {
								FUNCTIONS.showToast({success: false, message: "no arena object selected"})
								return
							}

						// existing object
							var existingObject = CONTENT.arena.objects[id]
							if (!existingObject) {
								FUNCTIONS.showToast({success: false, message: "no arena object found"})
								return
							}

						// new object
							var post = {
								action: "updateContentData",
								content: {
									id: CONTENT.id,
									userId: USER ? USER.id : null,
									gameId: GAME ? GAME.id : null,
									arena: {
										objects: {
											new: existingObject
										}
									}
								}
							}

						// validate
							if (!post.content.id) {
								FUNCTIONS.showToast({success: false, message: "no content selected"})
								return
							}

						// send socket request
							SOCKET.send(JSON.stringify(post))
							FUNCTIONS.showToast({success: true, message: "duplicate object created"})
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

						// locked
							if (CONTENT.arena.objects[id].locked) {
								FUNCTIONS.showToast({success: false, message: "arena object locked"})
								return
							}

						// send socket request
							SOCKET.send(JSON.stringify(post))
							FUNCTIONS.showToast({success: true, message: "object removed"})
					} catch (error) {console.log(error)}
				}

			/* submitContentArenaSignal */
				function submitContentArenaSignal(coordinates) {
					try {
						// coordinates
							if (isNaN(coordinates.x) || isNaN(coordinates.y)) {
								return
							}

						// new object
							var post = {
								action: "updateContentData",
								content: {
									id: CONTENT.id,
									userId: USER ? USER.id : null,
									gameId: GAME ? GAME.id : null,
									arena: {
										signal: {
											x: coordinates.x,
											y: coordinates.y
										}
									}
								}
							}

						// send socket request
							SOCKET.send(JSON.stringify(post))
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

						// arena
							if (CONTENT.arena) {
								grabContentArena(event)
								return
							}

						// grabbing style
							ELEMENTS.body.setAttribute("grabbing", true)

						// get cursor
							var cursor = {
								x: (event.touches ? event.touches[0].clientX : event.clientX),
								y: (event.touches ? event.touches[0].clientY : event.clientY)
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
									x: (cursor.x - center.x),
									y: (cursor.y - center.y)
								}
							}
					} catch (error) {console.log(error)}
				}

			/* moveContent */
				function moveContent(event) {
					try {
						// no content
							if (!CONTENT) {
								return
							}

						// arena
							if (CONTENT.arena) {
								moveContentArena(event)
								return
							}

						// nothing grabbed
							if (!ELEMENTS.gametable.grabbed) {
								return false
							}

						// get cursor
							var cursor = {
								x: (event.touches ? event.touches[0].clientX : event.clientX),
								y: (event.touches ? event.touches[0].clientY : event.clientY)
							}

						// calculate offset
							var parentRectangle = ELEMENTS.gametable.grabbed.element.parentNode.getBoundingClientRect()
							var offset = {
								x: (cursor.x - ELEMENTS.gametable.grabbed.grabOffset.x),
								y: (cursor.y - ELEMENTS.gametable.grabbed.grabOffset.y)
							}
						
						// move content
							ELEMENTS.gametable.grabbed.element.style.left = (offset.x - parentRectangle.left) + "px"
							ELEMENTS.gametable.grabbed.element.style.top = (offset.y - parentRectangle.top) + "px"
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
							if (CONTENT && CONTENT.arena) {
								ungrabContentArena()
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
							if (CONTENT.arena) {
								zoomContentArena(event)
								return
							}

						// scroll wheel?
							if (event.wheelDelta) {
								var modifier = (event.wheelDelta > 0) ? 0.0625 : -0.0625
							}
							else if (event.deltaY) {
								var modifier = (event.deltaY < 0) ? 0.0625 : -0.0625
							}

						// button?
							else {
								var modifier = Number(event.target.value || event.target.getAttribute("value")) || 0
							}
							CONTENT.zoomPower = modifier ? (CONTENT.zoomPower * 4 + modifier * 4) / 4 : 0
							CONTENT.zoom = Math.pow(2, CONTENT.zoomPower)
						
						// set zoom
							var contentElement = ELEMENTS.gametable.element.querySelector(".content-grabbable")
							var width = Number(contentElement.getAttribute("data-width"))
							var height = Number(contentElement.getAttribute("data-height"))
							contentElement.style.width  = (width  * CONTENT.zoom) + "px"
							contentElement.style.height = (height * CONTENT.zoom) + "px"

						// recenter?
							if (modifier == 0) {
								var parentRectangle = ELEMENTS.gametable.element.getBoundingClientRect()
								contentElement.style.left = (parentRectangle.width / 2) + "px"
								contentElement.style.top = (parentRectangle.height / 2) + "px"
							}
					} catch (error) {console.log(error)}
				}

		/** controls - arena **/
			/* selectContentArenaObject */
				function selectContentArenaObject(event) {
					try {
						// no content or canvas?
							if (!CONTENT || !ELEMENTS.gametable.canvas.element) {
								return
							}

						// no side bar?
							if (!event.target || !event.target.closest("#content")) {
								return
							}

						// get listing
							var listing = event.target.closest(".arena-object")
							if (!listing) {
								return
							}

						// get id
							var id = listing.id.replace("arena-object-", "")
							if (!id) {
								return
							}

						// get object
							var arenaObject = CONTENT.arena.objects[id]
							if (!arenaObject) {
								return
							}

						// shift-click on already selected --> unselect
							if ((event.type || event.timeStamp) && event.shiftKey && ELEMENTS.gametable.selected && ELEMENTS.gametable.selected[arenaObject.id]) {
								delete ELEMENTS.gametable.selected[arenaObject.id]
								displayContentArenaPanel()
								displayContentArenaImages()
								return
							}

						// set selection
							if (!arenaObject.locked) {
								if (!ELEMENTS.gametable.selected || !event.shiftKey) {
									ELEMENTS.gametable.selected = {}
								}
								ELEMENTS.gametable.selected[id] = CONTENT.arena.objects[id]
							}

						// center (if actually selected on sidebar)
							if ((event.type || event.timeStamp) && !arenaObject.locked) {
								var keys = Object.keys(ELEMENTS.gametable.selected || {})
								var id = keys[keys.length - 1]
								if (id) {
									ELEMENTS.gametable.canvas.offsetX = -CONTENT.arena.objects[id].x * ELEMENTS.gametable.canvas.cellSize
									ELEMENTS.gametable.canvas.offsetY = -CONTENT.arena.objects[id].y * ELEMENTS.gametable.canvas.cellSize
								}
							}
						
						// redisplay
							displayContentArenaPanel()
							displayContentArenaImages()
					} catch (error) {console.log(error)}
				}

			/* focusContentArena */
				function focusContentArena(event) {
					try {
						// no content
							if (!CONTENT || !ELEMENTS.gametable.canvas.element) {
								ELEMENTS.gametable.canvas.element.blur()
								return
							}

						// select
							ELEMENTS.gametable.canvas.element.focus()
					} catch (error) {console.log(error)}
				}

			/* blurContentArena */
				function blurContentArena(event) {
					try {
						// unselect
							ELEMENTS.gametable.canvas.element.blur()
					} catch (error) {console.log(error)}
				}

			/* getContentArenaCoordinates */
				function getContentArenaCoordinates(event) {
					try {
						// validate
							if (!event || !ELEMENTS.gametable.canvas.element) {
								return null
							}

						// cursor
							var cursor = {
								x: (event.touches ? event.touches[0].clientX : event.clientX),
								y: (event.touches ? event.touches[0].clientY : event.clientY)
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
								actualOffsetX: actualOffset.x,
								actualOffsetY: actualOffset.y
							}

						// return
							return coordinates
					} catch (error) {console.log(error)}
				}

			/* grabContentArena */
				function grabContentArena(event) {
					try {
						// no content
							if (!CONTENT || !CONTENT.arena || !ELEMENTS.gametable.canvas.element) {
								return
							}

						// prevent default / rightclick
							event.preventDefault()
							if (event.which > 1 || event.ctrlKey) {
								return
							}

						// coordinates
							var coordinates = getContentArenaCoordinates(event)
							if (!coordinates) {
								return
							}
							ELEMENTS.gametable.canvas.cursorX = coordinates.x
							ELEMENTS.gametable.canvas.cursorY = coordinates.y

						// alt-click --> signal
							if (event.altKey) {
								submitContentArenaSignal(coordinates)
								return
							}

						// sort keys
							var sortedKeys = Object.keys(CONTENT.arena.objects) || null
							if (!sortedKeys) {
								return
							}
							sortedKeys = sortedKeys.sort(function(a, b) {
								return CONTENT.arena.objects[b].z - CONTENT.arena.objects[a].z
							})

						// loop through to find top-most object
							for (var i in sortedKeys) {
								var arenaObject = CONTENT.arena.objects[sortedKeys[i]]

								// locked --> continue
									if (arenaObject.locked) {
										continue
									}

								// not yours
									if (!(CONTENT.userId == USER.id || arenaObject.userId == USER.id || (CHARACTER && arenaObject.characterId == CHARACTER.id))) {
										continue
									}

								// get edges
									var xRadius = (arenaObject.width / 2)
									var yRadius = (arenaObject.height / 2)

									var top = Number(arenaObject.y) + yRadius
									var right = Number(arenaObject.x) + xRadius
									var bottom = Number(arenaObject.y) - yRadius
									var left = Number(arenaObject.x) - xRadius

								// click within edges?
									if ((left <= ELEMENTS.gametable.canvas.cursorX && ELEMENTS.gametable.canvas.cursorX <= right)
									 && (bottom <= ELEMENTS.gametable.canvas.cursorY && ELEMENTS.gametable.canvas.cursorY <= top)) {
									 	// double-click --> load character
											if (event.type == "dblclick") {
												// not a character
													if (!arenaObject.characterId) {
														return
													}
												
												// open character
													var post = {
														action: "readCharacter",
														character: {
															userId: USER ? USER.id : null,
															gameId: GAME ? GAME.id : null,
															id: arenaObject.characterId
														}
													}

													SOCKET.send(JSON.stringify(post))
													displayTool({target: ELEMENTS.tools.characterRadio, forceSet: true})
													return
											}

									 	// locked
											if (arenaObject.locked) {
												FUNCTIONS.showToast({success: false, message: "arena object locked"})
												return
											}

										// shift-click on already selected --> unselect
											if (event.shiftKey && ELEMENTS.gametable.selected && ELEMENTS.gametable.selected[arenaObject.id]) {
												delete ELEMENTS.gametable.selected[arenaObject.id]
												displayContentArenaPanel()
												displayContentArenaImages()
												return
											}

										// grab
											ELEMENTS.gametable.grabbed = arenaObject

										// grabbing style
											ELEMENTS.body.setAttribute("grabbing", true)

										// scroll to listing
											var listing = document.querySelector("#arena-object-" + arenaObject.id)
											ELEMENTS.content.element.scrollTop = listing.offsetTop - 5

										// not already selected?
											if (!ELEMENTS.gametable.selected || !ELEMENTS.gametable.selected[arenaObject.id]) {
												selectContentArenaObject({target: listing, shiftKey: event.shiftKey || false})
											}
										return
									}
							}

						// nothing selected --> set coordinates
							ELEMENTS.gametable.grabbed = ELEMENTS.gametable.selected = null
							ELEMENTS.gametable.canvas.moveOffsetX = ELEMENTS.gametable.canvas.offsetX
							ELEMENTS.gametable.canvas.moveOffsetY = ELEMENTS.gametable.canvas.offsetY
							ELEMENTS.gametable.canvas.moveStartX = coordinates.actualOffsetX
							ELEMENTS.gametable.canvas.moveStartY = coordinates.actualOffsetY

						// redisplay
							displayContentArenaPanel()
							displayContentArenaImages()
					} catch (error) {console.log(error)}
				}

			/* measureContentArena */
				function measureContentArena(event) {
					try {
						// no content
							if (!CONTENT || !CONTENT.arena || !ELEMENTS.gametable.canvas.element) {
								return
							}

						// prevent default
							event.preventDefault()

						// coordinates
							var coordinates = getContentArenaCoordinates(event)
							if (!coordinates) {
								return
							}
							ELEMENTS.gametable.canvas.cursorX = coordinates.x
							ELEMENTS.gametable.canvas.cursorY = coordinates.y

						// snap
							ELEMENTS.gametable.canvas.measureStartX = Math.round(coordinates.x * 2) / 2
							ELEMENTS.gametable.canvas.measureStartY = Math.round(coordinates.y * 2) / 2
					} catch (error) {console.log(error)}
				}

			/* moveContentArena */
				function moveContentArena(event) {
					try {
						// no content
							if (!CONTENT || !CONTENT.arena || !ELEMENTS.gametable.canvas.element) {
								return
							}

						// coordinates
							var coordinates = getContentArenaCoordinates(event)
							if (!coordinates) {
								return
							}
							ELEMENTS.gametable.canvas.cursorX = coordinates.x
							ELEMENTS.gametable.canvas.cursorY = coordinates.y

						// grabbed?
							if (ELEMENTS.gametable.grabbed) {
								// locked
									for (var i in ELEMENTS.gametable.selected) {
										if (CONTENT.arena.objects[i].locked) {
											ELEMENTS.gametable.grabbed = null
											FUNCTIONS.showToast({success: false, message: "arena object locked"})
											return
										}
									}

								// before
									var roundedX = (Math.round(coordinates.x * 2) / 2)
									var roundedY = (Math.round(coordinates.y * 2) / 2)
									var differenceX = roundedX - Number(ELEMENTS.gametable.grabbed.x)
									var differenceY = roundedY - Number(ELEMENTS.gametable.grabbed.y)

								// other items selected?
									for (var i in ELEMENTS.gametable.selected) {
										if (i == ELEMENTS.gametable.grabbed.id) {
											CONTENT.arena.objects[i].x = roundedX
											CONTENT.arena.objects[i].y = roundedY
										}
										else {
											CONTENT.arena.objects[i].x += Number(differenceX)
											CONTENT.arena.objects[i].y += Number(differenceY)
										}
									}

									displayContentArena()
									return
							}

						// redisplay
							if (ELEMENTS.gametable.canvas.measureStartX !== null && ELEMENTS.gametable.canvas.measureStartY !== null) {
								displayContentArenaImages()
								return
							}

						// move
							if (ELEMENTS.gametable.canvas.moveStartX !== null && ELEMENTS.gametable.canvas.moveStartY !== null) {
								ELEMENTS.gametable.canvas.offsetX = Math.round((ELEMENTS.gametable.canvas.moveOffsetX + (coordinates.actualOffsetX - ELEMENTS.gametable.canvas.moveStartX)) * 100) / 100
								ELEMENTS.gametable.canvas.offsetY = Math.round((ELEMENTS.gametable.canvas.moveOffsetY - (coordinates.actualOffsetY - ELEMENTS.gametable.canvas.moveStartY)) * 100) / 100
								displayContentArenaImages()
								return
							}
					} catch (error) {console.log(error)}
				}

			/* ungrabContentArena */
				function ungrabContentArena() {
					try {
						// no content
							if (!CONTENT || !CONTENT.arena || !ELEMENTS.gametable.canvas.element) {
								ELEMENTS.gametable.canvas.measureStartX = null
								ELEMENTS.gametable.canvas.measureStartY = null
								ELEMENTS.gametable.canvas.cursorX = null
								ELEMENTS.gametable.canvas.cursorY = null
								ELEMENTS.gametable.canvas.moveStartX = null
								ELEMENTS.gametable.canvas.moveStartY = null
								ELEMENTS.gametable.canvas.moveOffsetX = null
								ELEMENTS.gametable.canvas.moveOffsetY = null
								ELEMENTS.gametable.grabbed = null
								ELEMENTS.gametable.selected = null
								ELEMENTS.gametable.canvas.element.blur()
								return
							}

						// stop measuring
							if (ELEMENTS.gametable.canvas.measureStartX !== null || ELEMENTS.gametable.canvas.measureStartY !== null) {
								var wasMeasuring = true
								ELEMENTS.gametable.canvas.measureStartX = null
								ELEMENTS.gametable.canvas.measureStartY = null
							}

						// no grabbed content
							if (!ELEMENTS.gametable.grabbed) {
								ELEMENTS.gametable.canvas.moveStartX = null
								ELEMENTS.gametable.canvas.moveStartY = null
								ELEMENTS.gametable.canvas.moveOffsetX = null
								ELEMENTS.gametable.canvas.moveOffsetY = null
								
								if (wasMeasuring) {
									displayContentArenaImages()
								}
								return
							}

						// locked
							if (CONTENT.arena.objects[ELEMENTS.gametable.grabbed.id].locked) {
								ELEMENTS.gametable.grabbed = null
								FUNCTIONS.showToast({success: false, message: "arena object locked"})
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
							for (var i in ELEMENTS.gametable.selected) {
								post.content.arena.objects[i] = {
									x: Math.round(CONTENT.arena.objects[i].x * 2) / 2,
									y: Math.round(CONTENT.arena.objects[i].y * 2) / 2
								}
							}

						// unselect
							ELEMENTS.gametable.grabbed = null
						
						// send
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

			/* nudgeContentArenaObject */
				function nudgeContentArenaObject(event) {
					try {
						// no content
							if (!CONTENT || !ELEMENTS.gametable.selected || document.activeElement !== ELEMENTS.gametable.canvas.element) {
								return
							}

						// not arrow
							if (![37, 38, 39, 40].includes(event.which)) {
								return
							}

						// locked
							for (var i in ELEMENTS.gametable.selected) {
								if (CONTENT.arena.objects[i].locked) {
									FUNCTIONS.showToast({success: false, message: "arena object locked"})
									return
								}
							}

						// keycode
							if (event.which == 37) { // left
								var direction = "x"
								var amount = -1
							}
							else if (event.which == 38) { // up
								var direction = "y"
								var amount = 1
							}
							else if (event.which == 39) { // right
								var direction = "x"
								var amount = 1
							}
							else if (event.which == 40) { // down
								var direction = "y"
								var amount = -1
							}

						// update objects
							for (var i in ELEMENTS.gametable.selected) {
								CONTENT.arena.objects[i][direction] += amount
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
							for (var i in ELEMENTS.gametable.selected) {
								post.content.arena.objects[i] = {
									x: Math.round(CONTENT.arena.objects[i].x * 2) / 2,
									y: Math.round(CONTENT.arena.objects[i].y * 2) / 2
								}
							}
						
						// send
							SOCKET.send(JSON.stringify(post))
					} catch (error) {console.log(error)}
				}

			/* panContentArena */
				function panContentArena(event) {
					try {
						// get value
							var value = event.target.value || event.target.getAttribute("value")
							var halfCell = Math.round(ELEMENTS.gametable.canvas.cellSize / 2)
							var zoomMultiplier = Math.pow(2, -ELEMENTS.gametable.canvas.zoomPower)
							var distance = halfCell * zoomMultiplier * (event.target.distance || 1)
						
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
						// already drag-moving?
							if (ELEMENTS.gametable.canvas.moveStartX !== null && ELEMENTS.gametable.canvas.moveStartY !== null) {
								return
							}

						// get direction & multiplier
							var directions = event.target.getAttribute("directions").split(/\s/gi)
							var multiplier = Number(event.target.getAttribute("multiplier"))

						// start loops
							for (var i in directions) {
								var direction = directions[i]
								ELEMENTS.gametable.canvas.panLoops[direction] = setInterval(function(direction) {
									panContentArena({target: {value: direction, distance: 0.1 * multiplier}})
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

			/* zoomContentArena */
				function zoomContentArena(event) {
					try {
						// scroll wheel?
							if (event.wheelDelta) {
								var modifier = (event.wheelDelta > 0) ? 0.0625 : -0.0625
							}
							else if (event.deltaY) {
								var modifier = (event.deltaY < 0) ? 0.0625 : -0.0625
							}

						// button?
							else {
								var modifier = Number(event.target.value || event.target.getAttribute("value")) || 0
							}

						// get current offset
							var currentOffsetCellsX = ELEMENTS.gametable.canvas.offsetX / ELEMENTS.gametable.canvas.cellSize
							var currentOffsetCellsY = ELEMENTS.gametable.canvas.offsetY / ELEMENTS.gametable.canvas.cellSize

						// set zoom & cellSize
							ELEMENTS.gametable.canvas.zoomPower = modifier ? (ELEMENTS.gametable.canvas.zoomPower * 4 + modifier * 4) / 4 : 0
							ELEMENTS.gametable.canvas.cellSize = 50 * Math.pow(2, ELEMENTS.gametable.canvas.zoomPower)

						// recenter
							if (modifier) {
								ELEMENTS.gametable.canvas.offsetX = currentOffsetCellsX * ELEMENTS.gametable.canvas.cellSize
								ELEMENTS.gametable.canvas.offsetY = currentOffsetCellsY * ELEMENTS.gametable.canvas.cellSize
							}
							else {
								ELEMENTS.gametable.canvas.offsetX = 0
								ELEMENTS.gametable.canvas.offsetY = 0
							}
						
						// redraw
							displayContentArena()
					} catch (error) {console.log(error)}
				}
}
