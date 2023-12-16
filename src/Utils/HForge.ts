import { extractSpecificFile } from "./HFileManagement";
import { forgeMaven, minecraftVersionPath, tempPath } from "./const";
import path from "path"
import fs from "fs/promises"
import { downloadAsync } from "./HDownload";
import { existsSync } from "fs";
import {CallbackEvent} from "./Debug";

export async function getForgeInstallerForVersion(forgeId: string, event: CallbackEvent) {
    return new Promise<string>(async (resolve, reject) => {
        const installerPath = path.join(tempPath, "forgeinstallers")
        await fs.mkdir(installerPath, {recursive: true}).catch((err) => {
            event(`Impossible de créer le dossier ${installerPath} pour stocker l'installer de forge ${forgeId}.`, err, "err")
            reject()
        })

        if(!existsSync(path.join(installerPath, `forge-${forgeId}-installer.jar`))) {
            await downloadAsync(path.join(forgeMaven, "net", "minecraftforge", "forge", forgeId, `forge-${forgeId}-installer.jar`), path.join(installerPath, `forge-${forgeId}-installer.jar`), () => {
                // FIXME Handle errors
            })
        }

        resolve(path.join(installerPath, `forge-${forgeId}-installer.jar`))
    })
}

export async function getForgeInstallProfileIfExist(forgeId: string, event: CallbackEvent) {
    return new Promise<any>(async (resolve, reject) => {
        const forgeInstallerPath = await getForgeInstallerForVersion(forgeId, () => {
            // FIXME Handle errors
        })

        await extractSpecificFile(forgeInstallerPath, "install_profile.json", () => {
            // FIXME Handle errors
        })

        const installProfilePath = path.join(path.dirname(forgeInstallerPath), "install_profile.json")

        fs.readFile(installProfilePath, "utf8").then(async (file) => {
            const data = JSON.parse(file)

            await fs.unlink(installProfilePath).catch((err) => reject(err))

            resolve(data)
        }).catch((err) => {
            event(`Impossible de lire le fichier ${installProfilePath}.`, err, "err")
            reject()
        })
    })
}

export async function getForgeVersionIfExist(forgeId: string, event: CallbackEvent) {
    return new Promise<any>(async (resolve, reject) => {
        const versionPath = path.join(minecraftVersionPath, forgeId)
        await fs.mkdir(versionPath, {recursive: true}).catch((err) => {
            event(`Impossible de créer le dossier ${versionPath} pour récupérer le fichier de version de forge ${forgeId}.`, err, "err")
            reject()
        })

        if(!existsSync(path.join(versionPath, `${forgeId}.json`))) {
            await getForgeInstallerForVersion(forgeId, () => {
                // FIXME Handle errors
            }).then(async (forgeInstaller) => {
                await getForgeInstallProfileIfExist(forgeId, () => {
                    // FIXME Handle errors
                }).then(async (forgeInstallProfile) => {
                    if(forgeInstallProfile.json) {
                        const versionJsonPath = forgeInstallProfile.json.startsWith("/") ? forgeInstallProfile.json.replace("/", "") : forgeInstallProfile.json
                        await extractSpecificFile(forgeInstaller, versionJsonPath, () => {
                            // FIXME Handle errors
                        }, path.join(versionPath, `${forgeId}.json`))
                    } else {
                        await extractSpecificFile(forgeInstaller, "install_profile.json", () => {
                            // FIXME Handle errors
                        }, path.join(versionPath, `${forgeId}.json`))
                    }
                })
            })
        }

        resolve(JSON.parse(await fs.readFile(path.join(versionPath, `${forgeId}.json`), "utf-8")))
    })
}