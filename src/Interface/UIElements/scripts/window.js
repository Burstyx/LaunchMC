/*const subWindow = document.getElementById("sub-windows")
const windows = document.querySelectorAll(".window")

let windowsIdOpened = []

exports.openWindow = (windowId) => {
    subWindow.style.opacity = "1"
    subWindow.style.pointerEvents = "all"

    windowsIdOpened.push(windowId)

    windows.forEach((window) => {
        if (window.getAttribute("window-id") === windowId) {
            window.style.opacity = "1"
            window.style.transform = "scale(1)"
            window.style.pointerEvents = "all"
        }
    })
}

exports.closeWindow = (windowId) => {
    windowsIdOpened.splice(windowsIdOpened.indexOf(windowId))

    if (windowsIdOpened.length == 0) {
        subWindow.style.opacity = "0"
        subWindow.style.pointerEvents = "none"
    }

    windows.forEach((window) => {
        if (window.getAttribute("window-id") === windowId) {
            window.style.opacity = "0"
            window.style.transform = "scale(.85)"
            window.style.pointerEvents = "none"
        }
    })
}*/

const loadingStartup = document.getElementById("startup-loading")
const menuBtn = document.getElementById("menu-buttons")

exports.setLoading = (active) => {
    if(active) {
        loadingStartup.style.display = "flex"
        menuBtn.style.display = "none"
    } else {
        loadingStartup.style.display = "none"
        menuBtn.style.display = "flex"
    }
}