var backToListBtn = document.querySelector(".title-cont__back-to-list");
var loaderEl = document.querySelector(".loader-list-el");
var account = document.querySelector(".account");

var email = document.querySelector(".account__email");
var editEmailBtn = document.querySelector(".account__edit-email");
var editEmailForm = document.querySelector(".account__edit-email-form");
var editEmailFormClose = document.querySelector(".account__email-close");
var editEmailPasswordField = document.querySelector(".account__email-password-field");
var editEmailPasswordInput = document.querySelector(".account__email-password");
var editEmailNewInput = document.querySelector(".account__email-new");
var editEmailPasswordError = document.querySelector(".account__email-password-error");
var editEmailNewError = document.querySelector(".account__email-new-error");
var editEmailSubmitBtn = document.querySelector(".account__email-submit");

var editPasswordBtn = document.querySelector(".account__edit-password");
var editPasswordForm = document.querySelector(".account__edit-password-form");
var editPasswordFormClose = document.querySelector(".account__password-close");
var editPasswordCurField = document.querySelector(".account__password-cur-field");
var editPasswordCurInput = document.querySelector(".account__password-cur");
var editPasswordNewField = document.querySelector(".account__password-new-field");
var editPasswordNewInput = document.querySelector(".account__password-new");
var editPasswordCurError = document.querySelector(".account__password-cur-error");
var editPasswordNewError = document.querySelector(".account__password-new-error");
var editPasswordSubmitBtn = document.querySelector(".account__password-submit");

var deleteAccBtn = document.querySelector(".account__delete-account");
var deleteAccForm = document.querySelector(".account__delete-account-form");
var deleteAccFormClose = document.querySelector(".account__delete-close");
var deleteAccPasswordInput = document.querySelector(".account__delete-password");
var deleteAccPasswordField = document.querySelector(".account__delete-password-field");
var deleteAccError = document.querySelector(".account__delete-error");
var deleteAccSubmitBtn = document.querySelector(".account__delete-submit");
var loader = new DynaList(loaderEl, "Couldn't load account settings", function() {});

new PasswordField(editEmailPasswordField);
new PasswordField(editPasswordCurField);
new PasswordField(editPasswordNewField);
new PasswordField(deleteAccPasswordField);

backToListBtn.addEventListener("click", async function() {
    history.replaceState(null, "", "/dashboard/settings/");
    await refreshPage();
});

function closeEditEmailForm() {
    editEmailForm.style.display = "none";
    cover.element.style.display = "none";
}

function openEditEmailForm() {
    editEmailPasswordInput.value = "";
    editEmailPasswordError.style.display = "none";
    editEmailNewInput.value = "";
    editEmailNewError.style.display = "none";
    editEmailForm.style.display = "";
    editEmailSubmitBtn.disabled = false;
    cover.element.style.display = "";
    cover.addOnClick(closeEditEmailForm);
}

function closeEditPasswordForm() {
    editPasswordForm.style.display = "none";
    cover.element.style.display = "none";
}

function openEditPasswordForm() {
    editPasswordCurInput.value = "";
    editPasswordCurError.style.display = "none";
    editPasswordNewInput.value = "";
    editPasswordNewError.style.display = "none";
    editPasswordForm.style.display = "";
    editPasswordSubmitBtn.disabled = false;
    cover.element.style.display = "";
    cover.addOnClick(closeEditPasswordForm);
}

function openDeleteAccForm() {
    deleteAccError.style.display = "none";
    deleteAccSubmitBtn.disabled = true;
    deleteAccPasswordInput.value = "";
    deleteAccForm.style.display = "";
    cover.element.style.display = "";
    cover.addOnClick(closeDeleteAccForm);
}

function closeDeleteAccForm() {
    deleteAccForm.style.display = "none";
    cover.element.style.display = "none";
}

function deleteAccReady() {
    if (deleteAccPasswordInput.value === "") {
        deleteAccSubmitBtn.disabled = true;
    } else {
        deleteAccSubmitBtn.disabled = false;
    }
}

