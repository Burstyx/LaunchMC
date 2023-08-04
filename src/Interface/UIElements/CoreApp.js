console.log("Initialisation du module principal !");
const { refreshInstanceList, updateInstanceDlProgress } = require("../../Utils/HInstance")


// Titlebar behaviour
require("./scripts/titlebar")

// Main window behaviour
require("./scripts/mainWin")

// New instance window behaviour
require("./scripts/newInstanceWin")

// Choose version window behaviour
require("./scripts/chooseVersionWin")

// Init custom elements behaviour
require("./scripts/elements")

// Add btn logic
refreshInstanceList()

// Account manager window behaviour
require("./scripts/accountManagerWin")

console.log("Initialisation effectué sans erreur !")