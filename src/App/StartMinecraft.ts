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
    const data = await minecraftManifestForVersion("1.18.2") // FIXME: TEMP
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
                tempSplitedArgs[i] = "1.18.2"
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

    tempSplitedArgs.push("--launchTarget")
    tempSplitedArgs.push("forgeclient")

    tempSplitedArgs.push("--fml.forgeVersion")
    tempSplitedArgs.push("40.2.10")

    tempSplitedArgs.push("--fml.mcVersion")
    tempSplitedArgs.push("1.18.2")

    tempSplitedArgs.push("--fml.forgeGroup")
    tempSplitedArgs.push("net.minecraftforge")

    tempSplitedArgs.push("--fml.mcpVersion")
    tempSplitedArgs.push("20220404.173914")

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
    
    const installProfileFile = await fs.readFile(path.join(minecraftVersionPath, version, version + ".json"), "utf-8")
    const installProfileJson = JSON.parse(installProfileFile)

    let forgeArgs: string[] = []
    
    const forgeLibraries = installProfileJson.libraries

    for(const library of forgeLibraries) {
        forgeArgs.push(path.join(librariesPath, (mavenToArray(library.name)).join("/")))
    }

    // forgeArgs.push(path.join(librariesPath, `net/minecraftforge/forge/${version}/forge-${version}-universal.jar`))
    // forgeArgs.push(path.join(librariesPath, `net/minecraftforge/accesstransformers/8.0.4/accesstransformers-8.0.4.jar`))
    // forgeArgs.push(path.join(librariesPath, `net/minecraftforge/forgespi/4.0.15-4.x/forgespi-4.0.15-4.x.jar`))
    // forgeArgs.push(path.join(librariesPath, `net/minecraftforge/eventbus/5.0.3/eventbus-5.0.3.jar`))
    // forgeArgs.push(path.join(librariesPath, `net/minecraftforge/coremods/5.0.1/coremods-5.0.1.jar`))
    // forgeArgs.push(path.join(librariesPath, `net/minecraftforge/unsafe/0.2.0/unsafe-0.2.0.jar`))
    // forgeArgs.push(path.join(librariesPath, `net/minecraftforge/JarJarSelector/0.3.19/JarJarSelector-0.3.19.jar`))
    // forgeArgs.push(path.join(librariesPath, `net/minecraftforge/JarJarMetadata/0.3.19/JarJarMetadata-0.3.19.jar`))
    // forgeArgs.push(path.join(librariesPath, `net/minecraftforge/JarJarFileSystems/0.3.19/JarJarFileSystems-0.3.19.jar`))
    // forgeArgs.push(path.join(librariesPath, `net/minecraftforge/fmlloader/1.18.2-40.2.10/fmlloader-1.18.2-40.2.10.jar`))

    const forgeLibraryPathes = forgeArgs.join(";")
    // FIXME: END TEMP
    let librariesArg = minecraftLibraryList(data).join(";")
    const finalLibrariesArg = `${forgeLibraryPathes};${librariesArg};${path.join(minecraftVersionPath, "1.18.2", "1.18.2.jar")}`

    console.log(libraries);
    console.log('---');
    console.log(librariesArg);
    console.log('----');
    console.log(finalLibrariesArg); 

    jvmArgs.push(`-cp`)
    jvmArgs.push(`${finalLibrariesArg}`)

    const library_directory = librariesPath
    const classpath_separator = path.delimiter

    // jvmArgs.push(data["mainClass"])
    jvmArgs.push("-Djava.net.preferIPv6Addresses=system")
    jvmArgs.push("-DignoreList=bootstraplauncher,securejarhandler,asm-commons,asm-util,asm-analysis,asm-tree,asm,JarJarFileSystems,client-extra,fmlcore,javafmllanguage,lowcodelanguage,mclanguage,forge-,1.18.2.jar")
    jvmArgs.push("-DmergeModules=jna-5.10.0.jar,jna-platform-5.10.0.jar,java-objc-bridge-1.0.0.jar")
    jvmArgs.push("-DlibraryDirectory=" + librariesPath)
    jvmArgs.push("-p")
    jvmArgs.push(`${library_directory}/cpw/mods/bootstraplauncher/1.0.0/bootstraplauncher-1.0.0.jar${classpath_separator}${library_directory}/cpw/mods/securejarhandler/1.0.8/securejarhandler-1.0.8.jar${classpath_separator}${library_directory}/org/ow2/asm/asm-commons/9.5/asm-commons-9.5.jar${classpath_separator}${library_directory}/org/ow2/asm/asm-util/9.5/asm-util-9.5.jar${classpath_separator}${library_directory}/org/ow2/asm/asm-analysis/9.5/asm-analysis-9.5.jar${classpath_separator}${library_directory}/org/ow2/asm/asm-tree/9.5/asm-tree-9.5.jar${classpath_separator}${library_directory}/org/ow2/asm/asm/9.5/asm-9.5.jar${classpath_separator}${library_directory}/net/minecraftforge/JarJarFileSystems/0.3.19/JarJarFileSystems-0.3.19.jar`)
    jvmArgs.push("--add-modules")
    jvmArgs.push("ALL-MODULE-PATH")
    jvmArgs.push("--add-opens")
    jvmArgs.push("java.base/java.util.jar=cpw.mods.securejarhandler")
    jvmArgs.push("--add-opens")
    jvmArgs.push("java.base/java.lang.invoke=cpw.mods.securejarhandler")
    jvmArgs.push("--add-exports")
    jvmArgs.push("java.base/sun.security.util=cpw.mods.securejarhandler")
    jvmArgs.push("--add-exports")
    jvmArgs.push("jdk.naming.dns/com.sun.jndi.dns=java.naming")

    jvmArgs.push("cpw.mods.bootstraplauncher.BootstrapLauncher")
    
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