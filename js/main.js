var SPA = new class {
    constructor() {
        this.version = 1
        this.server = "https://glorious-disgrace-unroasted.ngrok-free.dev";
        this.servReqData = {};
        this.websiteName = "StackPreserve";
        this.sessionId = this.getCookie("sessionId");
        this.confirmationMessage = document.createElement("div");
        this.confirmationMessageStyles = document.createElement("style");
        this.confirmationMessage.classList.add("confirmation-message");
        this.confirmationMessageStyles.textContent = `
            .confirmation-message {
                width: fit-content;
                padding: 10px;
                position: fixed;
                left: 50%;
                top: 0;
                transform: translate(-50%, -120%);
                display: flex;
                align-items: center;
                border-radius: 5px;
                animation-duration: 0.5s;
                animation-fill-mode: forwards;
                z-index: 2;
            }

            .confirmation-message__text {
                color: #ffffff;
                margin: 0px;
                font-size: 14px;
            }

            .confirmation-message__icon {
                width: 14px;
                margin-right: 5px;
            }

            @keyframes confirmationMessageOpen {
                from { transform: translate(-50%, -120%); }
                to { transform: translate(-50%, 10px); }
            }

            @keyframes confirmationMessageClose {
                from { transform: translate(-50%, 10px); }
                to { transform: translate(-50%, -120%); }
            }
        `;
        this.confirmationMessage.innerHTML = `
            <img class="confirmation-message__icon" src="assets/error.webp">
            <p class="confirmation-message__text"></p>
        `;
        this.confirmationMessageOpen = false;
        this.confirmationMessageExpire = 0;
        this.confirmationMessageInstalled = false;
        setInterval(() => {
            if (this.confirmationMessageOpen && this.confirmationMessageInstalled) {
                if (Date.now() > this.confirmationMessageExpire) {
                    this.confirmationMessageOpen = false;
                    this.confirmationMessage.style.animationName = "confirmationMessageClose";
                }
            }
        }, 0);
        this.pages = {
            "/": ["/partials/home.html", "/partials/menu.html"],
            "/contact/": ["/partials/contact.html", "/partials/menu.html"],
            "/privacy-policy/": ["/partials/privacy-policy.html", "/partials/menu.html"],
            "/terms-and-conditions/": ["/partials/terms-and-conditions.html", "/partials/menu.html"],
            "/dashboard/home/": ["/partials/dashboard-home.html", "/partials/dashboard.html"],
            "/dashboard/users/": ["/partials/dashboard-users.html", "/partials/dashboard.html"],
            "/dashboard/websites/": ["/partials/dashboard-websites.html", "/partials/dashboard.html"],
            "/dashboard/recordings/": ["/partials/dashboard-recordings.html", "/partials/dashboard.html"],
            "/dashboard/settings/": ["/partials/dashboard-settings.html", "/partials/dashboard.html"],
            "/dashboard/settings/account/": ["/partials/dashboard-settings-account.html", "/partials/dashboard.html"],
            "/dashboard/settings/time-format/": ["/partials/dashboard-settings-timeFormat.html", "/partials/dashboard.html"],
            "/dashboard/settings/legal/": ["/partials/dashboard-settings-legal.html", "/partials/dashboard.html"],
            "/change-email/": ["/partials/changeEmail.html"],
            "/reset-password/": ["/partials/resetPassword.html"],
            "/forgot-password/": ["/partials/forgotPassword.html"],
            "/login/": ["/partials/login.html"],
            "/signup/": ["/partials/signup.html"]
        }
        this.start();
    }

    installConfirmationMessage() {
        if (!this.confirmationMessageInstalled) {
            document.head.appendChild(this.confirmationMessageStyles);
            document.body.appendChild(this.confirmationMessage);
            this.confirmationMessageIcon = document.querySelector(".confirmation-message__icon");
            this.confirmationMessageText = document.querySelector(".confirmation-message__text");
            this.confirmationMessageInstalled = true;
        }
    }

    openConfirmationMessage(status, message) {
        if (status) {
            this.confirmationMessage.style.backgroundColor = "#8ea638";
            this.confirmationMessageIcon.src = "assets/success.webp";
        } else {
            this.confirmationMessage.style.backgroundColor = "#e36a62";
            this.confirmationMessageIcon.src = "assets/error.webp";
        }

        this.confirmationMessageText.innerText = message;
        this.confirmationMessage.style.animationName = "confirmationMessageOpen";
        this.confirmationMessageExpire = Date.now() + 3000;
        this.confirmationMessageOpen = true;

    }

    getCookie(name) {
        var encodedName = encodeURIComponent(name) + "=";
        var cookies = document.cookie.split("; ");

        for (let cookie of cookies) {
            if (cookie.startsWith(encodedName)) {
                return decodeURIComponent(cookie.substring(encodedName.length));
            }
        }

        return null;
    }

    setCookie(name, value) {
        document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/`;
    }

    removeCookie(name) {
        document.cookie = `${encodeURIComponent(name)}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }

    servReq(type, input, saved, callback) {
        var label = JSON.stringify([type, input]);
        if (saved && this.servReqData.hasOwnProperty(label)) {
            callback(this.servReqData[label]);
        } else {
            fetch(this.server + type, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(input)
            }).then(response => {
                return response.json();
            }).then(data => {
                if (data.error === "unauthorized") {
                    SPA.removeCookie("sessionId");
                    location.href = location.origin + "/login";
                }
                this.servReqData[label] = data;
                callback(data);
            }).catch(err => {
                console.log(err);
                this.openConfirmationMessage(false, "Cannot connect to server, try again later.");
            });
        }
    }

    clearReq(type, input) {
        if (input) {
            var label = JSON.stringify([type, input]);
            delete this.servReqData[label];
        } else {
            for (let key in this.servReqData) {
                if (type === JSON.parse(key)[0]) {
                    delete this.servReqData[key];
                }
            }
        }
    }

    start() {
        var path = location.pathname;

        var loadPage = async (page, menu) => {

            var fetchHTML = async (path) => {
                var res = await fetch(`${path}?v=${this.version}`, {cache: "force-cache"});
                return res.text();
            }
            
            function runScripts(content) {
                var scripts = content.querySelectorAll("script");
                scripts.forEach(script => {
                    if (script.src) {
                        var scriptEl = document.createElement("script");
                        scriptEl.src = script.src;
                        content.appendChild(scriptEl);
                        script.remove();
                    } else {
                        eval(script.textContent);
                    }
                });
            }
            
            if (menu) {
                [menu, page] = await Promise.all([
                    fetchHTML(menu),
                    fetchHTML(page)
                ]);
                document.write(menu);
                var checkContent = setInterval(() => {
                    var content = document.querySelector(".page");
                    if (content && window.hasOwnProperty("menuLoaded")) {
                        clearInterval(checkContent);
                        content.innerHTML = page;
                        this.installConfirmationMessage();
                        runScripts(content);
                    }
                }, 0);
            } else {
                page = await fetchHTML(page);
                document.write(page);
                this.installConfirmationMessage();
            }

        }

        function notFound() {
            loadPage("/404.html");
        }

        if (this.pages.hasOwnProperty(path)) {
            loadPage(this.pages[path][0], this.pages[path][1]);
        } else {
            notFound();
        }
    }

}