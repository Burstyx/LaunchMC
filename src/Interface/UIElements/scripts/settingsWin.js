const {checkForUpdate, updateCli, updateAvailable, newVersion} = require("../../../App/Updater");
const {accountList, getActiveAccount} = require("../../../Utils/HMicrosoft");
const {msaLogin} = require("../../../App/MicrosoftAuth");
const {addNotification} = require("./notification");
const {getCurrentWindow} = require("@electron/remote");
const {totalmem, freemem} = require("os")
const {setSetting, getSetting} = require("../../../Utils/Options");
const {mcFullscreen, discordRpcSetting, gameRam, mcWidth, mcHeight} = require("../../../Utils/const");
const {logs} = require("../../../App/StartMinecraft");

const checkUpdateBtn = document.getElementById("settings-check-update")

let updateFound = false
let isWorking = false
checkUpdateBtn.addEventListener("click", async () => {
    const loadingImg = document.createElement("img")
    loadingImg.setAttribute("src", "./resources/svg/loading.svg")
    loadingImg.setAttribute("width", "20px")

    if(!isWorking) {
        checkUpdateBtn.append(loadingImg)
        isWorking = true
        if(updateFound) {
            await updateCli().catch((err) => {
                addNotification(`Une erreur est survenue lors de la mise à jour.`, "error", err)
            }).finally(() => isWorking = false)
        } else {
            await checkForUpdate().then((shouldBeUpdated) => {
                if(shouldBeUpdated) {
                    updateFound = true
                    checkUpdateBtn.querySelector("p").innerText = `Mettre à jour vers ${newVersion}`
                    checkUpdateBtn.classList.add("themed")
                } else {
                    addNotification(`Aucune mise à jour trouvée.`, "info", undefined)
                }
            }).catch((err) => {
                addNotification(`Une erreur est survenue lors de la vérification des mises à jour.`, "error", err)
            }).finally(() => {
                isWorking = false
            })
        }
    }
})

const discordRpc = document.getElementById("cb-discordrpc")
const gameWidth = document.getElementById("game-width")
const gameHeight = document.getElementById("game-height")
const allocatedRam = document.getElementById("range-allocated-ram")

discordRpc.addEventListener("change", async () => await setSetting("discord_rpc", discordRpc.checked))
allocatedRam.addEventListener("change", async () => await setSetting("game_allocated_ram", allocatedRam.value))
gameWidth.addEventListener("change",async () => await setSetting("game_window_width", gameWidth.value))
gameHeight.addEventListener("change", async () => await setSetting("game_window_height", gameHeight.value))

const msAccountList = document.getElementById("ms-accounts-list")
const rangeAllocatedRam = document.getElementById("range-allocated-ram")
exports.initSettings = async () => {
    // Check for accounts
    await refreshAccountList()

    // Check for update
    if(updateAvailable) {
        checkUpdateBtn.innerText = `Mettre à jour vers ${newVersion}`
        checkUpdateBtn.classList.add("themed")
        updateFound = true
    }

    // Set how many ram can be allocated
    const totalGo = Math.round(totalmem() / 1_073_741_824) * 1024
    rangeAllocatedRam.max = `${totalGo}`
    rangeAllocatedRam.value = await getSetting("game_allocated_ram", gameRam).catch((err) => console.log("ram"))
    rangeAllocatedRam.dispatchEvent(new Event("input"))

    discordRpc.checked = await getSetting("discord_rpc", discordRpcSetting).catch((err) => console.log("discord rpc"))
    gameWidth.value = await getSetting("game_window_width", mcWidth).catch((err) => console.log("window width"))
    gameHeight.value = await getSetting("game_window_height", mcHeight).catch((err) => console.log("window height"))
}

async function refreshAccountList() {
    msAccountList.innerHTML = ""
    await accountList().then(async (accounts) => {
        let activeAccountUuid;
        await getActiveAccount().then((acc) => {
            activeAccountUuid = acc["uuid"]
        }).catch((err) => addNotification(`Une erreur est survenue lors de la récupération du compte microsoft actif.<`, "error", err))

        for(const account of accounts) {
            const accBtn = document.createElement("div")
            const accImg = document.createElement("img")

            accBtn.classList.add("text-button")
            accBtn.toggleAttribute("active", activeAccountUuid === account["uuid"])

            accImg.setAttribute("src", `https://minotar.net/avatar/${account["username"]}`)

            accBtn.append(accImg, account["username"])

            msAccountList.append(accBtn)
        }
    }).catch((err) => {
        addNotification(`Une erreur est survenue lors de la récupération des comptes.`, "error", err)
    })
}

const addAccount = document.getElementById("ms-add-account")
addAccount.addEventListener("click", async () => {
    await msaLogin().then(async () => {
        console.log(`Un compte Microsoft a été ajouté`)
        await refreshAccountList()
    }).catch((err) => {
        addNotification(`Une erreur est survenue lors de la connexion à un compte Microsoft.`, "error", err)
    })
})

const openDevTool = document.getElementById("open-devtools")
openDevTool.addEventListener("click", () => {
    getCurrentWindow().webContents.openDevTools({mode: "undocked"})
})