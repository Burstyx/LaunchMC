const { app, BrowserWindow, getCurrentWindow } = require("@electron/remote")
const { generateInstanceBtn, getInstancesList, getInstanceData, makeInstanceLoading } = require('./ApplicationCore/instancesManager')
const { filteredMinecraftVersions } = require("./Helper/HVersions")
const { downloadVanillaVersion } = require("./ApplicationCore/minecraftDownloader")
const { startMinecraft } = require("./ApplicationCore/startInstance")
const { msaLogin } = require("./ApplicationCore/microsoftAuth")
const { getActiveAccount } = require("./Helper/MicrosoftAccount")

console.log("Initialisation du module principal !");

// Constants
const clickavoider = document.getElementById("clickavoider")

// Titlebar Btns
const closeBtn = document.getElementById("close")
const maximizeBtn = document.getElementById("maximize")
const reducebtn = document.getElementById("reduce")

// Globals
let elementToCloseWhenClickingOnClickAvoider = null;

// Titlebar logic
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

// UI Helpers
function closeAllMenus() {
    const menus = document.getElementsByClassName("menu")
    console.log("click avoider");
    for (var i = 0; i < menus.length; i++) {
        menus[i].style.opacity = "0"
        menus[i].style.pointerEvents = "none"
    }
    clickavoider.style.opacity = "0"
    clickavoider.style.pointerEvents = "none"
}

const choseVersionMenu = document.getElementById("choseversionmenu")
const addMenu = document.getElementById("addmenu")

// Black background when window opened logic
clickavoider.addEventListener("click", () => {
    if (elementToCloseWhenClickingOnClickAvoider == null) {
        return
    }

    if (elementToCloseWhenClickingOnClickAvoider == choseVersionMenu) {
        choseVersionMenu.style.opacity = "0"
        choseVersionMenu.style.pointerEvents = "none"
        elementToCloseWhenClickingOnClickAvoider = addMenu
        clickavoider.style.zIndex = 1
        return
    }

    elementToCloseWhenClickingOnClickAvoider.style.opacity = "0"
    elementToCloseWhenClickingOnClickAvoider.style.pointerEvents = "none"

    clickavoider.style.opacity = "0"
    clickavoider.style.pointerEvents = "none"
    elementToCloseWhenClickingOnClickAvoider = null
})


// Add btn logic

const cancelBtn = document.getElementById("addmenucancelbtn")
const closeAddMenuBtn = document.getElementById("closeaddmenu")
const createAddMenuBtn = document.getElementById("addmenucreatebtn")
const instanceVersionAddMenuText = document.getElementById("instanceversionselectedversion")
const instanceVersion = document.getElementById("instanceversion")
const instancesDiv = document.getElementById("instances")
const instanceName = document.getElementById("instancenameinput")

const accountBtn = document.getElementById("account")
const accountManager = document.getElementById("accountmanager")
const closeaccountmenu = document.getElementById("closeaccountmenu")

accountBtn.addEventListener("click", () => {
    accountManager.style.opacity = "1"
    accountManager.style.pointerEvents = "all"

    clickavoider.style.zIndex = "1"
    clickavoider.style.opacity = "0.5"
    clickavoider.style.pointerEvents = "all"

    elementToCloseWhenClickingOnClickAvoider = accountManager
})

closeaccountmenu.addEventListener("click", () => {
    accountManager.style.opacity = "0"
    accountManager.style.pointerEvents = "none"

    clickavoider.style.opacity = "0"
    clickavoider.style.pointerEvents = "none"
})

let chosenVersion = "vanilla-1.12.2"
let selectedVersion = "1.12.2"
let bootloadertype = "vanilla"


const addBtn = document.getElementById("add")

function refreshInstanceVersion() {
    bootloadertype = chosenVersion.slice(0, chosenVersion.indexOf("-"))
    selectedVersion = chosenVersion.slice(chosenVersion.indexOf("-") + 1)
    if (bootloadertype == "vanilla") {
        instanceVersionAddMenuText.innerText = "Vanilla - " + selectedVersion
    }
    else if (bootloadertype == "forge") {
        instanceVersionAddMenuText.innerText = "Forge - " + selectedVersion
    }
    instanceName.setAttribute("placeholder", selectedVersion)
}

addBtn.addEventListener("click", () => {


    // Reset infos précédentes
    instanceName.value = ""
    instanceName.setAttribute("placeholder", chosenVersion.split("-")[1])
    chosenVersion = "vanilla-1.12.2"

    elementToCloseWhenClickingOnClickAvoider = addMenu
    clickavoider.style.zIndex = 1

    clickavoider.style.opacity = ".5"
    clickavoider.style.pointerEvents = "all"

    addMenu.style.opacity = "1"
    addMenu.style.pointerEvents = "all"

    refreshInstanceVersion()
})

function closeAddMenu() {
    // Fermer le menu
    addMenu.style.opacity = "0"
    addMenu.style.pointerEvents = "none"

    clickavoider.style.opacity = "0"
    clickavoider.style.pointerEvents = "none"
}

cancelBtn.addEventListener("click", () => {
    closeAddMenu()
})

closeAddMenuBtn.addEventListener("click", () => {
    closeAddMenu()
})

const addLabelBanner = document.getElementById("addlabelbanner")

