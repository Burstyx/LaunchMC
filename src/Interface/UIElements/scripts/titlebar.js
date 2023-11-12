const { getCurrentWindow } = require("@electron/remote")
const {generateProfileBtn} = require("../../../Utils/HProfile");
const {refreshInstanceList} = require("../../../Utils/HInstance");

const closeBtn = document.getElementById("close-btn")
const maximizeBtn = document.getElementById("minimize-btn")
const reducebtn = document.getElementById("reduce-btn")

closeBtn.addEventListener("click", () => {
    getCurrentWindow().close()
})

maximizeBtn.addEventListener("click", () => {
    if (getCurrentWindow().isMaximized()) {
        getCurrentWindow().restore()
    }
    else {
        getCurrentWindow().maximize()
    }
})

reducebtn.addEventListener("click", () => {
    getCurrentWindow().minimize()
})

const discoverBtn = document.getElementById("discoverBtn")
discoverBtn.addEventListener("click", async () => {
    const activeElement = document.querySelector("#titlebar-menu-btns .active")
    activeElement.classList.remove("active")

    discoverBtn.classList.add("active")

    const tabsContent = document.getElementsByClassName("tabcontent")
    for (let e of tabsContent) {
        e.style.display = "none"
    }

    const discoverTab = document.getElementById("discover-menu")
    discoverTab.style.display = "flex"

    await generateProfileBtn()
})

const instancesBtn = document.getElementById("instancesBtn")
instancesBtn.addEventListener("click", async () => {
    const activeElement = document.querySelector("#titlebar-menu-btns .active")
    activeElement.classList.remove("active")

    instancesBtn.classList.add("active")

    const tabsContent = document.getElementsByClassName("tabcontent")
    for (let e of tabsContent) {
        e.style.display = "none"
    }

    const instanceTab = document.getElementById("instance-menu")
    instanceTab.style.display = "flex"

    await refreshInstanceList()
})