const { minecraftManifest } = require("../../../Utils/HManifests")
const { closeWindow } = require("./window")

// Inputs
const filterRelease = document.getElementById("vanilla-version-filter-release")
const filterSnapshot = document.getElementById("vanilla-version-filter-snapshot")
const filterBeta = document.getElementById("vanilla-version-filter-beta")
const filterAlpha = document.getElementById("vanilla-version-filter-alpha")
const search = document.getElementById("vanilla-version-filter-search")

// Fetch Minecraft versions depending on applied filters
const versionsList = document.getElementById("vanilla-versions-list")
exports.refreshVersionList = () => {
    minecraftManifest().then((val) => {
        const filterReleaseCheck = filterRelease.hasAttribute("checked")
        const filterSnapshotCheck = filterSnapshot.hasAttribute("checked")
        const filterBetaCheck = filterBeta.hasAttribute("checked")
        const filterAlphaCheck = filterAlpha.hasAttribute("checked")
        const searchVal = search.value

        versionsList.innerHTML = ""

        for (const version of val.versions) {
            if (version.type == "release" && filterReleaseCheck == false) {
                continue
            }
            if (version.type == "snapshot" && filterSnapshotCheck == false) {
                continue
            }
            if (version.type == "old_beta" && filterBetaCheck == false) {
                continue
            }
            if (version.type == "old_alpha" && filterAlphaCheck == false) {
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

// Refresh version list when updating filters
document.querySelectorAll(".version-filters .checkbox").forEach((btn) => {
    btn.addEventListener("click", (e) => {
        this.refreshVersionList()
    })
})

// Refresh version list when searching
document.getElementById("vanilla-version-filter-search").addEventListener("input", (e) => {
    this.refreshVersionList()
})

// Close window and reset inputs
document.getElementById("close-choose-version-win").addEventListener("click", (e) => {
    closeWindow("choose-version")

    filterRelease.toggleAttribute("checked", true)
    filterSnapshot.toggleAttribute("checked", false)
    filterBeta.toggleAttribute("checked", false)
    filterAlpha.toggleAttribute("checked", false)
    search.value = ""
})