const { openWindow } = require("./window")
const { startMinecraft, killGame } = require("../../../App/StartMinecraft")
const { InstanceState, convertProfileToInstance} = require("../../../Utils/HInstance")
const fs = require("fs/promises")
const { gamePath } = require("../../../Utils/const")
const { getActiveAccount } = require("../../../Utils/HMicrosoft")
const {dialog} = require("@electron/remote")

// Open new instance window
const openCreateInstanceWinBtn = document.getElementById("open-create-instance-window")
openCreateInstanceWinBtn.addEventListener("click", (e) => {
    openWindow("new-instance")
})

// Import json profile file
const openImportProfileCtxDialog = document.getElementById("open-import-profile-ctxdialog")

openImportProfileCtxDialog.addEventListener("click", async (e) => {
    const result = await dialog.showOpenDialog({properties: ['openFile']})
    if(result !== undefined) await convertProfileToInstance(result.filePaths[0])
})

// Launch instance button
const launchBtn = document.getElementById("launchbtn")
launchBtn.addEventListener("click", async () => {
    const instanceList = document.getElementById("instance-list")
    const currentInstance = instanceList.querySelector(".active")
    const instanceState = currentInstance.getAttribute("state")
    const instanceId = currentInstance.id

    switch (instanceState) {
        case InstanceState[InstanceState.Playing]:
            killGame(instanceId)
            return;
        case InstanceState[InstanceState.Downloading]:
            console.log("Downloading, can't do anything!");
            return;
        case InstanceState[InstanceState.Update]:
            console.log("Updating...");
            return;
        case InstanceState[InstanceState.Loading]:
            console.log("Already launching!");
            return;
        case InstanceState[InstanceState.Patching]:
            console.log("Patching instance, can't do anything");
            return;
        case InstanceState[InstanceState.DLResources]:
            console.log("Downloading resources, can't do anything");
            return;
        case InstanceState[InstanceState.Verification]:
            console.log("Verifying installation, wait");
            return;
    }

    // Fetch instance game version and type
    const widgetVersion = document.getElementById("widget-version")
    const mcVersion = widgetVersion.innerText
    const versionType = widgetVersion.getAttribute("subname").toLowerCase()

    // Fetch instance used loader
    const widgetLoader = document.getElementById("widget-modloader")
    const loaderName = widgetLoader.innerText.toLowerCase()
    const loaderVersion = widgetLoader.getAttribute("subname")?.toLowerCase()

    console.log("Loaderver: " + loaderVersion);

    const isForge = loaderName === "forge"
    const isFabric = loaderName === "fabric"
    const isQuilt = loaderName === "quilt"

    const data = JSON.parse(await fs.readFile(gamePath + "/microsoft_account.json"))

    const activeAccount = await getActiveAccount()

    await startMinecraft(mcVersion, currentInstance.id, { accesstoken: activeAccount.access_token, username: activeAccount.username, usertype: activeAccount.usertype, uuid: activeAccount.uuid, versiontype: versionType }, isForge ? { id: loaderVersion } : undefined)
})

// Open account manager window button
const openAccountManagerWinBtn = document.getElementById("open-account-manager-window")
openAccountManagerWinBtn.addEventListener("click", (e) => { openWindow("account-manager") })

exports.refreshAccountBtnImg = (uuid) => {
    console.log(uuid);
    if (uuid === undefined) {
        return
    }


    const profileImg = document.getElementById("profile-img")
    profileImg.src = `https://minotar.net/avatar/${uuid}`
}