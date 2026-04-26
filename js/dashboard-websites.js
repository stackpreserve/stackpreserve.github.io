function getWebsiteParam() {
    var params = new URLSearchParams(window.location.search);
    return params.get("website");
}

function setWebsiteParam(domain) {
    var url = new URL(window.location.href);

    if (!domain) {
        url.searchParams.delete("website");
    } else if (url.searchParams.get("website") !== domain) {
        url.searchParams.set("website", domain);
    }

    window.history.pushState({}, "", url);
}

function validDomain(domain) {
    var maxLength = 63;
    var regex = /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,63}$/;

    if (domain.length > maxLength) {
        return `Domain too long (max ${maxLength} characters allowed).`;
    }

    if (!regex.test(domain)) {
        return "Invalid domain";
    }

    return "valid";
}

function showWebsiteNotFound() {
    var websiteNotFound = document.querySelector(".website-not-found");
    websiteNotFound.style.display = "";
}

function showWebsiteDetails() {

    var chosenDomain = getWebsiteParam();
    var websiteDetails = document.querySelector(".website-details");
    var domainTitle = document.querySelector(".website-details__domain");
    var backToListBtns = document.querySelectorAll(".back-to-list");
    var detailListEl = document.querySelector(".website-details__detail-list-el");
    var modBtnsCont = document.querySelector(".website-details__modification");
    var editDomainBtn = document.querySelector(".website-details__edit");
    var editDomainForm = document.querySelector(".website-details__edit-form");
    var editDomainFormClose = document.querySelector(".website-details__edit-close");
    var editDomainInput = document.querySelector(".website-details__edit-input");
    var editDomainError = document.querySelector(".website-details__edit-error");
    var editDomainSubmitBtn = document.querySelector(".website-details__edit-submit");
    var deleteWebsiteBtn = document.querySelector(".website-details__delete");
    var deleteWebsiteForm = document.querySelector(".website-details__delete-form");
    var deleteWebsiteFormClose = document.querySelector(".website-details__delete-close");
    var deleteWebsiteInput = document.querySelector(".website-details__delete-input");
    var deleteWebsiteSubmitBtn = document.querySelector(".website-details__delete-submit");
    var domain;
    var detailList = new DetailList(detailListEl);

    function displayWebsite(website) {
        domain = website["Domain"];
        delete website["Domain"];
        domainTitle.innerText = domain;
        detailList.addData(website);
        modBtnsCont.style.display = "";
    }

    function closeEditDomainForm() {
        editDomainForm.style.display = "none";
        cover.element.style.display = "none";
    }

    function openEditDomainForm() {
        editDomainError.style.display = "none";
        editDomainSubmitBtn.disabled = false;
        editDomainInput.value = "";
        editDomainForm.style.display = "";
        cover.element.style.display = "";
        cover.addOnClick(closeEditDomainForm);
    }

    function closeDeleteWebsiteForm() {
        deleteWebsiteForm.style.display = "none";
        cover.element.style.display = "none";
    }

    function openDeleteWebsiteForm() {
        deleteWebsiteSubmitBtn.disabled = true;
        deleteWebsiteInput.value = "";
        deleteWebsiteForm.style.display = "";
        cover.element.style.display = "";
        cover.addOnClick(closeDeleteWebsiteForm);
    }

    function verifyDeletion() {
        if (deleteWebsiteInput.value === domain) {
            deleteWebsiteSubmitBtn.disabled = false;
        } else {
            deleteWebsiteSubmitBtn.disabled = true;
        }
    }

    backToListBtns.forEach(backToListBtn => {
        backToListBtn.addEventListener("click", async function() {
            setWebsiteParam();
            await refreshPage();
        });
    });

    websiteDetails.style.display = "";
    
    if (
        !globalThis.clickedWebsite ||
        !globalThis.clickedWebsite.hasOwnProperty("Domain") ||
        globalThis.clickedWebsite["Domain"] !== chosenDomain
    ) {
        SPA.servReq("/getProfile", {sessionId: SPA.sessionId}, true, function(profile) {
            SPA.servReq("/getWebsite", {sessionId: SPA.sessionId, domain: chosenDomain}, true, function(data) {
                if (profile.timeFormat === "24h") {
                    var prevTime = data.website["Date added"].split(",")[2].slice(1);
                    data.website["Date added"] = data.website["Date added"].replace(prevTime, to24h(prevTime));
                }
                if (!data.error) {
                    data.website["Domain"] = chosenDomain;
                    displayWebsite(data.website);
                } else {
                    websiteDetails.style.display = "none";
                    showWebsiteNotFound();
                }
            });
        });
    } else {
        displayWebsite(globalThis.clickedWebsite);
    }

    
    editDomainSubmitBtn.addEventListener("click", function() {
        editDomainSubmitBtn.disabled = true;

        function errorMsg(msg) {
            editDomainError.style.display = "";
            editDomainError.innerText = msg
            editDomainSubmitBtn.disabled = false;
        }

        if (editDomainInput.value === "") {
            errorMsg("You must enter a domain");
            return;
        }

        var domainCheck = validDomain(editDomainInput.value);
        if (domainCheck !== "valid") {
            errorMsg(domainCheck);
            return;
        }

        modBtnsCont.style.display = "";

        SPA.servReq("/editDomain", {
            sessionId: SPA.sessionId,
            domain: domain,
            newDomain: editDomainInput.value
        }, false, function(data) {
            if (data.success) {
                domain = editDomainInput.value;
                domainTitle.innerText = domain;
                setWebsiteParam(domain);
                closeEditDomainForm();
            } else if (data.error) {
                errorMsg(data.error);
            }
        });
    });

    deleteWebsiteSubmitBtn.addEventListener("click", function() {
        deleteWebsiteSubmitBtn.disabled = true;
        SPA.servReq("/deleteWebsite", {
            sessionId: SPA.sessionId,
            domain: domain,
        }, false, async function(data) {
            if (data.success) {
                setWebsiteParam();
                closeDeleteWebsiteForm();
                await refreshPage();
            }
            deleteWebsiteSubmitBtn.disabled = false;
        });
    });

    editDomainBtn.addEventListener("click", openEditDomainForm);
    editDomainFormClose.addEventListener("click", closeEditDomainForm);
    deleteWebsiteBtn.addEventListener("click", openDeleteWebsiteForm);
    deleteWebsiteFormClose.addEventListener("click", closeDeleteWebsiteForm);
    deleteWebsiteInput.addEventListener("input", verifyDeletion);

}

