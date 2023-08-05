const { msaLogin } = require("../../../App/MicrosoftAuth")
const { accountList, changeAccountProperty } = require("../../../Utils/HMicrosoft")
const { refreshAccountBtnImg } = require("./mainWin")
const { closeWindow } = require("./window")

async function refreshAccountList() {
    const accounts = await accountList()

    if (accounts == null) {
        console.log("Can't refresh account list, no account found");
        return
    }

    const accountsList = document.getElementById("account-list")

    for (const account of accounts) {
        // Main checkbox
        const checkbox = document.createElement("div")
        checkbox.classList.add("checkbox")

        if (account["active"]) {
            checkbox.toggleAttribute("checked")
        }

        checkbox.setAttribute("account-id", account["uuid"])

        // Account profile image
        const profileImg = document.createElement("img")
        profileImg.src = `https://minotar.net/avatar/${account["uuid"]}`

        checkbox.appendChild(profileImg)

        const accountUsername = document.createElement("p")
        accountUsername.innerText = account["username"]
        checkbox.appendChild(accountUsername)

        accountsList.appendChild(checkbox)

        checkbox.addEventListener("click", async (e) => {
            const status = checkbox.hasAttribute("checked")

            if (status == false) {
                const activeAccount = accountsList.querySelector('.checkbox[checked]')

                checkbox.toggleAttribute("checked")
                activeAccount.toggleAttribute("checked")

                await changeAccountProperty(checkbox.getAttribute("account-id"), "active", checkbox.hasAttribute("checked"))
                await changeAccountProperty(activeAccount.getAttribute("account-id"), "active", activeAccount.hasAttribute("checked"))
            }

            refreshAccountBtnImg(checkbox.getAttribute("account-id"))
        })
    }
}

refreshAccountList()

const closeBtn = document.getElementById("close-account-manager-win")
closeBtn.addEventListener("click", (e) => { closeWindow("account-manager") })

const addAccount = document.getElementById("create-account-btn")
addAccount.addEventListener("click", async (e) => {
    const status = await msaLogin().then((val) => {
        console.log("ok");
        console.log(val);
    })

    console.log(status);

    if (status == true) {
        await refreshAccountList()
    } else {
        console.log("Authentification to the microsoft account cannot be established");
    }
})