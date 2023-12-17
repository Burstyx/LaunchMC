import fs from "fs/promises"
import {existsSync} from "fs"
import {
    minecraftVersionPath,
    versionsManifest,
    forgeVersionsManifest,
    forgeVersionsStatuesManifest,
    dataPath
} from "./const"
import path from "path"
import { downloadAsync } from "./HDownload"

export async function minecraftManifest() {
    return new Promise<any>(async (resolve, reject) => {
        await fs.mkdir(dataPath, {recursive: true}).catch((err) => {
            reject(err)
        })

        if(!existsSync(path.join(dataPath, "versions_manifest.json"))){
            await downloadAsync(versionsManifest, path.join(dataPath, "versions_manifest.json"), (progress: number) => {
                console.log(`Progression: ${progress}% du téléchargement du manifest`);
            }).catch((err) => reject(err))
        }

        await fs.readFile(path.join(dataPath, "versions_manifest.json"), "utf8").then((res) => {
            resolve(JSON.parse(res))
        }).catch((err) => {
            reject(err)
        })
    })
}

export async function minecraftManifestForVersion(version: string) {
    return new Promise<any>(async (resolve, reject) => {
        await fs.mkdir(path.join(minecraftVersionPath, version), {recursive: true}).catch((err) => {
            reject(err)
        })
        const versionPath = path.join(minecraftVersionPath, version)

        if(!existsSync(path.join(versionPath, `${version}.json`))){
            await minecraftManifest().then(async (data) => {
                for(let i = 0; i < data["versions"].length; i++){
                    if(data["versions"][i]["id"] == version){
                        await downloadAsync(data["versions"][i]["url"], path.join(versionPath, `${version}.json`),(progress: number) => {
                            console.log(`Progression: ${progress}% du téléchargement du manifest`);
                        }).catch((err) => reject(err))
                    }
                }
            }).catch((err) => reject(err))
        }

        await fs.readFile(path.join(versionPath, `${version}.json`), "utf-8").then((res) => {
            resolve(JSON.parse(res))
        }).catch((err) => reject(err))
    })
}

// Download manifest containing all versions informations
export async function forgeManifest() {
    return new Promise<any>(async (resolve, reject) => {
        await fs.mkdir(dataPath, {recursive: true}).catch((err) => {
            reject(err)
        })

        if(!existsSync(path.join(dataPath, "forge_manifest.json"))){
            // Download manifest and return data
            await downloadAsync(forgeVersionsManifest, path.join(dataPath, "forge_manifest.json"),(progress: number) => {
                console.log(`Progression: ${progress}% du téléchargement du manifest`);
            }).catch((err) => reject(err))
        }

        await fs.readFile(path.join(dataPath, "forge_manifest.json"), "utf-8").then((res) => {
            resolve(JSON.parse(res))
        }).catch((err) => reject(err))
    })
}

// Download manifest containing the states of all forge versions (which is latest and which is recommended)
export async function forgeVerStateManifest() {
    return new Promise<any>(async (resolve, reject) => {
        await fs.mkdir(dataPath, {recursive: true}).catch((err) => {
            reject(err)
        })

        if(!existsSync(path.join(dataPath, "forge_manifest_promos.json"))){
            // Download manifest and return data
            await downloadAsync(forgeVersionsStatuesManifest, path.join(dataPath, "forge_manifest_promos.json"),(progress: number) => {
                console.log(`Progression: ${progress}% du téléchargement du manifest`);
            }).catch((err) => reject(err))
        }

        await fs.readFile(path.join(dataPath, "forge_manifest_promos.json"), "utf-8").then((res) => {
            resolve(JSON.parse(res))
        }).catch((err) => {
            reject(err)
        })
    })
}