createAddMenuBtn.addEventListener("click", () => {
    if (instanceName.value != "") {
        console.log("nom donné : " + instanceName.value);
        downloadVanillaVersion(selectedVersion, instanceName.value, instancesDiv, window.getComputedStyle(addLabelBanner).backgroundImage.slice(5, -2).replace(/"/g, ""))
    } else {
        console.log("nom non donné donc nom automatiquement donné : " + instanceName.getAttribute("placeholder"));
        downloadVanillaVersion(selectedVersion, instanceName.getAttribute("placeholder"), instancesDiv, window.getComputedStyle(addLabelBanner).backgroundImage.slice(5, -2).replace(/"/g, ""))
    }

    closeAddMenu()

})

const vanillareleasecheckbox = document.getElementById("vanillareleasecheckbox")
const vanillasnapshotcheckbox = document.getElementById("vanillasnapshotcheckbox")
const vanillabetacheckbox = document.getElementById("vanillabetacheckbox")
const vanillaalphacheckbox = document.getElementById("vanillaalphacheckbox")

const versionslist = document.getElementById("vanillaversionslist")

const vanillabootloaderinfoslist = document.getElementById("vanillabootloaderinfoslist")

const loadingVanillaVersions = document.getElementById("loadingbootloaderversions")
const notfoundbootloaderversions = document.getElementById("notfoundbootloaderversions")

instanceVersion.addEventListener("click", async () => {
    choseVersionMenu.style.opacity = "1"
    choseVersionMenu.style.pointerEvents = "all"

    refreshVersionInfoList()

    clickavoider.style.zIndex = 2

    elementToCloseWhenClickingOnClickAvoider = choseVersionMenu
})

// Show all Vanilla versions

const bootloaderversion = document.getElementById("bootloaderversion")
const bootloaderversionstate = document.getElementById("bootloaderversionstate")



function clearVanillaVersions() {
    let e = vanillabootloaderinfoslist.firstChild
    while (e) {
        e.remove()
        e = vanillabootloaderinfoslist.firstChild
    }
}

vanillareleasecheckbox.addEventListener("change", async () => {
    refreshVersionInfoList()
})

vanillasnapshotcheckbox.addEventListener("change", async () => {
    refreshVersionInfoList()
})

vanillabetacheckbox.addEventListener("change", async () => {
    refreshVersionInfoList()
})

vanillaalphacheckbox.addEventListener("change", async () => {
    refreshVersionInfoList()
})

async function refreshVersionInfoList() {
    loadingVanillaVersions.style.display = "block"
    notfoundbootloaderversions.style.display = "none"
    clearVanillaVersions()
    await filteredMinecraftVersions({ filterOptions: { alpha: vanillaalphacheckbox.checked, beta: vanillabetacheckbox.checked, release: vanillareleasecheckbox.checked, snapshot: vanillasnapshotcheckbox.checked } }).then((data) => {
        if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                let versionParent = document.createElement("div")
                versionParent.id = "vanilla-" + data[i]["id"]
                versionParent.className = "vanillabootloaderinformation bootloaderinformation"

                // Create version label for the button element
                let version = document.createElement("p")
                version.innerText = data[i]["id"]

                // Create version type label for the button element
                let versionState = document.createElement("p")
                versionState.innerText = data[i]["type"]

                versionParent.appendChild(version)
                versionParent.appendChild(versionState)
                vanillabootloaderinfoslist.appendChild(versionParent)
            }
        } else {
            notfoundbootloaderversions.style.display = "block"
        }

    })
    loadingVanillaVersions.style.display = "none"
}

// Chosing version

function closeChooseVersionMenu() {
    // Fermer le menu
    choseVersionMenu.style.opacity = "0"
    choseVersionMenu.style.pointerEvents = "none"

    clickavoider.style.zIndex = "1"

    elementToCloseWhenClickingOnClickAvoider = addMenu
}

document.addEventListener("click", async (evt) => {
    const elementClicked = evt.target
    if (elementClicked.parentElement.classList.item(0) == "vanillabootloaderinformation") {
        let versionFound = elementClicked.parentElement.id.toString().substring(8)
        chosenVersion = "vanilla-" + versionFound
        closeChooseVersionMenu()
        refreshInstanceVersion()
    }

    if (elementClicked.classList.item(0) == "instance" || elementClicked.parentElement.classList.item(0) == "instance") {
        if (elementClicked.classList.contains("downloading") || elementClicked.parentElement.classList.contains("downloading")) {
            console.log("Téléchargement, impossible de lancer l'instance");
            return
        }

        if (elementClicked.classList.contains("playing") || elementClicked.parentElement.classList.contains("playing")) {
            console.log("Jeu déjà lancé, impossible de relancer l'instance");
            return
        }

        if (elementClicked.tagName == "P") {
            const data = await getInstanceData(elementClicked.parentElement.getAttribute("instanceid"))
            const accountInfo = await getActiveAccount()
            startMinecraft(data["data"]["version"], data["data"]["name"], { accesstoken: accountInfo["access_token"], username: accountInfo["username"], usertype: accountInfo["usertype"], uuid: accountInfo["uuid"], versiontype: "release" }, instancesDiv)

        } else {
            const data = await getInstanceData(elementClicked.getAttribute("instanceid"))
            const accountInfo = await getActiveAccount()
            startMinecraft(data["data"]["version"], data["data"]["id"], { accesstoken: accountInfo["access_token"], username: accountInfo["username"], usertype: accountInfo["usertype"], uuid: accountInfo["uuid"], versiontype: "release" }, instancesDiv)
        }
    }
})

getInstancesList(instancesDiv)

const addaccount = document.getElementById("addaccount")

addaccount.addEventListener("click", () => {
    msaLogin()
})