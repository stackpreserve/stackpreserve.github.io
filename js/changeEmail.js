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

var loader = document.querySelector(".token-form__loader");
var successCont = document.querySelector(".token-form__success");
var errorCont = document.querySelector(".token-form__error");
var tokenParam = getTokenParam();

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
    SPA.servReq("/confirmEmailChange", {token: tokenParam}, false, function(data) {
        if (data.success) {
            showSuccess();
        } else {
            showError();
        }
    });
} else {
    showError();
}