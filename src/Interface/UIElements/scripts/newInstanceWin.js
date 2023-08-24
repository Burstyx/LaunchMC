const { dialog, getCurrentWindow } = require("@electron/remote")
const { closeWindow, openWindow } = require("./window")
const { createInstance, setContentTo } = require("../../../Utils/HInstance")
const { v4 } = require("uuid")
const { downloadMinecraft } = require("../../../App/DownloadGame")

// Create new instance and start downloading
const createInstanceBtn = document.getElementById("create-instance-btn")

createInstanceBtn.addEventListener("click", async (e) => {
    const userInstanceName = document.getElementById("new-instance-name").value
    const version = document.getElementById("open-choose-version-win").getAttribute("version-id")
    const modloader = document.getElementById("open-choose-version-win").getAttribute("modloader-id")
    const versionType = document.getElementById("open-choose-version-win").getAttribute("subname")

    let instanceName = userInstanceName

    if (instanceName == "") {
        instanceName = version
    }

    const background = document.getElementById("backimg-new-instance")
    const imgPath = background.getAttribute("image-path")

    console.log(imgPath);

    // Création de l'instance
    await createInstance(version, { accentColor: "#2596be", author: "You", id: instanceName, imagePath: imgPath, modloader: modloader, name: instanceName, versionType: versionType })
    await setContentTo(instanceName)

    // Close window
    closeWindow("new-instance")

    // Download Game
    await downloadMinecraft(version, instanceName)
})

// Close new instance window
const closeNewInstanceWin = document.getElementById("close-new-instance-win")

closeNewInstanceWin.addEventListener("click", (e) => {
    document.getElementById("new-instance-name").value = ""

    closeWindow("new-instance")
})

// Open choose version window
const openChooseVersionWin = document.getElementById("open-choose-version-win")

openChooseVersionWin.addEventListener("click", (e) => {
    openWindow("choose-version")
})

// Change image
const changeInstanceImage = document.getElementById("change-instance-image")

changeInstanceImage.addEventListener("click", (e) => {
    const selectedImages = dialog.showOpenDialogSync(getCurrentWindow(), { title: "Select the new instance background", filters: [{ name: "Image", extensions: ["png", "jpg"] }], properties: ["openFile"] })

    if (selectedImages === undefined) {
        console.log("Action canceled");
        return
    }

    const imagePath = selectedImages[0].replace(/\\/g, '/')

    const background = document.getElementById("backimg-new-instance")
    background.style.setProperty("background", `url('${imagePath}') 50% center / cover`)
    console.log(background.style.background);
    background.setAttribute("image-path", imagePath)
})