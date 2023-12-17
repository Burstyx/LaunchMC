const { initDiscordRPC } = require("../../App/DiscordRPC");
const {checkForUpdate} = require("../../App/Updater");
const {setLoading, openWindow, openPopup} = require("./scripts/window");
const LocalInstances= require("../../App/LocalInstances");

const initializeModules = async () => {
    setLoading(true)

    await checkForUpdate().then((updateAvailable) => {
        const settings = document.getElementById("settings")
        settings.toggleAttribute("badge", updateAvailable)
    }).catch((err) => {
        console.error(`Une erreur est survenue lors de la vérification des mises à jour: ${err}`)
    }).finally(async () => {
        console.log("[Initializing] Window buttons");
        require("./scripts/winbtn")

        console.log("[Initializing] Menu buttons")
        require("./scripts/menubtn")

        console.log("[Initialize Modules] Interactable elements module");
        require("./scripts/elements")

        console.log("[Initialize Modules] Server instance info elements module");
        require("./scripts/serverLibraryWin")

        console.log("[Initialize Modules] Settings module");
        require("./scripts/settingsWin")

        //console.log("[Initializing] Content section");
        /*require("./scripts/mainWin")*/

        //console.log("[Initialize Modules] New instance window module");
        /*require("./scripts/newInstanceWin")*/

        //console.log("[Initialize Modules] Choose version window module");
        /*const chooseVersionWindow = require("./scripts/chooseVersionWin")
        await chooseVersionWindow.refreshVersionList()*/

        setLoading(false)

        console.log("Update Local Instance List");
        await LocalInstances.refreshInstanceList().catch((err) => console.error(`Une erreur est survenue lors de l'actualisation des instances locaux: ${err}`))

        console.log("Initialize Discord RPC");
        initDiscordRPC()
    })
}

initializeModules().then(() => {
    console.log("Initialisation effectuée sans erreur !")
}).catch((err) => {
    console.error(`Une erreur est survenue lors de l'initialisation: ${err}`)
})
