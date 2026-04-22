var loaderEl = document.querySelector(".loader-list-el");
var timeFormat = document.querySelector(".time-format");
var backToListBtn = document.querySelector(".title-cont__back-to-list");
var timeFormatInput = document.querySelector(".time-format__dropdown");
var submitBtn = document.querySelector(".time-format__submit");
var loader = new DynaList(loaderEl, "Couldn't load time format settings", function() {});
var currentTimeFormat;

backToListBtn.addEventListener("click", async function() {
    history.replaceState(null, "", "/dashboard/settings");
    await refreshPage();
});

timeFormatInput.addEventListener("input", function() {
    if (currentTimeFormat !== timeFormatInput.value) {
        submitBtn.disabled = false;
    } else {
        submitBtn.disabled = true;
    }
});

submitBtn.addEventListener("click", function() {
    var timeFormatInputValue = timeFormatInput.value
    submitBtn.disabled = true;
    SPA.clearReq("/getProfile");
    SPA.servReq("/changeTimeFormat", {
        sessionId: SPA.sessionId,
        timeFormat: timeFormatInputValue
    }, false, function() {
        openConfirmationMessage(true, "Time format changed");
        currentTimeFormat = timeFormatInputValue;
    });
});

SPA.servReq("/getProfile", {sessionId: SPA.sessionId}, true, function(data) {
    timeFormatInput.value = data.timeFormat;
    timeFormat.style.display = "";
    loaderEl.style.display = "none";
    submitBtn.disabled = true;
    currentTimeFormat = data.timeFormat;
});