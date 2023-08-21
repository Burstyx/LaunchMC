import { minecraftManifestForVersion } from "../Utils/HManifests"
import cp from "child_process"
import path from "path"
import { instancesPath, assetsPath, librariesPath, minecraftVersionPath, legacyAssetsPath, javaPath, java8Version, java17Version, loggingConfPath, indexesPath, gamePath, java8Name, java17Name } from "../Utils/const"
import os from "os"
import fs from "fs/promises"
import { existsSync } from "fs"
import { downloadAndGetJavaVersion, JavaVersions, minecraftLibraryList } from "./DownloadGame"
import { getAllFile, makeDir, mavenToArray } from "../Utils/HFileManagement"
import { InstanceState, updateInstanceDlState } from "../Utils/HInstance"
import { DiscordRPCState, switchDiscordRPCState } from "./DIscordRPC"

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

let mcProcs: any = {}

export async function startMinecraft(version: string, instanceId: string, opt: MinecraftArgsOpt) { // TODO: Get game libraries
    // TODO If map_to_ressource == true -> object dans legacy
    const data = await minecraftManifestForVersion("1.12.2") // FIXME: TEMP
    await updateInstanceDlState(instanceId, InstanceState.Loading)

    // Get all Minecraft arguments
    var mcArgs = data["minecraftArguments"]
    if (mcArgs == null) {
        mcArgs = ""
        for (let i = 0; i < data["arguments"]["game"].length; i++) {
            if (typeof data["arguments"]["game"][i] == "string") {
                mcArgs += data["arguments"]["game"][i] + " "
            }
        }
    }

    // Parse Minecraft arguments
    let tempSplitedArgs = mcArgs.split(" ")
    console.log(tempSplitedArgs);

    for (let i = 0; i < tempSplitedArgs.length; i++) {
        switch (tempSplitedArgs[i]) {
            case "${auth_player_name}":
                tempSplitedArgs[i] = opt.username
                break;
            case "${version_name}":
                tempSplitedArgs[i] = "1.12.2"
                break;
            case "${game_directory}":
                tempSplitedArgs[i] = path.join(instancesPath, instanceId)
                break;
            case "${assets_root}":
                tempSplitedArgs[i] = assetsPath
                break;
            case "${assets_index_name}":
                tempSplitedArgs[i] = data.assets
                break;
            case "${auth_uuid}":
                tempSplitedArgs[i] = opt.uuid
                break;
            case "${auth_access_token}":
                tempSplitedArgs[i] = opt.accesstoken
                break;
            case "${user_properties}":
                tempSplitedArgs[i] = "{}"
                break;
            case "${user_type}":
                tempSplitedArgs[i] = "msa"
                break;
            case "${version_type}":
                tempSplitedArgs[i] = opt.versiontype
                break;
            case "${game_assets}":
                // if(!existsSync(legacyAssetsPath))
                //     await fs.mkdir(legacyAssetsPath, {recursive: true}) // TODO: Assets don't work for pre-1.6 version
                tempSplitedArgs[i] = path.join(instancesPath, instanceId, "resources")
                break;
            case "${auth_session}":
                tempSplitedArgs[i] = "OFFLINE"
                break;
            default:
                break;
        }
    }

    tempSplitedArgs.push("--tweakClass")
    tempSplitedArgs.push("net.minecraftforge.fml.common.launcher.FMLTweaker")
    mcArgs = tempSplitedArgs
    // mcArgs += " --tweakClass net.minecraftforge.fml.common.launcher.FMLTweaker" // FIXME: TEMP

    console.log(mcArgs);

    // Set command arguments
    var jvmArgs = []
    jvmArgs.push("-Xms2048M")
    jvmArgs.push("-Xmx4096M")

    jvmArgs.push("-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump")

    jvmArgs.push("-Djava.library.path=" + await makeDir(path.join(instancesPath, instanceId, "natives")))

    const libraries = await getAllFile(librariesPath)
    
    // FIXME: START TEMP
    const installProfileFile = await fs.readFile(path.join(gamePath, "install_profile.json"), "utf-8")
    const installProfileJson = JSON.parse(installProfileFile)

    let forgeArgs: string[] = []
    forgeArgs.push(path.join(librariesPath, (await mavenToArray(installProfileJson.install.path)).join("/")))
    
    const forgeLibraries = installProfileJson.versionInfo.libraries

    for(const library of forgeLibraries) {
        if(library.name.includes("minecraftforge") || library.name.includes("forge")) {
            console.log("Skip " + library.name);
            
            continue
        }

        forgeArgs.push(path.join(librariesPath, (await mavenToArray(library.name)).join("/")))
    }

    const forgeLibraryPathes = forgeArgs.join(";")
    // FIXME: END TEMP
    let librariesArg = minecraftLibraryList(data).join(";")
    const finalLibrariesArg = `${forgeLibraryPathes};${librariesArg}`

    console.log(libraries);
    console.log('---');
    console.log(librariesArg);
    console.log('----');
    console.log(finalLibrariesArg); 

    jvmArgs.push(`-cp`)
    jvmArgs.push(`${finalLibrariesArg};${path.join(minecraftVersionPath, "1.12.2", `${"1.12.2"}.jar`)}`)

    // jvmArgs.push(data["mainClass"])
    jvmArgs.push("net.minecraft.launchwrapper.Launch")

    const fullMcArgs = [...jvmArgs, ...mcArgs]
    console.log(fullMcArgs);

    // Find correct java executable
    const java8Path = await downloadAndGetJavaVersion(JavaVersions.JDK8)
    const java17Path = await downloadAndGetJavaVersion(JavaVersions.JDK17)

    const java8 = path.join(java8Path, "javaw")
    const java17 = path.join(java17Path, "javaw")

    const javaVersion = data["javaVersion"]["majorVersion"]

    const javaVersionToUse = javaVersion >= 16 ? java17 : java8

    console.log(javaVersionToUse);
    

    console.log("Extracting natives");

    // TEMP
    await extractAllNatives(librariesArg, path.join(instancesPath, instanceId, "natives"), path.join(javaPath, java17Version, java17Name, "bin", "jar"))

    console.log("natives extracted");

    console.log("here full args");
    console.log(fullMcArgs.join(" "));
    
    
    const proc = cp.spawn(javaVersionToUse, fullMcArgs)
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