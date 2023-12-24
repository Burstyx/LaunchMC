const {checkForUpdate, updateCli, updateAvailable, newVersion} = require("../../../App/Updater");
const {accountList, getActiveAccount} = require("../../../Utils/HMicrosoft");
const {msaLogin} = require("../../../App/MicrosoftAuth");
const {addNotification} = require("./notification");
const {getCurrentWindow} = require("@electron/remote");

const checkUpdateBtn = document.getElementById("settings-check-update")

let updateFound = false
let isWorking = false
checkUpdateBtn.addEventListener("click", async () => {
    const loadingImg = document.createElement("img")
    loadingImg.setAttribute("src", "./resources/svg/loading.svg")
    loadingImg.setAttribute("width", "25px")

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
                }
            }).catch((err) => {
                addNotification(`Une erreur est survenue lors de la vérification des mises à jour.`, "error", err)
            }).finally(() => {
                checkUpdateBtn.lastChild.remove()
                isWorking = false
            })
        }
    }
})

const msAccountList = document.getElementById("ms-accounts-list")
exports.initSettings = async () => {
    // Check for accounts
    await refreshAccountList()

    // Check for update
    if(updateAvailable) {
        checkUpdateBtn.querySelector("p").innerText = `Mettre à jour vers ${newVersion}`
        checkUpdateBtn.classList.add("themed")
        updateFound = true
    }
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
            const username = document.createElement("p")

            accBtn.classList.add("text-button")
            accBtn.toggleAttribute("active", activeAccountUuid === account["uuid"])

            accImg.setAttribute("src", `https://minotar.net/avatar/${account["username"]}`)
            username.innerText = account["username"]

            accBtn.append(accImg, username)

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