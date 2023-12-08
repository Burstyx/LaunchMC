const { initDiscordRPC } = require("../../App/DIscordRPC");
const {checkForUpdate} = require("../../App/Updater");
const {setLoading} = require("./scripts/window");



const initializeModules = async () => {
    // Retrieve all data from json files (get all of them one and use the ones stored in ram)
    // When using/updating those data stored in ram, write it on disk to save data
    setLoading(true)

    console.log("Checking for Updates")
    await checkForUpdate()

    console.log("[Initialize Modules] Titlebar module");
    require("./scripts/titlebar")

    console.log("[Initialize Modules] Interactable elements module");
    require("./scripts/elements")

    console.log("[Initialize Modules] Main window module");
    /*require("./scripts/mainWin")*/

    console.log("[Initialize Modules] New instance window module");
    /*require("./scripts/newInstanceWin")*/

    console.log("[Initialize Modules] Choose version window module");
    /*const chooseVersionWindow = require("./scripts/chooseVersionWin")
    await chooseVersionWindow.refreshVersionList()*/

    console.log("[Initialize Modules] Account manager window module");
    /*const accountManagerWindow = require("./scripts/accountManagerWin")
    await accountManagerWindow.refreshAccountList()*/

    console.log("Update Instance List");
    /*await refreshInstanceList()*/

    console.log("Initialize Discord RPC");
    await initDiscordRPC()

    console.log("Refreshing Microsoft Account");
    // Put logic here

    console.log("Initialisation effectué sans erreur !")

    setLoading(false)
}

initializeModules()