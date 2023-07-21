const { app, BrowserWindow, getCurrentWindow } = require("@electron/remote")
const { generateInstanceBtn, getInstancesList, getInstanceData, makeInstanceLoading, refreshInstanceList } = require('../../Utils/HInstance')
const { filteredMinecraftVersions } = require("../../Utils/HVersions")
const NewInstance = require("../../App/NewInstance")
// const { startMinecraft } = require("../../App/InstanceLauncher")
const { msaLogin } = require("../../App/MicrosoftAuth")
const { getActiveAccount } = require("../../Utils/HMicrosoft")
const { startMinecraft } = require("../../App/StartMinecraft")

console.log("Initialisation du module principal !");

// Titlebar behaviour
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

// Add btn logic

refreshInstanceList()