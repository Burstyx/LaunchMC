import { minecraftManifestForVersion } from "../Utils/HManifests"
import cp from "child_process"
import path from "path"
import { instancesPath, assetsPath, librariesPath, minecraftVersionPath, legacyAssetsPath, javaPath, java8Version, java17Version, loggingConfPath, indexesPath, gamePath, java8Name, java17Name, tempPath } from "../Utils/const"
import os from "os"
import fs from "fs/promises"
import { existsSync } from "fs"
import { downloadAndGetJavaVersion, JavaVersions, minecraftLibraryList, parseRule } from "./DownloadGame"
import { getAllFile, makeDir, mavenToArray } from "../Utils/HFileManagement"
import { InstanceState, updateInstanceDlState } from "../Utils/HInstance"
import { DiscordRPCState, switchDiscordRPCState } from "./DIscordRPC"
import { getForgeInstallProfileIfExist, getForgeVersionIfExist } from "../Utils/HForge"
import { removeDuplicates, replaceAll } from "../Utils/Utils"
import semver from "semver"

interface MinecraftArgsOpt {
    username: string,
    uuid: string,
    accesstoken: string,
    usertype: string,
    versiontype: string,
    isdemouser?: boolean,
    resolutions?: {
        width: number,
        height: number
    }
}

interface ForgeArgsOpt {
    id: string
}

let mcProcs: any = {}

