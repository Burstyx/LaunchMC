import fs from "fs"
import { minecraftVersionPath, versionsManifest, dataPath } from "./const"
import path from "path"
import {makeDir} from "./HDirectoryManager"
import { downloadAsync } from "./Download"

// Download manifest containing all versions informations
export async function minecraftManifest(): Promise<any>{
    return await new Promise(async (resolve, reject) => {
        // Create directory if doesn't exist
        const manifestPath = makeDir(dataPath)

        if(!fs.existsSync(path.join(manifestPath, "versions_manifest.json"))){
            // Download manifest and return data
            await downloadAsync(versionsManifest, path.join(manifestPath, "versions_manifest.json")).then((res) => {
                res.json().then((data) => {
                    resolve(data)
                })
            })
        }else{
            // File already exist so return data of this file
            resolve(JSON.parse(fs.readFileSync(path.join(manifestPath, "versions_manifest.json"), "utf-8")))
        }
    })
}

// Download manifest for a specific Minecraft versions
export async function minecraftManifestForVersion(version: string): Promise<any> {
    return await new Promise(async (resolve, reject) => {
        // Create directory if doesn't exist
        const versionPath = makeDir(path.join(minecraftVersionPath, version))

        if(!fs.existsSync(path.join(versionPath, `${version}.json`))){
            // Get manifest containing all versions informations
            await minecraftManifest().then(async (data) => {
                // Retrieve data for the wanted version
                for(var i = 0; i < data["versions"].length; i++){
                    if(data["versions"][i]["id"] == version){
                        // Download manifest of wanted version
                        await downloadAsync(data["versions"][i]["url"], path.join(versionPath, `${version}.json`)).then((data) => {
                            resolve(data)
                        })
                    }
                }
            })
        }else{
            // File already exist so return it
            resolve(JSON.parse(fs.readFileSync(path.join(versionPath, `${version}.json`), "utf-8")))
        }
    })
}

