const { app, BrowserWindow, getCurrentWindow } = require("@electron/remote")
const { generateInstanceBtn } = require('./utils/instanceManager')
const { getVanillaReleaseVersions } = require("./managers/fetchBootloaderVersions")

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

    console.log(elementToCloseWhenClickingOnClickAvoider);

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


const addBtn = document.getElementById("add")

function refreshInstanceVersion() {
    selectedVersion = chosenVersion.split('-')
    if (selectedVersion[0] == "vanilla") {
        instanceVersionAddMenuText.innerText = "Vanilla - " + selectedVersion[1]
    }
    else if (selectedVersion[0] == "forge") {
        instanceVersionAddMenuText.innerText = "Forge - " + selectedVersion[1]
    }
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
    selectedVersion = chosenVersion.split('-')
    if (instanceName.value != "") {
        console.log("nom donné : " + instanceName.value);
    } else {
        console.log("nom non donné donc nom automatiquement donné : " + instanceName.getAttribute("placeholder"));
    }
})

instanceVersion.addEventListener("click", () => {
    choseVersionMenu.style.opacity = "1"
    choseVersionMenu.style.pointerEvents = "all"

    refreshList()

    clickavoider.style.zIndex = 2

    elementToCloseWhenClickingOnClickAvoider = choseVersionMenu
})

// Show all Vanilla versions

const bootloaderversion = document.getElementById("bootloaderversion")
const bootloaderversionstate = document.getElementById("bootloaderversionstate")
const versionslist = document.getElementById("vanillaversionslist")

function refreshList() {
    getVanillaReleaseVersions(vanillaversionslist, true, true, false, false)
}