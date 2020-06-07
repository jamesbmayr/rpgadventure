window.addEventListener("load", function() {
	/*** globals ***/
		/* function library */
			window.FUNCTIONS = window.FUNCTIONS || {}

		/* triggers */
			if ((/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i).test(navigator.userAgent)) {
				window.TRIGGERS = {click: "touchstart", mousedown: "touchstart", mousemove: "touchmove", mouseup: "touchend", submit: "submit", change: "change", input: "input", focus: "focus", blur: "blur", resize: "resize", mouseenter: "touchstart", mouseleave: "touchend"}
			}
			else {
				window.TRIGGERS = {click:      "click", mousedown:  "mousedown", mousemove: "mousemove", mouseup:  "mouseup", submit: "submit", change: "change", input: "input", focus: "focus", blur: "blur", resize: "resize", mouseenter: "mouseenter", mouseleave: "mouseleave"}
			}

		/* defaults */
			document.addEventListener("dblclick", function(event) {
				event.preventDefault()
			})

			document.addEventListener("contextmenu", function(event) {
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

		/* searchSelect */
			window.FUNCTIONS.searchSelect = searchSelect
			function searchSelect(event) {
				try {
					// elements
						var componentElement = event.target.closest(".option-search")
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
						var options = Array.from(selectElement.querySelectorAll("option"))
						for (var i in options) {
							if (showAll || options[i].value.toLowerCase().includes(searchText)) {
								results.push({value: options[i].value, text: options[i].innerText, disabled: options[i].disabled})
							}
						}

					// no results
						if (!results.length) {
							resultsElement.innerText = ""
							return
						}

					// results
						resultsElement.innerHTML = ""
						for (var i in results) {
							// option
								var option = document.createElement("div")
									option.className = "option-search-result"
									option.setAttribute("disabled", results[i].disabled)
									option.innerText = results[i].text
									option.setAttribute("value", results[i].value)
									option.addEventListener(TRIGGERS.click, selectOption)
								resultsElement.appendChild(option)
						}
				} catch (error) {console.log(error)}
			}

		/* selectOption */
			window.FUNCTIONS.selectOption = selectOption
			function selectOption(event) {
				try {
					// elements
						var componentElement = event.target.closest(".option-search")
						var inputElement = componentElement.querySelector(".option-search-input")
						var resultsElement = componentElement.querySelector(".option-search-results")
						var selectElement = componentElement.querySelector(".option-search-select")
						var buttonElement = componentElement.querySelector(".option-search-button")
						if (!inputElement || !resultsElement || !selectElement || !buttonElement) {
							return false
						}

					// value
						var value = event.target.getAttribute("value")
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
						var inputElement = componentElement.querySelector(".option-search-input")
						var resultsElement = componentElement.querySelector(".option-search-results")
						if (!inputElement || !resultsElement) {
							return false
						}

					// reset search
						resultsElement.innerHTML = ""
						inputElement.value = ""
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
				// move canvas
					var halfWidth = Math.round(canvas.width / 2)
					var halfHeight = Math.round(canvas.height / 2)
					context.translate(halfWidth, -halfHeight)
					context.translate(offsetX, -offsetY)
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
				} catch (error) {}
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
				} catch (error) {}
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
						context.font         = (options.style ? options.style + " " : "") + (options.size || 20) + "px " + (options.font || "sans-serif")
						context.fillStyle    = options.color || "transparent"
						context.textAlign    = options.alignment || "center"
						context.shadowBlur   = options.blur ? options.blur : 0
						context.shadowColor  = options.shadow ? options.shadow : "transparent"
						context.globalAlpha  = options.opacity !== undefined ? options.opacity : 1

					// draw
						context.fillText((text || ""), x, canvas.height - y)
				} catch (error) {}
			}
})
