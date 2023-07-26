const { closeWindow } = require("./window")
const { createInstance, setContentTo } = require("../../../Utils/HInstance")
const { v4 } = require("uuid")
const { downloadMinecraft } = require("../../../App/DownloadGame")

// Create new instance and start downloading
const createInstanceBtn = document.getElementById("create-instance-btn")
const newInstanceName = document.getElementById("new-instance-name")

createInstanceBtn.addEventListener("click", async (e) => {
    const instanceName = newInstanceName.value

    // Création de l'instance
    const instanceId = v4()
    await createInstance("1.12.2", { accentColor: "#2596be", author: "You", id: instanceId, imagePath: "./resources/images/default.png", modloader: "vanilla", name: instanceName })
    await setContentTo(instanceId)

    // Close window
    closeWindow("new-instance")

    // Download Game
    await downloadMinecraft("1.12.2", instanceId)
})

// Close new instance window
const closeNewInstanceWin = document.getElementById("close-new-instance-win")

closeNewInstanceWin.addEventListener("click", (e) => {
    newInstanceName.value = ""

    closeWindow("new-instance")
})