const subWindow = document.getElementById("sub-windows")
const windows = document.querySelectorAll(".window")

let windowsIdOpened = []

exports.openWindow = (windowId) => {
    subWindow.style.opacity = "1"
    subWindow.style.pointerEvents = "all"

    windows.forEach((window) => {
        if (window.getAttribute("window-id") === windowId) {
            window.style.opacity = "1"
            window.style.transform = "scale(1)"
        }
    })
}

exports.closeWindow = (windowId) => {
    subWindow.style.opacity = "0"
    subWindow.style.pointerEvents = "none"

    windows.forEach((window) => {
        if (window.getAttribute("window-id") === windowId) {
            window.style.opacity = "0"
            window.style.transform = "scale(.5)"
        }
    })
}