const { initDiscordRPC } = require("../../App/DIscordRPC");
const {checkForUpdate} = require("../../App/Updater");
const {setLoading, openWindow, openPopup} = require("./scripts/window");
const LocalInstances= require("../../App/LocalInstances");

const initializeModules = () => {
    setLoading(true)

    console.log("Checking for updates")
    checkForUpdate().then(() => {
        console.log("[Initializing] Window buttons");
        require("./scripts/winbtn")

        console.log("[Initializing] Menu buttons")
        require("./scripts/menubtn")

        console.log("[Initialize Modules] Interactable elements module");
        require("./scripts/elements")

        console.log("[Initialize Modules] Server instance info elements module");
        require("./scripts/serverLibraryWin")

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

        console.log("Initialisation effectuée sans erreur !")
        setLoading(false)

        console.log("Update Local Instance List");
        LocalInstances.refreshInstanceList()

        console.log("Initialize Discord RPC");
        initDiscordRPC()
    })
}

initializeModules()