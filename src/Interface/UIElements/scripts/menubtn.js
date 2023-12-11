const {addServerInstancesTo} = require("../../../App/ServerInstances");

const home = document.getElementById("home")
const library = document.getElementById("library")
const servers = document.getElementById("servers")

const grHome = document.getElementById("gr-discover")
const grLibrary = document.getElementById("gr-library")
const grServers = document.getElementById("gr-servers")

let activeBtn = library
let activeGroup = grLibrary;

home.addEventListener("click", () => {
    activeGroup.style.display = "none";
    grHome.style.display = "block";

    activeGroup = grHome

    activeBtn.toggleAttribute("active", false)
    home.toggleAttribute("active", true)

    activeBtn = home
})

library.addEventListener("click", () => {
    activeGroup.style.display = "none";
    grLibrary.style.display = "block";

    // Refresh Instance List

    activeGroup = grLibrary

    activeBtn.toggleAttribute("active", false)
    library.toggleAttribute("active", true)

    activeBtn = library
})

servers.addEventListener("click", async () => {
    activeGroup.style.display = "none";
    grServers.style.display = "block";

    // Refresh Servers List

    activeGroup = grServers;

    activeBtn.toggleAttribute("active", false)
    servers.toggleAttribute("active", true)

    activeBtn = servers

    await addServerInstancesTo()
})