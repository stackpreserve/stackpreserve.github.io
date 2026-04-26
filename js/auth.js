var dashboardRedirect = location.origin + "/dashboard/home/";

if (SPA.sessionId) {
    SPA.servReq("/checkLogin", {sessionId: SPA.sessionId}, false, function(data) {
        if (data.loggedIn) {
            location.href = dashboardRedirect;
        } else {
            auth();
        }
    })
} else {
    auth();
}

function auth() {

    var PasswordField = class {
        constructor(element) {
            this.element = element;
            this.input = this.element.querySelector(".password-field__password");
            this.togVisBtn = this.element.querySelector(".password-field__visibility");
            this.togVisIcon = this.element.querySelector(".password-field__visibility-icon");
            var preload = ["assets/show.webp"];

            preload.forEach(src => {
                var img = new Image();
                img.src = src;
            });

            var showPasswordInput = () => {
                this.input.type = "text";
                this.togVisIcon.src = "assets/show.webp";
            }

            var hidePasswordInput = () => {
                this.input.type = "password";
                this.togVisIcon.src = "assets/hide.webp";
            }

            this.togVisBtn.addEventListener("mousedown", showPasswordInput);
            this.togVisBtn.addEventListener("mouseup", hidePasswordInput);
            this.togVisBtn.addEventListener("mouseleave", hidePasswordInput);
            this.togVisBtn.addEventListener("touchstart", showPasswordInput);
            this.togVisBtn.addEventListener("touchend", hidePasswordInput);
            this.togVisBtn.addEventListener("touchcancel", hidePasswordInput);
            this.togVisIcon.addEventListener("contextmenu", (e) => e.preventDefault());
        }
    }

    function loginSignup() {
        new PasswordField(passwordField);

        rememberCheckbox.addEventListener("click", function() {
            if (rememberCheckboxIcon.getAttribute("checked") == "true") {
                rememberCheckboxIcon.setAttribute("checked", "false");
                rememberCheckboxIcon.src = "assets/unchecked.webp";
            } else {
                rememberCheckboxIcon.setAttribute("checked", "true");
                rememberCheckboxIcon.src = "assets/checked.webp";
            }
        });
    }

    var submitAuth = document.querySelector(".auth-form__submit");
    var emailInput = document.querySelector(".auth-form__email");
    var emailValue;

    var passwordInput = document.querySelector(".auth-form__password");
    var passwordField = document.querySelector(".auth-form__password-field");
    var rememberCheckbox = document.querySelector(".auth-form__remember");
    var rememberCheckboxIcon = document.querySelector(".auth-form__remember-icon");
    var passwordValue;
    var sessionRememberValue;

    if (location.pathname === "/login/") {

        loginSignup();
        var emailError = document.querySelector(".auth-form__email-error");
        var passwordError = document.querySelector(".auth-form__password-error");
        var loginError = document.querySelector(".auth-form__login-error");

        submitAuth.addEventListener("click", function() {

            emailError.style.display = "none";
            passwordError.style.display = "none";

            function emailErrorMsg(msg) {
                emailError.style.display = "";
                emailError.innerText = msg;
                submitAuth.disabled = false;
            }

            function pwErrorMsg(msg) {
                passwordError.style.display = "";
                passwordError.innerText = msg;
                submitAuth.disabled = false;
            }

            function loginErrorMsg(msg) {
                loginError.style.display = "";
                loginError.innerText = msg;
                submitAuth.disabled = false;
            }

            submitAuth.disabled = true;

            if (emailInput.value === "") {
                emailErrorMsg("You must enter your email");
                return;
            }

            if (passwordInput.value === "") {
                pwErrorMsg("You must enter your password");
                return;
            }

            SPA.servReq("/loginReq", {
                email: emailInput.value,
                password: passwordInput.value,
                sessionRemember: rememberCheckboxIcon.getAttribute("checked") === "true"
            }, false, function(data) {
                if (data.sessionId) {
                    SPA.setCookie("sessionId", data.sessionId);
                    location.href = dashboardRedirect;
                } else {
                    loginErrorMsg(data.error)
                }
            });
        });

        passwordInput.addEventListener("keyup", function(e) {
            if (e.keyCode === 13) {
                submitAuth.click();
            }
        });

    } else if (location.pathname === "/signup/") {

        loginSignup();
        var emailError = document.querySelector(".auth-form__email-error");
        var passwordError = document.querySelector(".auth-form__password-error");
        var first = document.querySelector(".auth-form__first");
        var second = document.querySelector(".auth-form__second");

        submitAuth.addEventListener("click", function() {

            emailError.style.display = "none";
            passwordError.style.display = "none";

            function emailErrorMsg(msg) {
                emailError.style.display = "";
                emailError.innerText = msg;
                submitAuth.disabled = false;
            }

            function pwErrorMsg(msg) {
                passwordError.style.display = "";
                passwordError.innerText = msg;
                submitAuth.disabled = false;
            }

            submitAuth.disabled = true;

            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value)) {
                emailErrorMsg("Email is invalid");
                return;
            }

            if (passwordInput.value.length < 8 || passwordInput.value.length > 30) {
                pwErrorMsg("Password must have 8 to 30 characters");
                return;
            }
        
            var hasLetter = /[a-zA-Z]/.test(passwordInput.value);
            if (!hasLetter) {
                pwErrorMsg("Password must include atleast one letter");
                return;
            }
        
            var hasDigit = /[0-9]/.test(passwordInput.value);
            if (!hasDigit) {
                pwErrorMsg("Password must include atleast one number");
                return;
            }
        
            var validChars = /^[a-zA-Z0-9!@#$%^&*()_\-+=:;|~]+$/;
            if (!validChars.test(passwordInput.value)) {
                pwErrorMsg("Invalid special character");
                return;
            }

            emailValue = emailInput.value;
            passwordValue = passwordInput.value;
            sessionRememberValue = rememberCheckboxIcon.getAttribute("checked") === "true";

            SPA.servReq("/signupReq", {
                email: emailValue,
                password: passwordValue,
                sessionRemember: sessionRememberValue
            }, false, function(data) {
                if (data.error) {
                    emailErrorMsg(data.error);
                } else {
                    verifyEmail();
                }
            });

        });

        function verifyEmail() {

            first.style.display = "none";
            second.style.display = "";

            function formatSeconds(seconds) {
                var minutes = Math.floor(seconds / 60);
                var secs = seconds % 60;
                return `in ${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
            }

            var emailText = document.querySelector(".auth-form__email-text");
            var codeDigits = document.querySelectorAll(".auth-form__code-digit");
            var verifyCodeBtn = document.querySelector(".auth-form__verify-code");
            var resendCodeBtn = document.querySelector(".auth-form__resend-link");
            var resendCodeCountdown = document.querySelector(".auth-form__resend-countdown");
            var codeError = document.querySelector(".auth-form__code-error");
            var cooldown = 30;
            var countdownRemaining = cooldown;

            emailText.innerText = emailValue;
            resendCodeCountdown.innerText = formatSeconds(countdownRemaining);
            codeDigits[0].focus();

            function updateCountdown() {
                if (countdownRemaining > 0) {
                    countdownRemaining -= 1;
                    if (countdownRemaining === 0) {
                        resendCodeCountdown.style.display = "none";
                        resendCodeBtn.style.cursor = "pointer";
                        resendCodeBtn.style.color = "#11aaa2";
                        clearInterval(countdownInterval);
                    } else {
                        resendCodeCountdown.innerText = formatSeconds(countdownRemaining);
                        resendCodeBtn.style.cursor = "";
                        resendCodeBtn.style.color = "#a7a7a7";
                    }
                }
            }

            var countdownInterval = setInterval(updateCountdown, 1000);

            resendCodeBtn.addEventListener("click", function() {
                if (countdownRemaining === 0) {
                    SPA.servReq("/signupReq", {
                        email: emailValue,
                        password: passwordValue,
                        sessionRemember: sessionRememberValue
                    }, false, function() {});
                    countdownRemaining = cooldown;
                    resendCodeCountdown.style.display = "";
                    resendCodeCountdown.innerText = formatSeconds(countdownRemaining);
                    resendCodeBtn.style.cursor = "";
                    resendCodeBtn.style.color = "#a7a7a7";
                    countdownInterval = setInterval(updateCountdown, 1000);
                }
            });

            function checkDigits() {
                var ready = true;
                codeDigits.forEach(codeDigit => {
                    if (codeDigit.value === "") {
                        ready = false;
                    }
                });
                if (ready) {
                    verifyCodeBtn.disabled = false;
                } else {
                    verifyCodeBtn.disabled = true;
                }
            }

            codeDigits[0].addEventListener("paste", function(event) {
                var paste = event.clipboardData.getData("text")
                if (/^\d+$/.test(paste)) {
                    codeDigits.forEach((codeDigit, index) => {
                        codeDigit.value = paste[index];
                    });
                }
            });

            codeDigits.forEach((codeDigit, index) => {
                codeDigit.addEventListener("focus", function(event) {
                    /*if (index !== 0) {
                        if (codeDigits[index-1].value === "") {
                            codeDigits[index-1].focus();
                            return;
                        }
                    }*/
                    var length = codeDigit.value.length;
                    codeDigit.setSelectionRange(length, length);
                });
                codeDigit.addEventListener("keydown", (event) => {
                    var allowedKeys = [
                        "Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"
                    ];
                    if (
                        !allowedKeys.includes(event.key) &&
                        !(event.key >= "0" && event.key <= "9")
                    ) {
                        event.preventDefault();
                        return;
                    }

                    if (event.key >= "0" && event.key <= "9" && codeDigits[index + 1]) {
                        if (codeDigits[index + 1].value === "") {
                            setTimeout(() => codeDigits[index + 1].focus(), 1);
                        }
                    }

                    if (event.key === "Backspace" && codeDigit.value === "" && codeDigits[index - 1]) {
                        setTimeout(() => codeDigits[index - 1].focus(), 1);
                    }

                    if (event.key === "ArrowLeft") {
                        event.preventDefault();
                        if (codeDigits[index - 1]) {
                            codeDigits[index - 1].focus();
                        }
                    }

                    if (event.key === "ArrowRight") {
                        event.preventDefault();
                        if (codeDigits[index + 1]) {
                            codeDigits[index + 1].focus();
                        }
                    }

                    setTimeout(checkDigits, 1);
                });
                codeDigit.addEventListener("keyup", function(event) {
                    if (event.key === "Enter") {
                        if (!verifyCodeBtn.disabled) {
                            verifyCodeBtn.click();
                        }
                    }
                });
            });

            verifyCodeBtn.addEventListener("click", function() {

                verifyCodeBtn.disabled = true;
                var codeValue = "";
                
                codeDigits.forEach(codeDigit => {
                    codeValue += codeDigit.value;
                });
                
                SPA.servReq("/confirmSignup", {
                    email: emailValue,
                    code: codeValue
                }, false, function(data) {
                    if (data.error) {
                        verifyCodeBtn.disabled = false;
                        codeError.innerText = data.error;
                        if (data.error === "Code has expired, resend a new one") {
                            codeDigits.forEach(codeDigit => {
                                codeDigit.value = "";
                            });
                        }
                    } else {
                        SPA.setCookie("sessionId", data.sessionId);
                        SPA.setCookie("firstLogin", true);
                        location.href = dashboardRedirect;
                    }
                });
            });

        }

    } else if (location.pathname === "/forgot-password/") {
        var forgotPasswordError = document.querySelector(".auth-form__forgot-error");
        var forgotPasswordForm = document.querySelector(".auth-form__forgot-form");
        var forgotPasswordSuccess = document.querySelector(".auth-form__forgot-success");
        var forgotPasswordSuccessEmail = document.querySelector(".auth-form__forgot-success-email");

        emailInput.addEventListener("input", function() {
            if (emailInput.value !== "") {
                submitAuth.disabled = false;
            } else {
                submitAuth.disabled = true;
            }
        });

        submitAuth.addEventListener("click", function() {
            submitAuth.disabled = true;
            forgotPasswordError.style.display = "none"

            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value)) {
                forgotPasswordError.style.display = ""
                forgotPasswordError.innerText = "Email is invalid";
                submitAuth.disabled = false;
                return;
            }

            emailValue = emailInput.value;

            SPA.servReq("/requestPasswordReset", {email: emailValue}, false, function(data) {
                if (data.error) {
                    forgotPasswordError.style.display = ""
                    forgotPasswordError.innerText = data.error;
                    submitAuth.disabled = false;
                } else {
                    forgotPasswordForm.style.display = "none";
                    forgotPasswordSuccess.style.display = "";
                    forgotPasswordSuccessEmail.innerText = emailValue;
                }
            });
        });
    }

}