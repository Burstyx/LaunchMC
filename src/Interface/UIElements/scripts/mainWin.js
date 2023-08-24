const { openWindow } = require("./window")
const { startMinecraft, killGame } = require("../../../App/StartMinecraft")
const { InstanceState } = require("../../../Utils/HInstance")
const fs = require("fs/promises")
const { gamePath } = require("../../../Utils/const")
const { getActiveAccount } = require("../../../Utils/HMicrosoft")

// Open new instance window
const openCreateInstanceWinBtn = document.getElementById("open-create-instance-window")
openCreateInstanceWinBtn.addEventListener("click", (e) => {
    openWindow("new-instance")
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
        default:
            console.log("Can't do anything");
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

    await startMinecraft(mcVersion, currentInstance.id, { accesstoken: activeAccount.access_token, username: activeAccount.username, usertype: activeAccount.usertype, uuid: activeAccount.uuid, versiontype: versionType }, isForge ? { version: loaderVersion } : undefined)
})

// Open account manager window button
const openAccountManagerWinBtn = document.getElementById("open-account-manager-window")
openAccountManagerWinBtn.addEventListener("click", (e) => { openWindow("account-manager") })

exports.refreshAccountBtnImg = (uuid) => {
    if (uuid == undefined) {
        return
    }

    const profileImg = document.getElementById("profile-img")
    profileImg.src = `https://minotar.net/avatar/${uuid}`
}