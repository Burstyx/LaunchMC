const {checkForUpdate, updateCli, updateAvailable, newVersion} = require("../../../App/Updater");

const checkUpdateBtn = document.getElementById("settings-check-update")

let updateFound = false
let isWorking = false
checkUpdateBtn.addEventListener("click", async () => {
    if(!isWorking) {
        isWorking = true
        if(updateFound) {
            await updateCli().catch((err) => {
                console.error(`Une erreur est survenue lors de la mise à jour: ${err}`)
            }).finally(() => isWorking = false)
        } else {
            await checkForUpdate().then((shouldBeUpdated) => {
                if(shouldBeUpdated) {
                    updateFound = true
                    checkUpdateBtn.querySelector("p").innerText = `Mettre à jour vers ${newVersion}`
                    checkUpdateBtn.classList.add("themed")
                }
            }).catch((err) => {
                console.error(`Une erreur est survenue lors de la vérification des mises à jour: ${err}`)
            }).finally(() => isWorking = false)
        }
    }
})

exports.initSettings = () => {
    if(updateAvailable) {
        checkUpdateBtn.querySelector("p").innerText = `Mettre à jour vers ${newVersion}`
        checkUpdateBtn.classList.add("themed")
        updateFound = true
    }
}