/*** modules ***/
	if (!HTTP)   { var HTTP   = require("http") }
	if (!FS)     { var FS     = require("fs") }
	if (!CRYPTO) { var CRYPTO = require("crypto") }
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
						db_username:     process.env.DB_USERNAME,
						db_password:     process.env.DB_PASSWORD,
						db_url:          process.env.DB_URL,
						db_name:         process.env.DB_NAME,
						db:              "mongodb+srv://" + process.env.DB_USERNAME + ":" + process.env.DB_PASSWORD + "@" + process.env.DB_URL,
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
						db_username:     null,
						db_password:     null,
						db_url:          null,
						db_name:         null,
						db: {
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
						case "js":
							return "text/" + extension
						break

						case "md":
							return "text/html"
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
								name: null,
								userId: null,
								users: {},
								allUsers: []
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
								characterId: null,
								rolls: []
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
								character.access = null
								character.image = null
								character.file = null
							return character
						break

						case "content":
							return {
								id: generateRandom(),
								time: new Date().getTime(),
								gameId: null,
								userId: null,
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
								text: null,
								visible: true,
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

					// rules
						case "rules":
							return {
								overviews: getAsset("overviews"),
								races: getAsset("races"),
								classes: getAsset("classes"),
								statistics: getAsset("statistics"),
								skills: getAsset("skills"),
								damage: getAsset("damage"),
								conditions: getAsset("conditions"),
								items: getAsset("items"),
								puzzles: getAsset("puzzles"),
								character: getAsset("character"),
								npcs: getAsset("npcs"),
								animals: getAsset("animals"),
								creatures: getAsset("creatures"),
								services: getAsset("services")
							}
						break

						case "overviews":
							return {
								"how to play": {name: "how to play", description: "Adventure is a collaborative open-world pen-and-paper role playing game for friends. \n\nThe rules are designed to be simple and intuitive, yet flexible and immersive. The game mechanics can be applied to any setting or genre. The suggested game world is a fantasy story with Renaissance-era technology and geopolitics, mythological flora and fauna, and no magic - though there is a long-lost ancient civilization that left behind its seemingly magical advanced technology. \n\nThis game is a cooperative storytelling adventure between the \"game master,\" who designs and plans the setting and many of its characters and monsters, and the players, who control individual adventurers living in this world, making decisions to push the story forward. For all players, at all times, the questions are: \n\nIs it plausible? Is it fun? Is it fair? \n\nIn other words, anything can happen in the game so long as it is internally consistent and realistic for characters and non-player characters. Once an idea has passed that threshold, whether it is fun and pushes the story forward is more important than whether it is strictly in accordance with the rules; the goal should be to create an enjoyable experience for all involved. Finally, the game world should feel consequential for both the players and the game master; things that happen should have repercussions, and choices should be the driving force in countering random chance. \n\nWhile the game master's dungeon and quest design and the players' creativity and acting are the primary drivers of story, randomness still plays an important role. Characters have seven primary statistics, each corresponding to a physical body structure: perception (eyes, ears, etc.), logic (cerebrum), memory (hippocampus), strength (upper-body muscles), dexterity (fine-motor muscles), speed (lower-body muscles), and immunity (immune, cardiovascular, and respiratory systems). \n\nTo accomplish a task, a player rolls 1d20, and must roll a number at or lower than the corresponding statistic. All skills and abilities add bonuses to this threshold. For example, when attempting to draw a map, a character with a logic of 10 and a spatial reasoning skill of +5 must roll at or under 15 on 1d20; therefore, there is a 75% probability of success. All characters may attempt all things, but the probability of success increases by learning skills and specializing in subskills. \n\nOutside of a pen and paper for character sheets, as well as 1d20 per player for skill rolls, the game also requires a number of ordinary d6 dice, which are used for all items in the world. For example, weapons and armor each have an attribute of nd6 corresponding to the damage they inflict or prevent. As a rule, anything that is not a test of a character's ability should be randomized using d6 dice. \n\nBeyond that, the game is very open-ended. Game masters should prioritize puzzles and mystery over hack-and-slash combat, and conflict should have multiple possible resolutions. Multidimensional characters with well-constructed motives, intricate locations with storied pasts, and interconnected goals beyond simply acquiring money are the best ways to craft a fun experience. Players do best when they act the part, develop backstories and aspirations for their characters, and advance the plot by contributing creatively. \n\nAnd have fun!"},
								"races": {name: "races", description: "There are several intelligent races available for players to choose from in the default world of Adventure. Longer descriptions of each race's appearance, abilities, and social structure can be found in the descriptions of the creatures section."},
								"classes": {name: "classes", description: "While there is no official \"character class\" system in Adventure, it is possible to approximate various RPG classes; below are the suggested races, statistics, and skills for each class."},
								"statistics": {name: "statistics", description: "Throughout the game, players will roll 1d20 each time they need to determine if their characters are able to accomplish a task. Each task is associated with a statistic. \n\nTo create a character, set each of the statistics to 7, then move points between them as desired, with each statistic having a maximum of 10 and a minimum of 4. (For example, boosting perception from 7 to 8 would mean taking a point from somewhere else, like bringing memory from 7 to 6.)"},
								"skill points": {name: "skill points", description: "Characters are awarded skill points throughout the course of a campaign by completing quests, visiting new places, successfully performing new skills, and more. Characters are also awarded skill points by overcoming opponents in some way - often  through combat or charisma. This is generally 1-3 skill points. \n\nA character may increase a statistic by 1 for 28 skill points, or increase a skill 1 level per skill point. \n\nThe maximum level at which a skill can be learned is +7. A character may also choose to learn specializations of a particular skill by selecting a more specific and limited field or aspect, to a maximum of +3, at a cost of 1 skill point per +1. \n\nA character may only learn or improve a skill that is plausible, given the circumstances; for example, a character cannot learn to swim while in the desert, even with the requisite skill points. Furthermore, a character may only increment a specific skill level by 1 point within a day. \n\nCharacters start with 28 skill points to distribute amongst starting skills. A GM may impose additional restrictions during character creation, such as a skill maximum of 4, to prevent unbalanced characters."},
								"skills": {name: "skills", description: "Every skill is associated with a statistic; to perform a skill, the player must roll at or under the corresponding statistic + skill modifier on 1d20."},
								"non-player characters (npcs)": {name: "non-player characters (npcs)", description: "Characters will interact with non-player characters, including other characters of playable races, real-world animals, and fantasy monsters. \n\nCreatures generally use an aggression skill when resisting handle animals attempts. \n\nSome creatures have special senses: infrared vision, night vision, infrasound, echolocation, internal compass. \n\nSome creatures also have special movement: fly. \n\nSome creatures also use special combat skills; in some cases, these could also cause a condition, such as sleep or paralysis, or inflict special damage, such as poison, infection, extreme cold, fire, or electricity: bite (nd6), slam (nd6), tusk (nd6), claws (nd6) x (number of claws), talons (nd6) x (number of talons). \n\nSome creatures also have special abilities: camoflauge: opponents at disadvantage on sight checks; temperature resistance: nullifies the effects of extreme heat and extreme cold. \n\nFinally, many creatures have natural armor that protects against nd6 physical damage."},
								"charisma": {name: "charisma", description: "Opponents can also be defeated through charisma and diplomacy. Encounters usually involve several logic rolls in which the opponent must roll at or under its logic on 1d20 in order to avoid being swayed. \n\nCharacters may influence these encounters using skills which impact the logic rolls. Roll logic (with these skills) for each instance in which a character attempts to sway an opponent. \n\n(resister's logic + skill) - (influencer's skill)\n\nThe influencer may also choose to use these skills to affect the resister with a psychological condition, which can last up to 10 minutes.\n\nA character may also choose to affect itself for up to 10 minutes with one of the following psychological conditions intentionally using the meditate skill: alertness, concentration, determination, perceptiveness, rage."},
								"taming & training": {name: "taming & training", description: "Taming an animal uses handle animals as a charisma encounter (similar to persuade): the animal rolls under its logic to resist, but the target is lowered by the character's handle animals skill and the animal's training skill. (Note that at first, the animal will not have this training skill.) A character can attempt to tame the animal once a day. If the animal does not resist, it gains 1 point in this training skill, under its logic statistic, up to the skill maximum. \n\ntaming: fail (animal's logic + animal's aggression - animal's training - character's handle animals) \n\nOn a successful taming roll, the character can also attempt to train the animal to do a specific command. The animal does a logic + training check, now aided by the character's handle animals. If this training is successful, the animal gains 1 point in the specific skill being trained; this falls under the memory statistic. \n\ntraining: succeed (animal's logic + animal's training + character's handle animals) \n\nWhen the character wants the animal to obey a command, the player must roll a taming check as above. Then the animal must roll a check similar to training, using with the specific command as the skill: \n\n{command}: succeed (animal's memory + animal's {command skill} + character's handle animals)"},
								"services": {name: "services", description: "Many NPCs will perform a service for a cost. This allows players who do not know a certain skill to exchange money for that skill to be performed on their behalf."},
								"combat": {name: "combat", description: "In an armed conflict, the team with the member with the highest speed begins turn-based combat (unless one team is surprised by the other), but all actions in a 6-second round are considered to be simultaneous. Within each team, turn order is determined by speed. Each combatant can take one action per round; the most common actions are moving (with the run skill), attacking, dodging, using an item, or changing weapons. \n\nCharacters aim by making a 1d20 attempt on the dexterity-, strength-, or speed-based skill associated with their attack (melee, fencing, archery, missile aim, throw, kick, punch, or martial arts). \n\nIf the roll is a 1, the attack is focused on the opponent's head; on a 2 or 3, the attack is focused on the opponent's arms or legs. \n\nEach weapon or attack has a corresponding damage roll, of nd6. Armor and shields also have a damage blocking attribute: nd6 are rolled, and each die cancels all damage dice of the same value. (In other words, subtract the set of armor dice from the set of weapon dice.) \n\n[weapon nd6] \ [armor nd6] → [damage nd6] \n\nThe remaining damage is summed, then subtracted from the opponent's statistics; the opponent may choose how to distribute this damage, limited by the area of the attack's focus: \n\nDamage to the head (attack roll of 1) reduces logic, memory, and/or perception. Pass an immunity + pain tolerance check, or else be surprised and unable to act for 1 round. Damage to arms or legs (attack roll of 2 or 3) reduces strength, dexterity, speed, and/or immunity. Pass an immunity + pain tolerance check, or else be either disarmed (dropping held items) or immobilized (unable to run, dodge, etc.) for 1 round. All other damage (attack roll of 4 or more) can reduce any statistic. \n\nEach attack can also be avoided using speed and the dodge skill, each with an individual roll. A player who is dodging cannot take another action, except to move (ie, run)."},
								"damage": {name: "damage", description: "Many forces can damage a character; damage is subtracted from a character's statistics. Damage to the head reduces logic, memory, and/or perception; other damage reduces strength, dexterity, speed, and/or immunity. A player may choose how damage is applied."},
								"conditions": {name: "conditions", description: "Circumstances often affect a character's skills and statistics. These are generally temporary."},
								"weapons": {name: "weapons", description: "Weapons each have an associated skill to determine a character's success in using them. They also have an attribute of nd6 corresponding to how much damage they deal. This ability decreases by one d6 per week of use, to a minimum of 1d6. Weapons can be repaired to full with the metalworking, woodworking, or other appropriate skill, with the right time and materials. Some weapons cause bleeding on a failed recover roll."},
								"armor": {name: "armor", description: "Armor has an attribute of nd6 corresponding to how much damage it blocks. This ability decreases by one d6 per week of use, to a minimum of 1d6. Armor can be repaired to full with the metalworking, woodworking, leatherworking, or other appropriate skill, with the right time and materials."},
								"potions": {name: "potions", description: "These items are brewed by mixing 10 parts water with red, green, and blue flower / mushroom extracts, or the crushed powder of cyan, magenta, and yellow gemstones, in the right proportions, and applying heat to create a chemical reaction. This requires alchemy, botany, geology, or medicine, as applicable."},
								"puzzles": {name: "puzzles", description: "These items and encounters constitute real-world puzzles for players to solve. The game master is encouraged to supplement these with additional puzzles, especially ones with tangible in-game analogues. Within the world, characters still attempt to resolve these puzzles using the applicable skills."}
							}
						break

					// character
						case "character":
							return {
								info: {
									name: "unnamed character",
									demographics: {
										race: "",
										age: 0,
										sex: "",
										height: 0,
										weight: 0
									},
									description: " ",
									status: {
										points: 28,
										burden: 0,
										conditions: [],
										damage: 0
									}
								},
								statistics: {
									perception: {
										maximum: 7,
										damage: 0,
										condition: 0,
										skills: []
									},
									memory: {
										maximum: 7,
										damage: 0,
										condition: 0,
										skills: []
									},
									logic: {
										maximum: 7,
										damage: 0,
										condition: 0,
										skills: []
									},
									strength: {
										maximum: 7,
										damage: 0,
										condition: 0,
										skills: []
									},
									dexterity: {
										maximum: 7,
										damage: 0,
										condition: 0,
										skills: []
									},
									immunity: {
										maximum: 7,
										damage: 0,
										condition: 0,
										skills: []
									},
									speed: {
										maximum: 7,
										damage: 0,
										condition: 0,
										skills: []
									}
								},
								items: []
							}
						break

						case "races": 
							return {
								human: {
									info: {
										age: 25,
										height: 5.5,
										weight: 150,
										description: "The standard homo sapiens sapiens, these farmers, craftsmen, and traders are swift and smart, obligatory tool-users, and motivated by self-interest and often the well-being of friends and family.",
										ability: "Humans have increased physical ability skills: carry, throw, jump, run, and swim.",
									},
									statistics: {
										perception: -1,
										memory: -1,
										logic: 1,
										strength: 0,
										dexterity: 1,
										immunity: -1,
										speed: 1
									},
									skills: {
										perception: { sight: 7, sound: 7, scent: 5, taste: 3, touch: 6 },
										memory: { lang_human: 7 },
										logic: { pattern_recognition: 3},
										strength: { punch: 0, throw: 5, carry: 4 },
										dexterity: { martial_arts: 0, crafting: 2 },
										immunity: { recover: 0, sleep_resistance: 2 },
										speed: { kick: 0, jump: 4, run: 5,  swim: 3 }
									}
								},
								elf: {
									info: {
										age: 200,
										height: 5.5,
										weight: 125,
										description: "Standard fantasy elf, with a long lifespan, pointy ears, tall build, precision dexterity, mysticism, and knowledge of nature.",
										ability: "Elves have high perception across all senses, making them keenly aware of their surroundings at all times.",
									},
									statistics: {
										perception: 1,
										memory: 1,
										logic: -1,
										strength: -1,
										dexterity: 1,
										immunity: -1,
										speed: 0
									},
									skills: {
										perception: { sight: 10, sound: 10, scent: 10, taste: 10, touch: 10, night_vision: 3 },
										memory: { lang_elf: 7 },
										logic: {},
										strength: { punch: 0, carry: 1, throw: 2 },
										dexterity: { martial_arts: 0 },
										immunity: { recover: 2, sleep_resistance: 2 },
										speed: { kick: 0, jump: 5, run: 5, swim: 1 }
									}
								},
								dwarf: {
									info: {
										age: 50,
										height: 4,
										weight: 200,
										description: "Standard fantasy dwarf, with short stature, powerful strength, and an affinity for geology, masonry, and war.",
										ability: "Dwarves are strong fighters with powerful punch and kick attacks that each deal 3d6 damage.",
									},
									statistics: {
										perception: -1,
										memory: 0,
										logic: -1,
										strength: 1,
										dexterity: -1,
										immunity: 1,
										speed: 1
									},
									skills: {
										perception: { sight: 6, sound: 7, scent: 4, taste: 4, touch: 7, night_vision: 2 },
										memory: { lang_dwarf: 7 },
										logic: {},
										strength: { punch: 0, carry: 5, throw: 4 },
										dexterity: { martial_arts: 0, crafting: 3 },
										immunity: { recover: 0 },
										speed: { kick: 0, jump: 2, run: 2, swim: 1, dodge: 2 }
									},
									d6changes: [
										{
											statistic: "strength",
											skill: "punch",
											d6: 1
										},
										{
											statistic: "speed",
											skill: "kick",
											d6: 1
										}
									]
								},
								halfling: {
									info: {
										age: 40,
										height: 3.5,
										weight: 100,
										description: "Standard fantasy halfling/hobbit, with pointy ears, hairy feet, half height, and a love of food, gardening, music, and simple pleasures.",
										ability: "Halfings are hard to influence; they negate opponent skill bonuses when the opponent influences via charisma.",
									},
									statistics: {
										perception: 0,
										memory: 1,
										logic: -1,
										strength: -1,
										dexterity: 1,
										immunity: 1,
										speed: -1
									},
									skills: {
										perception: { sight: 5, sound: 7, scent: 5, taste: 7, touch: 4 },
										memory: { lang_halfling: 7 },
										logic: { remain_calm: 2 },
										strength: { punch: 0, carry: 2, throw: 3, climb: 2 },
										dexterity: { martial_arts: 0 },
										immunity: { recover: 0 },
										speed: { kick: 0, jump: 4, run: 3, swim: 2, sneak: 3 }
									}
								},
								gnome: {
									info: {
										age: 50,
										height: 3,
										weight: 75,
										description: "Standard fantasy gnome, with earth tones and short builds, long beards and pointy hats, and a focus on trickery, illusion, and crafting.",
										ability: "Gnomes easily influence others; they negate opponent skill bonuses when influencing an opponent via charisma.",
									},
									statistics: {
										perception: 1,
										memory: -1,
										logic: 1,
										strength: -1,
										dexterity: 0,
										immunity: 1,
										speed: -1
									},
									skills: {
										perception: { sight: 7, sound: 7, scent: 6, taste: 3, touch: 5 },
										memory: { lang_gnome: 7 },
										logic: { persuade: 2 },
										strength: { punch: 0, carry: 2, throw: 4 },
										dexterity: { martial_arts: 0, crafting: 3 },
										immunity: { recover: 0 },
										speed: { kick: 0, jump: 3, run: 2, swim: 3, dodge: 2 }
									}
								},
								tiefling: {
									info: {
										age: 30,
										height: 5,
										weight: 150,
										description: "Standard fantasy tiefling, with pinkish skin, two horns, night vision, a prehensile tail, and a mysterious and tricky nature.",
										ability: "Tieflings are naturally resistant to extreme heat and fire damage, and can use their tail like a punch attack.",
									},
									statistics: {
										perception: -1,
										memory: -1,
										logic: 1,
										strength: -1,
										dexterity: 1,
										immunity: 1,
										speed: 0
									},
									skills: {
										perception: { sight: 4, sound: 7, scent: 7, taste: 4, touch: 6, night_vision: 3 },
										memory: { lang_tiefling: 7 },
										logic: { intimidate: 2 },
										strength: { punch: 0, carry: 2, throw: 4 },
										dexterity: { martial_arts: 0 },
										immunity: { recover: 0, temperature_resistance: 14 },
										speed: { kick: 0, jump: 5, run: 3, swim: 0, sneak: 2 }
									}
								},
								goblin: {
									info: {
										age: 15,
										height: 3.5,
										weight: 100,
										description: "Standard fantasy goblins, with small frames, dark red or yellow skin, low intelligence, and a crass, lowly standard of living.",
										ability: "Goblins are immune to most toxins, with +7 resistance to poison, infection, allergies, and alcohol.",
									},
									statistics: {
										perception: 0,
										memory: -1,
										logic: -1,
										strength: -1,
										dexterity: 1,
										immunity: 1,
										speed: 1
									},
									skills: {
										perception: { sight: 4, sound: 7, scent: 7, taste: 3, touch: 7, night_vision: 2 },
										memory: { lang_goblin: 7 },
										logic: {},
										strength: { punch: 0, carry: 1, throw: 4 },
										dexterity: { martial_arts: 0, ride_animals: 3 },
										immunity: { recover: 0, poison_resistance: 7, infection_resistance: 7, allergy_resistance: 7, alcohol_tolerance: 7 },
										speed: { kick: 0, jump: 4, run: 2, swim: 3, sneak: 2 }
									}
								},
								orc: {
									info: {
										age: 20,
										height: 6,
										weight: 250,
										description: "Standard fantasy orcs, with large bodies covered in rough, dark-colored skin, a warlike temperament and preference for violence.",
										ability: "Orcs are strong fighters with powerful punch and kick attacks that each deal 3d6 damage.",
									},
									statistics: {
										perception: -1,
										memory: -1,
										logic: -1,
										strength: 1,
										dexterity: 1,
										immunity: 0,
										speed: 1
									},
									skills: {
										perception: { sight: 6, sound: 6, scent: 7, taste: 4, touch: 5, night_vision: 2 },
										memory: { lang_orc: 7 },
										logic: {},
										strength: { punch: 0, carry: 4, throw: 3, melee: 3 },
										dexterity: { martial_arts: 0, fencing: 2 },
										immunity: { recover: 0 },
										speed: { kick: 0, jump: 3, run: 3, swim: 1 }
									},
									d6changes: [
										{
											statistic: "strength",
											skill: "punch",
											d6: 1
										},
										{
											statistic: "speed",
											skill: "kick",
											d6: 1
										}
									]
								},
								lizardfolk: {
									info: {
										age: 20,
										height: 5,
										weight: 150,
										description: "Standard fantasy lizard people, with medium-sized reptilian/humanoid bodies, forked tongues, webbed feet, and scales.",
										ability: "Lizardfolk can camouflage in any setting, giving opponents a -14 on sight checks.",
									},
									statistics: {
										perception: 1,
										memory: -1,
										logic: -1,
										strength: -1,
										dexterity: 1,
										immunity: 1,
										speed: 0
									},
									skills: {
										perception: { sight: 6, sound: 5, scent: 7, taste: 7, touch: 3, camouflage: 14 },
										memory: { lang_lizardfolk: 7 },
										logic: {},
										strength: { punch: 0, carry: 1, throw: 1 },
										dexterity: { martial_arts: 0 },
										immunity: { recover: 2, poison_resistance: 2 },
										speed: { kick: 0, jump: 5, run: 2, swim: 5, sneak: 3 }
									}
								},
								bhios: {
									info: {
										age: 35,
										height: 5.5,
										weight: 150,
										description: "These forest-dwelling hominins are logical, passionate, and well-spoken. They’ve adapted to a mostly peaceful and democratic existence, if technologically stagnant.",
										ability: "With their photosynthetic green skin, bhioses recover 1d6 extra damage per recovery in sunlight.",
									},
									statistics: {
										perception: -1,
										memory: 1,
										logic: 1,
										strength: -1,
										dexterity: 0,
										immunity: 1,
										speed: -1
									},
									skills: {
										perception: { sight: 7, sound: 6, scent: 5, taste: 5, touch: 5 },
										memory: { lang_bhios: 7 },
										logic: { remain_calm: 2 },
										strength: { punch: 0, carry: 2, throw: 3, climb: 2 },
										dexterity: { martial_arts: 0 },
										immunity: { recover: 3 },
										speed: { kick: 0, jump: 3, run: 3, swim: 3 }
									},
									d6changes: [
										{
											statistic: "immunity",
											skill: "recover",
											d6: 1
										}
									]
								},
								mellifax: {
									info: {
										age: 15,
										height: 3,
										weight: 50,
										description: "Between three and four feet tall, these fairy folk are small, but clever. A secluded people, living in underground forest hives, they are often driven by racial ties, and have a close bond and deep understanding of nature.",
										ability: "With their small wings, mellifaxi can hover at a low distance above the ground for a minute at a time.",
									},
									statistics: {
										perception: -1,
										memory: 0,
										logic: -1,
										strength: -1,
										dexterity: 1,
										immunity: 1,
										speed: 1
									},
									skills: {
										perception: { sight: 3, sound: 7, scent: 6, taste: 5, touch: 7 },
										memory: { lang_mellifax: 7 },
										logic: {},
										strength: { punch: 0, carry: 1, throw: 4 },
										dexterity: { martial_arts: 0 },
										immunity: { recover: 0, poison_resistance: 3 },
										speed: { kick: 0, jump: 5, run: 3, swim: 1, dodge: 2, fly: 10, sneak: 2 }
									}
								},
								preas: {
									info: {
										age: 20,
										height: 5,
										weight: 125,
										description: "Tradition and clan loyalty hold first priority for this dark-purple-skinned people, but a connection with animal life is close behind. They have developed a symbiotic relationship with dozens of forest, mountain, and plains creatures.",
										ability: "With patience and intuition, preases have +7 animal handling; all animals are at -7 when resisting influence.",
									},
									statistics: {
										perception: 0,
										memory: 1,
										logic: -1,
										strength: 1,
										dexterity: 1,
										immunity: -1,
										speed: -1
									},
									skills: {
										perception: { sight: 7, sound: 5, scent: 6, taste: 5, touch: 5 },
										memory: { lang_preas: 7, facial_recognition: 3 },
										logic: { handle_animals: 7, evoke_emotion: 2 },
										strength: { punch: 0, carry: 1, throw: 2 },
										dexterity: { martial_arts: 0, ride_animals: 2 },
										immunity: { recover: 0 },
										speed: { kick: 0, jump: 3, run: 4, swim: 4 }
									}
								},
								winge: {
									info: {
										age: 25,
										height: 6,
										weight: 200,
										description: "Tall, strong, and mean, these orange-skinned warriors are bound by a strict code of honor which values ability above all. Their civilization is driven by conquest and power, and has unparalleled knowledge of geology and chemistry.",
										ability: "With their thick skin, winges have a natural 1d6 armor, blocking physical damage every round of combat.",
									},
									statistics: {
										perception: -1,
										memory: -1,
										logic: 1,
										strength: 1,
										dexterity: -1,
										immunity: 1,
										speed: 0
									},
									skills: {
										perception: { sight: 6, sound: 7, scent: 7, taste: 4, touch: 4 },
										memory: { lang_winge: 7 },
										logic: { remain_calm: 3, spatial_reasoning: 2 },
										strength: { punch: 0, carry: 5, throw: 2 },
										dexterity: { martial_arts: 2 },
										immunity: { recover: 0, defend: 14 },
										speed: { kick: 0, jump: 2, run: 4, swim: 1 }
									},
									d6changes: [
										{
											statistic: "immunity",
											skill: "defend",
											d6: 1
										}
									]
								}
							}
						break

						case "classes":
							return {
								barbarian: {
									races: ["dwarf", "goblin", "human", "orc", "winge", "lizardfolk"],
									statistics: {
										strength: 2,
										speed: 2,
										logic: -2,
										memory: -2
									},
									skills: ["dodge", "climb", "carry", "punch", "throw", "crafting", "handle_animals", "intimidate", "meditate", "zoology", "pattern_recognition", "ride_animals", "melee", "wrestle", "swim", "pain_tolerance", "alcohol_tolerance", "sleep_resistance", "jump", "run", "punch", "kick"]
								},
								bard: {
									races: ["elf", "gnome", "halfling", "human", "mellifax", "preas"],
									statistics: {
										memory: 2,
										logic: 2,
										strength: -2,
										speed: -2
									},
									skills: ["dodge", "persuade", "seduce", "humor", "climb", "crafting", "escape_bonds", "lip_reading", "botany", "alchemy", "astronomy", "geography", "geology", "history", "mathematics", "mechanics", "language", "performance", "musicianship", "game_playing", "judge_character", "penmanship", "sneak", "sleight_of_hand", "alcohol_tolerance", "cooking"]
								},
								cleric: {
									races: ["elf", "dwarf", "halfling", "human", "bhios", "preas"],
									statistics: {
										memory: 2,
										immunity: 2,
										strength: -2,
										perception: -2
									},
									skills: ["crafting", "persuade", "medicine", "history", "facial_recognition", "language", "judge_character", "remain_calm", "evoke_emotion", "meditate", "musicianship", "cooking", "botany", "astronomy", "recover", "infection_resistance", "poison_resistance", "pain_tolerance", "survival"]
								},
								druid: {
									races: ["elf", "gnome", "goblin", "human", "mellifax", "preas"],
									statistics: {
										dexterity: 2,
										speed: 2,
										strength: -2,
										logic: -2
									},
									skills: ["climb", "carry", "fishing", "archery", "crafting", "handle_animals", "meditate", "geography", "geology", "botany", "zoology", "ride_animals", "medicine", "swim", "remain_calm", "sneak", "sleight_of_hand", "poison_resistance", "infection_resistance", "allergy_resistance", "sleep_resistance", "recover", "survival"]
								},
								fighter: {
									races: ["elf", "dwarf", "human", "orc", "bhios", "winge"],
									statistics: {
										strength: 2,
										logic: 2,
										memory: -2,
										perception: -2
									},
									skills: ["climb", "crafting", "handle_animals", "intimidate", "spatial_reasoning", "mechanics", "metalworking", "woodworking", "leatherworking", "ride_animals", "swim", "dodge", "punch", "melee", "wrestle", "fencing", "missile", "carry", "pain_tolerance", "run", "jump"]
								},
								monk: {
									races: ["elf", "goblin", "halfling", "human", "bhios", "lizardfolk"],
									statistics: {
										strength: 2,
										dexterity: 2,
										immunity: -2,
										logic: -2
									},
									skills: ["block", "climb", "craft", "escape_bonds", "intimidate", "meditate", "history", "geography", "pattern_recognition", "astronomy", "remain_calm", "performance", "ride_animals", "judge_character", "sneak", "sleight_of_hand", "swim", "dodge", "punch", "kick", "martial_arts", "wrestle", "jump", "run", "throw", "recover"]
								},
								paladin: {
									races: ["elf", "dwarf", "human", "orc", "bhios", "winge"],
									statistics: {
										logic: 2,
										dexterity: 2,
										memory: -2,
										speed: -2
									},
									skills: ["block", "crafting", "persuade", "handle_animals", "medicine", "history", "ride_animals", "judge_character", "remain_calm", "facial_recognition", "wrestle", "fencing", "missile", "pain_tolerance", "infection_resistance", "sleep_resistance", "run", "carry"]
								},
								ranger: {
									races: ["elf", "goblin", "human", "orc", "preas", "lizardfolk"],
									statistics: {
										dexterity: 2,
										perception: 2,
										strength: -2,
										logic: -2
									},
									skills: ["climb", "crafting", "handle_animals", "persuade", "mechanics", "geography", "botany", "alchemy", "geology", "zoology", "woodworking", "ride_animals", "sneak", "dodge", "jump", "swim", "run", "archery", "missile", "remain_calm", "pattern_recognition", "spatial_reasoning", "infection_resistance", "allergy_resistance", "poison_resistance", "medicine", "survival"]
								},
								rogue: {
									races: ["gnome", "goblin", "halfling", "human", "mellifax", "lizardfolk"],
									statistics: {
										dexterity: 2,
										speed: 2,
										strength: -2,
										memory: -2
									},
									skills: ["persuade", "seduce", "game_playing", "climb", "crafting", "mechanics", "knifing", "lock_picking", "escape_bonds", "intimidate", "lip_reading", "facial_recognition", "pattern_recognition", "cooking", "language", "performance", "judge_character", "penmanship", "sneak", "sleight_of_hand", "wrestle", "dodge", "run", "swim", "missile", "survival"]
								},
								sorcerer: {
									races: ["elf", "gnome", "goblin", "human", "mellifax", "preas"],
									statistics: {
										strength: 2,
										memory: 2,
										logic: -2,
										perception: -2
									},
									skills: ["astronomy", "botany", "cooking", "geography", "history", "leatherworking", "medicine", "woodworking", "intimidate", "meditate", "persuade", "throw", "poison_resistance", "sleep_resistance", "performance", "sleight_of_hand", "survival"]
								},
								warlock: {
									races: ["elf", "human", "goblin", "orc", "winge", "lizardfolk"],
									statistics: {
										memory: 2,
										perception: 2,
										strength: -2,
										dexterity: -2
									},
									skills: ["alchemy", "astronomy", "cooking", "history", "metalworking", "zoology", "crafting", "intimidate", "meditate", "throw", "mechanics", "mathematics", "spatial_reasoning", "poison_resistance", "sleep_resistance"]
								},
								wizard: {
									races: ["elf", "gnome", "halfling", "human", "bhios", "winge"],
									statistics: {
										logic: 2,
										memory: 2,
										strength: -2,
										immunity: -2
									},
									skills: ["alchemy", "geography", "geology", "history", "leatherworking", "medicine", "metalworking", "woodworking", "crafting", "persuade", "meditate", "throw", "mechanics", "mathematics", "spatial_reasoning", "sleep_resistance", "performance", "sleight_of_hand"]
								}
							}
						break

					// stats
						case "statistics":
							return {
								perception: "The baseline for all senses (sight, sound, scent, taste, and touch), with modifiers added for each race. This also controls special abilities and race-specific senses: internal clock, perfect pitch, color sense; night vision, infrared vision, internal compass, echolocation, etc. (When creating a character, consult with the GM to determine if any of these special skills are applicable.) This corresponds to the eyes, ears, nose, tongue, skin.",
								memory: "All knowledge accumulated, including languages, trades, and knowledge of specific fields. Some useful applications are alchemy, botany, medicine, and metalworking. This corresponds to the hippocampus.",
								logic: "Figuring things out, learning, and recognizing patterns, from making maps with spatial reasoning, to remaining calm in resisting surprise and opponents' charisma. This corresponds to the cerebrum.",
								strength: "Upper body strength. A character’s carrying capacity, climbing ability, and throwing distance and accuracy are governed by this statistic, as is effectiveness in melee combat. This corresponds to the torso and arm muscles.",
								dexterity: "Hand-eye coordination, fine motor skills, and balance. This is key when aiming and fencing in combat, riding an animal, using sleight of hand, crafting, and in performance art. This corresponds to the wrist and hand muscles.",
								immunity: "Natural defenses against injury, infection, hunger and thirst, heat and cold, pain, and more. This also correlates to the rate of recovery following combat, infection, and poison. This corresponds to the immune, cardiovascular, and respiratory systems.",
								speed: "Lower body strength, including jumping, running, and swimming. This also determines turn order, the ability to dodge and sneak, and distance a character can move during combat. This corresponds to the leg and feet muscles."
							}
						break

						case "skills":
							return {
								perception: [
									{name: "sight", unremovable: true}, {name: "sound", unremovable: true}, {name: "scent", unremovable: true}, {name: "taste", unremovable: true}, {name: "touch", unremovable: true},
									{name: "internal_clock"}, {name: "perfect_pitch"}, {name: "color_sense"},
									{name: "night_vision", animals: true}, {name: "infrared_vision", animals: true}, {name: "internal_compass", animals: true}, {name: "infrasound", animals: true}, {name: "echolocation", animals: true}, {name: "camouflage", animals: true}
								],
								memory: [
									{name: "alchemy"}, {name: "astronomy"}, {name: "botany"}, {name: "cooking"}, {name: "facial_recognition"}, {name: "geography"}, {name: "geology"}, {name: "history"}, {name: "leatherworking"}, {name: "linguistics"}, {name: "lip_reading"}, {name: "medicine"}, {name: "metalworking"}, {name: "survival"}, {name: "woodworking"}, {name: "voice_recognition"}, {name: "zoology"},
									{name: "lang_human"}, {name: "lang_elf"}, {name: "lang_dwarf"}, {name: "lang_halfling"}, {name: "lang_gnome"}, {name: "lang_tiefling"}, {name: "lang_goblin"}, {name: "lang_orc"}, {name: "lang_lizardfolk"}, {name: "lang_bhios"}, {name: "lang_mellifax"}, {name: "lang_preas"}, {name: "lang_winge"}
								],
								logic: [
									{name: "evoke_emotion", charisma: true, counters: ["judge_character", "remain_calm"], conditions: ["alertness", "confusion", "determination", "exhaustion", "fear"]}, {name: "handle_animals", charisma: true, counters: ["judge_character", "aggression"], conditions: ["alertness", "determination", "fear"]}, {name: "humor", charisma: true, counters: ["remain_calm"], conditions: ["confusion"]}, {name: "intimidate", charisma: true, counters: ["remain_calm"], conditions: ["alertness", "fear", "surprise"]}, {name: "persuade", charisma: true, counters:["judge_character"], conditions: ["concentration", "confusion", "determination"]}, {name: "seduce", charisma: true, counters:["judge_character", "remain_calm"], conditions: ["confusion", "determination", "exhaustion"]},
									{name: "game_playing"}, {name: "judge_character"}, {name: "mathematics"}, {name: "mechanics"}, {name: "meditate", conditions: ["alertness", "concentration", "determination", "fear", "perceptiveness", "rage"]}, {name: "pattern_recognition"}, {name: "remain_calm"}, {name: "spatial_reasoning"},
									{name: "aggression", animals: true}, {name: "training", animals: true}
								],
								strength: [
									{name: "archery", combat: true}, {name: "block"}, {name: "carry", unremovable: true}, {name: "climb"}, {name: "fishing"}, {name: "melee", combat: true}, {name: "punch", combat: true, d6: 2, unremovable: true}, {name: "throw", combat: true, unremovable: true}, {name: "wrestle"},
									{name: "bite", combat: true, animals: true, d6: 4}, {name: "slam", combat: true, animals: true, d6: 4}, {name: "tusk", combat: true, animals: true, d6: 4}
								],
								dexterity: [
									{name: "catch"}, {name: "crafting"}, {name: "drawing"}, {name: "escape_bonds"}, {name: "fencing", combat: true}, {name: "knifing", combat: true}, {name: "lock_picking"}, {name: "martial_arts", combat: true, d6: 2, unremovable: true}, {name: "missile", combat: true}, {name: "musicianship"}, {name: "penmanship"}, {name: "performance"}, {name: "ride_animals"}, {name: "sleight_of_hand"},
									{name: "claws", combat: true, animals: true, d6: 3}, {name: "talons", combat: true, animals: true, d6: 2}
								],
								immunity: [
									{name: "alcohol_tolerance"}, {name: "allergy_resistance"}, {name: "hold_breath"}, {name: "infection_resistance"}, {name: "metabolism"}, {name: "pain_tolerance"}, {name: "poison_resistance"}, {name: "recover", d6: 1, unremovable: true}, {name: "sleep_resistance"},
									{name: "defend", animals: true, d6: 0}, {name: "temperature_resistance", animals: true}
								],
								speed: [
									{name: "dance"}, {name: "dodge"}, {name: "jump", unremovable: true}, {name: "kick", combat: true, d6: 2, unremovable: true}, {name: "run", unremovable: true}, {name: "sneak"}, {name: "swim", unremovable: true},
									{name: "fly", animals: true}
								]
							}
						break

					// stuff
						case "damage":
							return {
								acid: {
									name: "acid",
									d6: 3,
									blockable: true,
									description: [
										"immunity check to resist pain",
										"if dissolvable, reduces item nd6 by 1"
									]
								},
								electricity: {
									name: "electricity",
									d6: 2,
									blockable: false,
									description: [
										"immunity check to resist pain or else paralysis",
										"attracted to metal: +5 to combat skills against an opponent using metal weapon, armor, or items",
										"if conductor, reduces item nd6 by 1"
									]
								},
								extreme_cold: {
									name: "extreme cold",
									d6: 1,
									blockable: false,
									description: [
										"immunity check to resist pain or else body pain",
										"damage incurred every hour of exposure",
										"if applicable, reduces item nd6 by 1"
									]
								},
								extreme_heat: {
									name: "extreme heat",
									d6: 1,
									blockable: false,
									description: [
										"immunity check to resist pain or else body pain",
										"damage incurred every hour of exposure",
										"if applicable, reduces item nd6 by 1"
									]
								},
								falling: {
									name: "falling",
									d6: null,
									blockable: false,
									description: [
										"height determines fall damage: 1d6 per 10 feet",
										"landing in water reduces 3d6",
										"landing in loose brush reduces 1d6"
									]
								},
								fire: {
									name: "fire",
									d6: 3,
									blockable: true,
									description: [
										"immunity check to resist pain",
										"dexterity check to put out flames",
										"fuel determines burn duration; if flammable, reduces item nd6 by 1"
									]
								},
								hard_object: {
									name: "hard object",
									d6: 3,
									blockable: true,
									description: [
										"must be thrown or used as a melee weapon"
									]
								},
								infection: {
									name: "infection",
									d6: 2,
									blockable: false,
									description: [
										"immunity check to resist infection",
										"immunity check to resist infection during recover",
										"prevents recovery"
									]
								},
								poison: {
									name: "poison",
									d6: 2,
									blockable: false,
									description: [
										"immunity check to resist poison",
										"immunity check to resist poison during recover",
										"prevents recovery"
									]
								},
								trap: {
									name: "trap",
									d6: 3,
									blockable: true,
									description: [
										"immunity check to resist pain, or else paralysis",
										"mechanics, metalworking, woodworking, escape bonds, lock picking to escape"
									]
								},
								weapon: {
									name: "weapon",
									d6: null,
									blockable: true,
									description: [
										"see weapons for damage nd6",
										"if not meant to be thrown, resolve as hard object"
									]
								}
							}
						break

						case "conditions":
							return {
								alertness: {
									name: "alertness",
									description: "Boosts physical attributes. Can be caused by evoke emotion, intimidate, handle animals, meditate.",
									effects: {
										strength: {statistic: 2},
										dexterity: {statistic: 2},
										speed: {statistic: 2},
										perception: {statistic: 2}
									}
								},
								asphyxiation: {
									name: "asphyxiation",
									description: "Roll hold breath before rolling a check for any other statistic. Unconscious in 20 rounds (2 minutes).",
									effects: {
										perception: {taste: -10, scent: -10},
									},
									immunity_check: {
										skill: "hold_breath",
										before: ["perception", "memory", "logic", "strength", "dexterity", "speed"]
									}
								},
								bleeding: {
									name: "bleeding",
									description: "Reduces recovery and protection against infection and poison.",
									effects: {
										immunity: {recover: -2, infection_resistance: -5, poison_resistance: -5}
									}
								},
								blinding_light: {
									name: "blinding_light",
									description: "Impairs sight. -10 on skills where sight matters, such as combat.",
									effects: {
										perception: {sight: -10},
										strength: {melee: -10, archery: -10, throw: -10, punch: -10},
										dexterity: {fencing: -10, knifing: -10, missile: -10, martial_arts: -10},
										speed: {kick: -10}
									}
								},
								concentration: {
									name: "concentration",
									description: "Boosts mental attributes. Can be caused by persuade, meditate.",
									effects: {
										perception: {statistic: 2},
										memory: {statistic: 2},
										logic: {statistic: 2}
									}
								},
								confusion: {
									name: "confusion",
									description: "Reduces mental attributes. Can be caused by evoke emotion, humor, persuade, seduce.",
									effects: {
										perception: {statistic: -2},
										memory: {statistic: -2},
										logic: {statistic: -2}
									}
								},
								darkness: {
									name: "darkness",
									description: "Impairs sight. -10 on skills where sight matters, such as combat.",
									effects: {
										perception: {sight: -10},
										strength: {melee: -10, archery: -10, throw: -10, punch: -10},
										dexterity: {fencing: -10, knifing: -10, missile: -10, martial_arts: -10},
										speed: {kick: -10}
									}
								},
								determination: {
									name: "determination",
									description: "Boosts nearly all attributes. Can be caused by evoke emotion, persuade, handle animals, meditate, seduce.",
									effects: {
										perception: {statistic: 1},
										memory: {statistic: 1},
										logic: {statistic: 1},
										strength: {statistic: 1},
										dexterity: {statistic: 1},
										immunity: {pain_tolerance: 5},
										speed: {statistic: 1}
									}
								},
								dual_wielding: {
									name: "dual_wielding",
									description: "Impairs dexterity & strength. Caused by using two weapons or using a weapon with a shield.",
									effects: {
										dexterity: {statistic: -5},
										strength: {statistic: -5}
									}
								},
								encumbrance: {
									name: "encumbrance",
									description: "Caused by carrying weight meeting or exceeding maximum carrying capacity.",
									effects: {
										dexterity: {statistic: -2},
										speed: {statistic: -2, run: -2, swim: -5, sneak: -2}
									}
								},
								exhaustion: {
									name: "exhaustion",
									description: "Roll sleep resistance before rolling a check for any other statistic. Unconscious in 1 week of no sleep or 1 week of no food. Can be caused by evoke emotion, seduce.",
									effects: {
										strength: {statistic: -2},
										dexterity: {statistic: -2},
										speed: {statistic: -2}
									},
									immunity_check: {
										skill: "sleep_resistance",
										before: ["perception", "memory", "logic", "strength", "dexterity", "speed"]
									}
								},
								extreme_cold: {
									name: "extreme_cold",
									description: "Roll pain tolerance before strength, dexterity, speed.",
									immunity_check: {
										skill: "pain_tolerance",
										before: ["strength", "dexterity", "speed"],
										d6: 1
									}
								},
								extreme_heat: {
									name: "extreme_heat",
									description: "Roll pain tolerance before strength, dexterity, speed.",
									immunity_check: {
										skill: "pain_tolerance",
										before: ["strength", "dexterity", "speed"],
										d6: 1
									}
								},
								fear: {
									name: "fear",
									description: "Reduces mental attributes but improves run ability. Roll remain calm or else unable to attack influencer. Can be caused by evoke emotion, intimidate, handle animals, meditate.",
									effects: {
										memory: {statistic: -2},
										logic: {statistic: -2},
										speed: {run: 2}
									}
								},
								fog: {
									name: "fog",
									description: "Impairs sight. -5 on skills where sight matters, such as combat.",
									effects: {
										perception: {sight: -5},
										strength: {melee: -5, archery: -5, throw: -5, punch: -5},
										dexterity: {fencing: -5, knifing: -5, missile: -5, martial_arts: -5},
										speed: {kick: -5} 
									}	
								},
								immunity_boost: {
									name: "immunity_boost",
									description: "Boosts recovery and immunity against infection and poison.",
									effects: {
										immunity: {recover: 5, infection_resistance: 5, poison_resistance: 5, alcohol_tolerance: 5}
									}
								},
								inebriation: {
									name: "inebriation",
									description: "Impairs perception. Roll alcohol tolerance before rolling a check for any other statistic.",
									effects: {
										perception: {statistic: -10},
									},
									immunity_check: {
										skill: "alcohol_tolerance",
										before: ["perception", "memory", "logic", "strength", "dexterity", "speed"]
									}
								},
								infection: {
									name: "infection",
									description: "Roll infection resistance during each recover attempt until a successful check. Unable to recover.",
									immunity_check: {
										skill: "infection_resistance",
										d6: 2
									}
								},
								liquid_barrier: {
									name: "liquid_barrier",
									description: "Impairs sound.",
									effects: {
										perception: {sound: -10}
									}
								},
								loud_noise: {
									name: "loud_noise",
									description: "Impairs sound.",
									effects: {
										perception: {sound: -10}
									}
								},
								minor_pain_body: {
									name: "minor_pain_body",
									description: "Roll pain tolerance before strength, dexterity, speed.",
									immunity_check: {
										skill: "pain_tolerance",
										before: ["strength", "dexterity", "speed"]
									}
								},
								minor_pain_head: {
									name: "minor_pain_head",
									description: "Roll pain tolerance before perception, memory, logic.",
									immunity_check: {
										skill: "pain_tolerance",
										before: ["perception", "memory", "logic"]
									}
								},
								noxious_odor: {
									name: "noxious_odor",
									description: "Smells bad.",
									effects: {
										perception: {scent: -10}
									}
								},
								pain_relief: {
									name: "pain_relief",
									description: "Boosts pain resistance.",
									effects: {
										immunity: {pain_tolerance: 5}
									}
								},
								paralysis_arms: {
									name: "paralysis_arms",
									description: "Impairs dexterity & strength.",
									effects: {
										dexterity: {statistic: -10},
										strength: {statistic: -10}
									}
								},
								paralysis_legs: {
									name: "paralysis_legs",
									description: "Impairs speed.",
									effects: {
										speed: {statistic: -10}
									}
								},
								perceptiveness: {
									name: "perceptiveness",
									description: "Boosts perception and insight skills. Can be caused by meditate.",
									effects: {
										perception: {statistic: 2},
										memory: {facial_recognition: 2, voice_recognition: 2, lip_reading: 2},
										logic: {judge_character: 2, pattern_recognition: 2}
									}
								},
								poison: {
									name: "poison",
									description: "Roll poison resistance during each recover attempt until a successful check. Unable to recover.",
									immunity_check: {
										skill: "poison_resistance",
										d6: 2
									}
								},
								rage: {
									name: "rage",
									description: "Boosts physical skills at the cost of mental skills. Can be caused by evoke emotion, handle animals, meditate.",
									effects: {
										perception: {statistic: -2},
										memory: {statistic: -2},
										logic: {statistic: -2},
										strength: {statistic: 5},
										speed: {statistic: 5}
									}
								},
								resistance: {
									name: "resistance",
									description: "Boost recovery and immunity against infection and poison. Roll an additional 1d6 armor against physical attacks.", // ???
									effects: {
										immunity: {recover: 5, infection_resistance: 5, poison_resistance: 5, alcohol_tolerance: 5}
									}
								},
								severe_pain: {
									name: "severe_pain",
									description: "Roll pain tolerance before rolling a check for any other statistic. Caused when any statistic is reduced to 1.",
									immunity_check: {
										skill: "pain_tolerance",
										before: ["perception", "memory", "logic", "strength", "dexterity", "speed"]
									}
								},
								sleep: {
									name: "sleep",
									description: "Roll sleep resistance or else unable to act in any way. To be awakened, roll perception plus applicable sense. If attacked, immediately wake up.",
									immunity_check: {
										skill: "sleep_resistance",
										before: ["memory", "logic", "strength", "dexterity", "speed"]
									},
									effects: {
										perception: {statistic: -10, sight: -5}
									}
								},
								smoke: {
									name: "smoke",
									description: "Impairs sight & scent. -5 on skills where sight matters, such as combat. Roll hold breath before strength and speed.",
									immunity_check: {
										skill: "hold_breath",
										before: ["strength", "speed"]
									},
									effects: {
										perception: {sight: -5, scent: -5},
										strength: {melee: -5, archery: -5, throw: -5, punch: -5},
										dexterity: {fencing: -5, knifing: -5, missile: -5, martial_arts: -5},
										speed: {kick: -5} 
									}	
								},
								solid_barrier: {
									name: "solid_barrier",
									description: "Impairs sound.",
									effects: {
										perception: {sound: -10}
									}
								},
								surprise: {
									name: "surprise",
									description: "Roll remain calm or else unable to act for 1 round. Can be caused by intimidate.",
								},
								unconsciousness: {
									name: "unconsciousness",
									description: "A character with any statistic at 0 is unconscious and unable to act in any way.",
									effects: {
										perception: {statistic: -100},
										memory: {statistic: -100},
										logic: {statistic: -100},
										strength: {statistic: -100},
										dexterity: {statistic: -100},
										immunity: {statistic: -100},
										speed: {statistic: -100}
									}
								},
								zombie_infection: {
									name: "zombie_infection",
									description: "An infected character is unable to use most tools, use any knowledge or language skills, or perform complex tasks and planning.",
									effects: {
										perception: {sound: 2, scent: 5, taste: -5, touch: -5},
										memory: {statistic: -5},
										logic: {statistic: -5, handle_animals: -10, humor: -10, persuade: -10, seduce: -10},
										strength: {statistic: 2, archery: -10},
										dexterity: {statistic: -5, fencing: -10, missile: -10},
										immunity: {pain_tolerance: 10, poison_resistance: 10, sleep_resistance: 10},
										speed: {statistic: -2}
									}
								}
							}
						break

						case "items":
							return {
								other: [
									{
										name: "small item",
										count: 1,
										type: "other",
										weight: 1,
										d6: 1,
										hands: 1,
										usage: [
											{
												statistic: "dexterity",
												skill: "crafting",
											},
											{
												statistic: "strength",
												skill: "throw",
												d6: 1,
											}
										],
										materials: "?",
										cost: 1,
										description: "..."
									},
									{
										name: "medium item",
										count: 1,
										type: "other",
										weight: 5,
										d6: 1,
										hands: 1,
										usage: [
											{
												statistic: "dexterity",
												skill: "crafting",
											},
											{
												statistic: "strength",
												skill: "throw",
												d6: 2,
											}
										],
										materials: "?",
										cost: 5,
										description: "..."
									},
									{
										name: "large item",
										count: 1,
										type: "other",
										weight: 10,
										d6: 1,
										hands: 2,
										usage: [
											{
												statistic: "dexterity",
												skill: "crafting",
											},
											{
												statistic: "strength",
												skill: "throw",
												d6: 3,
											}
										],
										materials: "?",
										cost: 10,
										description: "..."
									}
								],
								weapon: [
									{
										name: "axe",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "dexterity",
												skill: "fencing",
												d6: 5,
											}
										],
										conditions: {bleeding: 1},
										weight: 2,
										hands: 1,
										magnetic: true,
										materials: "leather, metal",
										cost: 50,
										description: " "
									},
									{
										name: "big club",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "strength",
												skill: "melee",
												d6: 6
											}
										],
										weight: 6,
										hands: 2,
										fuel: 4,
										materials: "wood",
										cost: 60,
										description: " "
									},
									{
										name: "big spiked club",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "strength",
												skill: "melee",
												d6: 7
											}
										],
										conditions: {bleeding: 1},
										weight: 7,
										hands: 2,
										fuel: 4,
										materials: "wood",
										cost: 80,
										description: " "
									},
									{
										name: "blowgun",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "dexterity",
												skill: "missile"
											}
										],
										weight: 1,
										hands: 1,
										fuel: 1,
										materials: "wood",
										cost: 30,
										description: "range: 50 ft"
									},
									{
										name: "bomb",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "strength",
												skill: "throw"
											}
										],
										weight: 1,
										hands: 1,
										materials: "glass",
										description: "see orbs"
									},
									{
										name: "boomerang",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3,
											}
										],
										weight: 2,
										hands: 1,
										fuel: 1,
										materials: "wood",
										cost: 20,
										description: "on a miss, thrower can attempt to catch"
									},
									{
										name: "brass knuckles",
										count: 1,
										type: "armor",
										armorType: "hands",
										d6: 5,
										usage: [
											{
												statistic: "strength",
												skill: "punch",
												d6: 2
											}
										],
										weight: 1,
										hands: 2,
										materials: "metal",
										cost: 40,
										description: "adds to punch damage; 5d6 hand armor"
									},
									{
										name: "claws",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "dexterity",
												skill: "martial_arts",
												d6: 3
											}
										],
										conditions: {bleeding: 1},
										weight: 2,
										hands: 2,
										materials: "leather, metal",
										cost: 50,
										description: "adds to martial arts damage"
									},
									{
										name: "club",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "strength",
												skill: "melee",
												d6: 4
											}
										],
										weight: 4,
										hands: 1,
										fuel: 3,
										materials: "wood",
										cost: 30,
										description: " "
									},
									{
										name: "crossbow",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "dexterity",
												skill: "missile"
											}
										],
										weight: 3,
										hands: 2,
										fuel: 2,
										materials: "wood, string, metal",
										cost: 60,
										description: "range: 150 ft"
									},
									{
										name: "dagger",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "dexterity",
												skill: "knifing",
												d6: 3
											},
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										conditions: {bleeding: 1},
										weight: 1,
										hands: 1,
										magnetic: true,
										materials: "metal",
										cost: 10,
										description: " "
									},
									{
										name: "flail",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "strength",
												skill: "melee",
												d6: 3
											}
										],
										conditions: {bleeding: 1},
										weight: 5,
										hands: 1,
										magnetic: true,
										materials: "leather, metal",
										cost: 90,
										description: "resolve the attack of each of 3 spiked balls individually"
									},
									{
										name: "fu tao",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "dexterity",
												skill: "martial_arts",
												d6: 4
											}
										],
										weight: 3,
										hands: 1,
										magnetic: true,
										materials: "metal",
										cost: 50,
										description: "hook sword; can be used to disarm or trip up opponent"
									},
									{
										name: "gauss pistol",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "dexterity",
												skill: "missile"
											}
										],
										weight: 2,
										hands: 1,
										fuel: 2,
										materials: "wood, metal",
										cost: 70,
										description: "range: 50 ft"
									},
									{
										name: "great axe",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "dexterity",
												skill: "fencing",
												d6: 7
											}
										],
										conditions: {bleeding: 1},
										weight: 5,
										hands: 2,
										magnetic: true,
										materials: "leather, metal",
										cost: 80,
										description: " "
									},
									{
										name: "great flail",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "strength",
												skill: "melee",
												d6: 7
											}
										],
										conditions: {bleeding: 1},
										weight: 5,
										hands: 2,
										magnetic: true,
										materials: "leather, metal",
										cost: 80,
										description: " "
									},
									{
										name: "halberd",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "dexterity",
												skill: "fencing",
												d6: 5
											}
										],
										conditions: {bleeding: 1},
										weight: 8,
										fuel: 4,
										hands: 2,
										magnetic: true,
										materials: "wood, metal",
										cost: 50,
										description: "attack from up to 10 feet away"
									},
									{
										name: "javelin",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 5
											},
											{
												statistic: "dexterity",
												skill: "fencing",
												d6: 4
											}
										],
										conditions: {bleeding: 1},
										weight: 3,
										hands: 1,
										fuel: 3,
										materials: "wood, metal",
										cost: 30,
										description: " "
									},
									{
										name: "kama",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "dexterity",
												skill: "martial_arts",
												d6: 3
											},
											{
												statistic: "strength",
												skill: "block",
												d6: 3
											}
										],
										conditions: {bleeding: 1},
										weight: 1,
										hands: 1,
										fuel: 2,
										magnetic: true,
										materials: "wood, metal",
										cost: 30,
										description: "free block action"
									},
									{
										name: "longbow",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "strength",
												skill: "archery"
											}
										],
										weight: 4,
										hands: 2,
										fuel: 3,
										materials: "wood, string",
										cost: 80,
										description: "range: (strength + archery) x 20 ft"
									},
									{
										name: "long staff",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "strength",
												skill: "melee",
												d6: 6
											}
										],
										weight: 6,
										hands: 2,
										fuel: 4,
										materials: "wood",
										cost: 60,
										description: " "
									},
									{
										name: "long sword",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "dexterity",
												skill: "fencing",
												d6: 7
											}
										],
										conditions: {bleeding: 1},
										weight: 5,
										hands: 2,
										magnetic: true,
										materials: "leather, metal",
										cost: 80,
										description: " "
									},
									{
										name: "mace",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "strength",
												skill: "melee",
												d6: 5
											}
										],
										weight: 4,
										hands: 1,
										magnetic: true,
										materials: "leather, metal",
										cost: 50,
										description: " "
									},
									{
										name: "metal stake",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "dexterity",
												skill: "knifing",
												d6: 3
											}
										],
										conditions: {bleeding: 1},
										weight: 0.5,
										hands: 1,
										magnetic: true,
										materials: "metal",
										cost: 5,
										description: " "
									},
									{
										name: "morningstar",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "dexterity",
												skill: "fencing",
												d6: 5
											}
										],
										conditions: {bleeding: 1},
										weight: 4,
										hands: 1,
										magnetic: true,
										materials: "leather, metal",
										cost: 50,
										description: " "
									},
									{
										name: "pike",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 5
											},
											{
												statistic: "dexterity",
												skill: "fencing",
												d6: 4
											}	
										],
										conditions: {bleeding: 1},
										weight: 3,
										hands: 1,
										fuel: 3,
										materials: "wood, metal",
										cost: 30,
										description: " "
									},
									{
										name: "razor boomerang",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 4
											}
										],
										conditions: {bleeding: 1},
										weight: 3,
										hands: 1,
										magnetic: true,
										materials: "metal",
										cost: 40,
										description: "on a miss, thrower can attempt to catch"
									},
									{
										name: "ring blade",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 4
											}
										],
										conditions: {bleeding: 1},
										weight: 1,
										hands: 1,
										magnetic: true,
										materials: "metal",
										cost: 30,
										description: " "
									},
									{
										name: "rope dart",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										conditions: {bleeding: 1},
										weight: 1,
										hands: 1,
										magnetic: true,
										materials: "metal",
										cost: 20,
										description: "use strength to pull it back"
									},
									{
										name: "scythe",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "dexterity",
												skill: "fencing",
												d6: 4
											}
										],
										conditions: {bleeding: 1},
										weight: 6,
										hands: 2,
										magnetic: true,
										fuel: 3,
										materials: "wood, metal",
										cost: 40,
										description: "attack in an arc (combat square ahead and the two laterally adjacent)"
									},
									{
										name: "shortbow",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "strength",
												skill: "archery"
											}
										],
										weight: 2,
										hands: 2,
										fuel: 2,
										materials: "wood, string",
										cost: 50,
										description: "range: (strength + archery) x 10 ft"
									},
									{
										name: "short staff",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "strength",
												skill: "melee",
												d6: 4
											}
										],
										weight: 4,
										hands: 1,
										fuel: 3,
										materials: "wood",
										cost: 30,
										description: " "
									},
									{
										name: "short sword",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "dexterity",
												skill: "fencing",
												d6: 5
											}
										],
										conditions: {bleeding: 1},
										weight: 2,
										hands: 1,
										magnetic: true,
										materials: "leather, metal",
										cost: 50,
										description: " "
									},
									{
										name: "sickle",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "dexterity",
												skill: "knifing",
												d6: 4
											}
										],
										conditions: {bleeding: 1},
										weight: 2,
										hands: 1,
										magnetic: true,
										materials: "metal",
										cost: 30,
										description: " "
									},
									{
										name: "sling",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "strength",
												skill: "throw"
											}
										],
										weight: 1,
										hands: 1,
										fuel: 1,
										materials: "leather",
										cost: 15,
										description: " "
									},
									{
										name: "spear",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 5
											},
											{
												statistic: "dexterity",
												skill: "fencing",
												d6: 4
											}
										],
										conditions: {bleeding: 1},
										weight: 3,
										hands: 1,
										fuel: 3,
										materials: "wood, metal",
										cost: 30,
										description: " "
									},
									{
										name: "spiked club",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "strength",
												skill: "melee",
												d6: 5
											}
										],
										conditions: {bleeding: 1},
										weight: 5,
										hands: 1,
										fuel: 3,
										materials: "wood",
										cost: 50,
										description: " "
									},
									{
										name: "steel whip",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "strength",
												skill: "melee",
												d6: 4
											}
										],
										conditions: {bleeding: 1},
										magnetic: true,
										weight: 5,
										hands: 1,
										materials: "metal",
										cost: 50,
										description: "attack opponents in all surrounding squares"
									},
									{
										name: "steel boots",
										count: 1,
										type: "armor",
										armorType: "legs",
										d6: 7,
										usage: [
											{
												statistic: "speed",
												skill: "kick",
												d6: 2
											}
										],
										magnetic: true,
										weight: 10,
										hands: 0,
										materials: "leather, metal",
										cost: 60,
										description: "adds to kick damage; 7d6 feet armor"
									},
									{
										name: "stonebow",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "dexterity",
												skill: "missile"
											}
										],
										weight: 3,
										hands: 2,
										fuel: 2,
										materials: "wood, string, metal",
										cost: 70,
										description: "range: 50 ft"
									},
									{
										name: "throwing axe",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 5,
											},
											{
												statistic: "dexterity",
												skill: "fencing",
												d6: 4,
											}
										],
										conditions: {bleeding: 1},
										weight: 1,
										hands: 1,
										magnetic: true,
										materials: "leather, metal",
										cost: 30,
										description: " "
									},
									{
										name: "throwing knife",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											},
											{
												statistic: "dexterity",
												skill: "knifing",
												d6: 3
											}
										],
										conditions: {bleeding: 1},
										weight: 1,
										hands: 1,
										magnetic: true,
										materials: "metal",
										cost: 10,
										description: " "
									},
									{
										name: "throwing star",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										conditions: {bleeding: 1},
										weight: 0.5,
										hands: 1,
										magnetic: true,
										materials: "metal",
										cost: 10,
										description: " "
									},
									{
										name: "tonfa",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "dexterity",
												skill: "martial_arts",
												d6: 3
											},
											{
												statistic: "strength",
												skill: "block",
												d6: 3
											}
										],
										weight: 4,
										hands: 1,
										fuel: 2,
										materials: "wood",
										cost: 30,
										description: "free block action"
									},
									{
										name: "warhammer",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "strength",
												skill: "melee",
												d6: 7
											}
										],
										weight: 6,
										hands: 2,
										magnetic: true,
										materials: "leather, metal",
										cost: 80,
										description: " "
									},
									{
										name: "whip",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "strength",
												skill: "melee",
												d6: 4
											}
										],
										weight: 3,
										hands: 1,
										fuel: 2,
										materials: "leather",
										cost: 30,
										description: " "
									},
									{
										name: "wooden stake",
										count: 1,
										type: "weapon",
										usage: [
											{
												statistic: "dexterity",
												skill: "knifing",
												d6: 3
											}
										],
										conditions: {bleeding: 1},
										weight: 0.5,
										hands: 1,
										fuel: 2,
										materials: "wood",
										cost: 5,
										description: " "
									}
								],
								ammunition: [
									{
										name: "arrow",
										count: 1,
										type: "ammunition",
										weapons: ["bow"],
										weight: 0.1,
										fuel: 1,
										usage: [
											{
												statistic: "strength",
												skill: "archery",
												d6: 3
											},
											{
												statistic: "dexterity",
												skill: "knifing",
												d6: 2
											}
										],
										conditions: {bleeding: 1},
										materials: "wood, stone",
										cost: 2,
										description: "recoverable"
									},
									{
										name: "blunted dart",
										count: 1,
										type: "ammunition",
										weapons: ["blowgun"],
										weight: 0.1,
										usage: [
											{
												statistic: "dexterity",
												skill: "missile",
												d6: 1
											},
										],
										hands: 1,
										materials: "wood",
										cost: 1,
										description: " "
									},
									{
										name: "bolt",
										count: 1,
										type: "ammunition",
										weapons: ["crossbow"],
										weight: 0.1,
										fuel: 1,
										usage: [
											{
												statistic: "dexterity",
												skill: "missile",
												d6: 3
											},
											{
												statistic: "dexterity",
												skill: "knifing",
												d6: 2
											}
										],
										conditions: {bleeding: 1},
										materials: "wood, stone",
										cost: 2,
										description: "recoverable"
									},
									{
										name: "dart",
										count: 1,
										type: "ammunition",
										weapons: ["blowgun"],
										weight: 0.1,
										usage: [
											{
												statistic: "dexterity",
												skill: "missile",
												d6: 2
											},
											{
												statistic: "dexterity",
												skill: "knifing",
												d6: 1
											}
										],
										hands: 1,
										materials: "wood",
										cost: 2,
										description: " "
									},
									{
										name: "disease dart",
										count: 1,
										type: "ammunition",
										weapons: ["blowgun"],
										weight: 0.1,
										usage: [
											{
												statistic: "dexterity",
												skill: "missile",
												d6: 2
											},
											{
												statistic: "dexterity",
												skill: "knifing",
												d6: 1
											}
										],
										conditions: {infection: 2},
										hands: 1,
										materials: "wood",
										cost: 25,
										description: "causes infection"
									},
									{
										name: "exploding magnet bolt",
										count: 1,
										type: "ammunition",
										weapons: ["crossbow"],
										weight: 0.5,
										usage: [
											{
												statistic: "dexterity",
												skill: "missile",
												d6: 3
											}
										],
										conditions: {bleeding: 1},
										magnetic: true,
										conditions: {loud_noise: 1, blinding_light: 1},
										materials: "wood, metal",
										cost: 25,
										description: "causes loud noise and blinding light for 1d6 rounds; explosion causes damage to 5-ft square and surrounding 5-ft squares"
									},
									{
										name: "glass acid orb",
										count: 1,
										type: "ammunition",
										weapons: ["sling", "bomb", "stonebow", "gauss pistol"],
										weight: 0.5,
										d6: 3,
										usage: [
											{
												statistic: "dexterity",
												skill: "missile",
												d6: 3
											},
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										conditions: {bleeding: 1},
										hands: 1,
										materials: "glass",
										cost: 32,
										description: "causes acid"
									},
									{
										name: "glass blood orb",
										count: 1,
										type: "ammunition",
										weapons: ["sling", "bomb", "stonebow", "gauss pistol"],
										weight: 0.5,
										usage: [
											{
												statistic: "dexterity",
												skill: "missile",
												d6: 3
											},
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										conditions: {infection: 2, bleeding: 1},
										hands: 1,
										materials: "glass",
										cost: 20,
										description: "causes infection"
									},
									{
										name: "glass firewater orb",
										count: 1,
										type: "ammunition",
										weapons: ["sling", "bomb", "stonebow", "gauss pistol"],
										weight: 0.5,
										usage: [
											{
												statistic: "dexterity",
												skill: "missile",
												d6: 3
											},
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										conditions: {bleeding: 1},
										fuel: 1,
										hands: 1,
										materials: "glass",
										cost: 20,
										description: " "
									},
									{
										name: "glass flashbang orb",
										count: 1,
										type: "ammunition",
										weapons: ["sling", "bomb", "stonebow", "gauss pistol"],
										weight: 0.5,
										usage: [
											{
												statistic: "dexterity",
												skill: "missile",
												d6: 3
											},
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										conditions: {loud_noise: 1, blinding_light: 1, bleeding: 1},
										hands: 1,
										materials: "glass",
										cost: 28,
										description: "causes loud noise and blinding light for 1d6 rounds; explosion causes damage to 5-ft square and surrounding 5-ft squares"
									},
									{
										name: "glass orb",
										count: 1,
										type: "ammunition",
										weapons: ["sling", "bomb", "stonebow", "gauss pistol"],
										weight: 0.1,
										usage: [
											{
												statistic: "dexterity",
												skill: "missile",
												d6: 3
											},
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										conditions: {bleeding: 1},
										hands: 1,
										materials: "glass",
										cost: 4,
										description: "shatters on impact"
									},
									{
										name: "glass poison orb",
										count: 1,
										type: "ammunition",
										weapons: ["sling", "bomb", "stonebow", "gauss pistol"],
										weight: 0.5,
										usage: [
											{
												statistic: "dexterity",
												skill: "missile",
												d6: 3
											},
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										conditions: {poison: 2, bleeding: 1},
										hands: 1,
										materials: "glass",
										cost: 28,
										description: "causes poison"
									},
									{
										name: "glass sleep orb",
										count: 1,
										type: "ammunition",
										weapons: ["sling", "bomb", "stonebow", "gauss pistol"],
										weight: 0.5,
										usage: [
											{
												statistic: "dexterity",
												skill: "missile",
												d6: 3
											},
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										conditions: {sleep: 1, bleeding: 1},
										hands: 1,
										materials: "glass",
										cost: 28,
										description: "causes sleep"
									},
									{
										name: "glass smoke orb",
										count: 1,
										type: "ammunition",
										weapons: ["sling", "bomb", "stonebow", "gauss pistol"],
										weight: 0.5,
										usage: [
											{
												statistic: "dexterity",
												skill: "missile",
												d6: 3
											},
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										conditions: {smoke: 2, bleeding: 1},
										hands: 1,
										materials: "glass",
										cost: 20,
										description: "causes smoke in 5-ft square and surrounding 5-ft squares for 2d6 rounds"
									},
									{
										name: "glass superglow orb",
										count: 1,
										type: "ammunition",
										weapons: ["sling", "bomb", "stonebow", "gauss pistol"],
										weight: 0.5,
										usage: [
											{
												statistic: "dexterity",
												skill: "missile",
												d6: 3
											},
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										conditions: {blinding_light: 1, bleeding: 1},
										hands: 1,
										materials: "glass",
										cost: 28,
										description: "causes blinding light for 1d6 rounds"
									},
									{
										name: "paralysis dart",
										count: 1,
										type: "ammunition",
										weapons: ["blowgun"],
										weight: 0.1,
										usage: [
											{
												statistic: "dexterity",
												skill: "missile",
												d6: 2
											},
											{
												statistic: "dexterity",
												skill: "knifing",
												d6: 1
											}
										],
										conditions: {paralysis_arms: 1, paralysis_legs: 1},
										hands: 1,
										materials: "wood",
										cost: 30,
										description: "causes localized for 1d6 rounds"
									},
									{
										name: "poison dart",
										count: 1,
										type: "ammunition",
										weapons: ["blowgun"],
										weight: 0.1,
										usage: [
											{
												statistic: "dexterity",
												skill: "missile",
												d6: 2
											},
											{
												statistic: "dexterity",
												skill: "knifing",
												d6: 1
											}
										],
										conditions: {poison: 2},
										hands: 1,
										materials: "wood",
										cost: 25,
										description: "causes poison"
									},
									{
										name: "rock orb",
										count: 1,
										type: "ammunition",
										weapons: ["sling", "bomb", "stonebow", "gauss pistol"],
										weight: 0.5,
										usage: [
											{
												statistic: "dexterity",
												skill: "missile",
												d6: 3
											},
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										hands: 1,
										materials: "stone",
										cost: 1,
										description: " "
									},
									{
										name: "sleep dart",
										count: 1,
										type: "ammunition",
										weapons: ["blowgun"],
										weight: 0.1,
										usage: [
											{
												statistic: "dexterity",
												skill: "missile",
												d6: 2
											},
											{
												statistic: "dexterity",
												skill: "knifing",
												d6: 1
											}
										],
										conditions: {sleep: 1},
										hands: 1,
										materials: "wood",
										cost: 25,
										description: "causes sleep"
									},
									{
										name: "wood orb",
										count: 1,
										type: "ammunition",
										weapons: ["sling", "bomb", "stonebow", "gauss pistol"],
										weight: 0.5,
										usage: [
											{
												statistic: "dexterity",
												skill: "missile",
												d6: 3
											},
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										fuel: 1,
										hands: 1,
										materials: "wood",
										cost: 2,
										description: " "
									}
								],
								armor: [
									{
										name: "camouflage clothes",
										count: 1,
										type: "armor",
										armorType: "body",
										d6: 1,
										weight: 3,
										fuel: 2,
										materials: "cloth",
										cost: 25,
										description: "-10 to opponent sight checks"
									},
									{
										name: "camouflage gloves",
										count: 1,
										type: "armor",
										armorType: "hands",
										d6: 1,
										weight: 1,
										fuel: 2,
										materials: "cloth",
										cost: 10,
										description: "-10 to opponent sight checks"
									},
									{
										name: "camouflage hat",
										count: 1,
										type: "armor",
										armorType: "head",
										d6: 1,
										weight: 2,
										fuel: 2,
										materials: "cloth",
										cost: 10,
										description: "-10 to opponent sight checks"
									},
									{
										name: "camouflage shoes",
										count: 1,
										type: "armor",
										armorType: "legs",
										d6: 1,
										weight: 2,
										fuel: 2,
										materials: "cloth",
										cost: 15,
										description: "-10 to opponent sight checks"
									},
									{
										name: "chainmail armor",
										count: 1,
										type: "armor",
										armorType: "body",
										d6: 5,
										weight: 25,
										magnetic: true,
										materials: "metal",
										cost: 70,
										description: "conducts electricity"
									},
									{
										name: "chainmail boots",
										count: 1,
										type: "armor",
										armorType: "legs",
										d6: 5,
										weight: 6,
										magnetic: true,
										materials: "metal",
										cost: 40,
										description: "conducts electricity"
									},
									{
										name: "chainmail gloves",
										count: 1,
										type: "armor",
										armorType: "hands",
										d6: 5,
										weight: 4,
										magnetic: true,
										materials: "metal",
										cost: 20,
										description: "conducts electricity"
									},
									{
										name: "chainmail helmet",
										count: 1,
										type: "armor",
										armorType: "head",
										d6: 5,
										weight: 5,
										magnetic: true,
										materials: "metal",
										cost: 20,
										description: "conducts electricity"
									},
									{
										name: "clothes",
										count: 1,
										type: "armor",
										armorType: "body",
										d6: 1,
										weight: 1,
										fuel: 2,
										materials: "cloth",
										cost: 10,
										description: " "
									},
									{
										name: "fine clothes",
										count: 1,
										type: "armor",
										armorType: "body",
										d6: 1,
										weight: 4,
										fuel: 3,
										materials: "cloth",
										cost: 35,
										description: " "
									},
									{
										name: "fine gloves",
										count: 1,
										type: "armor",
										armorType: "hands",
										d6: 1,
										weight: 1,
										fuel: 3,
										materials: "cloth",
										cost: 10,
										description: " "
									},
									{
										name: "fine hat",
										count: 1,
										type: "armor",
										armorType: "head",
										d6: 1,
										weight: 2,
										fuel: 3,
										materials: "cloth",
										cost: 15,
										description: " "
									},
									{
										name: "fine shoes",
										count: 1,
										type: "armor",
										armorType: "legs",
										d6: 1,
										weight: 3,
										fuel: 3,
										materials: "cloth",
										cost: 20,
										description: " "
									},
									{
										name: "gloves",
										count: 1,
										type: "armor",
										armorType: "hands",
										d6: 1,
										weight: 1,
										fuel: 2,
										materials: "cloth",
										cost: 5,
										description: " "
									},
									{
										name: "hat",
										count: 1,
										type: "armor",
										armorType: "head",
										d6: 1,
										weight: 1,
										fuel: 2,
										materials: "cloth",
										cost: 5,
										description: " "
									},
									{
										name: "leather armor",
										count: 1,
										type: "armor",
										armorType: "body",
										d6: 3,
										weight: 10,
										fuel: 2,
										conditions: {extreme_cold: 0},
										materials: "leather",
										cost: 25,
										description: "prevents extreme cold"
									},
									{
										name: "leather boots",
										count: 1,
										type: "armor",
										armorType: "legs",
										d6: 3,
										weight: 3,
										fuel: 2,
										conditions: {extreme_cold: 0},
										materials: "leather",
										cost: 15,
										description: "prevents extreme cold"
									},
									{
										name: "leather gloves",
										count: 1,
										type: "armor",
										armorType: "hands",
										d6: 3,
										weight: 1,
										fuel: 2,
										conditions: {extreme_cold: 0},
										materials: "leather",
										cost: 10,
										description: "prevents extreme cold"
									},
									{
										name: "leather cap",
										count: 1,
										type: "armor",
										armorType: "head",
										d6: 3,
										weight: 1,
										fuel: 2,
										conditions: {extreme_cold: 0},
										materials: "leather",
										cost: 10,
										description: "prevents extreme cold"
									},
									{
										name: "padded / fur clothes",
										count: 1,
										type: "armor",
										armorType: "body",
										d6: 2,
										weight: 4,
										fuel: 3,
										conditions: {extreme_cold: 0},
										materials: "cloth, fur",
										cost: 18,
										description: "prevents extreme cold"
									},
									{
										name: "padded / fur gloves",
										count: 1,
										type: "armor",
										armorType: "hands",
										d6: 2,
										weight: 2,
										fuel: 3,
										conditions: {extreme_cold: 0},
										materials: "cloth, fur",
										cost: 8,
										description: "prevents extreme cold"
									},
									{
										name: "padded / fur hat",
										count: 1,
										type: "armor",
										armorType: "head",
										d6: 2,
										weight: 2,
										fuel: 3,
										conditions: {extreme_cold: 0},
										materials: "cloth, fur",
										cost: 7,
										description: "prevents extreme cold"
									},
									{
										name: "padded / fur shoes",
										count: 1,
										type: "armor",
										armorType: "legs",
										d6: 2,
										weight: 2,
										fuel: 3,
										conditions: {extreme_cold: 0},
										materials: "cloth, fur",
										cost: 12,
										description: "prevents extreme cold"
									},
									{
										name: "platemail armor",
										count: 1,
										type: "armor",
										armorType: "body",
										d6: 6,
										weight: 40,
										magnetic: true,
										materials: "metal",
										cost: 110,
										description: "conducts electricity"
									},
									{
										name: "platemail boots",
										count: 1,
										type: "armor",
										armorType: "legs",
										d6: 6,
										weight: 10,
										magnetic: true,
										materials: "metal",
										cost: 60,
										description: "conducts electricity"
									},
									{
										name: "platemail gloves",
										count: 1,
										type: "armor",
										armorType: "hands",
										d6: 6,
										weight: 8,
										magnetic: true,
										materials: "metal",
										cost: 40,
										description: "conducts electricity"
									},
									{
										name: "platemail helmet",
										count: 1,
										type: "armor",
										armorType: "head",
										d6: 6,
										weight: 7,
										magnetic: true,
										materials: "metal",
										cost: 40,
										description: "conducts electricity"
									},
									{
										name: "scalemail armor",
										count: 1,
										type: "armor",
										armorType: "body",
										d6: 5,
										weight: 30,
										conditions: {extreme_cold: 0},
										materials: "scale",
										cost: 90,
										description: "prevents extreme cold"
									},
									{
										name: "scalemail boots",
										count: 1,
										type: "armor",
										armorType: "legs",
										d6: 5,
										weight: 8,
										conditions: {extreme_cold: 0},
										materials: "scale",
										cost: 50,
										description: "prevents extreme cold"
									},
									{
										name: "scalemail gloves",
										count: 1,
										type: "armor",
										armorType: "hands",
										d6: 5,
										weight: 6,
										conditions: {extreme_cold: 0},
										materials: "scale",
										cost: 30,
										description: "prevents extreme cold"
									},
									{
										name: "scalemail helmet",
										count: 1,
										type: "armor",
										armorType: "head",
										d6: 5,
										weight: 6,
										conditions: {extreme_cold: 0},
										materials: "scale",
										cost: 30,
										description: "prevents extreme cold"
									},
									{
										name: "shoes",
										count: 1,
										type: "armor",
										armorType: "legs",
										d6: 1,
										weight: 2,
										fuel: 2,
										materials: "cloth",
										cost: 10,
										description: " "
									},
									{
										name: "stonemail armor",
										count: 1,
										type: "armor",
										armorType: "body",
										d6: 7,
										weight: 50,
										materials: "stone",
										cost: 130,
										description: " "
									},
									{
										name: "stonemail boots",
										count: 1,
										type: "armor",
										armorType: "legs",
										d6: 7,
										weight: 14,
										materials: "stone",
										cost: 70,
										description: " "
									},
									{
										name: "stonemail gloves",
										count: 1,
										type: "armor",
										armorType: "hands",
										d6: 7,
										weight: 8,
										materials: "stone",
										cost: 50,
										description: " "
									},
									{
										name: "stonemail helmet",
										count: 1,
										type: "armor",
										armorType: "head",
										d6: 7,
										weight: 8,
										materials: "stone",
										cost: 50,
										description: " "
									},
									{
										name: "wooden armor",
										count: 1,
										type: "armor",
										armorType: "body",
										d6: 4,
										weight: 25,
										fuel: 4,
										materials: "wood",
										cost: 45,
										description: " "
									},
									{
										name: "wooden boots",
										count: 1,
										type: "armor",
										armorType: "legs",
										d6: 4,
										weight: 6,
										fuel: 4,
										materials: "wood",
										cost: 25,
										description: " "
									},
									{
										name: "wooden gloves",
										count: 1,
										type: "armor",
										armorType: "hands",
										d6: 4,
										weight: 4,
										fuel: 4,
										materials: "wood",
										cost: 15,
										description: " "
									},
									{
										name: "wooden helmet",
										count: 1,
										type: "armor",
										armorType: "head",
										d6: 4,
										weight: 5,
										fuel: 4,
										materials: "wood",
										cost: 15,
										description: " "
									}
								],
								shield: [
									{
										name: "bone / scale shield",
										count: 1,
										type: "shield",
										d6: 5,
										weight: 15,
										hands: 1,
										usage: [
											{
												statistic: "strength",
												skill: "block",
												d6: 5
											},
											{
												statistic: "strength",
												skill: "melee",
												d6: 3
											}
										],
										materials: "scale, bone",
										cost: 75,
										description: " "
									},
									{
										name: "metal shield",
										count: 1,
										type: "shield",
										d6: 6,
										weight: 20,
										hands: 1,
										magnetic: true,
										usage: [
											{
												statistic: "strength",
												skill: "block",
												d6: 6
											},
											{
												statistic: "strength",
												skill: "melee",
												d6: 3
											}
										],
										materials: "metal",
										cost: 100,
										description: "conducts electricity"
									},
									{
										name: "plywood shield",
										count: 1,
										type: "shield",
										d6: 3,
										weight: 5,
										fuel: 2,
										hands: 1,
										usage: [
											{
												statistic: "strength",
												skill: "block",
												d6: 3
											},
											{
												statistic: "strength",
												skill: "melee",
												d6: 2
											}
										],
										materials: "wood",
										cost: 25,
										description: " "
									},
									{
										name: "stone shield",
										count: 1,
										type: "shield",
										d6: 7,
										weight: 30,
										hands: 1,
										usage: [
											{
												statistic: "strength",
												skill: "block",
												d6: 7
											},
											{
												statistic: "strength",
												skill: "melee",
												d6: 4
											}
										],
										materials: "stone",
										cost: 150,
										description: " "
									},
									{
										name: "wooden shield",
										count: 1,
										type: "shield",
										d6: 4,
										weight: 10,
										fuel: 3,
										hands: 1,
										usage: [
											{
												statistic: "strength",
												skill: "block",
												d6: 4
											},
											{
												statistic: "strength",
												skill: "melee",
												d6: 3
											}
										],
										materials: "wood",
										cost: 50,
										description: " "
									}
								],
								potion: [
									{
										name: "elixir of alertness",
										count: 1,
										type: "potion",
										weight: 0.5,
										recipe: {w: 10, r: 2, g: 6, b: 4},
										conditions: {sleep: 0, alertness: 1},
										cost: 24,
										description: "ends sleep; causes alertness for 1d6 hours"
									},
									{
										name: "elixir of antitoxicity",
										count: 1,
										type: "potion",
										weight: 0.5,
										recipe: {w: 10, r: 0, g: 6, b: 6},
										conditions: {poison: 0, paralysis_arms: 0, paralysis_legs: 0},
										cost: 24,
										description: "eliminates poison and paralysis"
									},
									{
										name: "elixir of breathholding",
										count: 1,
										type: "potion",
										weight: 0.5,
										recipe: {w: 10, r: 2, g: 5, b: 7},
										conditions: {asphyxiation: 0},
										cost: 28,
										description: "+10 hold breath for 1d6 hours"
									},
									{
										name: "elixir of concentration",
										count: 1,
										type: "potion",
										weight: 0.5,
										recipe: {w: 10, r: 2, g: 4, b: 6},
										conditions: {sleep: 0, concentration: 1},
										cost: 24,
										description: "ends sleep; causes concentration for 1d6 hours"
									},
									{
										name: "elixir of confusion",
										count: 1,
										type: "potion",
										weight: 0.5,
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										recipe: {w: 10, r: 5, g: 5, b: 2},
										conditions: {confusion: 1},
										cost: 24,
										description: "causes confusion for 1d6 hours"
									},
									{
										name: "elixir of determination",
										count: 1,
										type: "potion",
										weight: 0.5,
										recipe: {w: 10, r: 2, g: 6, b: 6},
										conditions: {determination: 1},
										cost: 28,
										description: "causes determination for 1d6 hours"
									},
									{
										name: "elixir of exhaustion",
										count: 1,
										type: "potion",
										weight: 0.5,
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										recipe: {w: 10, r: 4, g: 6, b: 2},
										conditions: {exhaustion: 1},
										cost: 24,
										description: "causes exhaustion for 1d6 hours"
									},
									{
										name: "elixir of fear",
										count: 1,
										type: "potion",
										weight: 0.5,
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										recipe: {w: 10, r: 5, g: 1, b: 4},
										conditions: {fear: 1},
										cost: 24,
										description: "causes fear for 1d6 hours"
									},
									{
										name: "elixir of honesty",
										count: 1,
										type: "potion",
										weight: 0.5,
										recipe: {w: 10, r: 5, g: 5, b: 4},
										cost: 28,
										description: "the drinker is unable to lie or bluff for 1d6 hours"
									},
									{
										name: "elixir of inebriation",
										count: 1,
										type: "potion",
										weight: 0.5,
										conditions: {inebriation: 1},
										cost: 2,
										description: "causes inebriation for 1d6 hours"
									},
									{
										name: "elixir of immunity",
										count: 1,
										type: "potion",
										weight: 0.5,
										recipe: {w: 10, r: 0, g: 2, b: 2},
										conditions: {bleeding: 0, immunity_boost: 4},
										cost: 8,
										description: "causes immunity boost for 4d6 hours"
									},
									{
										name: "elixir of lust",
										count: 1,
										type: "potion",
										weight: 0.5,
										recipe: {w: 10, r: 4, g: 6, b: 4},
										cost: 28,
										description: "the drinker becomes lustful for 1d6 hours"
									},
									{
										name: "elixir of night vision",
										count: 1,
										type: "potion",
										weight: 0.5,
										d6: 2,
										recipe: {w: 10, r: 1, g: 6, b: 7},
										usage: [
											{
												statistic: "perception",
												skill: "night_vision",
												modifier: 10
											}
										],
										cost: 28,
										description: "+10 night vision for 2d6 hours"
									},
									{
										name: "elixir of pain",
										count: 1,
										type: "potion",
										weight: 0.5,
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										recipe: {w: 10, r: 4, g: 5, b: 1},
										conditions: {minor_pain_body: 1, minor_pain_head: 1},
										cost: 20,
										description: "causes head pain and body pain for 1d6 rounds"
									},
									{
										name: "elixir of pain relief",
										count: 1,
										type: "potion",
										weight: 0.5,
										recipe: {w: 10, r: 0, g: 1, b: 0},
										conditions: {pain_relief: 1},
										cost: 2,
										description: "causes pain relief for 1d6 hours"
									},
									{
										name: "elixir of paralysis",
										count: 1,
										type: "potion",
										weight: 0.5,
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										recipe: {w: 10, r: 6, g: 4, b: 4},
										conditions: {paralysis_arms: 1, paralysis_legs: 1},
										cost: 28,
										description: "causes localized paralysis for 1d6 hours"
									},
									{
										name: "elixir of perceptiveness",
										count: 1,
										type: "potion",
										weight: 0.5,
										recipe: {w: 10, r: 1, g: 5, b: 6},
										conditions: {sleep: 0, perceptiveness: 1},
										cost: 24,
										description: "causes perceptiveness for 1d6 hours"
									},
									{
										name: "elixir of rage",
										count: 1,
										type: "potion",
										weight: 0.5,
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										recipe: {w: 10, r: 1, g: 5, b: 6},
										conditions: {rage: 1},
										cost: 24,
										description: "causes rage for 1d6 hours"
									},
									{
										name: "elixir of resistance",
										count: 1,
										type: "armor",
										d6: 1,
										weight: 0.5,
										recipe: {w: 10, r: 0, g: 4, b: 4},
										conditions: {bleeding: 0, resistance: 4},
										cost: 16,
										description: "causes resistance for 4d6 hours"
									},
									{
										name: "elixir of severe pain",
										count: 1,
										type: "potion",
										weight: 0.5,
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										recipe: {w: 10, r: 7, g: 5, b: 2},
										conditions: {severe_pain: 2},
										cost: 28,
										description: "causes severe pain for 2d6 rounds"
									},
									{
										name: "elixir of silence",
										count: 1,
										type: "potion",
										d6: 1,
										weight: 0.5,
										recipe: {w: 10, r: 5, g: 1, b: 6},
										cost: 24,
										description: "the drinker has no voice for 1d6 hours"
									},
									{
										name: "elixir of sleep",
										count: 1,
										type: "potion",
										weight: 0.5,
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										recipe: {w: 10, r: 6, g: 5, b: 1},
										conditions: {sleep: 1},
										cost: 24,
										description: "causes sleep for 1d6 hours"
									},
									{
										name: "elixir of strong pain relief",
										count: 1,
										type: "potion",
										weight: 0.5,
										recipe: {w: 10, r: 0, g: 2, b: 0},
										conditions: {pain_relief: 2},
										cost: 4,
										description: "causes pain relief for 2d6 hours"
									},
									{
										name: "potion of acid",
										count: 1,
										type: "potion",
										weight: 0.5,
										d6: 3,
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										recipe: {w: 10, r: 6, g: 2, b: 6},
										cost: 28,
										description: "causes 3d6 acid damage"
									},
									{
										name: "potion of electricity",
										count: 1,
										type: "potion",
										weight: 0.5,
										d6: 2,
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										recipe: {w: 10, r: 7, g: 1, b: 6},
										conditions: {paralysis_arms: 1, paralysis_legs: 1},
										cost: 28,
										description: "causes electricity"
									},
									{
										name: "potion of extreme cold",
										count: 1,
										type: "potion",
										weight: 0.5,
										d6: 1,
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										recipe: {w: 10, r: 2, g: 2, b: 0},
										conditions: {extreme_cold: 1, extreme_heat: 0},
										cost: 8,
										description: "causes extreme cold for 1d6 rounds, then cold for 1d6 hours"
									},
									{
										name: "potion of extreme heat",
										count: 1,
										type: "potion",
										weight: 0.5,
										d6: 1,
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										recipe: {w: 10, r: 2, g: 0, b: 2},
										conditions: {extreme_heat: 1, extreme_cold: 0},
										cost: 8,
										description: "causes extreme heat for 1d6 rounds, then heat for 1d6 hours"
									},
									{
										name: "potion of fire",
										count: 1,
										type: "potion",
										weight: 0.5,
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										recipe: {w: 10, r: 4, g: 0, b: 4},
										fuel: 1,
										conditions: {extreme_heat: 1, extreme_cold: 0},
										cost: 16,
										description: "ignites and fuels fire 1d6 rounds"
									},
									{
										name: "potion of freezing",
										count: 1,
										type: "potion",
										weight: 0.5,
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										recipe: {w: 10, r: 4, g: 4, b: 0},
										conditions: {extreme_cold: 1, extreme_heat: 0, paralysis_arms: 1, paralysis_legs: 1},
										cost: 16,
										description: "causes extreme cold for 1d6 rounds, then cold for 1d6 hours; causes localized paralysis for 1d6 rounds"
									},
									{
										name: "potion of flashbang",
										count: 1,
										type: "potion",
										weight: 0.5,
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										recipe: {w: 10, r: 6, g: 0, b: 6},
										d6: 3,
										conditions: {loud_noise: 1, blinding_light: 1},
										cost: 24,
										description: "causes loud noise and blinding light for 1d6 rounds; explosion causes 3d6 damage to 5-ft square and surrounding 5-ft squares"
									},
									{
										name: "potion of frostbang",
										count: 1,
										type: "potion",
										weight: 0.5,
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										recipe: {w: 10, r: 6, g: 6, b: 0},
										conditions: {loud_noise: 1, blinding_light: 1, extreme_cold: 1, extreme_heat: 0, paralysis_arms: 1, paralysis_legs: 1},
										cost: 24,
										description: "causes loud noise and blinding light for 1d6 rounds; explosion causes extreme cold and full-body paralysis to 5-ft square and surrounding 5-ft squares for 1d6 rounds, then cold for 1d6 hours"
									},
									{
										name: "potion of healing",
										count: 1,
										type: "healing",
										weight: 0.5,
										recipe: {w: 10, r: 0, g: 4, b: 0},
										conditions: {bleeding: 0},
										d6: 1,
										cost: 8,
										description: "removes 1d6 damage"
									},
									{
										name: "potion of infection",
										count: 1,
										type: "potion",
										weight: 0.5,
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										conditions: {infection: 2},
										cost: 24,
										description: "causes infection"
									},
									{
										name: "potion of poison",
										count: 1,
										type: "potion",
										weight: 0.5,
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										recipe: {w: 10, r: 6, g: 2, b: 4},
										conditions: {poison: 2},
										cost: 24,
										description: "causes poison"
									},
									{
										name: "potion of strong healing",
										count: 1,
										type: "healing",
										weight: 0.5,
										recipe: {w: 10, r: 0, g: 7, b: 0},
										conditions: {bleeding: 0},
										d6: 2,
										cost: 14,
										description: "removes 2d6 damage"
									},
									{
										name: "concoction of blinding light",
										count: 1,
										type: "potion",
										weight: 0.5,
										d6: 2,
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										recipe: {w: 10, r: 4, g: 4, b: 4},
										conditions: {blinding_light: 1, darkness: 0},
										cost: 24,
										description: "creates blinding light for 1d6 rounds, then light for 2d6 hours"
									},
									{
										name: "concoction of energy",
										count: 1,
										type: "potion",
										weight: 0.5,
										d6: 3,
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										recipe: {w: 10, r: 5, g: 2, b: 7},
										cost: 28,
										description: "causes 3d6 acid damage; conducts electricity; stores energy to power ancient technology"
									},
									{
										name: "concoction of expanding foam",
										count: 1,
										type: "potion",
										weight: 0.5,
										d6: 1,
										recipe: {w: 10, r: 2, g: 2, b: 4},
										cost: 16,
										description: "fizzles and foams and expands for 1d6 rounds"
									},
									{
										name: "concoction of fizzling foam",
										count: 1,
										type: "potion",
										weight: 0.5,
										d6: 1,
										recipe: {w: 10, r: 1, g: 1, b: 2},
										cost: 8,
										description: "fizzles and foams for 1d6 rounds"
									},
									{
										name: "concoction of light",
										count: 1,
										type: "potion",
										weight: 0.5,
										d6: 1,
										recipe: {w: 10, r: 2, g: 2, b: 2},
										conditions: {darkness: 0},
										cost: 12,
										description: "creates light for 1d6 hours"
									},
									{
										name: "concoction of insect repellent",
										count: 1,
										type: "potion",
										weight: 0.5,
										d6: 2,
										recipe: {w: 10, r: 2, g: 1, b: 1},
										cost: 8,
										description: "light fog that repels bugs for 2d6 hours"
									},
									{
										name: "concoction of instant concrete",
										count: 1,
										type: "armor",
										d6: 1,
										weight: 0.5,
										recipe: {w: 10, r: 4, g: 2, b: 6},
										cost: 24,
										description: "instantly hardens into a hard plaster that provides 1d6 armor"
									},
									{
										name: "concoction of invisible ink",
										count: 1,
										type: "potion",
										weight: 0.5,
										recipe: {w: 10, r: 4, g: 4, b: 2},
										cost: 20,
										description: "use penmanship or drawing; writing only appears when heated"
									},
									{
										name: "concoction of odor",
										count: 1,
										type: "potion",
										weight: 0.5,
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										recipe: {w: 10, r: 2, g: 4, b: 2},
										conditions: {noxious_odor: 2},
										cost: 16,
										description: "causes noxious odor 2d6 rounds"
									},
									{
										name: "concoction of perfume",
										count: 1,
										type: "potion",
										weight: 0.5,
										d6: 1,
										recipe: {w: 10, r: 1, g: 2, b: 1},
										conditions: {noxious_odor: 0},
										cost: 8,
										description: "removes noxious odor; creates a pleasant scent for 1d6 hours"
									},
									{
										name: "concoction of reflectivity",
										count: 1,
										type: "potion",
										weight: 0.5,
										usage: [
											{
												statistic: "logic",
												skill: "intimidate",
												modifier: 5
											}
										],
										recipe: {w: 10, r: 1, g: 5, b: 4},
										cost: 20,
										description: "reflects different colors, depending on time heated; worn as war paint for +5 intimidate"
									},
									{
										name: "concoction of slipperiness",
										count: 1,
										type: "potion",
										weight: 0.5,
										recipe: {w: 10, r: 6, g: 4, b: 2},
										cost: 24,
										description: "items require a dexterity check to hold"
									},
									{
										name: "concoction of smoke",
										count: 1,
										type: "potion",
										weight: 0.5,
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										recipe: {w: 10, r: 4, g: 2, b: 2},
										conditions: {smoke: 2},
										cost: 16,
										description: "causes smoke in 5-ft square and surrounding 5-ft squares for 2d6 rounds"
									},
									{
										name: "concoction of stickiness",
										count: 1,
										type: "potion",
										weight: 0.5,
										recipe: {w: 10, r: 4, g: 2, b: 4},
										cost: 20,
										description: "items stick together and require a strength check to separate"
									}
								],
								food: [
									{
										name: "apple",
										count: 1,
										type: "food",
										weight: 0.25,
										costPerPound: 2,
										cost: 0.5,
										description: " "
									},
									{
										name: "banana",
										count: 1,
										type: "food",
										weight: 0.25,
										costPerPound: 1,
										description: " "
									},
									{
										name: "beans",
										count: 1,
										type: "food",
										weight: 0.01,
										costPerPound: 2,
										description: " "
									},
									{
										name: "beef",
										count: 1,
										type: "food",
										weight: 400,
										costPerPound: 4,
										cost: 1600,
										description: "use cooking to prevent infection"
									},
									{
										name: "beet",
										count: 1,
										type: "food",
										weight: 2,
										costPerPound: 1,
										cost: 2,
										description: " "
									},
									{
										name: "berries",
										count: 1,
										type: "food",
										weight: 0.02,
										costPerPound: 3,
										description: " "
									},
									{
										name: "bread",
										count: 1,
										type: "food",
										weight: 1,
										costPerPound: 2,
										cost: 2,
										description: " "
									},
									{
										name: "butter",
										count: 1,
										type: "food",
										weight: 0.25,
										costPerPound: 4,
										cost: 1,
										description: " "
									},
									{
										name: "cabbage",
										count: 1,
										type: "food",
										weight: 2,
										costPerPound: 1,
										cost: 2,
										description: " "
									},
									{
										name: "carrot",
										count: 1,
										type: "food",
										weight: 0.25,
										costPerPound: 2,
										cost: 0.5,
										description: " "
									},
									{
										name: "cheese",
										count: 1,
										type: "food",
										weight: 0.5,
										costPerPound: 4,
										cost: 2,
										description: " "
									},
									{
										name: "chicken",
										count: 1,
										type: "food",
										weight: 7,
										costPerPound: 2,
										cost: 14,
										description: "use cooking to prevent infection"
									},
									{
										name: "chocolate",
										count: 1,
										type: "food",
										weight: 0.1,
										costPerPound: 10,
										cost: 1,
										description: " "
									},
									{
										name: "citrus fruit",
										count: 1,
										type: "food",
										weight: 0.25,
										costPerPound: 2,
										cost: 0.5,
										description: " "
									},
									{
										name: "corn",
										count: 1,
										type: "food",
										weight: 0.25,
										costPerPound: 2,
										cost: 0.5,
										description: " "
									},
									{
										name: "crab",
										count: 1,
										type: "food",
										weight: 0.25,
										costPerPound: 8,
										cost: 2,
										description: "use cooking to prevent infection"
									},
									{
										name: "egg (dozen)",
										count: 1,
										type: "food",
										weight: 1.5,
										costPerPound: 2,
										cost: 3,
										description: "use cooking to prevent infection"
									},
									{
										name: "fig",
										count: 1,
										type: "food",
										weight: 0.1,
										costPerPound: 10,
										cost: 1,
										description: " "
									},
									{
										name: "fish (river)",
										count: 1,
										type: "food",
										weight: 25,
										costPerPound: 5,
										cost: 125,
										description: "use cooking to prevent infection"
									},
									{
										name: "fish (ocean)",
										count: 1,
										type: "food",
										weight: 50,
										costPerPound: 10,
										cost: 500,
										description: "use cooking to prevent infection"
									},
									{
										name: "flour",
										count: 1,
										type: "food",
										weight: 0.001,
										costPerPound: 1,
										description: " "
									},
									{
										name: "goat",
										count: 1,
										type: "food",
										weight: 50,
										costPerPound: 5,
										cost: 250,
										description: "use cooking to prevent infection"
									},
									{
										name: "grapes",
										count: 1,
										type: "food",
										weight: 0.01,
										costPerPound: 3,
										description: " "
									},
									{
										name: "herbs",
										count: 1,
										type: "food",
										weight: 0.1,
										costPerPound: 10,
										cost: 1,
										description: " "
									},
									{
										name: "honey",
										count: 1,
										type: "food",
										weight: 0.5,
										costPerPound: 8,
										cost: 4,
										description: " "
									},
									{
										name: "lamb",
										count: 1,
										type: "food",
										weight: 35,
										costPerPound: 10,
										cost: 350,
										description: "use cooking to prevent infection"
									},
									{
										name: "lettuce",
										count: 1,
										type: "food",
										weight: 1,
										costPerPound: 2,
										cost: 2,
										description: " "
									},
									{
										name: "lobster",
										count: 1,
										type: "food",
										weight: 1,
										costPerPound: 12,
										cost: 12,
										description: "use cooking to prevent infection"
									},
									{
										name: "melon",
										count: 1,
										type: "food",
										weight: 3,
										costPerPound: 1,
										cost: 3,
										description: " "
									},
									{
										name: "mushroom",
										count: 1,
										type: "food",
										weight: 0.25,
										costPerPound: 2,
										cost: 0.5,
										description: " "
									},
									{
										name: "nuts",
										count: 1,
										type: "food",
										weight: 0.01,
										costPerPound: 10,
										description: " "
									},
									{
										name: "olives",
										count: 1,
										type: "food",
										weight: 0.01,
										costPerPound: 20,
										description: " "
									},
									{
										name: "onion",
										count: 1,
										type: "food",
										weight: 0.25,
										costPerPound: 2,
										cost: 0.5,
										description: " "
									},
									{
										name: "oyster",
										count: 1,
										type: "food",
										weight: 0.1,
										costPerPound: 20,
										cost: 2,
										description: "use cooking to prevent infection"
									},
									{
										name: "pepper",
										count: 1,
										type: "food",
										weight: 0.25,
										costPerPound: 2,
										cost: 0.5,
										description: " "
									},
									{
										name: "pork",
										count: 1,
										type: "food",
										weight: 200,
										costPerPound: 4,
										cost: 800,
										description: "use cooking to prevent infection"
									},
									{
										name: "potato",
										count: 1,
										type: "food",
										weight: 0.5,
										costPerPound: 1,
										cost: 0.5,
										description: " "
									},
									{
										name: "pumpkin",
										count: 1,
										type: "food",
										weight: 10,
										costPerPound: 1,
										cost: 10,
										description: " "
									},
									{
										name: "rabbit",
										count: 1,
										type: "food",
										weight: 3,
										costPerPound: 5,
										cost: 15,
										description: "use cooking to prevent infection"
									},
									{
										name: "radish",
										count: 1,
										type: "food",
										weight: 0.05,
										costPerPound: 2,
										description: " "
									},
									{
										name: "rice",
										count: 1,
										type: "food",
										weight: 0.001,
										costPerPound: 2,
										description: " "
									},
									{
										name: "seeds",
										count: 1,
										type: "food",
										weight: 0.01,
										costPerPound: 1,
										description: " "
									},
									{
										name: "soup (meat)",
										count: 1,
										type: "food",
										weight: 1,
										costPerPound: 2,
										cost: 2,
										description: " "
									},
									{
										name: "soup (vegetable)",
										count: 1,
										type: "food",
										weight: 1,
										costPerPound: 1,
										cost: 1,
										description: " "
									},
									{
										name: "sugar",
										count: 1,
										type: "food",
										weight: 0.001,
										costPerPound: 1,
										description: " "
									},
									{
										name: "tomato",
										count: 1,
										type: "food",
										weight: 0.25,
										costPerPound: 2,
										cost: 0.5,
										description: " "
									},
									{
										name: "turnip",
										count: 1,
										type: "food",
										weight: 2,
										costPerPound: 1,
										cost: 2,
										description: " "
									},
									{
										name: "venison",
										count: 1,
										type: "food",
										weight: 60,
										costPerPound: 10,
										cost: 600,
										description: "use cooking to prevent infection"
									}
								],
								drink: [
									{
										name: "ale (pint)",
										count: 1,
										type: "drink",
										weight: 1,
										conditions: {inebriation: 1},
										costPerPound: 2,
										cost: 2,
										description: "causes inebriation for 1d6 hours"
									},
									{
										name: "beer (pint)",
										count: 1,
										type: "drink",
										weight: 1,
										conditions: {inebriation: 1},
										costPerPound: 2,
										cost: 2,
										description: "causes inebriation for 1d6 hours"
									},
									{
										name: "fruit juice (pint)",
										count: 1,
										type: "drink",
										weight: 1,
										costPerPound: 3,
										cost: 3,
										description: " "
									},
									{
										name: "mead (pint)",
										count: 1,
										type: "drink",
										weight: 1,
										conditions: {inebriation: 1},
										costPerPound: 2,
										cost: 2,
										description: "causes inebriation for 1d6 hours"
									},
									{
										name: "milk (pint)",
										count: 1,
										type: "drink",
										weight: 1,
										costPerPound: 0.5,
										cost: 0.5,
										description: " "
									},
									{
										name: "rum (bottle)",
										count: 1,
										type: "drink",
										weight: 2,
										conditions: {inebriation: 1},
										costPerPound: 8,
										cost: 16,
										description: "causes inebriation for 1d6 hours"
									},
									{
										name: "tea (pint)",
										count: 1,
										type: "drink",
										weight: 1,
										costPerPound: 1,
										cost: 1,
										description: " "
									},
									{
										name: "vegetable juice (pint)",
										count: 1,
										type: "drink",
										weight: 1,
										costPerPound: 3,
										cost: 3,
										description: " "
									},
									{
										name: "water (pint)",
										count: 1,
										type: "drink",
										weight: 1,
										costPerPound: 1,
										cost: 1,
										description: " "
									},
									{
										name: "whiskey (bottle)",
										count: 1,
										type: "drink",
										weight: 2,
										conditions: {inebriation: 1},
										costPerPound: 8,
										cost: 16,
										description: "causes inebriation for 1d6 hours"
									},
									{
										name: "wine, white (bottle)",
										count: 1,
										type: "drink",
										weight: 2,
										conditions: {inebriation: 1},
										costPerPound: 12,
										cost: 24,
										description: "causes inebriation for 1d6 hours"
									},
									{
										name: "wine, red (bottle)",
										count: 1,
										type: "drink",
										weight: 2,
										conditions: {inebriation: 1},
										costPerPound: 12,
										cost: 24,
										description: "causes inebriation for 1d6 hours"
									}
								],
								instrument: [
									{
										name: "bagpipes",
										count: 1,
										type: "instrument",
										weight: 6,
										hands: 2,
										usage: [
											{
												statistic: "dexterity",
												skill: "musicianship"
											}
										],
										materials: "leather",
										cost: 100,
										description: "from animal organs; mid-range sounds; range: 1000 ft"
									},
									{
										name: "bass",
										count: 1,
										type: "instrument",
										weight: 7,
										hands: 2,
										usage: [
											{
												statistic: "dexterity",
												skill: "musicianship"
											}
										],
										fuel: 3,
										materials: "wood, string",
										cost: 250,
										description: "wood and string; mid-range to low-pitched sounds; range: 250 ft"
									},
									{
										name: "bassoon",
										count: 1,
										type: "instrument",
										weight: 8,
										hands: 2,
										usage: [
											{
												statistic: "dexterity",
												skill: "musicianship"
											}
										],
										fuel: 2,
										materials: "wood",
										cost: 300,
										description: "low-pitch to mid-range sounds; range: 250 ft"
									},
									{
										name: "bell",
										count: 1,
										type: "instrument",
										weight: 0.5,
										hands: 1,
										usage: [
											{
												statistic: "dexterity",
												skill: "musicianship"
											}
										],
										materials: "metal",
										cost: 5,
										description: "metal; ringing sound; range: 500 ft"
									},
									{
										name: "bird pipes",
										count: 1,
										type: "instrument",
										weight: 2,
										hands: 1,
										usage: [
											{
												statistic: "dexterity",
												skill: "musicianship"
											},
											{
												statistic: "logic",
												skill: "handle_animals",
												modifier: 5
											}
										],
										materials: "wood",
										cost: 10,
										description: "wood or metal; to sound like a bird; +5 handle animals for birds; range: 250 ft"
									},
									{
										name: "cello",
										count: 1,
										type: "instrument",
										weight: 5,
										hands: 2,
										usage: [
											{
												statistic: "dexterity",
												skill: "musicianship"
											}
										],
										fuel: 3,
										materials: "wood, string",
										cost: 250,
										description: "wood and string; mid-range to low-pitched sounds; range: 250 ft"
									},
									{
										name: "clarinet",
										count: 1,
										type: "instrument",
										weight: 3,
										hands: 2,
										usage: [
											{
												statistic: "dexterity",
												skill: "musicianship"
											}
										],
										fuel: 1,
										materials: "wood",
										cost: 200,
										description: "mid-range to high-pitched sounds; range: 500 ft"
									},
									{
										name: "drum",
										count: 1,
										type: "instrument",
										weight: 3,
										hands: 1,
										usage: [
											{
												statistic: "dexterity",
												skill: "musicianship"
											}
										],
										materials: "wood, leather",
										cost: 10,
										description: "unpitched sounds; range: 1000 ft"
									},
									{
										name: "dulcimer",
										count: 1,
										type: "instrument",
										weight: 10,
										hands: 2,
										usage: [
											{
												statistic: "dexterity",
												skill: "musicianship"
											}
										],
										fuel: 2,
										materials: "wood, string",
										cost: 150,
										description: "string & wood; mid-range sounds; range: 125 ft"
									},
									{
										name: "flute",
										count: 1,
										type: "instrument",
										weight: 2,
										hands: 2,
										usage: [
											{
												statistic: "dexterity",
												skill: "musicianship"
											}
										],
										magnetic: true,
										materials: "metal",
										cost: 65,
										description: "high-pitched sounds; range: 500 ft"
									},
									{
										name: "gong",
										count: 1,
										type: "instrument",
										weight: 10,
										hands: 1,
										usage: [
											{
												statistic: "dexterity",
												skill: "musicianship"
											}
										],
										magnetic: true,
										materials: "metal",
										cost: 80,
										description: "low-pitched sounds; range: 1000 ft"
									},
									{
										name: "guitar",
										count: 1,
										type: "instrument",
										weight: 5,
										hands: 2,
										usage: [
											{
												statistic: "dexterity",
												skill: "musicianship"
											}
										],
										fuel: 2,
										materials: "wood, string",
										cost: 50,
										description: "mid-range sounds; range: 125 ft"
									},
									{
										name: "harp",
										count: 1,
										type: "instrument",
										weight: 5,
										hands: 2,
										usage: [
											{
												statistic: "dexterity",
												skill: "musicianship"
											}
										],
										fuel: 2,
										materials: "wood, string",
										cost: 150,
										description: "mid-range sounds; range: 125 ft"
									},
									{
										name: "horn instrument",
										count: 1,
										type: "instrument",
										weight: 5,
										hands: 2,
										usage: [
											{
												statistic: "dexterity",
												skill: "musicianship"
											}
										],
										materials: "metal",
										cost: 100,
										description: "made from animal bone or brass; mid-range sounds; range: 500 ft"
									},
									{
										name: "lute",
										count: 1,
										type: "instrument",
										weight: 5,
										hands: 2,
										usage: [
											{
												statistic: "dexterity",
												skill: "musicianship"
											}
										],
										fuel: 2,
										materials: "wood, string",
										cost: 50,
										description: "mid-range sounds; range: 125 ft"
									},
									{
										name: "lyre",
										count: 1,
										type: "instrument",
										weight: 5,
										hands: 2,
										usage: [
											{
												statistic: "dexterity",
												skill: "musicianship"
											}
										],
										fuel: 2,
										materials: "wood, string",
										cost: 150,
										description: "mid-range sounds; range: 125 ft"
									},
									{
										name: "oboe",
										count: 1,
										type: "instrument",
										weight: 3,
										hands: 2,
										usage: [
											{
												statistic: "dexterity",
												skill: "musicianship"
											}
										],
										fuel: 1,
										materials: "wood",
										cost: 200,
										description: "mid-range to high-pitched sounds; range: 500 ft"
									},
									{
										name: "panflute",
										count: 1,
										type: "instrument",
										weight: 2,
										hands: 2,
										usage: [
											{
												statistic: "dexterity",
												skill: "musicianship"
											}
										],
										fuel: 1,
										materials: "wood",
										cost: 35,
										description: "high-pitched sounds; range: 250 ft"
									},
									{
										name: "shawm",
										count: 1,
										type: "instrument",
										weight: 3,
										hands: 2,
										usage: [
											{
												statistic: "dexterity",
												skill: "musicianship"
											}
										],
										fuel: 1,
										materials: "wood",
										cost: 200,
										description: "mid-range to high-pitched sounds; range: 500 ft"
									},
									{
										name: "tambourine",
										count: 1,
										type: "instrument",
										weight: 2,
										hands: 1,
										usage: [
											{
												statistic: "dexterity",
												skill: "musicianship"
											}
										],
										materials: "wood, metal",
										cost: 25,
										description: "unpitched sounds; range: 125 ft"
									},
									{
										name: "trombone",
										count: 1,
										type: "instrument",
										weight: 5,
										hands: 2,
										usage: [
											{
												statistic: "dexterity",
												skill: "musicianship"
											}
										],
										materials: "wood, metal",
										cost: 200,
										description: "made from brass; low-range sounds; range: 500 ft"
									},
									{
										name: "viol",
										count: 1,
										type: "instrument",
										weight: 3,
										hands: 2,
										usage: [
											{
												statistic: "dexterity",
												skill: "musicianship"
											}
										],
										fuel: 2,
										materials: "wood, string",
										cost: 150,
										description: "wood and string; high-pitched to mid-range sounds; range: 250 ft"
									},
									{
										name: "viola",
										count: 1,
										type: "instrument",
										weight: 2,
										hands: 2,
										usage: [
											{
												statistic: "dexterity",
												skill: "musicianship"
											}
										],
										fuel: 2,
										materials: "wood, string",
										cost: 150,
										description: "wood and string; high-pitched to mid-range sounds; range: 250 ft"
									},
									{
										name: "violin",
										count: 1,
										type: "instrument",
										weight: 1,
										hands: 2,
										usage: [
											{
												statistic: "dexterity",
												skill: "musicianship"
											}
										],
										fuel: 2,
										materials: "wood, string",
										cost: 150,
										description: "wood and string; high-pitched to mid-range sounds; range: 250 ft"
									},
									{
										name: "whistle",
										count: 1,
										type: "instrument",
										weight: 0.05,
										hands: 1,
										usage: [
											{
												statistic: "dexterity",
												skill: "musicianship"
											}
										],
										cost: 4,
										materials: "metal",
										description: "high-pitched sound; range: 500 ft"
									},
									{
										name: "zither",
										count: 1,
										type: "instrument",
										weight: 7,
										hands: 2,
										usage: [
											{
												statistic: "dexterity",
												skill: "musicianship"
											}
										],
										fuel: 2,
										materials: "wood, string",
										cost: 40,
										description: "string & wood; mid-range sounds; range: 125 ft"
									}
								],
								miscellaneous: [
									{
										name: "abacus",
										count: 1,
										weight: 2,
										hands: 1,
										usage: [
											{
												statistic: "logic",
												skill: "mathematics",
												modifier: 5
											}
										],
										materials: "wood",
										cost: 20,
										description: "mathematics +5"
									},
									{
										name: "amulet",
										count: 1,
										weight: 0.1,
										magnetic: true,
										materials: "metal",
										cost: 30,
										description: " "
									},
									{
										name: "astrolabe",
										count: 1,
										weight: 0.5,
										hands: 1,
										usage: [
											{
												statistic: "memory",
												skill: "geography",
												modifier: 5
											}
										],
										materials: "wood",
										cost: 20,
										description: "geography +5"
									},
									{
										name: "atomizer",
										count: 1,
										weight: 1,
										d6: 1,
										hands: 2,
										materials: "glass, metal",
										cost: 20,
										description: "aerosolizes liquid, such as potions, into a spherical fog with a radius of 5 ft lasting 1d6 rounds"
									},
									{
										name: "ball",
										count: 1,
										weight: 1,
										hands: 1,
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										materials: "wood, leather, metal",
										cost: 10,
										description: " "
									},
									{
										name: "ball bearings",
										count: 100,
										weight: 0.005,
										magnetic: true,
										materials: "metal",
										cost: 10,
										description: " "
									},
									{
										name: "barrel",
										count: 1,
										weight: 100,
										fuel: 5,
										materials: "wood",
										cost: 60,
										description: "used to carry items"
									},
									{
										name: "basket",
										count: 1,
										weight: 2,
										hands: 1,
										fuel: 1,
										materials: "wood",
										cost: 10,
										description: "used to carry items"
									},
									{
										name: "bedroll",
										count: 1,
										weight: 7,
										conditions: {extreme_cold: 0},
										materials: "wool",
										cost: 20,
										description: "prevents extreme cold"
									},
									{
										name: "bellows",
										count: 1,
										weight: 5,
										hands: 2,
										usage: [
											{
												statistic: "strength",
												skill: "melee"
											}
										],
										materials: "wood, leather",
										cost: 5,
										description: "blasts air; can be used to project fluids, such as potions, in a 90-degree cone with a 10-ft radius"
									},
									{
										name: "belt",
										count: 1,
										weight: 0.5,
										usage: [
											{
												statistic: "strength",
												skill: "melee",
												d6: 3
											}
										],
										materials: "leather",
										cost: 5,
										description: " "
									},
									{
										name: "berry extract (red)",
										count: 1,
										weight: 0.01,
										cost: 1,
										description: "for potion-making (alchemy, medicine); they can be combined in specific combinations and diluted with 10 parts water to make potions; 2/3 part red"
									},
									{
										name: "berry extract (yellow)",
										count: 1,
										weight: 0.01,
										cost: 1,
										description: "for potion-making (alchemy, medicine); they can be combined in specific combinations and diluted with 10 parts water to make potions; 1/3 part red, 1/3 part green"
									},
									{
										name: "berry extract (green)",
										count: 1,
										weight: 0.01,
										cost: 1,
										description: "for potion-making (alchemy, medicine); they can be combined in specific combinations and diluted with 10 parts water to make potions; 2/3 part green"
									},
									{
										name: "berry extract (cyan)",
										count: 1,
										weight: 0.01,
										cost: 1,
										description: "for potion-making (alchemy, medicine); they can be combined in specific combinations and diluted with 10 parts water to make potions; 1/3 part green, 1/3 part blue"
									},
									{
										name: "berry extract (blue)",
										count: 1,
										weight: 0.01,
										cost: 1,
										description: "for potion-making (alchemy, medicine); they can be combined in specific combinations and diluted with 10 parts water to make potions; 2/3 part blue"
									},
									{
										name: "berry extract (magenta)",
										count: 1,
										weight: 0.01,
										cost: 1,
										description: "for potion-making (alchemy, medicine); they can be combined in specific combinations and diluted with 10 parts water to make potions; 1/3 part blue, 1/3 part red"
									},
									{
										name: "bit & bridle",
										count: 1,
										weight: 1,
										usage: [
											{
												statistic: "dexterity",
												skill: "ride_animals",
												modifier: 2
											}
										],
										materials: "metal, leather",
										cost: 25,
										description: "for horses or other mounts; +2 ride animals"
									},
									{
										name: "blanket",
										count: 1,
										weight: 3,
										conditions: {extreme_cold: 0},
										materials: "cloth, wool",
										cost: 15,
										description: "prevents extreme cold"
									},
									{
										name: "block & tackle (pulleys)",
										count: 1,
										weight: 5,
										hands: 2,
										usage: [
											{
												statistic: "strength",
												skill: "carry",
												modifier: 5
											}
										],
										materials: "metal, wood, string",
										cost: 10,
										description: "+5 carry (pull/lift/etc.)"
									},
									{
										name: "bola",
										count: 1,
										weight: 5,
										hands: 1,
										conditions: { paralysis_arms: 1, paralysis_legs: 1 },
										usage: [
											{
												statistic: "strength",
												skill: "throw"
											}
										],
										materials: "wood, string",
										cost: 20,
										description: "must be thrown; can cause arm or leg paralysis; can be overcome with escape bonds"
									},
									{
										name: "book",
										count: 1,
										weight: 3,
										hands: 1,
										usage: [
											{
												statistic: "memory",
												skill: "astronomy",
												modifier: 5
											}
										],
										fuel: 1,
										materials: "paper",
										cost: 5,
										description: "+5 specific memory/logic skill (mathematics, alchemy, zoology, etc.)"
									},
									{
										name: "bottle",
										count: 1,
										weight: 0.1,
										hands: 1,
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										materials: "glass",
										cost: 1,
										description: "shatters on impact"
									},
									{
										name: "bowl",
										count: 1,
										weight: 0.5,
										hands: 1,
										materials: "wood, metal, ceramic, glass",
										cost: 1,
										description: "used to carry food"
									},
									{
										name: "bracelet",
										count: 1,
										weight: 0.1,
										magnetic: true,
										materials: "metal",
										cost: 20,
										description: " "
									},
									{
										name: "broom",
										count: 1,
										weight: 2,
										hands: 1,
										usage: [
											{
												statistic: "strength",
												skill: "melee",
												d6: 3
											}
										],
										fuel: 2,
										materials: "wood",
										cost: 5,
										description: "used for cleaning"
									},
									{
										name: "bucket",
										count: 1,
										weight: 2,
										hands: 1,
										fuel: 1,
										materials: "wood",
										cost: 5,
										description: "used to carry items / liquids"
									},
									{
										name: "caltrops",
										count: 20,
										weight: 0.1,
										magnetic: true,
										d6: 3,
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										conditions: {bleeding: 1},
										materials: "metal",
										cost: 10,
										description: "on a failed sneak through a 5-ft square covered in caltops, causes 3d6 damage"
									},
									{
										name: "cards",
										count: 52,
										weight: 0.001,
										hands: 1,
										materials: "paper",
										usage: [
											{
												statistic: "logic",
												skill: "game_playing"
											}
										],
										cost: 5,
										description: " "
									},
									{
										name: "candle",
										count: 1,
										weight: 0.1,
										hands: 1,
										conditions: {darkness: 0},
										materials: "wax",
										cost: 1,
										description: "burns for 2 hours; negates darkness"
									},
									{
										name: "candle flashlight",
										count: 1,
										weight: 1,
										hands: 1,
										conditions: {darkness: 0},
										magnetic: true,
										materials: "metal",
										cost: 3,
										description: "focuses candlelight; push up as candle burns for 2 hours; negates darkness"
									},
									{
										name: "cauldron",
										count: 1,
										weight: 5,
										usage: [
											{
												statistic: "memory",
												skill: "cooking"
											},
											{
												statistic: "memory",
												skill: "alchemy"
											}
										],
										magnetic: true,
										materials: "metal",
										cost: 25,
										description: "used for heating water for cooking or making potions (alchemy, medicine)"
									},
									{
										name: "chain",
										count: 1,
										weight: 10,
										hands: 1,
										magnetic: true,
										materials: "metal",
										cost: 10,
										description: "10 feet"
									},
									{
										name: "chest",
										count: 1,
										weight: 25,
										fuel: 3,
										materials: "wood, metal",
										cost: 50,
										description: "used to carry items"
									},
									{
										name: "cloth",
										count: 1,
										weight: 0.5,
										fuel: 1,
										usage: [
											{
												statistic: "memory",
												skill: "medicine",
												modifier: 2
											}
										],
										materials: "cloth",
										cost: 1,
										description: "used to make tents or clothing, to carry items, or to bandage wounds (+2 medicine)"
									},
									{
										name: "coin",
										count: 1,
										weight: 0.01,
										materials: "metal",
										cost: 1,
										description: "used as currency"
									},
									{
										name: "compass",
										count: 1,
										weight: 0.05,
										hands: 1,
										usage: [
											{
												statistic: "memory",
												skill: "geography",
												modifier: 5
											}
										],
										magnetic: true,
										materials: "wood, metal",
										cost: 15,
										description: "+5 geography"
									},
									{
										name: "crochet hook",
										count: 1,
										weight: 0.05,
										hands: 1,
										usage: [
											{
												statistic: "dexterity",
												skill: "crafting"
											}
										],
										materials: "wood",
										cost: 2,
										description: "used in crafting"
									},
									{
										name: "crook",
										count: 1,
										weight: 4,
										hands: 1,
										usage: [
											{
												statistic: "strength",
												skill: "melee",
												d6: 4
											}
										],
										fuel: 3,
										materials: "wood",
										cost: 30,
										description: " "
									},
									{
										name: "crowbar",
										count: 1,
										weight: 5,
										hands: 1,
										usage: [
											{
												statistic: "strength",
												skill: "carry",
												modifier: 5
											},
											{
												statistic: "strength",
												skill: "melee",
												d6: 4
											}
										],
										magnetic: true,
										materials: "metal",
										cost: 25,
										description: "+5 strength (carry) when applicable"
									},
									{
										name: "crown",
										count: 1,
										type: "armor",
										armorType: "head",
										weight: 1,
										magnetic: true,
										d6: 2,
										materials: "metal",
										cost: 40,
										description: "2d6 head armor"
									},
									{
										name: "cup",
										count: 1,
										weight: 0.5,
										hands: 1,
										materials: "wood, metal, ceramic, glass",
										cost: 1,
										description: "used to carry liquid items"
									},
									{
										name: "dice",
										count: 1,
										weight: 0.05,
										usage: [
											{
												statistic: "logic",
												skill: "game_playing"
											}
										],
										hands: 1,
										materials: "wood, metal, ceramic",
										cost: 1,
										description: "for game-playing"
									},
									{
										name: "extract containers",
										count: 3,
										weight: 0.5,
										hands: 2,
										materials: "glass",
										cost: 3,
										description: "for potion-making (alchemy, medicine); made of a special material that prevents corrosion"
									},
									{
										name: "feather",
										count: 1,
										weight: 0.001,
										materials: "",
										cost: 1,
										description: "from birds"
									},
									{
										name: "fishing pole, hook, line",
										count: 1,
										weight: 4,
										usage: [
											{
												statistic: "strength",
												skill: "fishing",
												modifier: 5
											}
										],
										hands: 2,
										materials: "wood, string, metal",
										cost: 10,
										description: "for catching fish or other aquatic creatures (+5 fishing)"
									},
									{
										name: "flask",
										count: 1,
										weight: 0.5,
										hands: 1,
										materials: "leather, metal",
										cost: 10,
										description: "used to carry liquids"
									},
									{
										name: "flintbox",
										count: 1,
										weight: 0.5,
										hands: 2,
										materials: "metal",
										cost: 6,
										description: "starts fire"
									},
									{
										name: "flower",
										count: 1,
										weight: 0.01,
										materials: "wood",
										cost: 1,
										description: "may contain flower extract"
									},
									{
										name: "flower extract (red)",
										count: 1,
										weight: 0.01,
										cost: 1,
										description: "for potion-making (alchemy, medicine); volatile on their own, they can be combined in specific combinations and diluted with 10 parts water to make potions"
									},
									{
										name: "flower extract (green)",
										count: 1,
										weight: 0.01,
										cost: 1,
										description: "for potion-making (alchemy, medicine); volatile on their own, they can be combined in specific combinations and diluted with 10 parts water to make potions"
									},
									{
										name: "flower extract (blue)",
										count: 1,
										weight: 0.01,
										cost: 1,
										description: "for potion-making (alchemy, medicine); volatile on their own, they can be combined in specific combinations and diluted with 10 parts water to make potions"
									},
									{
										name: "gameboard & pieces",
										count: 1,
										weight: 2,
										usage: [
											{
												statistic: "logic",
												skill: "game_playing"
											}
										],
										materials: "wood, metal, ceramic, glass",
										cost: 15,
										description: "used for game-playing"
									},
									{
										name: "gemstone (cyan)",
										count: 1,
										weight: 0.02,
										materials: "stone",
										cost: 2,
										description: "for potion-making (alchemy); crushed and mixed into 10 parts boiling water to make potions; equivalent to 1 green and 1 blue"
									},
									{
										name: "gemstone (magenta)",
										count: 1,
										weight: 0.02,
										materials: "stone",
										cost: 2,
										description: "for potion-making (alchemy); crushed and mixed into 10 parts boiling water to make potions; equivalent to 1 red and 1 blue"
									},
									{
										name: "gemstone (yellow)",
										count: 1,
										weight: 0.02,
										materials: "stone",
										cost: 2,
										description: "for potion-making (alchemy); crushed and mixed into 10 parts boiling water to make potions; equivalent to 1 red and 1 green"
									},
									{
										name: "glass pane",
										count: 1,
										weight: 1,
										hands: 1,
										usage: [
											{
												statistic: "strength",
												skill: "melee",
												d6: 3
											}
										],
										conditions: {bleeding: 1},
										materials: "glass",
										cost: 5,
										description: "shatters on impact"
									},
									{
										name: "grappling hook",
										count: 1,
										weight: 4,
										hands: 1,
										usage: [
											{
												statistic: "strength",
												skill: "climb",
												modifier: 5
											}
										],
										magnetic: true,
										materials: "metal",
										cost: 25,
										description: "+5 climb"
									},
									{
										name: "hammer",
										count: 1,
										weight: 3,
										usage: [
											{
												statistic: "dexterity",
												skill: "crafting"
											},
											{
												statistic: "memory",
												skill: "metalworking"
											}
										],
										hands: 1,
										magnetic: true,
										materials: "metal",
										cost: 4,
										description: "used in metalworking, woodworking, crafting"
									},
									{
										name: "harness (climbing)",
										count: 1,
										weight: 5,
										usage: [
											{
												statistic: "strength",
												skill: "climb",
												modifier: 5
											}
										],
										materials: "leather",
										cost: 25,
										description: "+5 climb"
									},
									{
										name: "hide",
										count: 1,
										weight: 15,
										materials: "leather",
										cost: 5,
										description: "from animals"
									},
									{
										name: "hourglass",
										count: 1,
										weight: 1,
										hands: 1,
										materials: "glass",
										cost: 15,
										description: "contains sand; for measuring the passage of time"
									},
									{
										name: "ink (+ jar)",
										count: 1,
										weight: 0.5,
										usage: [
											{
												statistic: "dexterity",
												skill: "penmanship"
											}
										],
										materials: "glass",
										cost: 20,
										description: "used with penmanship for writing"
									},
									{
										name: "iron poker",
										count: 1,
										weight: 5,
										hands: 1,
										magnetic: true,
										usage: [
											{
												statistic: "strength",
												skill: "melee",
												d6: 4
											}
										],
										materials: "metal",
										cost: 25,
										description: " "
									},
									{
										name: "jug",
										count: 1,
										weight: 4,
										hands: 1,
										fuel: 1,
										materials: "wood, metal, ceramic, glass",
										cost: 12,
										description: "used to carry liquids"
									},
									{
										name: "key",
										count: 1,
										weight: 0.1,
										hands: 1,
										magnetic: true,
										materials: "metal",
										cost: 2,
										description: "metal"
									},
									{
										name: "knitting needle",
										count: 1,
										weight: 0.05,
										hands: 2,
										usage: [
											{
												statistic: "dexterity",
												skill: "crafting"
											}
										],
										materials: "wood, metal",
										cost: 2,
										description: "used in crafting"
									},
									{
										name: "ladder",
										count: 1,
										weight: 25,
										usage: [
											{
												statistic: "strength",
												skill: "climb",
												modifier: 10
											}
										],
										fuel: 6,
										materials: "wood, metal",
										cost: 50,
										description: "causes safe climbing up 10 feet"
									},
									{
										name: "lock",
										count: 1,
										weight: 1,
										hands: 1,
										magnetic: true,
										materials: "metal",
										cost: 10,
										description: "can be countered with lock picking"
									},
									{
										name: "lock picks",
										count: 1,
										weight: 0.5,
										usage: [
											{
												statistic: "dexterity",
												skill: "lock_picking",
												modifier: 5
											}
										],
										hands: 2,
										magnetic: true,
										materials: "metal",
										cost: 20,
										description: "+5 lock picking"
									},
									{
										name: "magnet cube",
										count: 1,
										weight: 0.01,
										magnetic: true,
										materials: "stone",
										cost: 1,
										description: "0.5-inch cube; used as currency"
									},
									{
										name: "magnifying glass",
										count: 1,
										weight: 0.5,
										usage: [
											{
												statistic: "perception",
												skill: "sight",
												modifier: 5
											}
										],
										hands: 1,
										materials: "wood, glass",
										cost: 10,
										description: "+5 sight for small images / writing"
									},
									{
										name: "map",
										count: 1,
										weight: 0.1,
										usage: [
											{
												statistic: "memory",
												skill: "geography",
												modifier: 5
											}
										],
										hands: 1,
										fuel: 1,
										materials: "paper",
										cost: 25,
										description: "+5 geography"
									},
									{
										name: "measuring cups",
										count: 6,
										weight: 1.5,
										usage: [
											{
												statistic: "memory",
												skill: "alchemy"
											},
											{
												statistic: "memory",
												skill: "medicine"
											}
										],
										hands: 1,
										materials: "glass, metal, ceramic",
										cost: 3,
										description: "for potion-making (alchemy, medicine); made of a material that prevents corrosion; used to measure parts: (blue: 3 & 5), (green: 3 & 7), (red: 3 & 11)"
									},
									{
										name: "mirror",
										count: 1,
										weight: 1,
										materials: "glass",
										cost: 20,
										description: "reflective; shatters on impact"
									},
									{
										name: "mortar & pestle",
										count: 1,
										weight: 2,
										usage: [
											{
												statistic: "memory",
												skill: "alchemy"
											},
											{
												statistic: "memory",
												skill: "medicine"
											}
										],
										hands: 1,
										materials: "ceramic, glass",
										cost: 15,
										description: "for potion-making (alchemy, medicine)"
									},
									{
										name: "mushroom extract (red)",
										count: 1,
										weight: 0.01,
										cost: 1,
										description: "for potion-making (alchemy, medicine); volatile on their own, they can be combined in specific combinations and diluted with 10 parts water to make potions"
									},
									{
										name: "mushroom extract (green)",
										count: 1,
										weight: 0.01,
										cost: 1,
										description: "for potion-making (alchemy, medicine); volatile on their own, they can be combined in specific combinations and diluted with 10 parts water to make potions"
									},
									{
										name: "mushroom extract (blue)",
										count: 1,
										weight: 0.01,
										cost: 1,
										description: "for potion-making (alchemy, medicine); volatile on their own, they can be combined in specific combinations and diluted with 10 parts water to make potions"
									},
									{
										name: "muzzle",
										count: 1,
										weight: 1,
										materials: "leather",
										usage: [
											{
												statistic: "logic",
												skill: "handle_animals",
												modifier: 5
											}
										],
										cost: 20,
										description: "leather; prevents animal bite attacks (+5 handle animals)"
									},
									{
										name: "nails",
										count: 20,
										weight: 0.1,
										magnetic: true,
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3,
											}
										],
										conditions: {bleeding: 1},
										materials: "metal",
										cost: 10,
										description: "on a failed sneak through a 5-ft square covered in caltops, causes 3d6 damage"
									},
									{
										name: "necklace",
										count: 1,
										weight: 0.1,
										cost: 30,
										materials: "metal",
										magnetic: true,
										description: "metal"
									},
									{
										name: "net",
										count: 1,
										weight: 3,
										usage: [
											{
												statistic: "dexterity",
												skill: "catch",
												modifier: 5
											},
											{
												statistic: "strength",
												skill: "fishing"
											}
										],
										hands: 1,
										materials: "string",
										cost: 10,
										description: "for catching fish and insects (fishing, +5 catch)"
									},
									{
										name: "oil",
										count: 1,
										weight: 1,
										cost: 20,
										description: "1 pint fuels fire for 6 hours"
									},
									{
										name: "oil lamp",
										count: 1,
										weight: 2,
										hands: 1,
										materials: "metal",
										cost: 15,
										description: "burns for 6 hours per pint of oil; negates darkness"
									},
									{
										name: "pack",
										count: 1,
										weight: 2,
										fuel: 1,
										materials: "cloth, wool, leather",
										cost: 30,
										description: "used to carry items"
									},
									{
										name: "pan",
										count: 1,
										weight: 2,
										hands: 1,
										magnetic: true,
										materials: "metal",
										cost: 20,
										description: "for cooking"
									},
									{
										name: "paper",
										count: 1,
										weight: 0.01,
										usage: [
											{
												statistic: "dexterity",
												skill: "penmanship"
											}
										],
										hands: 1,
										fuel: 1,
										materials: "paper",
										cost: 1,
										description: "for writing"
									},
									{
										name: "paper fan",
										count: 1,
										weight: 0.1,
										hands: 1,
										fuel: 1,
										conditions: {extreme_heat: 0},
										materials: "paper",
										cost: 5,
										description: "prevents extreme heat"
									},
									{
										name: "parchment",
										count: 1,
										weight: 0.01,
										usage: [
											{
												statistic: "dexterity",
												skill: "penmanship"
											}
										],
										hands: 1,
										fuel: 1,
										materials: "leather",
										cost: 1,
										description: "for writing"
									},
									{
										name: "pick (mining)",
										count: 1,
										weight: 10,
										usage: [
											{
												statistic: "memory",
												skill: "geology"
											},
											{
												statistic: "strength",
												skill: "melee",
												d6: 4
											}
										],
										hands: 1,
										magnetic: true,
										conditions: {bleeding: 1},
										materials: "metal",
										cost: 25,
										description: "used to break stones"
									},
									{
										name: "pillow",
										count: 1,
										weight: 0.5,
										fuel: 1,
										materials: "cloth",
										cost: 20,
										description: "filled with cotton or feathers"
									},
									{
										name: "pitcher",
										count: 1,
										weight: 4,
										hands: 1,
										fuel: 1,
										materials: "wood, metal, ceramic, glass",
										cost: 12,
										description: "used to carry liquids"
									},
									{
										name: "pitons (spikes)",
										count: 10,
										weight: 10,
										hands: 1,
										magnetic: true,
										usage: [
											{
												statistic: "strength",
												skill: "climb",
												modifier: 5
											},
											{
												statistic: "dexterity",
												skill: "knifing",
												d6: 3
											}
										],
										conditions: {bleeding: 1},
										materials: "metal",
										cost: 50,
										description: "+5 climb"
									},
									{
										name: "plate",
										count: 1,
										weight: 0.5,
										hands: 1,
										materials: "wood, metal, ceramic, glass",
										cost: 1,
										description: "used to carry food"
									},
									{
										name: "pot",
										count: 1,
										weight: 5,
										usage: [
											{
												statistic: "memory",
												skill: "cooking"
											},
											{
												statistic: "memory",
												skill: "alchemy"
											}
										],
										hands: 1,
										magnetic: true,
										materials: "metal",
										cost: 25,
										description: "used to carry liquids; for cooking or making potions (alchemy, medicine)"
									},
									{
										name: "pouch",
										count: 1,
										weight: 1,
										fuel: 1,
										materials: "cloth, wool, leather",
										cost: 5,
										description: "used to carry items"
									},
									{
										name: "prism",
										count: 1,
										weight: 2,
										materials: "glass",
										cost: 10,
										description: "glass block that splits white light into colors"
									},
									{
										name: "quill pen",
										count: 1,
										weight: 0.05,
										usage: [
											{
												statistic: "dexterity",
												skill: "penmanship"
											}
										],
										hands: 1,
										cost: 5,
										description: "used with penmanship for writing"
									},
									{
										name: "quiver",
										count: 1,
										weight: 1,
										fuel: 1,
										materials: "cloth, wool, leather",
										cost: 8,
										description: "used to hold up to 20 arrows, bolts, and other projectiles"
									},
									{
										name: "ring",
										count: 1,
										weight: 0.05,
										magnetic: true,
										materials: "metal",
										cost: 30,
										description: " "
									},
									{
										name: "rock",
										count: 1,
										weight: 0.5,
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										hands: 1,
										materials: "stone",
										cost: 1,
										description: " "
									},
									{
										name: "rope",
										count: 1,
										weight: 2,
										usage: [
											{
												statistic: "strength",
												skill: "climb",
												modifier: 5
											},
											{
												statistic: "dexterity",
												skill: "crafting"
											}
										],
										fuel: 2,
										materials: "string",
										cost: 10,
										description: "10 feet; +5 climbing; helps with crafting"
									},
									{
										name: "sack",
										count: 1,
										weight: 0.5,
										fuel: 1,
										materials: "cloth, wool, leather",
										cost: 2,
										description: "used to carry items"
									},
									{
										name: "saddle",
										count: 1,
										weight: 20,
										usage: [
											{
												statistic: "dexterity",
												skill: "ride_animals",
												modifier: 5
											}
										],
										materials: "leather",
										cost: 150,
										description: "for horses or other mounts (+5 ride animals)"
									},
									{
										name: "sand (bag)",
										count: 1,
										weight: 0.5,
										conditions: {darkness: 1, minor_pain_head: 1},
										usage: [
											{
												statistic: "strength",
												skill: "throw"
											}
										],
										materials: "sand",
										cost: 1,
										description: "in eyes, causes darkness and head pain for 1d6 rounds"
									},
									{
										name: "scabbard",
										count: 1,
										weight: 1,
										materials: "leather",
										cost: 10,
										description: "used to carry swords and other weapons"
									},
									{
										name: "scope",
										count: 1,
										weight: 1,
										hands: 1,
										usage: [
											{
												statistic: "perception",
												skill: "sight",
												modifier: 10
											},
											{
												statistic: "dexterity",
												skill: "missile",
												modifier: 5
											}
										],
										materials: "wood, metal, glass",
										cost: 35,
										description: "for viewing far distances (+10 sight) and accuracy with aim (+5 missile)"
									},
									{
										name: "seal",
										count: 1,
										weight: 0.5,
										hands: 1,
										materials: "metal",
										cost: 10,
										description: "used with sealing wax to mark a brand"
									},
									{
										name: "sealing wax",
										count: 1,
										weight: 0.5,
										materials: "wax",
										cost: 5,
										description: "heated to seal containers, like envelopes and bottles"
									},
									{
										name: "sextant",
										count: 1,
										weight: 0.5,
										usage: [
											{
												statistic: "memory",
												skill: "geography",
												modifier: 5
											}
										],
										hands: 1,
										materials: "metal",
										cost: 35,
										description: "+5 geography"
									},
									{
										name: "shackles (manacles)",
										count: 1,
										weight: 6,
										hands: 2,
										magnetic: true,
										conditions: {paralysis_arms: 1, paralysis_legs: 1},
										materials: "metal",
										cost: 20,
										description: "arm bindings cause arm paralysis; leg bindings cause leg paralysis"
									},
									{
										name: "shears",
										count: 1,
										weight: 1,
										hands: 1,
										magnetic: true,
										usage: [
											{
												statistic: "dexterity",
												skill: "knifing",
												d6: 3
											}
										],
										conditions: {bleeding: 1},
										materials: "metal",
										cost: 10,
										description: " "
									},
									{
										name: "shovel",
										count: 1,
										weight: 5,
										hands: 1,
										fuel: 1,
										magnetic: true,
										usage: [
											{
												statistic: "strength",
												skill: "melee",
												d6: 4
											}
										],
										materials: "wood, metal",
										cost: 12,
										description: "for digging"
									},
									{
										name: "ski",
										count: 2,
										weight: 14,
										fuel: 2,
										materials: "wood",
										cost: 30,
										description: "for faster travel in snowy terrain"
									},
									{
										name: "soap",
										count: 1,
										weight: 0.5,
										usage: [
											{
												statistic: "memory",
												skill: "medicine",
												modifier: 5
											}
										],
										cost: 2,
										description: "used for bathing and preventing infection (+5 medicine)"
									},
									{
										name: "spectacles",
										count: 1,
										weight: 0.1,
										usage: [
											{
												statistic: "perception",
												skill: "sight",
												modifier: 7
											}
										],
										materials: "wood, metal, glass",
										cost: 50,
										description: "sets sight to maximum (+7)"
									},
									{
										name: "spring",
										count: 1,
										weight: 0.5,
										usage: [
											{
												statistic: "dexterity",
												skill: "crafting"
											}
										],
										magnetic: true,
										materials: "metal",
										cost: 1,
										description: "used in crafting"
									},
									{
										name: "spyglass",
										count: 1,
										weight: 1,
										hands: 1,
										usage: [
											{
												statistic: "perception",
												skill: "sight",
												modifier: 10
											},
											{
												statistic: "dexterity",
												skill: "missile",
												modifier: 5
											}
										],
										materials: "wood, metal, glass",
										cost: 35,
										description: "for viewing far distances (+10 sight) and accuracy with aim (+5 missile)"
									},
									{
										name: "stick",
										count: 1,
										usage: [
											{
												statistic: "strength",
												skill: "melee",
												d6: 3
											}
										],
										weight: 3,
										hands: 1,
										fuel: 2,
										materials: "wood",
										cost: 1,
										description: " "
									},
									{
										name: "string",
										count: 1,
										weight: 0.05,
										usage: [
											{
												statistic: "dexterity",
												skill: "crafting"
											}
										],
										materials: "string",
										cost: 1,
										description: "10 feet; used in crafting"
									},
									{
										name: "syringe (needle)",
										count: 1,
										weight: 0.1,
										usage: [
											{
												statistic: "memory",
												skill: "alchemy"
											},
											{
												statistic: "memory",
												skill: "medicine"
											}
										],
										hands: 1,
										materials: "glass, metal",
										cost: 10,
										description: "used to inject liquids, such as potions into orbs"
									},
									{
										name: "tent",
										count: 1,
										weight: 20,
										fuel: 4,
										conditions: {extreme_cold: 0},
										materials: "cloth",
										cost: 40,
										description: "prevents extreme cold"
									},
									{
										name: "tooth",
										count: 1,
										weight: 0.01,
										materials: "stone",
										cost: 1,
										description: "from animals"
									},
									{
										name: "torch",
										count: 1,
										weight: 1,
										hands: 1,
										fuel: 2,
										materials: "wood, leather",
										cost: 2,
										description: "fuels fire 2 hours; negates darkness"
									},
									{
										name: "totem",
										count: 1,
										weight: 1,
										materials: "wood, metal, ceramic, glass",
										cost: 20,
										description: "emblem or statue"
									},
									{
										name: "trap",
										count: 1,
										weight: 20,
										usage: [
											{
												statistic: "dexterity",
												skill: "crafting",
												d6: 3
											}
										],
										conditions: {paralysis_legs: 1, paralysis_arms: 1, bleeding: 1},
										materials: "metal",
										cost: 50,
										description: "tension-triggered claw-like metal hunting trap causing 3d6 damage and possibly paralysis"
									},
									{
										name: "umbrella",
										count: 1,
										weight: 3,
										hands: 1,
										fuel: 2,
										usage: [
											{
												statistic: "strength",
												skill: "melee",
												d6: 3
											}
										],
										materials: "wood, cloth",
										cost: 20,
										description: "blocks rain or sun"
									},
									{
										name: "vial",
										count: 1,
										weight: 0.1,
										hands: 1,
										usage: [
											{
												statistic: "strength",
												skill: "throw",
												d6: 3
											}
										],
										materials: "glass",
										cost: 1,
										description: "shatters on impact"
									},
									{
										name: "waterskin",
										count: 1,
										weight: 5,
										hands: 1,
										materials: "leather",
										cost: 15,
										description: "used to carry liquids"
									},
									{
										name: "whetstone",
										count: 1,
										weight: 1,
										usage: [
											{
												statistic: "memory",
												skill: "metalworking"
											}
										],
										hands: 1,
										materials: "stone",
										cost: 3,
										description: "used in metalworking to sharpen blades"
									},
									{
										name: "wire",
										count: 1,
										weight: 4,
										usage: [
											{
												statistic: "strength",
												skill: "climb",
												modifier: 5
											},
											{
												statistic: "dexterity",
												skill: "crafting"
											}
										],
										magnetic: true,
										materials: "metal",
										cost: 20,
										description: "10 feet; +5 climbing; helps with crafting; conducts electricity"
									},
									{
										name: "wok",
										count: 1,
										weight: 5,
										usage: [
											{
												statistic: "memory",
												skill: "cooking"
											},
											{
												statistic: "memory",
												skill: "alchemy"
											}
										],
										hands: 1,
										magnetic: true,
										materials: "metal",
										cost: 25,
										description: "magnetic; used to carry liquids; for cooking or making potions (alchemy, medicine)"
									}
								]
							}
						break

						case "puzzles":
							return [
								{
									name: "ancient battery slots",
									url: "https://docs.google.com/spreadsheets/d/1Yd6zQ6izCeP_AoMqKDvZuN6SKz24ERprJboePPWul58/edit",
									steps: [
										"Within the world, ancient technology devices require rechargeable batteries, which have 4 metal pegs sticking out of the sides. These must be slotted into the device; a slot has 4 channels along the wall, such that batteries must be inserted and rotated in a particular way.",
										"In a spreadsheet, create a large grid of small squares. Create an opening at the top and a port at the bottom. Between these, color a single, snaking path.",
										"Copy this multiple times. For each one, add extra, different loops and dead-ends, ensuring that the shared path remains the only viable solution.",
										"Challenge players to determine the correct, shared route. Characters can attempt to solve this using spatial reasoning.",
									]
								},
								{
									name: "ancient clock wire puzzle",
									steps: [
										"Within the world, characters encounter a clock-like interface, with 12 evenly spaced metal pegs sticking out of a circle. These are labeled 0-11 (or the equivalent, using the ancient numbering system). A metal wire comes from the center of the circle, and must be wrapped around specific pegs.",
										"Create a puzzle by multiplying a few numbers together. Provide characters with the result and challenge them to figure out that they must determine its factors. This can be done with paper and string or yarn.",
										"To add complexity, give players the result in base-12, requiring them to first convert to decimal. Characters can attempt to solve this using mathematics.",
									]
								},
								{
									name: "ancient language",
									url: "https://docs.google.com/document/d/1qKiqBSMPyV9PO6hNkKFG7UDaXou7iX1uGkNeG9CcstA/edit",
									steps: [
										"Characters encounter written text or spoken words in this constructed language and must translate using language.",
									]
								},
								{
									name: "ancient math",
									url: "https://drive.google.com/file/d/0B3Pd_099FSXVdWZoUkRTakRSR3VGTXc0QTJqU01odw/view",
									steps: [
										"Characters encounter mathematic equations using this numbering system and must solve equations using mathematics.",
										"Note that this is a base-12 system, requiring players to convert between decimal and dozenal.",
									]
								},
								{
									name: "ancient melodies",
									url: "https://docs.google.com/document/d/1IrgPgaw832zcgjNpPZAC_GKWWWhPKc-mmSLmyYAa1vc/edit",
									steps: [
										"Within the world, characters must use musicianship to perform a specific melody, such as to influence an animal (as detailed in pseudomagic).",
										"The melodies can be gradually revealed to the players. Each pitch is assigned a number (starting with C as 0, incrementing in halfsteps up to B as 11). Subscripts represent a lower octave; superscripts represent a higher octave. ",
										"Notate these using the ancient notation system, which is built on the ancient numbering system above. Draw three staff lines for each octave; on the bottom line, draw a thick horizontal line; on the middle, draw a square; on the top, draw a circle. Depict notes as follows:",
										"0: thick horizontal bar on the bottom line",
										"1: vertical bar on the bottom line",
										"2: vertical bar and negative diagonal bar on the bottom line",
										"3: vertical bar and negative/positive diagonal bars on the bottom line",
										"4: thick horizontal bar on the middle (square) line",
										"5: vertical bar on the middle (square) line",
										"6: vertical bar and negative diagonal bar on the middle (square) line",
										"7: vertical bar and negative/positive diagonal bars on the middle (square) line",
										"8: thick horizontal bar on the top (circle) line",
										"9: vertical bar on the top (circle) line",
										"10: vertical bar and negative diagonal bar on the top (circle) line",
										"11: vertical bar and negative/positive diagonal bars on the top (circle) line",
									]
								},
								{
									name: "ancient technology lock",
									url: "https://jamesmayr.com/lockturner",
									steps: [
										"Within the world, characters encounter a device with a rotational lock; they can use perception and sound to listen to the lock.",
										"Players can use this simulation to listen to the lock to find the combination. Note that the correct angles are randomly generated, and slowly drift from their initial positions.",
									]
								},
								{
									name: "ancient treasure chests",
									url: "https://jamesmayr.com/tileslider",
									steps: [
										"The top of a treasure chest can feature a mechanism comprised of sliding magnetic blocks that must be arranged in a certain way using spatial reasoning.",
										"Use a physical 15-puzzle (or larger) or this digital version, which allows using a custom image (such as a complex circuit).",
									]
								},
								{
									name: "armor / weapon patching",
									url: "https://jamesmayr.com/puzzlepatcher",
									steps: [
										"Within the world, characters can use leatherworking, woodworking, metalworking, and crafting to repair armor, weapons, and clothing.",
										"Players can use this simulation to solve a randomly generated hole-patching puzzle by clicking to select, dragging to move, and pressing Space to rotate patches, with the goal of covering all the holes.",
										"The GM can use query parameters (x, y, colors, pieces) to customize the puzzle."
									]
								},
								{
									name: "battle of wits",
									url: "https://jamesmayr.com/diamondcheckers",
									steps: [
										"Characters can be challenged to a game within the world using the game-playing skill, which can be played out by the players and GM.",
										"Possible abstract strategy games include chess, checkers, go, tafl, Pentago, and Diamond Checkers.",
										"Possible gambling / card games include blackjack, poker, liar's dice, and Chalice.",
									]
								},
								{
									name: "caves, dungeon walls",
									steps: [
										"Draw a maze using graph paper to represent a dungeon.",
										"Challenge players to solve the maze by only describing things from the characters' perspectives; this requires players to draw the maze as they go.",
										"To further complicate this, include mirrors in the maze, which can mislead the characters as to the shape of the maze.",
										"Characters can attempt to solve this using spatial reasoning.",
									]
								},
								{
									name: "circuit puzzle",
									url: "https://jamesmayr.com/cableconnector",
									steps: [
										"Within the world, characters encounter a device with loose wires that need to be reconnected without touching or overlapping (ie, within a single plane). They can attempt to solve this using spatial reasoning.",
										"Players can use this simulation to solve a randomly generated circuit puzzle by clicking to select a wire and dragging it to connect to the same-color end.",
									]
								},
								{
									name: "combination lock",
									url: "https://jamesmayr.com/wheelturner",
									steps: [
										"Within the world, characters encounter a combination lock, which can be solved using lock-picking. The story determines how they learn the combination.",
										"Players can use this simulation to solve a puzzle in which the combination is already known, but the mechanism is randomly generated. Turning one dial will inadvertently cause another dial to turn, requiring players to logically map out a sequence of moves that will arrange the dials in the desired orientation.",
										"The GM can use query parameters (wheelCount, maxNotchEffect, notchEffectChance, symbolSet, solution) to customize the puzzle."
									]
								},
								{
									name: "light discs",
									steps: [
										"Within the world, characters must use crafting to stain a piece of glass or parchment in a precise manner such that it reveals a map or message, or so that light passing through it is properly colored.",
										"Players can accomplish this using a color-by-number grid.",
										"For added complexity, use the ancient numbering system for numbers (mathematics), and the ancient language for color words (language).",
									]
								},
								{
									name: "pipe puzzle",
									url: "https://jamesmayr.com/pipestriper",
									steps: [
										"Within the world, characters encounter a series of disjointed pipes in fixed locations that must be rotated to create connections, allowing the flow of some liquid or gas. They can attempt to solve this using spatial reasoning.",
										"Players can use this simulation to solve a randomly generated rotational pipe puzzle by clicking to turn each piece to either connect as many as possible or generate combinations of colors.",
										"The GM can use query parameters (x, y, grid, orbs) to customize the puzzle.",
									]
								},
								{
									name: "potions (flowers / mushrooms)",
									steps: [
										"Characters must collect flower / mushroom extracts (red, green, blue). These can be combined only using special measuring cups: (blue: 3 & 5), (green: 3 & 7), (red: 3 & 11) and the alchemy, medicine, and botany skills, as applicable.",
										"The formula for each potion is listed above. To acquire the correct proportions, players must describe the exact steps using the measuring cups.",
										"For example, to get 2 units of blue, they would need to fill the 5 container, then pour it into the 3 container to split it into 3 parts and the remaining 2.",
									]
								},
								{
									name: "potions (gemstones)",
									steps: [
										"Characters must collect gemstones (cyan, magenta, yellow). These can be crushed and mixed into 10 parts of boiling water to create potions using the alchemy skill and geology skills.",
										"Stones are equivalent to flower / mushroom extracts as follows:",
										"cyan: 1 green + 1 blue",
										"magenta: 1 red + 1 blue",
										"yellow: 1 red + 1 green",
									]
								},
								{
									name: "ring keys",
									steps: [
										"Draw a diagonal tic-tac-toe grid. Fill in the top cell. Draw a diamond around the 4 bottom cells.",
										"In each the 4 remaining cells (not filled in, not within the diamond), choose one of the following 5 numbers: 0, 1, 2, 3, 4. Do not repeat a number.",
										"In each cell of the diamond, write the sum of the two outer numbers whose diagonals meet at that cell. (For example, if the left-most cell is 4 and the right-most cell is 3, write a 7 in the diamond's bottom cell.)",
										"Erase the outer numbers, leaving only the numbers within the diamond.",
										"Within the world, characters have pins of lengths 1 through 4, which they must insert correctly into the lock holes (outer cells), based on the inscribed numbers (diamond), using lock picking."
									]
								},
								{
									name: "rope puzzle",
									steps: [
										"Use yarn, string, or hair-ties to represent rope or chain, along with miniatures or Legos to represent characters or items that are tied up.",
										"Tie these things together into an elaborate mess.",
										"Challenge players to untie this. Within the world, characters can use escape bonds.",
									]
								},
								{
									name: "rotate keys",
									url: "https://jamesmayr.com/keyspinner",
									steps: [
										"Use K'Nex or paper & brass fastener to create multiple layers of wheels with extending spokes of varying lengths. This represents the key.",
										"Rotate the pieces to a particular configuration and trace an outline of the resultant shape on a piece of paper. This represents the lock.",
										"Randomize the rotation of each part of the key. Players must determine how to exactly fit the lock.",
										"Alternately, players can use this simulation to solve a randomly generated rotational key puzzle by clicking to turn each piece clockwise (or shift-clicking to rotate it counterclockwise). The GM can use query parameters (spokes, layers, lengths, sections) to customize the puzzle.",
										"Within the world, characters use lock picking to open the lock.",
									]
								}
							]
						break

					// npcs
						case "npcs":
							return [
								// human
									{
										info: {
											name: "human smart",
											demographics: { race: "human", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "The standard homo sapiens sapiens, these farmers, craftsmen, and traders are swift and smart, obligatory tool-users, and motivated by self-interest and often the well-being of friends and family.",
											status: { points: 0, burden: 27, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 8, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 7, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 5, condition: 0 }, { name: "taste", unremovable: true, maximum: 3, condition: 0 }, { name: "touch", unremovable: true, maximum: 6, condition: 0 }] },
											memory:     { maximum: 9, damage: 0, condition: 0, skills: [{ name: "lang_human", maximum: 7, condition: 0 }, { name: "medicine", maximum: 5, condition: 0 }] },
											logic:      { maximum: 9, damage: 0, condition: 0, skills: [{ name: "mechanics", maximum: 5, condition: 0 }, { name: "pattern_recognition", maximum: 3, condition: 0 }] },
											strength:   { maximum: 5, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 4, condition: 0 }, { name: "throw", maximum: 5, condition: 0, combat: true }] },
											dexterity:  { maximum: 7, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 5, condition: 0 }, { name: "knifing", combat: true, maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "crafting", maximum: 2, condition: 0 }] },
											immunity:   { maximum: 5, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}, { name: "sleep_resistance", maximum: 2, condition: 0 }] },
											speed:      { maximum: 6, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 5, condition: 0 }, { name: "jump", maximum: 4, condition: 0 }, { name: "swim", maximum: 3, condition: 0 }] }
										},
										items: [
											{name:"stonebow",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"missile"}],weight:3,hands:2,fuel:2,materials:"wood, string, metal",cost:70,description:"range: 50 ft",id:"lwxxxnluronoevbx"},
											{name:"rock orb",count:10,type:"ammunition",weapons:["sling","bomb","stonebow","gauss pistol"],weight:0.5,usage:[{statistic:"dexterity",skill:"missile",d6:3},{statistic:"strength",skill:"throw",d6:3}],hands:1,materials:"stone",cost:1,description:" ",id:"blcgrpuidapffjvr"},
											{name:"dagger",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"knifing",d6:3},{statistic:"strength",skill:"throw",d6:3}],weight:1,hands:1,magnetic:true,conditions:{bleeding:1},materials:"metal",cost:10,description:" ",id:"zexbxnhhkntluxke"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"book",count:1,weight:3,hands:1,usage:[{statistic:"memory",skill:"astronomy",modifier:5}],fuel:1,materials:"paper",cost:5,description:"+5 specific memory/logic skill (mathematics, alchemy, zoology, etc.)",id:"ctpvtxpllbiibxhw"},
										]
									},
									{
										info: {
											name: "human skilled",
											demographics: { race: "human", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "The standard homo sapiens sapiens, these farmers, craftsmen, and traders are swift and smart, obligatory tool-users, and motivated by self-interest and often the well-being of friends and family.",
											status: { points: 0, burden: 24, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 8, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 7, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 5, condition: 0 }, { name: "taste", unremovable: true, maximum: 3, condition: 0 }, { name: "touch", unremovable: true, maximum: 6, condition: 0 }] },
											memory:     { maximum: 5, damage: 0, condition: 0, skills: [{ name: "lang_human", maximum: 7, condition: 0 }] },
											logic:      { maximum: 7, damage: 0, condition: 0, skills: [{ name: "pattern_recognition", maximum: 3, condition: 0 }, { name: "spatial_reasoning", maximum: 5, condition: 0 }] },
											strength:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 4, condition: 0 }, { name: "throw", maximum: 5, condition: 0, combat: true }] },
											dexterity:  { maximum: 10, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 5, condition: 0 }, { name: "fencing", combat: true, maximum: 5, condition: 0 }, { name: "escape_bonds", maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "crafting", maximum: 2, condition: 0 }] },
											immunity:   { maximum: 5, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}, { name: "sleep_resistance", maximum: 2, condition: 0 }] },
											speed:      { maximum: 8, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 5, condition: 0 }, { name: "jump", maximum: 4, condition: 0 }, { name: "swim", maximum: 3, condition: 0 }] }
										},
										items: [
											{name:"stonebow",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"missile"}],weight:3,hands:2,fuel:2,materials:"wood, string, metal",cost:70,description:"range: 50 ft",id:"lwxxxnluronoevbx"},
											{name:"glass orb",count:10,type:"ammunition",weapons:["sling","bomb","stonebow","gauss pistol"],weight:0.1,usage:[{statistic:"dexterity",skill:"missile",d6:3},{statistic:"strength",skill:"throw",d6:3}],hands:1,conditions:{bleeding:1},materials:"glass",cost:4,description:"shatters on impact",id:"sbkuydbixlpqyats"},
											{name:"short sword",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:5}],weight:2,hands:1,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:50,description:" ",id:"grwjcuryhftbylps"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"rope",count:1,weight:2,usage:[{statistic:"strength",skill:"climb",modifier:5},{statistic:"dexterity",skill:"crafting"}],fuel:2,materials:"string",cost:10,description:"10 feet; +5 climbing; helps with crafting",id:"vkafrmfqhqivchjp"},
											{name:"spyglass",count:1,weight:1,hands:1,usage:[{statistic:"perception",skill:"sight",modifier:10},{statistic:"dexterity",skill:"missile",modifier:5}],materials:"wood, metal, glass",cost:35,description:"for viewing far distances (+10 sight) and accuracy with aim (+5 missile)",id:"hhozcolalgovetay"},
										]
									},
									{
										info: {
											name: "human strong",
											demographics: { race: "human", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "The standard homo sapiens sapiens, these farmers, craftsmen, and traders are swift and smart, obligatory tool-users, and motivated by self-interest and often the well-being of friends and family.",
											status: { points: 0, burden: 33.5, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 8, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 7, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 5, condition: 0 }, { name: "taste", unremovable: true, maximum: 3, condition: 0 }, { name: "touch", unremovable: true, maximum: 6, condition: 0 }] },
											memory:     { maximum: 5, damage: 0, condition: 0, skills: [{ name: "lang_human", maximum: 7, condition: 0 }] },
											logic:      { maximum: 6, damage: 0, condition: 0, skills: [{ name: "remain_calm", maximum: 5, condition: 0 }, { name: "pattern_recognition", maximum: 3, condition: 0 }] },
											strength:   { maximum: 9, damage: 0, condition: 0, skills: [{ name: "melee", combat: true, maximum: 5, condition: 0 }, { name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 4, condition: 0 }, { name: "throw", maximum: 5, condition: 0, combat: true }] },
											dexterity:  { maximum: 7, damage: 0, condition: 0, skills: [{ name: "fencing", combat: true, maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "crafting", maximum: 2, condition: 0 }] },
											immunity:   { maximum: 8, damage: 0, condition: 0, skills: [{ name: "pain_tolerance", maximum: 5, condition: 0 }, { name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}, { name: "sleep_resistance", maximum: 2, condition: 0 }] },
											speed:      { maximum: 6, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 5, condition: 0 }, { name: "jump", maximum: 4, condition: 0 }, { name: "swim", maximum: 3, condition: 0 }] }
										},
										items: [
											{name:"axe",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:5},{statistic:"strength",skill:"throw",d6:5}],weight:2,hands:1,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:50,description:" ",id:"yeqfovhaquvlzuus"},
											{name:"long staff",count:1,type:"weapon",usage:[{statistic:"strength",skill:"melee",d6:6}],weight:6,hands:2,fuel:4,materials:"wood",cost:60,description:" ",id:"aunayoybjrwjejnn"},
											{name:"wooden shield",count:1,type:"shield",d6:4,weight:10,fuel:3,hands:1,usage:[{statistic:"strength",skill:"melee",d6:3}],materials:"wood",cost:50,description:" ",id:"azwvgxetbvshdxtj"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"concoction of smoke",count:1,type:"potion",weight:0.5,usage:[{statistic:"strength",skill:"throw",d6:3}],"recipe":{"w":10,"r":4,"g":2,"b":2},"conditions":{"smoke":2},cost:16,description:"causes smoke in 5-ft square and surrounding 5-ft squares for 2d6 rounds",id:"qiqrjziyuizptbmh"},
										]
									},
									{
										info: {
											name: "human child",
											demographics: { race: "human", age: 10, sex: "", height: 3.5, weight: 75 },
											description: "The standard homo sapiens sapiens, these farmers, craftsmen, and traders are swift and smart, obligatory tool-users, and motivated by self-interest and often the well-being of friends and family.",
											status: { points: 0, burden: 3, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 8, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 7, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 5, condition: 0 }, { name: "taste", unremovable: true, maximum: 3, condition: 0 }, { name: "touch", unremovable: true, maximum: 6, condition: 0 }] },
											memory:     { maximum: 4, damage: 0, condition: 0, skills: [{ name: "lang_human", maximum: 7, condition: 0 }] },
											logic:      { maximum: 4, damage: 0, condition: 0, skills: [{ name: "pattern_recognition", maximum: 3, condition: 0 }] },
											strength:   { maximum: 3, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 4, condition: 0 }, { name: "throw", maximum: 5, condition: 0, combat: true }] },
											dexterity:  { maximum: 6, damage: 0, condition: 0, skills: [{ name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "crafting", maximum: 2, condition: 0 }] },
											immunity:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}, { name: "sleep_resistance", maximum: 2, condition: 0 }] },
											speed:      { maximum: 4, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 5, condition: 0 }, { name: "jump", maximum: 4, condition: 0 }, { name: "swim", maximum: 3, condition: 0 }] }
										},
										items: [
											{name:"clothes",count:1,type:"armor",armorType:"body",d6:1,weight:1,fuel:2,materials:"cloth",cost:10,description:" ",id:"rbxzkdzgldgzqlok"},
											{name:"shoes",count:1,type:"armor",armorType:"legs",d6:1,weight:2,fuel:2,materials:"cloth",cost:10,description:" ",id:"kjlbatbkkevyzedf"},
										]
									},
									{
										info: {
											name: "human boss",
											demographics: { race: "human", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "The standard homo sapiens sapiens, these farmers, craftsmen, and traders are swift and smart, obligatory tool-users, and motivated by self-interest and often the well-being of friends and family.",
											status: { points: 0, burden: 52, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 10, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 7, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 5, condition: 0 }, { name: "taste", unremovable: true, maximum: 3, condition: 0 }, { name: "touch", unremovable: true, maximum: 6, condition: 0 }] },
											memory:     { maximum: 9, damage: 0, condition: 0, skills: [{ name: "lang_human", maximum: 7, condition: 0 }] },
											logic:      { maximum: 9, damage: 0, condition: 0, skills: [{ name: "intimidate", maximum: 7, condition: 0, charisma: true, counters: ["remain_calm"] }, { name: "judge_character", maximum: 7, condition: 0 }, { name: "pattern_recognition", maximum: 3, condition: 0 }] },
											strength:   { maximum: 8, damage: 0, condition: 0, skills: [{ name: "melee", combat: true, maximum: 7, condition: 0 }, { name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 4, condition: 0 }, { name: "throw", maximum: 5, condition: 0, combat: true }] },
											dexterity:  { maximum: 10, damage: 0, condition: 0, skills: [{ name: "fencing", combat: true, maximum: 7, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "crafting", maximum: 2, condition: 0 }] },
											immunity:   { maximum: 8, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}, { name: "sleep_resistance", maximum: 2, condition: 0 }] },
											speed:      { maximum: 9, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 5, condition: 0 }, { name: "jump", maximum: 4, condition: 0 }, { name: "swim", maximum: 3, condition: 0 }] }
										},
										items: [
											{name:"long sword",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:7}],weight:5,hands:2,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:80,description:" ",id:"ystexytmmlneqixo"},
											{name:"warhammer",count:1,type:"weapon",usage:[{statistic:"strength",skill:"melee",d6:7}],weight:6,hands:2,magnetic:true,materials:"leather, metal",cost:80,description:" ",id:"dzgovmpmngryoart"},
											{name:"chainmail armor",count:1,type:"armor",armorType:"body",d6:5,weight:25,magnetic:true,materials:"metal",cost:70,description:"conducts electricity",id:"cwmbegsjhgbqwosn"},
											{name:"chainmail helmet",count:1,type:"armor",armorType:"head",d6:5,weight:5,magnetic:true,materials:"metal",cost:20,description:"conducts electricity",id:"wkthclgbkefjqqud"},
											{name:"chainmail gloves",count:1,type:"armor",armorType:"hands",d6:5,weight:4,magnetic:true,materials:"metal",cost:20,description:"conducts electricity",id:"wcsmkdyfecarrovp"},
											{name:"chainmail boots",count:1,type:"armor",armorType:"legs",d6:5,weight:6,magnetic:true,materials:"metal",cost:40,description:"conducts electricity",id:"ufadgpukpeambjnx"},
											{name:"potion of strong healing",count:1,type:"healing",weight:0.5,"recipe":{"w":10,"r":0,"g":7,"b":0},d6:2,"conditions":{"bleeding":0},cost:14,description:"removes 2d6 damage",id:"fgbobzjuccaaqvfj"},
											{name:"potion of flashbang",count:1,type:"potion",weight:0.5,"recipe":{"w":10,"r":6,"g":0,"b":6},d6:3,"conditions":{"loud_noise":1,"blinding_light":1},cost:24,description:"causes loud noise and blinding light for 1d6 rounds; explosion causes 3d6 damage to 5-ft square and surrounding 5-ft squares",id:"qsgqgreexyztuwmy"}
										]
									},

								// elf
									{
										info: {
											name: "elf smart",
											demographics: { race: "elf", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Standard fantasy elf, with a long lifespan, pointy ears, tall build, precision dexterity, mysticism, and knowledge of nature.",
											status: { points: 0, burden: 27, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 8, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 10, condition: 0 }, { name: "sound", unremovable: true, maximum: 10, condition: 0 }, { name: "scent", unremovable: true, maximum: 10, condition: 0 }, { name: "taste", unremovable: true, maximum: 10, condition: 0 }, { name: "touch", unremovable: true, maximum: 10, condition: 0 }, { name: "night_vision", maximum: 3, condition: 0, animals: true }] },
											memory:     { maximum: 9, damage: 0, condition: 0, skills: [{ name: "lang_elf", maximum: 7, condition: 0 }, { name: "medicine", maximum: 5, condition: 0 }] },
											logic:      { maximum: 8, damage: 0, condition: 0, skills: [{ name: "mechanics", maximum: 5, condition: 0 }] },
											strength:   { maximum: 5, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 1, condition: 0 }, { name: "throw", maximum: 2, condition: 0, combat: true }] },
											dexterity:  { maximum: 7, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 5, condition: 0 }, { name: "knifing", combat: true, maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 5, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 2, condition: 0, d6: 2 }, { name: "sleep_resistance", maximum: 2, condition: 0 }] },
											speed:      { maximum: 7, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 5, condition: 0 }, { name: "jump", maximum: 5, condition: 0 }, { name: "swim", maximum: 1, condition: 0 }] }
										},
										items: [
											{name:"stonebow",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"missile"}],weight:3,hands:2,fuel:2,materials:"wood, string, metal",cost:70,description:"range: 50 ft",id:"lwxxxnluronoevbx"},
											{name:"rock orb",count:10,type:"ammunition",weapons:["sling","bomb","stonebow","gauss pistol"],weight:0.5,usage:[{statistic:"dexterity",skill:"missile",d6:3},{statistic:"strength",skill:"throw",d6:3}],hands:1,materials:"stone",cost:1,description:" ",id:"blcgrpuidapffjvr"},
											{name:"dagger",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"knifing",d6:3},{statistic:"strength",skill:"throw",d6:3}],weight:1,hands:1,magnetic:true,conditions:{bleeding:1},materials:"metal",cost:10,description:" ",id:"zexbxnhhkntluxke"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"book",count:1,weight:3,hands:1,usage:[{statistic:"memory",skill:"astronomy",modifier:5}],fuel:1,materials:"paper",cost:5,description:"+5 specific memory/logic skill (mathematics, alchemy, zoology, etc.)",id:"ctpvtxpllbiibxhw"},
										]
									},
									{
										info: {
											name: "elf skilled",
											demographics: { race: "elf", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Standard fantasy elf, with a long lifespan, pointy ears, tall build, precision dexterity, mysticism, and knowledge of nature.",
											status: { points: 0, burden: 24, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 8, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 10, condition: 0 }, { name: "sound", unremovable: true, maximum: 10, condition: 0 }, { name: "scent", unremovable: true, maximum: 10, condition: 0 }, { name: "taste", unremovable: true, maximum: 10, condition: 0 }, { name: "touch", unremovable: true, maximum: 10, condition: 0 }, { name: "night_vision", maximum: 3, condition: 0, animals: true }] },
											memory:     { maximum: 7, damage: 0, condition: 0, skills: [{ name: "lang_elf", maximum: 7, condition: 0 }] },
											logic:      { maximum: 7, damage: 0, condition: 0, skills: [{ name: "pattern_recognition", maximum: 5, condition: 0 }] },
											strength:   { maximum: 5, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 1, condition: 0 }, { name: "throw", maximum: 2, condition: 0, combat: true }] },
											dexterity:  { maximum: 9, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 5, condition: 0 }, { name: "fencing", combat: true, maximum: 5, condition: 0 }, { name: "escape_bonds", maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 2, condition: 0, d6: 2 }, { name: "sleep_resistance", maximum: 2, condition: 0 }] },
											speed:      { maximum: 7, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 5, condition: 0 }, { name: "jump", maximum: 5, condition: 0 }, { name: "swim", maximum: 1, condition: 0 }] }
										},
										items: [
											{name:"stonebow",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"missile"}],weight:3,hands:2,fuel:2,materials:"wood, string, metal",cost:70,description:"range: 50 ft",id:"lwxxxnluronoevbx"},
											{name:"glass orb",count:10,type:"ammunition",weapons:["sling","bomb","stonebow","gauss pistol"],weight:0.1,usage:[{statistic:"dexterity",skill:"missile",d6:3},{statistic:"strength",skill:"throw",d6:3}],hands:1,conditions:{bleeding:1},materials:"glass",cost:4,description:"shatters on impact",id:"sbkuydbixlpqyats"},
											{name:"short sword",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:5}],weight:2,hands:1,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:50,description:" ",id:"grwjcuryhftbylps"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"rope",count:1,weight:2,usage:[{statistic:"strength",skill:"climb",modifier:5},{statistic:"dexterity",skill:"crafting"}],fuel:2,materials:"string",cost:10,description:"10 feet; +5 climbing; helps with crafting",id:"vkafrmfqhqivchjp"},
											{name:"spyglass",count:1,weight:1,hands:1,usage:[{statistic:"perception",skill:"sight",modifier:10},{statistic:"dexterity",skill:"missile",modifier:5}],materials:"wood, metal, glass",cost:35,description:"for viewing far distances (+10 sight) and accuracy with aim (+5 missile)",id:"hhozcolalgovetay"},
										]
									},
									{
										info: {
											name: "elf strong",
											demographics: { race: "elf", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Standard fantasy elf, with a long lifespan, pointy ears, tall build, precision dexterity, mysticism, and knowledge of nature.",
											status: { points: 0, burden: 33.5, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 8, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 10, condition: 0 }, { name: "sound", unremovable: true, maximum: 10, condition: 0 }, { name: "scent", unremovable: true, maximum: 10, condition: 0 }, { name: "taste", unremovable: true, maximum: 10, condition: 0 }, { name: "touch", unremovable: true, maximum: 10, condition: 0 }, { name: "night_vision", maximum: 3, condition: 0, animals: true }] },
											memory:     { maximum: 6, damage: 0, condition: 0, skills: [{ name: "lang_elf", maximum: 7, condition: 0 }] },
											logic:      { maximum: 6, damage: 0, condition: 0, skills: [{ name: "remain_calm", maximum: 5, condition: 0 }] },
											strength:   { maximum: 7, damage: 0, condition: 0, skills: [{ name: "melee", combat: true, maximum: 5, condition: 0 }, { name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 1, condition: 0 }, { name: "throw", maximum: 2, condition: 0, combat: true }] },
											dexterity:  { maximum: 9, damage: 0, condition: 0, skills: [{ name: "fencing", combat: true, maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 5, damage: 0, condition: 0, skills: [{ name: "pain_tolerance", maximum: 5, condition: 0 }, { name: "recover", unremovable: true, maximum: 2, condition: 0, d6: 2 }, { name: "sleep_resistance", maximum: 2, condition: 0 }] },
											speed:      { maximum: 8, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 5, condition: 0 }, { name: "jump", maximum: 5, condition: 0 }, { name: "swim", maximum: 1, condition: 0 }] }
										},
										items: [
											{name:"axe",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:5},{statistic:"strength",skill:"throw",d6:5}],weight:2,hands:1,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:50,description:" ",id:"yeqfovhaquvlzuus"},
											{name:"long staff",count:1,type:"weapon",usage:[{statistic:"strength",skill:"melee",d6:6}],weight:6,hands:2,fuel:4,materials:"wood",cost:60,description:" ",id:"aunayoybjrwjejnn"},
											{name:"wooden shield",count:1,type:"shield",d6:4,weight:10,fuel:3,hands:1,usage:[{statistic:"strength",skill:"melee",d6:3}],materials:"wood",cost:50,description:" ",id:"azwvgxetbvshdxtj"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"concoction of smoke",count:1,type:"potion",weight:0.5,usage:[{statistic:"strength",skill:"throw",d6:3}],"recipe":{"w":10,"r":4,"g":2,"b":2},"conditions":{"smoke":2},cost:16,description:"causes smoke in 5-ft square and surrounding 5-ft squares for 2d6 rounds",id:"qiqrjziyuizptbmh"},
										]
									},
									{
										info: {
											name: "elf child",
											demographics: { race: "elf", age: 25, sex: "", height: 3.5, weight: 75 },
											description: "Standard fantasy elf, with a long lifespan, pointy ears, tall build, precision dexterity, mysticism, and knowledge of nature.",
											status: { points: 0, burden: 3, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 8, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 10, condition: 0 }, { name: "sound", unremovable: true, maximum: 10, condition: 0 }, { name: "scent", unremovable: true, maximum: 10, condition: 0 }, { name: "taste", unremovable: true, maximum: 10, condition: 0 }, { name: "touch", unremovable: true, maximum: 10, condition: 0 }, { name: "night_vision", maximum: 3, condition: 0, animals: true }] },
											memory:     { maximum: 5, damage: 0, condition: 0, skills: [{ name: "lang_elf", maximum: 7, condition: 0 }] },
											logic:      { maximum: 4, damage: 0, condition: 0, skills: [] },
											strength:   { maximum: 3, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 1, condition: 0 }, { name: "throw", maximum: 2, condition: 0, combat: true }] },
											dexterity:  { maximum: 5, damage: 0, condition: 0, skills: [{ name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 4, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 2, condition: 0, d6: 2 }, { name: "sleep_resistance", maximum: 2, condition: 0 }] },
											speed:      { maximum: 5, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 5, condition: 0 }, { name: "jump", maximum: 5, condition: 0 }, { name: "swim", maximum: 1, condition: 0 }] }
										},
										items: [
											{name:"clothes",count:1,type:"armor",armorType:"body",d6:1,weight:1,fuel:2,materials:"cloth",cost:10,description:" ",id:"rbxzkdzgldgzqlok"},
											{name:"shoes",count:1,type:"armor",armorType:"legs",d6:1,weight:2,fuel:2,materials:"cloth",cost:10,description:" ",id:"kjlbatbkkevyzedf"},
										]
									},
									{
										info: {
											name: "elf boss",
											demographics: { race: "elf", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Standard fantasy elf, with a long lifespan, pointy ears, tall build, precision dexterity, mysticism, and knowledge of nature.",
											status: { points: 0, burden: 52, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 10, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 10, condition: 0 }, { name: "sound", unremovable: true, maximum: 10, condition: 0 }, { name: "scent", unremovable: true, maximum: 10, condition: 0 }, { name: "taste", unremovable: true, maximum: 10, condition: 0 }, { name: "touch", unremovable: true, maximum: 10, condition: 0 }, { name: "night_vision", maximum: 3, condition: 0, animals: true }] },
											memory:     { maximum: 10, damage: 0, condition: 0, skills: [{ name: "lang_elf", maximum: 7, condition: 0 }] },
											logic:      { maximum: 9, damage: 0, condition: 0, skills: [{ name: "intimidate", maximum: 7, condition: 0, charisma: true, counters: ["remain_calm"] }, { name: "judge_character", maximum: 7, condition: 0 }] },
											strength:   { maximum: 8, damage: 0, condition: 0, skills: [{ name: "melee", combat: true, maximum: 7, condition: 0 }, { name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 1, condition: 0 }, { name: "throw", maximum: 2, condition: 0, combat: true }] },
											dexterity:  { maximum: 10, damage: 0, condition: 0, skills: [{ name: "fencing", combat: true, maximum: 7, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 8, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 2, condition: 0, d6: 2 }, { name: "sleep_resistance", maximum: 2, condition: 0 }] },
											speed:      { maximum: 8, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 5, condition: 0 }, { name: "jump", maximum: 5, condition: 0 }, { name: "swim", maximum: 1, condition: 0 }] }
										},
										items: [
											{name:"long sword",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:7}],weight:5,hands:2,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:80,description:" ",id:"ystexytmmlneqixo"},
											{name:"warhammer",count:1,type:"weapon",usage:[{statistic:"strength",skill:"melee",d6:7}],weight:6,hands:2,magnetic:true,materials:"leather, metal",cost:80,description:" ",id:"dzgovmpmngryoart"},
											{name:"chainmail armor",count:1,type:"armor",armorType:"body",d6:5,weight:25,magnetic:true,materials:"metal",cost:70,description:"conducts electricity",id:"cwmbegsjhgbqwosn"},
											{name:"chainmail helmet",count:1,type:"armor",armorType:"head",d6:5,weight:5,magnetic:true,materials:"metal",cost:20,description:"conducts electricity",id:"wkthclgbkefjqqud"},
											{name:"chainmail gloves",count:1,type:"armor",armorType:"hands",d6:5,weight:4,magnetic:true,materials:"metal",cost:20,description:"conducts electricity",id:"wcsmkdyfecarrovp"},
											{name:"chainmail boots",count:1,type:"armor",armorType:"legs",d6:5,weight:6,magnetic:true,materials:"metal",cost:40,description:"conducts electricity",id:"ufadgpukpeambjnx"},
											{name:"potion of strong healing",count:1,type:"healing",weight:0.5,"recipe":{"w":10,"r":0,"g":7,"b":0},d6:2,"conditions":{"bleeding":0},cost:14,description:"removes 2d6 damage",id:"fgbobzjuccaaqvfj"},
											{name:"potion of flashbang",count:1,type:"potion",weight:0.5,"recipe":{"w":10,"r":6,"g":0,"b":6},d6:3,"conditions":{"loud_noise":1,"blinding_light":1},cost:24,description:"causes loud noise and blinding light for 1d6 rounds; explosion causes 3d6 damage to 5-ft square and surrounding 5-ft squares",id:"qsgqgreexyztuwmy"}
										]
									},

								// dwarf
									{
										info: {
											name: "dwarf smart",
											demographics: { race: "dwarf", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Standard fantasy dwarf, with short stature, powerful strength, and an affinity for geology, masonry, and war.",
											status: { points: 0, burden: 27, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 8, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 6, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 4, condition: 0 }, { name: "taste", unremovable: true, maximum: 4, condition: 0 }, { name: "touch", unremovable: true, maximum: 7, condition: 0 }, { name: "night_vision", maximum: 2, condition: 0, animals: true }] },
											memory:     { maximum: 9, damage: 0, condition: 0, skills: [{ name: "lang_dwarf", maximum: 7, condition: 0 }, { name: "medicine", maximum: 5, condition: 0 }] },
											logic:      { maximum: 6, damage: 0, condition: 0, skills: [{ name: "mechanics", maximum: 5, condition: 0 }] },
											strength:   { maximum: 7, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 3 }, { name: "carry", maximum: 5, condition: 0 }, { name: "throw", maximum: 4, condition: 0, combat: true }] },
											dexterity:  { maximum: 6, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 5, condition: 0 }, { name: "knifing", combat: true, maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "crafting", maximum: 3, condition: 0 }] },
											immunity:   { maximum: 7, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}] },
											speed:      { maximum: 6, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 3 }, { name: "run", maximum: 2, condition: 0 }, { name: "jump", maximum: 2, condition: 0 }, { name: "swim", maximum: 1, condition: 0 }, { name: "dodge", maximum: 2, condition: 0 }] }
										},
										items: [
											{name:"stonebow",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"missile"}],weight:3,hands:2,fuel:2,materials:"wood, string, metal",cost:70,description:"range: 50 ft",id:"lwxxxnluronoevbx"},
											{name:"rock orb",count:10,type:"ammunition",weapons:["sling","bomb","stonebow","gauss pistol"],weight:0.5,usage:[{statistic:"dexterity",skill:"missile",d6:3},{statistic:"strength",skill:"throw",d6:3}],hands:1,materials:"stone",cost:1,description:" ",id:"blcgrpuidapffjvr"},
											{name:"dagger",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"knifing",d6:3},{statistic:"strength",skill:"throw",d6:3}],weight:1,hands:1,magnetic:true,conditions:{bleeding:1},materials:"metal",cost:10,description:" ",id:"zexbxnhhkntluxke"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"book",count:1,weight:3,hands:1,usage:[{statistic:"memory",skill:"astronomy",modifier:5}],fuel:1,materials:"paper",cost:5,description:"+5 specific memory/logic skill (mathematics, alchemy, zoology, etc.)",id:"ctpvtxpllbiibxhw"},
										]
									},
									{
										info: {
											name: "dwarf skilled",
											demographics: { race: "dwarf", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Standard fantasy dwarf, with short stature, powerful strength, and an affinity for geology, masonry, and war.",
											status: { points: 0, burden: 24, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 6, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 6, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 4, condition: 0 }, { name: "taste", unremovable: true, maximum: 4, condition: 0 }, { name: "touch", unremovable: true, maximum: 7, condition: 0 }, { name: "night_vision", maximum: 2, condition: 0, animals: true }] },
											memory:     { maximum: 6, damage: 0, condition: 0, skills: [{ name: "lang_dwarf", maximum: 7, condition: 0 }] },
											logic:      { maximum: 6, damage: 0, condition: 0, skills: [{ name: "pattern_recognition", maximum: 5, condition: 0 }] },
											strength:   { maximum: 8, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 3 }, { name: "carry", maximum: 5, condition: 0 }, { name: "throw", maximum: 4, condition: 0, combat: true }] },
											dexterity:  { maximum: 9, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 5, condition: 0 }, { name: "fencing", combat: true, maximum: 5, condition: 0 }, { name: "escape_bonds", maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "crafting", maximum: 3, condition: 0 }] },
											immunity:   { maximum: 8, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}] },
											speed:      { maximum: 6, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 3 }, { name: "run", maximum: 2, condition: 0 }, { name: "jump", maximum: 2, condition: 0 }, { name: "swim", maximum: 1, condition: 0 }, { name: "dodge", maximum: 2, condition: 0 }] }
										},
										items: [
											{name:"stonebow",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"missile"}],weight:3,hands:2,fuel:2,materials:"wood, string, metal",cost:70,description:"range: 50 ft",id:"lwxxxnluronoevbx"},
											{name:"glass orb",count:10,type:"ammunition",weapons:["sling","bomb","stonebow","gauss pistol"],weight:0.1,usage:[{statistic:"dexterity",skill:"missile",d6:3},{statistic:"strength",skill:"throw",d6:3}],hands:1,conditions:{bleeding:1},materials:"glass",cost:4,description:"shatters on impact",id:"sbkuydbixlpqyats"},
											{name:"short sword",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:5}],weight:2,hands:1,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:50,description:" ",id:"grwjcuryhftbylps"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"rope",count:1,weight:2,usage:[{statistic:"strength",skill:"climb",modifier:5},{statistic:"dexterity",skill:"crafting"}],fuel:2,materials:"string",cost:10,description:"10 feet; +5 climbing; helps with crafting",id:"vkafrmfqhqivchjp"},
											{name:"spyglass",count:1,weight:1,hands:1,usage:[{statistic:"perception",skill:"sight",modifier:10},{statistic:"dexterity",skill:"missile",modifier:5}],materials:"wood, metal, glass",cost:35,description:"for viewing far distances (+10 sight) and accuracy with aim (+5 missile)",id:"hhozcolalgovetay"},
										]
									},
									{
										info: {
											name: "dwarf strong",
											demographics: { race: "dwarf", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Standard fantasy dwarf, with short stature, powerful strength, and an affinity for geology, masonry, and war.",
											status: { points: 0, burden: 33.5, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 7, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 6, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 4, condition: 0 }, { name: "taste", unremovable: true, maximum: 4, condition: 0 }, { name: "touch", unremovable: true, maximum: 7, condition: 0 }, { name: "night_vision", maximum: 2, condition: 0, animals: true }] },
											memory:     { maximum: 5, damage: 0, condition: 0, skills: [{ name: "lang_dwarf", maximum: 7, condition: 0 }] },
											logic:      { maximum: 4, damage: 0, condition: 0, skills: [{ name: "remain_calm", maximum: 5, condition: 0 }] },
											strength:   { maximum: 10, damage: 0, condition: 0, skills: [{ name: "melee", combat: true, maximum: 5, condition: 0 }, { name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 3 }, { name: "carry", maximum: 5, condition: 0 }, { name: "throw", maximum: 4, condition: 0, combat: true }] },
											dexterity:  { maximum: 8, damage: 0, condition: 0, skills: [{ name: "fencing", combat: true, maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "crafting", maximum: 3, condition: 0 }] },
											immunity:   { maximum: 7, damage: 0, condition: 0, skills: [{ name: "pain_tolerance", maximum: 5, condition: 0 }, { name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}] },
											speed:      { maximum: 8, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 3 }, { name: "run", maximum: 2, condition: 0 }, { name: "jump", maximum: 2, condition: 0 }, { name: "swim", maximum: 1, condition: 0 }, { name: "dodge", maximum: 2, condition: 0 }] }
										},
										items: [
											{name:"axe",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:5},{statistic:"strength",skill:"throw",d6:5}],weight:2,hands:1,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:50,description:" ",id:"yeqfovhaquvlzuus"},
											{name:"long staff",count:1,type:"weapon",usage:[{statistic:"strength",skill:"melee",d6:6}],weight:6,hands:2,fuel:4,materials:"wood",cost:60,description:" ",id:"aunayoybjrwjejnn"},
											{name:"wooden shield",count:1,type:"shield",d6:4,weight:10,fuel:3,hands:1,usage:[{statistic:"strength",skill:"melee",d6:3}],materials:"wood",cost:50,description:" ",id:"azwvgxetbvshdxtj"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"concoction of smoke",count:1,type:"potion",weight:0.5,usage:[{statistic:"strength",skill:"throw",d6:3}],"recipe":{"w":10,"r":4,"g":2,"b":2},"conditions":{"smoke":2},cost:16,description:"causes smoke in 5-ft square and surrounding 5-ft squares for 2d6 rounds",id:"qiqrjziyuizptbmh"},
										]
									},
									{
										info: {
											name: "dwarf child",
											demographics: { race: "dwarf", age: 15, sex: "", height: 3.5, weight: 75 },
											description: "Standard fantasy dwarf, with short stature, powerful strength, and an affinity for geology, masonry, and war.",
											status: { points: 0, burden: 3, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 6, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 6, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 4, condition: 0 }, { name: "taste", unremovable: true, maximum: 4, condition: 0 }, { name: "touch", unremovable: true, maximum: 7, condition: 0 }, { name: "night_vision", maximum: 2, condition: 0, animals: true }] },
											memory:     { maximum: 4, damage: 0, condition: 0, skills: [{ name: "lang_dwarf", maximum: 7, condition: 0 }] },
											logic:      { maximum: 3, damage: 0, condition: 0, skills: [] },
											strength:   { maximum: 7, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 3 }, { name: "carry", maximum: 5, condition: 0 }, { name: "throw", maximum: 4, condition: 0, combat: true }] },
											dexterity:  { maximum: 6, damage: 0, condition: 0, skills: [{ name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "crafting", maximum: 3, condition: 0 }] },
											immunity:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}] },
											speed:      { maximum: 3, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 3 }, { name: "run", maximum: 2, condition: 0 }, { name: "jump", maximum: 2, condition: 0 }, { name: "swim", maximum: 1, condition: 0 }, { name: "dodge", maximum: 2, condition: 0 }] }
										},
										items: [
											{name:"clothes",count:1,type:"armor",armorType:"body",d6:1,weight:1,fuel:2,materials:"cloth",cost:10,description:" ",id:"rbxzkdzgldgzqlok"},
											{name:"shoes",count:1,type:"armor",armorType:"legs",d6:1,weight:2,fuel:2,materials:"cloth",cost:10,description:" ",id:"kjlbatbkkevyzedf"},
										]
									},
									{
										info: {
											name: "dwarf boss",
											demographics: { race: "dwarf", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Standard fantasy dwarf, with short stature, powerful strength, and an affinity for geology, masonry, and war.",
											status: { points: 0, burden: 52, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 10, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 6, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 4, condition: 0 }, { name: "taste", unremovable: true, maximum: 4, condition: 0 }, { name: "touch", unremovable: true, maximum: 7, condition: 0 }, { name: "night_vision", maximum: 2, condition: 0, animals: true }] },
											memory:     { maximum: 8, damage: 0, condition: 0, skills: [{ name: "lang_dwarf", maximum: 7, condition: 0 }] },
											logic:      { maximum: 9, damage: 0, condition: 0, skills: [{ name: "intimidate", maximum: 7, condition: 0, charisma: true, counters: ["remain_calm"] }, { name: "judge_character", maximum: 7, condition: 0 }] },
											strength:   { maximum: 10, damage: 0, condition: 0, skills: [{ name: "melee", combat: true, maximum: 7, condition: 0 }, { name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 3 }, { name: "carry", maximum: 5, condition: 0 }, { name: "throw", maximum: 4, condition: 0, combat: true }] },
											dexterity:  { maximum: 9, damage: 0, condition: 0, skills: [{ name: "fencing", combat: true, maximum: 7, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "crafting", maximum: 3, condition: 0 }] },
											immunity:   { maximum: 9, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}] },
											speed:      { maximum: 8, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 3 }, { name: "run", maximum: 2, condition: 0 }, { name: "jump", maximum: 2, condition: 0 }, { name: "swim", maximum: 1, condition: 0 }, { name: "dodge", maximum: 2, condition: 0 }] }
										},
										items: [
											{name:"long sword",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:7}],weight:5,hands:2,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:80,description:" ",id:"ystexytmmlneqixo"},
											{name:"warhammer",count:1,type:"weapon",usage:[{statistic:"strength",skill:"melee",d6:7}],weight:6,hands:2,magnetic:true,materials:"leather, metal",cost:80,description:" ",id:"dzgovmpmngryoart"},
											{name:"chainmail armor",count:1,type:"armor",armorType:"body",d6:5,weight:25,magnetic:true,materials:"metal",cost:70,description:"conducts electricity",id:"cwmbegsjhgbqwosn"},
											{name:"chainmail helmet",count:1,type:"armor",armorType:"head",d6:5,weight:5,magnetic:true,materials:"metal",cost:20,description:"conducts electricity",id:"wkthclgbkefjqqud"},
											{name:"chainmail gloves",count:1,type:"armor",armorType:"hands",d6:5,weight:4,magnetic:true,materials:"metal",cost:20,description:"conducts electricity",id:"wcsmkdyfecarrovp"},
											{name:"chainmail boots",count:1,type:"armor",armorType:"legs",d6:5,weight:6,magnetic:true,materials:"metal",cost:40,description:"conducts electricity",id:"ufadgpukpeambjnx"},
											{name:"potion of strong healing",count:1,type:"healing",weight:0.5,"recipe":{"w":10,"r":0,"g":7,"b":0},d6:2,"conditions":{"bleeding":0},cost:14,description:"removes 2d6 damage",id:"fgbobzjuccaaqvfj"},
											{name:"potion of flashbang",count:1,type:"potion",weight:0.5,"recipe":{"w":10,"r":6,"g":0,"b":6},d6:3,"conditions":{"loud_noise":1,"blinding_light":1},cost:24,description:"causes loud noise and blinding light for 1d6 rounds; explosion causes 3d6 damage to 5-ft square and surrounding 5-ft squares",id:"qsgqgreexyztuwmy"}
										]
									},

								// halfling
									{
										info: {
											name: "halfling smart",
											demographics: { race: "halfling", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Standard fantasy halfling/hobbit, with pointy ears, hairy feet, half height, and a love of food, gardening, music, and simple pleasures.",
											status: { points: 0, burden: 27, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 7, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 5, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 5, condition: 0 }, { name: "taste", unremovable: true, maximum: 7, condition: 0 }, { name: "touch", unremovable: true, maximum: 4, condition: 0 }] },
											memory:     { maximum: 10, damage: 0, condition: 0, skills: [{ name: "lang_halfling", maximum: 7, condition: 0 }, { name: "medicine", maximum: 5, condition: 0 }] },
											logic:      { maximum: 9, damage: 0, condition: 0, skills: [{ name: "mechanics", maximum: 5, condition: 0 }, { name: "remain_calm", maximum: 2, condition: 0 }] },
											strength:   { maximum: 5, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 2, condition: 0 }, { name: "throw", maximum: 3, condition: 0, combat: true }, { name: "climb", maximum: 2, condition: 0 }] },
											dexterity:  { maximum: 6, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 5, condition: 0 }, { name: "knifing", combat: true, maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 7, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}] },
											speed:      { maximum: 5, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 3, condition: 0 }, { name: "jump", maximum: 4, condition: 0 }, { name: "swim", maximum: 2, condition: 0 }, { name: "sneak", maximum: 3, condition: 0 }] }
										},
										items: [
											{name:"stonebow",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"missile"}],weight:3,hands:2,fuel:2,materials:"wood, string, metal",cost:70,description:"range: 50 ft",id:"lwxxxnluronoevbx"},
											{name:"rock orb",count:10,type:"ammunition",weapons:["sling","bomb","stonebow","gauss pistol"],weight:0.5,usage:[{statistic:"dexterity",skill:"missile",d6:3},{statistic:"strength",skill:"throw",d6:3}],hands:1,materials:"stone",cost:1,description:" ",id:"blcgrpuidapffjvr"},
											{name:"dagger",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"knifing",d6:3},{statistic:"strength",skill:"throw",d6:3}],weight:1,hands:1,magnetic:true,conditions:{bleeding:1},materials:"metal",cost:10,description:" ",id:"zexbxnhhkntluxke"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"book",count:1,weight:3,hands:1,usage:[{statistic:"memory",skill:"astronomy",modifier:5}],fuel:1,materials:"paper",cost:5,description:"+5 specific memory/logic skill (mathematics, alchemy, zoology, etc.)",id:"ctpvtxpllbiibxhw"},
										]
									},
									{
										info: {
											name: "halfling skilled",
											demographics: { race: "halfling", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Standard fantasy halfling/hobbit, with pointy ears, hairy feet, half height, and a love of food, gardening, music, and simple pleasures.",
											status: { points: 0, burden: 24, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 7, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 5, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 5, condition: 0 }, { name: "taste", unremovable: true, maximum: 7, condition: 0 }, { name: "touch", unremovable: true, maximum: 4, condition: 0 }] },
											memory:     { maximum: 8, damage: 0, condition: 0, skills: [{ name: "lang_halfling", maximum: 7, condition: 0 }] },
											logic:      { maximum: 7, damage: 0, condition: 0, skills: [{ name: "pattern_recognition", maximum: 5, condition: 0 }, { name: "remain_calm", maximum: 2, condition: 0 }] },
											strength:   { maximum: 5, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 2, condition: 0 }, { name: "throw", maximum: 3, condition: 0, combat: true }, { name: "climb", maximum: 2, condition: 0 }] },
											dexterity:  { maximum: 9, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 5, condition: 0 }, { name: "fencing", combat: true, maximum: 5, condition: 0 }, { name: "escape_bonds", maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 7, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}] },
											speed:      { maximum: 6, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 3, condition: 0 }, { name: "jump", maximum: 4, condition: 0 }, { name: "swim", maximum: 2, condition: 0 }, { name: "sneak", maximum: 3, condition: 0 }] }
										},
										items: [
											{name:"stonebow",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"missile"}],weight:3,hands:2,fuel:2,materials:"wood, string, metal",cost:70,description:"range: 50 ft",id:"lwxxxnluronoevbx"},
											{name:"glass orb",count:10,type:"ammunition",weapons:["sling","bomb","stonebow","gauss pistol"],weight:0.1,usage:[{statistic:"dexterity",skill:"missile",d6:3},{statistic:"strength",skill:"throw",d6:3}],hands:1,conditions:{bleeding:1},materials:"glass",cost:4,description:"shatters on impact",id:"sbkuydbixlpqyats"},
											{name:"short sword",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:5}],weight:2,hands:1,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:50,description:" ",id:"grwjcuryhftbylps"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"rope",count:1,weight:2,usage:[{statistic:"strength",skill:"climb",modifier:5},{statistic:"dexterity",skill:"crafting"}],fuel:2,materials:"string",cost:10,description:"10 feet; +5 climbing; helps with crafting",id:"vkafrmfqhqivchjp"},
											{name:"spyglass",count:1,weight:1,hands:1,usage:[{statistic:"perception",skill:"sight",modifier:10},{statistic:"dexterity",skill:"missile",modifier:5}],materials:"wood, metal, glass",cost:35,description:"for viewing far distances (+10 sight) and accuracy with aim (+5 missile)",id:"hhozcolalgovetay"},
										]
									},
									{
										info: {
											name: "halfling strong",
											demographics: { race: "halfling", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Standard fantasy halfling/hobbit, with pointy ears, hairy feet, half height, and a love of food, gardening, music, and simple pleasures.",
											status: { points: 0, burden: 33.5, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 8, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 5, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 5, condition: 0 }, { name: "taste", unremovable: true, maximum: 7, condition: 0 }, { name: "touch", unremovable: true, maximum: 4, condition: 0 }] },
											memory:     { maximum: 6, damage: 0, condition: 0, skills: [{ name: "lang_halfling", maximum: 7, condition: 0 }] },
											logic:      { maximum: 5, damage: 0, condition: 0, skills: [{ name: "remain_calm", maximum: 2, condition: 0 }] },
											strength:   { maximum: 8, damage: 0, condition: 0, skills: [{ name: "archery", maximum: 5, condition: 0 }, { name: "melee", combat: true, maximum: 5, condition: 0 }, { name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 2, condition: 0 }, { name: "throw", maximum: 3, condition: 0, combat: true }, { name: "climb", maximum: 2, condition: 0 }] },
											dexterity:  { maximum: 8, damage: 0, condition: 0, skills: [{ name: "fencing", combat: true, maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "pain_tolerance", maximum: 5, condition: 0 }, { name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}] },
											speed:      { maximum: 8, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 3, condition: 0 }, { name: "jump", maximum: 4, condition: 0 }, { name: "swim", maximum: 2, condition: 0 }, { name: "sneak", maximum: 3, condition: 0 }] }
										},
										items: [
											{name:"axe",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:5},{statistic:"strength",skill:"throw",d6:5}],weight:2,hands:1,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:50,description:" ",id:"yeqfovhaquvlzuus"},
											{name:"long staff",count:1,type:"weapon",usage:[{statistic:"strength",skill:"melee",d6:6}],weight:6,hands:2,fuel:4,materials:"wood",cost:60,description:" ",id:"aunayoybjrwjejnn"},
											{name:"wooden shield",count:1,type:"shield",d6:4,weight:10,fuel:3,hands:1,usage:[{statistic:"strength",skill:"melee",d6:3}],materials:"wood",cost:50,description:" ",id:"azwvgxetbvshdxtj"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"concoction of smoke",count:1,type:"potion",weight:0.5,usage:[{statistic:"strength",skill:"throw",d6:3}],"recipe":{"w":10,"r":4,"g":2,"b":2},"conditions":{"smoke":2},cost:16,description:"causes smoke in 5-ft square and surrounding 5-ft squares for 2d6 rounds",id:"qiqrjziyuizptbmh"},
										]
									},
									{
										info: {
											name: "halfling child",
											demographics: { race: "halfling", age: 10, sex: "", height: 3, weight: 50 },
											description: "Standard fantasy halfling/hobbit, with pointy ears, hairy feet, half height, and a love of food, gardening, music, and simple pleasures.",
											status: { points: 0, burden: 3, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 7, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 5, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 5, condition: 0 }, { name: "taste", unremovable: true, maximum: 7, condition: 0 }, { name: "touch", unremovable: true, maximum: 4, condition: 0 }] },
											memory:     { maximum: 5, damage: 0, condition: 0, skills: [{ name: "lang_halfling", maximum: 7, condition: 0 }] },
											logic:      { maximum: 4, damage: 0, condition: 0, skills: [{ name: "remain_calm", maximum: 2, condition: 0 }] },
											strength:   { maximum: 3, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 2, condition: 0 }, { name: "throw", maximum: 3, condition: 0, combat: true }, { name: "climb", maximum: 2, condition: 0 }] },
											dexterity:  { maximum: 6, damage: 0, condition: 0, skills: [{ name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}] },
											speed:      { maximum: 4, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 3, condition: 0 }, { name: "jump", maximum: 4, condition: 0 }, { name: "swim", maximum: 2, condition: 0 }, { name: "sneak", maximum: 3, condition: 0 }] }
										},
										items: [
											{name:"clothes",count:1,type:"armor",armorType:"body",d6:1,weight:1,fuel:2,materials:"cloth",cost:10,description:" ",id:"rbxzkdzgldgzqlok"},
											{name:"shoes",count:1,type:"armor",armorType:"legs",d6:1,weight:2,fuel:2,materials:"cloth",cost:10,description:" ",id:"kjlbatbkkevyzedf"},
										]
									},
									{
										info: {
											name: "halfling boss",
											demographics: { race: "halfling", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Standard fantasy halfling/hobbit, with pointy ears, hairy feet, half height, and a love of food, gardening, music, and simple pleasures.",
											status: { points: 0, burden: 52, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 10, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 5, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 5, condition: 0 }, { name: "taste", unremovable: true, maximum: 7, condition: 0 }, { name: "touch", unremovable: true, maximum: 4, condition: 0 }] },
											memory:     { maximum: 10, damage: 0, condition: 0, skills: [{ name: "lang_halfling", maximum: 7, condition: 0 }] },
											logic:      { maximum: 9, damage: 0, condition: 0, skills: [{ name: "intimidate", maximum: 7, condition: 0, charisma: true, counters: ["remain_calm"] }, { name: "judge_character", maximum: 7, condition: 0 }, { name: "remain_calm", maximum: 2, condition: 0 }] },
											strength:   { maximum: 7, damage: 0, condition: 0, skills: [{ name: "melee", combat: true, maximum: 7, condition: 0 }, { name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 2, condition: 0 }, { name: "throw", maximum: 3, condition: 0, combat: true }, { name: "climb", maximum: 2, condition: 0 }] },
											dexterity:  { maximum: 9, damage: 0, condition: 0, skills: [{ name: "fencing", combat: true, maximum: 7, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 10, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}] },
											speed:      { maximum: 8, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 3, condition: 0 }, { name: "jump", maximum: 4, condition: 0 }, { name: "swim", maximum: 2, condition: 0 }, { name: "sneak", maximum: 3, condition: 0 }] }
										},
										items: [
											{name:"long sword",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:7}],weight:5,hands:2,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:80,description:" ",id:"ystexytmmlneqixo"},
											{name:"warhammer",count:1,type:"weapon",usage:[{statistic:"strength",skill:"melee",d6:7}],weight:6,hands:2,magnetic:true,materials:"leather, metal",cost:80,description:" ",id:"dzgovmpmngryoart"},
											{name:"chainmail armor",count:1,type:"armor",armorType:"body",d6:5,weight:25,magnetic:true,materials:"metal",cost:70,description:"conducts electricity",id:"cwmbegsjhgbqwosn"},
											{name:"chainmail helmet",count:1,type:"armor",armorType:"head",d6:5,weight:5,magnetic:true,materials:"metal",cost:20,description:"conducts electricity",id:"wkthclgbkefjqqud"},
											{name:"chainmail gloves",count:1,type:"armor",armorType:"hands",d6:5,weight:4,magnetic:true,materials:"metal",cost:20,description:"conducts electricity",id:"wcsmkdyfecarrovp"},
											{name:"chainmail boots",count:1,type:"armor",armorType:"legs",d6:5,weight:6,magnetic:true,materials:"metal",cost:40,description:"conducts electricity",id:"ufadgpukpeambjnx"},
											{name:"potion of strong healing",count:1,type:"healing",weight:0.5,"recipe":{"w":10,"r":0,"g":7,"b":0},d6:2,"conditions":{"bleeding":0},cost:14,description:"removes 2d6 damage",id:"fgbobzjuccaaqvfj"},
											{name:"potion of flashbang",count:1,type:"potion",weight:0.5,"recipe":{"w":10,"r":6,"g":0,"b":6},d6:3,"conditions":{"loud_noise":1,"blinding_light":1},cost:24,description:"causes loud noise and blinding light for 1d6 rounds; explosion causes 3d6 damage to 5-ft square and surrounding 5-ft squares",id:"qsgqgreexyztuwmy"}
										]
									},

								// gnome
									{
										info: {
											name: "gnome smart",
											demographics: { race: "gnome", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Standard fantasy gnome, with earth tones and short builds, long beards and pointy hats, and a focus on trickery, illusion, and crafting.",
											status: { points: 0, burden: 27, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 10, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 7, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 6, condition: 0 }, { name: "taste", unremovable: true, maximum: 3, condition: 0 }, { name: "touch", unremovable: true, maximum: 5, condition: 0 }] },
											memory:     { maximum: 8, damage: 0, condition: 0, skills: [{ name: "lang_gnome", maximum: 7, condition: 0 }, { name: "medicine", maximum: 5, condition: 0 }] },
											logic:      { maximum: 9, damage: 0, condition: 0, skills: [{ name: "mechanics", maximum: 5, condition: 0 }, { name: "persuade", maximum: 2, condition: 0, charisma: true, counters:["judge_character"] }] },
											strength:   { maximum: 4, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 2, condition: 0 }, { name: "throw", maximum: 4, condition: 0, combat: true }] },
											dexterity:  { maximum: 6, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 5, condition: 0 }, { name: "knifing", combat: true, maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "crafting", maximum: 3, condition: 0 }] },
											immunity:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}] },
											speed:      { maximum: 6, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 2, condition: 0 }, { name: "jump", maximum: 3, condition: 0 }, { name: "swim", maximum: 3, condition: 0 }, { name: "dodge", maximum: 2, condition: 0 }] }
										},
										items: [
											{name:"stonebow",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"missile"}],weight:3,hands:2,fuel:2,materials:"wood, string, metal",cost:70,description:"range: 50 ft",id:"lwxxxnluronoevbx"},
											{name:"rock orb",count:10,type:"ammunition",weapons:["sling","bomb","stonebow","gauss pistol"],weight:0.5,usage:[{statistic:"dexterity",skill:"missile",d6:3},{statistic:"strength",skill:"throw",d6:3}],hands:1,materials:"stone",cost:1,description:" ",id:"blcgrpuidapffjvr"},
											{name:"dagger",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"knifing",d6:3},{statistic:"strength",skill:"throw",d6:3}],weight:1,hands:1,magnetic:true,conditions:{bleeding:1},materials:"metal",cost:10,description:" ",id:"zexbxnhhkntluxke"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"book",count:1,weight:3,hands:1,usage:[{statistic:"memory",skill:"astronomy",modifier:5}],fuel:1,materials:"paper",cost:5,description:"+5 specific memory/logic skill (mathematics, alchemy, zoology, etc.)",id:"ctpvtxpllbiibxhw"},
										]
									},
									{
										info: {
											name: "gnome skilled",
											demographics: { race: "gnome", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Standard fantasy gnome, with earth tones and short builds, long beards and pointy hats, and a focus on trickery, illusion, and crafting.",
											status: { points: 0, burden: 24, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 10, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 7, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 6, condition: 0 }, { name: "taste", unremovable: true, maximum: 3, condition: 0 }, { name: "touch", unremovable: true, maximum: 5, condition: 0 }] },
											memory:     { maximum: 6, damage: 0, condition: 0, skills: [{ name: "lang_gnome", maximum: 7, condition: 0 }] },
											logic:      { maximum: 6, damage: 0, condition: 0, skills: [{ name: "pattern_recognition", maximum: 5, condition: 0 }, { name: "persuade", maximum: 2, condition: 0, charisma: true, counters:["judge_character"] }] },
											strength:   { maximum: 5, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 2, condition: 0 }, { name: "throw", maximum: 4, condition: 0, combat: true }] },
											dexterity:  { maximum: 9, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 5, condition: 0 }, { name: "fencing", combat: true, maximum: 5, condition: 0 }, { name: "escape_bonds", maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "crafting", maximum: 3, condition: 0 }] },
											immunity:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}] },
											speed:      { maximum: 7, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 2, condition: 0 }, { name: "jump", maximum: 3, condition: 0 }, { name: "swim", maximum: 3, condition: 0 }, { name: "dodge", maximum: 2, condition: 0 }] }
										},
										items: [
											{name:"stonebow",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"missile"}],weight:3,hands:2,fuel:2,materials:"wood, string, metal",cost:70,description:"range: 50 ft",id:"lwxxxnluronoevbx"},
											{name:"glass orb",count:10,type:"ammunition",weapons:["sling","bomb","stonebow","gauss pistol"],weight:0.1,usage:[{statistic:"dexterity",skill:"missile",d6:3},{statistic:"strength",skill:"throw",d6:3}],hands:1,conditions:{bleeding:1},materials:"glass",cost:4,description:"shatters on impact",id:"sbkuydbixlpqyats"},
											{name:"short sword",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:5}],weight:2,hands:1,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:50,description:" ",id:"grwjcuryhftbylps"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"rope",count:1,weight:2,usage:[{statistic:"strength",skill:"climb",modifier:5},{statistic:"dexterity",skill:"crafting"}],fuel:2,materials:"string",cost:10,description:"10 feet; +5 climbing; helps with crafting",id:"vkafrmfqhqivchjp"},
											{name:"spyglass",count:1,weight:1,hands:1,usage:[{statistic:"perception",skill:"sight",modifier:10},{statistic:"dexterity",skill:"missile",modifier:5}],materials:"wood, metal, glass",cost:35,description:"for viewing far distances (+10 sight) and accuracy with aim (+5 missile)",id:"hhozcolalgovetay"},
										]
									},
									{
										info: {
											name: "gnome strong",
											demographics: { race: "gnome", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Standard fantasy gnome, with earth tones and short builds, long beards and pointy hats, and a focus on trickery, illusion, and crafting.",
											status: { points: 0, burden: 33.5, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 10, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 7, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 6, condition: 0 }, { name: "taste", unremovable: true, maximum: 3, condition: 0 }, { name: "touch", unremovable: true, maximum: 5, condition: 0 }] },
											memory:     { maximum: 5, damage: 0, condition: 0, skills: [{ name: "lang_gnome", maximum: 7, condition: 0 }] },
											logic:      { maximum: 5, damage: 0, condition: 0, skills: [{ name: "remain_calm", maximum: 5, condition: 0 }, { name: "persuade", maximum: 2, condition: 0, charisma: true, counters:["judge_character"] }] },
											strength:   { maximum: 7, damage: 0, condition: 0, skills: [{ name: "melee", combat: true, maximum: 5, condition: 0 }, { name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 2, condition: 0 }, { name: "throw", maximum: 4, condition: 0, combat: true }] },
											dexterity:  { maximum: 8, damage: 0, condition: 0, skills: [{ name: "fencing", combat: true, maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "crafting", maximum: 3, condition: 0 }] },
											immunity:   { maximum: 7, damage: 0, condition: 0, skills: [{ name: "pain_tolerance", maximum: 5, condition: 0 }, { name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}] },
											speed:      { maximum: 7, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 2, condition: 0 }, { name: "jump", maximum: 3, condition: 0 }, { name: "swim", maximum: 3, condition: 0 }, { name: "dodge", maximum: 2, condition: 0 }] }
										},
										items: [
											{name:"axe",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:5},{statistic:"strength",skill:"throw",d6:5}],weight:2,hands:1,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:50,description:" ",id:"yeqfovhaquvlzuus"},
											{name:"long staff",count:1,type:"weapon",usage:[{statistic:"strength",skill:"melee",d6:6}],weight:6,hands:2,fuel:4,materials:"wood",cost:60,description:" ",id:"aunayoybjrwjejnn"},
											{name:"wooden shield",count:1,type:"shield",d6:4,weight:10,fuel:3,hands:1,usage:[{statistic:"strength",skill:"melee",d6:3}],materials:"wood",cost:50,description:" ",id:"azwvgxetbvshdxtj"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"concoction of smoke",count:1,type:"potion",weight:0.5,usage:[{statistic:"strength",skill:"throw",d6:3}],"recipe":{"w":10,"r":4,"g":2,"b":2},"conditions":{"smoke":2},cost:16,description:"causes smoke in 5-ft square and surrounding 5-ft squares for 2d6 rounds",id:"qiqrjziyuizptbmh"},
										]
									},
									{
										info: {
											name: "gnome child",
											demographics: { race: "gnome", age: 10, sex: "", height: 2.5, weight: 40 },
											description: "Standard fantasy gnome, with earth tones and short builds, long beards and pointy hats, and a focus on trickery, illusion, and crafting.",
											status: { points: 0, burden: 3, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 10, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 7, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 6, condition: 0 }, { name: "taste", unremovable: true, maximum: 3, condition: 0 }, { name: "touch", unremovable: true, maximum: 5, condition: 0 }] },
											memory:     { maximum: 4, damage: 0, condition: 0, skills: [{ name: "lang_gnome", maximum: 7, condition: 0 }] },
											logic:      { maximum: 4, damage: 0, condition: 0, skills: [{ name: "persuade", maximum: 2, condition: 0, charisma: true, counters:["judge_character"] }] },
											strength:   { maximum: 3, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 2, condition: 0 }, { name: "throw", maximum: 4, condition: 0, combat: true }] },
											dexterity:  { maximum: 5, damage: 0, condition: 0, skills: [{ name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "crafting", maximum: 3, condition: 0 }] },
											immunity:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}] },
											speed:      { maximum: 3, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 2, condition: 0 }, { name: "jump", maximum: 3, condition: 0 }, { name: "swim", maximum: 3, condition: 0 }, { name: "dodge", maximum: 2, condition: 0 }] }
										},
										items: [
											{name:"clothes",count:1,type:"armor",armorType:"body",d6:1,weight:1,fuel:2,materials:"cloth",cost:10,description:" ",id:"rbxzkdzgldgzqlok"},
											{name:"shoes",count:1,type:"armor",armorType:"legs",d6:1,weight:2,fuel:2,materials:"cloth",cost:10,description:" ",id:"kjlbatbkkevyzedf"},
										]
									},
									{
										info: {
											name: "gnome boss",
											demographics: { race: "gnome", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Standard fantasy gnome, with earth tones and short builds, long beards and pointy hats, and a focus on trickery, illusion, and crafting.",
											status: { points: 0, burden: 52, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 10, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 7, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 6, condition: 0 }, { name: "taste", unremovable: true, maximum: 3, condition: 0 }, { name: "touch", unremovable: true, maximum: 5, condition: 0 }] },
											memory:     { maximum: 9, damage: 0, condition: 0, skills: [{ name: "lang_gnome", maximum: 7, condition: 0 }] },
											logic:      { maximum: 10, damage: 0, condition: 0, skills: [{ name: "intimidate", maximum: 7, condition: 0, charisma: true, counters: ["remain_calm"] }, { name: "judge_character", maximum: 7, condition: 0 }, { name: "persuade", maximum: 2, condition: 0, charisma: true, counters:["judge_character"] }] },
											strength:   { maximum: 7, damage: 0, condition: 0, skills: [{ name: "melee", combat: true, maximum: 7, condition: 0 }, { name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 2, condition: 0 }, { name: "throw", maximum: 4, condition: 0, combat: true }] },
											dexterity:  { maximum: 9, damage: 0, condition: 0, skills: [{ name: "fencing", combat: true, maximum: 7, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "crafting", maximum: 3, condition: 0 }] },
											immunity:   { maximum: 10, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}] },
											speed:      { maximum: 8, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 2, condition: 0 }, { name: "jump", maximum: 3, condition: 0 }, { name: "swim", maximum: 3, condition: 0 }, { name: "dodge", maximum: 2, condition: 0 }] }
										},
										items: [
											{name:"long sword",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:7}],weight:5,hands:2,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:80,description:" ",id:"ystexytmmlneqixo"},
											{name:"warhammer",count:1,type:"weapon",usage:[{statistic:"strength",skill:"melee",d6:7}],weight:6,hands:2,magnetic:true,materials:"leather, metal",cost:80,description:" ",id:"dzgovmpmngryoart"},
											{name:"chainmail armor",count:1,type:"armor",armorType:"body",d6:5,weight:25,magnetic:true,materials:"metal",cost:70,description:"conducts electricity",id:"cwmbegsjhgbqwosn"},
											{name:"chainmail helmet",count:1,type:"armor",armorType:"head",d6:5,weight:5,magnetic:true,materials:"metal",cost:20,description:"conducts electricity",id:"wkthclgbkefjqqud"},
											{name:"chainmail gloves",count:1,type:"armor",armorType:"hands",d6:5,weight:4,magnetic:true,materials:"metal",cost:20,description:"conducts electricity",id:"wcsmkdyfecarrovp"},
											{name:"chainmail boots",count:1,type:"armor",armorType:"legs",d6:5,weight:6,magnetic:true,materials:"metal",cost:40,description:"conducts electricity",id:"ufadgpukpeambjnx"},
											{name:"potion of strong healing",count:1,type:"healing",weight:0.5,"recipe":{"w":10,"r":0,"g":7,"b":0},d6:2,"conditions":{"bleeding":0},cost:14,description:"removes 2d6 damage",id:"fgbobzjuccaaqvfj"},
											{name:"potion of flashbang",count:1,type:"potion",weight:0.5,"recipe":{"w":10,"r":6,"g":0,"b":6},d6:3,"conditions":{"loud_noise":1,"blinding_light":1},cost:24,description:"causes loud noise and blinding light for 1d6 rounds; explosion causes 3d6 damage to 5-ft square and surrounding 5-ft squares",id:"qsgqgreexyztuwmy"}
										]
									},

								// tiefling
									{
										info: {
											name: "tiefling smart",
											demographics: { race: "tiefling", age: 25, sex: "", height: 5, weight: 150 },
											description: "Standard fantasy tiefling, with pinkish skin, two horns, night vision, a prehensile tail, and a mysterious and tricky nature.",
											status: { points: 0, burden: 27, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 7, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 4, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 7, condition: 0 }, { name: "taste", unremovable: true, maximum: 4, condition: 0 }, { name: "touch", unremovable: true, maximum: 6, condition: 0 }, { name: "night_vision", maximum: 3, condition: 0, animals: true }] },
											memory:     { maximum: 7, damage: 0, condition: 0, skills: [{ name: "lang_tiefling", maximum: 7, condition: 0 }, { name: "medicine", maximum: 5, condition: 0 }] },
											logic:      { maximum: 9, damage: 0, condition: 0, skills: [{ name: "mechanics", maximum: 5, condition: 0 }, { name: "intimidate", maximum: 2, condition: 0, charisma: true, counters: ["remain_calm"] }] },
											strength:   { maximum: 5, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 2, condition: 0 }, { name: "throw", maximum: 4, condition: 0, combat: true }] },
											dexterity:  { maximum: 7, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 5, condition: 0 }, { name: "knifing", combat: true, maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 8, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}, { name: "temperature_resistance", maximum: 14, condition: 0, animals: true }] },
											speed:      { maximum: 6, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 3, condition: 0 }, { name: "jump", maximum: 5, condition: 0 }, { name: "swim", maximum: 0, condition: 0 }, { name: "sneak", maximum: 2, condition: 0 }] }
										},
										items: [
											{name:"stonebow",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"missile"}],weight:3,hands:2,fuel:2,materials:"wood, string, metal",cost:70,description:"range: 50 ft",id:"lwxxxnluronoevbx"},
											{name:"rock orb",count:10,type:"ammunition",weapons:["sling","bomb","stonebow","gauss pistol"],weight:0.5,usage:[{statistic:"dexterity",skill:"missile",d6:3},{statistic:"strength",skill:"throw",d6:3}],hands:1,materials:"stone",cost:1,description:" ",id:"blcgrpuidapffjvr"},
											{name:"dagger",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"knifing",d6:3},{statistic:"strength",skill:"throw",d6:3}],weight:1,hands:1,magnetic:true,conditions:{bleeding:1},materials:"metal",cost:10,description:" ",id:"zexbxnhhkntluxke"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"book",count:1,weight:3,hands:1,usage:[{statistic:"memory",skill:"astronomy",modifier:5}],fuel:1,materials:"paper",cost:5,description:"+5 specific memory/logic skill (mathematics, alchemy, zoology, etc.)",id:"ctpvtxpllbiibxhw"},
										]
									},
									{
										info: {
											name: "tiefling skilled",
											demographics: { race: "tiefling", age: 25, sex: "", height: 5, weight: 150 },
											description: "Standard fantasy tiefling, with pinkish skin, two horns, night vision, a prehensile tail, and a mysterious and tricky nature.",
											status: { points: 0, burden: 24, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 7, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 4, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 7, condition: 0 }, { name: "taste", unremovable: true, maximum: 4, condition: 0 }, { name: "touch", unremovable: true, maximum: 6, condition: 0 }, { name: "night_vision", maximum: 3, condition: 0, animals: true }] },
											memory:     { maximum: 6, damage: 0, condition: 0, skills: [{ name: "lang_tiefling", maximum: 7, condition: 0 }] },
											logic:      { maximum: 7, damage: 0, condition: 0, skills: [{ name: "pattern_recognition", maximum: 5, condition: 0 }, { name: "intimidate", maximum: 2, condition: 0, charisma: true, counters: ["remain_calm"] }] },
											strength:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 2, condition: 0 }, { name: "throw", maximum: 4, condition: 0, combat: true }] },
											dexterity:  { maximum: 9, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 5, condition: 0 }, { name: "fencing", combat: true, maximum: 5, condition: 0 }, { name: "escape_bonds", maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 8, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}, { name: "temperature_resistance", maximum: 14, condition: 0, animals: true }] },
											speed:      { maximum: 6, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 3, condition: 0 }, { name: "jump", maximum: 5, condition: 0 }, { name: "swim", maximum: 0, condition: 0 }, { name: "sneak", maximum: 2, condition: 0 }] }
										},
										items: [
											{name:"stonebow",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"missile"}],weight:3,hands:2,fuel:2,materials:"wood, string, metal",cost:70,description:"range: 50 ft",id:"lwxxxnluronoevbx"},
											{name:"glass orb",count:10,type:"ammunition",weapons:["sling","bomb","stonebow","gauss pistol"],weight:0.1,usage:[{statistic:"dexterity",skill:"missile",d6:3},{statistic:"strength",skill:"throw",d6:3}],hands:1,conditions:{bleeding:1},materials:"glass",cost:4,description:"shatters on impact",id:"sbkuydbixlpqyats"},
											{name:"short sword",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:5}],weight:2,hands:1,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:50,description:" ",id:"grwjcuryhftbylps"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"rope",count:1,weight:2,usage:[{statistic:"strength",skill:"climb",modifier:5},{statistic:"dexterity",skill:"crafting"}],fuel:2,materials:"string",cost:10,description:"10 feet; +5 climbing; helps with crafting",id:"vkafrmfqhqivchjp"},
											{name:"spyglass",count:1,weight:1,hands:1,usage:[{statistic:"perception",skill:"sight",modifier:10},{statistic:"dexterity",skill:"missile",modifier:5}],materials:"wood, metal, glass",cost:35,description:"for viewing far distances (+10 sight) and accuracy with aim (+5 missile)",id:"hhozcolalgovetay"},
										]
									},
									{
										info: {
											name: "tiefling strong",
											demographics: { race: "tiefling", age: 25, sex: "", height: 5, weight: 150 },
											description: "Standard fantasy tiefling, with pinkish skin, two horns, night vision, a prehensile tail, and a mysterious and tricky nature.",
											status: { points: 0, burden: 33.5, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 6, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 4, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 7, condition: 0 }, { name: "taste", unremovable: true, maximum: 4, condition: 0 }, { name: "touch", unremovable: true, maximum: 6, condition: 0 }, { name: "night_vision", maximum: 3, condition: 0, animals: true }] },
											memory:     { maximum: 5, damage: 0, condition: 0, skills: [{ name: "lang_tiefling", maximum: 7, condition: 0 }] },
											logic:      { maximum: 7, damage: 0, condition: 0, skills: [{ name: "remain_calm", maximum: 5, condition: 0 }, { name: "intimidate", maximum: 2, condition: 0, charisma: true, counters: ["remain_calm"] }] },
											strength:   { maximum: 7, damage: 0, condition: 0, skills: [{ name: "melee", combat: true, maximum: 5, condition: 0 }, { name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 2, condition: 0 }, { name: "throw", maximum: 4, condition: 0, combat: true }] },
											dexterity:  { maximum: 6, damage: 0, condition: 0, skills: [{ name: "fencing", combat: true, maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 9, damage: 0, condition: 0, skills: [{ name: "pain_tolerance", maximum: 5, condition: 0 }, { name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}, { name: "temperature_resistance", maximum: 14, condition: 0, animals: true }] },
											speed:      { maximum: 8, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 3, condition: 0 }, { name: "jump", maximum: 5, condition: 0 }, { name: "swim", maximum: 0, condition: 0 }, { name: "sneak", maximum: 2, condition: 0 }] }
										},
										items: [
											{name:"axe",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:5},{statistic:"strength",skill:"throw",d6:5}],weight:2,hands:1,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:50,description:" ",id:"yeqfovhaquvlzuus"},
											{name:"long staff",count:1,type:"weapon",usage:[{statistic:"strength",skill:"melee",d6:6}],weight:6,hands:2,fuel:4,materials:"wood",cost:60,description:" ",id:"aunayoybjrwjejnn"},
											{name:"wooden shield",count:1,type:"shield",d6:4,weight:10,fuel:3,hands:1,usage:[{statistic:"strength",skill:"melee",d6:3}],materials:"wood",cost:50,description:" ",id:"azwvgxetbvshdxtj"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"concoction of smoke",count:1,type:"potion",weight:0.5,usage:[{statistic:"strength",skill:"throw",d6:3}],"recipe":{"w":10,"r":4,"g":2,"b":2},"conditions":{"smoke":2},cost:16,description:"causes smoke in 5-ft square and surrounding 5-ft squares for 2d6 rounds",id:"qiqrjziyuizptbmh"},
										]
									},
									{
										info: {
											name: "tiefling child",
											demographics: { race: "tiefling", age: 10, sex: "", height: 3.5, weight: 75 },
											description: "Standard fantasy tiefling, with pinkish skin, two horns, night vision, a prehensile tail, and a mysterious and tricky nature.",
											status: { points: 0, burden: 3, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 4, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 4, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 7, condition: 0 }, { name: "taste", unremovable: true, maximum: 4, condition: 0 }, { name: "touch", unremovable: true, maximum: 6, condition: 0 }, { name: "night_vision", maximum: 3, condition: 0, animals: true }] },
											memory:     { maximum: 4, damage: 0, condition: 0, skills: [{ name: "lang_tiefling", maximum: 7, condition: 0 }] },
											logic:      { maximum: 6, damage: 0, condition: 0, skills: [{ name: "intimidate", maximum: 2, condition: 0, charisma: true, counters: ["remain_calm"] }] },
											strength:   { maximum: 4, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 2, condition: 0 }, { name: "throw", maximum: 4, condition: 0, combat: true }] },
											dexterity:  { maximum: 6, damage: 0, condition: 0, skills: [{ name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}, { name: "temperature_resistance", maximum: 14, condition: 0, animals: true }] },
											speed:      { maximum: 5, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 3, condition: 0 }, { name: "jump", maximum: 5, condition: 0 }, { name: "swim", maximum: 0, condition: 0 }, { name: "sneak", maximum: 2, condition: 0 }] }
										},
										items: [
											{name:"clothes",count:1,type:"armor",armorType:"body",d6:1,weight:1,fuel:2,materials:"cloth",cost:10,description:" ",id:"rbxzkdzgldgzqlok"},
											{name:"shoes",count:1,type:"armor",armorType:"legs",d6:1,weight:2,fuel:2,materials:"cloth",cost:10,description:" ",id:"kjlbatbkkevyzedf"},
										]
									},
									{
										info: {
											name: "tiefling boss",
											demographics: { race: "tiefling", age: 25, sex: "", height: 5, weight: 150 },
											description: "Standard fantasy tiefling, with pinkish skin, two horns, night vision, a prehensile tail, and a mysterious and tricky nature.",
											status: { points: 0, burden: 52, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 8, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 4, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 7, condition: 0 }, { name: "taste", unremovable: true, maximum: 4, condition: 0 }, { name: "touch", unremovable: true, maximum: 6, condition: 0 }, { name: "night_vision", maximum: 3, condition: 0, animals: true }] },
											memory:     { maximum: 8, damage: 0, condition: 0, skills: [{ name: "lang_tiefling", maximum: 7, condition: 0 }] },
											logic:      { maximum: 10, damage: 0, condition: 0, skills: [{ name: "persuade", maximum: 7, condition: 0, charisma: true, counters:["judge_character"] }, { name: "judge_character", maximum: 7, condition: 0 }, { name: "intimidate", maximum: 2, condition: 0, charisma: true, counters: ["remain_calm"] }] },
											strength:   { maximum: 8, damage: 0, condition: 0, skills: [{ name: "melee", combat: true, maximum: 7, condition: 0 }, { name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 2, condition: 0 }, { name: "throw", maximum: 4, condition: 0, combat: true }] },
											dexterity:  { maximum: 10, damage: 0, condition: 0, skills: [{ name: "fencing", combat: true, maximum: 7, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 10, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}, { name: "temperature_resistance", maximum: 14, condition: 0, animals: true }] },
											speed:      { maximum: 9, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 3, condition: 0 }, { name: "jump", maximum: 5, condition: 0 }, { name: "swim", maximum: 0, condition: 0 }, { name: "sneak", maximum: 2, condition: 0 }] }
										},
										items: [
											{name:"long sword",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:7}],weight:5,hands:2,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:80,description:" ",id:"ystexytmmlneqixo"},
											{name:"warhammer",count:1,type:"weapon",usage:[{statistic:"strength",skill:"melee",d6:7}],weight:6,hands:2,magnetic:true,materials:"leather, metal",cost:80,description:" ",id:"dzgovmpmngryoart"},
											{name:"chainmail armor",count:1,type:"armor",armorType:"body",d6:5,weight:25,magnetic:true,materials:"metal",cost:70,description:"conducts electricity",id:"cwmbegsjhgbqwosn"},
											{name:"chainmail helmet",count:1,type:"armor",armorType:"head",d6:5,weight:5,magnetic:true,materials:"metal",cost:20,description:"conducts electricity",id:"wkthclgbkefjqqud"},
											{name:"chainmail gloves",count:1,type:"armor",armorType:"hands",d6:5,weight:4,magnetic:true,materials:"metal",cost:20,description:"conducts electricity",id:"wcsmkdyfecarrovp"},
											{name:"chainmail boots",count:1,type:"armor",armorType:"legs",d6:5,weight:6,magnetic:true,materials:"metal",cost:40,description:"conducts electricity",id:"ufadgpukpeambjnx"},
											{name:"potion of strong healing",count:1,type:"healing",weight:0.5,"recipe":{"w":10,"r":0,"g":7,"b":0},d6:2,"conditions":{"bleeding":0},cost:14,description:"removes 2d6 damage",id:"fgbobzjuccaaqvfj"},
											{name:"potion of flashbang",count:1,type:"potion",weight:0.5,"recipe":{"w":10,"r":6,"g":0,"b":6},d6:3,"conditions":{"loud_noise":1,"blinding_light":1},cost:24,description:"causes loud noise and blinding light for 1d6 rounds; explosion causes 3d6 damage to 5-ft square and surrounding 5-ft squares",id:"qsgqgreexyztuwmy"}
										]
									},

								// goblin
									{
										info: {
											name: "goblin smart",
											demographics: { race: "goblin", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Standard fantasy goblins, with small frames, dark red or yellow skin, low intelligence, and a crass, lowly standard of living.",
											status: { points: 0, burden: 27, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 9, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 4, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 7, condition: 0 }, { name: "taste", unremovable: true, maximum: 3, condition: 0 }, { name: "touch", unremovable: true, maximum: 7, condition: 0 }, { name: "night_vision", maximum: 2, condition: 0, animals: true }] },
											memory:     { maximum: 7, damage: 0, condition: 0, skills: [{ name: "lang_goblin", maximum: 7, condition: 0 }, { name: "medicine", maximum: 5, condition: 0 }] },
											logic:      { maximum: 5, damage: 0, condition: 0, skills: [{ name: "mechanics", maximum: 5, condition: 0 }] },
											strength:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 1, condition: 0 }, { name: "throw", maximum: 4, condition: 0, combat: true }] },
											dexterity:  { maximum: 8, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 5, condition: 0 }, { name: "knifing", combat: true, maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "ride_animals", maximum: 3, condition: 0 }] },
											immunity:   { maximum: 8, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}, { name: "alcohol_tolerance", maximum: 7, condition: 0 }, { name: "poison_resistance", maximum: 7, condition: 0 }, { name: "infection_resistance", maximum: 7, condition: 0 }, { name: "allergy_resistance", maximum: 7, condition: 0 }] },
											speed:      { maximum: 6, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 2, condition: 0 }, { name: "jump", maximum: 4, condition: 0 }, { name: "swim", maximum: 3, condition: 0 }, { name: "sneak", maximum: 2, condition: 0 }] }
										},
										items: [
											{name:"stonebow",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"missile"}],weight:3,hands:2,fuel:2,materials:"wood, string, metal",cost:70,description:"range: 50 ft",id:"lwxxxnluronoevbx"},
											{name:"rock orb",count:10,type:"ammunition",weapons:["sling","bomb","stonebow","gauss pistol"],weight:0.5,usage:[{statistic:"dexterity",skill:"missile",d6:3},{statistic:"strength",skill:"throw",d6:3}],hands:1,materials:"stone",cost:1,description:" ",id:"blcgrpuidapffjvr"},
											{name:"dagger",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"knifing",d6:3},{statistic:"strength",skill:"throw",d6:3}],weight:1,hands:1,magnetic:true,conditions:{bleeding:1},materials:"metal",cost:10,description:" ",id:"zexbxnhhkntluxke"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"book",count:1,weight:3,hands:1,usage:[{statistic:"memory",skill:"astronomy",modifier:5}],fuel:1,materials:"paper",cost:5,description:"+5 specific memory/logic skill (mathematics, alchemy, zoology, etc.)",id:"ctpvtxpllbiibxhw"},
										]
									},
									{
										info: {
											name: "goblin skilled",
											demographics: { race: "goblin", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Standard fantasy goblins, with small frames, dark red or yellow skin, low intelligence, and a crass, lowly standard of living.",
											status: { points: 0, burden: 24, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 9, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 4, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 7, condition: 0 }, { name: "taste", unremovable: true, maximum: 3, condition: 0 }, { name: "touch", unremovable: true, maximum: 7, condition: 0 }, { name: "night_vision", maximum: 2, condition: 0, animals: true }] },
											memory:     { maximum: 5, damage: 0, condition: 0, skills: [{ name: "lang_goblin", maximum: 7, condition: 0 }] },
											logic:      { maximum: 5, damage: 0, condition: 0, skills: [{ name: "pattern_recognition", maximum: 5, condition: 0 }] },
											strength:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 1, condition: 0 }, { name: "throw", maximum: 4, condition: 0, combat: true }] },
											dexterity:  { maximum: 10, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 5, condition: 0 }, { name: "fencing", combat: true, maximum: 5, condition: 0 }, { name: "escape_bonds", maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "ride_animals", maximum: 3, condition: 0 }] },
											immunity:   { maximum: 7, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}, { name: "alcohol_tolerance", maximum: 7, condition: 0 }, { name: "poison_resistance", maximum: 7, condition: 0 }, { name: "infection_resistance", maximum: 7, condition: 0 }, { name: "allergy_resistance", maximum: 7, condition: 0 }] },
											speed:      { maximum: 7, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 2, condition: 0 }, { name: "jump", maximum: 4, condition: 0 }, { name: "swim", maximum: 3, condition: 0 }, { name: "sneak", maximum: 2, condition: 0 }] }
										},
										items: [
											{name:"stonebow",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"missile"}],weight:3,hands:2,fuel:2,materials:"wood, string, metal",cost:70,description:"range: 50 ft",id:"lwxxxnluronoevbx"},
											{name:"glass orb",count:10,type:"ammunition",weapons:["sling","bomb","stonebow","gauss pistol"],weight:0.1,usage:[{statistic:"dexterity",skill:"missile",d6:3},{statistic:"strength",skill:"throw",d6:3}],hands:1,conditions:{bleeding:1},materials:"glass",cost:4,description:"shatters on impact",id:"sbkuydbixlpqyats"},
											{name:"short sword",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:5}],weight:2,hands:1,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:50,description:" ",id:"grwjcuryhftbylps"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"rope",count:1,weight:2,usage:[{statistic:"strength",skill:"climb",modifier:5},{statistic:"dexterity",skill:"crafting"}],fuel:2,materials:"string",cost:10,description:"10 feet; +5 climbing; helps with crafting",id:"vkafrmfqhqivchjp"},
											{name:"spyglass",count:1,weight:1,hands:1,usage:[{statistic:"perception",skill:"sight",modifier:10},{statistic:"dexterity",skill:"missile",modifier:5}],materials:"wood, metal, glass",cost:35,description:"for viewing far distances (+10 sight) and accuracy with aim (+5 missile)",id:"hhozcolalgovetay"},
										]
									},
									{
										info: {
											name: "goblin strong",
											demographics: { race: "goblin", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Standard fantasy goblins, with small frames, dark red or yellow skin, low intelligence, and a crass, lowly standard of living.",
											status: { points: 0, burden: 33.5, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 7, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 4, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 7, condition: 0 }, { name: "taste", unremovable: true, maximum: 3, condition: 0 }, { name: "touch", unremovable: true, maximum: 7, condition: 0 }, { name: "night_vision", maximum: 2, condition: 0, animals: true }] },
											memory:     { maximum: 4, damage: 0, condition: 0, skills: [{ name: "lang_goblin", maximum: 7, condition: 0 }] },
											logic:      { maximum: 4, damage: 0, condition: 0, skills: [{ name: "remain_calm", maximum: 5, condition: 0 }] },
											strength:   { maximum: 9, damage: 0, condition: 0, skills: [{ name: "melee", combat: true, maximum: 5, condition: 0 }, { name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 1, condition: 0 }, { name: "throw", maximum: 4, condition: 0, combat: true }] },
											dexterity:  { maximum: 9, damage: 0, condition: 0, skills: [{ name: "fencing", combat: true, maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "ride_animals", maximum: 3, condition: 0 }] },
											immunity:   { maximum: 8, damage: 0, condition: 0, skills: [{ name: "pain_tolerance", maximum: 5, condition: 0 }, { name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}, { name: "alcohol_tolerance", maximum: 7, condition: 0 }, { name: "poison_resistance", maximum: 7, condition: 0 }, { name: "infection_resistance", maximum: 7, condition: 0 }, { name: "allergy_resistance", maximum: 7, condition: 0 }] },
											speed:      { maximum: 8, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 2, condition: 0 }, { name: "jump", maximum: 4, condition: 0 }, { name: "swim", maximum: 3, condition: 0 }, { name: "sneak", maximum: 2, condition: 0 }] }
										},
										items: [
											{name:"axe",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:5},{statistic:"strength",skill:"throw",d6:5}],weight:2,hands:1,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:50,description:" ",id:"yeqfovhaquvlzuus"},
											{name:"long staff",count:1,type:"weapon",usage:[{statistic:"strength",skill:"melee",d6:6}],weight:6,hands:2,fuel:4,materials:"wood",cost:60,description:" ",id:"aunayoybjrwjejnn"},
											{name:"wooden shield",count:1,type:"shield",d6:4,weight:10,fuel:3,hands:1,usage:[{statistic:"strength",skill:"melee",d6:3}],materials:"wood",cost:50,description:" ",id:"azwvgxetbvshdxtj"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"concoction of smoke",count:1,type:"potion",weight:0.5,usage:[{statistic:"strength",skill:"throw",d6:3}],"recipe":{"w":10,"r":4,"g":2,"b":2},"conditions":{"smoke":2},cost:16,description:"causes smoke in 5-ft square and surrounding 5-ft squares for 2d6 rounds",id:"qiqrjziyuizptbmh"},
										]
									},
									{
										info: {
											name: "goblin child",
											demographics: { race: "goblin", age: 10, sex: "", height: 3, weight: 50 },
											description: "Standard fantasy goblins, with small frames, dark red or yellow skin, low intelligence, and a crass, lowly standard of living.",
											status: { points: 0, burden: 3, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 7, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 4, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 7, condition: 0 }, { name: "taste", unremovable: true, maximum: 3, condition: 0 }, { name: "touch", unremovable: true, maximum: 7, condition: 0 }, { name: "night_vision", maximum: 2, condition: 0, animals: true }] },
											memory:     { maximum: 3, damage: 0, condition: 0, skills: [{ name: "lang_goblin", maximum: 7, condition: 0 }] },
											logic:      { maximum: 3, damage: 0, condition: 0, skills: [] },
											strength:   { maximum: 5, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 1, condition: 0 }, { name: "throw", maximum: 4, condition: 0, combat: true }] },
											dexterity:  { maximum: 5, damage: 0, condition: 0, skills: [{ name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "ride_animals", maximum: 3, condition: 0 }] },
											immunity:   { maximum: 7, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}, { name: "alcohol_tolerance", maximum: 7, condition: 0 }, { name: "poison_resistance", maximum: 7, condition: 0 }, { name: "infection_resistance", maximum: 7, condition: 0 }, { name: "allergy_resistance", maximum: 7, condition: 0 }] },
											speed:      { maximum: 5, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 2, condition: 0 }, { name: "jump", maximum: 4, condition: 0 }, { name: "swim", maximum: 3, condition: 0 }, { name: "sneak", maximum: 2, condition: 0 }] }
										},
										items: [
											{name:"clothes",count:1,type:"armor",armorType:"body",d6:1,weight:1,fuel:2,materials:"cloth",cost:10,description:" ",id:"rbxzkdzgldgzqlok"},
											{name:"shoes",count:1,type:"armor",armorType:"legs",d6:1,weight:2,fuel:2,materials:"cloth",cost:10,description:" ",id:"kjlbatbkkevyzedf"},
										]
									},
									{
										info: {
											name: "goblin boss",
											demographics: { race: "goblin", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Standard fantasy goblins, with small frames, dark red or yellow skin, low intelligence, and a crass, lowly standard of living.",
											status: { points: 0, burden: 52, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 10, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 4, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 7, condition: 0 }, { name: "taste", unremovable: true, maximum: 3, condition: 0 }, { name: "touch", unremovable: true, maximum: 7, condition: 0 }, { name: "night_vision", maximum: 2, condition: 0, animals: true }] },
											memory:     { maximum: 7, damage: 0, condition: 0, skills: [{ name: "lang_goblin", maximum: 7, condition: 0 }] },
											logic:      { maximum: 7, damage: 0, condition: 0, skills: [{ name: "intimidate", maximum: 7, condition: 0, charisma: true, counters: ["remain_calm"] }, { name: "judge_character", maximum: 7, condition: 0 }] },
											strength:   { maximum: 10, damage: 0, condition: 0, skills: [{ name: "melee", combat: true, maximum: 7, condition: 0 }, { name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 1, condition: 0 }, { name: "throw", maximum: 4, condition: 0, combat: true }] },
											dexterity:  { maximum: 9, damage: 0, condition: 0, skills: [{ name: "fencing", combat: true, maximum: 7, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "ride_animals", maximum: 3, condition: 0 }] },
											immunity:   { maximum: 10, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}, { name: "alcohol_tolerance", maximum: 7, condition: 0 }, { name: "poison_resistance", maximum: 7, condition: 0 }, { name: "infection_resistance", maximum: 7, condition: 0 }, { name: "allergy_resistance", maximum: 7, condition: 0 }] },
											speed:      { maximum: 10, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 2, condition: 0 }, { name: "jump", maximum: 4, condition: 0 }, { name: "swim", maximum: 3, condition: 0 }, { name: "sneak", maximum: 2, condition: 0 }] }
										},
										items: [
											{name:"long sword",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:7}],weight:5,hands:2,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:80,description:" ",id:"ystexytmmlneqixo"},
											{name:"warhammer",count:1,type:"weapon",usage:[{statistic:"strength",skill:"melee",d6:7}],weight:6,hands:2,magnetic:true,materials:"leather, metal",cost:80,description:" ",id:"dzgovmpmngryoart"},
											{name:"chainmail armor",count:1,type:"armor",armorType:"body",d6:5,weight:25,magnetic:true,materials:"metal",cost:70,description:"conducts electricity",id:"cwmbegsjhgbqwosn"},
											{name:"chainmail helmet",count:1,type:"armor",armorType:"head",d6:5,weight:5,magnetic:true,materials:"metal",cost:20,description:"conducts electricity",id:"wkthclgbkefjqqud"},
											{name:"chainmail gloves",count:1,type:"armor",armorType:"hands",d6:5,weight:4,magnetic:true,materials:"metal",cost:20,description:"conducts electricity",id:"wcsmkdyfecarrovp"},
											{name:"chainmail boots",count:1,type:"armor",armorType:"legs",d6:5,weight:6,magnetic:true,materials:"metal",cost:40,description:"conducts electricity",id:"ufadgpukpeambjnx"},
											{name:"potion of strong healing",count:1,type:"healing",weight:0.5,"recipe":{"w":10,"r":0,"g":7,"b":0},d6:2,"conditions":{"bleeding":0},cost:14,description:"removes 2d6 damage",id:"fgbobzjuccaaqvfj"},
											{name:"potion of flashbang",count:1,type:"potion",weight:0.5,"recipe":{"w":10,"r":6,"g":0,"b":6},d6:3,"conditions":{"loud_noise":1,"blinding_light":1},cost:24,description:"causes loud noise and blinding light for 1d6 rounds; explosion causes 3d6 damage to 5-ft square and surrounding 5-ft squares",id:"qsgqgreexyztuwmy"}
										]
									},

								// orc
									{
										info: {
											name: "orc smart",
											demographics: { race: "orc", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Standard fantasy orcs, with large bodies covered in rough, dark-colored skin, a warlike temperament and preference for violence.",
											status: { points: 0, burden: 27, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 7, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 6, condition: 0 }, { name: "sound", unremovable: true, maximum: 6, condition: 0 }, { name: "scent", unremovable: true, maximum: 7, condition: 0 }, { name: "taste", unremovable: true, maximum: 4, condition: 0 }, { name: "touch", unremovable: true, maximum: 5, condition: 0 }, { name: "night_vision", maximum: 2, condition: 0, animals: true }] },
											memory:     { maximum: 8, damage: 0, condition: 0, skills: [{ name: "lang_orc", maximum: 7, condition: 0 }, { name: "medicine", maximum: 5, condition: 0 }] },
											logic:      { maximum: 6, damage: 0, condition: 0, skills: [{ name: "mechanics", maximum: 5, condition: 0 }] },
											strength:   { maximum: 7, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 3 }, { name: "carry", maximum: 4, condition: 0 }, { name: "throw", maximum: 3, condition: 0, combat: true }, { name: "melee", maximum: 3, condition: 0, combat: true }] },
											dexterity:  { maximum: 8, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 5, condition: 0 }, { name: "knifing", combat: true, maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "fencing", maximum: 2, condition: 0, combat: true }] },
											immunity:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}] },
											speed:      { maximum: 7, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 3 }, { name: "run", maximum: 3, condition: 0 }, { name: "jump", maximum: 3, condition: 0 }, { name: "swim", maximum: 1, condition: 0 }] }
										},
										items: [
											{name:"stonebow",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"missile"}],weight:3,hands:2,fuel:2,materials:"wood, string, metal",cost:70,description:"range: 50 ft",id:"lwxxxnluronoevbx"},
											{name:"rock orb",count:10,type:"ammunition",weapons:["sling","bomb","stonebow","gauss pistol"],weight:0.5,usage:[{statistic:"dexterity",skill:"missile",d6:3},{statistic:"strength",skill:"throw",d6:3}],hands:1,materials:"stone",cost:1,description:" ",id:"blcgrpuidapffjvr"},
											{name:"dagger",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"knifing",d6:3},{statistic:"strength",skill:"throw",d6:3}],weight:1,hands:1,magnetic:true,conditions:{bleeding:1},materials:"metal",cost:10,description:" ",id:"zexbxnhhkntluxke"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"book",count:1,weight:3,hands:1,usage:[{statistic:"memory",skill:"astronomy",modifier:5}],fuel:1,materials:"paper",cost:5,description:"+5 specific memory/logic skill (mathematics, alchemy, zoology, etc.)",id:"ctpvtxpllbiibxhw"},
										]
									},
									{
										info: {
											name: "orc skilled",
											demographics: { race: "orc", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Standard fantasy orcs, with large bodies covered in rough, dark-colored skin, a warlike temperament and preference for violence.",
											status: { points: 0, burden: 24, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 7, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 6, condition: 0 }, { name: "sound", unremovable: true, maximum: 6, condition: 0 }, { name: "scent", unremovable: true, maximum: 7, condition: 0 }, { name: "taste", unremovable: true, maximum: 4, condition: 0 }, { name: "touch", unremovable: true, maximum: 5, condition: 0 }, { name: "night_vision", maximum: 2, condition: 0, animals: true }] },
											memory:     { maximum: 5, damage: 0, condition: 0, skills: [{ name: "lang_orc", maximum: 7, condition: 0 }] },
											logic:      { maximum: 5, damage: 0, condition: 0, skills: [{ name: "pattern_recognition", maximum: 5, condition: 0 }] },
											strength:   { maximum: 8, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 5, condition: 0, d6: 3 }, { name: "carry", maximum: 4, condition: 0 }, { name: "throw", maximum: 3, condition: 0, combat: true }, { name: "melee", maximum: 3, condition: 0, combat: true }] },
											dexterity:  { maximum: 10, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 5, condition: 0 }, { name: "escape_bonds", maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}] },
											speed:      { maximum: 8, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 3 }, { name: "run", maximum: 3, condition: 0 }, { name: "jump", maximum: 3, condition: 0 }, { name: "swim", maximum: 1, condition: 0 }] }
										},
										items: [
											{name:"stonebow",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"missile"}],weight:3,hands:2,fuel:2,materials:"wood, string, metal",cost:70,description:"range: 50 ft",id:"lwxxxnluronoevbx"},
											{name:"glass orb",count:10,type:"ammunition",weapons:["sling","bomb","stonebow","gauss pistol"],weight:0.1,usage:[{statistic:"dexterity",skill:"missile",d6:3},{statistic:"strength",skill:"throw",d6:3}],hands:1,conditions:{bleeding:1},materials:"glass",cost:4,description:"shatters on impact",id:"sbkuydbixlpqyats"},
											{name:"short sword",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:5}],weight:2,hands:1,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:50,description:" ",id:"grwjcuryhftbylps"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"rope",count:1,weight:2,usage:[{statistic:"strength",skill:"climb",modifier:5},{statistic:"dexterity",skill:"crafting"}],fuel:2,materials:"string",cost:10,description:"10 feet; +5 climbing; helps with crafting",id:"vkafrmfqhqivchjp"},
											{name:"spyglass",count:1,weight:1,hands:1,usage:[{statistic:"perception",skill:"sight",modifier:10},{statistic:"dexterity",skill:"missile",modifier:5}],materials:"wood, metal, glass",cost:35,description:"for viewing far distances (+10 sight) and accuracy with aim (+5 missile)",id:"hhozcolalgovetay"},
										]
									},
									{
										info: {
											name: "orc strong",
											demographics: { race: "orc", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Standard fantasy orcs, with large bodies covered in rough, dark-colored skin, a warlike temperament and preference for violence.",
											status: { points: 0, burden: 33.5, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 7, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 6, condition: 0 }, { name: "sound", unremovable: true, maximum: 6, condition: 0 }, { name: "scent", unremovable: true, maximum: 7, condition: 0 }, { name: "taste", unremovable: true, maximum: 4, condition: 0 }, { name: "touch", unremovable: true, maximum: 5, condition: 0 }, { name: "night_vision", maximum: 2, condition: 0, animals: true }] },
											memory:     { maximum: 4, damage: 0, condition: 0, skills: [{ name: "lang_orc", maximum: 7, condition: 0 }] },
											logic:      { maximum: 4, damage: 0, condition: 0, skills: [{ name: "remain_calm", maximum: 5, condition: 0 }] },
											strength:   { maximum: 10, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 5, condition: 0, d6: 3 }, { name: "carry", maximum: 4, condition: 0 }, { name: "throw", maximum: 3, condition: 0, combat: true }, { name: "melee", maximum: 3, condition: 0, combat: true }] },
											dexterity:  { maximum: 9, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "fencing", maximum: 2, condition: 0, combat: true }] },
											immunity:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "pain_tolerance", maximum: 5, condition: 0 }, { name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}] },
											speed:      { maximum: 9, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 3 }, { name: "run", maximum: 3, condition: 0 }, { name: "jump", maximum: 3, condition: 0 }, { name: "swim", maximum: 1, condition: 0 }] }
										},
										items: [
											{name:"axe",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:5},{statistic:"strength",skill:"throw",d6:5}],weight:2,hands:1,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:50,description:" ",id:"yeqfovhaquvlzuus"},
											{name:"long staff",count:1,type:"weapon",usage:[{statistic:"strength",skill:"melee",d6:6}],weight:6,hands:2,fuel:4,materials:"wood",cost:60,description:" ",id:"aunayoybjrwjejnn"},
											{name:"wooden shield",count:1,type:"shield",d6:4,weight:10,fuel:3,hands:1,usage:[{statistic:"strength",skill:"melee",d6:3}],materials:"wood",cost:50,description:" ",id:"azwvgxetbvshdxtj"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"concoction of smoke",count:1,type:"potion",weight:0.5,usage:[{statistic:"strength",skill:"throw",d6:3}],"recipe":{"w":10,"r":4,"g":2,"b":2},"conditions":{"smoke":2},cost:16,description:"causes smoke in 5-ft square and surrounding 5-ft squares for 2d6 rounds",id:"qiqrjziyuizptbmh"},
										]
									},
									{
										info: {
											name: "orc child",
											demographics: { race: "orc", age: 10, sex: "", height: 4.5, weight: 100 },
											description: "Standard fantasy orcs, with large bodies covered in rough, dark-colored skin, a warlike temperament and preference for violence.",
											status: { points: 0, burden: 3, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 7, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 6, condition: 0 }, { name: "sound", unremovable: true, maximum: 6, condition: 0 }, { name: "scent", unremovable: true, maximum: 7, condition: 0 }, { name: "taste", unremovable: true, maximum: 4, condition: 0 }, { name: "touch", unremovable: true, maximum: 5, condition: 0 }, { name: "night_vision", maximum: 2, condition: 0, animals: true }] },
											memory:     { maximum: 3, damage: 0, condition: 0, skills: [{ name: "lang_orc", maximum: 7, condition: 0 }] },
											logic:      { maximum: 3, damage: 0, condition: 0, skills: [] },
											strength:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 3 }, { name: "carry", maximum: 4, condition: 0 }, { name: "throw", maximum: 3, condition: 0, combat: true }, { name: "melee", maximum: 3, condition: 0, combat: true }] },
											dexterity:  { maximum: 6, damage: 0, condition: 0, skills: [{ name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "fencing", maximum: 2, condition: 0, combat: true }] },
											immunity:   { maximum: 5, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}] },
											speed:      { maximum: 5, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 3 }, { name: "run", maximum: 3, condition: 0 }, { name: "jump", maximum: 3, condition: 0 }, { name: "swim", maximum: 1, condition: 0 }] }
										},
										items: [
											{name:"clothes",count:1,type:"armor",armorType:"body",d6:1,weight:1,fuel:2,materials:"cloth",cost:10,description:" ",id:"rbxzkdzgldgzqlok"},
											{name:"shoes",count:1,type:"armor",armorType:"legs",d6:1,weight:2,fuel:2,materials:"cloth",cost:10,description:" ",id:"kjlbatbkkevyzedf"},
										]
									},
									{
										info: {
											name: "orc boss",
											demographics: { race: "orc", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Standard fantasy orcs, with large bodies covered in rough, dark-colored skin, a warlike temperament and preference for violence.",
											status: { points: 0, burden: 52, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 10, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 6, condition: 0 }, { name: "sound", unremovable: true, maximum: 6, condition: 0 }, { name: "scent", unremovable: true, maximum: 7, condition: 0 }, { name: "taste", unremovable: true, maximum: 4, condition: 0 }, { name: "touch", unremovable: true, maximum: 5, condition: 0 }, { name: "night_vision", maximum: 2, condition: 0, animals: true }] },
											memory:     { maximum: 7, damage: 0, condition: 0, skills: [{ name: "lang_orc", maximum: 7, condition: 0 }] },
											logic:      { maximum: 6, damage: 0, condition: 0, skills: [{ name: "intimidate", maximum: 7, condition: 0, charisma: true, counters: ["remain_calm"] }, { name: "judge_character", maximum: 7, condition: 0 }] },
											strength:   { maximum: 10, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 7, condition: 0, d6: 3 }, { name: "carry", maximum: 4, condition: 0 }, { name: "throw", maximum: 3, condition: 0, combat: true }, { name: "melee", maximum: 3, condition: 0, combat: true }] },
											dexterity:  { maximum: 10, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 7, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "fencing", maximum: 2, condition: 0, combat: true }] },
											immunity:   { maximum: 10, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}] },
											speed:      { maximum: 10, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 3 }, { name: "run", maximum: 3, condition: 0 }, { name: "jump", maximum: 3, condition: 0 }, { name: "swim", maximum: 1, condition: 0 }] }
										},
										items: [
											{name:"long sword",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:7}],weight:5,hands:2,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:80,description:" ",id:"ystexytmmlneqixo"},
											{name:"warhammer",count:1,type:"weapon",usage:[{statistic:"strength",skill:"melee",d6:7}],weight:6,hands:2,magnetic:true,materials:"leather, metal",cost:80,description:" ",id:"dzgovmpmngryoart"},
											{name:"chainmail armor",count:1,type:"armor",armorType:"body",d6:5,weight:25,magnetic:true,materials:"metal",cost:70,description:"conducts electricity",id:"cwmbegsjhgbqwosn"},
											{name:"chainmail helmet",count:1,type:"armor",armorType:"head",d6:5,weight:5,magnetic:true,materials:"metal",cost:20,description:"conducts electricity",id:"wkthclgbkefjqqud"},
											{name:"chainmail gloves",count:1,type:"armor",armorType:"hands",d6:5,weight:4,magnetic:true,materials:"metal",cost:20,description:"conducts electricity",id:"wcsmkdyfecarrovp"},
											{name:"chainmail boots",count:1,type:"armor",armorType:"legs",d6:5,weight:6,magnetic:true,materials:"metal",cost:40,description:"conducts electricity",id:"ufadgpukpeambjnx"},
											{name:"potion of strong healing",count:1,type:"healing",weight:0.5,"recipe":{"w":10,"r":0,"g":7,"b":0},d6:2,"conditions":{"bleeding":0},cost:14,description:"removes 2d6 damage",id:"fgbobzjuccaaqvfj"},
											{name:"potion of flashbang",count:1,type:"potion",weight:0.5,"recipe":{"w":10,"r":6,"g":0,"b":6},d6:3,"conditions":{"loud_noise":1,"blinding_light":1},cost:24,description:"causes loud noise and blinding light for 1d6 rounds; explosion causes 3d6 damage to 5-ft square and surrounding 5-ft squares",id:"qsgqgreexyztuwmy"}
										]
									},

								// lizardfolk
									{
										info: {
											name: "lizardfolk smart",
											demographics: { race: "lizardfolk", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Standard fantasy lizard people, with medium-sized reptilian/humanoid bodies, forked tongues, webbed feet, and scales.",
											status: { points: 0, burden: 27, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 9, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 6, condition: 0 }, { name: "sound", unremovable: true, maximum: 5, condition: 0 }, { name: "scent", unremovable: true, maximum: 7, condition: 0 }, { name: "taste", unremovable: true, maximum: 7, condition: 0 }, { name: "touch", unremovable: true, maximum: 3, condition: 0 }, { name: "camouflage", maximum: 14, condition: 0}] },
											memory:     { maximum: 8, damage: 0, condition: 0, skills: [{ name: "lang_lizardfolk", maximum: 7, condition: 0 }, { name: "medicine", maximum: 5, condition: 0 }] },
											logic:      { maximum: 8, damage: 0, condition: 0, skills: [{ name: "mechanics", maximum: 5, condition: 0 }] },
											strength:   { maximum: 5, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 1, condition: 0 }, { name: "throw", maximum: 1, condition: 0, combat: true }] },
											dexterity:  { maximum: 6, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 5, condition: 0 }, { name: "knifing", combat: true, maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 5, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 2, condition: 0, d6: 2 }, { name: "poison_resistance", maximum: 2, condition: 0 }] },
											speed:      { maximum: 8, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 2, condition: 0 }, { name: "jump", maximum: 5, condition: 0 }, { name: "swim", maximum: 5, condition: 0 }, { name: "sneak", maximum: 3, condition: 0 }] }
										},
										items: [
											{name:"stonebow",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"missile"}],weight:3,hands:2,fuel:2,materials:"wood, string, metal",cost:70,description:"range: 50 ft",id:"lwxxxnluronoevbx"},
											{name:"rock orb",count:10,type:"ammunition",weapons:["sling","bomb","stonebow","gauss pistol"],weight:0.5,usage:[{statistic:"dexterity",skill:"missile",d6:3},{statistic:"strength",skill:"throw",d6:3}],hands:1,materials:"stone",cost:1,description:" ",id:"blcgrpuidapffjvr"},
											{name:"dagger",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"knifing",d6:3},{statistic:"strength",skill:"throw",d6:3}],weight:1,hands:1,magnetic:true,conditions:{bleeding:1},materials:"metal",cost:10,description:" ",id:"zexbxnhhkntluxke"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"book",count:1,weight:3,hands:1,usage:[{statistic:"memory",skill:"astronomy",modifier:5}],fuel:1,materials:"paper",cost:5,description:"+5 specific memory/logic skill (mathematics, alchemy, zoology, etc.)",id:"ctpvtxpllbiibxhw"},
										]
									},
									{
										info: {
											name: "lizardfolk skilled",
											demographics: { race: "lizardfolk", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Standard fantasy lizard people, with medium-sized reptilian/humanoid bodies, forked tongues, webbed feet, and scales.",
											status: { points: 0, burden: 24, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 8, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 6, condition: 0 }, { name: "sound", unremovable: true, maximum: 5, condition: 0 }, { name: "scent", unremovable: true, maximum: 7, condition: 0 }, { name: "taste", unremovable: true, maximum: 7, condition: 0 }, { name: "touch", unremovable: true, maximum: 3, condition: 0 }, { name: "camouflage", maximum: 14, condition: 0}] },
											memory:     { maximum: 5, damage: 0, condition: 0, skills: [{ name: "lang_lizardfolk", maximum: 7, condition: 0 }] },
											logic:      { maximum: 5, damage: 0, condition: 0, skills: [{ name: "pattern_recognition", maximum: 5, condition: 0 }] },
											strength:   { maximum: 5, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 1, condition: 0 }, { name: "throw", maximum: 1, condition: 0, combat: true }] },
											dexterity:  { maximum: 9, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 5, condition: 0 }, { name: "fencing", combat: true, maximum: 5, condition: 0 }, { name: "escape_bonds", maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 7, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 2, condition: 0, d6: 2 }, { name: "poison_resistance", maximum: 2, condition: 0 }] },
											speed:      { maximum: 10, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 2, condition: 0 }, { name: "jump", maximum: 5, condition: 0 }, { name: "swim", maximum: 5, condition: 0 }, { name: "sneak", maximum: 3, condition: 0 }] }
										},
										items: [
											{name:"stonebow",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"missile"}],weight:3,hands:2,fuel:2,materials:"wood, string, metal",cost:70,description:"range: 50 ft",id:"lwxxxnluronoevbx"},
											{name:"glass orb",count:10,type:"ammunition",weapons:["sling","bomb","stonebow","gauss pistol"],weight:0.1,usage:[{statistic:"dexterity",skill:"missile",d6:3},{statistic:"strength",skill:"throw",d6:3}],hands:1,conditions:{bleeding:1},materials:"glass",cost:4,description:"shatters on impact",id:"sbkuydbixlpqyats"},
											{name:"short sword",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:5}],weight:2,hands:1,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:50,description:" ",id:"grwjcuryhftbylps"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"rope",count:1,weight:2,usage:[{statistic:"strength",skill:"climb",modifier:5},{statistic:"dexterity",skill:"crafting"}],fuel:2,materials:"string",cost:10,description:"10 feet; +5 climbing; helps with crafting",id:"vkafrmfqhqivchjp"},
											{name:"spyglass",count:1,weight:1,hands:1,usage:[{statistic:"perception",skill:"sight",modifier:10},{statistic:"dexterity",skill:"missile",modifier:5}],materials:"wood, metal, glass",cost:35,description:"for viewing far distances (+10 sight) and accuracy with aim (+5 missile)",id:"hhozcolalgovetay"},
										]
									},
									{
										info: {
											name: "lizardfolk strong",
											demographics: { race: "lizardfolk", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Standard fantasy lizard people, with medium-sized reptilian/humanoid bodies, forked tongues, webbed feet, and scales.",
											status: { points: 0, burden: 33.5, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 8, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 6, condition: 0 }, { name: "sound", unremovable: true, maximum: 5, condition: 0 }, { name: "scent", unremovable: true, maximum: 7, condition: 0 }, { name: "taste", unremovable: true, maximum: 7, condition: 0 }, { name: "touch", unremovable: true, maximum: 3, condition: 0 }, { name: "camouflage", maximum: 14, condition: 0}] },
											memory:     { maximum: 5, damage: 0, condition: 0, skills: [{ name: "lang_lizardfolk", maximum: 7, condition: 0 }] },
											logic:      { maximum: 5, damage: 0, condition: 0, skills: [{ name: "remain_calm", maximum: 5, condition: 0 }] },
											strength:   { maximum: 10, damage: 0, condition: 0, skills: [{ name: "melee", combat: true, maximum: 5, condition: 0 }, { name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 1, condition: 0 }, { name: "throw", maximum: 1, condition: 0, combat: true }] },
											dexterity:  { maximum: 5, damage: 0, condition: 0, skills: [{ name: "fencing", combat: true, maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 8, damage: 0, condition: 0, skills: [{ name: "pain_tolerance", maximum: 5, condition: 0 }, { name: "recover", unremovable: true, maximum: 2, condition: 0, d6: 2 }, { name: "poison_resistance", maximum: 2, condition: 0 }] },
											speed:      { maximum: 8, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 2, condition: 0 }, { name: "jump", maximum: 5, condition: 0 }, { name: "swim", maximum: 5, condition: 0 }, { name: "sneak", maximum: 3, condition: 0 }] }
										},
										items: [
											{name:"axe",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:5},{statistic:"strength",skill:"throw",d6:5}],weight:2,hands:1,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:50,description:" ",id:"yeqfovhaquvlzuus"},
											{name:"long staff",count:1,type:"weapon",usage:[{statistic:"strength",skill:"melee",d6:6}],weight:6,hands:2,fuel:4,materials:"wood",cost:60,description:" ",id:"aunayoybjrwjejnn"},
											{name:"wooden shield",count:1,type:"shield",d6:4,weight:10,fuel:3,hands:1,usage:[{statistic:"strength",skill:"melee",d6:3}],materials:"wood",cost:50,description:" ",id:"azwvgxetbvshdxtj"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"concoction of smoke",count:1,type:"potion",weight:0.5,usage:[{statistic:"strength",skill:"throw",d6:3}],"recipe":{"w":10,"r":4,"g":2,"b":2},"conditions":{"smoke":2},cost:16,description:"causes smoke in 5-ft square and surrounding 5-ft squares for 2d6 rounds",id:"qiqrjziyuizptbmh"},
										]
									},
									{
										info: {
											name: "lizardfolk child",
											demographics: { race: "lizardfolk", age: 10, sex: "", height: 3.5, weight: 75 },
											description: "Standard fantasy lizard people, with medium-sized reptilian/humanoid bodies, forked tongues, webbed feet, and scales.",
											status: { points: 0, burden: 3, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 8, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 6, condition: 0 }, { name: "sound", unremovable: true, maximum: 5, condition: 0 }, { name: "scent", unremovable: true, maximum: 7, condition: 0 }, { name: "taste", unremovable: true, maximum: 7, condition: 0 }, { name: "touch", unremovable: true, maximum: 3, condition: 0 }, { name: "camouflage", maximum: 14, condition: 0}] },
											memory:     { maximum: 4, damage: 0, condition: 0, skills: [{ name: "lang_lizardfolk", maximum: 7, condition: 0 }] },
											logic:      { maximum: 4, damage: 0, condition: 0, skills: [] },
											strength:   { maximum: 4, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 1, condition: 0 }, { name: "throw", maximum: 1, condition: 0, combat: true }] },
											dexterity:  { maximum: 4, damage: 0, condition: 0, skills: [{ name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 2, condition: 0, d6: 2 }, { name: "poison_resistance", maximum: 2, condition: 0 }] },
											speed:      { maximum: 5, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 2, condition: 0 }, { name: "jump", maximum: 5, condition: 0 }, { name: "swim", maximum: 5, condition: 0 }, { name: "sneak", maximum: 3, condition: 0 }] }
										},
										items: [
											{name:"clothes",count:1,type:"armor",armorType:"body",d6:1,weight:1,fuel:2,materials:"cloth",cost:10,description:" ",id:"rbxzkdzgldgzqlok"},
											{name:"shoes",count:1,type:"armor",armorType:"legs",d6:1,weight:2,fuel:2,materials:"cloth",cost:10,description:" ",id:"kjlbatbkkevyzedf"},
										]
									},
									{
										info: {
											name: "lizardfolk boss",
											demographics: { race: "lizardfolk", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Standard fantasy lizard people, with medium-sized reptilian/humanoid bodies, forked tongues, webbed feet, and scales.",
											status: { points: 0, burden: 52, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 10, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 6, condition: 0 }, { name: "sound", unremovable: true, maximum: 5, condition: 0 }, { name: "scent", unremovable: true, maximum: 7, condition: 0 }, { name: "taste", unremovable: true, maximum: 7, condition: 0 }, { name: "touch", unremovable: true, maximum: 3, condition: 0 }, { name: "camouflage", maximum: 14, condition: 0}] },
											memory:     { maximum: 8, damage: 0, condition: 0, skills: [{ name: "lang_lizardfolk", maximum: 7, condition: 0 }] },
											logic:      { maximum: 8, damage: 0, condition: 0, skills: [{ name: "intimidate", maximum: 7, condition: 0, charisma: true, counters: ["remain_calm"] }, { name: "judge_character", maximum: 7, condition: 0 }] },
											strength:   { maximum: 9, damage: 0, condition: 0, skills: [{ name: "melee", combat: true, maximum: 7, condition: 0 }, { name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 1, condition: 0 }, { name: "throw", maximum: 1, condition: 0, combat: true }] },
											dexterity:  { maximum: 9, damage: 0, condition: 0, skills: [{ name: "fencing", combat: true, maximum: 7, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 9, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 2, condition: 0, d6: 2 }, { name: "poison_resistance", maximum: 2, condition: 0 }] },
											speed:      { maximum: 10, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 2, condition: 0 }, { name: "jump", maximum: 5, condition: 0 }, { name: "swim", maximum: 5, condition: 0 }, { name: "sneak", maximum: 3, condition: 0 }] }
										},
										items: [
											{name:"long sword",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:7}],weight:5,hands:2,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:80,description:" ",id:"ystexytmmlneqixo"},
											{name:"warhammer",count:1,type:"weapon",usage:[{statistic:"strength",skill:"melee",d6:7}],weight:6,hands:2,magnetic:true,materials:"leather, metal",cost:80,description:" ",id:"dzgovmpmngryoart"},
											{name:"chainmail armor",count:1,type:"armor",armorType:"body",d6:5,weight:25,magnetic:true,materials:"metal",cost:70,description:"conducts electricity",id:"cwmbegsjhgbqwosn"},
											{name:"chainmail helmet",count:1,type:"armor",armorType:"head",d6:5,weight:5,magnetic:true,materials:"metal",cost:20,description:"conducts electricity",id:"wkthclgbkefjqqud"},
											{name:"chainmail gloves",count:1,type:"armor",armorType:"hands",d6:5,weight:4,magnetic:true,materials:"metal",cost:20,description:"conducts electricity",id:"wcsmkdyfecarrovp"},
											{name:"chainmail boots",count:1,type:"armor",armorType:"legs",d6:5,weight:6,magnetic:true,materials:"metal",cost:40,description:"conducts electricity",id:"ufadgpukpeambjnx"},
											{name:"potion of strong healing",count:1,type:"healing",weight:0.5,"recipe":{"w":10,"r":0,"g":7,"b":0},d6:2,"conditions":{"bleeding":0},cost:14,description:"removes 2d6 damage",id:"fgbobzjuccaaqvfj"},
											{name:"potion of flashbang",count:1,type:"potion",weight:0.5,"recipe":{"w":10,"r":6,"g":0,"b":6},d6:3,"conditions":{"loud_noise":1,"blinding_light":1},cost:24,description:"causes loud noise and blinding light for 1d6 rounds; explosion causes 3d6 damage to 5-ft square and surrounding 5-ft squares",id:"qsgqgreexyztuwmy"}
										]
									},

								// bhios
									{
										info: {
											name: "bhios smart",
											demographics: { race: "bhios", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "These forest-dwelling hominins are logical, passionate, and well-spoken. They’ve adapted to a mostly peaceful and democratic existence, if technologically stagnant.",
											status: { points: 0, burden: 27, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 8, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 7, condition: 0 }, { name: "sound", unremovable: true, maximum: 6, condition: 0 }, { name: "scent", unremovable: true, maximum: 5, condition: 0 }, { name: "taste", unremovable: true, maximum: 5, condition: 0 }, { name: "touch", unremovable: true, maximum: 5, condition: 0 }] },
											memory:     { maximum: 9, damage: 0, condition: 0, skills: [{ name: "lang_bhios", maximum: 7, condition: 0 }, { name: "medicine", maximum: 5, condition: 0 }] },
											logic:      { maximum: 10, damage: 0, condition: 0, skills: [{ name: "mechanics", maximum: 5, condition: 0 }, { name: "remain_calm", maximum: 2, condition: 0 }] },
											strength:   { maximum: 5, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 2, condition: 0 }, { name: "throw", maximum: 3, condition: 0, combat: true }, { name: "climb", maximum: 2, condition: 0 }] },
											dexterity:  { maximum: 6, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 5, condition: 0 }, { name: "knifing", combat: true, maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 3, condition: 0, d6: 2}] },
											speed:      { maximum: 5, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 3, condition: 0 }, { name: "jump", maximum: 3, condition: 0 }, { name: "swim", maximum: 3, condition: 0 }] }
										},
										items: [
											{name:"stonebow",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"missile"}],weight:3,hands:2,fuel:2,materials:"wood, string, metal",cost:70,description:"range: 50 ft",id:"lwxxxnluronoevbx"},
											{name:"rock orb",count:10,type:"ammunition",weapons:["sling","bomb","stonebow","gauss pistol"],weight:0.5,usage:[{statistic:"dexterity",skill:"missile",d6:3},{statistic:"strength",skill:"throw",d6:3}],hands:1,materials:"stone",cost:1,description:" ",id:"blcgrpuidapffjvr"},
											{name:"dagger",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"knifing",d6:3},{statistic:"strength",skill:"throw",d6:3}],weight:1,hands:1,magnetic:true,conditions:{bleeding:1},materials:"metal",cost:10,description:" ",id:"zexbxnhhkntluxke"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"book",count:1,weight:3,hands:1,usage:[{statistic:"memory",skill:"astronomy",modifier:5}],fuel:1,materials:"paper",cost:5,description:"+5 specific memory/logic skill (mathematics, alchemy, zoology, etc.)",id:"ctpvtxpllbiibxhw"},
										]
									},
									{
										info: {
											name: "bhios skilled",
											demographics: { race: "bhios", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "These forest-dwelling hominins are logical, passionate, and well-spoken. They’ve adapted to a mostly peaceful and democratic existence, if technologically stagnant.",
											status: { points: 0, burden: 24, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 8, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 7, condition: 0 }, { name: "sound", unremovable: true, maximum: 6, condition: 0 }, { name: "scent", unremovable: true, maximum: 5, condition: 0 }, { name: "taste", unremovable: true, maximum: 5, condition: 0 }, { name: "touch", unremovable: true, maximum: 5, condition: 0 }] },
											memory:     { maximum: 6, damage: 0, condition: 0, skills: [{ name: "lang_bhios", maximum: 7, condition: 0 }] },
											logic:      { maximum: 5, damage: 0, condition: 0, skills: [{ name: "pattern_recognition", maximum: 5, condition: 0 }, { name: "remain_calm", maximum: 2, condition: 0 }] },
											strength:   { maximum: 5, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 2, condition: 0 }, { name: "throw", maximum: 3, condition: 0, combat: true }, { name: "climb", maximum: 2, condition: 0 }] },
											dexterity:  { maximum: 9, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 5, condition: 0 }, { name: "fencing", combat: true, maximum: 5, condition: 0 }, { name: "escape_bonds", maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 7, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 3, condition: 0, d6: 2}] },
											speed:      { maximum: 8, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 3, condition: 0 }, { name: "jump", maximum: 3, condition: 0 }, { name: "swim", maximum: 3, condition: 0 }] }
										},
										items: [
											{name:"stonebow",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"missile"}],weight:3,hands:2,fuel:2,materials:"wood, string, metal",cost:70,description:"range: 50 ft",id:"lwxxxnluronoevbx"},
											{name:"glass orb",count:10,type:"ammunition",weapons:["sling","bomb","stonebow","gauss pistol"],weight:0.1,usage:[{statistic:"dexterity",skill:"missile",d6:3},{statistic:"strength",skill:"throw",d6:3}],hands:1,conditions:{bleeding:1},materials:"glass",cost:4,description:"shatters on impact",id:"sbkuydbixlpqyats"},
											{name:"short sword",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:5}],weight:2,hands:1,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:50,description:" ",id:"grwjcuryhftbylps"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"rope",count:1,weight:2,usage:[{statistic:"strength",skill:"climb",modifier:5},{statistic:"dexterity",skill:"crafting"}],fuel:2,materials:"string",cost:10,description:"10 feet; +5 climbing; helps with crafting",id:"vkafrmfqhqivchjp"},
											{name:"spyglass",count:1,weight:1,hands:1,usage:[{statistic:"perception",skill:"sight",modifier:10},{statistic:"dexterity",skill:"missile",modifier:5}],materials:"wood, metal, glass",cost:35,description:"for viewing far distances (+10 sight) and accuracy with aim (+5 missile)",id:"hhozcolalgovetay"},
										]
									},
									{
										info: {
											name: "bhios strong",
											demographics: { race: "bhios", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "These forest-dwelling hominins are logical, passionate, and well-spoken. They’ve adapted to a mostly peaceful and democratic existence, if technologically stagnant.",
											status: { points: 0, burden: 33.5, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 8, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 7, condition: 0 }, { name: "sound", unremovable: true, maximum: 6, condition: 0 }, { name: "scent", unremovable: true, maximum: 5, condition: 0 }, { name: "taste", unremovable: true, maximum: 5, condition: 0 }, { name: "touch", unremovable: true, maximum: 5, condition: 0 }] },
											memory:     { maximum: 6, damage: 0, condition: 0, skills: [{ name: "lang_bhios", maximum: 7, condition: 0 }] },
											logic:      { maximum: 5, damage: 0, condition: 0, skills: [{ name: "remain_calm", maximum: 2, condition: 0 }] },
											strength:   { maximum: 9, damage: 0, condition: 0, skills: [{ name: "archery", maximum: 5, condition: 0 }, { name: "melee", combat: true, maximum: 5, condition: 0 }, { name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 2, condition: 0 }, { name: "throw", maximum: 3, condition: 0, combat: true }, { name: "climb", maximum: 2, condition: 0 }] },
											dexterity:  { maximum: 5, damage: 0, condition: 0, skills: [{ name: "fencing", combat: true, maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 9, damage: 0, condition: 0, skills: [{ name: "pain_tolerance", maximum: 5, condition: 0 }, { name: "recover", unremovable: true, maximum: 3, condition: 0, d6: 2}] },
											speed:      { maximum: 7, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 3, condition: 0 }, { name: "jump", maximum: 3, condition: 0 }, { name: "swim", maximum: 3, condition: 0 }] }
										},
										items: [
											{name:"axe",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:5},{statistic:"strength",skill:"throw",d6:5}],weight:2,hands:1,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:50,description:" ",id:"yeqfovhaquvlzuus"},
											{name:"long staff",count:1,type:"weapon",usage:[{statistic:"strength",skill:"melee",d6:6}],weight:6,hands:2,fuel:4,materials:"wood",cost:60,description:" ",id:"aunayoybjrwjejnn"},
											{name:"wooden shield",count:1,type:"shield",d6:4,weight:10,fuel:3,hands:1,usage:[{statistic:"strength",skill:"melee",d6:3}],materials:"wood",cost:50,description:" ",id:"azwvgxetbvshdxtj"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"concoction of smoke",count:1,type:"potion",weight:0.5,usage:[{statistic:"strength",skill:"throw",d6:3}],"recipe":{"w":10,"r":4,"g":2,"b":2},"conditions":{"smoke":2},cost:16,description:"causes smoke in 5-ft square and surrounding 5-ft squares for 2d6 rounds",id:"qiqrjziyuizptbmh"},
										]
									},
									{
										info: {
											name: "bhios child",
											demographics: { race: "bhios", age: 10, sex: "", height: 4, weight: 75 },
											description: "These forest-dwelling hominins are logical, passionate, and well-spoken. They’ve adapted to a mostly peaceful and democratic existence, if technologically stagnant.",
											status: { points: 0, burden: 3, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 8, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 7, condition: 0 }, { name: "sound", unremovable: true, maximum: 6, condition: 0 }, { name: "scent", unremovable: true, maximum: 5, condition: 0 }, { name: "taste", unremovable: true, maximum: 5, condition: 0 }, { name: "touch", unremovable: true, maximum: 5, condition: 0 }] },
											memory:     { maximum: 4, damage: 0, condition: 0, skills: [{ name: "lang_bhios", maximum: 7, condition: 0 }] },
											logic:      { maximum: 5, damage: 0, condition: 0, skills: [{ name: "remain_calm", maximum: 2, condition: 0 }] },
											strength:   { maximum: 4, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 2, condition: 0 }, { name: "throw", maximum: 3, condition: 0, combat: true }, { name: "climb", maximum: 2, condition: 0 }] },
											dexterity:  { maximum: 4, damage: 0, condition: 0, skills: [{ name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 3, condition: 0, d6: 2}] },
											speed:      { maximum: 4, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 3, condition: 0 }, { name: "jump", maximum: 3, condition: 0 }, { name: "swim", maximum: 3, condition: 0 }] }
										},
										items: [
											{name:"clothes",count:1,type:"armor",armorType:"body",d6:1,weight:1,fuel:2,materials:"cloth",cost:10,description:" ",id:"rbxzkdzgldgzqlok"},
											{name:"shoes",count:1,type:"armor",armorType:"legs",d6:1,weight:2,fuel:2,materials:"cloth",cost:10,description:" ",id:"kjlbatbkkevyzedf"},
										]
									},
									{
										info: {
											name: "bhios boss",
											demographics: { race: "bhios", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "These forest-dwelling hominins are logical, passionate, and well-spoken. They’ve adapted to a mostly peaceful and democratic existence, if technologically stagnant.",
											status: { points: 0, burden: 52, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 10, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 7, condition: 0 }, { name: "sound", unremovable: true, maximum: 6, condition: 0 }, { name: "scent", unremovable: true, maximum: 5, condition: 0 }, { name: "taste", unremovable: true, maximum: 5, condition: 0 }, { name: "touch", unremovable: true, maximum: 5, condition: 0 }] },
											memory:     { maximum: 9, damage: 0, condition: 0, skills: [{ name: "lang_bhios", maximum: 7, condition: 0 }] },
											logic:      { maximum: 10, damage: 0, condition: 0, skills: [{ name: "intimidate", maximum: 7, condition: 0, charisma: true, counters: ["remain_calm"] }, { name: "judge_character", maximum: 7, condition: 0 }, { name: "remain_calm", maximum: 2, condition: 0 }] },
											strength:   { maximum: 8, damage: 0, condition: 0, skills: [{ name: "melee", combat: true, maximum: 7, condition: 0 }, { name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 2, condition: 0 }, { name: "throw", maximum: 3, condition: 0, combat: true }, { name: "climb", maximum: 2, condition: 0 }] },
											dexterity:  { maximum: 8, damage: 0, condition: 0, skills: [{ name: "fencing", combat: true, maximum: 7, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 10, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 3, condition: 0, d6: 2}] },
											speed:      { maximum: 8, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 3, condition: 0 }, { name: "jump", maximum: 3, condition: 0 }, { name: "swim", maximum: 3, condition: 0 }] }
										},
										items: [
											{name:"long sword",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:7}],weight:5,hands:2,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:80,description:" ",id:"ystexytmmlneqixo"},
											{name:"warhammer",count:1,type:"weapon",usage:[{statistic:"strength",skill:"melee",d6:7}],weight:6,hands:2,magnetic:true,materials:"leather, metal",cost:80,description:" ",id:"dzgovmpmngryoart"},
											{name:"chainmail armor",count:1,type:"armor",armorType:"body",d6:5,weight:25,magnetic:true,materials:"metal",cost:70,description:"conducts electricity",id:"cwmbegsjhgbqwosn"},
											{name:"chainmail helmet",count:1,type:"armor",armorType:"head",d6:5,weight:5,magnetic:true,materials:"metal",cost:20,description:"conducts electricity",id:"wkthclgbkefjqqud"},
											{name:"chainmail gloves",count:1,type:"armor",armorType:"hands",d6:5,weight:4,magnetic:true,materials:"metal",cost:20,description:"conducts electricity",id:"wcsmkdyfecarrovp"},
											{name:"chainmail boots",count:1,type:"armor",armorType:"legs",d6:5,weight:6,magnetic:true,materials:"metal",cost:40,description:"conducts electricity",id:"ufadgpukpeambjnx"},
											{name:"potion of strong healing",count:1,type:"healing",weight:0.5,"recipe":{"w":10,"r":0,"g":7,"b":0},d6:2,"conditions":{"bleeding":0},cost:14,description:"removes 2d6 damage",id:"fgbobzjuccaaqvfj"},
											{name:"potion of flashbang",count:1,type:"potion",weight:0.5,"recipe":{"w":10,"r":6,"g":0,"b":6},d6:3,"conditions":{"loud_noise":1,"blinding_light":1},cost:24,description:"causes loud noise and blinding light for 1d6 rounds; explosion causes 3d6 damage to 5-ft square and surrounding 5-ft squares",id:"qsgqgreexyztuwmy"}
										]
									},

								// mellifax
									{
										info: {
											name: "mellifax smart",
											demographics: { race: "mellifax", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Between three and four feet tall, these fairy folk are small, but clever. A secluded people, living in underground forest hives, they are often driven by racial ties, and have a close bond and deep understanding of nature.",
											status: { points: 0, burden: 27, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 8, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 3, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 6, condition: 0 }, { name: "taste", unremovable: true, maximum: 5, condition: 0 }, { name: "touch", unremovable: true, maximum: 7, condition: 0 }] },
											memory:     { maximum: 9, damage: 0, condition: 0, skills: [{ name: "lang_mellifax", maximum: 7, condition: 0 }, { name: "medicine", maximum: 5, condition: 0 }] },
											logic:      { maximum: 8, damage: 0, condition: 0, skills: [{ name: "mechanics", maximum: 5, condition: 0 }] },
											strength:   { maximum: 5, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 1, condition: 0 }, { name: "throw", maximum: 4, condition: 0, combat: true }] },
											dexterity:  { maximum: 6, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 5, condition: 0 }, { name: "knifing", combat: true, maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 7, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}, { name: "poison_resistance", maximum: 3, condition: 0 }] },
											speed:      { maximum: 6, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 3, condition: 0 }, { name: "jump", maximum: 5, condition: 0 }, { name: "swim", maximum: 1, condition: 0 }, { name: "fly", maximum: 10, condition: 0 }, { name: "dodge", maximum: 2, condition: 0 }, { name: "sneak", maximum: 2, condition: 0 }] }
										},
										items: [
											{name:"stonebow",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"missile"}],weight:3,hands:2,fuel:2,materials:"wood, string, metal",cost:70,description:"range: 50 ft",id:"lwxxxnluronoevbx"},
											{name:"rock orb",count:10,type:"ammunition",weapons:["sling","bomb","stonebow","gauss pistol"],weight:0.5,usage:[{statistic:"dexterity",skill:"missile",d6:3},{statistic:"strength",skill:"throw",d6:3}],hands:1,materials:"stone",cost:1,description:" ",id:"blcgrpuidapffjvr"},
											{name:"dagger",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"knifing",d6:3},{statistic:"strength",skill:"throw",d6:3}],weight:1,hands:1,magnetic:true,conditions:{bleeding:1},materials:"metal",cost:10,description:" ",id:"zexbxnhhkntluxke"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"book",count:1,weight:3,hands:1,usage:[{statistic:"memory",skill:"astronomy",modifier:5}],fuel:1,materials:"paper",cost:5,description:"+5 specific memory/logic skill (mathematics, alchemy, zoology, etc.)",id:"ctpvtxpllbiibxhw"},
										]
									},
									{
										info: {
											name: "mellifax skilled",
											demographics: { race: "mellifax", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Between three and four feet tall, these fairy folk are small, but clever. A secluded people, living in underground forest hives, they are often driven by racial ties, and have a close bond and deep understanding of nature.",
											status: { points: 0, burden: 24, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 9, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 3, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 6, condition: 0 }, { name: "taste", unremovable: true, maximum: 5, condition: 0 }, { name: "touch", unremovable: true, maximum: 7, condition: 0 }] },
											memory:     { maximum: 5, damage: 0, condition: 0, skills: [{ name: "lang_mellifax", maximum: 7, condition: 0 }] },
											logic:      { maximum: 6, damage: 0, condition: 0, skills: [{ name: "pattern_recognition", maximum: 5, condition: 0 }] },
											strength:   { maximum: 5, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 1, condition: 0 }, { name: "throw", maximum: 4, condition: 0, combat: true }] },
											dexterity:  { maximum: 9, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 5, condition: 0 }, { name: "fencing", combat: true, maximum: 5, condition: 0 }, { name: "escape_bonds", maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}, { name: "poison_resistance", maximum: 3, condition: 0 }] },
											speed:      { maximum: 9, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 3, condition: 0 }, { name: "jump", maximum: 5, condition: 0 }, { name: "swim", maximum: 1, condition: 0 }, { name: "fly", maximum: 10, condition: 0 }, { name: "dodge", maximum: 2, condition: 0 }, { name: "sneak", maximum: 2, condition: 0 }] }
										},
										items: [
											{name:"stonebow",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"missile"}],weight:3,hands:2,fuel:2,materials:"wood, string, metal",cost:70,description:"range: 50 ft",id:"lwxxxnluronoevbx"},
											{name:"glass orb",count:10,type:"ammunition",weapons:["sling","bomb","stonebow","gauss pistol"],weight:0.1,usage:[{statistic:"dexterity",skill:"missile",d6:3},{statistic:"strength",skill:"throw",d6:3}],hands:1,conditions:{bleeding:1},materials:"glass",cost:4,description:"shatters on impact",id:"sbkuydbixlpqyats"},
											{name:"short sword",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:5}],weight:2,hands:1,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:50,description:" ",id:"grwjcuryhftbylps"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"rope",count:1,weight:2,usage:[{statistic:"strength",skill:"climb",modifier:5},{statistic:"dexterity",skill:"crafting"}],fuel:2,materials:"string",cost:10,description:"10 feet; +5 climbing; helps with crafting",id:"vkafrmfqhqivchjp"},
											{name:"spyglass",count:1,weight:1,hands:1,usage:[{statistic:"perception",skill:"sight",modifier:10},{statistic:"dexterity",skill:"missile",modifier:5}],materials:"wood, metal, glass",cost:35,description:"for viewing far distances (+10 sight) and accuracy with aim (+5 missile)",id:"hhozcolalgovetay"},
										]
									},
									{
										info: {
											name: "mellifax strong",
											demographics: { race: "mellifax", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Between three and four feet tall, these fairy folk are small, but clever. A secluded people, living in underground forest hives, they are often driven by racial ties, and have a close bond and deep understanding of nature.",
											status: { points: 0, burden: 33.5, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 9, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 3, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 6, condition: 0 }, { name: "taste", unremovable: true, maximum: 5, condition: 0 }, { name: "touch", unremovable: true, maximum: 7, condition: 0 }] },
											memory:     { maximum: 5, damage: 0, condition: 0, skills: [{ name: "lang_mellifax", maximum: 7, condition: 0 }] },
											logic:      { maximum: 5, damage: 0, condition: 0, skills: [{ name: "remain_calm", maximum: 5, condition: 0 }] },
											strength:   { maximum: 8, damage: 0, condition: 0, skills: [{ name: "melee", combat: true, maximum: 5, condition: 0 }, { name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 1, condition: 0 }, { name: "throw", maximum: 4, condition: 0, combat: true }] },
											dexterity:  { maximum: 6, damage: 0, condition: 0, skills: [{ name: "fencing", combat: true, maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 9, damage: 0, condition: 0, skills: [{ name: "pain_tolerance", maximum: 5, condition: 0 }, { name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}, { name: "poison_resistance", maximum: 3, condition: 0 }] },
											speed:      { maximum: 7, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 3, condition: 0 }, { name: "jump", maximum: 5, condition: 0 }, { name: "swim", maximum: 1, condition: 0 }, { name: "fly", maximum: 10, condition: 0 }, { name: "dodge", maximum: 2, condition: 0 }, { name: "sneak", maximum: 2, condition: 0 }] }
										},
										items: [
											{name:"axe",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:5},{statistic:"strength",skill:"throw",d6:5}],weight:2,hands:1,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:50,description:" ",id:"yeqfovhaquvlzuus"},
											{name:"long staff",count:1,type:"weapon",usage:[{statistic:"strength",skill:"melee",d6:6}],weight:6,hands:2,fuel:4,materials:"wood",cost:60,description:" ",id:"aunayoybjrwjejnn"},
											{name:"wooden shield",count:1,type:"shield",d6:4,weight:10,fuel:3,hands:1,usage:[{statistic:"strength",skill:"melee",d6:3}],materials:"wood",cost:50,description:" ",id:"azwvgxetbvshdxtj"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"concoction of smoke",count:1,type:"potion",weight:0.5,usage:[{statistic:"strength",skill:"throw",d6:3}],"recipe":{"w":10,"r":4,"g":2,"b":2},"conditions":{"smoke":2},cost:16,description:"causes smoke in 5-ft square and surrounding 5-ft squares for 2d6 rounds",id:"qiqrjziyuizptbmh"},
										]
									},
									{
										info: {
											name: "mellifax child",
											demographics: { race: "mellifax", age: 10, sex: "", height: 3, weight: 50 },
											description: "Between three and four feet tall, these fairy folk are small, but clever. A secluded people, living in underground forest hives, they are often driven by racial ties, and have a close bond and deep understanding of nature.",
											status: { points: 0, burden: 3, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 8, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 3, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 6, condition: 0 }, { name: "taste", unremovable: true, maximum: 5, condition: 0 }, { name: "touch", unremovable: true, maximum: 7, condition: 0 }] },
											memory:     { maximum: 4, damage: 0, condition: 0, skills: [{ name: "lang_mellifax", maximum: 7, condition: 0 }] },
											logic:      { maximum: 4, damage: 0, condition: 0, skills: [] },
											strength:   { maximum: 3, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 1, condition: 0 }, { name: "throw", maximum: 4, condition: 0, combat: true }] },
											dexterity:  { maximum: 5, damage: 0, condition: 0, skills: [{ name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}, { name: "poison_resistance", maximum: 3, condition: 0 }] },
											speed:      { maximum: 5, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 3, condition: 0 }, { name: "jump", maximum: 5, condition: 0 }, { name: "swim", maximum: 1, condition: 0 }, { name: "fly", maximum: 10, condition: 0 }, { name: "dodge", maximum: 2, condition: 0 }, { name: "sneak", maximum: 2, condition: 0 }] }
										},
										items: [
											{name:"clothes",count:1,type:"armor",armorType:"body",d6:1,weight:1,fuel:2,materials:"cloth",cost:10,description:" ",id:"rbxzkdzgldgzqlok"},
											{name:"shoes",count:1,type:"armor",armorType:"legs",d6:1,weight:2,fuel:2,materials:"cloth",cost:10,description:" ",id:"kjlbatbkkevyzedf"},
										]
									},
									{
										info: {
											name: "mellifax boss",
											demographics: { race: "mellifax", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Between three and four feet tall, these fairy folk are small, but clever. A secluded people, living in underground forest hives, they are often driven by racial ties, and have a close bond and deep understanding of nature.",
											status: { points: 0, burden: 52, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 10, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 3, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 6, condition: 0 }, { name: "taste", unremovable: true, maximum: 5, condition: 0 }, { name: "touch", unremovable: true, maximum: 7, condition: 0 }] },
											memory:     { maximum: 8, damage: 0, condition: 0, skills: [{ name: "lang_mellifax", maximum: 7, condition: 0 }] },
											logic:      { maximum: 8, damage: 0, condition: 0, skills: [{ name: "intimidate", maximum: 7, condition: 0, charisma: true, counters: ["remain_calm"] }, { name: "judge_character", maximum: 7, condition: 0 }] },
											strength:   { maximum: 8, damage: 0, condition: 0, skills: [{ name: "melee", combat: true, maximum: 7, condition: 0 }, { name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 1, condition: 0 }, { name: "throw", maximum: 4, condition: 0, combat: true }] },
											dexterity:  { maximum: 9, damage: 0, condition: 0, skills: [{ name: "fencing", combat: true, maximum: 7, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 10, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}, { name: "poison_resistance", maximum: 3, condition: 0 }] },
											speed:      { maximum: 10, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 3, condition: 0 }, { name: "jump", maximum: 5, condition: 0 }, { name: "swim", maximum: 1, condition: 0 }, { name: "fly", maximum: 10, condition: 0 }, { name: "dodge", maximum: 2, condition: 0 }, { name: "sneak", maximum: 2, condition: 0 }] }
										},
										items: [
											{name:"long sword",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:7}],weight:5,hands:2,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:80,description:" ",id:"ystexytmmlneqixo"},
											{name:"warhammer",count:1,type:"weapon",usage:[{statistic:"strength",skill:"melee",d6:7}],weight:6,hands:2,magnetic:true,materials:"leather, metal",cost:80,description:" ",id:"dzgovmpmngryoart"},
											{name:"chainmail armor",count:1,type:"armor",armorType:"body",d6:5,weight:25,magnetic:true,materials:"metal",cost:70,description:"conducts electricity",id:"cwmbegsjhgbqwosn"},
											{name:"chainmail helmet",count:1,type:"armor",armorType:"head",d6:5,weight:5,magnetic:true,materials:"metal",cost:20,description:"conducts electricity",id:"wkthclgbkefjqqud"},
											{name:"chainmail gloves",count:1,type:"armor",armorType:"hands",d6:5,weight:4,magnetic:true,materials:"metal",cost:20,description:"conducts electricity",id:"wcsmkdyfecarrovp"},
											{name:"chainmail boots",count:1,type:"armor",armorType:"legs",d6:5,weight:6,magnetic:true,materials:"metal",cost:40,description:"conducts electricity",id:"ufadgpukpeambjnx"},
											{name:"potion of strong healing",count:1,type:"healing",weight:0.5,"recipe":{"w":10,"r":0,"g":7,"b":0},d6:2,"conditions":{"bleeding":0},cost:14,description:"removes 2d6 damage",id:"fgbobzjuccaaqvfj"},
											{name:"potion of flashbang",count:1,type:"potion",weight:0.5,"recipe":{"w":10,"r":6,"g":0,"b":6},d6:3,"conditions":{"loud_noise":1,"blinding_light":1},cost:24,description:"causes loud noise and blinding light for 1d6 rounds; explosion causes 3d6 damage to 5-ft square and surrounding 5-ft squares",id:"qsgqgreexyztuwmy"}
										]
									},

								// preas
									{
										info: {
											name: "preas smart",
											demographics: { race: "preas", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Tradition and clan loyalty hold first priority for this dark-purple-skinned people, but a connection with animal life is close behind. They have developed a symbiotic relationship with dozens of forest, mountain, and plains creatures.",
											status: { points: 0, burden: 27, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 8, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 7, condition: 0 }, { name: "sound", unremovable: true, maximum: 5, condition: 0 }, { name: "scent", unremovable: true, maximum: 6, condition: 0 }, { name: "taste", unremovable: true, maximum: 5, condition: 0 }, { name: "touch", unremovable: true, maximum: 5, condition: 0 }] },
											memory:     { maximum: 10, damage: 0, condition: 0, skills: [{ name: "lang_preas", maximum: 7, condition: 0 }, { name: "medicine", maximum: 5, condition: 0 }, { name: "facial_recognition", maximum: 3, condition: 0 }] },
											logic:      { maximum: 8, damage: 0, condition: 0, skills: [{ name: "mechanics", maximum: 5, condition: 0 }, { name: "handle_animals", maximum: 7, condition: 0, charisma: true, counters: ["judge_character", "aggression"] }, { name: "evoke_emotion", maximum: 2, condition: 0, charisma: true, counters: ["judge_character", "remain_calm"] }] },
											strength:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 1, condition: 0 }, { name: "throw", maximum: 2, condition: 0, combat: true }] },
											dexterity:  { maximum: 6, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 5, condition: 0 }, { name: "knifing", combat: true, maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "ride_animals", maximum: 2, condition: 0 }] },
											immunity:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}] },
											speed:      { maximum: 5, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 4, condition: 0 }, { name: "jump", maximum: 3, condition: 0 }, { name: "swim", maximum: 4, condition: 0 }] }
										},
										items: [
											{name:"stonebow",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"missile"}],weight:3,hands:2,fuel:2,materials:"wood, string, metal",cost:70,description:"range: 50 ft",id:"lwxxxnluronoevbx"},
											{name:"rock orb",count:10,type:"ammunition",weapons:["sling","bomb","stonebow","gauss pistol"],weight:0.5,usage:[{statistic:"dexterity",skill:"missile",d6:3},{statistic:"strength",skill:"throw",d6:3}],hands:1,materials:"stone",cost:1,description:" ",id:"blcgrpuidapffjvr"},
											{name:"dagger",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"knifing",d6:3},{statistic:"strength",skill:"throw",d6:3}],weight:1,hands:1,magnetic:true,conditions:{bleeding:1},materials:"metal",cost:10,description:" ",id:"zexbxnhhkntluxke"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"book",count:1,weight:3,hands:1,usage:[{statistic:"memory",skill:"astronomy",modifier:5}],fuel:1,materials:"paper",cost:5,description:"+5 specific memory/logic skill (mathematics, alchemy, zoology, etc.)",id:"ctpvtxpllbiibxhw"},
										]
									},
									{
										info: {
											name: "preas skilled",
											demographics: { race: "preas", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Tradition and clan loyalty hold first priority for this dark-purple-skinned people, but a connection with animal life is close behind. They have developed a symbiotic relationship with dozens of forest, mountain, and plains creatures.",
											status: { points: 0, burden: 24, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 8, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 7, condition: 0 }, { name: "sound", unremovable: true, maximum: 5, condition: 0 }, { name: "scent", unremovable: true, maximum: 6, condition: 0 }, { name: "taste", unremovable: true, maximum: 5, condition: 0 }, { name: "touch", unremovable: true, maximum: 5, condition: 0 }] },
											memory:     { maximum: 6, damage: 0, condition: 0, skills: [{ name: "lang_preas", maximum: 7, condition: 0 }, { name: "facial_recognition", maximum: 3, condition: 0 }] },
											logic:      { maximum: 6, damage: 0, condition: 0, skills: [{ name: "pattern_recognition", maximum: 5, condition: 0 }, { name: "handle_animals", maximum: 7, condition: 0, charisma: true, counters: ["judge_character", "aggression"] }, { name: "evoke_emotion", maximum: 2, condition: 0, charisma: true, counters: ["judge_character", "remain_calm"] }] },
											strength:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 1, condition: 0 }, { name: "throw", maximum: 2, condition: 0, combat: true }] },
											dexterity:  { maximum: 9, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 5, condition: 0 }, { name: "fencing", combat: true, maximum: 5, condition: 0 }, { name: "escape_bonds", maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "ride_animals", maximum: 2, condition: 0 }] },
											immunity:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}] },
											speed:      { maximum: 8, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 4, condition: 0 }, { name: "jump", maximum: 3, condition: 0 }, { name: "swim", maximum: 4, condition: 0 }] }
										},
										items: [
											{name:"stonebow",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"missile"}],weight:3,hands:2,fuel:2,materials:"wood, string, metal",cost:70,description:"range: 50 ft",id:"lwxxxnluronoevbx"},
											{name:"glass orb",count:10,type:"ammunition",weapons:["sling","bomb","stonebow","gauss pistol"],weight:0.1,usage:[{statistic:"dexterity",skill:"missile",d6:3},{statistic:"strength",skill:"throw",d6:3}],hands:1,conditions:{bleeding:1},materials:"glass",cost:4,description:"shatters on impact",id:"sbkuydbixlpqyats"},
											{name:"short sword",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:5}],weight:2,hands:1,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:50,description:" ",id:"grwjcuryhftbylps"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"rope",count:1,weight:2,usage:[{statistic:"strength",skill:"climb",modifier:5},{statistic:"dexterity",skill:"crafting"}],fuel:2,materials:"string",cost:10,description:"10 feet; +5 climbing; helps with crafting",id:"vkafrmfqhqivchjp"},
											{name:"spyglass",count:1,weight:1,hands:1,usage:[{statistic:"perception",skill:"sight",modifier:10},{statistic:"dexterity",skill:"missile",modifier:5}],materials:"wood, metal, glass",cost:35,description:"for viewing far distances (+10 sight) and accuracy with aim (+5 missile)",id:"hhozcolalgovetay"},
										]
									},
									{
										info: {
											name: "preas strong",
											demographics: { race: "preas", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Tradition and clan loyalty hold first priority for this dark-purple-skinned people, but a connection with animal life is close behind. They have developed a symbiotic relationship with dozens of forest, mountain, and plains creatures.",
											status: { points: 0, burden: 33.5, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 8, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 7, condition: 0 }, { name: "sound", unremovable: true, maximum: 5, condition: 0 }, { name: "scent", unremovable: true, maximum: 6, condition: 0 }, { name: "taste", unremovable: true, maximum: 5, condition: 0 }, { name: "touch", unremovable: true, maximum: 5, condition: 0 }] },
											memory:     { maximum: 6, damage: 0, condition: 0, skills: [{ name: "lang_preas", maximum: 7, condition: 0 }, { name: "facial_recognition", maximum: 3, condition: 0 }] },
											logic:      { maximum: 5, damage: 0, condition: 0, skills: [{ name: "remain_calm", maximum: 5, condition: 0 }, { name: "handle_animals", maximum: 7, condition: 0, charisma: true, counters: ["judge_character", "aggression"] }, { name: "evoke_emotion", maximum: 2, condition: 0, charisma: true, counters: ["judge_character", "remain_calm"] }] },
											strength:   { maximum: 9, damage: 0, condition: 0, skills: [{ name: "melee", combat: true, maximum: 5, condition: 0 }, { name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 1, condition: 0 }, { name: "throw", maximum: 2, condition: 0, combat: true }] },
											dexterity:  { maximum: 6, damage: 0, condition: 0, skills: [{ name: "fencing", combat: true, maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "ride_animals", maximum: 2, condition: 0 }] },
											immunity:   { maximum: 8, damage: 0, condition: 0, skills: [{ name: "pain_tolerance", maximum: 5, condition: 0 }, { name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}] },
											speed:      { maximum: 7, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 4, condition: 0 }, { name: "jump", maximum: 3, condition: 0 }, { name: "swim", maximum: 4, condition: 0 }] }
										},
										items: [
											{name:"axe",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:5},{statistic:"strength",skill:"throw",d6:5}],weight:2,hands:1,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:50,description:" ",id:"yeqfovhaquvlzuus"},
											{name:"long staff",count:1,type:"weapon",usage:[{statistic:"strength",skill:"melee",d6:6}],weight:6,hands:2,fuel:4,materials:"wood",cost:60,description:" ",id:"aunayoybjrwjejnn"},
											{name:"wooden shield",count:1,type:"shield",d6:4,weight:10,fuel:3,hands:1,usage:[{statistic:"strength",skill:"melee",d6:3}],materials:"wood",cost:50,description:" ",id:"azwvgxetbvshdxtj"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"concoction of smoke",count:1,type:"potion",weight:0.5,usage:[{statistic:"strength",skill:"throw",d6:3}],"recipe":{"w":10,"r":4,"g":2,"b":2},"conditions":{"smoke":2},cost:16,description:"causes smoke in 5-ft square and surrounding 5-ft squares for 2d6 rounds",id:"qiqrjziyuizptbmh"},
										]
									},
									{
										info: {
											name: "preas child",
											demographics: { race: "preas", age: 10, sex: "", height: 4, weight: 75 },
											description: "Tradition and clan loyalty hold first priority for this dark-purple-skinned people, but a connection with animal life is close behind. They have developed a symbiotic relationship with dozens of forest, mountain, and plains creatures.",
											status: { points: 0, burden: 3, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 7, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 7, condition: 0 }, { name: "sound", unremovable: true, maximum: 5, condition: 0 }, { name: "scent", unremovable: true, maximum: 6, condition: 0 }, { name: "taste", unremovable: true, maximum: 5, condition: 0 }, { name: "touch", unremovable: true, maximum: 5, condition: 0 }] },
											memory:     { maximum: 4, damage: 0, condition: 0, skills: [{ name: "lang_preas", maximum: 7, condition: 0 }, { name: "facial_recognition", maximum: 3, condition: 0 }] },
											logic:      { maximum: 3, damage: 0, condition: 0, skills: [{ name: "handle_animals", maximum: 7, condition: 0, charisma: true, counters: ["judge_character", "aggression"] }, { name: "evoke_emotion", maximum: 2, condition: 0, charisma: true, counters: ["judge_character", "remain_calm"] }] },
											strength:   { maximum: 5, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 1, condition: 0 }, { name: "throw", maximum: 2, condition: 0, combat: true }] },
											dexterity:  { maximum: 5, damage: 0, condition: 0, skills: [{ name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "ride_animals", maximum: 2, condition: 0 }] },
											immunity:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}] },
											speed:      { maximum: 5, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 4, condition: 0 }, { name: "jump", maximum: 3, condition: 0 }, { name: "swim", maximum: 4, condition: 0 }] }
										},
										items: [
											{name:"clothes",count:1,type:"armor",armorType:"body",d6:1,weight:1,fuel:2,materials:"cloth",cost:10,description:" ",id:"rbxzkdzgldgzqlok"},
											{name:"shoes",count:1,type:"armor",armorType:"legs",d6:1,weight:2,fuel:2,materials:"cloth",cost:10,description:" ",id:"kjlbatbkkevyzedf"},
										]
									},
									{
										info: {
											name: "preas boss",
											demographics: { race: "preas", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Tradition and clan loyalty hold first priority for this dark-purple-skinned people, but a connection with animal life is close behind. They have developed a symbiotic relationship with dozens of forest, mountain, and plains creatures.",
											status: { points: 0, burden: 52, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 10, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 7, condition: 0 }, { name: "sound", unremovable: true, maximum: 5, condition: 0 }, { name: "scent", unremovable: true, maximum: 6, condition: 0 }, { name: "taste", unremovable: true, maximum: 5, condition: 0 }, { name: "touch", unremovable: true, maximum: 5, condition: 0 }] },
											memory:     { maximum: 9, damage: 0, condition: 0, skills: [{ name: "lang_preas", maximum: 7, condition: 0 }, { name: "facial_recognition", maximum: 3, condition: 0 }] },
											logic:      { maximum: 8, damage: 0, condition: 0, skills: [{ name: "intimidate", maximum: 7, condition: 0, charisma: true, counters: ["remain_calm"] }, { name: "judge_character", maximum: 7, condition: 0 }, { name: "handle_animals", maximum: 7, condition: 0, charisma: true, counters: ["judge_character", "aggression"] }, { name: "evoke_emotion", maximum: 2, condition: 0, charisma: true, counters: ["judge_character", "remain_calm"] }] },
											strength:   { maximum: 9, damage: 0, condition: 0, skills: [{ name: "melee", combat: true, maximum: 7, condition: 0 }, { name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 1, condition: 0 }, { name: "throw", maximum: 2, condition: 0, combat: true }] },
											dexterity:  { maximum: 9, damage: 0, condition: 0, skills: [{ name: "fencing", combat: true, maximum: 7, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "ride_animals", maximum: 2, condition: 0 }] },
											immunity:   { maximum: 9, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}] },
											speed:      { maximum: 9, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 4, condition: 0 }, { name: "jump", maximum: 3, condition: 0 }, { name: "swim", maximum: 4, condition: 0 }] }
										},
										items: [
											{name:"long sword",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:7}],weight:5,hands:2,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:80,description:" ",id:"ystexytmmlneqixo"},
											{name:"warhammer",count:1,type:"weapon",usage:[{statistic:"strength",skill:"melee",d6:7}],weight:6,hands:2,magnetic:true,materials:"leather, metal",cost:80,description:" ",id:"dzgovmpmngryoart"},
											{name:"chainmail armor",count:1,type:"armor",armorType:"body",d6:5,weight:25,magnetic:true,materials:"metal",cost:70,description:"conducts electricity",id:"cwmbegsjhgbqwosn"},
											{name:"chainmail helmet",count:1,type:"armor",armorType:"head",d6:5,weight:5,magnetic:true,materials:"metal",cost:20,description:"conducts electricity",id:"wkthclgbkefjqqud"},
											{name:"chainmail gloves",count:1,type:"armor",armorType:"hands",d6:5,weight:4,magnetic:true,materials:"metal",cost:20,description:"conducts electricity",id:"wcsmkdyfecarrovp"},
											{name:"chainmail boots",count:1,type:"armor",armorType:"legs",d6:5,weight:6,magnetic:true,materials:"metal",cost:40,description:"conducts electricity",id:"ufadgpukpeambjnx"},
											{name:"potion of strong healing",count:1,type:"healing",weight:0.5,"recipe":{"w":10,"r":0,"g":7,"b":0},d6:2,"conditions":{"bleeding":0},cost:14,description:"removes 2d6 damage",id:"fgbobzjuccaaqvfj"},
											{name:"potion of flashbang",count:1,type:"potion",weight:0.5,"recipe":{"w":10,"r":6,"g":0,"b":6},d6:3,"conditions":{"loud_noise":1,"blinding_light":1},cost:24,description:"causes loud noise and blinding light for 1d6 rounds; explosion causes 3d6 damage to 5-ft square and surrounding 5-ft squares",id:"qsgqgreexyztuwmy"}
										]
									},

								// winge
									{
										info: {
											name: "winge smart",
											demographics: { race: "winge", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Tall, strong, and mean, these orange-skinned warriors are bound by a strict code of honor which values ability above all. Their civilization is driven by conquest and power, and has unparalleled knowledge of geology and chemistry.",
											status: { points: 0, burden: 27, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 8, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 6, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 7, condition: 0 }, { name: "taste", unremovable: true, maximum: 4, condition: 0 }, { name: "touch", unremovable: true, maximum: 4, condition: 0 }] },
											memory:     { maximum: 8, damage: 0, condition: 0, skills: [{ name: "lang_winge", maximum: 7, condition: 0 }, { name: "medicine", maximum: 5, condition: 0 }] },
											logic:      { maximum: 10, damage: 0, condition: 0, skills: [{ name: "mechanics", maximum: 5, condition: 0 }, { name: "remain_calm", maximum: 3, condition: 0 }, { name: "spatial_reasoning", maximum: 2, condition: 0 }] },
											strength:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 5, condition: 0 }, { name: "throw", maximum: 2, condition: 0, combat: true }] },
											dexterity:  { maximum: 6, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 5, condition: 0 }, { name: "knifing", combat: true, maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, m2ximum: 0, condition: 0, d6: 2 }] },
											immunity:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}, { name: "defend", maximum: 14, condition: 0, d6: 1 }] },
											speed:      { maximum: 5, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 4, condition: 0 }, { name: "jump", maximum: 2, condition: 0 }, { name: "swim", maximum: 1, condition: 0 }] }
										},
										items: [
											{name:"stonebow",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"missile"}],weight:3,hands:2,fuel:2,materials:"wood, string, metal",cost:70,description:"range: 50 ft",id:"lwxxxnluronoevbx"},
											{name:"rock orb",count:10,type:"ammunition",weapons:["sling","bomb","stonebow","gauss pistol"],weight:0.5,usage:[{statistic:"dexterity",skill:"missile",d6:3},{statistic:"strength",skill:"throw",d6:3}],hands:1,materials:"stone",cost:1,description:" ",id:"blcgrpuidapffjvr"},
											{name:"dagger",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"knifing",d6:3},{statistic:"strength",skill:"throw",d6:3}],weight:1,hands:1,magnetic:true,conditions:{bleeding:1},materials:"metal",cost:10,description:" ",id:"zexbxnhhkntluxke"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"book",count:1,weight:3,hands:1,usage:[{statistic:"memory",skill:"astronomy",modifier:5}],fuel:1,materials:"paper",cost:5,description:"+5 specific memory/logic skill (mathematics, alchemy, zoology, etc.)",id:"ctpvtxpllbiibxhw"},
										]
									},
									{
										info: {
											name: "winge skilled",
											demographics: { race: "winge", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Tall, strong, and mean, these orange-skinned warriors are bound by a strict code of honor which values ability above all. Their civilization is driven by conquest and power, and has unparalleled knowledge of geology and chemistry.",
											status: { points: 0, burden: 24, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 9, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 6, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 7, condition: 0 }, { name: "taste", unremovable: true, maximum: 4, condition: 0 }, { name: "touch", unremovable: true, maximum: 4, condition: 0 }] },
											memory:     { maximum: 6, damage: 0, condition: 0, skills: [{ name: "lang_winge", maximum: 7, condition: 0 }] },
											logic:      { maximum: 6, damage: 0, condition: 0, skills: [{ name: "pattern_recognition", maximum: 5, condition: 0 }, { name: "remain_calm", maximum: 3, condition: 0 }, { name: "spatial_reasoning", maximum: 2, condition: 0 }] },
											strength:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 5, condition: 0 }, { name: "throw", maximum: 2, condition: 0, combat: true }] },
											dexterity:  { maximum: 10, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 5, condition: 0 }, { name: "fencing", combat: true, maximum: 5, condition: 0 }, { name: "escape_bonds", maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 2, condition: 0, d6: 2 }] },
											immunity:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}, { name: "defend", maximum: 14, condition: 0, d6: 1 }] },
											speed:      { maximum: 6, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 4, condition: 0 }, { name: "jump", maximum: 2, condition: 0 }, { name: "swim", maximum: 1, condition: 0 }] }
										},
										items: [
											{name:"stonebow",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"missile"}],weight:3,hands:2,fuel:2,materials:"wood, string, metal",cost:70,description:"range: 50 ft",id:"lwxxxnluronoevbx"},
											{name:"glass orb",count:10,type:"ammunition",weapons:["sling","bomb","stonebow","gauss pistol"],weight:0.1,usage:[{statistic:"dexterity",skill:"missile",d6:3},{statistic:"strength",skill:"throw",d6:3}],hands:1,conditions:{bleeding:1},materials:"glass",cost:4,description:"shatters on impact",id:"sbkuydbixlpqyats"},
											{name:"short sword",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:5}],weight:2,hands:1,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:50,description:" ",id:"grwjcuryhftbylps"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"rope",count:1,weight:2,usage:[{statistic:"strength",skill:"climb",modifier:5},{statistic:"dexterity",skill:"crafting"}],fuel:2,materials:"string",cost:10,description:"10 feet; +5 climbing; helps with crafting",id:"vkafrmfqhqivchjp"},
											{name:"spyglass",count:1,weight:1,hands:1,usage:[{statistic:"perception",skill:"sight",modifier:10},{statistic:"dexterity",skill:"missile",modifier:5}],materials:"wood, metal, glass",cost:35,description:"for viewing far distances (+10 sight) and accuracy with aim (+5 missile)",id:"hhozcolalgovetay"},
										]
									},
									{
										info: {
											name: "winge strong",
											demographics: { race: "winge", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Tall, strong, and mean, these orange-skinned warriors are bound by a strict code of honor which values ability above all. Their civilization is driven by conquest and power, and has unparalleled knowledge of geology and chemistry.",
											status: { points: 0, burden: 33.5, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 8, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 6, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 7, condition: 0 }, { name: "taste", unremovable: true, maximum: 4, condition: 0 }, { name: "touch", unremovable: true, maximum: 4, condition: 0 }] },
											memory:     { maximum: 5, damage: 0, condition: 0, skills: [{ name: "lang_winge", maximum: 7, condition: 0 }] },
											logic:      { maximum: 5, damage: 0, condition: 0, skills: [{ name: "remain_calm", maximum: 3, condition: 0 }, { name: "spatial_reasoning", maximum: 2, condition: 0 }] },
											strength:   { maximum: 10, damage: 0, condition: 0, skills: [{ name: "melee", combat: true, maximum: 5, condition: 0 }, { name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 5, condition: 0 }, { name: "throw", maximum: 2, condition: 0, combat: true }] },
											dexterity:  { maximum: 5, damage: 0, condition: 0, skills: [{ name: "missile", combat: true, maximum: 5, condition: 0 }, { name: "fencing", combat: true, maximum: 5, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 2, condition: 0, d6: 2 }] },
											immunity:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "pain_tolerance", maximum: 5, condition: 0 }, { name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}, { name: "defend", maximum: 14, condition: 0, d6: 1 }] },
											speed:      { maximum: 10, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 4, condition: 0 }, { name: "jump", maximum: 2, condition: 0 }, { name: "swim", maximum: 1, condition: 0 }] }
										},
										items: [
											{name:"axe",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:5},{statistic:"strength",skill:"throw",d6:5}],weight:2,hands:1,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:50,description:" ",id:"yeqfovhaquvlzuus"},
											{name:"long staff",count:1,type:"weapon",usage:[{statistic:"strength",skill:"melee",d6:6}],weight:6,hands:2,fuel:4,materials:"wood",cost:60,description:" ",id:"aunayoybjrwjejnn"},
											{name:"wooden shield",count:1,type:"shield",d6:4,weight:10,fuel:3,hands:1,usage:[{statistic:"strength",skill:"melee",d6:3}],materials:"wood",cost:50,description:" ",id:"azwvgxetbvshdxtj"},
											{name:"leather armor",count:1,type:"armor",armorType:"body",d6:3,weight:10,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:25,description:"prevents extreme cold",id:"tbaficbwxbgfsmvr"},
											{name:"leather cap",count:1,type:"armor",armorType:"head",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"sqyqswjpiusuywdf"},
											{name:"leather gloves",count:1,type:"armor",armorType:"hands",d6:3,weight:1,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:10,description:"prevents extreme cold",id:"kiqpazniusjvozcu"},
											{name:"leather boots",count:1,type:"armor",armorType:"legs",d6:3,weight:3,fuel:2,conditions: {extreme_cold: 0},materials:"leather",cost:15,description:"prevents extreme cold",id:"oveelvzlgrbgwxfx"},
											{name:"concoction of smoke",count:1,type:"potion",weight:0.5,usage:[{statistic:"strength",skill:"throw",d6:3}],"recipe":{"w":10,"r":4,"g":2,"b":2},"conditions":{"smoke":2},cost:16,description:"causes smoke in 5-ft square and surrounding 5-ft squares for 2d6 rounds",id:"qiqrjziyuizptbmh"},
										]
									},
									{
										info: {
											name: "winge child",
											demographics: { race: "winge", age: 10, sex: "", height: 5, weight: 75 },
											description: "Tall, strong, and mean, these orange-skinned warriors are bound by a strict code of honor which values ability above all. Their civilization is driven by conquest and power, and has unparalleled knowledge of geology and chemistry.",
											status: { points: 0, burden: 3, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 8, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 6, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 7, condition: 0 }, { name: "taste", unremovable: true, maximum: 4, condition: 0 }, { name: "touch", unremovable: true, maximum: 4, condition: 0 }] },
											memory:     { maximum: 3, damage: 0, condition: 0, skills: [{ name: "lang_winge", maximum: 7, condition: 0 }] },
											logic:      { maximum: 4, damage: 0, condition: 0, skills: [{ name: "remain_calm", maximum: 3, condition: 0 }, { name: "spatial_reasoning", maximum: 2, condition: 0 }] },
											strength:   { maximum: 5, damage: 0, condition: 0, skills: [{ name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 5, condition: 0 }, { name: "throw", maximum: 2, condition: 0, combat: true }] },
											dexterity:  { maximum: 4, damage: 0, condition: 0, skills: [{ name: "martial_arts", combat: true, unremovable: true, maximum: 2, condition: 0, d6: 2 }] },
											immunity:   { maximum: 6, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}, { name: "defend", maximum: 14, condition: 0, d6: 1 }] },
											speed:      { maximum: 5, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 4, condition: 0 }, { name: "jump", maximum: 2, condition: 0 }, { name: "swim", maximum: 1, condition: 0 }] }
										},
										items: [
											{name:"clothes",count:1,type:"armor",armorType:"body",d6:1,weight:1,fuel:2,materials:"cloth",cost:10,description:" ",id:"rbxzkdzgldgzqlok"},
											{name:"shoes",count:1,type:"armor",armorType:"legs",d6:1,weight:2,fuel:2,materials:"cloth",cost:10,description:" ",id:"kjlbatbkkevyzedf"},
										]
									},
									{
										info: {
											name: "winge boss",
											demographics: { race: "winge", age: 25, sex: "", height: 5.5, weight: 150 },
											description: "Tall, strong, and mean, these orange-skinned warriors are bound by a strict code of honor which values ability above all. Their civilization is driven by conquest and power, and has unparalleled knowledge of geology and chemistry.",
											status: { points: 0, burden: 52, conditions: [], damage: 0 }
										},
										statistics: {
											perception: { maximum: 10, damage: 0, condition: 0, skills: [{ name: "sight", unremovable: true, maximum: 6, condition: 0 }, { name: "sound", unremovable: true, maximum: 7, condition: 0 }, { name: "scent", unremovable: true, maximum: 7, condition: 0 }, { name: "taste", unremovable: true, maximum: 4, condition: 0 }, { name: "touch", unremovable: true, maximum: 4, condition: 0 }] },
											memory:     { maximum: 8, damage: 0, condition: 0, skills: [{ name: "lang_winge", maximum: 7, condition: 0 }] },
											logic:      { maximum: 8, damage: 0, condition: 0, skills: [{ name: "intimidate", maximum: 7, condition: 0, charisma: true, counters: ["remain_calm"] }, { name: "judge_character", maximum: 7, condition: 0 }, { name: "remain_calm", maximum: 3, condition: 0 }, { name: "spatial_reasoning", maximum: 2, condition: 0 }] },
											strength:   { maximum: 10, damage: 0, condition: 0, skills: [{ name: "melee", combat: true, maximum: 7, condition: 0 }, { name: "punch", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "carry", maximum: 5, condition: 0 }, { name: "throw", maximum: 2, condition: 0, combat: true }] },
											dexterity:  { maximum: 9, damage: 0, condition: 0, skills: [{ name: "fencing", combat: true, maximum: 7, condition: 0 }, { name: "martial_arts", combat: true, unremovable: true, maximum: 2, condition: 0, d6: 2 }] },
											immunity:   { maximum: 9, damage: 0, condition: 0, skills: [{ name: "recover", unremovable: true, maximum: 0, condition: 0, d6: 1}, { name: "defend", maximum: 14, condition: 0, d6: 1 }] },
											speed:      { maximum: 9, damage: 0, condition: 0, skills: [{ name: "kick", combat: true, unremovable: true, maximum: 0, condition: 0, d6: 2 }, { name: "run", maximum: 4, condition: 0 }, { name: "jump", maximum: 2, condition: 0 }, { name: "swim", maximum: 1, condition: 0 }] }
										},
										items: [
											{name:"long sword",count:1,type:"weapon",usage:[{statistic:"dexterity",skill:"fencing",d6:7}],weight:5,hands:2,magnetic:true,conditions:{bleeding:1},materials:"leather, metal",cost:80,description:" ",id:"ystexytmmlneqixo"},
											{name:"warhammer",count:1,type:"weapon",usage:[{statistic:"strength",skill:"melee",d6:7}],weight:6,hands:2,magnetic:true,materials:"leather, metal",cost:80,description:" ",id:"dzgovmpmngryoart"},
											{name:"chainmail armor",count:1,type:"armor",armorType:"body",d6:5,weight:25,magnetic:true,materials:"metal",cost:70,description:"conducts electricity",id:"cwmbegsjhgbqwosn"},
											{name:"chainmail helmet",count:1,type:"armor",armorType:"head",d6:5,weight:5,magnetic:true,materials:"metal",cost:20,description:"conducts electricity",id:"wkthclgbkefjqqud"},
											{name:"chainmail gloves",count:1,type:"armor",armorType:"hands",d6:5,weight:4,magnetic:true,materials:"metal",cost:20,description:"conducts electricity",id:"wcsmkdyfecarrovp"},
											{name:"chainmail boots",count:1,type:"armor",armorType:"legs",d6:5,weight:6,magnetic:true,materials:"metal",cost:40,description:"conducts electricity",id:"ufadgpukpeambjnx"},
											{name:"potion of strong healing",count:1,type:"healing",weight:0.5,"recipe":{"w":10,"r":0,"g":7,"b":0},d6:2,"conditions":{"bleeding":0},cost:14,description:"removes 2d6 damage",id:"fgbobzjuccaaqvfj"},
											{name:"potion of flashbang",count:1,type:"potion",weight:0.5,"recipe":{"w":10,"r":6,"g":0,"b":6},d6:3,"conditions":{"loud_noise":1,"blinding_light":1},cost:24,description:"causes loud noise and blinding light for 1d6 rounds; explosion causes 3d6 damage to 5-ft square and surrounding 5-ft squares",id:"qsgqgreexyztuwmy"}
										]
									}
							]
						break

						case "animals":
							return [
								{
									info: {
										name: "alligator",
										demographics: { race: "alligator", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 7, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 2, condition: 0}, {name: "sound", unremovable: true, maximum: 4, condition: 0}, {name: "scent", unremovable: true, maximum: 7, condition: 0}, {name: "taste", unremovable: true, maximum: 3, condition: 0}, {name: "touch", unremovable: true, maximum: 6, condition: 0}] },
										memory: { maximum: 2, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}, {name: "intimidate", maximum: 5, condition: 0, charisma: true, counters: ["remain_calm"]}] },
										strength: { maximum: 10, damage: 0, condition: 0, skills: [{name: "carry", maximum: 3, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 6, maximum: 5, condition: 0}] },
										dexterity: { maximum: 4, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 5, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 3}] },
										speed: { maximum: 2, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 5, condition: 0}, {name: "swim", maximum: 7, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "bat",
										demographics: { race: "bat", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 6, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 0, condition: 0}, {name: "sound", unremovable: true, maximum: 7, condition: 0}, {name: "scent", unremovable: true, maximum: 6, condition: 0}, {name: "taste", unremovable: true, maximum: 0, condition: 0}, {name: "touch", unremovable: true, maximum: 3, condition: 0}, {name: "echolocation", maximum: 10, condition: 0, animals: true}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 2, damage: 0, condition: 0, skills: [{name: "carry", maximum: 0, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}] },
										dexterity: { maximum: 3, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}] },
										speed: { maximum: 3, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 3, condition: 0}, {name: "swim", maximum: 0, condition: 0}, {name: "fly", maximum: 10, condition: 0, animals: true}] }
									},
									items: []
								},
								{
									info: {
										name: "bear",
										demographics: { race: "bear", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 9, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 7, condition: 0}, {name: "scent", unremovable: true, maximum: 7, condition: 0}, {name: "taste", unremovable: true, maximum: 5, condition: 0}, {name: "touch", unremovable: true, maximum: 5, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}, {name: "intimidate", maximum: 5, condition: 0, charisma: true, counters: ["remain_calm"]}] },
										strength: { maximum: 15, damage: 0, condition: 0, skills: [{name: "carry", maximum: 6, condition: 0}, {name: "throw", maximum: 3, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 4, maximum: 5, condition: 0}, {name: "climb", maximum: 5, condition: 0}] },
										dexterity: { maximum: 6, damage: 0, condition: 0, skills: [{name: "claws", maximum: 5, condition: 0, combat: true, animals: true, d6: 3}] },
										immunity: { maximum: 10, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 2}, {name: "temperature_resistance", animals: true, maximum: 5, condition: 0}] },
										speed: { maximum: 10, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 6, condition: 0}, {name: "swim", maximum: 5, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "bear cub",
										demographics: { race: "bear", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 6, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 5, condition: 0}, {name: "scent", unremovable: true, maximum: 5, condition: 0}, {name: "taste", unremovable: true, maximum: 5, condition: 0}, {name: "touch", unremovable: true, maximum: 5, condition: 0}] },
										memory: { maximum: 2, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 10, damage: 0, condition: 0, skills: [{name: "carry", maximum: 5, condition: 0}, {name: "throw", maximum: 2, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 3, maximum: 5, condition: 0}] },
										dexterity: { maximum: 3, damage: 0, condition: 0, skills: [{name: "claws", maximum: 5, condition: 0, combat: true, animals: true, d6: 2}] },
										immunity: { maximum: 3, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 1}, {name: "temperature_resistance", animals: true, maximum: 5, condition: 0}] },
										speed: { maximum: 7, damage: 0, condition: 0, skills: [{name: "jump", maximum: 2, condition: 0}, {name: "run", maximum: 4, condition: 0}, {name: "swim", maximum: 3, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "beaver",
										demographics: { race: "beaver", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 8, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 3, condition: 0}, {name: "sound", unremovable: true, maximum: 7, condition: 0}, {name: "scent", unremovable: true, maximum: 5, condition: 0}, {name: "taste", unremovable: true, maximum: 0, condition: 0}, {name: "touch", unremovable: true, maximum: 5, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 2, damage: 0, condition: 0, skills: [{name: "carry", maximum: 3, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 3, maximum: 5, condition: 0}] },
										dexterity: { maximum: 5, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 6, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 1}] },
										speed: { maximum: 5, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 3, condition: 0}, {name: "swim", maximum: 5, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "bird",
										demographics: { race: "bird", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 10, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 5, condition: 0}, {name: "scent", unremovable: true, maximum: 3, condition: 0}, {name: "taste", unremovable: true, maximum: 0, condition: 0}, {name: "touch", unremovable: true, maximum: 5, condition: 0}, {name: "internal_compass", animals: true, maximum: 5, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 5, condition: 0}] },
										strength: { maximum: 2, damage: 0, condition: 0, skills: [{name: "carry", maximum: 1, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}] },
										dexterity: { maximum: 5, damage: 0, condition: 0, skills: [{name: "talons", maximum: 5, condition: 0, combat: true, animals: true, d6: 1}] },
										immunity: { maximum: 3, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}] },
										speed: { maximum: 4, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 3, condition: 0}, {name: "swim", maximum: 0, condition: 0}, {name: "fly", maximum: 10, condition: 0, animals: true}] }
									},
									items: []
								},
								{
									info: {
										name: "boar",
										demographics: { race: "boar", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 7, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 6, condition: 0}, {name: "sound", unremovable: true, maximum: 7, condition: 0}, {name: "scent", unremovable: true, maximum: 7, condition: 0}, {name: "taste", unremovable: true, maximum: 5, condition: 0}, {name: "touch", unremovable: true, maximum: 5, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}, {name: "intimidate", maximum: 5, condition: 0, charisma: true, counters: ["remain_calm"]}] },
										strength: { maximum: 11, damage: 0, condition: 0, skills: [{name: "carry", maximum: 2, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 3, maximum: 5, condition: 0}, {name: "tusk", combat: true, animals: true, d6: 4, maximum: 5, condition: 0}] },
										dexterity: { maximum: 2, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 9, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 3}] },
										speed: { maximum: 7, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 5, condition: 0}, {name: "swim", maximum: 4, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "buffalo",
										demographics: { race: "buffalo", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 6, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 2, condition: 0}, {name: "sound", unremovable: true, maximum: 4, condition: 0}, {name: "scent", unremovable: true, maximum: 4, condition: 0}, {name: "taste", unremovable: true, maximum: 0, condition: 0}, {name: "touch", unremovable: true, maximum: 0, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}, {name: "intimidate", maximum: 5, condition: 0, charisma: true, counters: ["remain_calm"]}] },
										strength: { maximum: 12, damage: 0, condition: 0, skills: [{name: "carry", maximum: 7, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "slam", animals: true, combat: true, maximum: 5, condition: 0, d6: 6}] },
										dexterity: { maximum: 3, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 2}] },
										speed: { maximum: 10, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 7, condition: 0}, {name: "swim", maximum: 3, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "bugs",
										demographics: { race: "bugs", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 5, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 3, condition: 0}, {name: "sound", unremovable: true, maximum: 6, condition: 0}, {name: "scent", unremovable: true, maximum: 7, condition: 0}, {name: "taste", unremovable: true, maximum: 0, condition: 0}, {name: "touch", unremovable: true, maximum: 7, condition: 0}, {name: "infrared_vision", animals: true, maximum: 5, condition: 0}] },
										memory: { maximum: 1, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 1, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}] },
										strength: { maximum: 1, damage: 0, condition: 0, skills: [{name: "carry", maximum: 0, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 0, maximum: 5, condition: 0}] },
										dexterity: { maximum: 1, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 1, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "posion_resistance", maximum: 7, condition: 0}] },
										speed: { maximum: 1, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 3, condition: 0}, {name: "swim", maximum: 0, condition: 0}, {name: "fly", maximum: 10, condition: 0, animals: true}] }
									},
									items: [
										{name:"poison",count:0,type:"potion",weight:0,equipped:true,conditions:{"poison":2},cost:0,description:"causes 2d6 unblockable poison damage",id:"vnqvnpmsmsluxieu"}
									]
								},
								{
									info: {
										name: "cat",
										demographics: { race: "cat", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 9, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 6, condition: 0}, {name: "scent", unremovable: true, maximum: 5, condition: 0}, {name: "taste", unremovable: true, maximum: 3, condition: 0}, {name: "touch", unremovable: true, maximum: 5, condition: 0}, {name: "night_vision", animals: true, maximum: 5, condition: 0}] },
										memory: { maximum: 4, damage: 0, condition: 0, skills: [{name: "facial_recognition", maximum: 5, condition: 0}, {name: "voice_recognition", maximum: 5, condition: 0}] },
										logic: { maximum: 4, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 5, condition: 0}] },
										strength: { maximum: 2, damage: 0, condition: 0, skills: [{name: "carry", maximum: 2, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 2, maximum: 5, condition: 0}, {name: "climb", maximum: 5, condition: 0}] },
										dexterity: { maximum: 5, damage: 0, condition: 0, skills: [{name: "claws", maximum: 5, condition: 0, combat: true, animals: true, d6: 2}] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}] },
										speed: { maximum: 9, damage: 0, condition: 0, skills: [{name: "jump", maximum: 7, condition: 0}, {name: "run", maximum: 5, condition: 0}, {name: "swim", maximum: 3, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "camel",
										demographics: { race: "camel", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 10, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 7, condition: 0}, {name: "sound", unremovable: true, maximum: 4, condition: 0}, {name: "scent", unremovable: true, maximum: 2, condition: 0}, {name: "taste", unremovable: true, maximum: 2, condition: 0}, {name: "touch", unremovable: true, maximum: 0, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 10, damage: 0, condition: 0, skills: [{name: "carry", maximum: 7, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}] },
										dexterity: { maximum: 2, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 10, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 1}, {name: "metabolism", maximum: 7, condition: 0}, {name: "temperature_resistance", animals: true, maximum: 5, condition: 0}] },
										speed: { maximum: 7, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 7, condition: 0}, {name: "swim", maximum: 3, condition: 0}, {name: "kick", maximum: 5, condition: 0, combat: true, d6: 4}] }
									},
									items: []
								},
								{
									info: {
										name: "chicken",
										demographics: { race: "chicken", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 7, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 3, condition: 0}, {name: "sound", unremovable: true, maximum: 3, condition: 0}, {name: "scent", unremovable: true, maximum: 0, condition: 0}, {name: "taste", unremovable: true, maximum: 0, condition: 0}, {name: "touch", unremovable: true, maximum: 0, condition: 0}] },
										memory: { maximum: 2, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 5, condition: 0}] },
										strength: { maximum: 2, damage: 0, condition: 0, skills: [{name: "carry", maximum: 0, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}] },
										dexterity: { maximum: 2, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 6, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}] },
										speed: { maximum: 5, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 3, condition: 0}, {name: "swim", maximum: 0, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "coyote",
										demographics: { race: "coyote", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 9, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 6, condition: 0}, {name: "scent", unremovable: true, maximum: 7, condition: 0}, {name: "taste", unremovable: true, maximum: 5, condition: 0}, {name: "touch", unremovable: true, maximum: 4, condition: 0}, {name: "night_vision", animals: true, maximum: 5, condition: 0}] },
										memory: { maximum: 4, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 4, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}, {name: "intimidate", maximum: 5, condition: 0, charisma: true, counters: ["remain_calm"]}] },
										strength: { maximum: 6, damage: 0, condition: 0, skills: [{name: "carry", maximum: 5, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 4, maximum: 5, condition: 0}] },
										dexterity: { maximum: 3, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 1}] },
										speed: { maximum: 7, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 10, condition: 0}, {name: "swim", maximum: 5, condition: 0}, {name: "sneak", maximum: 3, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "cow",
										demographics: { race: "cow", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 6, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 3, condition: 0}, {name: "sound", unremovable: true, maximum: 5, condition: 0}, {name: "scent", unremovable: true, maximum: 2, condition: 0}, {name: "taste", unremovable: true, maximum: 1, condition: 0}, {name: "touch", unremovable: true, maximum: 3, condition: 0}] },
										memory: { maximum: 2, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 5, condition: 0}] },
										strength: { maximum: 8, damage: 0, condition: 0, skills: [{name: "carry", maximum: 7, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}] },
										dexterity: { maximum: 2, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 1}] },
										speed: { maximum: 8, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 5, condition: 0}, {name: "swim", maximum: 3, condition: 0}, {name: "kick", maximum: 5, condition: 0, combat: true, d6: 4}] }
									},
									items: []
								},
								{
									info: {
										name: "deer",
										demographics: { race: "deer", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 10, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 7, condition: 0}, {name: "scent", unremovable: true, maximum: 5, condition: 0}, {name: "taste", unremovable: true, maximum: 1, condition: 0}, {name: "touch", unremovable: true, maximum: 3, condition: 0}, {name: "night_vision", animals: true, maximum: 5, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 8, damage: 0, condition: 0, skills: [{name: "carry", maximum: 5, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}] },
										dexterity: { maximum: 3, damage: 0, condition: 0, skills: [, {name: "sneak", maximum: 5, condition: 0}] },
										immunity: { maximum: 4, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 1}] },
										speed: { maximum: 10, damage: 0, condition: 0, skills: [{name: "jump", maximum: 7, condition: 0}, {name: "run", maximum: 7, condition: 0}, {name: "swim", maximum: 3, condition: 0}, {name: "kick", maximum: 5, condition: 0, combat: true, d6: 4}, {name: "sneak", maximum: 5, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "dog",
										demographics: { race: "dog", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 8, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 3, condition: 0}, {name: "sound", unremovable: true, maximum: 6, condition: 0}, {name: "scent", unremovable: true, maximum: 7, condition: 0}, {name: "taste", unremovable: true, maximum: 5, condition: 0}, {name: "touch", unremovable: true, maximum: 2, condition: 0}] },
										memory: { maximum: 5, damage: 0, condition: 0, skills: [{name: "facial_recognition", maximum: 5, condition: 0}, {name: "voice_recognition", maximum: 5, condition: 0}] },
										logic: { maximum: 4, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 5, condition: 0}] },
										strength: { maximum: 6, damage: 0, condition: 0, skills: [{name: "carry", maximum: 3, condition: 0}, {name: "throw", maximum: 1, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 4, maximum: 5, condition: 0}] },
										dexterity: { maximum: 3, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 6, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 1}] },
										speed: { maximum: 10, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 7, condition: 0}, {name: "swim", maximum: 7, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "dolphin",
										demographics: { race: "dolphin", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
										statistics: {
										perception: { maximum: 8, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 3, condition: 0}, {name: "sound", unremovable: true, maximum: 7, condition: 0}, {name: "scent", unremovable: true, maximum: 3, condition: 0}, {name: "taste", unremovable: true, maximum: 3, condition: 0}, {name: "touch", unremovable: true, maximum: 5, condition: 0}, {name: "echolocation", maximum: 10, condition: 0, animals: true}] },
										memory: { maximum: 5, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 5, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 5, condition: 0}] },
										strength: { maximum: 6, damage: 0, condition: 0, skills: [{name: "carry", maximum: 5, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "slam", animals: true, combat: true, maximum: 5, condition: 0, d6: 4}] },
										dexterity: { maximum: 5, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 2}] },
										speed: { maximum: 2, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 0, condition: 0}, {name: "swim", maximum: 10, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "duck",
										demographics: { race: "duck", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
										statistics: {
										perception: { maximum: 6, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 3, condition: 0}, {name: "sound", unremovable: true, maximum: 5, condition: 0}, {name: "scent", unremovable: true, maximum: 0, condition: 0}, {name: "taste", unremovable: true, maximum: 0, condition: 0}, {name: "touch", unremovable: true, maximum: 3, condition: 0}, {name: "internal_compass", animals: true, maximum: 5, condition: 0}] },
										memory: { maximum: 2, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 2, damage: 0, condition: 0, skills: [{name: "carry", maximum: 0, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 2, maximum: 5, condition: 0}] },
										dexterity: { maximum: 4, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}] },
										speed: { maximum: 5, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 3, condition: 0}, {name: "swim", maximum: 5, condition: 0}, {name: "fly", maximum: 10, condition: 0, animals: true}] }
									},
									items: []
								},
								{
									info: {
										name: "elephant",
										demographics: { race: "elephant", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 10, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 7, condition: 0}, {name: "scent", unremovable: true, maximum: 7, condition: 0}, {name: "taste", unremovable: true, maximum: 2, condition: 0}, {name: "touch", unremovable: true, maximum: 7, condition: 0}, {name: "infrasound", animals: true, maximum: 5, condition: 0}] },
										memory: { maximum: 6, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 4, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}, {name: "intimidate", maximum: 5, condition: 0, charisma: true, counters: ["remain_calm"]}] },
										strength: { maximum: 15, damage: 0, condition: 0, skills: [{name: "carry", maximum: 10, condition: 0}, {name: "throw", maximum: 5, condition: 0, combat: true}, {name: "tusk", combat: true, animals: true, d6: 4, maximum: 5, condition: 0}] },
										dexterity: { maximum: 8, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 8, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 3}] },
										speed: { maximum: 10, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 7, condition: 0}, {name: "swim", maximum: 5, condition: 0}, {name: "kick", maximum: 5, condition: 0, combat: true, d6: 4}] }
									},
									items: []
								},
								{
									info: {
										name: "falcon",
										demographics: { race: "falcon", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 10, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 7, condition: 0}, {name: "sound", unremovable: true, maximum: 5, condition: 0}, {name: "scent", unremovable: true, maximum: 3, condition: 0}, {name: "taste", unremovable: true, maximum: 2, condition: 0}, {name: "touch", unremovable: true, maximum: 2, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 4, damage: 0, condition: 0, skills: [{name: "carry", maximum: 2, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}] },
										dexterity: { maximum: 4, damage: 0, condition: 0, skills: [{name: "talons", maximum: 5, condition: 0, combat: true, animals: true, d6: 2}] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}] },
										speed: { maximum: 4, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 3, condition: 0}, {name: "swim", maximum: 0, condition: 0}, {name: "fly", maximum: 10, condition: 0, animals: true}] }
									},
									items: []
								},
								{
									info: {
										name: "fish",
										demographics: { race: "fish", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 5, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 1, condition: 0}, {name: "sound", unremovable: true, maximum: 2, condition: 0}, {name: "scent", unremovable: true, maximum: 0, condition: 0}, {name: "taste", unremovable: true, maximum: 2, condition: 0}, {name: "touch", unremovable: true, maximum: 7, condition: 0}, {name: "infrared_vision", animals: true, maximum: 5, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 3, damage: 0, condition: 0, skills: [{name: "carry", maximum: 0, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 2, maximum: 5, condition: 0}] },
										dexterity: { maximum: 2, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 2, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}] },
										speed: { maximum: 2, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 0, condition: 0}, {name: "swim", maximum: 10, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "flamingo",
										demographics: { race: "flamingo", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 7, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 2, condition: 0}, {name: "sound", unremovable: true, maximum: 1, condition: 0}, {name: "scent", unremovable: true, maximum: 1, condition: 0}, {name: "taste", unremovable: true, maximum: 3, condition: 0}, {name: "touch", unremovable: true, maximum: 2, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 3, damage: 0, condition: 0, skills: [{name: "carry", maximum: 0, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}] },
										dexterity: { maximum: 3, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}] },
										speed: { maximum: 4, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 3, condition: 0}, {name: "swim", maximum: 3, condition: 0}, {name: "fly", maximum: 10, condition: 0, animals: true}] }
									},
									items: []
								},
								{
									info: {
										name: "fox",
										demographics: { race: "fox", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 9, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 5, condition: 0}, {name: "scent", unremovable: true, maximum: 5, condition: 0}, {name: "taste", unremovable: true, maximum: 2, condition: 0}, {name: "touch", unremovable: true, maximum: 2, condition: 0}, {name: "night_vision", animals: true, maximum: 5, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 4, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 3, damage: 0, condition: 0, skills: [{name: "carry", maximum: 2, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 3, maximum: 5, condition: 0}, {name: "climb", maximum: 5, condition: 0}] },
										dexterity: { maximum: 6, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 8, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}] },
										speed: { maximum: 7, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 5, condition: 0}, {name: "swim", maximum: 5, condition: 0}, {name: "sneak", maximum: 5, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "frog",
										demographics: { race: "frog", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 5, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 2, condition: 0}, {name: "sound", unremovable: true, maximum: 3, condition: 0}, {name: "scent", unremovable: true, maximum: 0, condition: 0}, {name: "taste", unremovable: true, maximum: 4, condition: 0}, {name: "touch", unremovable: true, maximum: 3, condition: 0}, {name: "infrared_vision", animals: true, maximum: 5, condition: 0}] },
										memory: { maximum: 2, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 2, damage: 0, condition: 0, skills: [{name: "carry", maximum: 0, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "slam", combat: true, animals: true, maximum: 5, condition: 0, d6: 0}] },
										dexterity: { maximum: 2, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "posion_resistance", maximum: 7, condition: 0}] },
										speed: { maximum: 3, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 3, condition: 0}, {name: "swim", maximum: 7, condition: 0}] }
									},
									items: [
										{name:"poison",count:0,type:"potion",weight:0,equipped:true,conditions:{"poison":2},cost:0,description:"causes 2d6 unblockable poison damage",id:"vnqvnpmsmsluxieu"}
									]
								},
								{
									info: {
										name: "giraffe",
										demographics: { race: "giraffe", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 7, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 5, condition: 0}, {name: "scent", unremovable: true, maximum: 0, condition: 0}, {name: "taste", unremovable: true, maximum: 0, condition: 0}, {name: "touch", unremovable: true, maximum: 3, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 7, damage: 0, condition: 0, skills: [{name: "carry", maximum: 3, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}] },
										dexterity: { maximum: 3, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 5, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 1}] },
										speed: { maximum: 8, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 5, condition: 0}, {name: "swim", maximum: 3, condition: 0}, {name: "kick", maximum: 5, condition: 0, combat: true, d6: 4}] }
									},
									items: []
								},
								{
									info: {
										name: "goat",
										demographics: { race: "goat", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
										statistics: {
										perception: { maximum: 7, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 2, condition: 0}, {name: "sound", unremovable: true, maximum: 3, condition: 0}, {name: "scent", unremovable: true, maximum: 0, condition: 0}, {name: "taste", unremovable: true, maximum: 5, condition: 0}, {name: "touch", unremovable: true, maximum: 2, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}, {name: "intimidate", maximum: 2, condition: 0, charisma: true, counters: ["remain_calm"]}] },
										strength: { maximum: 7, damage: 0, condition: 0, skills: [{name: "carry", maximum: 5, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "climb", maximum: 5, condition: 0}, {name: "slam", animals: true, combat: true, maximum: 5, condition: 0, d6: 4}] },
										dexterity: { maximum: 3, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 10, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 1}] },
										speed: { maximum: 7, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 5, condition: 0}, {name: "swim", maximum: 3, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "gorilla",
										demographics: { race: "gorilla", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 8, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 5, condition: 0}, {name: "scent", unremovable: true, maximum: 5, condition: 0}, {name: "taste", unremovable: true, maximum: 5, condition: 0}, {name: "touch", unremovable: true, maximum: 5, condition: 0}] },
										memory: { maximum: 5, damage: 0, condition: 0, skills: [{name: "facial_recognition", maximum: 5, condition: 0}] },
										logic: { maximum: 4, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}, {name: "intimidate", maximum: 5, condition: 0, charisma: true, counters: ["remain_calm"]}] },
										strength: { maximum: 12, damage: 0, condition: 0, skills: [{name: "carry", maximum: 7, condition: 0}, {name: "throw", maximum: 5, condition: 0, combat: true}, {name: "climb", maximum: 5, condition: 0}, {name: "punch", combat: true, maximum: 5, condition: 0, d6: 4}] },
										dexterity: { maximum: 9, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 1}] },
										speed: { maximum: 9, damage: 0, condition: 0, skills: [{name: "jump", maximum: 7, condition: 0}, {name: "run", maximum: 5, condition: 0}, {name: "swim", maximum: 3, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "hippo",
										demographics: { race: "hippo", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
										statistics: {
										perception: { maximum: 6, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 2, condition: 0}, {name: "sound", unremovable: true, maximum: 3, condition: 0}, {name: "scent", unremovable: true, maximum: 3, condition: 0}, {name: "taste", unremovable: true, maximum: 0, condition: 0}, {name: "touch", unremovable: true, maximum: 5, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}, {name: "intimidate", maximum: 5, condition: 0, charisma: true, counters: ["remain_calm"]}] },
										strength: { maximum: 10, damage: 0, condition: 0, skills: [{name: "carry", maximum: 7, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "slam", animals: true, combat: true, maximum: 5, condition: 0, d6: 5}] },
										dexterity: { maximum: 2, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 10, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 3}] },
										speed: { maximum: 10, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 5, condition: 0}, {name: "swim", maximum: 3, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "horse",
										demographics: { race: "horse", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 9, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 3, condition: 0}, {name: "sound", unremovable: true, maximum: 4, condition: 0}, {name: "scent", unremovable: true, maximum: 3, condition: 0}, {name: "taste", unremovable: true, maximum: 1, condition: 0}, {name: "touch", unremovable: true, maximum: 0, condition: 0}] },
										memory: { maximum: 4, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}, {name: "intimidate", maximum: 2, condition: 0, charisma: true, counters: ["remain_calm"]}] },
										strength: { maximum: 12, damage: 0, condition: 0, skills: [{name: "carry", maximum: 10, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}] },
										dexterity: { maximum: 3, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 5, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 2}] },
										speed: { maximum: 12, damage: 0, condition: 0, skills: [{name: "jump", maximum: 7, condition: 0}, {name: "run", maximum: 10, condition: 0}, {name: "swim", maximum: 5, condition: 0}, {name: "kick", maximum: 5, condition: 0, combat: true, d6: 5}] }
									},
									items: []
								},
								{
									info: {
										name: "jellyfish",
										demographics: { race: "jellyfish", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 2, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: -7, condition: 0}, {name: "sound", unremovable: true, maximum: -7, condition: 0}, {name: "scent", unremovable: true, maximum: 1, condition: 0}, {name: "taste", unremovable: true, maximum: -7, condition: 0}, {name: "touch", unremovable: true, maximum: 3, condition: 0}] },
										memory: { maximum: 2, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}] },
										strength: { maximum: 2, damage: 0, condition: 0, skills: [{name: "carry", maximum: 0, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "slam", animals: true, combat: true, maximum: 5, condition: 0, d6: 1}] },
										dexterity: { maximum: 2, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 2, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}] },
										speed: { maximum: 2, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 0, condition: 0}, {name: "swim", maximum: 10, condition: 0}] }
									},
									items: [
										{name:"paralysis",count:0,type:"potion",weight:0,equipped:true,conditions:{"paralysis_arms":1,"paralysis_legs":1},cost:0,description:"causes localized paralysis for 1d6 hours",id:"yipbwbwdlyelyrwx"}
									]
								},
								{
									info: {
										name: "kangaroo",
										demographics: { race: "kangaroo", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 7, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 3, condition: 0}, {name: "sound", unremovable: true, maximum: 5, condition: 0}, {name: "scent", unremovable: true, maximum: 5, condition: 0}, {name: "taste", unremovable: true, maximum: 2, condition: 0}, {name: "touch", unremovable: true, maximum: 3, condition: 0}] },
										memory: { maximum: 4, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 10, damage: 0, condition: 0, skills: [{name: "carry", maximum: 7, condition: 0}, {name: "throw", maximum: 3, condition: 0, combat: true}] },
										dexterity: { maximum: 6, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 1}] },
										speed: { maximum: 5, damage: 0, condition: 0, skills: [{name: "jump", maximum: 10, condition: 0}, {name: "run", maximum: 7, condition: 0}, {name: "swim", maximum: 3, condition: 0}, {name: "kick", maximum: 5, condition: 0, combat: true, d6: 5}] }
									},
									items: []
								},
								{
									info: {
										name: "lion",
										demographics: { race: "lion", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 9, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 6, condition: 0}, {name: "sound", unremovable: true, maximum: 7, condition: 0}, {name: "scent", unremovable: true, maximum: 6, condition: 0}, {name: "taste", unremovable: true, maximum: 4, condition: 0}, {name: "touch", unremovable: true, maximum: 3, condition: 0}, {name: "night_vision", animals: true, maximum: 5, condition: 0}] },
										memory: { maximum: 4, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 4, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}, {name: "intimidate", maximum: 5, condition: 0, charisma: true, counters: ["remain_calm"]}] },
										strength: { maximum: 12, damage: 0, condition: 0, skills: [{name: "carry", maximum: 5, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 5, maximum: 5, condition: 0}, {name: "climb", maximum: 5, condition: 0}] },
										dexterity: { maximum: 4, damage: 0, condition: 0, skills: [{name: "claws", maximum: 5, condition: 0, combat: true, animals: true, d6: 3}] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 1}] },
										speed: { maximum: 7, damage: 0, condition: 0, skills: [{name: "jump", maximum: 7, condition: 0}, {name: "run", maximum: 10, condition: 0}, {name: "swim", maximum: 5, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "lizard",
										demographics: { race: "lizard", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 5, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 3, condition: 0}, {name: "sound", unremovable: true, maximum: 0, condition: 0}, {name: "scent", unremovable: true, maximum: 2, condition: 0}, {name: "taste", unremovable: true, maximum: 3, condition: 0}, {name: "touch", unremovable: true, maximum: 3, condition: 0}] },
										memory: { maximum: 2, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 5, condition: 0}] },
										strength: { maximum: 2, damage: 0, condition: 0, skills: [{name: "carry", maximum: 3, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 2, maximum: 5, condition: 0}, {name: "climb", maximum: 5, condition: 0}] },
										dexterity: { maximum: 2, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 8, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 1}, {name: "posion_resistance", maximum: 7, condition: 0}] },
										speed: { maximum: 3, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 3, condition: 0}, {name: "swim", maximum: 3, condition: 0}] }
									},
									items: [
										{name:"poison",count:0,type:"potion",weight:0,equipped:true,conditions:{"poison":2},cost:0,description:"causes 2d6 unblockable poison damage",id:"vnqvnpmsmsluxieu"}
									]
								},
								{
									info: {
										name: "llama",
										demographics: { race: "llama", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 7, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 2, condition: 0}, {name: "sound", unremovable: true, maximum: 3, condition: 0}, {name: "scent", unremovable: true, maximum: 4, condition: 0}, {name: "taste", unremovable: true, maximum: 3, condition: 0}, {name: "touch", unremovable: true, maximum: 0, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 8, damage: 0, condition: 0, skills: [{name: "carry", maximum: 10, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}] },
										dexterity: { maximum: 2, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 1}] },
										speed: { maximum: 5, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 5, condition: 0}, {name: "swim", maximum: 3, condition: 0}, {name: "kick", maximum: 5, condition: 0, combat: true, d6: 4}] }
									},
									items: []
								},
								{
									info: {
										name: "lobster",
										demographics: { race: "lobster", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 5, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 1, condition: 0}, {name: "sound", unremovable: true, maximum: 1, condition: 0}, {name: "scent", unremovable: true, maximum: 1, condition: 0}, {name: "taste", unremovable: true, maximum: 1, condition: 0}, {name: "touch", unremovable: true, maximum: 3, condition: 0}] },
										memory: { maximum: 2, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 3, damage: 0, condition: 0, skills: [{name: "carry", maximum: 0, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}] },
										dexterity: { maximum: 3, damage: 0, condition: 0, skills: [{name: "claws", maximum: 5, condition: 0, combat: true, animals: true, d6: 2}] },
										immunity: { maximum: 5, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 2}] },
										speed: { maximum: 2, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 3, condition: 0}, {name: "swim", maximum: 7, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "monkey",
										demographics: { race: "monkey", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 8, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 5, condition: 0}, {name: "scent", unremovable: true, maximum: 5, condition: 0}, {name: "taste", unremovable: true, maximum: 5, condition: 0}, {name: "touch", unremovable: true, maximum: 5, condition: 0}] },
										memory: { maximum: 4, damage: 0, condition: 0, skills: [{name: "facial_recognition", maximum: 5, condition: 0}] },
										logic: { maximum: 4, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}, {name: "intimidate", maximum: 5, condition: 0, charisma: true, counters: ["remain_calm"]}] },
										strength: { maximum: 4, damage: 0, condition: 0, skills: [{name: "carry", maximum: 5, condition: 0}, {name: "throw", maximum: 5, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 3, maximum: 5, condition: 0}, {name: "climb", maximum: 5, condition: 0}] },
										dexterity: { maximum: 9, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}] },
										speed: { maximum: 6, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 5, condition: 0}, {name: "swim", maximum: 3, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "moose",
										demographics: { race: "moose", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
										statistics: {
										perception: { maximum: 7, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 2, condition: 0}, {name: "sound", unremovable: true, maximum: 4, condition: 0}, {name: "scent", unremovable: true, maximum: 4, condition: 0}, {name: "taste", unremovable: true, maximum: 2, condition: 0}, {name: "touch", unremovable: true, maximum: 2, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}, {name: "intimidate", maximum: 5, condition: 0, charisma: true, counters: ["remain_calm"]}] },
										strength: { maximum: 12, damage: 0, condition: 0, skills: [{name: "carry", maximum: 10, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "slam", animals: true, combat: true, maximum: 5, condition: 0, d6: 6}] },
										dexterity: { maximum: 3, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 2}, {name: "temperature_resistance", animals: true, maximum: 5, condition: 0}] },
										speed: { maximum: 10, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 7, condition: 0}, {name: "swim", maximum: 3, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "mouse",
										demographics: { race: "mouse", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 8, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 6, condition: 0}, {name: "scent", unremovable: true, maximum: 7, condition: 0}, {name: "taste", unremovable: true, maximum: 5, condition: 0}, {name: "touch", unremovable: true, maximum: 5, condition: 0}, {name: "night_vision", animals: true, maximum: 5, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 5, condition: 0}] },
										strength: { maximum: 2, damage: 0, condition: 0, skills: [{name: "carry", maximum: 2, condition: 0}, {name: "throw", maximum: 1, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 2, maximum: 5, condition: 0}] },
										dexterity: { maximum: 5, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "infection_resistance", maximum: 5, condition: 0}] },
										speed: { maximum: 8, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 3, condition: 0}, {name: "swim", maximum: 3, condition: 0}, {name: "sneak", maximum: 5, condition: 0}] }
									},
									items: [
										{name:"infection",count:0,type:"potion",weight:0,equipped:true,conditions:{"infection":2},cost:0,description:"causes 2d6 unblockable infection damage",id:"hhrbglxfcyohzhov"}
									]
								},
								{
									info: {
										name: "octopus",
										demographics: { race: "octopus", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 9, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 3, condition: 0}, {name: "sound", unremovable: true, maximum: 2, condition: 0}, {name: "scent", unremovable: true, maximum: 2, condition: 0}, {name: "taste", unremovable: true, maximum: 2, condition: 0}, {name: "touch", unremovable: true, maximum: 7, condition: 0}, {name: "camouflage", animals: true, maximum: 15, condition: 0}] },
										memory: { maximum: 4, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 4, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 7, damage: 0, condition: 0, skills: [{name: "carry", maximum: 7, condition: 0}, {name: "throw", maximum: 5, condition: 0, combat: true}, {name: "climb", maximum: 5, condition: 0}, {name: "slam", animals: true, combat: true, maximum: 5, condition: 0, d6: 4}] },
										dexterity: { maximum: 6, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "temperature_resistance", animals: true, maximum: 5, condition: 0}] },
										speed: { maximum: 3, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 0, condition: 0}, {name: "swim", maximum: 10, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "otter",
										demographics: { race: "otter", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 7, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 2, condition: 0}, {name: "sound", unremovable: true, maximum: 3, condition: 0}, {name: "scent", unremovable: true, maximum: 5, condition: 0}, {name: "taste", unremovable: true, maximum: 2, condition: 0}, {name: "touch", unremovable: true, maximum: 3, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 3, damage: 0, condition: 0, skills: [{name: "carry", maximum: 3, condition: 0}, {name: "throw", maximum: 2, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 3, maximum: 5, condition: 0}] },
										dexterity: { maximum: 4, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}] },
										speed: { maximum: 5, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 3, condition: 0}, {name: "swim", maximum: 10, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "owl",
										demographics: { race: "owl", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 8, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 7, condition: 0}, {name: "sound", unremovable: true, maximum: 5, condition: 0}, {name: "scent", unremovable: true, maximum: 5, condition: 0}, {name: "taste", unremovable: true, maximum: 1, condition: 0}, {name: "touch", unremovable: true, maximum: 3, condition: 0}, {name: "night_vision", animals: true, maximum: 10, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 3, damage: 0, condition: 0, skills: [{name: "carry", maximum: 2, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}] },
										dexterity: { maximum: 3, damage: 0, condition: 0, skills: [{name: "talons", maximum: 5, condition: 0, combat: true, animals: true, d6: 2}] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}] },
										speed: { maximum: 2, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 3, condition: 0}, {name: "swim", maximum: 0, condition: 0}, {name: "fly", maximum: 10, condition: 0, animals: true}] }
									},
									items: []
								},
								{
									info: {
										name: "panda",
										demographics: { race: "panda", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 6, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 2, condition: 0}, {name: "sound", unremovable: true, maximum: 0, condition: 0}, {name: "scent", unremovable: true, maximum: 5, condition: 0}, {name: "taste", unremovable: true, maximum: 7, condition: 0}, {name: "touch", unremovable: true, maximum: 3, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 5, damage: 0, condition: 0, skills: [{name: "carry", maximum: 4, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "climb", maximum: 5, condition: 0}] },
										dexterity: { maximum: 4, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 4, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 1}] },
										speed: { maximum: 3, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 3, condition: 0}, {name: "swim", maximum: 3, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "pig",
										demographics: { race: "pig", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 7, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 3, condition: 0}, {name: "sound", unremovable: true, maximum: 3, condition: 0}, {name: "scent", unremovable: true, maximum: 7, condition: 0}, {name: "taste", unremovable: true, maximum: 3, condition: 0}, {name: "touch", unremovable: true, maximum: 2, condition: 0}] },
										memory: { maximum: 4, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 4, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 7, damage: 0, condition: 0, skills: [{name: "carry", maximum: 5, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 4, maximum: 5, condition: 0}, {name: "slam", animals: true, combat: true, maximum: 5, condition: 0, d6: 4}] },
										dexterity: { maximum: 2, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 1}] },
										speed: { maximum: 7, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 7, condition: 0}, {name: "swim", maximum: 5, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "rabbit",
										demographics: { race: "rabbit", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 8, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 7, condition: 0}, {name: "scent", unremovable: true, maximum: 6, condition: 0}, {name: "taste", unremovable: true, maximum: 2, condition: 0}, {name: "touch", unremovable: true, maximum: 5, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 5, condition: 0}] },
										strength: { maximum: 2, damage: 0, condition: 0, skills: [{name: "carry", maximum: 2, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 2, maximum: 5, condition: 0}] },
										dexterity: { maximum: 3, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 5, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}] },
										speed: { maximum: 8, damage: 0, condition: 0, skills: [{name: "jump", maximum: 7, condition: 0}, {name: "run", maximum: 5, condition: 0}, {name: "swim", maximum: 3, condition: 0}, {name: "sneak", maximum: 5, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "raccoon",
										demographics: { race: "raccoon", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 7, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 6, condition: 0}, {name: "scent", unremovable: true, maximum: 7, condition: 0}, {name: "taste", unremovable: true, maximum: 5, condition: 0}, {name: "touch", unremovable: true, maximum: 2, condition: 0}, {name: "night_vision", animals: true, maximum: 5, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 4, damage: 0, condition: 0, skills: [{name: "carry", maximum: 4, condition: 0}, {name: "throw", maximum: 3, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 3, maximum: 5, condition: 0}] },
										dexterity: { maximum: 6, damage: 0, condition: 0, skills: [{name: "claws", maximum: 5, condition: 0, combat: true, animals: true, d6: 2}] },
										immunity: { maximum: 8, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "infection_resistance", maximum: 5, condition: 0}] },
										speed: { maximum: 7, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 5, condition: 0}, {name: "swim", maximum: 3, condition: 0}, {name: "sneak", maximum: 3, condition: 0}] }
									},
									items: [
										{name:"infection",count:0,type:"potion",weight:0,equipped:true,conditions:{"infection":2},cost:0,description:"causes 2d6 unblockable infection damage",id:"hhrbglxfcyohzhov"}
									]
								},
								{
									info: {
										name: "rat",
										demographics: { race: "rat", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 8, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 6, condition: 0}, {name: "scent", unremovable: true, maximum: 7, condition: 0}, {name: "taste", unremovable: true, maximum: 5, condition: 0}, {name: "touch", unremovable: true, maximum: 5, condition: 0}, {name: "night_vision", animals: true, maximum: 5, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 5, condition: 0}] },
										strength: { maximum: 4, damage: 0, condition: 0, skills: [{name: "carry", maximum: 1, condition: 0}, {name: "throw", maximum: 1, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 3, maximum: 5, condition: 0}] },
										dexterity: { maximum: 4, damage: 0, condition: 0, skills: [{name: "claws", maximum: 5, condition: 0, combat: true, animals: true, d6: 2}] },
										immunity: { maximum: 10, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "infection_resistance", maximum: 5, condition: 0}] },
										speed: { maximum: 8, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 5, condition: 0}, {name: "swim", maximum: 3, condition: 0}, {name: "sneak", maximum: 3, condition: 0}] }
									},
									items: [
										{name:"infection",count:0,type:"potion",weight:0,equipped:true,conditions:{"infection":2},cost:0,description:"causes 2d6 unblockable infection damage",id:"hhrbglxfcyohzhov"}
									]
								},
								{
									info: {
										name: "ray",
										demographics: { race: "ray", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 5, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 0, condition: 0}, {name: "sound", unremovable: true, maximum: 0, condition: 0}, {name: "scent", unremovable: true, maximum: 2, condition: 0}, {name: "taste", unremovable: true, maximum: 0, condition: 0}, {name: "touch", unremovable: true, maximum: 5, condition: 0}] },
										memory: { maximum: 2, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 2, damage: 0, condition: 0, skills: [{name: "carry", maximum: 0, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "slam", animals: true, combat: true, maximum: 5, condition: 0, d6: 3}] },
										dexterity: { maximum: 2, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}] },
										speed: { maximum: 2, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 0, condition: 0}, {name: "swim", maximum: 10, condition: 0}] }
									},
									items: [
										{name:"paralysis",count:0,type:"potion",weight:0,equipped:true,conditions:{"paralysis_arms":1,"paralysis_legs":1},cost:0,description:"causes localized paralysis for 1d6 hours",id:"yipbwbwdlyelyrwx"}
									]
								},
								{
									info: {
										name: "rhino",
										demographics: { race: "rhino", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 7, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 3, condition: 0}, {name: "sound", unremovable: true, maximum: 5, condition: 0}, {name: "scent", unremovable: true, maximum: 4, condition: 0}, {name: "taste", unremovable: true, maximum: 0, condition: 0}, {name: "touch", unremovable: true, maximum: 5, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}, {name: "intimidate", maximum: 5, condition: 0, charisma: true, counters: ["remain_calm"]}] },
										strength: { maximum: 15, damage: 0, condition: 0, skills: [{name: "carry", maximum: 7, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "tusk", animals: true, combat: true, maximum: 5, condition: 0, d6: 4}, {name: "slam", animals: true, combat: true, maximum: 5, condition: 0, d6: 6}] },
										dexterity: { maximum: 2, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 10, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 3}] },
										speed: { maximum: 10, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 7, condition: 0}, {name: "swim", maximum: 3, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "shark",
										demographics: { race: "shark", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 5, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 1, condition: 0}, {name: "sound", unremovable: true, maximum: 3, condition: 0}, {name: "scent", unremovable: true, maximum: 7, condition: 0}, {name: "taste", unremovable: true, maximum: 7, condition: 0}, {name: "touch", unremovable: true, maximum: 7, condition: 0}] },
										memory: { maximum: 2, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}, {name: "intimidate", maximum: 5, condition: 0, charisma: true, counters: ["remain_calm"]}] },
										strength: { maximum: 10, damage: 0, condition: 0, skills: [{name: "carry", maximum: 5, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 6, maximum: 5, condition: 0}] },
										dexterity: { maximum: 2, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 8, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 2}, {name: "temperature_resistance", animals: true, maximum: 5, condition: 0}] },
										speed: { maximum: 2, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 0, condition: 0}, {name: "swim", maximum: 10, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "sheep",
										demographics: { race: "sheep", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 5, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 3, condition: 0}, {name: "sound", unremovable: true, maximum: 3, condition: 0}, {name: "scent", unremovable: true, maximum: 2, condition: 0}, {name: "taste", unremovable: true, maximum: 2, condition: 0}, {name: "touch", unremovable: true, maximum: 0, condition: 0}] },
										memory: { maximum: 2, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 5, condition: 0}] },
										strength: { maximum: 5, damage: 0, condition: 0, skills: [{name: "carry", maximum: 5, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}] },
										dexterity: { maximum: 2, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 1}, {name: "temperature_resistance", animals: true, maximum: 5, condition: 0}] },
										speed: { maximum: 5, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 5, condition: 0}, {name: "swim", maximum: 3, condition: 0}, {name: "kick", maximum: 5, condition: 0, combat: true, d6: 4}] }
									},
									items: []
								},
								{
									info: {
										name: "silverfish (giant)",
										demographics: { race: "silverfish (giant)", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 7, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 5, condition: 0}, {name: "scent", unremovable: true, maximum: 5, condition: 0}, {name: "taste", unremovable: true, maximum: 0, condition: 0}, {name: "touch", unremovable: true, maximum: 10, condition: 0}] },
										memory: { maximum: 2, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}] },
										strength: { maximum: 10, damage: 0, condition: 0, skills: [{name: "carry", maximum: 2, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 3, maximum: 5, condition: 0}] },
										dexterity: { maximum: 7, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 5, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 2}, {name: "posion_resistance", maximum: 7, condition: 0}] },
										speed: { maximum: 10, damage: 0, condition: 0, skills: [{name: "jump", maximum: 2, condition: 0}, {name: "run", maximum: 5, condition: 0}, {name: "swim", maximum: 2, condition: 0}] }
									},
									items: [
										{name:"poison",count:0,type:"potion",weight:0,equipped:true,conditions:{"poison":2},cost:0,description:"causes 2d6 unblockable poison damage",id:"vnqvnpmsmsluxieu"}
									]
								},
								{
									info: {
										name: "silverfish hatchling (giant)",
										demographics: { race: "silverfish (giant)", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 7, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 5, condition: 0}, {name: "scent", unremovable: true, maximum: 5, condition: 0}, {name: "taste", unremovable: true, maximum: 0, condition: 0}, {name: "touch", unremovable: true, maximum: 10, condition: 0}] },
										memory: { maximum: 2, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}] },
										strength: { maximum: 7, damage: 0, condition: 0, skills: [{name: "carry", maximum: 1, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 2, maximum: 5, condition: 0}] },
										dexterity: { maximum: 7, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 5, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 1}, {name: "posion_resistance", maximum: 7, condition: 0}] },
										speed: { maximum: 7, damage: 0, condition: 0, skills: [{name: "jump", maximum: 1, condition: 0}, {name: "run", maximum: 4, condition: 0}, {name: "swim", maximum: 1, condition: 0}] }
									},
									items: [
										{name:"poison",count:0,type:"potion",weight:0,equipped:true,conditions:{"poison":2},cost:0,description:"causes 2d6 unblockable poison damage",id:"vnqvnpmsmsluxieu"}
									]
								},
								{
									info: {
										name: "skunk",
										demographics: { race: "skunk", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 5, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 3, condition: 0}, {name: "sound", unremovable: true, maximum: 3, condition: 0}, {name: "scent", unremovable: true, maximum: 5, condition: 0}, {name: "taste", unremovable: true, maximum: 2, condition: 0}, {name: "touch", unremovable: true, maximum: 2, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 3, damage: 0, condition: 0, skills: [{name: "carry", maximum: 2, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 3, maximum: 5, condition: 0}] },
										dexterity: { maximum: 2, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}] },
										speed: { maximum: 5, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 3, condition: 0}, {name: "swim", maximum: 3, condition: 0}] }
									},
									items: [
										{name:"stink",count:0,type:"potion",weight:0,equipped:true,conditions:{noxious_odor:2},description:"causes noxious odor 2d6 rounds",id:"hgudwffxjkyftclu"}
									]
								},
								{
									info: {
										name: "sloth",
										demographics: { race: "sloth", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 7, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 2, condition: 0}, {name: "sound", unremovable: true, maximum: 3, condition: 0}, {name: "scent", unremovable: true, maximum: 3, condition: 0}, {name: "taste", unremovable: true, maximum: 3, condition: 0}, {name: "touch", unremovable: true, maximum: 7, condition: 0}] },
										memory: { maximum: 2, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 3, damage: 0, condition: 0, skills: [{name: "carry", maximum: 2, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "climb", maximum: 5, condition: 0}] },
										dexterity: { maximum: 5, damage: 0, condition: 0, skills: [{name: "claws", maximum: 5, condition: 0, combat: true, animals: true, d6: 2}] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}] },
										speed: { maximum: 2, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 0, condition: 0}, {name: "swim", maximum: 3, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "snake",
										demographics: { race: "snake", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 6, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 3, condition: 0}, {name: "sound", unremovable: true, maximum: 1, condition: 0}, {name: "scent", unremovable: true, maximum: 5, condition: 0}, {name: "taste", unremovable: true, maximum: 5, condition: 0}, {name: "touch", unremovable: true, maximum: 5, condition: 0}, {name: "infrared_vision", animals: true, maximum: 5, condition: 0}] },
										memory: { maximum: 2, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}, {name: "intimidate", maximum: 3, condition: 0, charisma: true, counters: ["remain_calm"]}] },
										strength: { maximum: 5, damage: 0, condition: 0, skills: [{name: "carry", maximum: 0, condition: 0}, {name: "throw", maximum: 1, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 3, maximum: 5, condition: 0}, {name: "climb", maximum: 5, condition: 0}] },
										dexterity: { maximum: 4, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 8, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 1}, {name: "posion_resistance", maximum: 7, condition: 0}] },
										speed: { maximum: 5, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 5, condition: 0}, {name: "swim", maximum: 7, condition: 0}] }
									},
									items: [
										{name:"poison",count:0,type:"potion",weight:0,equipped:true,conditions:{"poison":2},cost:0,description:"causes 2d6 unblockable poison damage",id:"vnqvnpmsmsluxieu"}
									]
								},
								{
									info: {
										name: "spider (giant)",
										demographics: { race: "spider (giant)", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 8, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 3, condition: 0}, {name: "sound", unremovable: true, maximum: 2, condition: 0}, {name: "scent", unremovable: true, maximum: 0, condition: 0}, {name: "taste", unremovable: true, maximum: 3, condition: 0}, {name: "touch", unremovable: true, maximum: 7, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}, {name: "intimidate", maximum: 5, condition: 0, charisma: true, counters: ["remain_calm"]}] },
										strength: { maximum: 10, damage: 0, condition: 0, skills: [{name: "carry", maximum: 0, condition: 0}, {name: "throw", maximum: 2, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 3, maximum: 5, condition: 0}, {name: "climb", maximum: 5, condition: 0}] },
										dexterity: { maximum: 9, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 5, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 1}, {name: "posion_resistance", maximum: 7, condition: 0}] },
										speed: { maximum: 7, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 5, condition: 0}, {name: "swim", maximum: 0, condition: 0}] }
									},
									items: [
										{name:"poison",count:0,type:"potion",weight:0,equipped:true,conditions:{"poison":2},cost:0,description:"causes 2d6 unblockable poison damage",id:"vnqvnpmsmsluxieu"}
									]
								},
								{
									info: {
										name: "squirrel",
										demographics: { race: "squirrel", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 7, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 2, condition: 0}, {name: "sound", unremovable: true, maximum: 5, condition: 0}, {name: "scent", unremovable: true, maximum: 5, condition: 0}, {name: "taste", unremovable: true, maximum: 2, condition: 0}, {name: "touch", unremovable: true, maximum: 2, condition: 0}] },
										memory: { maximum: 4, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 3, damage: 0, condition: 0, skills: [{name: "carry", maximum: 2, condition: 0}, {name: "throw", maximum: 1, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 3, maximum: 5, condition: 0}, {name: "climb", maximum: 5, condition: 0}] },
										dexterity: { maximum: 5, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}] },
										speed: { maximum: 6, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 5, condition: 0}, {name: "swim", maximum: 3, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "tiger",
										demographics: { race: "tiger", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 9, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 7, condition: 0}, {name: "scent", unremovable: true, maximum: 6, condition: 0}, {name: "taste", unremovable: true, maximum: 5, condition: 0}, {name: "touch", unremovable: true, maximum: 3, condition: 0}, {name: "night_vision", animals: true, maximum: 5, condition: 0}] },
										memory: { maximum: 4, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 4, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}, {name: "intimidate", maximum: 5, condition: 0, charisma: true, counters: ["remain_calm"]}] },
										strength: { maximum: 12, damage: 0, condition: 0, skills: [{name: "carry", maximum: 5, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 5, maximum: 5, condition: 0}, {name: "climb", maximum: 5, condition: 0}] },
										dexterity: { maximum: 4, damage: 0, condition: 0, skills: [{name: "claws", maximum: 5, condition: 0, combat: true, animals: true, d6: 3}] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 1}] },
										speed: { maximum: 7, damage: 0, condition: 0, skills: [{name: "jump", maximum: 7, condition: 0}, {name: "run", maximum: 10, condition: 0}, {name: "swim", maximum: 7, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "turtle",
										demographics: { race: "turtle", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 4, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 2, condition: 0}, {name: "sound", unremovable: true, maximum: 2, condition: 0}, {name: "scent", unremovable: true, maximum: 2, condition: 0}, {name: "taste", unremovable: true, maximum: 2, condition: 0}, {name: "touch", unremovable: true, maximum: 3, condition: 0}] },
										memory: { maximum: 2, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 2, damage: 0, condition: 0, skills: [{name: "carry", maximum: 3, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 2, maximum: 5, condition: 0}] },
										dexterity: { maximum: 2, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 10, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 2}] },
										speed: { maximum: 3, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 1, condition: 0}, {name: "swim", maximum: 7, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "vulture",
										demographics: { race: "vulture", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 9, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 7, condition: 0}, {name: "sound", unremovable: true, maximum: 3, condition: 0}, {name: "scent", unremovable: true, maximum: 5, condition: 0}, {name: "taste", unremovable: true, maximum: 1, condition: 0}, {name: "touch", unremovable: true, maximum: 0, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}] },
										strength: { maximum: 4, damage: 0, condition: 0, skills: [{name: "carry", maximum: 1, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 2, maximum: 5, condition: 0}] },
										dexterity: { maximum: 3, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 10, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}] },
										speed: { maximum: 3, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 3, condition: 0}, {name: "swim", maximum: 0, condition: 0}, {name: "fly", maximum: 10, condition: 0, animals: true}] }
									},
									items: []
								},
								{
									info: {
										name: "walrus",
										demographics: { race: "walrus", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 7, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 2, condition: 0}, {name: "sound", unremovable: true, maximum: 2, condition: 0}, {name: "scent", unremovable: true, maximum: 5, condition: 0}, {name: "taste", unremovable: true, maximum: 5, condition: 0}, {name: "touch", unremovable: true, maximum: 2, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}, {name: "intimidate", maximum: 3, condition: 0, charisma: true, counters: ["remain_calm"]}] },
										strength: { maximum: 8, damage: 0, condition: 0, skills: [{name: "carry", maximum: 2, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "tusk", animals: true, combat: true, maximum: 5, condition: 0, d6: 4}, {name: "slam", animals: true, combat: true, maximum: 5, condition: 0, d6: 4}] },
										dexterity: { maximum: 3, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 10, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 2}, {name: "temperature_resistance", animals: true, maximum: 5, condition: 0}] },
										speed: { maximum: 3, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 1, condition: 0}, {name: "swim", maximum: 10, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "weasel",
										demographics: { race: "weasel", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 6, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 4, condition: 0}, {name: "sound", unremovable: true, maximum: 4, condition: 0}, {name: "scent", unremovable: true, maximum: 6, condition: 0}, {name: "taste", unremovable: true, maximum: 2, condition: 0}, {name: "touch", unremovable: true, maximum: 2, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 2, damage: 0, condition: 0, skills: [{name: "carry", maximum: 2, condition: 0}, {name: "throw", maximum: 1, condition: 0, combat: true}, {name: "climb", maximum: 5, condition: 0}, {name: "bite", animals: true, combat: true, maximum: 5, condition: 0, d6: 3}, {name: "slam", animals: true, combat: true, maximum: 5, condition: 0, d6: 3}] },
										dexterity: { maximum: 3, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}] },
										speed: { maximum: 5, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 5, condition: 0}, {name: "swim", maximum: 3, condition: 0}, {name: "sneak", maximum: 3, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "whale",
										demographics: { race: "whale", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 10, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 0, condition: 0}, {name: "sound", unremovable: true, maximum: 7, condition: 0}, {name: "scent", unremovable: true, maximum: 2, condition: 0}, {name: "taste", unremovable: true, maximum: 2, condition: 0}, {name: "touch", unremovable: true, maximum: 7, condition: 0}, {name: "infrasound", animals: true, maximum: 10, condition: 0}] },
										memory: { maximum: 4, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 4, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 15, damage: 0, condition: 0, skills: [{name: "carry", maximum: 10, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "slam", animals: true, combat: true, maximum: 5, condition: 0, d6: 6}] },
										dexterity: { maximum: 2, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 10, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 4}, {name: "temperature_resistance", animals: true, maximum: 10, condition: 0}] },
										speed: { maximum: 3, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 0, condition: 0}, {name: "swim", maximum: 10, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "wolf",
										demographics: { race: "wolf", age: 0, sex: "", height: 0, weight: 0 },
										description: "",
										status: { points: 0, burden: 0, conditions: [], damage: 0 },
									},
									statistics: {
										perception: { maximum: 9, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 6, condition: 0}, {name: "scent", unremovable: true, maximum: 7, condition: 0}, {name: "taste", unremovable: true, maximum: 5, condition: 0}, {name: "touch", unremovable: true, maximum: 4, condition: 0}, {name: "night_vision", animals: true, maximum: 5, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 4, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}, {name: "intimidate", maximum: 5, condition: 0, charisma: true, counters: ["remain_calm"]}] },
										strength: { maximum: 10, damage: 0, condition: 0, skills: [{name: "carry", maximum: 5, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 5, maximum: 5, condition: 0}] },
										dexterity: { maximum: 4, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 8, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", maximum: 14, condition: 0, animals: true, d6: 1}] },
										speed: { maximum: 7, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 10, condition: 0}, {name: "swim", maximum: 7, condition: 0}, {name: "sneak", maximum: 3, condition: 0}] }
									},
									items: []
								}
							]
						break

						case "creatures":
							return [
								{
									info: {
										name: "alaxior",
										demographics: { race: "alaxior", age: 0, sex: "", height: 0, weight: 0 },
										description: "The alaxior is a is a large, carnivorous, aquatic invertebrate capable of tremendous destruction. This shark is about 10 feet long and 3 feet wide, swimming at up to 100 feet per second. The alaxior is an apex predator with an average lifespan is 5 years, and an annual offspring production of roughly a dozen eggs. Though the animal is not very intelligent, its 200-plus razor-sharp teeth can rip even the strongest material to pieces. Additionally, alaxiors can poison enemies with two lateral venom-emitting claw-fins - this poison causes the prey to suffocate as blood cells burst within minutes.",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 5, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 1, condition: 0}, {name: "sound", unremovable: true, maximum: 3, condition: 0}, {name: "scent", unremovable: true, maximum: 7, condition: 0}, {name: "taste", unremovable: true, maximum: 7, condition: 0}, {name: "touch", unremovable: true, maximum: 7, condition: 0}] },
										memory: { maximum: 2, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}] },
										strength: { maximum: 10, damage: 0, condition: 0, skills: [{name: "carry", maximum: 5, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 6, maximum: 5, condition: 0}] },
										dexterity: { maximum: 2, damage: 0, condition: 0, skills: [{name: "claws", combat: true, animals: true, maximum: 5, condition: 0, d6: 2}] },
										immunity: { maximum: 8, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", animals: true, maximum: 14, condition: 0, d6: 3}, {name: "temperature_resistance", animals: true, maximum: 5, condition: 0}, {name: "poison_resistance", maximum: 7, condition: 0}] },
										speed: { maximum: 2, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 0, condition: 0}, {name: "swim", maximum: 20, condition: 0}] }
									},
									items: [
										{name:"poison",count:0,type:"potion",weight:0,equipped:true,conditions:{"poison":2},cost:0,description:"causes 2d6 unblockable poison damage","id":"vnqvnpmsmsluxieu"}
									]
								},
								{
									info: {
										name: "ambird",
										demographics: { race: "ambird", age: 0, sex: "", height: 0, weight: 0 },
										description: "This orange-yellow avian is a bird of prey, swooping in from high altitudes to scoop small mammals from the plains. Ambirds are temperature resistant against both extreme cold and extreme heat, using their unusual feathers to thermoregulate in all climates, and even to survive fire for a short time. These birds generally live in small groups and mate once a year by migrating in a seemingly random direction.",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 10, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 5, condition: 0}, {name: "scent", unremovable: true, maximum: 3, condition: 0}, {name: "taste", unremovable: true, maximum: 0, condition: 0}, {name: "touch", unremovable: true, maximum: 5, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 5, condition: 0}] },
										strength: { maximum: 2, damage: 0, condition: 0, skills: [{name: "carry", maximum: 0, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}] },
										dexterity: { maximum: 5, damage: 0, condition: 0, skills: [{name: "talons", combat: true, animals: true, maximum: 5, condition: 0, d6: 2}] },
										immunity: { maximum: 10, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", animals: true, maximum: 14, condition: 0, d6: 1}, {name: "temperature_resistance", animals: true, maximum: 10, condition: 0}] },
										speed: { maximum: 4, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 3, condition: 0}, {name: "swim", maximum: 0, condition: 0}, {name: "fly", animals: true, maximum: 10, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "amphibiphant",
										demographics: { race: "amphibiphant", age: 0, sex: "", height: 0, weight: 0 },
										description: "Amphibiphants are gigantic amphibians the size of elephants. They possess wet skin, like frogs, and have long salamander-like tails, but their round heads feature tusks and a trunk, and their legs are rough and elephantine. They are usually found near lakes and savannahs. These creatures often jump, shaking the ground. Their preferred food includes tree leaves, as well as small birds and large insects, which they capture with their sticky, fast-flicking tongues.",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 9, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 7, condition: 0}, {name: "scent", unremovable: true, maximum: 7, condition: 0}, {name: "taste", unremovable: true, maximum: 2, condition: 0}, {name: "touch", unremovable: true, maximum: 7, condition: 0}] },
										memory: { maximum: 4, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}] },
										strength: { maximum: 15, damage: 0, condition: 0, skills: [{name: "carry", maximum: 5, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "slam", combat: true, animals: true, maximum: 5, condition: 0, d6: 5}, {name: "tusk", combat: true, animals: true, maximum: 5, condition: 0, d6: 4}] },
										dexterity: { maximum: 8, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 8, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", animals: true, maximum: 14, condition: 0, d6: 2}] },
										speed: { maximum: 10, damage: 0, condition: 0, skills: [{name: "jump", maximum: 7, condition: 0}, {name: "run", maximum: 5, condition: 0}, {name: "swim", maximum: 7, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "blunikaurn",
										demographics: { race: "blunikaurn", age: 0, sex: "", height: 0, weight: 0 },
										description: "Blunikaurns are horse-like creatures with hooves, a tail, and a snouted face. Blunikaurns also possess a metallic horn protruding from their foreheads, and their skin is predominantly blue. These electrically unstable animals are constantly creating an electric charge within their bodies - this charge can be transmitted on contact. Blunikaurns are incredibly fast runners, using this electricity to increase their speed far beyond traditional horses, but this ability wears them out quickly, so a blunikaurn must constantly be replenishing its saline content. These strong creatures are intelligent and less docile than horses, but when tamed provide an excellent traveling companion.",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 9, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 7, condition: 0}, {name: "sound", unremovable: true, maximum: 4, condition: 0}, {name: "scent", unremovable: true, maximum: 3, condition: 0}, {name: "taste", unremovable: true, maximum: 1, condition: 0}, {name: "touch", unremovable: true, maximum: 0, condition: 0}] },
										memory: { maximum: 4, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 12, damage: 0, condition: 0, skills: [{name: "carry", maximum: 7, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "tusk", combat: true, animals: true, maximum: 5, condition: 0, d6: 3}] },
										dexterity: { maximum: 3, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 5, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", animals: true, maximum: 14, condition: 0, d6: 2}] },
										speed: { maximum: 12, damage: 0, condition: 0, skills: [{name: "jump", maximum: 7, condition: 0}, {name: "run", maximum: 10, condition: 0}, {name: "swim", maximum: 3, condition: 0}, {name: "kick", combat: true, maximum: 5, condition: 0, d6: 4}] }
									},
									items: [
										{name:"electricity",count:0,type:"potion",weight:0,equipped:true,d6:2,conditions:{"paralysis_arms":1,"paralysis_legs":1},cost:0,description:"causes 2d6 unblockable electricity damage","id":"ltvqfxpdelrcemic"}
									]
								},
								{
									info: {
										name: "craven",
										demographics: { race: "craven", age: 0, sex: "", height: 0, weight: 0 },
										description: "Shimmering, reflective silver feathers cover this small corvid bird. Its intelligence allows it to use rudimentary tools and even learn commands; it is omnivorous and likes to collect things for its small flock, which nests near settlements and in moderate forests.",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 8, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 7, condition: 0}, {name: "sound", unremovable: true, maximum: 7, condition: 0}, {name: "scent", unremovable: true, maximum: 5, condition: 0}, {name: "taste", unremovable: true, maximum: 0, condition: 0}, {name: "touch", unremovable: true, maximum: 3, condition: 0}] },
										memory: { maximum: 4, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 4, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 5, condition: 0}] },
										strength: { maximum: 2, damage: 0, condition: 0, skills: [{name: "carry", maximum: 1, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}] },
										dexterity: { maximum: 4, damage: 0, condition: 0, skills: [{name: "talons", combat: true, animals: true, maximum: 5, condition: 0, d6: 1}] },
										immunity: { maximum: 5, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}] },
										speed: { maximum: 3, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 0, condition: 0}, {name: "swim", maximum: 0, condition: 0}, {name: "fly", animals: true, maximum: 10, condition: 0}] }
									},
									items: [
										{name:"light",count:0,type:"potion",weight:0,equipped:true,conditions:{"blinding_light":1,"darkness":0},cost:0,description:"creates blinding light","id":"zwwooutxonqckwne"}
									]
								},
								{
									info: {
										name: "dhogris",
										demographics: { race: "dhogris", age: 0, sex: "", height: 0, weight: 0 },
										description: "These canine creatures come in many breeds, but most often appear similar to huskies and wolves. Their light blue fur and dark blue teeth are their most visible differentiators from normal tundra canines, but their ability to drain heat from enemies by biting them makes them far more effective as fighting dogs. These animals can be trained and commanded, but in the wild, they are vicious and aggressive.",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 9, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 6, condition: 0}, {name: "sound", unremovable: true, maximum: 6, condition: 0}, {name: "scent", unremovable: true, maximum: 7, condition: 0}, {name: "taste", unremovable: true, maximum: 5, condition: 0}, {name: "touch", unremovable: true, maximum: 2, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 4, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 10, damage: 0, condition: 0, skills: [{name: "carry", maximum: 3, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 4, maximum: 5, condition: 0}] },
										dexterity: { maximum: 4, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 8, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", animals: true, maximum: 14, condition: 0, d6: 1}, {name: "temperature_resistance", animals: true, maximum: 10, condition: 0}] },
										speed: { maximum: 7, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 7, condition: 0}, {name: "swim", maximum: 5, condition: 0}] }
									},
									items: [
										{name:"cold",count:0,type:"potion",weight:0,equipped:true,conditions:{"extreme_cold":1,"extreme_heat":0,"paralysis_arms":1,"paralysis_legs":1},cost:0,description:"causes 1d6 unblockable extreme cold damage","id":"vzsjcbjhrnihwgvb"}
									]
								},
								{
									info: {
										name: "eezapan",
										demographics: { race: "eezapan", age: 0, sex: "", height: 0, weight: 0 },
										description: "The eezapan is a three-horned monkey with near-human intelligence. Eezapans do not have tails, but, sprouting from their foreheads, they have three conical grey or brown horns that they use to attack enemies. These horns exude a toxin that can cause temporary confusion and disorientation in those it touches. The eezapan is strong and large, generally covered in gray or brown hair. Eezapans are possessive jungle creatures that live in small clans.",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 8, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 5, condition: 0}, {name: "scent", unremovable: true, maximum: 5, condition: 0}, {name: "taste", unremovable: true, maximum: 5, condition: 0}, {name: "touch", unremovable: true, maximum: 5, condition: 0}] },
										memory: { maximum: 5, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 4, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}] },
										strength: { maximum: 12, damage: 0, condition: 0, skills: [{name: "carry", maximum: 5, condition: 0}, {name: "throw", maximum: 5, condition: 0, combat: true}, {name: "slam", combat: true, animals: true, maximum: 5, condition: 0, d6: 4}, {name: "climb", maximum: 5, condition: 0}] },
										dexterity: { maximum: 9, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", animals: true, maximum: 14, condition: 0, d6: 1}] },
										speed: { maximum: 9, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 3, condition: 0}, {name: "swim", maximum: 3, condition: 0}] }
									},
									items: [
										{name:"stun",count:0,type:"potion",weight:0,equipped:true,conditions:{"surprise":1},cost:0,description:"causes surprise","id":"mtgtvnbqphxwjbgg"}
									]
								},
								{
									info: {
										name: "electrite",
										demographics: { race: "electrite", age: 0, sex: "", height: 0, weight: 0 },
										description: "The electrite is a land snake often found in jungles and swamps with an electric ability similar to an electric eel. These creatures range in size and color, from garden snakes to cobras, and what they lack in mercy and tolerance, they make up for in cunning and patience.",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 6, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 3, condition: 0}, {name: "sound", unremovable: true, maximum: 1, condition: 0}, {name: "scent", unremovable: true, maximum: 5, condition: 0}, {name: "taste", unremovable: true, maximum: 5, condition: 0}, {name: "touch", unremovable: true, maximum: 5, condition: 0}] },
										memory: { maximum: 2, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}] },
										strength: { maximum: 5, damage: 0, condition: 0, skills: [{name: "carry", maximum: 0, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "slam", combat: true, animals: true, maximum: 5, condition: 0, d6: 3}, {name: "climb", maximum: 5, condition: 0}] },
										dexterity: { maximum: 4, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 8, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", animals: true, maximum: 14, condition: 0, d6: 2}] },
										speed: { maximum: 5, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 5, condition: 0}, {name: "swim", maximum: 5, condition: 0}] }
									},
									items: [
										{name:"electricity",count:0,type:"potion",weight:0,equipped:true,d6:2,conditions:{"paralysis_arms":1,"paralysis_legs":1},cost:0,description:"causes 2d6 unblockable electricity damage","id":"ltvqfxpdelrcemic"}
									]
								},
								{
									info: {
										name: "ellish",
										demographics: { race: "ellish", age: 0, sex: "", height: 0, weight: 0 },
										description: "An ellish is similar to a jellyfish in its overall appearance. However, an ellish is somewhat larger, with a circumference of three feet, and has a long compound eye around its entire body at its equator. The ellish’s tentacles are electrically charged, so the creature emits a small shock into its enemies.",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 2, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 7, condition: 0}, {name: "sound", unremovable: true, maximum: 0, condition: 0}, {name: "scent", unremovable: true, maximum: 0, condition: 0}, {name: "taste", unremovable: true, maximum: 0, condition: 0}, {name: "touch", unremovable: true, maximum: 5, condition: 0}] },
										memory: { maximum: 2, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}] },
										strength: { maximum: 2, damage: 0, condition: 0, skills: [{name: "carry", maximum: 0, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "slam", combat: true, animals: true, maximum: 5, condition: 0, d6: 1}] },
										dexterity: { maximum: 2, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 2, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}] },
										speed: { maximum: 2, damage: 0, condition: 0, skills: [{name: "jump", maximum: 0, condition: 0}, {name: "run", maximum: 0, condition: 0}, {name: "swim", maximum: 10, condition: 0}] }
									},
									items: [
										{name:"electricity",count:0,type:"potion",weight:0,equipped:true,d6:2,conditions:{"paralysis_arms":1,"paralysis_legs":1},cost:0,description:"causes 2d6 unblockable electricity damage","id":"ltvqfxpdelrcemic"}
									]
								},
								{
									info: {
										name: "falump",
										demographics: { race: "falump", age: 0, sex: "", height: 0, weight: 0 },
										description: "Seemingly harmless creatures, falumps resemble large rodents, with large, humped, furry backs, often gray-purple in color. They walk on all fours, but their entire underbelly is an enormous, oval-shaped, small-toothed mouth. With an incredibly fast metabolism, falumps are able to eat quickly and continuously, storing energy in a chemically efficient syrup in specialized veins. When a falump dies, it rapidly disintegrates, leaving a dark, gooey substance with healing properties.",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 8, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 3, condition: 0}, {name: "sound", unremovable: true, maximum: 3, condition: 0}, {name: "scent", unremovable: true, maximum: 3, condition: 0}, {name: "taste", unremovable: true, maximum: 7, condition: 0}, {name: "touch", unremovable: true, maximum: 3, condition: 0}] },
										memory: { maximum: 2, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 5, condition: 0}] },
										strength: { maximum: 2, damage: 0, condition: 0, skills: [{name: "carry", maximum: 0, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 3, maximum: 5, condition: 0}] },
										dexterity: { maximum: 3, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 10, damage: 0, condition: 0, skills: [{name: "recover", maximum: 5, condition: 0, d6: 2}, {name: "defend", animals: true, maximum: 14, condition: 0, d6: 1}] },
										speed: { maximum: 5, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 3, condition: 0}, {name: "swim", maximum: 0, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "fegragite",
										demographics: { race: "fegragite", age: 0, sex: "", height: 0, weight: 0 },
										description: "A fegragite is a short monster with a thick aluminum shell around three sides of its body. A single, spherical, compound eye lies at the top of a short, retractable stalk protruding from its head. The head itself is an eared mass of fur with a mouth and nose, and it rests, neckless, above its dark, furry body. It is a bipedal animal, and all four of its limbs are coated with an alloy of iron. The creature possesses the ability to charge this iron to create magnetic limbs, and can change the polarity of these limbs almost instantaneously, allowing it to move objects magnetically. The beast eats both organic material and metals. The animal also has an excellent sense of direction because ions in its brain align with the electromagnetic field.",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 7, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 2, condition: 0}, {name: "scent", unremovable: true, maximum: 2, condition: 0}, {name: "taste", unremovable: true, maximum: 2, condition: 0}, {name: "touch", unremovable: true, maximum: 7, condition: 0}, {name: "internal_compass", animals: true, maximum: 10, condition: 0}] },
										memory: { maximum: 2, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}] },
										strength: { maximum: 4, damage: 0, condition: 0, skills: [{name: "carry", maximum: 0, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 3, maximum: 5, condition: 0}] },
										dexterity: { maximum: 2, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 10, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", animals: true, maximum: 14, condition: 0, d6: 4}] },
										speed: { maximum: 5, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 3, condition: 0}, {name: "swim", maximum: 0, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "fylete",
										demographics: { race: "fylete", age: 0, sex: "", height: 0, weight: 0 },
										description: "A fylete is a rainforest creature, a white-furred winged animal with four thin, clawed limbs. Fyletes have large triangular ears near the back of their short-snouted and circular-eyed faces. Their vocal chords are capable of producing a wide range of sounds, and they have often been known to produce deconstructive sound waves in response to what they hear, rendering their environment silent. They have long, dexterous tails and are fast-moving, especially as they leap and glide from tree to tree.",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 7, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 3, condition: 0}, {name: "sound", unremovable: true, maximum: 7, condition: 0}, {name: "scent", unremovable: true, maximum: 1, condition: 0}, {name: "taste", unremovable: true, maximum: 1, condition: 0}, {name: "touch", unremovable: true, maximum: 3, condition: 0}] },
										memory: { maximum: 4, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 5, condition: 0}] },
										strength: { maximum: 3, damage: 0, condition: 0, skills: [{name: "carry", maximum: 3, condition: 0}, {name: "throw", maximum: 3, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 2, maximum: 5, condition: 0}, {name: "climb", maximum: 10, condition: 0}] },
										dexterity: { maximum: 5, damage: 0, condition: 0, skills: [{name: "claws", combat: true, animals: true, maximum: 5, condition: 0, d6: 2}] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", animals: true, maximum: 14, condition: 0, d6: 1}] },
										speed: { maximum: 6, damage: 0, condition: 0, skills: [{name: "jump", maximum: 7, condition: 0}, {name: "run", maximum: 5, condition: 0}, {name: "swim", maximum: 3, condition: 0}] }
									},
									items: [
										{name:"silence",count:0,type:"potion",weight:0,equipped:true,cost:0,description:"eliminates all sound within 5 5-ft square radius","id":"kdumpvpotyiuhanw"}
									]
								},
								{
									info: {
										name: "grithers",
										demographics: { race: "grithers", age: 0, sex: "", height: 0, weight: 0 },
										description: "Grithers are tiny fungi that grow in furry mats, decomposing plants and animal flesh - before the host has actually died. Grithers are able to camouflage with their surroundings, changing their pigments almost immediately, so they are nearly impossible to see.",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 0, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 0, condition: 0}, {name: "sound", unremovable: true, maximum: 0, condition: 0}, {name: "scent", unremovable: true, maximum: 0, condition: 0}, {name: "taste", unremovable: true, maximum: 0, condition: 0}, {name: "touch", unremovable: true, maximum: 7, condition: 0}] },
										memory: { maximum: 0, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 0, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 100, condition: 0}] },
										strength: { maximum: 0, damage: 0, condition: 0, skills: [{name: "carry", maximum: 0, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}] },
										dexterity: { maximum: 0, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 0, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}] },
										speed: { maximum: 0, damage: 0, condition: 0, skills: [{name: "jump", maximum: 0, condition: 0}, {name: "run", maximum: 0, condition: 0}, {name: "swim", maximum: 0, condition: 0}] }
									},
									items: [
										{name:"infection",count:0,type:"potion",weight:0,equipped:true,conditions:{"infection":2},cost:0,description:"causes 2d6 unblockable infection damage","id":"hhrbglxfcyohzhov"}
									]
								},
								{
									info: {
										name: "kangarasis",
										demographics: { race: "kangarasis", age: 0, sex: "", height: 0, weight: 0 },
										description: "Kangarasi are plains marsupials with feathery wings, which they use to jump high and glide for short distances. These creatures have long tails, small front paw-claws with opposable digits, a snouted face with tall ears, a furry body, a large tongue, two long hind feet capable of great jumps, and pouches. Kangarasi also have advanced intelligence and vocal chords, and are usually very friendly. ",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 7, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 3, condition: 0}, {name: "sound", unremovable: true, maximum: 5, condition: 0}, {name: "scent", unremovable: true, maximum: 5, condition: 0}, {name: "taste", unremovable: true, maximum: 2, condition: 0}, {name: "touch", unremovable: true, maximum: 3, condition: 0}] },
										memory: { maximum: 4, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 5, condition: 0}] },
										strength: { maximum: 10, damage: 0, condition: 0, skills: [{name: "carry", maximum: 5, condition: 0}, {name: "throw", maximum: 5, condition: 0, combat: true}] },
										dexterity: { maximum: 6, damage: 0, condition: 0, skills: [{name: "claws", combat: true, animals: true, maximum: 5, condition: 0, d6: 2}] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", animals: true, maximum: 14, condition: 0, d6: 1}] },
										speed: { maximum: 5, damage: 0, condition: 0, skills: [{name: "jump", maximum: 10, condition: 0}, {name: "run", maximum: 5, condition: 0}, {name: "swim", maximum: 3, condition: 0}, {name: "fly", animals: true, maximum: 5, condition: 0}, {name: "kick", combat: true, maximum: 5, condition: 0, d6: 5}] }
									},
									items: []
								},
								{
									info: {
										name: "mimicat",
										demographics: { race: "mimicat", age: 0, sex: "", height: 0, weight: 0 },
										description: "These desert animals have thin, tan and brown-spotted fur covering their long, slender bodies. Unlike most felines, their complex vocal cords are capable of producing human-like sounds, and they often mimic the sounds they hear. They have pointed ears and sharp claws, as well as long, split tails.",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 12, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 7, condition: 0}, {name: "scent", unremovable: true, maximum: 5, condition: 0}, {name: "taste", unremovable: true, maximum: 3, condition: 0}, {name: "touch", unremovable: true, maximum: 5, condition: 0}] },
										memory: { maximum: 4, damage: 0, condition: 0, skills: [{name: "voice_recognition", maximum: 10, condition: 0}] },
										logic: { maximum: 4, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 6, damage: 0, condition: 0, skills: [{name: "carry", maximum: 3, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "climb", maximum: 5, condition: 0}] },
										dexterity: { maximum: 5, damage: 0, condition: 0, skills: [{name: "claws", combat: true, animals: true, maximum: 5, condition: 0, d6: 3}] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", animals: true, maximum: 14, condition: 0, d6: 1}] },
										speed: { maximum: 9, damage: 0, condition: 0, skills: [{name: "jump", maximum: 7, condition: 0}, {name: "run", maximum: 7, condition: 0}, {name: "swim", maximum: 3, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "narwalrus",
										demographics: { race: "narwalrus", age: 0, sex: "", height: 0, weight: 0 },
										description: "This coastal creature lives in icy climates and preys on fish and birds alike. Its long, plump body is covered in rough, gray skin, with a long tail, two back legs, and two front flipper-fin-claws. The narwalrus has a large, hairy face with tusks and a long horn coming from its forehead.",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 7, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 2, condition: 0}, {name: "sound", unremovable: true, maximum: 2, condition: 0}, {name: "scent", unremovable: true, maximum: 5, condition: 0}, {name: "taste", unremovable: true, maximum: 5, condition: 0}, {name: "touch", unremovable: true, maximum: 2, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}] },
										strength: { maximum: 8, damage: 0, condition: 0, skills: [{name: "carry", maximum: 3, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "tusk", combat: true, animals: true, maximum: 5, condition: 0, d6: 4}] },
										dexterity: { maximum: 3, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 10, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", animals: true, maximum: 14, condition: 0, d6: 1}, {name: "temperature_resistance", animals: true, maximum: 5, condition: 0}] },
										speed: { maximum: 5, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 3, condition: 0}, {name: "swim", maximum: 10, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "nocrid",
										demographics: { race: "nocrid", age: 0, sex: "", height: 0, weight: 0 },
										description: "A nocrid is a small, six-legged, clawed lizard that lives in rainforests. Usually a dark gray or black color, nocrids have a sharp-spiked spine. It is cold-blooded, but moves very quickly, communicating with a complex system of color-changing scales that the creature can cause to glow. Nocrids can also produce a dark gas through pores in their scales, impeding vision. They frequently attack with their short, sharp tails.",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 8, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 7, condition: 0}, {name: "sound", unremovable: true, maximum: 0, condition: 0}, {name: "scent", unremovable: true, maximum: 2, condition: 0}, {name: "taste", unremovable: true, maximum: 3, condition: 0}, {name: "touch", unremovable: true, maximum: 3, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 2, damage: 0, condition: 0, skills: [{name: "carry", maximum: 0, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 2, maximum: 5, condition: 0}] },
										dexterity: { maximum: 2, damage: 0, condition: 0, skills: [{name: "claws", combat: true, animals: true, maximum: 5, condition: 0, d6: 2}] },
										immunity: { maximum: 8, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", animals: true, maximum: 14, condition: 0, d6: 1}] },
										speed: { maximum: 5, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 3, condition: 0}, {name: "swim", maximum: 0, condition: 0}] }
									},
									items: [
										{name:"smoke",count:0,type:"potion",weight:0,equipped:true,conditions:{"smoke":2},cost:0,description:"causes smoke in 5-ft square and surrounding 5-ft squares for 2d6 rounds","id":"wlxrxewjrtjpgyli"}
									]
								},
								{
									info: {
										name: "opterix",
										demographics: { race: "opterix", age: 0, sex: "", height: 0, weight: 0 },
										description: "Opterixes are six-foot tall flightless birds. The wings are large and thin, and come out of the creature’s sides instead of the back, but can be folded up close to the bird. At the top tips of each wing are three-fingered claws, with a fourth opposable digit, and the bird's talon-like feet feature a similar arrangement. An opterix is blue or purple in color, and has a long orange beak. Opterixes are able to communicate with one another telepathically by transmitting radio signals from their brains. These slow-moving creatures tend to keep to themselves or live in small groups.",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 8, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 7, condition: 0}, {name: "sound", unremovable: true, maximum: 5, condition: 0}, {name: "scent", unremovable: true, maximum: 3, condition: 0}, {name: "taste", unremovable: true, maximum: 2, condition: 0}, {name: "touch", unremovable: true, maximum: 2, condition: 0}] },
										memory: { maximum: 4, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 5, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}] },
										strength: { maximum: 5, damage: 0, condition: 0, skills: [{name: "carry", maximum: 3, condition: 0}, {name: "throw", maximum: 5, condition: 0, combat: true}] },
										dexterity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "claws", combat: true, animals: true, maximum: 5, condition: 0, d6: 2}] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}] },
										speed: { maximum: 4, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 3, condition: 0}, {name: "swim", maximum: 0, condition: 0}, {name: "fly", animals: true, maximum: 5, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "picay",
										demographics: { race: "picay", age: 0, sex: "", height: 0, weight: 0 },
										description: "A small, green or blue feathered bird with fast flight, the picay is a friendly creature commonly used as a messenger bird. This is because the picay has a photographic memory and can repeat complex sounds - including long segments of human speech. Picays are weak and evasive animals capable of nearly harmless clawing attacks.",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 12, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 7, condition: 0}, {name: "scent", unremovable: true, maximum: 3, condition: 0}, {name: "taste", unremovable: true, maximum: 0, condition: 0}, {name: "touch", unremovable: true, maximum: 5, condition: 0}, {name: "internal_compass", animals: true, maximum: 5, condition: 0}] },
										memory: { maximum: 4, damage: 0, condition: 0, skills: [{name: "voice_recognition", maximum: 10, condition: 0}] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 5, condition: 0}] },
										strength: { maximum: 2, damage: 0, condition: 0, skills: [{name: "carry", maximum: 1, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}] },
										dexterity: { maximum: 4, damage: 0, condition: 0, skills: [{name: "talons", combat: true, animals: true, maximum: 5, condition: 0, d6: 1}] },
										immunity: { maximum: 5, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}] },
										speed: { maximum: 4, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 3, condition: 0}, {name: "swim", maximum: 0, condition: 0}, {name: "fly", animals: true, maximum: 10, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "pigneous",
										demographics: { race: "pigneous", age: 0, sex: "", height: 0, weight: 0 },
										description: "This armor-plated pig monster is often found in mountainous regions, where it feasts on any food it can find. The pigneous can exude fire from its mouth and smoke from its flared nostrils, which combines with its heavy body and hard hooves to constitute a dangerous - and aggressive - wild boar.",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 7, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 3, condition: 0}, {name: "sound", unremovable: true, maximum: 3, condition: 0}, {name: "scent", unremovable: true, maximum: 7, condition: 0}, {name: "taste", unremovable: true, maximum: 3, condition: 0}, {name: "touch", unremovable: true, maximum: 6, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 4, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}] },
										strength: { maximum: 11, damage: 0, condition: 0, skills: [{name: "carry", maximum: 3, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "slam", combat: true, animals: true, maximum: 5, condition: 0, d6: 3}] },
										dexterity: { maximum: 2, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 9, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", animals: true, maximum: 14, condition: 0, d6: 3}, {name: "temperature_resistance", animals: true, maximum: 10, condition: 0}] },
										speed: { maximum: 7, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 5, condition: 0}, {name: "swim", maximum: 3, condition: 0}, {name: "kick", combat: true, maximum: 5, condition: 0, d6: 3}] }
									},
									items: [
										{name:"fire",count:0,type:"potion",weight:0,equipped:true,d6:3,conditions:{"extreme_heat":1,"extreme_cold":0},cost:0,description:"causes 3d6 fire damage","id":"xsmvlkycricyxfyj"},
										{name:"smoke",count:0,type:"potion",weight:0,equipped:true,conditions:{"smoke":2},cost:0,description:"causes smoke in 5-ft square and surrounding 5-ft squares for 2d6 rounds","id":"wlxrxewjrtjpgyli"}
									]
								},
								{
									info: {
										name: "rhinostrich",
										demographics: { race: "rhinostrich", age: 0, sex: "", height: 0, weight: 0 },
										description: "A rhinosctrich has a spheroid body of flesh, covered in bluish-purple and pink feathers. It has a puffy feather tail as well, but a leathery, rough tail protrudes from this. The creature has long, thin, hollow-boned legs, which widen to gray hooves at the bottom. A rhinostrich aksi has two fluffy upper limbs - stubby little wings - but it is far too heavy to fly. Its head is a coarse, gray, snouted face with a horn coming from the tip of its yellow beak, two eyes surrounded by feathers, and wide nostrils on the beak-horn. Drooping from this head are two long, gray ears drooping. Rhinostriches are agile creatures, and they often charge at enemies, though they are herbivorous.",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 7, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 3, condition: 0}, {name: "sound", unremovable: true, maximum: 5, condition: 0}, {name: "scent", unremovable: true, maximum: 4, condition: 0}, {name: "taste", unremovable: true, maximum: 0, condition: 0}, {name: "touch", unremovable: true, maximum: 5, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}] },
										strength: { maximum: 12, damage: 0, condition: 0, skills: [{name: "carry", maximum: 3, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "slam", combat: true, animals: true, maximum: 5, condition: 0, d6: 4}] },
										dexterity: { maximum: 2, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 8, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", animals: true, maximum: 14, condition: 0, d6: 2}] },
										speed: { maximum: 9, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 7, condition: 0}, {name: "swim", maximum: 3, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "scaw",
										demographics: { race: "scaw", age: 0, sex: "", height: 0, weight: 0 },
										description: "Small, annoying birds, these leaf-eaters frequently attack farms - and farmers. Although not very intelligent or strong, scaws are known to be fast and vicious. They are brown, feathered, scraggly avians with short, jagged-edged beaks and three-toed talons. Capable of long, fast flight, with their three-foot wingspan these egg-laying animals generally live for three years.",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 7, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 5, condition: 0}, {name: "scent", unremovable: true, maximum: 3, condition: 0}, {name: "taste", unremovable: true, maximum: 0, condition: 0}, {name: "touch", unremovable: true, maximum: 5, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 2, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 4, damage: 0, condition: 0, skills: [{name: "carry", maximum: 0, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 2, maximum: 5, condition: 0}] },
										dexterity: { maximum: 3, damage: 0, condition: 0, skills: [{name: "talons", combat: true, animals: true, maximum: 5, condition: 0, d6: 1}] },
										immunity: { maximum: 10, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}] },
										speed: { maximum: 3, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 3, condition: 0}, {name: "swim", maximum: 0, condition: 0}, {name: "fly", animals: true, maximum: 10, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "scorpicrab",
										demographics: { race: "scorpicrab", age: 0, sex: "", height: 0, weight: 0 },
										description: "A combination of a crab and a scorpion, this dog-sized armored beetle has four legs but no wings. It is gray in color and has two compound eyes at the front of its long, shelled head. In addition to its thin, plated legs, the scorpicrabs two front claws are venomous scythes, like the tail of a scorpion - a tail it lacks. Scorpicrabs usually live in swampy areas, and they generally attack anything that moves.",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 6, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 2, condition: 0}, {name: "sound", unremovable: true, maximum: 2, condition: 0}, {name: "scent", unremovable: true, maximum: 3, condition: 0}, {name: "taste", unremovable: true, maximum: 1, condition: 0}, {name: "touch", unremovable: true, maximum: 3, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}] },
										strength: { maximum: 7, damage: 0, condition: 0, skills: [{name: "carry", maximum: 3, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}] },
										dexterity: { maximum: 3, damage: 0, condition: 0, skills: [{name: "claws", combat: true, animals: true, maximum: 5, condition: 0, d6: 2}] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", animals: true, maximum: 14, condition: 0, d6: 3}, {name: "poison_resistance", maximum: 7, condition: 0}] },
										speed: { maximum: 6, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 5, condition: 0}, {name: "swim", maximum: 3, condition: 0}] }
									},
									items: [
										{name:"poison",count:0,type:"potion",weight:0,equipped:true,conditions:{"poison":2},cost:0,description:"causes 2d6 unblockable poison damage","id":"vnqvnpmsmsluxieu"}
									]
								},
								{
									info: {
										name: "tentaroc",
										demographics: { race: "tentaroc", age: 0, sex: "", height: 0, weight: 0 },
										description: "This tentacled bird is a large coastal creature feasting on fish and other sea animals. Its eight long, turquoise, suction-cupped tentacles come together at a plump, feathered, yellow and white avian body, complete with a beaked head and solid black eyes.",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 9, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 2, condition: 0}, {name: "scent", unremovable: true, maximum: 3, condition: 0}, {name: "taste", unremovable: true, maximum: 2, condition: 0}, {name: "touch", unremovable: true, maximum: 7, condition: 0}] },
										memory: { maximum: 4, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 4, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 7, damage: 0, condition: 0, skills: [{name: "carry", maximum: 3, condition: 0}, {name: "throw", maximum: 5, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 3, maximum: 5, condition: 0}, {name: "slam", combat: true, animals: true, maximum: 5, condition: 0, d6: 4}] },
										dexterity: { maximum: 6, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", animals: true, maximum: 14, condition: 0, d6: 1}] },
										speed: { maximum: 5, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 5, condition: 0}, {name: "swim", maximum: 10, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "ticocrag",
										demographics: { race: "ticocrag", age: 0, sex: "", height: 0, weight: 0 },
										description: "This is a metal machine of legend, a bipedal automaton with metal, electrified syringe-tipped arms and solid, magnetic legs. Standing at about 15 feet, the Ticocrag is humanoid, with a rounded metal head featuring large yellow glowing eyes.",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 10, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 7, condition: 0}, {name: "sound", unremovable: true, maximum: 7, condition: 0}, {name: "scent", unremovable: true, maximum: -14, condition: 0}, {name: "taste", unremovable: true, maximum: -14, condition: 0}, {name: "touch", unremovable: true, maximum: -14, condition: 0}] },
										memory: { maximum: 10, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 10, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 100, condition: 0}] },
										strength: { maximum: 15, damage: 0, condition: 0, skills: [{name: "punch", maximum: 5, condition: 0, d6: 6}, {name: "carry", maximum: 10, condition: 0}, {name: "throw", maximum: 7, condition: 0, combat: true}] },
										dexterity: { maximum: 10, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 15, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", animals: true, maximum: 14, condition: 0, d6: 6}] },
										speed: { maximum: 10, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 7, condition: 0}, {name: "swim", maximum: 0, condition: 0}] }
									},
									items: [
										{name:"electricity",count:0,type:"potion",weight:0,equipped:true,d6:2,conditions:{"paralysis_arms":1,"paralysis_legs":1},cost:0,description:"causes 2d6 unblockable electricity damage","id":"ltvqfxpdelrcemic"},
										{name:"acid",count:0,type:"potion",weight:0,equipped:true,d6:3,conditions:{"severe_pain": 1},cost:0,description:"causes 3d6 acid damage","id":"ltvqfxpdelrcemia"}
									]
								},
								{
									info: {
										name: "varishnap",
										demographics: { race: "varishnap", age: 0, sex: "", height: 0, weight: 0 },
										description: "This a desert pack animal resembles a large, hairy mule, with a single camel-like hump. Varishnaps require little food and water, preferring to eat cactus and other water-storing desert plants using baleen-whale-like teeth to filter out needles. Varishnaps are extremely strong with natural defenses due to their thick coats of ruffled fur, and can attack using their ram-like tusks.",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 6, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 3, condition: 0}, {name: "sound", unremovable: true, maximum: 5, condition: 0}, {name: "scent", unremovable: true, maximum: 2, condition: 0}, {name: "taste", unremovable: true, maximum: 1, condition: 0}, {name: "touch", unremovable: true, maximum: 3, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 10, condition: 0}] },
										strength: { maximum: 12, damage: 0, condition: 0, skills: [{name: "carry", maximum: 7, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, {name: "tusk", combat: true, animals: true, maximum: 5, condition: 0, d6: 5}] },
										dexterity: { maximum: 3, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 7, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", animals: true, maximum: 14, condition: 0, d6: 3}, {name: "temperature_resistance", animals: true, maximum: 5, condition: 0}] },
										speed: { maximum: 10, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 7, condition: 0}, {name: "swim", maximum: 3, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "velocigon",
										demographics: { race: "velocigon", age: 0, sex: "", height: 0, weight: 0 },
										description: "Velocigons have the five-foot, scaly reptilian body, long tail, clawing forearms, and sharp teeth of a velociraptor. Additionally, they breathe fire. Velocigons are fast-moving pack hunters with near-human intelligence, and they can use simple tools by utilizing the opposable digits on their two forearms. This creature is carnivorous and violent, and can communicate using a complex array of sounds.",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 11, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 4, condition: 0}, {name: "scent", unremovable: true, maximum: 6, condition: 0}, {name: "taste", unremovable: true, maximum: 3, condition: 0}, {name: "touch", unremovable: true, maximum: 3, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 4, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}] },
										strength: { maximum: 10, damage: 0, condition: 0, skills: [{name: "carry", maximum: 5, condition: 0}, {name: "throw", maximum: 5, condition: 0, combat: true}, , {name: "bite", combat: true, animals: true, d6: 4, maximum: 5, condition: 0}] },
										dexterity: { maximum: 6, damage: 0, condition: 0, skills: [{name: "claws", combat: true, animals: true, maximum: 5, condition: 0, d6: 3}] },
										immunity: { maximum: 8, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", animals: true, maximum: 14, condition: 0, d6: 2}, {name: "temperature_resistance", animals: true, maximum: 10, condition: 0}] },
										speed: { maximum: 8, damage: 0, condition: 0, skills: [{name: "jump", maximum: 7, condition: 0}, {name: "run", maximum: 10, condition: 0}, {name: "swim", maximum: 3, condition: 0}] }
									},
									items: [
										{name:"fire",count:0,type:"potion",weight:0,equipped:true,d6:3,conditions:{"extreme_heat":1,"extreme_cold":0},cost:0,description:"causes 3d6 fire damage","id":"xsmvlkycricyxfyj"},
										{name:"smoke",count:0,type:"potion",weight:0,equipped:true,conditions:{"smoke":2},cost:0,description:"causes smoke in 5-ft square and surrounding 5-ft squares for 2d6 rounds","id":"wlxrxewjrtjpgyli"}
									]
								},
								{
									info: {
										name: "yirth",
										demographics: { race: "yirth", age: 0, sex: "", height: 0, weight: 0 },
										description: "This grizzly bear-like monster has dark brown fur and six limbs - including two ordinary hind limbs with claws, and four insectoid forearms. These hard, green, large, insect-like scythes are subdivided into a pair of pincers, and below that, a pair of sharp blades. The creature has two green antennae coming from the top of its furry head, and its mouth is simply a large hole lined with spikes. Yirths are immensely strong and have defensive plating running down their spines. They are omnivorous beasts that prefer to live in hills and forests near water.",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 9, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 5, condition: 0}, {name: "sound", unremovable: true, maximum: 7, condition: 0}, {name: "scent", unremovable: true, maximum: 7, condition: 0}, {name: "taste", unremovable: true, maximum: 5, condition: 0}, {name: "touch", unremovable: true, maximum: 5, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}] },
										strength: { maximum: 15, damage: 0, condition: 0, skills: [{name: "carry", maximum: 5, condition: 0}, {name: "throw", maximum: 5, condition: 0, combat: true}, {name: "bite", combat: true, animals: true, d6: 4, maximum: 5, condition: 0}] },
										dexterity: { maximum: 6, damage: 0, condition: 0, skills: [{name: "claws", combat: true, animals: true, maximum: 5, condition: 0, d6: 3}] },
										immunity: { maximum: 10, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", animals: true, maximum: 14, condition: 0, d6: 3}, {name: "temperature_resistance", animals: true, maximum: 5, condition: 0}] },
										speed: { maximum: 10, damage: 0, condition: 0, skills: [{name: "jump", maximum: 5, condition: 0}, {name: "run", maximum: 7, condition: 0}, {name: "swim", maximum: 3, condition: 0}] }
									},
									items: []
								},
								{
									info: {
										name: "zlumb",
										demographics: { race: "zlumb", age: 0, sex: "", height: 0, weight: 0 },
										description: "The zlumb is a large feathered sphere with four short feathered legs underneath. It has a bump in the top of its body containing its brain, and from this lump protrude feeling antennae, compound eyes, and nostrils. The animal excretes, from a scent gland on this lump, a gas with a sweet smell that attracts animals - and puts them to sleep. At this point, the zlumb crawls over them and uses its long, straw-like organ on its underside to suck the blood from its prey. Zlumbs are egg-laying creatures that produce ostrich-size eggs every season. They mate by producing airborne pollen.",
										status: { points: 0, burden: 0, conditions: [], damage: 0 }
									},
									statistics: {
										perception: { maximum: 8, damage: 0, condition: 0, skills: [{name: "sight", unremovable: true, maximum: 3, condition: 0}, {name: "sound", unremovable: true, maximum: 1, condition: 0}, {name: "scent", unremovable: true, maximum: 5, condition: 0}, {name: "taste", unremovable: true, maximum: 1, condition: 0}, {name: "touch", unremovable: true, maximum: 5, condition: 0}] },
										memory: { maximum: 3, damage: 0, condition: 0, skills: [] },
										logic: { maximum: 3, damage: 0, condition: 0, skills: [{name: "aggression", animals: true, maximum: 15, condition: 0}] },
										strength: { maximum: 5, damage: 0, condition: 0, skills: [{name: "carry", maximum: 0, condition: 0}, {name: "throw", maximum: 0, condition: 0, combat: true}, , {name: "bite", combat: true, animals: true, d6: 2, maximum: 5, condition: 0}] },
										dexterity: { maximum: 3, damage: 0, condition: 0, skills: [] },
										immunity: { maximum: 8, damage: 0, condition: 0, skills: [{name: "recover", maximum: 0, condition: 0, d6: 1}, {name: "defend", animals: true, maximum: 14, condition: 0, d6: 1}, {name: "temperature_resistance", animals: true, maximum: 5, condition: 0}] },
										speed: { maximum: 6, damage: 0, condition: 0, skills: [{name: "jump", maximum: 3, condition: 0}, {name: "run", maximum: 3, condition: 0}, {name: "swim", maximum: 0, condition: 0}] }
									},
									items: [
										{name:"sleep",count:0,type:"potion",weight:0,equipped:true,conditions:{"sleep":1},cost:0,description:"causes sleep for 1d6 hours","id":"nxybuadccdymvsgy"}
									]
								}
							]
						break

						case "services":
							return [
								{
									name: "alchemist",
									tasks: [
										{name: "plant idenfitication", cost: 10, skills: [{statistic: "memory", name: "botany"}]},
										{name: "mineral idenfitication", cost: 10, skills: [{statistic: "memory", name: "geology"}]},
										{name: "potion idenfitication", cost: 10, skills: [{statistic: "memory", name: "alchemy"}]},
										{name: "potion brewing", cost: 10, skills: [{statistic: "memory", name: "alchemy"}]},
										{name: "potion deconstruction", cost: 20, skills: [{statistic: "memory", name: "alchemy"}]}
									]
								},
								{
									name: "beastmaster",
									tasks: [
										{name: "animal idenfitication", cost: 10, skills: [{statistic: "memory", name: "zoology"}]},
										{name: "animal boarding (per night)", cost: 10},
										{name: "animal grooming", cost: 5, skills: [{statistic: "logic", name: "handle_animals"}]},
										{name: "animal taming (per skill point)", cost: 20, skills: [{statistic: "logic", name: "handle_animals"}]},
										{name: "animal training (per skill point)", cost: 20, skills: [{statistic: "logic", name: "handle_animals"}]},
										{name: "animal performance", cost: 30, skills: [{statistic: "logic", name: "handle_animals"}]},
										{name: "animal rental: messenger bird (per message)", cost: 10, skills: [{statistic: "memory", name: "voice_recognition"}, {statistic: "speed", name: "fly"}]},
										{name: "animal rental: tracking hound (per day)", cost: 20, skills: [{statistic: "dexterity", name: "handle_animals"}, {statistic: "perception", name: "scent"}, {statistic: "perception", name: "sound"}]},
										{name: "animal rental: horse (per day)", cost: 30, skills: [{statistic: "dexterity", name: "ride_animals"}]},
										{name: "animal rental: camel (per day)", cost: 30, skills: [{statistic: "dexterity", name: "ride_animals"}]},
										{name: "animal rental: pack mule (per day)", cost: 20, skills: [{statistic: "logic", name: "handle_animals"}]}
									]
								},
								{
									name: "blacksmith",
									tasks: [
										{name: "armor repair (per d6)", cost: 20, skills: [{statistic: "memory", name: "metalworking"}]},
										{name: "shield repair (per d6)", cost: 20, skills: [{statistic: "memory", name: "metalworking"}]},
										{name: "weapon repair (per d6)", cost: 20, skills: [{statistic: "memory", name: "metalworking"}]},
										{name: "item repair", cost: 20, skills: [{statistic: "memory", name: "metalworking"}, {statistic: "dexterity", name: "crafting"}]}
									]
								},
								{
									name: "guard",
									tasks: [
										{name: "spy (per day)", cost: 20, skills: [{statistic: "speed", name: "sneak"}, {statistic: "memory", name: "lip_reading"}, {statistic: "memory", name: "facial_recognition"}, {statistic: "dexterity", name: "lock_picking"}]},
										{name: "protection (per day)", cost: 10, skills: [{statistic: "strength", name: "melee"}, {statistic: "dexterity", name: "fencing"}, {statistic: "dexterity", name: "missile"}]},
										{name: "protection (per night)", cost: 10, skills: [{statistic: "strength", name: "melee"}, {statistic: "dexterity", name: "fencing"}, {statistic: "dexterity", name: "missile"}, {statistic: "immunity", name: "sleep_resistance"}]}
									]
								},
								{
									name: "healer",
									tasks: [
										{name: "healing (per d6)", cost: 10, skills: [{statistic: "memory", name: "medicine"}, {statistic: "memory", name: "alchemy"}]},
										{name: "condition removal", cost: 20, skills: [{statistic: "memory", name: "medicine"}, {statistic: "memory", name: "alchemy"}]},
									]
								},
								{
									name: "innkeeper",
									tasks: [
										{name: "bed (per night)", cost: 20},
										{name: "animal boarding (per night)", cost: 10},
										{name: "meal", cost: 5, skills: [{statistic: "memory", name: "cooking"}]},
									]
								},
								{
									name: "performer",
									tasks: [
										{name: "game", cost: 20, skills: [{statistic: "logic", name: "game_playing"}]},
										{name: "music", cost: 20, skills: [{statistic: "dexterity", name: "performance"}, {statistic: "dexterity", name: "musicianship"}]},
										{name: "acrobatics", cost: 20, skills: [{statistic: "dexterity", name: "performance"}, {statistic: "dexterity", name: "escape_bonds"}, {statistic: "speed", name: "dance"}]},
										{name: "dance", cost: 20, skills: [{statistic: "dexterity", name: "performance"}, {statistic: "speed", name: "dance"}]},
										{name: "magic", cost: 20, skills: [{statistic: "dexterity", name: "performance"}, {statistic: "dexterity", name: "escape_bonds"}, {statistic: "dexterity", name: "sleight_of_hand"}]},
										{name: "acting", cost: 20, skills: [{statistic: "dexterity", name: "performance"}, {statistic: "logic", name: "humor"}, {statistic: "logic", name: "evoke_emotion"}]},
									]
								},
								{
									name: "scholar",
									tasks: [
										{name: "research", cost: 30, skills: [{statistic: "memory", name: "astronomy"}, {statistic: "memory", name: "botany"}, {statistic: "memory", name: "geography"}, {statistic: "memory", name: "geology"}, {statistic: "memory", name: "history"}, {statistic: "memory", name: "linguistics"}, {statistic: "logic", name: "mathematics"}, {statistic: "logic", name: "mechanics"}, {statistic: "memory", name: "medicine"}, {statistic: "memory", name: "zoology"}]},
										{name: "writing", cost: 10, skills: [{statistic: "dexterity", name: "penmanship"}, {statistic: "memory", name: "linguistics"}]},
										{name: "drawing", cost: 10, skills: [{statistic: "dexterity", name: "drawing"}]},
										{name: "text translation", cost: 20, skills: [{statistic: "memory", name: "linguistics"}, {statistic: "memory", name: "history"}]},
										{name: "code / puzzle solving", cost: 20, skills: [{statistic: "logic", name: "mathematics"}, {statistic: "logic", name: "spatial_reasoning"}, {statistic: "logic", name: "pattern_recognition"}]},
										{name: "plant idenfitication", cost: 10, skills: [{statistic: "memory", name: "botany"}]},
										{name: "mineral idenfitication", cost: 10, skills: [{statistic: "memory", name: "geology"}]},
										{name: "animal idenfitication", cost: 10, skills: [{statistic: "memory", name: "zoology"}]},
										{name: "artifact appraisal", cost: 20, skills: [{statistic: "memory", name: "history"}, {statistic: "logic", name: "mechanics"}]},
										{name: "skill training (per point)", cost: 100}
									]
								},
								{
									name: "storage",
									tasks: [
										{name: "items (per 100 lbs, per day", cost: 5}
									]
								},
								{
									name: "tailor",
									tasks: [
										{name: "clothing repair", cost: 10, skills: [{statistic: "dexterity", name: "crafting"}]}
									]
								},
								{
									name: "tanner",
									tasks: [
										{name: "leather repair", cost: 10, skills: [{statistic: "memory", name: "leatherworking"}]}
									]
								},
								{
									name: "transportation",
									tasks: [
										{name: "mount (per day)", cost: 30, skills: [{statistic: "dexterity", name: "ride_animals"}]},
										{name: "wagon + horse (per day)", cost: 100, skills: [{statistic: "logic", name: "handle_animals"}, {statistic: "memory", name: "geography"}]},
										{name: "river raft (per day)", cost: 30, skills: [{statistic: "memory", name: "geography"}]},
										{name: "ship passage (per day)", cost: 20},
										{name: "entire ship (per day)", cost: 200, skills: [{statistic: "memory", name: "geography"}]},
									]
								},
								{
									name: "woodworker",
									tasks: [
										{name: "armor repair (per d6)", cost: 20, skills: [{statistic: "memory", name: "woodworking"}]},
										{name: "shield repair (per d6)", cost: 20, skills: [{statistic: "memory", name: "woodworking"}]},
										{name: "weapon repair (per d6)", cost: 20, skills: [{statistic: "memory", name: "woodworking"}]},
										{name: "item repair", cost: 20, skills: [{statistic: "memory", name: "woodworking"}, {statistic: "dexterity", name: "crafting"}]}
									]
								}
							]
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
							"Set-Cookie": ("session=" + REQUEST.session.id + "; expires=" + (new Date(new Date().getTime() + ENVIRONMENT.cookieLength).toUTCString()) + "; path=/; domain=" + ENVIRONMENT.domain),
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
						if (typeof ENVIRONMENT.db !== "object") {
							callback({success: false, message: "invalid database"})
							return
						}
						callback(ENVIRONMENT.db)
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
					if (!ENVIRONMENT.db) {
						logError("database not found")
						callback({success: false, message: "database not found"})
						return
					}

				// collection
					if (!ENVIRONMENT.db[query.collection]) {
						logError("collection not found")
						callback({success: false, message: "collection not found"})
						return
					}

				// find
					if (query.command == "find") {
						// all documents
							var documentKeys = Object.keys(ENVIRONMENT.db[query.collection])

						// apply filters
							var filters = Object.keys(query.filters)
							for (var f in filters) {
								var property = filters[f]
								var filter = query.filters[property]

								if (filter instanceof RegExp) {
									documentKeys = documentKeys.filter(function(key) {
										return filter.test(ENVIRONMENT.db[query.collection][key][property])
									})
								}
								else {
									documentKeys = documentKeys.filter(function(key) {
										return filter == ENVIRONMENT.db[query.collection][key][property]
									})
								}
							}

						// get documents
							var documents = []
							for (var d in documentKeys) {
								documents.push(duplicateObject(ENVIRONMENT.db[query.collection][documentKeys[d]]))
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
							while (ENVIRONMENT.db[query.collection][id])

						// insert document
							ENVIRONMENT.db[query.collection][id] = duplicateObject(query.document)

						// return document
							callback({success: true, count: 1, documents: [query.document]})
							return
					}

				// update
					if (query.command == "update") {
						// all documents
							var documentKeys = Object.keys(ENVIRONMENT.db[query.collection])

						// apply filters
							var filters = Object.keys(query.filters)
							for (var f in filters) {
								documentKeys = documentKeys.filter(function(key) {
									return ENVIRONMENT.db[query.collection][key][filters[f]] == query.filters[filters[f]]
								})
							}

						// update keys
							var updateKeys = Object.keys(query.document)

						// update
							for (var d in documentKeys) {
								var document = ENVIRONMENT.db[query.collection][documentKeys[d]]

								for (var u in updateKeys) {
									document[updateKeys[u]] = query.document[updateKeys[u]]
								}
							}

						// update documents
							var documents = []
							for (var d in documentKeys) {
								documents.push(duplicateObject(ENVIRONMENT.db[query.collection][documentKeys[d]]))
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
							var documentKeys = Object.keys(ENVIRONMENT.db[query.collection])

						// apply filters
							var filters = Object.keys(query.filters)
							for (var f in filters) {
								documentKeys = documentKeys.filter(function(key) {
									return ENVIRONMENT.db[query.collection][key][filters[f]] == query.filters[filters[f]]
								})
							}

						// delete
							for (var d in documentKeys) {
								delete ENVIRONMENT.db[query.collection][documentKeys[d]]
							}

						// no documents
							if (!documentKeys.length) {
								callback({success: false, count: 0})
							}

						// yes documents
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
				MONGO.connect(ENVIRONMENT.db, { useNewUrlParser: true, useUnifiedTopology: true }, function(error, client) {
					// connect
						if (error) {
							logError(error)
							callback({success: false, message: error})
							client.close()
							return
						}

						var db = client.db(ENVIRONMENT.db_name)

					// find
						if (query.command == "find") {
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
										callback({success: true, count: documents.length, documents: documents})
										client.close()
										return
								})
						}

					// insert
						if (query.command == "insert") {
							// execute query
								db.collection(query.collection).insertOne(query.document, function (error, results) {
									// error
										if (error) {
											callback({success: false, message: JSON.stringify(error)})
											client.close()
											return
										}

									// success
										callback({success: true, count: results.nInserted, documents: [query.document]})
										client.close()
										return
								})
						}

					// update
						if (query.command == "update") {
							// prevent updating _id
								if (query.document._id) {
									delete query.document._id
								}

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
												callback({success: true, count: documents.length, documents: documents})
												client.close()
												return
										})
								})
						}

					// delete
						if (query.command == "delete") {
							db.collection(query.collection).deleteMany(query.filters, function(error, results) {
								// error
									if (error) {
										callback({success: false, message: JSON.stringify(error)})
										client.close()
										return
									}

								// yes documents
									callback({success: true, count: results.deletedCount})
									client.close()
									return
							})
						}
				})
			}
			catch (error) {
				logError(error)
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}
