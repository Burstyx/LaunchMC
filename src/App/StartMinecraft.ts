import { minecraftManifestForVersion } from "../Utils/HManifests"
import cp from "child_process"
import path from "path"
import {
    assetsPath,
    librariesPath,
    minecraftVersionPath,
    javaPath,
    java17Version,
    java17Name,
    serversInstancesPath, gameRam
} from "../Utils/const"
import { downloadAndGetJavaVersion, JavaVersions, minecraftLibraryList, parseRule } from "./DownloadGame"
import { mavenToArray } from "../Utils/HFileManagement"
import { getForgeVersionIfExist } from "../Utils/HForge"
import { removeDuplicates, replaceAll } from "../Utils/Utils"
import semver from "semver"
import fs from "fs/promises";
import {makeConsoleDirty} from "./GameConsole";
import {getSetting} from "../Utils/Options";

interface MinecraftArgsOpt {
    version: string,
    username: string,
    uuid: string,
    accessToken: string,
    isDemoUser?: boolean,
    resolution?: {
        width: number,
        height: number
    }
}

let mcProc: any = {}
export let logs: any = {}

type CallbackGameStopped = (code: any) => void;

export async function startMinecraft(name: string, mcOpts: MinecraftArgsOpt, gameStoppedCallback: CallbackGameStopped, forgeId?: string) {
    return new Promise<void>(async (resolve, reject) => {
        await minecraftManifestForVersion(mcOpts.version).then(async (mcData) => {
            const isForgeVersion = forgeId != undefined

            let forgeData: any = null
            if(isForgeVersion) {
                await getForgeVersionIfExist(forgeId).then((data) => {
                    forgeData = data;
                }).catch((err) => reject(err))
            }

            let mcArgs = mcData["minecraftArguments"];
            if (mcArgs == null) {
                mcArgs = ""
                for (let i = 0; i < mcData["arguments"]["game"].length; i++) {
                    if (typeof mcData["arguments"]["game"][i] == "string") {
                        mcArgs += mcData["arguments"]["game"][i] + " "
                    }
                }
            }

            let forgeReplaceMcArgs = false

            let forgeGameArgs;
            let forgeJvmArgs;
            if(forgeData != undefined) {
                if(forgeData["arguments"]) {
                    forgeGameArgs = forgeData["arguments"]["game"]
                    forgeJvmArgs = forgeData["arguments"]["jvm"]
                }
                else if(forgeData["minecraftArguments"]) {
                    forgeReplaceMcArgs = true
                    forgeGameArgs = forgeData["minecraftArguments"].split(" ")
                }
                else if(forgeData["versionInfo"]["minecraftArguments"]) {
                    forgeReplaceMcArgs = true
                    forgeGameArgs = forgeData["versionInfo"]["minecraftArguments"].split(" ")
                }
            }

            let parsedMcArgs = forgeReplaceMcArgs ? forgeGameArgs : mcArgs.split(" ")
            for (let i = 0; i < parsedMcArgs.length; i++) {
                switch (parsedMcArgs[i]) {
                    case "${auth_player_name}":
                        parsedMcArgs[i] = mcOpts.username
                        break;
                    case "${version_name}":
                        parsedMcArgs[i] = mcOpts.version
                        break;
                    case "${game_directory}":
                        parsedMcArgs[i] = path.join(serversInstancesPath, name)
                        break;
                    case "${assets_root}":
                        parsedMcArgs[i] = assetsPath
                        break;
                    case "${assets_index_name}":
                        parsedMcArgs[i] = mcData["assets"]
                        break;
                    case "${auth_uuid}":
                        parsedMcArgs[i] = mcOpts.uuid
                        break;
                    case "${auth_access_token}":
                        parsedMcArgs[i] = mcOpts.accessToken
                        break;
                    case "${user_properties}":
                        parsedMcArgs[i] = "{}"
                        break;
                    case "${user_type}":
                        parsedMcArgs[i] = "msa"
                        break;
                    case "${version_type}":
                        parsedMcArgs[i] = "custom"
                        break;
                    case "${game_assets}":
                        // if(!existsSync(legacyAssetsPath))
                        //     await fs.mkdir(legacyAssetsPath, {recursive: true}) // TODO: Assets don't work for pre-1.6 version
                        parsedMcArgs[i] = path.join(serversInstancesPath, name, "resources")
                        break;
                    case "${auth_session}":
                        parsedMcArgs[i] = "OFFLINE"
                        break;
                    default:
                        break;
                }
            }

            mcArgs = parsedMcArgs

            const gameWidth = await getSetting("game_window_width", undefined)
            if(gameWidth) mcArgs.push("--width", gameWidth)

            const gameHeight = await getSetting("game_window_height", undefined)
            if(gameHeight) mcArgs.push("--height", gameHeight)

            let parsedForgeGameArgsArray
            let parsedForgeJvmArgsArray
            if(forgeJvmArgs != undefined) {
                parsedForgeJvmArgsArray = forgeJvmArgs

                for (let i = 0; i < parsedForgeJvmArgsArray.length; i++) {
                    parsedForgeJvmArgsArray[i] = replaceAll(parsedForgeJvmArgsArray[i], "${library_directory}", librariesPath)
                    parsedForgeJvmArgsArray[i] = replaceAll(parsedForgeJvmArgsArray[i], "${classpath_separator}", path.delimiter)
                    parsedForgeJvmArgsArray[i] = replaceAll(parsedForgeJvmArgsArray[i], "${version_name}", mcOpts.version)
                }

                forgeJvmArgs = parsedForgeJvmArgsArray
            }

            if(forgeGameArgs != undefined && !forgeReplaceMcArgs) {
                parsedForgeGameArgsArray = forgeGameArgs
                forgeGameArgs = parsedForgeGameArgsArray
            }

            let jvmArgs = [];

            const ram = await getSetting("game_allocated_ram", gameRam)
            jvmArgs.push(`-Xmx${ram}M`)

            // Intel optimization
            jvmArgs.push("-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump")

            // Ignore Invalid Certificates Verification
            jvmArgs.push("-Dfml.ignoreInvalidMinecraftCertificates=true")

            // Ignore FML check for jar injection
            jvmArgs.push("-Dfml.ignorePatchDiscrepancies=true")

            await fs.mkdir(path.join(serversInstancesPath, name, "natives"), {recursive: true}).catch((err) => reject(err))
            jvmArgs.push(`-Djava.library.path=${path.join(serversInstancesPath, name, "natives")}`)

            let classPaths: string[]

            let mcLibrariesArray = minecraftLibraryList(mcData)
            mcLibrariesArray.push(path.join(minecraftVersionPath, mcOpts.version, `${mcOpts.version}.jar`))

            const librariesPathInJson = isForgeVersion ? forgeData["libraries"] ? forgeData["libraries"] : forgeData["versionInfo"]["libraries"] : undefined
            const forgeLibrariesArray = isForgeVersion ? librariesPathInJson.filter((lib: any) => {
                if(lib["rules"]) {
                    return parseRule(lib["rules"])
                }

                return true
            }).map((lib: any) => {
                if(lib["downloads"]) {
                    return path.join(librariesPath, lib["downloads"]["artifact"]["path"])
                } else {
                    return path.join(librariesPath, mavenToArray(lib.name).join("/"))
                }
            }) : undefined

            classPaths = removeDuplicates(isForgeVersion ? forgeLibrariesArray.concat(mcLibrariesArray) : mcLibrariesArray)

            jvmArgs.push(`-cp`)
            jvmArgs.push(`${classPaths.join(path.delimiter)}`)

            jvmArgs = isForgeVersion && forgeJvmArgs != undefined ? jvmArgs.concat(...forgeJvmArgs) : jvmArgs
            mcArgs = isForgeVersion && forgeGameArgs != undefined && !forgeReplaceMcArgs ? mcArgs.concat(...forgeGameArgs) : mcArgs

            jvmArgs.push(isForgeVersion ? forgeData["mainClass"] ? forgeData["mainClass"] : forgeData["versionInfo"]["mainClass"] : mcData["mainClass"])

            const fullMcArgs = [...jvmArgs, ...mcArgs].filter((val, _) => val != "")

            // Find correct java executable
            let java8Path: string = ""
            await downloadAndGetJavaVersion(JavaVersions.JDK8).then((res) => {
                java8Path = res;
            }).catch((err) => reject(err))

            let java17Path: string = ""
            await downloadAndGetJavaVersion(JavaVersions.JDK17).then((res) => {
                java17Path = res
            }).catch((err) => reject(err))

            const java8 = path.join(java8Path, "javaw")
            const java17 = path.join(java17Path, "javaw")

            const semverVersionCompatibility = mcOpts.version.split(".").length == 2 ? mcOpts.version + ".0" : mcOpts.version

            const below117 = semver.lt(semverVersionCompatibility, "1.17.0")

            const javaVersionToUse = below117 ? java8 : java17

            await extractAllNatives(mcLibrariesArray.join(path.delimiter), path.join(serversInstancesPath, name, "natives"), path.join(javaPath, java17Version, java17Name, "bin", "jar")).catch((err) => reject(err))

            const proc = cp.spawn(javaVersionToUse, fullMcArgs, {cwd: path.join(serversInstancesPath, name)})

            console.log(proc.spawnargs);

            mcProc[name] = proc
            logs[name] = []

            proc.stdout.on("data", (data) => {
                logs[name].push({"message": data.toString("utf8"), "type": "info"})
                makeConsoleDirty(name)
            })

            proc.stderr.on("data", (data) => {
                logs[name].push({"message": data.toString("utf8"), "type": "err"})
                makeConsoleDirty(name)
            })

            proc.on("error", (err) => {
                delete mcProc[name]
                delete logs[name]

                gameStoppedCallback(err)
            })

            proc.on("close", async (code) => {
                delete mcProc[name]
                delete logs[name]

                gameStoppedCallback(code)
            })

            resolve()
        }).catch((err) => reject(err))
    })
}

export function killGame(name: string) {
    if(mcProc.hasOwnProperty(name)) {
        mcProc[name].kill()

        delete mcProc[name]
        delete logs[name]

        return true;
    }
    return false;
}

export function extractAllNatives(libraries: string, nativeFolder: string, javaLocation: string) {
    return new Promise<void>((resolve, reject) => {
        const allLibs = libraries.split(";")

        for (const e of allLibs) {
            console.log(e);
            cp.exec(javaLocation + " --list --file " + e,(err, stdout) => {
                const filesOfLibrary = stdout.split("\r\n")
                for (const n of filesOfLibrary) {
                    if(err != null) {
                        reject(err)
                    }
                    if (n.endsWith(".dll")) {
                        cp.exec(`${javaLocation} xf ${e} ${n}`, { cwd: nativeFolder });
                    }
                }
            })
        }

        resolve()
    })
}