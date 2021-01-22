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

				// turn order?
					if (REQUEST.post.action == "createTurnOrder") {
						createTurnOrder(REQUEST, callback)
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

				// gameId
					var postRollGroup = REQUEST.post.rollGroup
					var gameId = REQUEST.post.rollGroup.gameId
					var contentId = REQUEST.post.rollGroup.contentId || null
					var characterId = REQUEST.post.rollGroup.characterId || null

				// query
					var query = CORE.getSchema("query")
						query.collection = "characters"
						query.command = "find"
						query.filters = {gameId: gameId}

				// find
					CORE.accessDatabase(query, function(results) {
						// characters
							var characters = {}
							if (results.success) {
								for (var i in results.documents) {
									characters[results.documents[i].id] = results.documents[i]
								}
							}
					
						// rollGroup
							var rollGroup = CORE.getSchema("rollGroup")
								rollGroup.userId = REQUEST.user.id
								rollGroup.gameId = gameId
								rollGroup.contentId = contentId
								rollGroup.characterId = characterId

						// rolls
							for (var i = 0; i < postRollGroup.rolls.length; i++) {
								// data
									var data = postRollGroup.rolls[i]
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
												// get characters
													var influencer = characters[rollGroup.characterId]
													var recipient = characters[data.recipient]

												// original skill value
													var charismaSkill = influencer.statistics.logic.skills.find(function(s) { return s.name == data.text.replace(/\s/gi, "_") })
													if (!charismaSkill) {
														continue
													}
													var originalSkillValue = Math.max(0, charismaSkill.maximum + charismaSkill.condition)

												// halflings cancel influencer bonuses
													if (recipient.info.demographics.race == "halfling") {
														originalSkillValue = 0
													}
												
												// description
													roll.display.d = data.d
													roll.display.text = data.text
													roll.display.total = "(" + originalSkillValue + ")"

												// spacer
													var spacer = CORE.getSchema("roll")
														spacer.display.spacer = true
														spacer.display.text = recipient.info.name
													rollGroup.rolls.push(spacer)

												// logic
													var counterLogic = Math.max(0, recipient.statistics.logic.maximum + recipient.statistics.logic.damage + recipient.statistics.logic.condition)

												// gnomes cancel recipient skills
													if (influencer.info.demographics.race == "gnome") {
														data.counters = data.counters.includes("aggression") ? ["aggression"] : []
													}

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
														postRollGroup.rolls.push(data.ifSuccess)
														continue
													}
													if (data.ifFailure && !roll.display.success) {
														postRollGroup.rolls.push(data.ifFailure)
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

										// bleeding? (reduces armor nd6 by 1)
											if (data.type == "armor" && characters[rollGroup.characterId].info.status.conditions.find(function(condition) { return condition.name == "bleeding" })) {
												data.count = Math.max(0, data.count - 1)
											}

										// roll
											roll.display.total = 0
											for (var j = 0; j < data.count; j++) {
												var thisDie = CORE.getSchema("dice")
													thisDie.number = CORE.rollRandom(data.d || 6)
												roll.display.dice.push(thisDie)
												roll.display.total += thisDie.number
											}

										// condition
											if ((data.type == "potion" || data.type == "condition") && data.recipient && characters[data.recipient]) {
												// recipient
													var recipient = characters[data.recipient]
													var spacer = false

												// find condition in character
													var conditionName = data.text.replace(/\s/g, "_")
													var condition = recipient.info.status.conditions.find(function(c) { return c.name == conditionName })

												// no condition? --> add
													if (!condition) {
														condition = CORE.getAsset("conditions")[conditionName]
														if (condition) {
															recipient.info.status.conditions.push(condition)
														}
													}

												// condition
													if (condition) {
														// update rounds
															condition.rounds = Math.max(0, roll.display.total)

														// no rounds --> remove
															if (!condition.rounds) {
																recipient.info.status.conditions = recipient.info.status.conditions.filter(function(c) {
																	return c.name !== conditionName
																}) || []
															}

														// query
															var query = CORE.getSchema("query")
																query.collection = "characters"
																query.command = "update"
																query.filters = {id: recipient.id}
																query.document = recipient

														// update
															CORE.accessDatabase(query, function(results) {
																if (!results.success) {
																	results.recipients = [REQUEST.user.id]
																	callback(results)
																	return
																}

																// character
																	var character = results.documents[0]

																// query
																	var query = CORE.getSchema("query")
																		query.collection = "users"
																		query.command = "find"
																		query.filters = {gameId: gameId}

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
																			callback({success: true, message: character.info.name + " updated", character: character, recipients: ids})
																	})
															})
													}
											}

										// weapon
											if (data.type == "weapon" && data.recipient && characters[data.recipient]) {
												// recipient
													var recipient = characters[data.recipient]
													var spacer = false

												// equipped armor
													var armor = null
													for (var k in recipient.items) {
														// item
															var item = recipient.items[k]
															if (!item || !item.equipped || item.type !== "armor") {
																continue
															}

														// better armor
															if (!armor || item.d6 > armor.d6) {
																armor = item
															}

														// body armor
															if (item.d6 == armor.d6 && item.armorType == "body" && armor.armorType !== "body") {
																armor = item
															}
													}

													if (armor) {
														// add to rolls
															postRollGroup.rolls.splice(i + 1, 0, {
																type: "armor",
																d: 6,
																count: armor.d6,
																text: armor.name,
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
																	postRollGroup.rolls.splice(i + 1, 0, {
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
														postRollGroup.rolls.splice(i + 1, 0, {
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
										query.filters = {gameId: gameId}

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

	/* createTurnOrder */
		module.exports.createTurnOrder = createTurnOrder
		function createTurnOrder(REQUEST, callback) {
			try {
				// authenticated?
					if (!REQUEST.user || !REQUEST.user.id) {
						callback({success: false, message: "not signed in", recipients: [REQUEST.user.id]})
						return
					}

				// validate
					if (!REQUEST.post.rollGroup || !REQUEST.post.rollGroup.contentId) {
						callback({success: false, message: "no content selected", recipients: [REQUEST.user.id]})
						return
					}
					if (!REQUEST.post.rollGroup.gameId) {
						callback({success: false, message: "no game selected", recipients: [REQUEST.user.id]})
						return
					}

				// gameId
					var gameId = REQUEST.post.rollGroup.gameId
					var contentId = REQUEST.post.rollGroup.contentId

				// query
					var query = CORE.getSchema("query")
						query.collection = "content"
						query.command = "find"
						query.filters = {gameId: gameId, id: contentId}

				// find
					CORE.accessDatabase(query, function(results) {
						if (!results.success) {
							results.recipients = [REQUEST.user.id]
							callback(results)
							return
						}

						// arena
							var content = results.documents[0]
							if (!content || content.type !== "arena" || !content.arena) {
								callback({success: false, message: "arena not found", recipients: [REQUEST.user.id]})
								return
							}

						// get arena objects with associated character ids if visible
							var turnOrder = []
							for (var i in content.arena.objects) {
								if (content.arena.objects[i].characterId && content.arena.objects[i].visible) {
									turnOrder.push({
										id: content.arena.objects[i].characterId,
										name: content.arena.objects[i].text || null
									})
								}
							}

						// validate
							if (!turnOrder || !turnOrder.length) {
								callback({success: false, message: "no characters in this arena", recipients: [REQUEST.user.id]})
								return
							}

						// query
							var query = CORE.getSchema("query")
								query.collection = "characters"
								query.command = "find"
								query.filters = {gameId: gameId}

						// find
							CORE.accessDatabase(query, function(results) {
								if (!results.success) {
									results.recipients = [REQUEST.user.id]
									callback(results)
									return
								}

								// characters
									var characters = results.documents || []
									if (!characters || !characters.length) {
										callback({success: false, message: "characters not found", recipients: [REQUEST.user.id]})
										return
									}
									var arenaCharacters = []

								// calculate speed
									for (var i in turnOrder) {
										var character = characters.find(function(c) {
											return c.id == turnOrder[i].id
										}) || null

										if (!character) {
											turnOrder[i].initiative = 0
											continue
										}

										arenaCharacters.push(character)
										var run = character.statistics.speed.skills.find(function(skill) { return skill.name == "run" }) || {maximum: 0, condition: 0}
										turnOrder[i].initiative = Math.max(0, character.statistics.speed.maximum + character.statistics.speed.damage + character.statistics.speed.condition + run.maximum + run.condition)
										turnOrder[i].name = turnOrder[i].name || character.info.name || "?"
									}

								// sort
									turnOrder = turnOrder.sort(function(a, b) {
										return b.initiative - a.initiative
									})

								// rollGroup
									var rollGroup = CORE.getSchema("rollGroup")
										rollGroup.userId = REQUEST.user.id
										rollGroup.gameId = gameId
										rollGroup.contentId = contentId
										rollGroup.options = {
											turnOrder: true
										}

									var roll = CORE.getSchema("roll")
										roll.display.spacer = true
										roll.display.text = "turn order"
									rollGroup.rolls.push(roll)

								// initiative list
									for (var i in turnOrder) {
										var roll = CORE.getSchema("roll")
											roll.display.d = 20
											roll.display.text = turnOrder[i].name
											roll.display.total = "(" + turnOrder[i].initiative + ")"
											roll.display.success = true
										rollGroup.rolls.push(roll)
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
												query.filters = {gameId: gameId}

										// find
											CORE.accessDatabase(query, function(results) {
												if (!results.success) {
													results.recipients = [REQUEST.user.id]
													callback(results)
													return
												}

												// return
													var users = results.documents
													var ids = results.documents.map(function(u) {
														return u.id
													}) || []
													callback({success: true, roll: rollGroups, recipients: ids})

												// update characters' conditions
													for (var i in arenaCharacters) {
														if (arenaCharacters[i].info.status.conditions && arenaCharacters[i].info.status.conditions.length) {
															// get character
																var thisCharacter = arenaCharacters[i]

															// loop through and update conditions counters
																for (var j in thisCharacter.info.status.conditions) {
																	thisCharacter.info.status.conditions[j].rounds--
																	if (thisCharacter.info.status.conditions[j].rounds <= 0) {
																		thisCharacter.info.status.conditions.splice(j, 1)
																		j--
																	}
																}

															// query
																var query = CORE.getSchema("query")
																	query.collection = "characters"
																	query.command = "update"
																	query.filters = {id: thisCharacter.id}
																	query.document = thisCharacter

															// update
																CORE.accessDatabase(query, function(results) {
																	if (!results.success) {
																		results.recipients = [REQUEST.user.id]
																		callback(results)
																		return
																	}

																	// character
																		var character = results.documents[0]

																	// ids
																		var ids = users.filter(function(u) {
																			return u.characterId == character.id
																		}).map(function(u) {
																			return u.id
																		}) || []

																		callback({success: true, message: character.info.name + " updated", character: character, recipients: ids})
																})
														}
													}
											})
									})
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

				// postRollGroup
					var postRollGroup = REQUEST.post.rollGroup

				// query
					var query = CORE.getSchema("query")
						query.collection = "rolls"
						query.command = "find"
						query.filters = {gameId: postRollGroup.gameId, id: postRollGroup.id}

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
								return r.id == postRollGroup.rollId
							})

						// no roll?
							if (!roll || !roll.display.dice[postRollGroup.index]) {
								callback({success: false, message: "dice not found", recipients: [REQUEST.user.id]})
								return
							}

						// update die
							roll.display.dice[postRollGroup.index].counting = postRollGroup.counting

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
								query.filters = {gameId: postRollGroup.gameId, id: postRollGroup.id}
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
										query.filters = {gameId: postRollGroup.gameId}

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
