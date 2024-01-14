const DownloadInstances = require("../../../App/DownloadInstances");
const ServerInstances = require("../../../App/ServerInstances");
const {checkForUpdate, updateAvailable} = require("../../../App/Updater");
const {initSettings} = require("./settingsWin");
const {addNotification} = require("./notification");

const library = document.getElementById("library")
const servers = document.getElementById("servers")
const settings = document.getElementById("settings")

const grLibrary = document.getElementById("gr-library")
const grServers = document.getElementById("gr-servers")
const grSettings = document.getElementById("gr-settings")

let activeBtn = library
let activeGroup = grLibrary;

library.addEventListener("click", () => {
    activeGroup.style.display = "none";
    grLibrary.style.display = "block";

    // Refresh Instance List

    activeGroup = grLibrary

    activeBtn.toggleAttribute("active", false)
    library.toggleAttribute("active", true)

    activeBtn = library
})

servers.addEventListener("click", async () => {
    activeGroup.style.display = "none";
    grServers.style.display = "block";

    activeGroup = grServers;

    activeBtn.toggleAttribute("active", false)
    servers.toggleAttribute("active", true)

    activeBtn = servers

    await ServerInstances.refreshInstanceList().catch((err) => addNotification(`Une erreur est survenue lors d l'actualisation des instances de serveur: ${err}`, "error"))
    await DownloadInstances.refreshInstanceList().catch((err) => addNotification(`Une erreur est survenue lors d l'actualisation des instances locaux: ${err}`, "error"))
})

settings.addEventListener("click", async () => {
    activeGroup.style.display = "none";
    grSettings.style.display = "flex";

    await initSettings().catch((err) => addNotification(`Une erreur est survenue lors de l'initialisation des paramètres.`, "error", err))

    activeGroup = grSettings;

    activeBtn.toggleAttribute("active", false)
    settings.toggleAttribute("active", true)

    activeBtn = settings
})