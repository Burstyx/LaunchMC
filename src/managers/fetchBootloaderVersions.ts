const {versionsManifest} = require("../utils/const")

// Get all Minecraft version with filtering options
export function getMinecraftVersions(parentList: HTMLElement, loading: HTMLElement, notFound: HTMLElement, release: boolean, snapshot: boolean, beta: boolean, alpha: boolean){
    loading.style.display = "block"
    notFound.style.display = "none"

    fetch(versionsManifest).then((res) => {
        res.json().then((data) => {
            for(let i = 0; i < data["versions"].length; i++){

                // Create a version button if filter accept it
                if((data["versions"][i]["type"] == "release" && release)
                || (data["versions"][i]["type"] == "snapshot" && snapshot)
                || (data["versions"][i]["type"] == "old_beta" && beta)
                || (data["versions"][i]["type"] == "old_alpha" && alpha)){
                    // Create version button element
                    let versionParent = document.createElement("div")
                    versionParent.id = "vanilla-" + data["versions"][i]["id"]
                    versionParent.className = "vanillabootloaderinformation bootloaderinformation"

                    // Create version label for the button element
                    let version = document.createElement("p")
                    version.innerText = data["versions"][i]["id"]

                    // Create version type label for the button element
                    let versionState = document.createElement("p")
                    versionState.innerText = data["versions"][i]["type"]

                    versionParent.appendChild(version)
                    versionParent.appendChild(versionState)
                    parentList.appendChild(versionParent)
                }
            }
        }).then(() => {
            loading.style.display = "none"
            if(parentList.children.length == 0){
                notFound.style.display = "block"
            }else{
                notFound.style.display = "none"
            }
        })
    })
    
}