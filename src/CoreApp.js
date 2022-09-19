const { app, BrowserWindow, getCurrentWindow } = require("@electron/remote")
const { generateInstanceBtn } = require('./utils/instanceManager')

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

// Boutons barre d'outils
const addBtn = document.getElementById("add")
const instancesDiv = document.getElementById("instances")

addBtn.addEventListener("click", () => {
    element = generateInstanceBtn("https://i.ytimg.com/vi/CJOFD9eZXig/maxresdefault.jpg", "Holycuba")

    // Add element to the page
    instancesDiv.appendChild(element)
})