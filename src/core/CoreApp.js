const { app, BrowserWindow, getCurrentWindow } = require("@electron/remote")

console.log("Initialisation du module principal !");

// Boutons menu titre
const closeBtn = document.getElementById("close")
const maximizeBtn = document.getElementById("maximize")
const reducebtn = document.getElementById("reduce")

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
