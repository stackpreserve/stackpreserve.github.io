var menuLoaded = true;
var menu = document.querySelector(".menu");
var menuBtn = document.querySelector(".nav-bar__menu-btn");
var closeMenuBtn = document.querySelector(".menu__close");
var copyrightNotice = document.querySelector(".footer__copyright-notice");
var productLinks = document.querySelectorAll(".product-link");
var howItWorksLinks = document.querySelectorAll(".how-it-works-link");
var communityLinks = document.querySelectorAll(".community-link");
var year = new Date().getFullYear();
var menuTitles = {
    "/": `${SPA.websiteName} | Watch exactly how your customers react`,
    "/contact/": `Contact - ${SPA.websiteName}`,
    "/terms-and-conditions/": `Terms & Conditions - ${SPA.websiteName}`,
    "/privacy-policy/": `Privacy Policy - ${SPA.websiteName}`
}

copyrightNotice.innerText = `© ${SPA.websiteName} ${year}`;
document.title = menuTitles[location.pathname];

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

function closeMenu() {
    var menuX = parseFloat(getComputedStyle(document.querySelector(".menu")).left);
    if (menuX >= 0) {
        menu.style.animationName = "menuClose";
        cover.element.style.display = "none";
    }
}

function openMenu() {
    menu.style.animationName = "menuOpen";
    cover.element.style.display = "";
    cover.addOnClick(closeMenu);
}

menuBtn.addEventListener("dragstart", e => {e.preventDefault();});
menuBtn.addEventListener("contextmenu", e => {e.preventDefault();});
closeMenuBtn.addEventListener("dragstart", e => {e.preventDefault();});
closeMenuBtn.addEventListener("contextmenu", e => {e.preventDefault();});
menuBtn.addEventListener("click", openMenu);
closeMenuBtn.addEventListener("click", closeMenu);

productLinks.forEach(productLink => {
    productLink.addEventListener("click", function() {
        if (location.pathname !== "/") {
            SPA.setCookie("scroll", ".product");
            location.href = "/";
        } else {
            var productSection = document.querySelector(".product");
            productSection.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    })
});

howItWorksLinks.forEach(howItWorksLink => {
    howItWorksLink.addEventListener("click", function() {
        if (location.pathname !== "/") {
            SPA.setCookie("scroll", ".how-it-works");
            location.href = "/";
        } else {
            var howItWorksSection = document.querySelector(".how-it-works");
            howItWorksSection.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    });
});

communityLinks.forEach(communityLink => {
    communityLink.addEventListener("click", function() {
        if (location.pathname !== "/") {
            SPA.setCookie("scroll", ".community");
            location.href = "/";
        } else {
            var communitySection = document.querySelector(".community");
            communitySection.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    })
});