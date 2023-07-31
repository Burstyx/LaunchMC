const { openWindow } = require("./window")
const { startMinecraft } = require("../../../App/StartMinecraft")
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

    if (instanceState != InstanceState[InstanceState.Playable]) {
        console.log(("Instance is not in playable state"));
        return
    }

    const widgetVersion = document.getElementById("widget-version")
    const version = widgetVersion.innerText
    const versionType = widgetVersion.getAttribute("subname")


    // FIXME: MICROSOFT LOGIN SHOULD'NT BE HERE
    if (!existsSync(gamePath + "/microsoft_account.json"))
        await msaLogin()

    const data = JSON.parse(await fs.readFile(gamePath + "/microsoft_account.json"))

    await startMinecraft(version, currentInstance.id, { accesstoken: data["accounts"][0]["access_token"], username: data["accounts"][0]["username"], usertype: data["accounts"][0]["usertype"], uuid: data["accounts"][0]["uuid"], versiontype: versionType })
})