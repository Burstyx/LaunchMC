const { msaLogin } = require("../../../App/MicrosoftAuth")
const { accountList } = require("../../../Utils/HMicrosoft")
const { closeWindow } = require("./window")

async function refreshAccountList() {
    const accounts = await accountList()

    const accountsList = document.getElementById("account-list")

    for (const account of accounts) {
        // Main checkbox
        const checkbox = document.createElement("div")
        checkbox.classList.add("checkbox")
        checkbox.setAttribute("checked", account["active"] ? "true" : "false")
        checkbox.setAttribute("account-id", account["uuid"])

        // Account profile image
        const profileImg = document.createElement("img")
        profileImg.src = `https://minotar.net/avatar/${account["uuid"]}`

        checkbox.appendChild(profileImg)

        const accountUsername = document.createElement("p")
        accountUsername.innerText = account["username"]
        checkbox.appendChild(accountUsername)

        accountsList.appendChild(checkbox)
    }
}


refreshAccountList()

const closeBtn = document.getElementById("close-account-manager-win")
closeBtn.addEventListener("click", (e) => { closeWindow("account-manager") })

const addAccount = document.getElementById("create-account-btn")
addAccount.addEventListener("click", async (e) => { await msaLogin() })