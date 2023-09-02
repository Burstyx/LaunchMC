import { extractSpecificFile, makeDir } from "./HFileManagement";
import { forgeMaven, minecraftVersionPath, tempPath } from "./const";
import path from "path"
import fs from "fs"
import fsp from "fs/promises"
import { downloadAsync } from "./HDownload";
import semver from "semver"

export async function getForgeInstallerForVersion(forgeId: string) {
    // Get forge installers folder
    const installerPath = path.join(tempPath, "forgeinstallers")
    await makeDir(installerPath)

    if(!fs.existsSync(path.join(installerPath, `forge-${forgeId}-installer.jar`))) {
        await downloadAsync(path.join(forgeMaven, "net", "minecraftforge", "forge", forgeId, `forge-${forgeId}-installer.jar`), path.join(installerPath, `forge-${forgeId}-installer.jar`))
    }

    return path.join(installerPath, `forge-${forgeId}-installer.jar`)
}

export async function getForgeInstallProfileIfExist(forgeId: string) {
    const forgeInstallerPath = await getForgeInstallerForVersion(forgeId)

    await extractSpecificFile(forgeInstallerPath, "install_profile.json")

    const installProfilePath = path.join(path.dirname(forgeInstallerPath), "install_profile.json")

    const installProfileJson = await fsp.readFile(installProfilePath, "utf8")
    // await fsp.unlink(installProfilePath)

    return JSON.parse(installProfileJson)
}

export async function getForgeVersionIfExist(forgeId: string | undefined) {
    if(!forgeId) 
        return

    const versionPath = path.join(minecraftVersionPath, forgeId)
    await makeDir(versionPath)

    if(!fs.existsSync(path.join(versionPath, `${forgeId}.json`))) {
        const forgeInstallerPath = await getForgeInstallerForVersion(forgeId)
        const installProfile = await getForgeInstallProfileIfExist(forgeId)
        
        if(installProfile.json) {
            const versionJsonPath = installProfile.json.startsWith("/") ? installProfile.json.replace("/", "") : installProfile.json
            await extractSpecificFile(forgeInstallerPath, versionJsonPath, path.join(versionPath, `${forgeId}.json`))
        } else {
            await extractSpecificFile(forgeInstallerPath, "install_profile.json", path.join(versionPath, `${forgeId}.json`))
        }
    }
    
    return JSON.parse(await fsp.readFile(path.join(versionPath, `${forgeId}.json`), "utf-8"))
}