function showWebsiteList() {

    var websiteList = document.querySelector(".website-list");
    var dynaListEl = document.querySelector(".website-list__dyna-list-el");
    var addWebsiteForm = document.querySelector(".website-list__form");
    var addWebsiteFormClose = document.querySelector(".website-list__close");
    var addWebsiteBtn = document.querySelector(".website-list__add-website");
    var addWebsiteInput = document.querySelector(".website-list__input");
    var addWebsiteError = document.querySelector(".website-list__error");
    var addWebsiteCode = document.querySelector(".website-list__code-cont code");
    var addWebsiteCodeCopy = document.querySelector(".website-list__copy-code");
    var addWebsiteCodeCopyIcon = document.querySelector(".website-list__copy-code > img");
    var addWebsiteSubmitBtn = document.querySelector(".website-list__submit");
    var dynaListOrder = ["Domain", "Date added", "Recordings", "Views", "Countries visited"];
    var timeFormat;

    websiteList.style.display = "";

    var dynaList = new DynaList(dynaListEl, "No websites found", async function(website) {
        globalThis.clickedWebsite = website;
        var chosenDomain = getWebsiteParam();
        if (!chosenDomain || chosenDomain !== website["Domain"]) {
            setWebsiteParam(website["Domain"]);
            await refreshPage();
        }
    });

    dynaList.clearData();

    SPA.servReq("/getProfile", {sessionId: SPA.sessionId}, true, function(profile) {
        SPA.servReq("/getWebsites", {sessionId: SPA.sessionId}, false, function(data) {
            if (profile.timeFormat === "24h") {
                for (let website of data.websites) {
                    var prevTime = website["Date added"].split(",")[2].slice(1);
                    website["Date added"] = website["Date added"].replace(prevTime, to24h(prevTime));
                }
            }
            dynaList.addData(data.websites, dynaListOrder);
        });
    });

    function openWebsiteForm() {
        addWebsiteError.style.display = "none";
        addWebsiteSubmitBtn.disabled = false;
        addWebsiteInput.value = "";
        addWebsiteForm.style.display = "";
        cover.element.style.display = "";
        cover.addOnClick(closeWebsiteForm);
    }

    function closeWebsiteForm() {
        addWebsiteForm.style.display = "none";
        cover.element.style.display = "none";
    }

    addWebsiteBtn.addEventListener("click", openWebsiteForm);
    addWebsiteFormClose.addEventListener("click", closeWebsiteForm);

    addWebsiteCodeCopy.addEventListener("click", function() {
        navigator.clipboard.writeText(addWebsiteCode.innerText);
        addWebsiteCodeCopyIcon.src = "assets/check.webp";
        setTimeout(function() {
            addWebsiteCodeCopyIcon.src = "assets/copy.webp";
        }, 2000);
    });

    addWebsiteSubmitBtn.addEventListener("click", function() {

        addWebsiteSubmitBtn.disabled = true;

        function errorMsg(msg) {
            addWebsiteError.style.display = "";
            addWebsiteError.innerText = msg
            addWebsiteSubmitBtn.disabled = false;
        }

        if (addWebsiteInput.value === "") {
            errorMsg("You must enter a domain");
            return;
        }

        var domainCheck = validDomain(addWebsiteInput.value);
        if (domainCheck !== "valid") {
            errorMsg(domainCheck);
            return;
        }

        SPA.servReq("/addWebsite", {
            sessionId: SPA.sessionId,
            domain: addWebsiteInput.value
        }, false, async function(data) {
            if (data.success) {
                closeWebsiteForm();
                setWebsiteParam(addWebsiteInput.value)
                await refreshPage();
            } else if (data.error) {
                errorMsg(data.error);
            }
        });
    });

}

if (getWebsiteParam()) {
    showWebsiteDetails();
} else {
    showWebsiteList();
}

async function prepLeavePage() {
    prepLeavePage = null;
}