const DownloadInstances = require("../../../App/DownloadInstances");
const ServerInstances = require("../../../App/ServerInstances");
const {checkForUpdate, updateAvailable} = require("../../../App/Updater");
const {initSettings} = require("./settingsWin");

const home = document.getElementById("home")
const library = document.getElementById("library")
const servers = document.getElementById("servers")
const settings = document.getElementById("settings")

const grHome = document.getElementById("gr-discover")
const grLibrary = document.getElementById("gr-library")
const grServers = document.getElementById("gr-servers")
const grSettings = document.getElementById("gr-settings")

let activeBtn = library
let activeGroup = grLibrary;

home.addEventListener("click", () => {
    activeGroup.style.display = "none";
    grHome.style.display = "block";

    activeGroup = grHome

    activeBtn.toggleAttribute("active", false)
    home.toggleAttribute("active", true)

    activeBtn = home
})

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

    // Refresh Servers List

    activeGroup = grServers;

    activeBtn.toggleAttribute("active", false)
    servers.toggleAttribute("active", true)

    activeBtn = servers

    await ServerInstances.refreshInstanceList().catch((err) => console.error(`Une erreur est survenue lors d l'actualisation des instances de serveur: ${err}` ))
    await DownloadInstances.refreshInstanceList().catch((err) => console.error(`Une erreur est survenue lors d l'actualisation des instances locaux: ${err}` ))
})

const checkUpdateBtn = document.getElementById("settings-check-update")
settings.addEventListener("click", async () => {
    activeGroup.style.display = "none";
    grSettings.style.display = "block";

    // Refresh account list
    // Check if update was found
    initSettings()

    activeGroup = grSettings;

    activeBtn.toggleAttribute("active", false)
    settings.toggleAttribute("active", true)

    activeBtn = settings
})