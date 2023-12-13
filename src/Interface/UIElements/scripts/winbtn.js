const { getCurrentWindow } = require("@electron/remote")

const close = document.getElementById("close")
const minmax = document.getElementById("minmax")
const reduce = document.getElementById("reduce")

close.addEventListener("click", () => {
    getCurrentWindow().close()
})

minmax.addEventListener("click", () => {
    if (getCurrentWindow().isMaximized()) {
        getCurrentWindow().restore()
    }
    else {
        getCurrentWindow().maximize()
    }
})

reduce.addEventListener("click", () => {
    getCurrentWindow().minimize()
})