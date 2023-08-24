import fs from "fs/promises"
import {existsSync} from "fs"
import { minecraftVersionPath, versionsManifest, dataPath, forgeVersionsManifest } from "./const"
import path from "path"
import {makeDir} from "./HFileManagement"
import { downloadAsync } from "./HDownload"

// Download manifest containing all versions informations
export async function minecraftManifest() {
    // Create directory if doesn't exist
    const manifestPath = await makeDir(dataPath)

    if(!existsSync(path.join(manifestPath, "versions_manifest.json"))){
        // Download manifest and return data
        await downloadAsync(versionsManifest, path.join(manifestPath, "versions_manifest.json"), (progress: number) => {
            console.log(`Progression: ${progress}% du téléchargement du manifest`);
        })
    }

    return JSON.parse(await fs.readFile(path.join(manifestPath, "versions_manifest.json"), "utf-8"))
}

// Download manifest for a specific Minecraft versions
export async function minecraftManifestForVersion(version: string) {
    // Create directory if doesn't exist
    const versionPath = await makeDir(path.join(minecraftVersionPath, version))

    if(!existsSync(path.join(versionPath, `${version}.json`))){
        // Get manifest containing all versions informations
        await minecraftManifest().then(async (data) => {
            // Retrieve data for the wanted version
            for(var i = 0; i < data["versions"].length; i++){
                if(data["versions"][i]["id"] == version){
                    // Download manifest of wanted version
                    await downloadAsync(data["versions"][i]["url"], path.join(versionPath, `${version}.json`), (progress: number) => {
                        console.log(`Progression: ${progress}% du téléchargement du manifest`);
                    })
                }
            }
        })
    }

    return JSON.parse(await fs.readFile(path.join(versionPath, `${version}.json`), "utf-8"))
}

// Download manifest containing all versions informations
export async function forgeManifest() {
    // Create directory if doesn't exist
    const manifestPath = await makeDir(dataPath)

    if(!existsSync(path.join(manifestPath, "forge_manifest.json"))){
        // Download manifest and return data
        await downloadAsync(forgeVersionsManifest, path.join(manifestPath, "forge_manifest.json"), (progress: number) => {
            console.log(`Progression: ${progress}% du téléchargement du manifest`);
        })
    }

    return JSON.parse(await fs.readFile(path.join(manifestPath, "forge_manifest.json"), "utf-8"))
}