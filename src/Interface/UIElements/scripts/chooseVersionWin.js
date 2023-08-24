const { minecraftManifest, forgeManifest } = require("../../../Utils/HManifests")
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
exports.refreshVersionList = () => {
    const loaderVanillaSelected = loaderVanilla.hasAttribute("active")
    const loaderForgeSelected = loaderForge.hasAttribute("active")
    const loaderFabricSelected = loaderFabric.hasAttribute("active")
    const loaderQuiltSelected = loaderQuilt.hasAttribute("active")

    console.log(loaderVanillaSelected);
    console.log(loaderForgeSelected);

    versionsList.innerHTML = ""

    // Fetch vanilla versions
    if (loaderVanillaSelected) {
        document.getElementById("vanilla-version-filter").style.display = "flex"
        document.getElementById("forge-version-filter").style.display = "none"

        minecraftManifest().then((val) => {
            const filterReleaseCheck = filterRelease.hasAttribute("checked")
            const filterSnapshotCheck = filterSnapshot.hasAttribute("checked")
            const filterBetaCheck = filterBeta.hasAttribute("checked")
            const filterAlphaCheck = filterAlpha.hasAttribute("checked")
            const searchVal = search.value

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
                if (searchVal != "" && !version.id.toString().includes(searchVal)) {
                    continue
                }

                const versionsElement = document.createElement("div")
                versionsElement.classList.add("img-btn", "interactable")
                versionsElement.style.backgroundImage = `url(./resources/images/default.png)`
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
        })
    }
    else if (loaderForgeSelected) {
        document.getElementById("forge-version-filter").style.display = "flex"
        document.getElementById("vanilla-version-filter").style.display = "none"

        forgeManifest().then((val) => {
            const filterShowAllChecked = document.getElementById("forge-version-filter-showall").hasAttribute("checked")
            const searchValue = document.getElementById("forge-version-filter-search").value

            console.log(val);

            for (const version in val) {
                if (filterShowAllChecked) {
                    for (const forgeVersion in version) {
                        if (searchValue != "" && !val[version][forgeVersion].toString().includes(searchValue)) {
                            continue
                        }

                        const versionsElement = document.createElement("div")
                        versionsElement.classList.add("img-btn", "interactable")
                        versionsElement.style.backgroundImage = `url(./resources/images/default.png)`
                        versionsElement.innerText = val[version][forgeVersion]

                        versionsElement.addEventListener("click", (e) => {
                            const modloaderWidget = document.getElementById("open-choose-version-win")
                            modloaderWidget.setAttribute("version-id", val[version][forgeVersion])
                            modloaderWidget.setAttribute("modloader-id", "vanilla")
                            modloaderWidget.setAttribute("subname", "forge")
                            modloaderWidget.innerText = val[version][forgeVersion]

                            const placeholderTextInput = document.getElementById("new-instance-name")
                            placeholderTextInput.setAttribute("placeholder", val[version][forgeVersion])

                            closeWindow("choose-version")
                        })

                        versionsList.insertBefore(versionsElement, versionsList.firstChild)
                    }
                } else {
                    if (searchValue != "" && !val[version][val[version].length - 1].toString().includes(searchValue)) {
                        continue
                    }

                    const versionsElement = document.createElement("div")
                    versionsElement.classList.add("img-btn", "interactable")
                    versionsElement.style.backgroundImage = `url(./resources/images/default.png)`
                    versionsElement.innerText = val[version][val[version].length - 1] + " (latest)"

                    versionsElement.addEventListener("click", (e) => {
                        const modloaderWidget = document.getElementById("open-choose-version-win")
                        modloaderWidget.setAttribute("version-id", val[version][val[version].length - 1])
                        modloaderWidget.setAttribute("modloader-id", "forge")
                        modloaderWidget.setAttribute("subname", "forge")
                        modloaderWidget.innerText = val[version][val[version].length - 1]

                        const placeholderTextInput = document.getElementById("new-instance-name")
                        placeholderTextInput.setAttribute("placeholder", val[version][val[version].length - 1])

                        closeWindow("choose-version")
                    })

                    versionsList.insertBefore(versionsElement, versionsList.firstChild)
                }
            }
        })
    }
}

// Refresh version when updating selected loader
document.querySelectorAll(".loader-selector .selector").forEach((selector) => {
    selector.addEventListener("click", (e) => {
        this.refreshVersionList()
        console.log("refreshed");
    })
})

// Refresh version list when updating filters
document.querySelectorAll("#vanilla-version-filter .checkbox").forEach((btn) => {
    btn.addEventListener("click", (e) => {
        this.refreshVersionList()
    })
})

// Refresh version list when updating forge filters
document.querySelectorAll("#forge-version-filter .checkbox").forEach((btn) => {
    btn.addEventListener("click", (e) => {
        this.refreshVersionList()
    })
})

// Refresh version list when searching
document.getElementById("vanilla-version-filter-search").addEventListener("input", (e) => {
    this.refreshVersionList()
})

// Refresh version list when searching forge
document.getElementById("forge-version-filter-search").addEventListener("input", (e) => {
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