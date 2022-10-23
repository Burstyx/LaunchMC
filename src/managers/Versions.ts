import {versionsManifest, dataPath} from "../utils/const"
import {getVersionManifest} from "./getManifest"
import fs from "fs"
import path from "path"
import https from "https"

interface MinecraftVersionsFiltering {
    filter: boolean,
    filterOptions?: {
        release: boolean,
        snapshot: boolean,
        beta: boolean,
        alpha: boolean
    }
}

class Versions{
    minecraftVersions(opt: MinecraftVersionsFiltering){
        if(!fs.existsSync(path.join(dataPath, "versions_manifest.json"))){
            const file = fs.createWriteStream(path.join(dataPath, "versions_manifest.json"))

            await new Promise((resolve, reject) => {
                https.get(versionsManifest, (data) => {
                    data.pipe(file)

                    data.on("end", () => {
                        resolve(data)
                    })

                    data.on("error", (err) => {
                        reject(err)
                    })
                })
            })
        }
    }
}

// Get all Minecraft version with filtering options
export async function (){
    loading.style.display = "block"
    notFound.style.display = "none"

    

    const data = JSON.parse(fs.readFileSync(path.join(dataPath, "versions_manifest.json"), "utf-8"))

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

    loading.style.display = "none"
    if(parentList.children.length == 0){
        notFound.style.display = "block"
    }else{
        notFound.style.display = "none"
    }
}