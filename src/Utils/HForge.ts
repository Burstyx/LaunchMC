import { extractSpecificFile } from "./HFileManagement";
import { forgeMaven, minecraftVersionPath, tempPath } from "./const";
import path from "path"
import fs from "fs/promises"
import { downloadAsync } from "./HDownload";
import { existsSync } from "fs";

export async function getForgeInstallerForVersion(forgeId: string) {
    return new Promise<string>(async (resolve, reject) => {
        const installerPath = path.join(tempPath, "forgeinstallers")
        await fs.mkdir(installerPath, {recursive: true}).catch((err) => reject(err))

        if(!existsSync(path.join(installerPath, `forge-${forgeId}-installer.jar`))) {
            await downloadAsync(path.join(forgeMaven, "net", "minecraftforge", "forge", forgeId, `forge-${forgeId}-installer.jar`), path.join(installerPath, `forge-${forgeId}-installer.jar`))
        }

        resolve(path.join(installerPath, `forge-${forgeId}-installer.jar`))
    })
}

export async function getForgeInstallProfileIfExist(forgeId: string) {
    return new Promise<any>(async (resolve, reject) => {
        const forgeInstallerPath = await getForgeInstallerForVersion(forgeId)

        await extractSpecificFile(forgeInstallerPath, "install_profile.json").catch((err) => reject(err))

        const installProfilePath = path.join(path.dirname(forgeInstallerPath), "install_profile.json")

        fs.readFile(installProfilePath, "utf8").then(async (file) => {
            const data = JSON.parse(file)

            await fs.unlink(installProfilePath).catch((err) => reject(err))

            resolve(data)
        }).catch((err) => reject(err))

    })
}

export async function getForgeVersionIfExist(forgeId: string | undefined) {
    return new Promise<any>(async (resolve, reject) => {
        if(!forgeId)
            return

        const versionPath = path.join(minecraftVersionPath, forgeId)
        await fs.mkdir(versionPath, {recursive: true}).catch((err) => reject(err))

        if(!existsSync(path.join(versionPath, `${forgeId}.json`))) {
            getForgeInstallerForVersion(forgeId).then((forgeInstaller) => {
                getForgeInstallProfileIfExist(forgeId).then((forgeInstallProfile) => {

                })
            })

            if(installProfile.json) {
                const versionJsonPath = installProfile.json.startsWith("/") ? installProfile.json.replace("/", "") : installProfile.json
                await extractSpecificFile(forgeInstallerPath, versionJsonPath, path.join(versionPath, `${forgeId}.json`))
            } else {
                await extractSpecificFile(forgeInstallerPath, "install_profile.json", path.join(versionPath, `${forgeId}.json`))
            }
        }

        return JSON.parse(await fsp.readFile(path.join(versionPath, `${forgeId}.json`), "utf-8"))
    })
}