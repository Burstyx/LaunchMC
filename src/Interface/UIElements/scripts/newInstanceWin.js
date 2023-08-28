const { dialog, getCurrentWindow } = require("@electron/remote")
const { closeWindow, openWindow } = require("./window")
const { createInstance, setContentTo } = require("../../../Utils/HInstance")
const { v4 } = require("uuid")
const { downloadMinecraft, patchInstanceWithForge } = require("../../../App/DownloadGame")
const { getActiveAccount } = require("../../../Utils/HMicrosoft")

// Create new instance and start downloading
const createInstanceBtn = document.getElementById("create-instance-btn")

createInstanceBtn.addEventListener("click", async (e) => {
    // Fetch instance infos
    const userInstanceName = document.getElementById("new-instance-name").value
    const defaultInstanceName = document.getElementById("new-instance-name").getAttribute("placeholder")
    const version = document.getElementById("open-choose-version-win").getAttribute("version-id")
    const modloader = document.getElementById("open-choose-version-win").getAttribute("modloader-id")
    const versionType = document.getElementById("open-choose-version-win").getAttribute("subname")
    const imgPath = document.getElementById("backimg-new-instance").getAttribute("image-path")

    // Close window
    closeWindow("new-instance")

    // Set instance name to the default one if nothing has been entered by user
    let instanceName = userInstanceName
    if (instanceName == "") {
        instanceName = defaultInstanceName
    }

    const mcVersion = version.split("-")[0]

    // Create instance
    await createInstance(mcVersion, { accentColor: "#2596be", author: (await getActiveAccount()).uuid, id: instanceName, imagePath: imgPath, name: instanceName, versionType: versionType }, modloader == "forge" ? { id: version } : undefined)
    await setContentTo(instanceName)

    // Download Game and patch game with correct modloader
    if (modloader == "forge") {
        await downloadMinecraft(mcVersion, instanceName)
        await patchInstanceWithForge(instanceName, mcVersion, version)
    } else {
        await downloadMinecraft(version, instanceName)
    }
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