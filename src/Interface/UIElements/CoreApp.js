const { app, BrowserWindow, getCurrentWindow } = require("@electron/remote")
const { generateInstanceBtn, getInstancesList, getInstanceData, makeInstanceLoading, refreshInstanceList } = require('../../Utils/HInstance')
const { filteredMinecraftVersions } = require("../../Utils/HVersions")
const NewInstance = require("../../App/NewInstance")
// const { startMinecraft } = require("../../App/InstanceLauncher")
const { msaLogin } = require("../../App/MicrosoftAuth")
const { getActiveAccount } = require("../../Utils/HMicrosoft")
const { startMinecraft } = require("../../App/StartMinecraft")
const Color = require("color")

const fs = require("fs/promises")

console.log("Initialisation du module principal !");

// Titlebar behaviour
const closeBtn = document.getElementById("close-btn")
const maximizeBtn = document.getElementById("minimize-btn")
const reducebtn = document.getElementById("reduce-btn")

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

// Add btn logic

refreshInstanceList()

// Content modif arch


async function main() {
    const contentTitle = document.getElementById("instance-title")
    const contentAuthor = document.getElementById("instance-author")

    const data = JSON.parse(await fs.readFile("C:\\Users\\tonib\\AppData\\Roaming\\burstylauncher\\instances\\Test05\\info.json"))

    contentTitle.innerText = data["name"]

    contentAuthor.innerText = data["author"]

    const widgetVersion = document.getElementById("widget-version")
    widgetVersion.innerText = data["version"]

    const widgetModloader = document.getElementById("widget-modloader")
    widgetModloader.innerText = data["modloader"]

    const widgetPlaytime = document.getElementById("widget-playtime")

    let h, m, s;
    const timeInMiliseconds = data["playtime"]

    h = Math.floor(timeInMiliseconds / 1000 / 60 / 60);
    m = Math.floor((timeInMiliseconds / 1000 / 60 / 60 - h) * 60);

    m < 10 ? m = `0${m}` : m = `${m}`
    h < 10 ? h = `0${h}` : h = `${h}`

    widgetPlaytime.innerText = `${h}h${m}`

    const widgetLastplayed = document.getElementById("widget-lastplayed") // Don't work
    widgetLastplayed.innerText = data["lastplayed"]

    const widgetDesc = document.getElementById("widget-description") // Write md rules
    widgetDesc.innerText = data["description"]

    const launchBtn = document.getElementById("launchbtn")
    launchBtn.style.backgroundColor = data["accentcolor"]

    const color = Color(data["accentcolor"])
    const newColor = color.darken(-.25).hex()

    contentAuthor.style.color = data["accentcolor"]

    launchBtn.style.border = `solid ${newColor}`
    launchBtn.style.boxShadow = `0 0 10px 1px ${data["accentcolor"]}`
}

main()