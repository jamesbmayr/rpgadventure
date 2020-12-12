window.addEventListener("load", function() {
	/*** globals ***/
		/* function library */
			window.FUNCTIONS = window.FUNCTIONS || {}

		/* triggers */
			window.TRIGGERS = {
				submit: "submit",
				reset: "reset",
				change: "change",
				input: "input",
				focus: "focus",
				blur: "blur",
				resize: "resize",
				keydown: "keydown",
				keyup: "keyup",
				scroll: "wheel",
				rightclick: "contextmenu",
				doubleclick: "dblclick",
				dragstart: "dragstart",
				dragend: "dragend",
				dragover: "dragover",
				dragenter: "dragenter",
				dragleave: "dragleave",
				drop: "drop"
			}
			if ((/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i).test(navigator.userAgent)) {
				window.TRIGGERS.click = "touchstart"
				window.TRIGGERS.mousedown = "touchstart"
				window.TRIGGERS.mousemove = "touchmove"
				window.TRIGGERS.mouseup = "touchend"
				window.TRIGGERS.mouseenter = "touchstart"
				window.TRIGGERS.mouseleave = "touchend"
			}
			else {
				window.TRIGGERS.click = "click"
				window.TRIGGERS.mousedown = "mousedown"
				window.TRIGGERS.mousemove = "mousemove"
				window.TRIGGERS.mouseup = "mouseup"
				window.TRIGGERS.mouseenter = "mouseenter"
				window.TRIGGERS.mouseleave = "mouseleave"
			}

		/* defaults */
			document.addEventListener(TRIGGERS.doubleclick, function(event) {
				event.preventDefault()
			})

			document.addEventListener(TRIGGERS.rightclick, function(event) {
				event.preventDefault()
			})

			document.addEventListener(TRIGGERS.dragover, function(event) {
				event.preventDefault()
			})

	/*** checks ***/
		/* isNumLet */
			window.FUNCTIONS.isNumLet = isNumLet
			function isNumLet(string) {
				try {
					return (/^[a-zA-Z0-9]+$/).test(string)
				} catch (error) {console.log(error)}
			}

		/* isDifferent */
			window.FUNCTIONS.isDifferent = isDifferent
			function isDifferent(data1, data2) {
				try {
					if ((data1 === null && data2 === undefined) || (data1 === undefined && data2 === null)) {
						return false
					}
					if (typeof data1 !== typeof data2) {
						return true
					}
					if ((typeof data1 == "string" || typeof data1 == "number" || typeof data1 == "boolean") && data1 !== data2) {
						return true
					}
					if (typeof data1 == "object" && JSON.stringify(data1) !== JSON.stringify(data2)) {
						return true
					}

					return false
				} catch (error) {console.log(error)}
			}

	/*** tools ***/
		/* duplicateObject */
			window.FUNCTIONS.duplicateObject = duplicateObject
			function duplicateObject(obj) {
				try {
					if (typeof obj == "object") {
						return JSON.parse(JSON.stringify(obj))
					}
					else {
						return obj
					}
				} catch (error) {console.log(error)}
			}

		/* sendPost */
			window.FUNCTIONS.sendPost = sendPost
			function sendPost(options, callback) {
				try {
					// create request object and send to server
						var request = new XMLHttpRequest()
							request.open("POST", location.pathname, true)
							request.onload = function() {
								if (request.readyState !== XMLHttpRequest.DONE || request.status !== 200) {
									callback({success: false, readyState: request.readyState, message: request.status})
									return
								}
								
								callback(JSON.parse(request.responseText) || {success: false, message: "unknown error"})
							}
							request.send(JSON.stringify(options))
				} catch (error) {console.log(error)}
			}

		/* showToast */
			window.TOASTTIME = null
			window.FUNCTIONS.showToast = showToast
			function showToast(data) {
				try {
					// clear existing countdowns
						if (window.TOASTTIME) {
							clearTimeout(window.TOASTTIME)
							window.TOASTTIME = null
						}

					// append
						if (!window.TOAST) {
							window.TOAST = document.createElement("div")
							window.TOAST.id = "toast"
							window.TOAST.setAttribute("visibility", false)
							window.TOAST.setAttribute("success", false)
							document.body.appendChild(window.TOAST)
						}

					// show
						window.TOAST.innerHTML = data.message
						window.TOAST.setAttribute("success", data.success || false)
						window.TOAST.setAttribute("visibility", true)

					// hide
						window.TOASTTIME = setTimeout(function() {
							window.TOAST.setAttribute("visibility", false)
						}, 5000)
				} catch (error) {console.log(error)}
			}

	/*** search ***/
		/* searchSelect */
			window.FUNCTIONS.searchSelect = searchSelect
			function searchSelect(event) {
				try {
					// elements
						var componentElement = event.target.closest(".option-search")
						if (!componentElement) {
							return false
						}

						var resultsElement = componentElement.querySelector(".option-search-results")
						var selectElement = componentElement.querySelector(".option-search-select")
						if (!resultsElement || !selectElement) {
							return false
						}

					// search
						var searchText = event.target.value.trim().toLowerCase()
						if (!searchText.length) {
							var showAll = true
						}

					// search
						var results = []
						var groups = []
						var options = Array.from(selectElement.querySelectorAll("option"))
						for (var i in options) {
							if (showAll || options[i].innerText.toLowerCase().includes(searchText)) {
								var group = (options[i].parentNode == selectElement ? null : options[i].parentNode.getAttribute("label") || null)
								results.push({value: options[i].value, text: options[i].innerText, disabled: options[i].disabled, group: group})
								if (group && !groups.includes(group)) {
									groups.push(group)
								}
							}
						}

					// no results
						resultsElement.innerHTML = ""
						if (!results.length) {
							selectElement.value = ""
							return
						}

					// groups
						for (var i in groups) {
							var groupElement = document.createElement("div")
								groupElement.className = "option-search-group"
								groupElement.setAttribute("label", groups[i])
							resultsElement.appendChild(groupElement)

							var label = document.createElement("label")
								label.className = "option-search-group-label"
								label.innerHTML = groups[i]
							groupElement.appendChild(label)
						}

					// results
						results.sort(function(a, b) {
							return (a.text.toLowerCase() < b.text.toLowerCase()) ? -1 : 1
						})
						for (var i in results) {
							// option
								var label = document.createElement("label")
									label.className = "option-search-result"
									label.innerText = results[i].text
									label.setAttribute("tabindex", 1)

								var button = document.createElement("input")
									button.type = "submit"
									button.className = "option-search-result-input"
									if (results[i].disabled) {
										label.setAttribute("disabled", true)
										button.setAttribute("disabled", true)
									}
									button.value = results[i].value
									button.addEventListener("click", selectOption)
								label.appendChild(button)

							// append
								if (results[i].group) {
									var parent = resultsElement.querySelector(".option-search-group[label='" + results[i].group + "']")
									if (parent) {
										parent.appendChild(label)
									}
									else {
										resultsElement.appendChild(label)
									}
								}
								else {
									resultsElement.appendChild(label)
								}
						}

					// select one
						var options = Array.from(resultsElement.querySelectorAll(".option-search-result-input:not([disabled='true'])"))
						selectElement.value = options.length ? options[0].value : ""
				} catch (error) {console.log(error)}
			}

		/* selectOption */
			window.FUNCTIONS.selectOption = selectOption
			function selectOption(event) {
				try {
					// elements
						var componentElement = event.target.closest(".option-search")
						if (!componentElement) {
							return false
						}

						var inputElement = componentElement.querySelector(".option-search-input")
						var resultsElement = componentElement.querySelector(".option-search-results")
						var selectElement = componentElement.querySelector(".option-search-select")
						var buttonElement = componentElement.querySelector(".option-search-button")
						if (!inputElement || !resultsElement || !selectElement || !buttonElement) {
							return false
						}

					// close
						if (event.target.className.includes("option-search-close")) {
							selectElement.value = "[none]"
							buttonElement.click()
							return
						}

					// value
						var value = event.target.value
						if (!value) {
							return false
						}

					// reset search
						resultsElement.innerHTML = ""
						inputElement.value = ""

					// set select
						selectElement.value = value
						buttonElement.click()
				} catch (error) {console.log(error)}
			}

		/* cancelSearch */
			window.FUNCTIONS.cancelSearch = cancelSearch
			function cancelSearch(event) {
				try {
					// elements
						var componentElement = event.target.closest(".option-search")
						if (!componentElement) {
							return false
						}

					// cancel button or other element within search?
						if (event.target.className.includes("option-search-cancel")) {
							// continue
						}
						else if (event.relatedTarget && componentElement == event.relatedTarget.closest(".option-search")) {
							return false
						}
						else if (event.explicitOriginalTarget && (componentElement == event.explicitOriginalTarget.parentNode || componentElement == event.explicitOriginalTarget.parentNode.closest(".option-search"))) {
							return false
						}

						var inputElement = componentElement.querySelector(".option-search-input")
						var resultsElement = componentElement.querySelector(".option-search-results")
						if (!inputElement || !resultsElement) {
							return false
						}

					// reset search
						resultsElement.innerHTML = ""
						inputElement.value = ""
						document.activeElement.blur()
				} catch (error) {console.log(error)}
			}

	/*** randoms ***/
		/* generateRandom */
			window.FUNCTIONS.generateRandom = generateRandom
			function generateRandom(set, length) {
				try {
					set = set || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
					length = length || 32
					
					var output = ""
					for (var i = 0; i < length; i++) {
						output += (set[Math.floor(Math.random() * set.length)])
					}

					return output
				} catch (error) {console.log(error)}
			}

		/* sortRandom */
			window.FUNCTIONS.sortRandom = sortRandom
			function sortRandom(array) {
				try {
					// duplicate array
						var output = duplicateObject(array)

					// fisher-yates shuffle
						var x = output.length
						while (x > 0) {
							var y = Math.floor(Math.random() * x)
							x = x - 1
							var temp = output[x]
							output[x] = output[y]
							output[y] = temp
						}

					return output
				} catch (error) {console.log(error)}
			}

	/*** canvas ***/
		/* resizeCanvas */
			window.FUNCTIONS.resizeCanvas = resizeCanvas
			function resizeCanvas(canvas) {
				try {
					// resize
						var rectangle = canvas.getBoundingClientRect()
						canvas.height = rectangle.height
						canvas.width = rectangle.width
				} catch (error) {console.log(error)}
			}

		/* clearCanvas */
			window.FUNCTIONS.clearCanvas = clearCanvas
			function clearCanvas(canvas, context) {
				try {
					// clear
						context.clearRect(0, 0, canvas.width, canvas.height)
				} catch (error) {console.log(error)}
			}

		/* translateCanvas */
			window.FUNCTIONS.translateCanvas = translateCanvas
			function translateCanvas(canvas, context, offsetX, offsetY) {
				try {
					// move canvas
						var halfWidth = Math.round(canvas.width / 2)
						var halfHeight = Math.round(canvas.height / 2)
						context.translate(halfWidth, -halfHeight)
						context.translate(offsetX, -offsetY)
				} catch (error) {console.log(error)}
			}

		/* rotateCanvas */
			window.FUNCTIONS.rotateCanvas = rotateCanvas
			function rotateCanvas(canvas, context, x, y, degrees, callback) {
				try {
					// no rotation
						if (!degrees || degrees % 360 == 0) {
							callback()
							return
						}
						
					// rotate
						context.translate(x, y)
						context.rotate(degrees * Math.PI / 180)
						context.translate(-x, -y)

					// do whatever
						callback()

					// rotate back
						context.translate(x, y)
						context.rotate(-degrees * Math.PI / 180)
						context.translate(-x, -y)
				} catch (error) {console.log(error)}
			}

		/* drawLine */
			window.FUNCTIONS.drawLine = drawLine
			function drawLine(canvas, context, x1, y1, x2, y2, options) {
				try {
					// parameters
						options = options || {}
						context.beginPath()
						context.strokeStyle = options.color || "transparent"
						context.lineWidth   = options.border || 1
						context.shadowBlur  = options.blur ? options.blur : 0
						context.shadowColor = options.shadow ? options.shadow : "transparent"
						context.globalAlpha = options.opacity !== undefined ? options.opacity : 1
						
					// draw
						context.moveTo(x1, canvas.height - y1)
						context.lineTo(x2, canvas.height - y2)
						context.stroke()
				} catch (error) {console.log(error)}
			}

		/* drawCircle */
			window.FUNCTIONS.drawCircle = drawCircle
			function drawCircle(canvas, context, x, y, radius, options) {
				try {
					// parameters
						options = options || {}
						context.beginPath()
						context.fillStyle   = options.color || "transparent"
						context.strokeStyle = options.color || "transparent"
						context.lineWidth   = options.border || 0
						context.shadowBlur  = options.blur ? options.blur : 0
						context.shadowColor = options.shadow ? options.shadow : "transparent"
						context.globalAlpha = options.opacity !== undefined ? options.opacity : 1

					// draw
						if (options.border) {
							context.arc(x, canvas.height - y, radius, (options.start || 0), (options.end || (2 * Math.PI)))
							context.stroke()
						}
						else {
							context.moveTo(x, canvas.height - y)
							context.arc(x, canvas.height - y, radius, (options.start || 0), (options.end || (2 * Math.PI)), true)
							context.closePath()
							context.fill()
						}
				} catch (error) {console.log(error)}
			}

		/* drawRectangle */
			window.FUNCTIONS.drawRectangle = drawRectangle
			function drawRectangle(canvas, context, x, y, width, height, options) {
				try {
					// parameters
						options = options || {}
						context.beginPath()
						context.fillStyle   = options.color || "transparent"
						context.lineWidth   = options.border || 1
						context.shadowBlur  = options.blur ? options.blur : 0
						context.shadowColor = options.shadow ? options.shadow : "transparent"
						context.globalAlpha = options.opacity !== undefined ? options.opacity : 1

					// draw
						if (options.radii) {
							context.moveTo(x + options.radii.topLeft, canvas.height - y - height)
							context.lineTo(x + width - options.radii.topRight, canvas.height - y - height)
							context.quadraticCurveTo(x + width, canvas.height - y - height, x + width, canvas.height - y - height + options.radii.topRight)
							context.lineTo(x + width, canvas.height - y - options.radii.bottomRight)
							context.quadraticCurveTo(x + width, canvas.height - y, x + width - options.radii.bottomRight, canvas.height - y)
							context.lineTo(x + options.radii.bottomLeft, canvas.height - y)
							context.quadraticCurveTo(x, canvas.height - y, x, canvas.height - y - options.radii.bottomLeft)
							context.lineTo(x, canvas.height - y - height + options.radii.topLeft)
							context.quadraticCurveTo(x, canvas.height - y - height, x + options.radii.topLeft, canvas.height - y - height)
							context.closePath()
							context.fill()
						}
						else {
							context.fillRect(x, canvas.height - y, width, -1 * height)
						}
				} catch (error) {console.log(error)}
			}

		/* drawImage */
			window.FUNCTIONS.drawImage = drawImage
			function drawImage(canvas, context, x, y, width, height, options) {
				try {
					// get blur
						drawRectangle(canvas, context, x, y, width, height, options)

					// save
						context.save()

					// parameters
						options = options || {}
						context.beginPath()
						context.fillStyle   = options.color || "transparent"
						context.lineWidth   = options.border || 1
						context.shadowBlur  = options.blur ? options.blur : 0
						context.shadowColor = options.shadow ? options.shadow : "transparent"
						context.globalAlpha = options.opacity !== undefined ? options.opacity : 1

					// clip
						if (options.radii) {
							context.moveTo(x + options.radii.topLeft, canvas.height - y - height)
							context.lineTo(x + width - options.radii.topRight, canvas.height - y - height)
							context.quadraticCurveTo(x + width, canvas.height - y - height, x + width, canvas.height - y - height + options.radii.topRight)
							context.lineTo(x + width, canvas.height - y - options.radii.bottomRight)
							context.quadraticCurveTo(x + width, canvas.height - y, x + width - options.radii.bottomRight, canvas.height - y)
							context.lineTo(x + options.radii.bottomLeft, canvas.height - y)
							context.quadraticCurveTo(x, canvas.height - y, x, canvas.height - y - options.radii.bottomLeft)
							context.lineTo(x, canvas.height - y - height + options.radii.topLeft)
							context.quadraticCurveTo(x, canvas.height - y - height, x + options.radii.topLeft, canvas.height - y - height)
							context.closePath()
							context.clip()
						}
						else {
							var region = new Path2D()
								region.rect(x, canvas.height - y, width, -1 * height)
							context.clip(region)
						}

					// image
						try {
							context.drawImage(options.image, x, canvas.height - y - height, width, height)
						} catch (error) {}

					// restore
						context.restore()
				} catch (error) {console.log(error)}
			}

		/* drawText */
			window.FUNCTIONS.drawText = drawText
			function drawText(canvas, context, x, y, text, options) {
				try {
					// variables
						options = options || {}
						context.textBaseline = options.baseline || "middle"
						context.font         = (options.style ? options.style + " " : "") + (options.size > 0 ? options.size : 0) + "px " + (options.font || "sans-serif")
						context.fillStyle    = options.color || "transparent"
						context.textAlign    = options.alignment || "center"
						context.shadowBlur   = options.blur ? options.blur : 0
						context.shadowColor  = options.shadow ? options.shadow : "transparent"
						context.globalAlpha  = options.opacity !== undefined ? options.opacity : 1

					// draw
						context.fillText((text || ""), x, canvas.height - y)
				} catch (error) {console.log(error)}
			}
})