export async function startMinecraft(version: string, instanceId: string, opt: MinecraftArgsOpt, forgeOpt?: ForgeArgsOpt) { // TODO: Get game libraries
    // TODO If map_to_ressource == true -> object dans legacy

    // Get Minecraft version manifest
    const mcData = await minecraftManifestForVersion(version)
    await updateInstanceDlState(instanceId, InstanceState.Loading)

    
    // Get Forge version manifest
    const isForgeVersion = forgeOpt != undefined
    const forgeData = isForgeVersion ? await getForgeVersionIfExist(forgeOpt.id) : undefined
    console.log(forgeData);
    

    // Get all Minecraft arguments
    var mcArgs = mcData["minecraftArguments"]
    if (mcArgs == null) {
        mcArgs = ""
        for (let i = 0; i < mcData["arguments"]["game"].length; i++) {
            if (typeof mcData["arguments"]["game"][i] == "string") {
                mcArgs += mcData["arguments"]["game"][i] + " "
            }
        }
    }

    let forgeReplaceMcArgs = false

    // Get all Forge arguments
    var forgeGameArgs
    var forgeJvmArgs
    if(forgeData != undefined) {
        if(forgeData.arguments) {
            forgeGameArgs = forgeData.arguments.game
            forgeJvmArgs = forgeData.arguments.jvm
        }
        else if(forgeData.minecraftArguments) {
            forgeReplaceMcArgs = true
            forgeGameArgs = forgeData.minecraftArguments.split(" ")
        }
        else if(forgeData.versionInfo.minecraftArguments) {
            forgeReplaceMcArgs = true
            forgeGameArgs = forgeData.versionInfo.minecraftArguments.split(" ")
        }
    }

    // Parse Minecraft arguments
    let parsedMcArgs = forgeReplaceMcArgs ? forgeGameArgs : mcArgs.split(" ")
    for (let i = 0; i < parsedMcArgs.length; i++) {
        switch (parsedMcArgs[i]) {
            case "${auth_player_name}":
                parsedMcArgs[i] = opt.username
                break;
            case "${version_name}":
                parsedMcArgs[i] = version
                break;
            case "${game_directory}":
                parsedMcArgs[i] = path.join(instancesPath, instanceId)
                break;
            case "${assets_root}":
                parsedMcArgs[i] = assetsPath
                break;
            case "${assets_index_name}":
                parsedMcArgs[i] = mcData.assets
                break;
            case "${auth_uuid}":
                parsedMcArgs[i] = opt.uuid
                break;
            case "${auth_access_token}":
                parsedMcArgs[i] = opt.accesstoken
                break;
            case "${user_properties}":
                parsedMcArgs[i] = "{}"
                break;
            case "${user_type}":
                parsedMcArgs[i] = "msa"
                break;
            case "${version_type}":
                parsedMcArgs[i] = opt.versiontype
                break;
            case "${game_assets}":
                // if(!existsSync(legacyAssetsPath))
                //     await fs.mkdir(legacyAssetsPath, {recursive: true}) // TODO: Assets don't work for pre-1.6 version
                parsedMcArgs[i] = path.join(instancesPath, instanceId, "resources")
                break;
            case "${auth_session}":
                parsedMcArgs[i] = "OFFLINE"
                break;
            default:
                break;
        }
    }

    mcArgs = parsedMcArgs

    // Parse forge args
    let parsedForgeGameArgsArray
    let parsedForgeJvmArgsArray
    if(forgeJvmArgs != undefined) {
        // Parse forge jvm args
        parsedForgeJvmArgsArray = forgeJvmArgs
        
        for (let i = 0; i < parsedForgeJvmArgsArray.length; i++) {            
            parsedForgeJvmArgsArray[i] = replaceAll(parsedForgeJvmArgsArray[i], "${library_directory}", librariesPath)
            parsedForgeJvmArgsArray[i] = replaceAll(parsedForgeJvmArgsArray[i], "${classpath_separator}", path.delimiter)
            parsedForgeJvmArgsArray[i] = replaceAll(parsedForgeJvmArgsArray[i], "${version_name}", version)
        }

        forgeJvmArgs = parsedForgeJvmArgsArray
    }

    if(forgeGameArgs != undefined && !forgeReplaceMcArgs) {
        // Parse forge game args
        parsedForgeGameArgsArray = forgeGameArgs  
        forgeGameArgs = parsedForgeGameArgsArray
    }

    // Building jvm args
    var jvmArgs = []
    
    // Set min and max allocated ram
    jvmArgs.push("-Xms2048M")
    jvmArgs.push("-Xmx4096M")

    // Intel optimization
    jvmArgs.push("-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump")

    // Ignore Invalid Certificates Verification
    jvmArgs.push("-Dfml.ignoreInvalidMinecraftCertificates=true")

    // Ignore FML check for jar injection
    jvmArgs.push("-Dfml.ignorePatchDiscrepancies=true")

    // Set natives path
    jvmArgs.push("-Djava.library.path=" + await makeDir(path.join(instancesPath, instanceId, "natives")))

    // Set classpaths
    let classPathes: string[] = []

    let mcLibrariesArray = minecraftLibraryList(mcData)
    mcLibrariesArray.push(path.join(minecraftVersionPath, version, `${version}.jar`))

    const librariesPathInJson = isForgeVersion && forgeData.libraries ? forgeData.libraries : forgeData.versionInfo.libraries
    const forgeLibrariesArray = isForgeVersion ? librariesPathInJson.filter((lib: any) => {
        if(lib.rules) {
            return parseRule(lib.rules)
        }

        return true
    }).map((lib: any) => {
        if(lib.downloads) {
            return path.join(librariesPath, lib.downloads.artifact.path)
        } else {
            return path.join(librariesPath, mavenToArray(lib.name).join("/"))
        }
    }) : undefined
    
    classPathes = removeDuplicates(isForgeVersion ? forgeLibrariesArray.concat(mcLibrariesArray) : mcLibrariesArray)

    jvmArgs.push(`-cp`)
    jvmArgs.push(`${classPathes.join(path.delimiter)}`)

    console.log(classPathes);

    jvmArgs = isForgeVersion && forgeJvmArgs != undefined ? jvmArgs.concat(...forgeJvmArgs) : jvmArgs
    mcArgs = isForgeVersion && forgeGameArgs != undefined && !forgeReplaceMcArgs ? mcArgs.concat(...forgeGameArgs) : mcArgs

    jvmArgs.push(isForgeVersion ? forgeData.mainClass ? forgeData.mainClass : forgeData.versionInfo.mainClass : mcData.mainClass)
    
    const fullMcArgs = [...jvmArgs, ...mcArgs].filter((val, i) => val != "")

    console.log(fullMcArgs);

    // Find correct java executable
    const java8Path = await downloadAndGetJavaVersion(JavaVersions.JDK8)
    const java17Path = await downloadAndGetJavaVersion(JavaVersions.JDK17)

    const java8 = path.join(java8Path, "javaw")
    const java17 = path.join(java17Path, "javaw")

    const semverVersionCompatibility = version.split(".").length == 2 ? version + ".0" : version

    const below117 = semver.lt(semverVersionCompatibility, "1.17.0")
    console.log("below117: " + below117);
    
    const javaVersionToUse = below117 ? java8 : java17

    console.log(javaVersionToUse);
    
    console.log("Extracting natives");

    await extractAllNatives(mcLibrariesArray.join(path.delimiter), path.join(instancesPath, instanceId, "natives"), path.join(javaPath, java17Version, java17Name, "bin", "jar"))

    console.log("natives extracted");

    console.log("here full args");
    console.log(fullMcArgs.join(" "));
    
    const proc = cp.spawn(javaVersionToUse, fullMcArgs, {cwd: path.join(instancesPath, instanceId)})
    
    console.log(proc.spawnargs);
    
    await updateInstanceDlState(instanceId, InstanceState.Playing)
    await switchDiscordRPCState(DiscordRPCState.InGame)

    mcProcs[instanceId] = proc

    proc.stdout.on("data", (data) => {
        console.log(data.toString("utf-8"));
    })

    proc.stderr.on("data", (data) => {
        console.error(data.toString("utf-8"));
    })

    proc.stdout.on("error", (err) => console.error(err))

    proc.on("close", async (code) => {
        switch (code) {
            case 0:
                console.log("Game stopped");
                break;
            case 1:
                console.error("Game stopped with error");
                break;
            case null:
                console.log("Game killed!");
                break; 
            default:
                break;
        }

        await updateInstanceDlState(instanceId, InstanceState.Playable)
        await switchDiscordRPCState(DiscordRPCState.InLauncher)

        delete mcProcs[instanceId]
    })
}

export function killGame(associatedInstanceId: string) {    
    if(mcProcs.hasOwnProperty(associatedInstanceId)) {
        mcProcs[associatedInstanceId].kill()
    }
}

export async function extractAllNatives(libraries: string, nativeFolder: string, javaLocation: string) {
    const allLibs = libraries.split(";")

    for (const e of allLibs) {
        console.log(e);
        cp.exec(javaLocation + " --list --file " + e, async (err, stdout, sdterr) => {
            const filesOfLibrary = stdout.split("\r\n")
            for (const n of filesOfLibrary) {
                if(err != null) {
                    console.error(err);
                }
                if (n.endsWith(".dll")) {
                    cp.exec(`${javaLocation} xf ${e} ${n}`, { cwd: nativeFolder });
                }
            }
        })
    }

    return true
}