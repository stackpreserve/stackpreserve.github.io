var SPA = new class {
    constructor() {
        this.server = "https://glorious-disgrace-unroasted.ngrok-free.dev";
        this.servReqData = {};
        this.websiteName = "StackReserve";
        this.sessionId = this.getCookie("sessionId");
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

    getCookie(name) {
        var value = `; ${document.cookie}`;
        var parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
    }

    setCookie(name, value) {
        document.cookie = `${name}=${value}`;
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
                openConfirmationMessage(false, "Cannot connect to server, try again later.")
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

        async function loadPage(page, menu) {

            async function fetchHTML(path) {
                var res = await fetch(path, {cache: "force-cache"});
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
                        runScripts(content);
                    }
                }, 0);
            } else {
                page = await fetchHTML(page);
                document.write(page);
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