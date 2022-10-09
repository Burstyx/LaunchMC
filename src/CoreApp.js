const { app, BrowserWindow, getCurrentWindow } = require("@electron/remote")
const { generateInstanceBtn } = require('./utils/instanceManager')
const { getMinecraftVersions } = require("./managers/fetchBootloaderVersions")
const { downloadVanillaVersion } = require("./managers/minecraftDownloader")
const { startMinecraft } = require("./managers/startInstance")

console.log("Initialisation du module principal !");

// Variables souvent utilisé
const clickavoider = document.getElementById("clickavoider")

// Variables globals
let elementToCloseWhenClickingOnClickAvoider = null;

// Boutons menu titre
const closeBtn = document.getElementById("close")
const maximizeBtn = document.getElementById("maximize")
const reducebtn = document.getElementById("reduce")

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

// Logique du click avoider
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

// Boutons barre d'outils

// Logique du menu add

const cancelBtn = document.getElementById("addmenucancelbtn")
const closeAddMenuBtn = document.getElementById("closeaddmenu")
const createAddMenuBtn = document.getElementById("addmenucreatebtn")
const instanceVersionAddMenuText = document.getElementById("instanceversionselectedversion")
const instanceVersion = document.getElementById("instanceversion")
const instancesDiv = document.getElementById("instances")
const instanceName = document.getElementById("instancenameinput")

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

    // element = generateInstanceBtn("https://i.ytimg.com/vi/CJOFD9eZXig/maxresdefault.jpg", "Holycuba")

    // // Add element to the page
    // instancesDiv.appendChild(element)
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

createAddMenuBtn.addEventListener("click", () => {
    if (instanceName.value != "") {
        console.log("nom donné : " + instanceName.value);
        downloadVanillaVersion(selectedVersion, instanceName.value)
    } else {
        console.log("nom non donné donc nom automatiquement donné : " + instanceName.getAttribute("placeholder"));
        downloadVanillaVersion(selectedVersion, instanceName.getAttribute("placeholder"))
    }

})

const vanillareleasecheckbox = document.getElementById("vanillareleasecheckbox")
const vanillasnapshotcheckbox = document.getElementById("vanillasnapshotcheckbox")
const vanillabetacheckbox = document.getElementById("vanillabetacheckbox")
const vanillaalphacheckbox = document.getElementById("vanillaalphacheckbox")

const versionslist = document.getElementById("vanillaversionslist")

const vanillabootloaderinfoslist = document.getElementById("vanillabootloaderinfoslist")

const loadingVanillaVersions = document.getElementById("loadingbootloaderversions")
const notfoundbootloaderversions = document.getElementById("notfoundbootloaderversions")

instanceVersion.addEventListener("click", () => {
    choseVersionMenu.style.opacity = "1"
    choseVersionMenu.style.pointerEvents = "all"

    clearVanillaVersions()
    getMinecraftVersions(vanillabootloaderinfoslist, loadingVanillaVersions, notfoundbootloaderversions, vanillareleasecheckbox.checked, vanillasnapshotcheckbox.checked, vanillabetacheckbox.checked, vanillaalphacheckbox.checked)

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

vanillareleasecheckbox.addEventListener("change", () => {
    clearVanillaVersions()
    getMinecraftVersions(vanillabootloaderinfoslist, loadingVanillaVersions, notfoundbootloaderversions, vanillareleasecheckbox.checked, vanillasnapshotcheckbox.checked, vanillabetacheckbox.checked, vanillaalphacheckbox.checked)
})

vanillasnapshotcheckbox.addEventListener("change", () => {
    clearVanillaVersions()
    getMinecraftVersions(vanillabootloaderinfoslist, loadingVanillaVersions, notfoundbootloaderversions, vanillareleasecheckbox.checked, vanillasnapshotcheckbox.checked, vanillabetacheckbox.checked, vanillaalphacheckbox.checked)
})

vanillabetacheckbox.addEventListener("change", () => {
    clearVanillaVersions()
    getMinecraftVersions(vanillabootloaderinfoslist, loadingVanillaVersions, notfoundbootloaderversions, vanillareleasecheckbox.checked, vanillasnapshotcheckbox.checked, vanillabetacheckbox.checked, vanillaalphacheckbox.checked)
})

vanillaalphacheckbox.addEventListener("change", () => {
    clearVanillaVersions()
    getMinecraftVersions(vanillabootloaderinfoslist, loadingVanillaVersions, notfoundbootloaderversions, vanillareleasecheckbox.checked, vanillasnapshotcheckbox.checked, vanillabetacheckbox.checked, vanillaalphacheckbox.checked)
})

// Chosing version

function closeChooseVersionMenu() {
    // Fermer le menu
    choseVersionMenu.style.opacity = "0"
    choseVersionMenu.style.pointerEvents = "none"

    clickavoider.style.zIndex = "1"

    elementToCloseWhenClickingOnClickAvoider = addMenu
}

document.addEventListener("click", (evt) => {
    const elementClicked = evt.target
    console.log(elementClicked.parentElement.classList.item(0));
    if (elementClicked.parentElement.classList.item(0) == "vanillabootloaderinformation") {
        let versionFound = elementClicked.parentElement.id.toString().substring(8)
        chosenVersion = "vanilla-" + versionFound
        closeChooseVersionMenu()
        refreshInstanceVersion()
    }
})