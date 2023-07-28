const { dialog, getCurrentWindow } = require("@electron/remote")
const { minecraftManifest } = require("../../../Utils/HManifests")
const { closeWindow } = require("./window")

// Get versions list div
const versionsList = document.getElementById("vanilla-versions-list")

document.querySelectorAll(".version-filters .checkbox").forEach((btn) => {
    btn.addEventListener("click", (e) => {
        refreshInstanceList()
    })
})

document.getElementById("vanilla-version-filter-search").addEventListener("input", (e) => {
    refreshInstanceList()
})

function refreshInstanceList() {
    minecraftManifest().then((val) => {
        const filterReleaseCheck = document.getElementById("vanilla-version-filter-release").getAttribute("checked")
        const filterSnapshotCheck = document.getElementById("vanilla-version-filter-snapshot").getAttribute("checked")
        const filterBetaCheck = document.getElementById("vanilla-version-filter-beta").getAttribute("checked")
        const filterAlphaCheck = document.getElementById("vanilla-version-filter-alpha").getAttribute("checked")
        const searchVal = document.getElementById("vanilla-version-filter-search").value

        versionsList.innerHTML = ""

        for (const version of val.versions) {
            if (version.type == "release" && filterReleaseCheck == "false") {
                continue
            }
            if (version.type == "snapshot" && filterSnapshotCheck == "false") {
                continue
            }
            if (version.type == "old_beta" && filterBetaCheck == "false") {
                continue
            }
            if (version.type == "old_alpha" && filterAlphaCheck == "false") {
                continue
            }
            if (!version.id.toString().includes(searchVal) && searchVal != "") {
                continue
            }

            const versionsElement = document.createElement("div")
            versionsElement.classList.add("img-btn", "interactable")
            versionsElement.style.backgroundImage = `linear-gradient(90deg, black 0%, rgba(0, 0, 0, 0) 100%), url(./resources/images/default.png)`
            versionsElement.innerText = version.id

            versionsElement.addEventListener("click", (e) => {
                const modloaderWidget = document.getElementById("open-choose-version-win")
                modloaderWidget.setAttribute("version-id", version.id)
                modloaderWidget.setAttribute("subname", version.type)
                modloaderWidget.innerText = version.id

                closeWindow("choose-version")
            })

            versionsList.appendChild(versionsElement)
        }
    })
}

refreshInstanceList()

document.getElementById("close-choose-version-win").addEventListener("click", (e) => {
    closeWindow("choose-version")
})

const changeInstanceImage = document.getElementById("change-instance-image")

changeInstanceImage.addEventListener("click", (e) => {
    const newPath = dialog.showOpenDialogSync(getCurrentWindow(), { title: "Select the new instance background", filters: [{ name: "Image", extensions: ["png", "jpg"] }], properties: ["openFile"] })

    if (newPath === undefined) {
        console.log("Action canceled");
        return
    }


    const background = document.getElementById("backimg-new-instance")
    background.style.background = `url('${newPath}')`
    background.setAttribute("image-path", newPath)
})