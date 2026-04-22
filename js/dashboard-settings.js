var settingsCards = document.querySelectorAll(".settings-gallery__card");

settingsCards.forEach(function(card) {
    card.addEventListener("click", async function() {
        var hrefAttr = this.getAttribute("href");
        if (hrefAttr !== location.pathname) {
            history.pushState(null, "", hrefAttr);
            await refreshPage();
        }
    });
})