editEmailSubmitBtn.addEventListener("click", function() {
    editEmailPasswordError.style.display = "none";
    editEmailNewError.style.display = "none";
    var editEmailPasswordInputValue = editEmailPasswordInput.value;
    var editEmailNewInputValue = editEmailNewInput.value

    function editEmailPasswordErrorMsg(msg) {
        editEmailPasswordError.style.display = "";
        editEmailPasswordError.innerText = msg;
        editEmailSubmitBtn.disabled = false;
    }

    function editEmailNewErrorMsg(msg) {
        editEmailNewError.style.display = "";
        editEmailNewError.innerText = msg;
        editEmailSubmitBtn.disabled = false;
    }

    editEmailSubmitBtn.disabled = true;

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editEmailNewInputValue)) {
        editEmailNewErrorMsg("Email is invalid");
        return;
    }

    if (editEmailNewInputValue === "") {
        editEmailNewErrorMsg("You must enter an email");
        return;
    }

    SPA.servReq("/requestEmailChange", {
        sessionId: SPA.sessionId,
        password: editEmailPasswordInputValue,
        email: editEmailNewInputValue
    }, false, async function(data) {
        if (data.success) {
            closeEditEmailForm();
            openConfirmationMessage(true, "Confirmation email sent");
        } else if (data.error === "Incorrect password") {
            editEmailPasswordErrorMsg(data.error);
        } else if (data.error === "Email already in use") {
            editEmailNewErrorMsg(data.error);
        }
    });
});
editEmailBtn.addEventListener("click", openEditEmailForm);
editEmailFormClose.addEventListener("click", closeEditEmailForm);

editPasswordSubmitBtn.addEventListener("click", function() {
    editPasswordCurError.style.display = "none";
    editPasswordNewError.style.display = "none";

    function editPasswordCurErrorMsg(msg) {
        editPasswordCurError.style.display = "";
        editPasswordCurError.innerText = msg;
        editPasswordSubmitBtn.disabled = false;
    }

    function editPasswordNewErrorMsg(msg) {
        editPasswordNewError.style.display = "";
        editPasswordNewError.innerText = msg;
        editPasswordSubmitBtn.disabled = false;
    }

    editPasswordSubmitBtn.disabled = true;

    if (editPasswordCurInput.value === "") {
        editPasswordCurErrorMsg("You must enter your current password");
        return;
    }

    if (editPasswordNewInput.value.length < 8 || editPasswordNewInput.value.length > 30) {
        editPasswordNewErrorMsg("Password must have 8 to 30 characters");
        return;
    }

    var hasLetter = /[a-zA-Z]/.test(editPasswordNewInput.value);
    if (!hasLetter) {
        editPasswordNewErrorMsg("Password must include atleast one letter");
        return;
    }

    var hasDigit = /[0-9]/.test(editPasswordNewInput.value);
    if (!hasDigit) {
        editPasswordNewErrorMsg("Password must include atleast one number");
        return;
    }

    var validChars = /^[a-zA-Z0-9!@#$%^&*()_\-+=:;|~]+$/;
    if (!validChars.test(editPasswordNewInput.value)) {
        editPasswordNewErrorMsg("Invalid special character");
        return;
    }

    if (editPasswordNewInput.value === "") {
        editPasswordNewErrorMsg("You must enter a new password");
        return;
    }

    SPA.servReq("/changePassword", {
        sessionId: SPA.sessionId,
        curPassword: editPasswordCurInput.value,
        newPassword: editPasswordNewInput.value
    }, false, async function(data) {
        if (data.success) {
            closeEditPasswordForm();
            openConfirmationMessage(true, "Password changed");
        } else if (data.error === "Incorrect password") {
            editPasswordCurErrorMsg("Incorrect password");
        }
    });

});
editPasswordBtn.addEventListener("click", openEditPasswordForm);
editPasswordFormClose.addEventListener("click", closeEditPasswordForm);

deleteAccSubmitBtn.addEventListener("click", function() {
    deleteAccSubmitBtn.disabled = true;
    SPA.servReq("/deleteAccount", {
        sessionId: SPA.sessionId,
        password: deleteAccPasswordInput.value,
    }, false, async function(data) {
        if (data.success) {
            SPA.removeCookie("sessionId");
            location.href = homeRedirect;
        } else if (data.error) {
            deleteAccError.innerText = data.error;
            deleteAccError.style.display = "";
            deleteAccSubmitBtn.disabled = false;
        }
    });
});
deleteAccBtn.addEventListener("click", openDeleteAccForm);
deleteAccPasswordInput.addEventListener("input", deleteAccReady);
deleteAccFormClose.addEventListener("click", closeDeleteAccForm);

SPA.servReq("/getProfile", {sessionId: SPA.sessionId}, true, function(data) {
    account.style.display = "";
    loaderEl.style.display = "none";
    email.innerText = data.email;
});