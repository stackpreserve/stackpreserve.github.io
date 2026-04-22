function getTokenParam() {
    var params = new URLSearchParams(window.location.search);
    return params.get("token");
}

function showSuccess() {
    loader.style.display = "none";
    successCont.style.display = "";
}

function showError() {
    loader.style.display = "none";
    errorCont.style.display = "";
}

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

var loader = document.querySelector(".token-form__loader");
var successCont = document.querySelector(".token-form__success");
var errorCont = document.querySelector(".token-form__error");
var formCont = document.querySelector(".token-form__inner");
var passwordInput = document.querySelector(".token-form__password");
var passwordField = document.querySelector(".token-form__password-field")
var passwordError = document.querySelector(".token-form__password-error");
var submit = document.querySelector(".token-form__submit");
var passwordValue;
var tokenParam = getTokenParam();

new PasswordField(passwordField);

document.addEventListener("dragstart", e => {
    if (e.target.tagName === "IMG") {
        e.preventDefault();
    }
});

document.addEventListener("contextmenu", e => {
    if (e.target.tagName === "IMG") {
        e.preventDefault();
    }
});

if (tokenParam) {
    SPA.servReq("/checkToken", {token: tokenParam, purpose: "resetPassword"}, false, function(data) {
        loader.style.display = "none";
        if (data.valid) {
            formCont.style.display = "";
        } else {
            errorCont.style.display = "";
        }
    });
} else {
    loader.style.display = "none";
    errorCont.style.display = "";
}

submit.addEventListener("click", function() {

    passwordError.style.display = "none";

    function pwErrorMsg(msg) {
        passwordError.style.display = "";
        passwordError.innerText = msg;
        submit.disabled = false;
    }

    submit.disabled = true;

    if (passwordInput.value === "") {
        pwErrorMsg("You must enter a password");
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

    passwordValue = passwordInput.value;

    SPA.servReq("/confirmPasswordReset", {
        token: tokenParam,
        password: passwordValue
    }, false, function(data) {
        if (data.success) {
            formCont.style.display = "none";
            successCont.style.display = "";
        }
    });

}, false);