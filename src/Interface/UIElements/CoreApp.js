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

// Create instance
const createInstance = document.getElementById("create-instance")
const subWindow = document.getElementById("sub-windows")

const windows = document.querySelectorAll(".window")

createInstance.addEventListener("click", (e) => {
    console.log("sdf");
    subWindow.style.opacity = "1"
    subWindow.style.pointerEvents = "all"

    windows.forEach((window) => {
        if (window.getAttribute("window-id") === "new-instance") {
            console.log("yeah");
            window.style.opacity = "1"
            window.style.transform = "scale(1)"
        }
    })
})