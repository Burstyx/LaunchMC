const { BrowserWindow } = require("@electron/remote")

const close = document.getElementById("close")
const minmax = document.getElementById("minmax")
const reduce = document.getElementById("reduce")

close.addEventListener("click", () => {
    BrowserWindow.getFocusedWindow().close()
})

minmax.addEventListener("click", () => {
    if (BrowserWindow.getFocusedWindow().isMaximized()) {
        BrowserWindow.getFocusedWindow().restore()
    }
    else {
        BrowserWindow.getFocusedWindow().maximize()
    }
})

reduce.addEventListener("click", () => {
    BrowserWindow.getFocusedWindow().minimize()
})