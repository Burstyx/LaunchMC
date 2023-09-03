const { getCurrentWindow } = require("@electron/remote")

const closeBtn = document.getElementById("close-btn")
const maximizeBtn = document.getElementById("minimize-btn")
const reducebtn = document.getElementById("reduce-btn")

closeBtn.addEventListener("click", () => {
    getCurrentWindow().close()
})

maximizeBtn.addEventListener("click", () => {
    if (getCurrentWindow().isMaximized()) {
        getCurrentWindow().restore()
    }
    else {
        getCurrentWindow().maximize()
    }
})

reducebtn.addEventListener("click", () => {
    getCurrentWindow().minimize()
})