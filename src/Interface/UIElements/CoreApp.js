const { initDiscordRPC } = require("../../App/DIscordRPC");
const { refreshInstanceList } = require("../../Utils/HInstance")

const loadingStartup = document.getElementById("loading-startup-launcher")
const menuBtn = document.getElementById("titlebar-menu-btns")

loadingStartup.style.display = "flex"
menuBtn.style.display = "none"

console.log("Initialize Modules");

console.log("[Initialize Modules] Titlebar module");
require("./scripts/titlebar")

console.log("[Initialize Modules] MainWin module");
require("./scripts/mainWin")

console.log("[Initialize Modules] New Instance Win module");
require("./scripts/newInstanceWin")

console.log("[Initialize Modules] ChooseVersionWin module");
require("./scripts/chooseVersionWin")

console.log("[Initialize Modules] Elements module");
require("./scripts/elements")

console.log("[Initialize Modules] AccountManagerWin module");
require("./scripts/accountManagerWin")

console.log("Update Instance List");
refreshInstanceList()

console.log("Initialize Discord RPC");
initDiscordRPC()

console.log("Refreshing Microsoft Account");
// Put logic here

loadingStartup.style.display = "none"
menuBtn.style.display = "flex"

console.log("Initialisation effectué sans erreur !")