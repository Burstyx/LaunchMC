import { minecraftManifestForVersion } from "../Utils/HManifests"
import cp from "child_process"
import path from "path"
import { instancesPath, assetsPath, librariesPath, minecraftVersionPath, legacyAssetsPath, javaPath, java8Version, java17Version, loggingConfPath, indexesPath, gamePath, java8Name, java17Name, tempPath } from "../Utils/const"
import os from "os"
import fs from "fs/promises"
import { existsSync } from "fs"
import { downloadAndGetJavaVersion, JavaVersions, minecraftLibraryList } from "./DownloadGame"
import { getAllFile, makeDir, mavenToArray } from "../Utils/HFileManagement"
import { InstanceState, updateInstanceDlState } from "../Utils/HInstance"
import { DiscordRPCState, switchDiscordRPCState } from "./DIscordRPC"
import { getForgeInstallProfileIfExist, getForgeVersionIfExist } from "../Utils/HForge"
import { replaceAll } from "../Utils/Utils"

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
    version: string
}

let mcProcs: any = {}

export async function startMinecraft(version: string, instanceId: string, opt: MinecraftArgsOpt, forgeOpt?: ForgeArgsOpt) { // TODO: Get game libraries
    // TODO If map_to_ressource == true -> object dans legacy

    // Get Minecraft version manifest
    const mcData = await minecraftManifestForVersion(version)
    await updateInstanceDlState(instanceId, InstanceState.Loading)

    
    // Get Forge version manifest
    const isForgeVersion = forgeOpt != undefined
    const forgeData = isForgeVersion ? await getForgeVersionIfExist(version, forgeOpt.version) : undefined
    const forgeInstallProfileData = isForgeVersion ? await getForgeInstallProfileIfExist(version, forgeOpt.version) : undefined

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

    // Get all Forge arguments
    var forgeGameArgs
    var forgeJvmArgs
    if(forgeData != undefined) {
        if(forgeData.arguments) {
            forgeGameArgs = forgeData.arguments.game
            forgeJvmArgs = forgeData.arguments.jvm
        }

        console.error("No forge arguments found.");
    }

    // Parse Minecraft arguments
    let parsedMcArgs = mcArgs.split(" ")
    for (let i = 0; i < parsedMcArgs.length; i++) {
        switch (parsedMcArgs[i]) {
            case "${auth_player_name}":
                parsedMcArgs[i] = opt.username
                break;
            case "${version_name}":
                parsedMcArgs[i] = "1.18.2"
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
    if(forgeJvmArgs != undefined && forgeGameArgs != undefined) {
        // Parse forge game args
        parsedForgeGameArgsArray = forgeGameArgs

        console.log("called01");
        

        // Parse forge jvm args
        parsedForgeJvmArgsArray = forgeJvmArgs
        
        for (let i = 0; i < parsedForgeJvmArgsArray.length; i++) {
            console.log("called02");
            
            parsedForgeJvmArgsArray[i] = replaceAll(parsedForgeJvmArgsArray[i], "${library_directory}", librariesPath)
            parsedForgeJvmArgsArray[i] = replaceAll(parsedForgeJvmArgsArray[i], "${classpath_separator}", path.delimiter)
            parsedForgeJvmArgsArray[i] = replaceAll(parsedForgeJvmArgsArray[i], "${version_name}", version)
        }

        forgeGameArgs = parsedForgeGameArgsArray
        forgeJvmArgs = parsedForgeJvmArgsArray
    }

    // Building jvm args
    var jvmArgs = []
    
    // Set min and max allocated ram
    jvmArgs.push("-Xms2048M")
    jvmArgs.push("-Xmx4096M")

    // Intel optimization
    jvmArgs.push("-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump")

    // Set natives path
    jvmArgs.push("-Djava.library.path=" + await makeDir(path.join(instancesPath, instanceId, "natives")))

    // Set classpaths
    let classPathes: string[] = []

    let mcLibrariesArray = minecraftLibraryList(mcData)
    mcLibrariesArray.push(path.join(minecraftVersionPath, "1.18.2", "1.18.2.jar"))

    let forgeLibrariesArray = isForgeVersion ? forgeData.libraries.concat(forgeInstallProfileData.libraries).map((lib: {downloads: {artifact: {path: string}}}) => path.join(librariesPath, lib.downloads.artifact.path)) : undefined
    
    classPathes = isForgeVersion ? forgeLibrariesArray.concat(mcLibrariesArray) : mcLibrariesArray

    jvmArgs.push(`-cp`)
    jvmArgs.push(`${classPathes.join(path.delimiter)}`)

    console.log(classPathes);

    // const library_directory = librariesPath
    // const classpath_separator = path.delimiter

    // // jvmArgs.push(data["mainClass"])
    // jvmArgs.push("-Djava.net.preferIPv6Addresses=system")
    // jvmArgs.push("-DignoreList=bootstraplauncher,securejarhandler,asm-commons,asm-util,asm-analysis,asm-tree,asm,JarJarFileSystems,client-extra,fmlcore,javafmllanguage,lowcodelanguage,mclanguage,forge-,1.18.2.jar")
    // jvmArgs.push("-DmergeModules=jna-5.10.0.jar,jna-platform-5.10.0.jar,java-objc-bridge-1.0.0.jar")
    // jvmArgs.push("-DlibraryDirectory=" + librariesPath)
    // jvmArgs.push("-p")
    // jvmArgs.push(`${library_directory}/cpw/mods/bootstraplauncher/1.0.0/bootstraplauncher-1.0.0.jar${classpath_separator}${library_directory}/cpw/mods/securejarhandler/1.0.8/securejarhandler-1.0.8.jar${classpath_separator}${library_directory}/org/ow2/asm/asm-commons/9.5/asm-commons-9.5.jar${classpath_separator}${library_directory}/org/ow2/asm/asm-util/9.5/asm-util-9.5.jar${classpath_separator}${library_directory}/org/ow2/asm/asm-analysis/9.5/asm-analysis-9.5.jar${classpath_separator}${library_directory}/org/ow2/asm/asm-tree/9.5/asm-tree-9.5.jar${classpath_separator}${library_directory}/org/ow2/asm/asm/9.5/asm-9.5.jar${classpath_separator}${library_directory}/net/minecraftforge/JarJarFileSystems/0.3.19/JarJarFileSystems-0.3.19.jar`)
    // jvmArgs.push("--add-modules")
    // jvmArgs.push("ALL-MODULE-PATH")
    // jvmArgs.push("--add-opens")
    // jvmArgs.push("java.base/java.util.jar=cpw.mods.securejarhandler")
    // jvmArgs.push("--add-opens")
    // jvmArgs.push("java.base/java.lang.invoke=cpw.mods.securejarhandler")
    // jvmArgs.push("--add-exports")
    // jvmArgs.push("java.base/sun.security.util=cpw.mods.securejarhandler")
    // jvmArgs.push("--add-exports")
    // jvmArgs.push("jdk.naming.dns/com.sun.jndi.dns=java.naming")

    isForgeVersion ? jvmArgs.push(...forgeJvmArgs) : null
    isForgeVersion ? mcArgs.push(...forgeGameArgs) : null

    jvmArgs.push(isForgeVersion ? forgeData.mainClass : mcData.mainClass)
    
    const fullMcArgs = [...jvmArgs, ...mcArgs]
    console.log(fullMcArgs);

    // Find correct java executable
    const java8Path = await downloadAndGetJavaVersion(JavaVersions.JDK8)
    const java17Path = await downloadAndGetJavaVersion(JavaVersions.JDK17)

    const java8 = path.join(java8Path, "javaw")
    const java17 = path.join(java17Path, "javaw")

    const javaVersion = mcData["javaVersion"]["majorVersion"]

    const javaVersionToUse = javaVersion >= 16 ? java17 : java8

    console.log(javaVersionToUse);
    

    console.log("Extracting natives");

    await extractAllNatives(classPathes.join(path.delimiter), path.join(instancesPath, instanceId, "natives"), path.join(javaPath, java17Version, java17Name, "bin", "jar"))

    console.log("natives extracted");

    console.log("here full args");
    console.log(fullMcArgs.join(" "));
    
    const proc = cp.spawn(javaVersionToUse, fullMcArgs)
    console.log("test");
    
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