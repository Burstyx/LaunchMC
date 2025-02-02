const { initDiscordRPC, stopDiscordRPC} = require("../../App/DiscordRPC");
const {checkForUpdate} = require("../../App/Updater");
const {refreshToken} = require("../../App/MicrosoftAuth")
const {addNotification} = require("../UIElements/scripts/notification")


const {setLoading, openWindow, openPopup} = require("./scripts/window");
const LocalInstances= require("../../App/LocalInstances");
const {getCurrentWindow, app} = require("@electron/remote");
const {getSetting} = require("../../Utils/Options");
const {discordRpcSetting} = require("../../Utils/const");

const initializeModules = async () => {
    setLoading(true)

    await checkForUpdate().then((updateAvailable) => {
        const settings = document.getElementById("settings")
        settings.toggleAttribute("badge", updateAvailable)
    }).catch((err) => {
        addNotification(`Une erreur est survenue lors de la vérification des mises à jour.`, 'error', err)
    }).finally(async () => {
        console.log("[Initializing] Window buttons");
        require("./scripts/winbtn")

        console.log("[Initializing] Menu buttons")
        require("./scripts/menubtn")

        console.log("[Initialize Modules] Server instance info elements module");
        require("./scripts/serverLibraryWin")

        console.log("[Initialize Modules] Settings module");
        require("./scripts/settingsWin")

        console.log("Refreshing Microsoft Account");
        await refreshToken().catch((err) => {
            addNotification(`Une erreur est survenue lors du rafraichissement du token.`, 'error', err)
        })

        setLoading(false)

        console.log("Update Local Instance List");
        await LocalInstances.refreshInstanceList().catch((err) => addNotification(`Une erreur est survenue lors de l'actualisation des instances locaux.`, "error", err))

        console.log("Initialize Discord RPC");
        const rpcEnabled = getSetting("discord_rpc", discordRpcSetting).then((res) => {
            if(res) initDiscordRPC()
        }).catch((err) => addNotification(`Impossible de récupérer la valeur du paramètre Discord RPC.`, "error", err))
    })
}

initializeModules().then(() => {
    console.log("Initialisation effectuée sans erreur !")
}).catch((err) => {
    addNotification(`${err}`, "error", err)
    getCurrentWindow().webContents.openDevTools({mode: "undocked"})
})
