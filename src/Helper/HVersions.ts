import {versionsManifest, dataPath} from "./const"
import {minecraftManifest} from "./HManifests"
import fs from "fs"
import path from "path"

interface MinecraftVersionsFiltering {
    filterOptions: {
        release: boolean,
        snapshot: boolean,
        beta: boolean,
        alpha: boolean
    }
}

// Get all Minecraft version with filtering options
export async function filteredMinecraftVersions(opt: MinecraftVersionsFiltering){
    var versions: any = []
    await minecraftManifest().then((data) => {
        
        for(var i = 0; i < data["versions"].length; i++){
            if((data["versions"][i]["type"] == "release" && opt["filterOptions"]["release"])
            || (data["versions"][i]["type"] == "snapshot" && opt["filterOptions"]["snapshot"])
            || (data["versions"][i]["type"] == "old_beta" && opt["filterOptions"]["beta"])
            || (data["versions"][i]["type"] == "old_alpha" && opt["filterOptions"]["alpha"])){
                versions.push({
                    id: data["versions"][i]["id"],
                    type: data["versions"][i]["type"],
                    sha1: data["versions"][i]["sha1"],
                    complianceLevel: data["versions"][i]["complianceLevel"]
                })
            }
        }

        
    })    


    // for(let i = 0; i < data["versions"].length; i++){

    //     // Create a version button if filter accept it
    //     if((data["versions"][i]["type"] == "release" && release)
    //     || (data["versions"][i]["type"] == "snapshot" && snapshot)
    //     || (data["versions"][i]["type"] == "old_beta" && beta)
    //     || (data["versions"][i]["type"] == "old_alpha" && alpha)){
    //         // Create version button element
    //         let versionParent = document.createElement("div")
    //         versionParent.id = "vanilla-" + data["versions"][i]["id"]
    //         versionParent.className = "vanillabootloaderinformation bootloaderinformation"

    //         // Create version label for the button element
    //         let version = document.createElement("p")
    //         version.innerText = data["versions"][i]["id"]

    //         // Create version type label for the button element
    //         let versionState = document.createElement("p")
    //         versionState.innerText = data["versions"][i]["type"]

    //         versionParent.appendChild(version)
    //         versionParent.appendChild(versionState)
    //         parentList.appendChild(versionParent)
    //     }
    // }

    // loading.style.display = "none"
    // if(parentList.children.length == 0){
    //     notFound.style.display = "block"
    // }else{
    //     notFound.style.display = "none"
    // }
    return versions
}