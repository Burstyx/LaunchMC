const popups = document.querySelectorAll(".popup")
let currentPopup = null

exports.openPopup = (popupId) => {
    popups.forEach((popup) => {
        if (popup.getAttribute("popup-id") === popupId) {
            popup.style.display = "flex"

            currentPopup = popup
        }
    })
}

exports.closePopup = (popupId) => {
    if(currentPopup != null) {
        currentPopup.style.display = "none"

        currentPopup = null;
    }
}

const loadingStartup = document.getElementById("startup-loading")
exports.setLoading = (active) => {
    if(active) {
        loadingStartup.style.display = "flex"
    } else {
        loadingStartup.style.display = "none"
    }
}