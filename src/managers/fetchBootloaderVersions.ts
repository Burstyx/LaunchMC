export function getMinecraftVersions(parentList: Element, loading: Element, notFound: Element, release: boolean, snapshot: boolean, beta: boolean, alpha: boolean){
    //@ts-ignore
    loading.style.display = "block"
    //@ts-ignore
    notFound.style.display = "none"
    fetch("https://piston-meta.mojang.com/mc/game/version_manifest.json").then((res) => {
        res.json().then((data) => {
            let iter = 0
            for(let i = 0; i < data["versions"].length; i++){
                if((data["versions"][i]["type"] == "release" && release)
                || (data["versions"][i]["type"] == "snapshot" && snapshot)
                || (data["versions"][i]["type"] == "old_beta" && beta)
                || (data["versions"][i]["type"] == "old_alpha" && alpha)){
                    let versionParent = document.createElement("p")
                    versionParent.id = "vanilla-" + data["versions"][i]["id"]
                    versionParent.className = "vanillabootloaderinformation bootloaderinformation"

                    let version = document.createElement("p")
                    version.innerText = data["versions"][i]["id"]

                    let versionState = document.createElement("p")
                    versionState.innerText = data["versions"][i]["type"]
                    versionParent.appendChild(version)
                    versionParent.appendChild(versionState)

                    parentList.appendChild(versionParent)

                    iter++
                }
            }
            
        }).then(() => {
            //@ts-ignore
            loading.style.display = "none"
            if(parentList.children.length == 0){
                //@ts-ignore
                notFound.style.display = "block"
            }else{
                //@ts-ignore
                notFound.style.display = "none"
            }
        })
    })
    
}