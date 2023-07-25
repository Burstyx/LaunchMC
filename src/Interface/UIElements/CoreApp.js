console.log("Initialisation du module principal !");
const { createInstance, refreshInstanceList } = require("../../Utils/HInstance")
const { v4 } = require("uuid")

// Titlebar behaviour
require("./scripts/titlebar")

// Add btn logic
refreshInstanceList() // TODO Move that on loading screen

// Create instance
const openCreateInstanceWinBtn = document.getElementById("open-create-instance-window")
const subWindow = document.getElementById("sub-windows")

const windows = document.querySelectorAll(".window")

openCreateInstanceWinBtn.addEventListener("click", (e) => {
    console.log("sdf");
    subWindow.style.opacity = "1"
    subWindow.style.pointerEvents = "all"

    windows.forEach((window) => {
        if (window.getAttribute("window-id") === "new-instance") {
            console.log("yeah");
            window.style.opacity = "1"
            window.style.transform = "scale(1)"
        }
    })
})

// Confirm btn
const createInstanceBtn = document.getElementById("create-instance-btn")
const newInstanceName = document.getElementById("new-instance-name")



createInstanceBtn.addEventListener("click", async (e) => {
    const instanceName = newInstanceName.value
    // Création de l'instance
    const instanceId = v4()
    await createInstance("1.12.2", { accentColor: "#2596be", author: "You", description: "No Description", id: instanceId, imagePath: "", modloader: "vanilla", name: instanceName })
    // Close window
    // TEMP START
    subWindow.style.opacity = "0"
    subWindow.style.pointerEvents = "none"

    windows.forEach((window) => {
        if (window.getAttribute("window-id") === "new-instance") {
            window.style.opacity = "0"
            window.style.transform = "scale(.5)"
        }
    })
    // TEMP END (TO DELETE)
})

console.log("Initialisation effectué sans erreur !");