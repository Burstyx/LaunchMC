const { minecraftManifest, forgeManifest, forgeVerStateManifest } = require("../../../Utils/HManifests")
const { closeWindow } = require("./window")

// Inputs
const filterRelease = document.getElementById("vanilla-version-filter-release")
const filterSnapshot = document.getElementById("vanilla-version-filter-snapshot")
const filterBeta = document.getElementById("vanilla-version-filter-beta")
const filterAlpha = document.getElementById("vanilla-version-filter-alpha")
const search = document.getElementById("vanilla-version-filter-search")

const forgeFilterShowAll = document.getElementById("forge-version-filter-showall")
const forgeSearch = document.getElementById("forge-version-filter-search")

const loaderVanilla = document.getElementById("vanilla-loader")
const loaderForge = document.getElementById("forge-loader")
const loaderFabric = document.getElementById("fabric-loader")
const loaderQuilt = document.getElementById("quilt-loader")

// Fetch Minecraft versions depending on applied filters
const versionsList = document.getElementById("versions-list")
exports.refreshVersionList = async () => {
    const loaderVanillaSelected = loaderVanilla.hasAttribute("active")
    const loaderForgeSelected = loaderForge.hasAttribute("active")
    const loaderFabricSelected = loaderFabric.hasAttribute("active")
    const loaderQuiltSelected = loaderQuilt.hasAttribute("active")

    versionsList.innerHTML = ""

    // Fetch vanilla versions
    if (loaderVanillaSelected) {
        document.getElementById("vanilla-version-filter").style.display = "flex"
        document.getElementById("forge-version-filter").style.display = "none"

        const mcManifest = await minecraftManifest()

        const filterReleaseCheck = filterRelease.hasAttribute("checked")
        const filterSnapshotCheck = filterSnapshot.hasAttribute("checked")
        const filterBetaCheck = filterBeta.hasAttribute("checked")
        const filterAlphaCheck = filterAlpha.hasAttribute("checked")
        const searchVal = search.value

        for (const version of mcManifest.versions) {
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
            if (searchVal != "" && !version.id.toString().includes(searchVal)) {
                continue
            }

            const versionsElement = document.createElement("div")
            versionsElement.classList.add("img-btn", "interactable")
            versionsElement.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(./resources/images/default.png)`
            versionsElement.innerText = version.id

            versionsElement.addEventListener("click", (e) => {
                const modloaderWidget = document.getElementById("open-choose-version-win")
                modloaderWidget.setAttribute("version-id", version.id)
                modloaderWidget.setAttribute("subname", version.type)
                modloaderWidget.innerText = version.id

                const placeholderTextInput = document.getElementById("new-instance-name")
                placeholderTextInput.setAttribute("placeholder", version.id)

                closeWindow("choose-version")
            })

            versionsList.appendChild(versionsElement)
        }
    }
    else if (loaderForgeSelected) {
        document.getElementById("forge-version-filter").style.display = "flex"
        document.getElementById("vanilla-version-filter").style.display = "none"

        const versionsPromosforgeManifests = await forgeVerStateManifest()
        const versionsForgeManifest = await forgeManifest()

        const filterShowAllChecked = document.getElementById("forge-version-filter-showall").hasAttribute("checked")
        const searchValue = document.getElementById("forge-version-filter-search").value

        console.log(versionsForgeManifest);

        if (filterShowAllChecked) {
            for (const version in versionsForgeManifest) {
                for (const forgeVersion in versionsForgeManifest[version]) {
                    if (searchValue != "" && !versionsForgeManifest[version][forgeVersion].toString().includes(searchValue)) {
                        continue
                    }

                    const mcVersion = versionsForgeManifest[version][forgeVersion].split("-")[0]
                    const forgeVer = versionsForgeManifest[version][forgeVersion].split("-")[1]

                    const versionsElement = document.createElement("div")
                    versionsElement.classList.add("img-btn", "interactable")
                    versionsElement.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(./resources/images/default-forge.jpg)`
                    versionsElement.innerText = `${mcVersion} (${forgeVer})`

                    versionsElement.addEventListener("click", (e) => {
                        const modloaderWidget = document.getElementById("open-choose-version-win")
                        modloaderWidget.setAttribute("version-id", versionsForgeManifest[version][forgeVersion])
                        modloaderWidget.setAttribute("modloader-id", "forge")
                        modloaderWidget.setAttribute("subname", "forge")
                        modloaderWidget.innerText = versionsForgeManifest[version][forgeVersion]

                        const placeholderTextInput = document.getElementById("new-instance-name")
                        placeholderTextInput.setAttribute("placeholder", versionsForgeManifest[version][forgeVersion])

                        closeWindow("choose-version")
                    })

                    versionsList.insertBefore(versionsElement, versionsList.firstChild)
                }
            }
        }
        else {
            for (const forgeVersion in versionsPromosforgeManifests.promos) {
                if (searchValue != "" && !forgeVersion.includes(searchValue)) {
                    continue
                }

                const mcVersion = forgeVersion.split("-")[0]
                const versionClassifier = forgeVersion.split("-")[1]

                const completeForgeVersion = `${mcVersion}-${versionsPromosforgeManifests.promos[forgeVersion]}`

                const versionsElement = document.createElement("div")
                versionsElement.classList.add("img-btn", "interactable")
                versionsElement.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(./resources/images/default-forge.jpg)`
                versionsElement.innerText = `${mcVersion} (${versionClassifier} version)`

                versionsElement.addEventListener("click", (e) => {
                    const modloaderWidget = document.getElementById("open-choose-version-win")
                    modloaderWidget.setAttribute("version-id", completeForgeVersion)
                    modloaderWidget.setAttribute("modloader-id", "forge")
                    modloaderWidget.setAttribute("subname", "forge")
                    modloaderWidget.innerText = completeForgeVersion

                    const placeholderTextInput = document.getElementById("new-instance-name")
                    placeholderTextInput.setAttribute("placeholder", completeForgeVersion)

                    closeWindow("choose-version")
                })

                versionsList.insertBefore(versionsElement, versionsList.firstChild)
            }
        }
    }
}

// Refresh version when updating selected loader
document.querySelectorAll(".loader-selector .selector").forEach((selector) => {
    selector.addEventListener("click", async (e) => {
        await this.refreshVersionList()
        console.log("refreshed");
    })
})

// Refresh version list when updating filters
document.querySelectorAll("#vanilla-version-filter .checkbox").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
        await this.refreshVersionList()
    })
})

// Refresh version list when updating forge filters
document.querySelectorAll("#forge-version-filter .checkbox").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
        await this.refreshVersionList()
    })
})

// Refresh version list when searching
document.getElementById("vanilla-version-filter-search").addEventListener("input", async (e) => {
    await this.refreshVersionList()
})

// Refresh version list when searching forge
document.getElementById("forge-version-filter-search").addEventListener("input", async (e) => {
    await this.refreshVersionList()
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