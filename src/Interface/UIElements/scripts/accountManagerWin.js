const { msaLogin } = require("../../../App/MicrosoftAuth")
const { accountList, changeAccountProperty, getActiveAccount } = require("../../../Utils/HMicrosoft")
const { registerSelectorGroup } = require("./elements")
const { refreshAccountBtnImg } = require("./mainWin")
const { closeWindow } = require("./window")

// Fetch all saved account
exports.refreshAccountList = async () => {
    const accounts = await accountList()

    if (accounts == null) {
        console.log("Can't refresh account list, no account found");
        return
    }

    const accountsList = document.getElementById("account-list")
    accountsList.innerHTML = ""

    for (const account of accounts) {
        // Main checkbox
        const selector = document.createElement("div")
        selector.classList.add("selector")

        if (account["active"]) {
            selector.toggleAttribute("active", true)
        }

        selector.setAttribute("account-id", account["uuid"])

        // Account profile image
        const profileImg = document.createElement("img")
        profileImg.src = `https://minotar.net/avatar/${account["uuid"]}`

        selector.appendChild(profileImg)

        const accountUsername = document.createElement("p")
        accountUsername.innerText = account["username"]
        selector.appendChild(accountUsername)

        accountsList.appendChild(selector)

        const selectorParent = selector.parentElement
        registerSelectorGroup(selectorParent)

        selector.addEventListener("click", async () => {
            console.log(selector);

            await changeAccountProperty((await getActiveAccount()).uuid, "active", !selector.hasAttribute("active"))
            await changeAccountProperty(selector.getAttribute("account-id"), "active", selector.hasAttribute("active"))

            refreshAccountBtnImg(selector.getAttribute("account-id"))
        })
    }

    const activeAccount = await getActiveAccount()

    refreshAccountBtnImg(activeAccount.uuid)
}

// Close window
const closeBtn = document.getElementById("close-account-manager-win")
closeBtn.addEventListener("click", (e) => {
    closeWindow("account-manager")
})

// Add account btn
const addAccount = document.getElementById("create-account-btn")
addAccount.addEventListener("click", async (e) => {
    const status = await msaLogin()

    console.log(status);

    if (status == true) {
        await this.refreshAccountList()
    } else {
        console.error("Authentification to the microsoft account cannot be established. An error occured!");
    }
})