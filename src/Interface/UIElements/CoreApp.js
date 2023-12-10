const { initDiscordRPC } = require("../../App/DIscordRPC");
const {checkForUpdate} = require("../../App/Updater");
const {setLoading, openWindow, openPopup} = require("./scripts/window");
const {refreshLocalInstanceList} = require("../../Utils/HInstance");



const initializeModules = async () => {
    setLoading(true)

    console.log("Checking for updates")
    await checkForUpdate()

    console.log("[Initializing] Window buttons");
    require("./scripts/winbtn")

    console.log("[Initializing] Menu buttons")
    require("./scripts/menubtn")

    /*console.log("[Initialize Modules] Interactable elements module");
    require("./scripts/elements")*/

    //console.log("[Initializing] Content section");
    /*require("./scripts/mainWin")*/

    //console.log("[Initialize Modules] New instance window module");
    /*require("./scripts/newInstanceWin")*/

    //console.log("[Initialize Modules] Choose version window module");
    /*const chooseVersionWindow = require("./scripts/chooseVersionWin")
    await chooseVersionWindow.refreshVersionList()*/

    //console.log("[Initialize Modules] Account manager window module");
    /*const accountManagerWindow = require("./scripts/accountManagerWin")
    await accountManagerWindow.refreshAccountList()*/

    console.log("Update Instance List");
    await refreshLocalInstanceList()

    console.log("Initialize Discord RPC");
    await initDiscordRPC()

    //console.log("Refreshing Microsoft Account");
    // Put logic here

    console.log("Initialisation effectué sans erreur !")

    setLoading(false)
}

initializeModules()