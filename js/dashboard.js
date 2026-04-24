var authRedirect = location.origin + "/login/";
var homeRedirect = location.origin + "/";

alert("dashboard", SPA.sessionId);
if (!SPA.sessionId) {
    location.href = authRedirect;
}

var menuLoaded = true;
var mobileMaxWidth = 760;
var mobileChanges = [];
var desktopChanges = [];
var platform = "desktop";
var page = document.querySelector(".page");
var lastPath = null;
var lastHTML = null;
var confirmationMessage = document.querySelector(".confirmation-message");
var confirmationMessageIcon = document.querySelector(".confirmation-message__icon");
var confirmationMessageText = document.querySelector(".confirmation-message__text");
var confirmationMessageOpen = false;
var confirmationMessageExpire = 0;
var dashboardTitles = {
    "/dashboard/home/": "Home",
    "/dashboard/recordings/": "Recordings",
    "/dashboard/users/": "Users",
    "/dashboard/websites/": "Websites",
    "/dashboard/settings/": "Settings",
    "/dashboard/settings/account/": "Account",
    "/dashboard/settings/time-format/": "Time format",
    "/dashboard/settings/legal/": "Legal"
}
var searchSuggestions = [
    {title: "Home", url: "/dashboard/home/"},
    {title: "Recordings", url: "/dashboard/recordings/"},
    {title: "Users", url: "/dashboard/users/"},
    {title: "Websites", url: "/dashboard/websites/"},
    {title: "Settings", url: "/dashboard/settings/"},
    {title: "Settings > Account", url: "/dashboard/settings/account/"},
    {title: "Settings > Time format", url: "/dashboard/settings/time-format/"},
    {title: "Settings > Legal", url: "/dashboard/settings/legal/"}
];
var cover = new class {
    constructor() {
        this.element = document.querySelector(".cover");
        this.onClick = function() {};
    }

    addOnClick(func) {
        this.element.removeEventListener("click", this.onClick);
        this.onClick = func;
        this.element.addEventListener("click", this.onClick);
    }
};

setInterval(function() {
    if (confirmationMessageOpen) {
        if (Date.now() > confirmationMessageExpire) {
            confirmationMessageOpen = false;
            confirmationMessage.style.animationName = "confirmationMessageClose";
        }
    }
}, 0);

function checkRes() {
    if (window.innerWidth > mobileMaxWidth && platform == "mobile") {
        platform = "desktop";
        for (let change of desktopChanges) {
            change();
        }
    } else if (window.innerWidth <= mobileMaxWidth && platform == "desktop") {
        platform = "mobile";
        for (let change of mobileChanges) {
            change();
        }
    }
}

function cursorHover(cursor, rect) {
    if (cursor.x > rect.x && cursor.x < rect.x + rect.width && cursor.y > rect.y && cursor.y < rect.y + rect.height) {
        return true;
    }
    return false;
}

function hiddenElRect(el) {
    var displayState = el.style.display;
    el.style.display = "";
    var rect = el.getBoundingClientRect();
    el.style.display = displayState;
    return rect;
}

function openConfirmationMessage(status, message) {
    if (status) {
        confirmationMessage.style.backgroundColor = "#8ea638";
        confirmationMessageIcon.src = "assets/success.webp";
    } else {
        confirmationMessage.style.backgroundColor = "#e36a62";
        confirmationMessageIcon.src = "assets/error.webp";
    }

    confirmationMessageText.innerText = message;
    confirmationMessage.style.animationName = "confirmationMessageOpen";
    confirmationMessageExpire = Date.now() + 3000;
    confirmationMessageOpen = true;

}

