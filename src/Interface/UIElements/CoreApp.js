console.log("Initialisation du module principal !");
const { refreshInstanceList, updateInstanceDlProgress } = require("../../Utils/HInstance")

// Titlebar behaviour
require("./scripts/titlebar")

// Main window behaviour
require("./scripts/mainWin")

// Confirm btn
require("./scripts/newInstanceWin")

// Add btn logic
refreshInstanceList() // TODO Move that on loading screen

document.addEventListener("click", (e) => {
    
})

console.log("Initialisation effectué sans erreur !");