const { closeWindow, openWindow } = require("./window")
const { createInstance, setContentTo } = require("../../../Utils/HInstance")
const { v4 } = require("uuid")
const { downloadMinecraft } = require("../../../App/DownloadGame")

// Create new instance and start downloading
const createInstanceBtn = document.getElementById("create-instance-btn")

createInstanceBtn.addEventListener("click", async (e) => {
    const userInstanceName = document.getElementById("new-instance-name").value
    const version = document.getElementById("open-choose-version-win").getAttribute("version-id")
    const modloader = document.getElementById("open-choose-modloader-win").getAttribute("modloader-id")

    let instanceName = userInstanceName

    if(instanceName == "") {
        instanceName = version
    }

    // Création de l'instance
    const instanceId = v4()
    await createInstance(version, { accentColor: "#2596be", author: "You", id: instanceId, imagePath: "./resources/images/default.png", modloader: modloader, name: instanceName })
    await setContentTo(instanceId)

    // Close window
    closeWindow("new-instance")

    // Download Game
    await downloadMinecraft(version, instanceId)
})

// Close new instance window
const closeNewInstanceWin = document.getElementById("close-new-instance-win")

closeNewInstanceWin.addEventListener("click", (e) => {
    newInstanceName.value = ""

    closeWindow("new-instance")
})

// Open choose version window
const openChooseVersionWin = document.getElementById("open-choose-version-win")

openChooseVersionWin.addEventListener("click", (e) => {
    openWindow("choose-version")
})