function to24h(timeStr) {
    var match = timeStr.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
    if (!match) {
        return timeStr;
    }

    let [_, hours, minutes, period] = match;
    hours = parseInt(hours, 10);
    minutes = minutes || "00";
    period = period.toUpperCase();

    if (period === "AM") {
        if (hours === 12) hours = 0;
    } else {
        if (hours !== 12) hours += 12;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
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

var DynaList = class {
    constructor(element, notFound, itemClick) {
        this.element = element;
        this.notFound = notFound;
        this.itemClick = itemClick;
        this.items = [];
        this.clearData();
    }

    addData(data, order) {
        if (data.length < 1) {
            this.noItems.style.display = ""
            this.listLoader.style.display = "none";
            return;
        }

        if (!order) {
            order = Object.keys(data[0]);
        }

        this.items = data;
        this.noItemsCont.style.display = "none";
        this.innerListCont.style.display = "";
        this.results.style.display = "";
        this.results.innerText = `Results: ${data.length}`;
        var firstColumn = document.createElement("div");
        var rowNames = order;
        var rowWidthRecords = {};

        for (let rowName of rowNames) {
            var firstColumnRow = document.createElement("p");
            firstColumnRow.innerText = rowName;
            firstColumn.appendChild(firstColumnRow);
        }
        this.innerList.appendChild(firstColumn);

        for (let item of data) {
            var column = document.createElement("div");
            for (let key of order) {
                var value = item[key];
                var row = document.createElement("p");
                row.innerText = value;
                column.appendChild(row);
            }
            this.innerList.appendChild(column);

            column.addEventListener("click", () => {
                this.itemClick(item);
            });
        }

        requestAnimationFrame(() => {

            this.innerList.querySelectorAll("div").forEach(div => {
                div.querySelectorAll("p").forEach((p, index) => {
                    var pRect = p.getBoundingClientRect();
                    if (rowWidthRecords.hasOwnProperty(index)) {
                        if (pRect.width > rowWidthRecords[index]) {
                            rowWidthRecords[index] = pRect.width;
                        }
                    } else {
                        rowWidthRecords[index] = pRect.width;
                    }
                });
            });

            this.innerList.querySelectorAll("div").forEach(div => {
                div.querySelectorAll("p").forEach((p, index) => {
                    p.style.width = rowWidthRecords[index] + "px";
                    p.style.minWidth = rowWidthRecords[index] + "px";
                });
            });

        });
    }

    clearData() {
        this.element.innerHTML = `
        <div style="display: none" class="dyna-list__list-cont">
            <div class="dyna-list__list"></div>
        </div>
        <p style="display: none" class="dyna-list__results"></p>
        <div class="dyna-list__empty">
            <p style="display: none" class="dyna-list__empty-text"></p>
            <div class="loader dyna-list__loader"></div>
        </div>
        `;
        this.innerListCont = this.element.querySelector(".dyna-list__list-cont");
        this.results = this.element.querySelector(".dyna-list__results");
        this.innerList = this.element.querySelector(".dyna-list__list");
        this.noItemsCont = this.element.querySelector(".dyna-list__empty");
        this.noItems = this.element.querySelector(".dyna-list__empty-text");
        this.listLoader = this.element.querySelector(".dyna-list__loader");

        this.noItems.innerText = this.notFound;
    }
}

var DetailList = class {
    constructor(element) {
        this.element = element;
        this.clearData();
    }

    addData(data) {
        Object.entries(data).forEach(([key, value]) => {
            var prop = document.createElement("div");
            var attrName = document.createElement("p");
            var attrValue = document.createElement("p");

            attrName.innerText = key;
            attrValue.innerText = value;
            prop.appendChild(attrName);
            prop.appendChild(attrValue);

            this.innerList.appendChild(prop);
        });

        this.listLoaderCont.style.display = "none";
        this.innerList.style.display = "";
    }

    clearData() {
        this.element.innerHTML = `
        <div style="display: none" class="detail-list__list"></div>
        <div class="detail-list__loader-cont">
            <div class="loader detail-list__loader"></div>
        </div>
        `;
        this.listLoaderCont = this.element.querySelector(".detail-list__loader-cont");
        this.innerList = this.element.querySelector(".detail-list__list");
    }
}

var MultiList = class {
    constructor(element, notFound, itemClick) {
        this.element = element;
        this.notFound = notFound;
        this.itemClick = itemClick;
        this.pages = {};
        this.heightRec = 0;
        this.pageNum = 1;
        this.nextItemEl = false;
        this.prevItemEl = false;
        this.itemClicked = false;
        this.clickOnLoad = false;
        this.clearData();
    }

    async addData(page, totalCount, pageSize, getPage, order) {
        if (page.length < 1) {
            this.noItems.style.display = ""
            this.listLoader.style.display = "none";
            return;
        }

        if (!order) {
            order = Object.keys(page[0]);
        }

        this.pages = {};
        this.pages[1] = page;
        this.noItemsCont.style.display = "none";
        this.innerListCont.style.display = "";
        
        if (totalCount > pageSize) {
            this.nav.style.display = "";
            this.results.classList.remove("multi-list__results--single-page");
        } else {
            this.nav.style.display = "";
            this.navCenter.style.display = "none";
            this.pageInput.style.display = "none";
        }

        var updatePage = async () => {

            this.innerListCont.style.display = "flex";
            this.innerList.style.display = "none";
            this.newPageLoader.style.display = "";

            if (this.pages.hasOwnProperty(this.pageNum)) {
                page = this.pages[this.pageNum];
            } else {
                this.pages[this.pageNum] = await getPage(this.pageNum);
                page = this.pages[this.pageNum];
            }

            this.results.innerText = `Results: ${totalCount}`;
            this.totalPages = Math.ceil(totalCount/pageSize);
            this.curPageEl.innerText = `${this.pageNum} / ${this.totalPages}`;
            this.pageInput.placeholder = `Goto page 1-${this.totalPages}`;
            this.pageInput.min = 1;
            this.pageInput.max = this.totalPages;

            this.innerList.innerHTML = "";
            var firstColumn = document.createElement("div");
            var rowNames = order;
            var rowWidthRecords = {};

            for (let rowName of rowNames) {
                var firstColumnRow = document.createElement("p");
                firstColumnRow.innerText = rowName;
                firstColumn.appendChild(firstColumnRow);
            }
            this.innerList.appendChild(firstColumn);

            for (let item of page) {
                let column = document.createElement("div");

                for (let key of order) {
                    var value = item[key];
                    var row = document.createElement("p");
                    row.innerText = value;
                    column.appendChild(row);
                }
                this.innerList.appendChild(column);

                column.addEventListener("click", () => {
                    var prevFunc = () => {this.prevItem()}
                    var nextFunc = () => {this.nextItem()}
                    this.itemClick(item, prevFunc, nextFunc);
                    this.itemClicked = true;
                    this.nextItemEl = column.nextElementSibling || false;
                    if (!column.previousElementSibling.previousElementSibling) {
                        this.prevItemEl = false;
                    } else {
                        this.prevItemEl = column.previousElementSibling;
                    }
                });
            }

            if (this.clickOnLoad == "first") {
                this.innerList.querySelector("div:not(:first-child)").click();
            } else if (this.clickOnLoad == "last") {
                this.innerList.querySelector("div:last-child").click();
            }
            this.clickOnLoad = false;

            requestAnimationFrame(() => {

                this.innerList.querySelectorAll("div").forEach(div => {
                    div.querySelectorAll("p").forEach((p, index) => {
                        var pRect = p.getBoundingClientRect();
                        if (rowWidthRecords.hasOwnProperty(index)) {
                            if (pRect.width > rowWidthRecords[index]) {
                                rowWidthRecords[index] = pRect.width;
                            }
                        } else {
                            rowWidthRecords[index] = pRect.width;
                        }
                    });
                });

                this.innerList.querySelectorAll("div").forEach(div => {
                    div.querySelectorAll("p").forEach((p, index) => {
                        p.style.width = rowWidthRecords[index] + "px";
                        p.style.minWidth = rowWidthRecords[index] + "px";
                    });
                });

            });

            this.innerListCont.style.display = "block";
            this.innerList.style.display = "";
            this.newPageLoader.style.display = "none";

            var height = this.innerListCont.getBoundingClientRect().height;

            if (height > this.heightRec) {
                this.heightRec = height;
            }

            this.innerListCont.style.minHeight = this.heightRec + "px";
        }

        updatePage();

        this.prevPageBtn.addEventListener("click", () => {
            if (this.pageNum > 1) {
                this.pageNum--;
                updatePage();
            }
        });
        this.nextPageBtn.addEventListener("click", () => {
            if (this.pageNum < this.totalPages) {
                this.pageNum++;
                updatePage();
            }
        });
        this.pageInput.addEventListener("keyup", (e) => {
            if (e.keyCode === 13) {
                var value = parseInt(this.pageInput.value);
                if (value >= 1 && value <= this.totalPages && value !== this.pageNum) {
                    this.pageNum = value;
                    updatePage();
                }
            }
        });
    }

    nextItem() {
        if (this.nextItemEl) {
            this.nextItemEl.click();
        } else if (this.itemClicked && this.pageNum < this.totalPages) {
            this.clickOnLoad = "first";
            this.nextPageBtn.click();
        }
    }

    prevItem() {
        if (this.prevItemEl) {
            this.prevItemEl.click();
        } else if (this.itemClicked && this.pageNum > 1) {
            this.clickOnLoad = "last";
            this.prevPageBtn.click();
        }
    }

    clearData() {
        this.element.innerHTML = `
        <div style="display: none" class="multi-list__list-cont">
            <div class="multi-list__list"></div>
            <div style="display: none" class="multi-list__new-page-loader loader"></div>
        </div>
        <div class="multi-list__empty">
            <p style="display: none" class="multi-list__empty-text"></p>
            <div class="loader multi-list__loader"></div>
        </div>
        <div style="display: none" class="multi-list__nav">
            <p class="multi-list__results multi-list__results--single-page"></p>
            <div class="multi-list__nav-center">
                <div class="icon multi-list__prev"><img src="assets/prev.webp"></div>
                <p class="multi-list__cur"></p>
                <div class="icon multi-list__next"><img src="assets/next.webp"></div>
            </div>
            <input class="text-field multi-list__input" min="1" max="7" type="number" placeholder="Select page 1-7">
        <div>
        `;
        this.innerListCont = this.element.querySelector(".multi-list__list-cont");
        this.innerList = this.element.querySelector(".multi-list__list");
        this.newPageLoader = this.element.querySelector(".multi-list__new-page-loader");
        this.noItemsCont = this.element.querySelector(".multi-list__empty");
        this.noItems = this.element.querySelector(".multi-list__empty-text");
        this.listLoader = this.element.querySelector(".multi-list__loader");
        this.prevPageBtn = this.element.querySelector(".multi-list__prev");
        this.nextPageBtn = this.element.querySelector(".multi-list__next");
        this.curPageEl = this.element.querySelector(".multi-list__cur");
        this.results = this.element.querySelector(".multi-list__results");
        this.pageInput = this.element.querySelector(".multi-list__input");
        this.nav = this.element.querySelector(".multi-list__nav");
        this.navCenter = this.element.querySelector(".multi-list__nav-center");

        this.noItems.innerText = this.notFound;
    }
}

function updateMenu() {
    var menuLinks = document.querySelectorAll(".menu__item-list > li");
    for (let link of menuLinks) {
        var p = link.querySelector("p");
        var icon = link.querySelectorAll("img")[0];
        var iconSelected = link.querySelectorAll("img")[1];
        var hrefAttr = link.getAttribute("href");
        if (hrefAttr === location.pathname) {
            p.style.color = "#11aaa2";
            iconSelected.style.display = "";
            icon.style.display = "none";
            //document.title = `${p.innerText} - ${SPA.websiteName}`;
        } else {
            p.style.color = "";
            iconSelected.style.display = "none";
            icon.style.display = "";
        }
    }
    /*if (location.pathname.startsWith("/dashboard/settings")) {
        settingsIcon.src = "assets/settings-selected.webp";
    }*/
    document.title = `${dashboardTitles[location.pathname]} - Dashboard - ${SPA.websiteName}`;
}

var refreshPage = async function() {

    if (typeof prepLeavePage === "function") {
        await prepLeavePage();
    }

    var path = location.origin+SPA.pages[location.pathname][0];
    if (path === lastPath) {
        var html = lastHTML;
    } else {
        lastPath = path;
        var res = await fetch(path, {cache: "force-cache"});
        var html = await res.text();
        lastHTML = html;
    }

    page.innerHTML = html;
    var scripts = page.querySelectorAll("script");

    scripts.forEach(script => {
        if (script.src) {
            var scriptEl = document.createElement("script");
            scriptEl.src = script.src;
            page.appendChild(scriptEl);
            script.remove();
        } else {
            eval(script.textContent);
        }
    });

    updateMenu();
}

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

function handleDashboardLinks() {
    var menu = document.querySelector(".menu");
    var menuClose = document.querySelector(".menu__close");
    var menuBtn = document.querySelector(".nav-bar__menu");
    var settingsBtn = document.querySelector(".nav-bar__settings");
    //var settingsIcon = document.querySelector(".nav-bar__settings-icon");
    var menuLinks = document.querySelectorAll(".menu__item-list > li");
    //var issuesContact = document.querySelector(".menu__issues");

    /*function issuesAdjustMobile() {
        issuesContact.style.marginTop = parseFloat(getComputedStyle(issuesContact).marginTop)-20+"px";
    }

    function issuesAdjustDesktop() {
        issuesContact.style.marginTop = parseFloat(getComputedStyle(issuesContact).marginTop)+20+"px";
    }*/

    function closeMobileMenu() {
        var menuX = parseFloat(getComputedStyle(document.querySelector(".menu")).left);
        if (menuX >= 0) {
            menu.style.animationName = "menuClose";
            cover.element.style.display = "none";
        }
    }

    function openMobileMenu() {
        menu.style.animationName = "menuOpen";
        cover.element.style.display = "";
        cover.addOnClick(closeMobileMenu);
    }

    menuLinks.forEach(function(link) {
        link.addEventListener("click", async function() {
            var hrefAttr = this.getAttribute("href");
            if (hrefAttr !== location.pathname) {
                history.pushState(null, "", hrefAttr);
                await refreshPage();
                closeMobileMenu();
            }
        });
    });

    settingsBtn.addEventListener("click", async function() {
        var hrefAttr = this.getAttribute("href");
        if (hrefAttr !== location.pathname) {
            history.pushState(null, "", hrefAttr);
            await refreshPage();
        }
    });

    menuBtn.addEventListener("click", openMobileMenu);
    menuClose.addEventListener("click", closeMobileMenu);
    desktopChanges.push(closeMobileMenu);
    /*desktopChanges.push(issuesAdjustDesktop);
    mobileChanges.push(issuesAdjustMobile);*/
    updateMenu();

    window.addEventListener("popstate", async function() {
        await refreshPage();
    });

}

function handleCommunityBtn() {

    var communityBtn = document.querySelector(".nav-bar__community");
    var communityMenu = document.querySelector(".community-menu");
    var communityMenuOpen = false;

    function positionCommunityMenu() {
        var communityBtnRect = communityBtn.getBoundingClientRect();
        var communityMenuRect = hiddenElRect(communityMenu);
        communityMenu.style.left = communityBtnRect.left - communityMenuRect.width + communityBtnRect.width + "px";
        communityMenu.style.top = communityBtnRect.top + communityBtnRect.height + 5 + "px";
    }

    function closeCommunityMenu() {
        communityMenuOpen = false;
        communityMenu.style.display = "none";
        communityBtn.classList.remove("selected-icon");
    }

    async function openCommunityMenu() {
        communityMenuOpen = true;
        positionCommunityMenu()
        communityMenu.style.display = "";
        communityBtn.classList.add("selected-icon");
    }

    window.addEventListener("resize", function() {
        if (communityMenu.style.display != "none") {
            positionCommunityMenu();
        }
    });
    window.addEventListener("mousedown", function(cursor) {
        var communityBtnRect = communityBtn.getBoundingClientRect();
        var communityMenuRect = hiddenElRect(communityMenu);
        if (!cursorHover(cursor, communityBtnRect) && !cursorHover(cursor, communityMenuRect)) {
            closeCommunityMenu();
        }
    });

    communityBtn.addEventListener("click", function() {
        if (communityMenu.style.display == "none") {
            openCommunityMenu();
        } else {
            closeCommunityMenu();
        }
    });

    setInterval(function() {
        if (communityMenuOpen) {
            positionCommunityMenu();
        }
    }, 100);

}

function handleProfileBtn() {

    var profileBtn = document.querySelector(".nav-bar__profile");
    var profileMenu = document.querySelector(".profile-menu");
    var profileSignOutBtn = document.querySelector(".profile-menu__signout");
    var confirmSignOutCont = document.querySelector(".confirm-signout");
    var confirmSignOutBtn = document.querySelector(".confirm-signout__confirm");
    var cancelSignOutBtn = document.querySelector(".confirm-signout__cancel");
    var profileEmail = document.querySelector(".profile-menu__email");
    var profileMenuOpen = false;

    function positionProfileMenu() {
        var profileBtnRect = profileBtn.getBoundingClientRect();
        var profileMenuRect = hiddenElRect(profileMenu);
        profileMenu.style.left = profileBtnRect.left - profileMenuRect.width + profileBtnRect.width + "px";
        profileMenu.style.top = profileBtnRect.top + profileBtnRect.height + 5 + "px";
    }

    function closeProfileMenu() {
        profileMenuOpen = false;
        profileMenu.style.display = "none";
        profileBtn.classList.remove("selected-icon");
    }

    function closeConfirmSignout() {
        confirmSignOutCont.style.display = "none";
        cover.element.style.display = "none";
    }

    async function openProfileMenu() {
        profileMenuOpen = true;
        positionProfileMenu()
        profileMenu.style.display = "";
        profileBtn.classList.add("selected-icon");
        SPA.servReq("/getProfile", {sessionId: SPA.sessionId}, true, function(data) {
            profileEmail.innerText = data.email;
            positionProfileMenu();
        });
    }

    window.addEventListener("resize", function() {
        if (profileMenu.style.display != "none") {
            positionProfileMenu();
        }
    });
    window.addEventListener("mousedown", function(cursor) {
        var profileBtnRect = profileBtn.getBoundingClientRect();
        var profileMenuRect = hiddenElRect(profileMenu);
        if (!cursorHover(cursor, profileBtnRect) && !cursorHover(cursor, profileMenuRect)) {
            closeProfileMenu();
        }
    });
    profileSignOutBtn.addEventListener("click", function() {
        closeProfileMenu();
        cover.element.style.display = "";
        cover.addOnClick(closeConfirmSignout);
        confirmSignOutCont.style.display = "";
    });

    confirmSignOutBtn.addEventListener("click", function() {
        SPA.removeCookie("sessionId");
        location.href = homeRedirect;
    });
    
    cancelSignOutBtn.addEventListener("click", closeConfirmSignout);

    profileBtn.addEventListener("click", function() {
        if (profileMenu.style.display == "none") {
            openProfileMenu();
        } else {
            closeProfileMenu();
        }
    });

    setInterval(function() {
        if (profileMenuOpen) {
            positionProfileMenu();
        }
    }, 100);

}

function handleDashboardSearch() {

    var searchCont = document.querySelector(".nav-bar__search-cont");
    var searchInput = document.querySelector(".nav-bar__search-input");
    var mobileSearchBtn = document.querySelector(".nav-bar__search");
    var mobileSearch = document.querySelector(".mobile-search");
    var mobileSearchClose = document.querySelector(".mobile-search__close");
    var mobileSearchCont = document.querySelector(".mobile-search__search-cont");
    var mobileSearchInput = document.querySelector(".mobile-search__search-input");
    var searchSuggestionsEl = document.querySelector(".search-suggestions");
    var lastSearchCont;
    var searchSelected = 0;

    function closeMobileSearch() {
        if (mobileSearch.style.display === "") {
            mobileSearch.style.display = "none";
            mobileSearchInput.value = "";
            searchSuggestionsEl.style.display = "none";
        }
    }

    function closeSearch() {
        searchInput.value = "";
        searchSuggestionsEl.style.display = "none";
    }

    function resizeSearchSuggestions() {
        if (lastSearchCont) {
            var contRect = lastSearchCont.getBoundingClientRect();
            searchSuggestionsEl.style.left = contRect.left + "px";
            searchSuggestionsEl.style.top = contRect.top + contRect.height + 5 + "px";
            searchSuggestionsEl.style.width = contRect.width - 10 + "px";
        }
    }

    function genSearchSuggestions(cont, value) {
        lastSearchCont = cont;
        if (value !== "") {
            searchSelected = 0;
            var remaining = [...searchSuggestions];
            var results = [];
            for (let i = 0; i < remaining.length; i++) {
                let searchSuggestion = remaining[i];
                if (searchSuggestion) {
                    if (searchSuggestion.title.toLocaleLowerCase().startsWith(value.toLocaleLowerCase())) {
                        results.push(searchSuggestion)
                        remaining[i] = false;
                    }
                }
            }
            for (let i = 0; i < remaining.length; i++) {
                let searchSuggestion = remaining[i];
                if (searchSuggestion) {
                    if (searchSuggestion.title.toLocaleLowerCase().includes(value.toLocaleLowerCase())) {
                        results.push(searchSuggestion)
                        remaining[i] = false;
                    }
                }
            }

            if (results.length > 0) {
                searchSuggestionsEl.style.display = "";

                searchSuggestionsEl.innerHTML = "";
                for (let searchSuggestion of results) {
                    let searchSuggestionEl = document.createElement("p");
                    searchSuggestionEl.innerText = searchSuggestion.title;
                    searchSuggestionEl.addEventListener("click", async function() {
                        if (searchSuggestion.url !== location.pathname) {
                            history.pushState(null, "", searchSuggestion.url);
                            await refreshPage();
                        }
                        closeSearch();
                        closeMobileSearch();
                    });
                    searchSuggestionsEl.appendChild(searchSuggestionEl);
                }

                searchSuggestionsEl.querySelectorAll("p")[searchSelected].classList.add("selected");
            }
        } else {
            searchSuggestionsEl.style.display = "none";
        }
    }

    window.addEventListener("mousedown", function(cursor) {
        var mobileSearchRect = hiddenElRect(mobileSearch);
        if (lastSearchCont) {
            var searchSuggestionsElRect = searchSuggestionsEl.getBoundingClientRect();
            var lastSearchContRect = lastSearchCont.getBoundingClientRect();
            if (!cursorHover(cursor, searchSuggestionsElRect) && !cursorHover(cursor, lastSearchContRect)) {
                searchSuggestionsEl.style.display = "none"
            }
        }
        if (!cursorHover(cursor, mobileSearchRect)) {
            closeMobileSearch();
        }
        
    });
    mobileSearchBtn.addEventListener("click", function() {
        mobileSearch.style.display = "";
        mobileSearchInput.focus();
    });
    window.addEventListener("resize", function() {
        if (searchSuggestionsEl.style.display != "none") {
            searchSuggestionsEl.style.width = lastSearchCont.getBoundingClientRect().width - 10 + "px";
        }
    });
    searchInput.addEventListener("click", function() { genSearchSuggestions(searchCont, searchInput.value); });
    mobileSearchInput.addEventListener("click", function() { genSearchSuggestions(mobileSearchCont, mobileSearchInput.value); });
    searchInput.addEventListener("keydown", function(e) {
        if (e.keyCode === 13) {
            if (searchSuggestionsEl.querySelector(".selected")) {
                searchSuggestionsEl.querySelector(".selected").click();
            }
            searchInput.blur();
        }
        if (e.keyCode === 38) {
            e.preventDefault();
            if (searchSuggestionsEl.querySelectorAll("p")[searchSelected-1]) {
                searchSelected -= 1;
                searchSuggestionsEl.querySelectorAll("p")[searchSelected+1].classList.remove("selected");
                searchSuggestionsEl.querySelectorAll("p")[searchSelected].classList.add("selected");
            }
        }
        if (e.keyCode === 40) {
            e.preventDefault();
            if (searchSuggestionsEl.querySelectorAll("p")[searchSelected+1]) {
                searchSelected += 1;
                searchSuggestionsEl.querySelectorAll("p")[searchSelected-1].classList.remove("selected");
                searchSuggestionsEl.querySelectorAll("p")[searchSelected].classList.add("selected");
            }
        }
    });
    mobileSearchClose.addEventListener("click", closeMobileSearch);
    searchInput.addEventListener("input", function(e) { genSearchSuggestions(searchCont, e.target.value); });
    mobileSearchInput.addEventListener("input", function(e) { genSearchSuggestions(mobileSearchCont, e.target.value); });
    mobileChanges.push(closeSearch);
    desktopChanges.push(closeMobileSearch);

    setInterval(resizeSearchSuggestions, 100);

}

function handleFirstLogin() {
    var firstLoginMessage = document.querySelector(".first-login-message");
    var firstLoginCookie = SPA.getCookie("firstLogin");
    
    if (firstLoginCookie) {
        setTimeout(function() {
            firstLoginMessage.style.animationName = "openFirstLoginMessage";
        }, 1500);

        firstLoginMessage.addEventListener("click", function() {
            firstLoginMessage.style.display = "none";
        });

        SPA.removeCookie("firstLogin");
    }
}

handleDashboardLinks();
handleCommunityBtn();
handleProfileBtn();
handleDashboardSearch();
handleFirstLogin();
checkRes();

window.addEventListener("resize", checkRes);