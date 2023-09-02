const { initDiscordRPC } = require("../../App/DIscordRPC");
const { refreshInstanceList } = require("../../Utils/HInstance")
const { getActiveAccount } = require("../../Utils/HMicrosoft")

const loadingStartup = document.getElementById("loading-startup-launcher")
const menuBtn = document.getElementById("titlebar-menu-btns")

const initializeModules = async () => {
    console.log("Initialize Modules");
    loadingStartup.style.display = "flex"
    menuBtn.style.display = "none"

    console.log("[Initialize Modules] Titlebar module");
    const titlebar = require("./scripts/titlebar")

    console.log("[Initialize Modules] Interactable elements module");
    const elements = require("./scripts/elements")

    console.log("[Initialize Modules] Main window module");
    const mainWindow = require("./scripts/mainWin")

    console.log("[Initialize Modules] New instance window module");
    const newInstanceWindow = require("./scripts/newInstanceWin")

    console.log("[Initialize Modules] Choose version window module");
    const chooseVersionWindow = require("./scripts/chooseVersionWin")
    chooseVersionWindow.refreshVersionList()

    console.log("[Initialize Modules] Account manager window module");
    const accountManagerWindow = require("./scripts/accountManagerWin")
    await accountManagerWindow.refreshAccountList()

    console.log("Update Instance List");
    await refreshInstanceList()

    console.log("Initialize Discord RPC");
    await initDiscordRPC()

    console.log("Refreshing Microsoft Account");
    // Put logic here

    loadingStartup.style.display = "none"
    menuBtn.style.display = "flex"

    console.log("Initialisation effectué sans erreur !")
}

initializeModules()