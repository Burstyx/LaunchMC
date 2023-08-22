const { openWindow } = require("./window")
const { startMinecraft, killGame } = require("../../../App/StartMinecraft")
const { InstanceState } = require("../../../Utils/HInstance")
const { msaLogin } = require("../../../App/MicrosoftAuth")
const fs = require("fs/promises")
const { gamePath } = require("../../../Utils/const")
const { existsSync } = require("fs")

// Open new instance window button
const openCreateInstanceWinBtn = document.getElementById("open-create-instance-window")
openCreateInstanceWinBtn.addEventListener("click", (e) => { openWindow("new-instance") })

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

    const widgetVersion = document.getElementById("widget-version")
    const version = widgetVersion.innerText
    const versionType = widgetVersion.getAttribute("subname")

    const data = JSON.parse(await fs.readFile(gamePath + "/microsoft_account.json"))

    await startMinecraft("1.18.2", currentInstance.id, { accesstoken: data["accounts"][0]["access_token"], username: data["accounts"][0]["username"], usertype: data["accounts"][0]["usertype"], uuid: data["accounts"][0]["uuid"], versiontype: "release" }, { version: "40.2.10" })
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