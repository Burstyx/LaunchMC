console.log("Initialisation du module principal !");
const { refreshInstanceList } = require("../../Utils/HInstance")

// Titlebar behaviour
require("./scripts/titlebar")

// Main window behaviour
require("./scripts/mainWin")

// Confirm btn
require("./scripts/newInstanceWin")

// Add btn logic
refreshInstanceList() // TODO Move that on loading screen

console.log("Initialisation effectué sans erreur !");