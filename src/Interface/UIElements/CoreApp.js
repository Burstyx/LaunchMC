console.log("Initialisation du module principal !");
const { refreshInstanceList, updateInstanceDlProgress } = require("../../Utils/HInstance")

// Init custom elements behaviour
require("./scripts/elements")

// Titlebar behaviour
require("./scripts/titlebar")

// Main window behaviour
require("./scripts/mainWin")

// New instance window behaviour
require("./scripts/newInstanceWin")

// Choose version window behaviour
require("./scripts/chooseVersionWin")

// Account manager window behaviour
require("./scripts/accountManagerWin")

// Add btn logic
refreshInstanceList() // TODO Move that on loading screen

// Custom checkbox click detection

console.log("Initialisation effectué sans erreur !");