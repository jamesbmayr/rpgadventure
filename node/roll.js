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
					if (!REQUEST.post.rollGroup || !REQUEST.post.rollGroup.rolls) {
						callback({success: false, message: "invalid roll object", recipients: [REQUEST.user.id]})
						return
					}
					if (!REQUEST.post.rollGroup.gameId) {
						callback({success: false, message: "no game selected", recipients: [REQUEST.user.id]})
						return
					}

				// get character data?
					var recipientIds = []
					var characters = {}
					for (var i = 0; i < REQUEST.post.rollGroup.rolls.length; i++) {
						if (REQUEST.post.rollGroup.rolls[i].recipient) {
							recipientIds.push(REQUEST.post.rollGroup.rolls[i].recipient)
						}
					}

					// recipients?
						if (recipientIds.length) {
							// query
								var query = CORE.getSchema("query")
									query.collection = "characters"
									query.command = "find"
									query.filters = {gameId: REQUEST.post.rollGroup.gameId}

							// find
								CORE.accessDatabase(query, function(results) {
									if (!results.success) {
										results.recipients = [REQUEST.user.id]
										callback(results)
										return
									}

									// characters
										var characters = {}
										for (var i in results.documents) {
											characters[results.documents[i].id] = results.documents[i]
										}

									// move on
										createRolls(characters)
										return
								})
						}

					// no targets
						else {
							createRolls(characters)
							return
						}

				// create rolls
					function createRolls(characters) {
						// rollGroup
							var rollGroup = CORE.getSchema("rollGroup")
								rollGroup.userId = REQUEST.user.id
								rollGroup.gameId = REQUEST.post.rollGroup.gameId
								rollGroup.characterId = REQUEST.post.rollGroup.characterId

						// rolls
							for (var i = 0; i < REQUEST.post.rollGroup.rolls.length; i++) {
								// data
									var data = REQUEST.post.rollGroup.rolls[i]
									var roll = CORE.getSchema("roll")
									rollGroup.rolls.push(roll)

								// spacer
									if (data.spacer) {
										roll.display.spacer = true
										roll.display.text = data.text
										continue
									}

								// d20
									else if (data.target !== undefined) {
										// charisma?
											if (data.charisma && data.recipient && characters[data.recipient]) {
												// original skill value
													var influencer = characters[rollGroup.characterId]
													var charismaSkill = influencer.statistics.logic.skills.find(function(s) { return s.name == data.text.replace(/\s/gi, "_") })
													if (!charismaSkill) {
														continue
													}
													var originalSkillValue = Math.max(0, charismaSkill.maximum + charismaSkill.condition)
												
												// description
													roll.display.d = data.d
													roll.display.text = data.text
													roll.display.total = "(" + originalSkillValue + ")"

												// recipient
													var recipient = characters[data.recipient]

												// spacer
													var spacer = CORE.getSchema("roll")
														spacer.display.spacer = true
														spacer.display.text = recipient.info.name
													rollGroup.rolls.push(spacer)

												// logic
													var counterLogic = Math.max(0, recipient.statistics.logic.maximum + recipient.statistics.logic.damage + recipient.statistics.logic.condition)

												// find best counter skill
													var counterSkillName = null
													var counterSkillValue = 0
													for (var j in data.counters) {
														var counterSkill = recipient.statistics.logic.skills.find(function(s) { return s.name == data.counters[j] }) || null
														if (counterSkill && (counterSkill.maximum + counterSkill.condition > counterSkillValue)) {
															counterSkillValue = (counterSkill.maximum + counterSkill.condition)
															counterSkillName = counterSkill.name
														}
													}

												// target
													var counterTarget = Math.max(0, counterLogic + counterSkillValue - originalSkillValue)

												// counterRoll
													var counterRoll = CORE.getSchema("roll")
														counterRoll.display.d = 20
														counterRoll.display.text = counterSkillName ? counterSkillName.replace(/\_/gi, " ") : "logic"
														counterRoll.display.total = CORE.rollRandom(20)
														counterRoll.display.success = counterRoll.display.total <= counterTarget
													rollGroup.rolls.push(counterRoll)

												// original roll success is opposite
													roll.display.success = !counterRoll.display.success
													continue
											}

										// regular roll
											else {
												// description
													roll.display.d = data.d
													roll.display.text = data.text

												// roll
													roll.display.total = CORE.rollRandom(20)
													roll.display.success = roll.display.total <= data.target

												// then
													if (data.ifSuccess && roll.display.success) {
														REQUEST.post.rollGroup.rolls.push(data.ifSuccess)
														continue
													}
													if (data.ifFailure && !roll.display.success) {
														REQUEST.post.rollGroup.rolls.push(data.ifFailure)
														continue
													}

												continue
											}
									}

								// d6
									else {
										// data
											roll.display.d = data.d
											roll.display.text = data.text
											roll.display.type = data.type

										// roll
											roll.display.total = 0
											for (var j = 0; j < data.count; j++) {
												var thisDie = CORE.getSchema("dice")
													thisDie.number = CORE.rollRandom(data.d || 6)
												roll.display.dice.push(thisDie)
												roll.display.total += thisDie.number
											}

										// weapon
											if (data.type == "weapon" && data.recipient && characters[data.recipient]) {
												// recipient
													var recipient = characters[data.recipient]
													var spacer = false

												// equipped armor
													for (var k in recipient.items) {
														// item
															var item = recipient.items[k]
															if (!item || !item.equipped || item.type !== "armor") {
																continue
															}

														// add to rolls
															REQUEST.post.rollGroup.rolls.splice(i + 1, 0, {
																type: "armor",
																d: 6,
																count: item.d6,
																text: item.name,
																countering: roll.id
															})

														// make sure to do spacer later
															spacer = true
													}

												// natural defenses
													if (recipient.statistics.immunity && recipient.statistics.immunity.skills) {
														// defend
															var defend = recipient.statistics.immunity.skills.find(function(s) { return s.name == "defend" }) || null
															if (defend) {
																// add to rolls
																	REQUEST.post.rollGroup.rolls.splice(i + 1, 0, {
																		type: "healing",
																		d: 6,
																		count: defend.d6,
																		text: defend.name,
																		countering: roll.id
																	})

																// make sure to do spacer later
																	spacer = true
															}
													}

												// spacer?
													if (spacer) {
														REQUEST.post.rollGroup.rolls.splice(i + 1, 0, {
															spacer: true,
															text: recipient.info.name
														})
													}
											}

										// countering?
											if (data.countering) {
												// previous roll
													var previousRoll = rollGroup.rolls.find(function(r) { return r.id == data.countering }) || null
													if (!previousRoll) {
														continue
													}

												// get armor / defend counter dice
													var theseDice = roll.display.dice.map(function(d) {
														return d.number
													})

												// loop through dice to cancel out weapon dice
													for (var l in previousRoll.display.dice) {
														if (previousRoll.display.dice[l].counting && theseDice.includes(previousRoll.display.dice[l].number)) {
															previousRoll.display.dice[l].counting = false
															previousRoll.display.total -= previousRoll.display.dice[l].number
														}
													}
											}

										continue
									}
							}

						// query
							var query = CORE.getSchema("query")
								query.collection = "rolls"
								query.command = "insert"
								query.document = rollGroup

						// insert
							CORE.accessDatabase(query, function(results) {
								if (!results.success) {
									results.recipients = [REQUEST.user.id]
									callback(results)
									return
								}

								// rollGroups
									var rollGroups = [results.documents[0]]

								// query
									var query = CORE.getSchema("query")
										query.collection = "users"
										query.command = "find"
										query.filters = {gameId: REQUEST.post.rollGroup.gameId}

								// find
									CORE.accessDatabase(query, function(results) {
										if (!results.success) {
											results.recipients = [REQUEST.user.id]
											callback(results)
											return
										}

										// return
											var ids = results.documents.map(function(u) {
												return u.id
											}) || []
											callback({success: true, roll: rollGroups, recipients: ids})
											return
									})
							})
					}
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
					if (!REQUEST.post || !REQUEST.post.rollGroup || !REQUEST.post.rollGroup.gameId) {
						callback({success: false, message: "no game specified for rolls", recipients: [REQUEST.user.id]})
					}

				// query
					var query = CORE.getSchema("query")
						query.collection = "rolls"
						query.command = "find"
						query.filters = {gameId: REQUEST.post.rollGroup.gameId}

				// find
					CORE.accessDatabase(query, function(results) {
						// sort & limit
							var timestamp = new Date().getTime() - CORE.getAsset("constants").contentDuration
							var rollGroups = results.documents.sort(function(a, b) {
								return a.time - b.time
							}) || []
							rollGroups = rollGroups.slice(0, 100) || []
							rollGroups = rollGroups.filter(function(r) {
								return r.time > timestamp
							}) || []

						// return
							callback({success: true, roll: rollGroups, recipients: [REQUEST.user.id]})
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

				// no game?
					if (!REQUEST.post || !REQUEST.post.rollGroup || !REQUEST.post.rollGroup.gameId) {
						callback({success: false, message: "no game specified for rolls", recipients: [REQUEST.user.id]})
					}

				// validate
					if (!REQUEST.post.rollGroup || !REQUEST.post.rollGroup.id || !REQUEST.post.rollGroup.rollId) {
						callback({success: false, message: "invalid roll object", recipients: [REQUEST.user.id]})
						return
					}

				// query
					var query = CORE.getSchema("query")
						query.collection = "rolls"
						query.command = "find"
						query.filters = {gameId: REQUEST.post.rollGroup.gameId, id: REQUEST.post.rollGroup.id}

				// find
					CORE.accessDatabase(query, function(results) {
						if (!results.success) {
							results.recipients = [REQUEST.user.id]
							callback(results)
							return
						}

						// get roll
							var rollGroup = results.documents[0]
							var roll = rollGroup.rolls.find(function(r) {
								return r.id == REQUEST.post.rollGroup.rollId
							})

						// no roll?
							if (!roll || !roll.display.dice[REQUEST.post.rollGroup.index]) {
								callback({success: false, message: "dice not found", recipients: [REQUEST.user.id]})
								return
							}

						// update die
							roll.display.dice[REQUEST.post.rollGroup.index].counting = REQUEST.post.rollGroup.counting

						// recalculate
							var total = 0
							for (var i in roll.display.dice) {
								if (roll.display.dice[i].counting) {
									total += roll.display.dice[i].number
								}
							}
							roll.display.total = total

						// query
							var query = CORE.getSchema("query")
								query.collection = "rolls"
								query.command = "update"
								query.filters = {gameId: REQUEST.post.rollGroup.gameId, id: REQUEST.post.rollGroup.id}
								query.document = rollGroup

						// update
							CORE.accessDatabase(query, function(results) {
								if (!results.success) {
									results.recipients = [REQUEST.user.id]
									callback(results)
									return
								}

								// rollGroups
									var rollGroups = [results.documents[0]]

								// query
									var query = CORE.getSchema("query")
										query.collection = "users"
										query.command = "find"
										query.filters = {gameId: REQUEST.post.rollGroup.gameId}

								// find
									CORE.accessDatabase(query, function(results) {
										if (!results.success) {
											results.recipients = [REQUEST.user.id]
											callback(results)
											return
										}

										// return
											var ids = results.documents.map(function(u) {
												return u.id
											}) || []
											callback({success: true, roll: rollGroups, recipients: ids})
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
