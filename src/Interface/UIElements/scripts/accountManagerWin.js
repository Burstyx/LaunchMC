const { msaLogin } = require("../../../App/MicrosoftAuth")
const { accountList, changeAccountProperty, getActiveAccount } = require("../../../Utils/HMicrosoft")
const { registerSelectorGroup } = require("./elements")
const { refreshAccountBtnImg } = require("./mainWin")
const { closeWindow } = require("./window")

// Fetch all saved account
exports.refreshAccountList = async () => {
    await accountList((message, error, type) => {
        // FIXME Handle errors
    }).then(async (accounts) => {
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

                await getActiveAccount((message, error, type) => {
                    // FIXME Handle errors
                }).then(async (res) => {
                    await changeAccountProperty(res.uuid, "active", !selector.hasAttribute("active"), (message, error, type) => {
                        // FIXME HANDLE errors
                    })
                    await changeAccountProperty(selector.getAttribute("account-id"), "active", selector.hasAttribute("active"), (message, error, type) => {
                        // FIXME Handle errors
                    })

                    refreshAccountBtnImg(selector.getAttribute("account-id"))
                })
            })
        }

        await getActiveAccount((message, error, type) => {
            // FIXME Handle errors
        }).then((activeAccount) => {
            refreshAccountBtnImg(activeAccount.uuid)
        })
    })
}

const closeBtn = document.getElementById("close-account-manager-win")
closeBtn.addEventListener("click", (e) => {
    closeWindow("account-manager")
})

const addAccount = document.getElementById("create-account-btn")
addAccount.addEventListener("click", async (e) => {
    const status = await msaLogin()

    console.log(status);

    if (status === true) {
        await this.refreshAccountList()
    } else {
        console.error("Authentification to the microsoft account cannot be established. An error occured!");
    }
})