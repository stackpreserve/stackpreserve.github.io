function getUserIdParam() {
    var params = new URLSearchParams(window.location.search);
    return params.get("userId");
}

function setUserIdParam(userId) {
    var url = new URL(window.location.href);

    if (!userId) {
        url.searchParams.delete("userId");
    } else if (url.searchParams.get("userId") !== userId) {
        url.searchParams.set("userId", userId);
    }

    window.history.pushState({}, "", url);
}

function parseJSON(str) {
    try {
        return JSON.parse(str);
    } catch {
        return false;
    }
}

function getPlatform(ua) {
    if (/Windows NT/.test(ua)) return /Win64|WOW64|x64/.test(ua) ? "Windows 64-bit" : "Windows 32-bit";
    if (/Macintosh/.test(ua)) return "Mac";
    if (/Linux/.test(ua)) return "Linux";
    if (/Android/.test(ua)) return "Android";
    if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
    return "N/A";
}

function extractPartialUsers(users, timeFormat) {
    var extracted = [];
    for (let u of users) {
        var user = { ...u };
        delete user["Website"];
        delete user["user"];
        if (timeFormat === "24h") {
            var prevTime = user["Date added"].split(",")[2].slice(1);
            user["Date added"] = user["Date added"].replace(prevTime, to24h(prevTime));
        }
        extracted.push(user);
    }
    return extracted;
}

function extractFullUser(u, timeFormat) {
    var user = { ...u };
    var userData = parseJSON(user["user"]);
    user["Platform"] = getPlatform(userData.userAgent);
    user["User agent"] = userData.userAgent || "N/A";
    user["Language"] = userData.language || "N/A";
    user["Languages"] = userData.languages || "N/A";
    user["Hardware concurrency"] = userData.hardwareConcurrency || "N/A";
    user["Device memory"] = userData.deviceMemory || "N/A";
    user["Cookies enabled"] = userData.cookieEnabled || "N/A";
    user["Date added"] = user["Date added"]
    if (timeFormat === "24h") {
        var prevTime = user["Date added"].split(",")[2].slice(1);
        user["Date added"] = user["Date added"].replace(prevTime, to24h(prevTime));
    }
    delete user["user"];
    return user;
}

function showUserLists() {
    var userLists = document.querySelector(".user-lists");
    var userListsInner = document.querySelector(".user-lists__inner");
    var userListsLoaderEl = document.querySelector(".user-lists__loader-list-el");
    var userListsLoader = new DynaList(userListsLoaderEl, "No users found", function() {}); 
    var userListOrder = ["User ID", "Date added", "IP", "Country", "Recordings"];
    var timeFormat;
    userLists.style.display = "";

    SPA.servReq("/getWebsiteDomains", {sessionId: SPA.sessionId}, false, function(domainsData) {
        var usersExist = false;
        for (let website of domainsData.websites) {
            usersExist = true;

            let websiteTitle = document.createElement("h3");
            let multiListEl = document.createElement("div");
            let users = [];

            multiListEl.classList.add("multi-list");
            multiListEl.classList.add("user-lists__multi-list-el");
            websiteTitle.classList.add("user-lists__website-title");
            websiteTitle.innerText = website;
            userListsInner.appendChild(websiteTitle);
            userListsInner.appendChild(multiListEl);

            let multiList = new MultiList(multiListEl, "No users found", async function(user) {
                globalThis.clickedUser = users.find(item => item["User ID"] === user["User ID"]);
                var chosenUserId = getUserIdParam();
                if (!chosenUserId || chosenUserId !== globalThis.clickedUser["User ID"]) {
                    setUserIdParam(globalThis.clickedUser["User ID"]);
                    await refreshPage();
                }
            });
            SPA.servReq("/getProfile", {sessionId: SPA.sessionId}, true, function(profile) {
                timeFormat = profile.timeFormat;
                SPA.servReq("/getUsers", {sessionId: SPA.sessionId, page: 1, website: website}, false, function(firstPage) {

                    users = [...users, ...firstPage.users];
                    firstPage.users = extractPartialUsers(firstPage.users, timeFormat);

                    multiList.addData(firstPage.users, firstPage.totalUsers, firstPage.pageSize, function(pageNum) {
                        return new Promise((resolve) => {
                            SPA.servReq("/getUsers", {sessionId: SPA.sessionId, page: pageNum, website: website}, false, function(newPage) {

                                users = [...users, ...newPage.users];
                                newPage.users = extractPartialUsers(newPage.users, timeFormat);

                                resolve(newPage.users);
                            });
                        });
                    }, userListOrder);
                });
            });
        }
        if (usersExist) {
            userListsInner.style.display = "";
            userListsLoaderEl.style.display = "none";
        } else {
            userListsLoader.addData([]);
        }
    });
}

function showUserDetails() {
    var chosenUserId = getUserIdParam();
    var userDetails = document.querySelector(".user-details");
    var userIdTitle = document.querySelector(".user-details__id");
    var backToListBtns = document.querySelectorAll(".back-to-list");
    var detailListEl = document.querySelector(".user-details__detail-list-el");
    var userId;
    var timeFormat;
    var detailList = new DetailList(detailListEl);

    function displayUser(u, unpack) {
        if (unpack) {
            var user = extractFullUser({ ...u }, timeFormat);
        } else {
            var user = u;
        }
        userId = user["User ID"];
        delete user["User ID"];
        userIdTitle.innerText = `User ${userId}`;
        detailList.addData(user);
    }

    backToListBtns.forEach(backToListBtn => {
        backToListBtn.addEventListener("click", async function() {
            setUserIdParam();
            await refreshPage();
        });
    });

    userDetails.style.display = "";

    if (
        !globalThis.clickedUser ||
        !globalThis.clickedUser.hasOwnProperty("User ID") ||
        globalThis.clickedUser["User ID"] !== chosenUserId
    ) {
        SPA.servReq("/getProfile", {sessionId: SPA.sessionId}, true, function(profile) {
            timeFormat = profile.timeFormat;
            SPA.servReq("/getUser", {sessionId: SPA.sessionId, userId: chosenUserId}, true, function(data) {
                if (!data.error) {
                    displayUser(data.user, true);
                } else {
                    userDetails.style.display = "none";
                    showUserNotFound();
                }
            });
        });
    } else {
        displayUser(globalThis.clickedUser, false);
    }
}

function showUserNotFound() {
    var userNotFound = document.querySelector(".user-not-found");
    userNotFound.style.display = "";
}

if (getUserIdParam()) {
    showUserDetails();
} else {
    showUserLists();
}

async function prepLeavePage() {
    prepLeavePage = null;
}