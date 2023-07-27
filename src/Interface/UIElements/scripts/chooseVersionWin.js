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

            versionsList.appendChild(versionsElement)
        }
    })
}

refreshInstanceList()

document.getElementById("close-choose-version-win").addEventListener("click", (e) => {
    closeWindow("choose-version")
})