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


// Add btn logic
refreshInstanceList().then(() => { // TODO: Loading screen
    // LAST TO EXECUTE
    // Init custom elements behaviour
    require("./scripts/elements")
})

// Account manager window behaviour
require("./scripts/accountManagerWin")

console.log("Initialisation effectué sans erreur !")