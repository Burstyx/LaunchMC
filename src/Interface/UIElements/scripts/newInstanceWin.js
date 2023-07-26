const { closeWindow } = require("./window")
const { createInstance } = require("../../../Utils/HInstance")
const { v4 } = require("uuid")

// Create new instance and start downloading
const createInstanceBtn = document.getElementById("create-instance-btn")
const newInstanceName = document.getElementById("new-instance-name")

createInstanceBtn.addEventListener("click", async (e) => {
    const instanceName = newInstanceName.value

    // Création de l'instance
    const instanceId = v4()
    await createInstance("1.12.2", { accentColor: "#2596be", author: "You", id: instanceId, imagePath: "./resources/images/default.png", modloader: "vanilla", name: instanceName })

    // Close window
    closeWindow("new-instance")
})

// Close new instance window
const closeNewInstanceWin = document.getElementById("close-new-instance-win")

closeNewInstanceWin.addEventListener("click", (e) => {
    newInstanceName.value = ""

    closeWindow("new-instance")
})