window.addEventListener("load", function() {
	/*** globals ***/
		/* libraries */
			var TRIGGERS = window.TRIGGERS
			var FUNCTIONS = window.FUNCTIONS

		/* elements */
			var ELEMENTS = {
				logo: document.getElementById("logo"),
				signup: {
					form: document.getElementById("signup-form"),
					username: document.getElementById("signup-username"),
					password: document.getElementById("signup-password"),
					switch: document.getElementById("signup-switch")
				},
				signin: {
					form: document.getElementById("signin-form"),
					username: document.getElementById("signin-username"),
					password: document.getElementById("signin-password"),
					switch: document.getElementById("signin-switch")
				}
			}

	/*** authentication ***/
		/* submitSignUp */
			if (ELEMENTS.signup.form) {
				ELEMENTS.signup.form.addEventListener(TRIGGERS.submit, submitSignUp)
				function submitSignUp(event) {
					try {
						// data
							var post = {
								action: "signUp",
								user: {
									name: ELEMENTS.signup.username.value,
									password: ELEMENTS.signup.password.value
								}
							}

						// validate
							if (!post.user.name || !FUNCTIONS.isNumLet(post.user.name) || post.user.name.length < 8) {
								FUNCTIONS.showToast({success: false, message: "name must be 8+ numbers and letters"})
								return
							}
							if (!post.user.password || post.user.password.length < 8) {
								FUNCTIONS.showToast({success: false, message: "password must be 8+ characters"})
								return
							}

						// authenticate
							FUNCTIONS.sendPost(post, function(response) {
								if (!response.success) {
									FUNCTIONS.showToast(response)
									return
								}

								window.location = response.location
							})
					} catch (error) {console.log(error)}
				}
			}

		/* submitSignIn */
			if (ELEMENTS.signin.form) {
				ELEMENTS.signin.form.addEventListener(TRIGGERS.submit, submitSignIn)
				function submitSignIn(event) {
					try {
						// post
							var post = {
								action: "signIn",
								user: {
									name: ELEMENTS.signin.username.value,
									password: ELEMENTS.signin.password.value
								}
							}

						// validate
							if (!post.user.name || !FUNCTIONS.isNumLet(post.user.name) || post.user.name < 8) {
								FUNCTIONS.showToast({success: false, message: "name must be 8+ numbers and letters"})
								return
							}
							if (!post.user.password || post.user.password < 8) {
								FUNCTIONS.showToast({success: false, message:"password must be 8+ characters"})
								return
							}

						// authenticate
							FUNCTIONS.sendPost(post, function(response) {
								if (!response.success) {
									FUNCTIONS.showToast(response)
									return
								}

								window.location = response.location
							})
					} catch (error) {console.log(error)}
				}
			}

		/* switchSignUp */
			if (ELEMENTS.signup.switch) {
				ELEMENTS.signup.switch.addEventListener(TRIGGERS.click, switchSignUp)
				function switchSignUp(event) {
					try {
						ELEMENTS.signup.form.setAttribute("visibility", false)
						ELEMENTS.signin.form.setAttribute("visibility", true)
					} catch (error) {console.log(error)}
				}
			}

		/* switchSignIn */
			if (ELEMENTS.signin.switch) {
				ELEMENTS.signin.switch.addEventListener(TRIGGERS.click, switchSignIn)
				function switchSignIn(event) {
					try {
						ELEMENTS.signin.form.setAttribute("visibility", false)
						ELEMENTS.signup.form.setAttribute("visibility", true)
					} catch (error) {console.log(error)}
				}
			}

	/*** logo ***/
		/* rollLogo */
			if (ELEMENTS.logo) {
				ELEMENTS.logo.addEventListener(TRIGGERS.click, rollLogo)
				function rollLogo(event) {
					try {
						ELEMENTS.logo.innerText = ""
						ELEMENTS.logo.setAttribute("rolling", true)
						setTimeout(function() {
							ELEMENTS.logo.removeAttribute("rolling")
							ELEMENTS.logo.innerText = Math.floor(Math.random() * 20) + 1
						}, 1000)
					} catch (error) {console.log(error)}
				}
			}
})
