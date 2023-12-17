import { extractSpecificFile } from "./HFileManagement";
import { forgeMaven, minecraftVersionPath, tempPath } from "./const";
import path from "path"
import fs from "fs/promises"
import { downloadAsync } from "./HDownload";
import { existsSync } from "fs";

export async function getForgeInstallerForVersion(forgeId: string) {
    return new Promise<string>(async (resolve, reject) => {
        const installerPath = path.join(tempPath, "forgeinstallers")
        await fs.mkdir(installerPath, {recursive: true}).catch((err) => {
            reject(err)
        })

        if(!existsSync(path.join(installerPath, `forge-${forgeId}-installer.jar`))) {
            await downloadAsync(path.join(forgeMaven, "net", "minecraftforge", "forge", forgeId, `forge-${forgeId}-installer.jar`), path.join(installerPath, `forge-${forgeId}-installer.jar`)).catch((err) => reject(err))
        }

        resolve(path.join(installerPath, `forge-${forgeId}-installer.jar`))
    })
}

export async function getForgeInstallProfileIfExist(forgeId: string) {
    return new Promise<any>(async (resolve, reject) => {
        await getForgeInstallerForVersion(forgeId).then(async (forgeInstallerPath) => {
            await extractSpecificFile(forgeInstallerPath, "install_profile.json").catch((err) => reject(err))

            const installProfilePath = path.join(path.dirname(forgeInstallerPath), "install_profile.json")

            fs.readFile(installProfilePath, "utf8").then(async (file) => {
                const data = JSON.parse(file)

                await fs.unlink(installProfilePath).catch((err) => reject(err))

                resolve(data)
            }).catch((err) => {
                reject(err)
            })
        }).catch((err) => reject(err))
    })
}

export async function getForgeVersionIfExist(forgeId: string) {
    return new Promise<any>(async (resolve, reject) => {
        const versionPath = path.join(minecraftVersionPath, forgeId)
        await fs.mkdir(versionPath, {recursive: true}).catch((err) => {
            reject(err)
        })

        if(!existsSync(path.join(versionPath, `${forgeId}.json`))) {
            await getForgeInstallerForVersion(forgeId).then(async (forgeInstaller) => {
                await getForgeInstallProfileIfExist(forgeId).then(async (forgeInstallProfile) => {
                    if(forgeInstallProfile.json) {
                        const versionJsonPath = forgeInstallProfile.json.startsWith("/") ? forgeInstallProfile.json.replace("/", "") : forgeInstallProfile.json
                        await extractSpecificFile(forgeInstaller, versionJsonPath, path.join(versionPath, `${forgeId}.json`)).catch((err) => reject(err))
                    } else {
                        await extractSpecificFile(forgeInstaller, "install_profile.json", path.join(versionPath, `${forgeId}.json`)).catch((err) => reject(err))
                    }
                }).catch((err) => reject(err))
            }).catch((err) => reject(err))
        }

        await fs.readFile(path.join(versionPath, `${forgeId}.json`), "utf-8").then((res) => {
            resolve(JSON.parse(res))
        }).catch((err) => reject(err))
    })
}