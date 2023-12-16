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
import {CallbackEvent} from "./Debug";

export async function minecraftManifest(event: CallbackEvent) {
    return new Promise<any>(async (resolve, reject) => {
        const manifestPath = await fs.mkdir(dataPath, {recursive: true}).catch((err) => {
            event(`Impossible de créer le dossier ${dataPath}.`, err, "err")
            reject()
        })

        if(!existsSync(path.join("manifestPath", "versions_manifest.json"))){
            await downloadAsync(versionsManifest, path.join("manifestPath", "versions_manifest.json"), () => {
                // FIXME Handle errors
            }, (progress: number) => {
                console.log(`Progression: ${progress}% du téléchargement du manifest`);
            })
        }

        resolve(JSON.parse(await fs.readFile(path.join("manifestPath", "versions_manifest.json"), "utf-8")))
    })
}

export async function minecraftManifestForVersion(version: string, event: CallbackEvent) {
    return new Promise<any>(async (resolve, reject) => {
        await fs.mkdir(path.join(minecraftVersionPath, version), {recursive: true}).catch((err) => {
            event(`Impossible de créer le dossier ${minecraftVersionPath}.`, err, "err")
            reject()
        })
        const versionPath = path.join(minecraftVersionPath, version)

        if(!existsSync(path.join(versionPath, `${version}.json`))){
            await minecraftManifest(() => {
                // FIXME Handle errors
            }).then(async (data) => {
                for(let i = 0; i < data["versions"].length; i++){
                    if(data["versions"][i]["id"] == version){
                        await downloadAsync(data["versions"][i]["url"], path.join(versionPath, `${version}.json`), () => {
                            // FIXME Handle errors
                        }, (progress: number) => {
                            console.log(`Progression: ${progress}% du téléchargement du manifest`);
                        })
                    }
                }
            })
        }

        resolve(JSON.parse(await fs.readFile(path.join(versionPath, `${version}.json`), "utf-8")))
    })
}

// Download manifest containing all versions informations
export async function forgeManifest(event: CallbackEvent) {
    return new Promise<any>(async (resolve, reject) => {
        await fs.mkdir(dataPath, {recursive: true}).catch((err) => {
            event(`Impossible de créer le dossier ${dataPath}.`, err, "err")
            reject()
        })

        if(!existsSync(path.join(dataPath, "forge_manifest.json"))){
            // Download manifest and return data
            await downloadAsync(forgeVersionsManifest, path.join(dataPath, "forge_manifest.json"), () => {
                // FIXME Handle errors
            }, (progress: number) => {
                console.log(`Progression: ${progress}% du téléchargement du manifest`);
            })
        }

        resolve(JSON.parse(await fs.readFile(path.join("manifestPath", "forge_manifest.json"), "utf-8")))
    })
}

// Download manifest containing the states of all forge versions (which is latest and which is recommended)
export async function forgeVerStateManifest(event: CallbackEvent) {
    return new Promise<any>(async (resolve, reject) => {
        await fs.mkdir(dataPath, {recursive: true}).catch((err) => {
            event(`Impossible de créer le dossier ${dataPath}.`, err, "err")
            reject()
        })

        if(!existsSync(path.join(dataPath, "forge_manifest_promos.json"))){
            // Download manifest and return data
            await downloadAsync(forgeVersionsStatuesManifest, path.join(dataPath, "forge_manifest_promos.json"), () => {
                // FIXME Handle errors
            }, (progress: number) => {
                console.log(`Progression: ${progress}% du téléchargement du manifest`);
            })
        }

        resolve(JSON.parse(await fs.readFile(path.join("manifestPath", "forge_manifest_promos.json"), "utf-8")))
    })
}