import { extractSpecificFile, mavenToArray, readJarMetaInf } from "../Utils/HFileManagement"
import { existsSync } from "original-fs"
import { minecraftManifestForVersion } from "../Utils/HManifests"
import { downloadAsync } from "../Utils/HDownload"
import {
    indexesPath,
    java17Name,
    java17Url,
    java17Version,
    java8Name,
    java8Url,
    java8Version,
    javaPath,
    librariesPath,
    minecraftVersionPath,
    objectPath,
    resourcePackage,
    serversInstancesPath,
    tempPath
} from "../Utils/const"
import path from "path"
import fs from "fs/promises"
import os from "os"
import cp from "child_process"
import { getForgeInstallProfileIfExist, getForgeInstallerForVersion, getForgeVersionIfExist } from "../Utils/HForge"
import { osToMCFormat } from "../Utils/Utils"

export async function downloadMinecraft(version: string, instanceName: string) {
    return new Promise<void>(async (resolve, reject) => {

        //updateInstanceDlProgress(instanceId, 0)

        let numberOfLibrariesToDownload = 0
        let numberOfLibrariesDownloaded = 0

        let numberOfAssetsToDownload = 0
        let numberOfAssetsDownloaded = 0

        let totalSizeToDl = 0 // TODO: Compute this to track dl efficiently
        let currentDownloadedSize = 0

        await minecraftManifestForVersion(version).then(async (versionDataManifest) => {
            await fs.mkdir(indexesPath, {recursive: true}).catch((err) => {
                reject(err)
            })

            await downloadAsync(versionDataManifest["assetIndex"]["url"], path.join(indexesPath, versionDataManifest["assetIndex"]["id"] + ".json"), (progress: number) => {
                console.log(`Progression: ${progress}% du téléchargement du manifest des assets`);
            }, {
                retry: {
                    count: 3,
                    timeout: 2500
                },
                hash: versionDataManifest["assetIndex"]["sha1"]
            }).catch((err) => reject(err))

            let indexDataManifest: any;
            await fs.readFile(path.join(indexesPath, versionDataManifest["assetIndex"]["id"] + ".json"), "utf8").then((res) => {
                indexDataManifest = JSON.parse((res))
            }).catch((err) => reject(err))

            if (indexDataManifest === null) return

            numberOfLibrariesToDownload = versionDataManifest["libraries"].length
            for (const _ in indexDataManifest["objects"]) {
                numberOfAssetsToDownload++
            }

            const clientSize = versionDataManifest["downloads"]["client"]["size"]
            const assetsSize = versionDataManifest["assetIndex"]["totalSize"]
            const librariesSize = minecraftLibraryTotalSize(versionDataManifest)

            totalSizeToDl = clientSize + assetsSize + librariesSize

            await fs.mkdir(minecraftVersionPath, {recursive: true}).catch((err) => reject(err))

            await downloadAsync(versionDataManifest["downloads"]["client"]["url"], path.join(minecraftVersionPath, version, `${versionDataManifest.id}.jar`), (progress, byteSent) => {
                console.log(`Progression: ${progress}% du téléchargement du client de jeu`);

                currentDownloadedSize += byteSent

                //updateInstanceDlProgress(instanceId, (currentDownloadedSize * 100) / totalSizeToDl)
            }, {
                retry: {
                    count: 3,
                    timeout: 2500
                },
                hash: versionDataManifest["downloads"]["client"]["sha1"]
            }).catch((err) => reject(err))

            console.log("[INFO] Téléchargement des librairies");

            for (let i = 0; i < versionDataManifest["libraries"].length; i++) {
                await downloadMinecraftLibrary(versionDataManifest, i).then((fetchedByte) => {
                    numberOfLibrariesDownloaded++

                    console.log(`Progression: ${numberOfLibrariesDownloaded * 100 / numberOfLibrariesToDownload}% du téléchargement des libraries`);
                    currentDownloadedSize += fetchedByte

                    //updateInstanceDlProgress(instanceId, (currentDownloadedSize * 100) / totalSizeToDl)
                }).catch((err) => reject(err))
            }

            for (const e in indexDataManifest["objects"]) {
                console.log(`Progression: ${numberOfAssetsDownloaded * 100 / numberOfAssetsToDownload}`);

                const hash = indexDataManifest["objects"][e]["hash"]
                const subhash = hash.substring(0, 2)

                await fs.mkdir(path.join(objectPath, subhash), {recursive: true}).catch((err) => reject(err))

                /*const fullPath = path.join(serversInstancesPath, instanceName, "resources", e)
                const fileName = fullPath.split("\\").pop()
                const dirPath = fullPath.substring(0, fullPath.indexOf(fileName!))

                await fs.mkdir(dirPath, {recursive: true}).catch((err) => reject(err))*/

                await downloadAsync(path.join(resourcePackage, subhash, hash), path.join(objectPath, subhash, hash), (progress, byteSend) => {
                    currentDownloadedSize += byteSend

                    //updateInstanceDlProgress(instanceId, (currentDownloadedSize * 100) / totalSizeToDl)
                }, {
                    retry: {
                        count: 3,
                        timeout: 2500
                    },
                    hash: hash
                }).catch((err) => reject(err))

                numberOfAssetsDownloaded++
            }

            resolve()
        })
    })
}

export async function patchInstanceWithForge(instanceId: string, mcVersion: string, forgeId: string) {
    return new Promise<void>(async (resolve, reject) => {
        //await updateInstanceDlState(instanceId, InstanceState.Patching)

        await downloadAndGetJavaVersion(JavaVersions.JDK17).then(async (java17Path) => {
            // FIXME: Download forge installer, work only for all versions after 1.5.2
            await getForgeInstallerForVersion(forgeId).then(async (forgeInstallerPath) => {
                await getForgeInstallProfileIfExist(forgeId).then(async (forgeInstallProfileData) => {
                    // Get all libraries to download
                    let libraries: any
                    if(!forgeInstallProfileData["versionInfo"]) libraries = forgeInstallProfileData["libraries"]
                    else libraries = forgeInstallProfileData["versionInfo"]["libraries"]

                    if(forgeInstallProfileData.json) {
                        await getForgeVersionIfExist(forgeId).then((forgeVersionData) => {
                            libraries = libraries.concat(forgeVersionData["libraries"])
                        }).catch((err) => reject(err))
                    }

                    // Skip forge extract and download it instead
                    let skipForgeExtract = false
                    if(!forgeInstallProfileData["path"] && !forgeInstallProfileData["install"]["filePath"]) {
                        skipForgeExtract = true
                    }

                    for(const library of libraries) {
                        console.log("Downloading: " + library["name"]);

                        let natives = ""

                        if(library["rules"]) {
                            if(!parseRule(library["rules"])) {
                                console.log("Rule don't allow the download of this library, skipping.");
                                continue
                            }
                        }

                        if(library["natives"]) {
                            natives = library["natives"][osToMCFormat(process.platform)]
                        }

                        const libraryPath = (mavenToArray(library.name, natives != "" ? `-${natives}` : undefined)).join("/");

                        if(library["downloads"]["artifact"]) {
                            const dlLink = library["downloads"]["artifact"]["url"]
                            const hash = library["downloads"]["artifact"]["sha1"]
                            const dlDest = library["downloads"]["artifact"]["path"]

                            // If not url as been assigned
                            if(dlLink == "") {
                                const fileToFetch = `maven/${library["downloads"]["artifact"]["path"]}`
                                const destFile = `${librariesPath}/${library["downloads"]["artifact"]["path"]}`

                                await extractSpecificFile(forgeInstallerPath, fileToFetch, destFile).catch((err) => reject(err))
                            } else {
                                await downloadAsync(dlLink, path.join(librariesPath, dlDest), undefined, {
                                    retry: {
                                        count: 3,
                                        timeout: 2500
                                    },
                                    hash: hash
                                }).catch((err) => reject(err))
                            }
                        }
                        else if (library["name"].includes("net.minecraftforge:forge:") || library["name"].includes("net.minecraftforge:minecraftforge:")) {
                            console.log("Skip " + library.name);
                        }
                        else if(library["url"]) {
                            const forgeBaseUrl = "https://maven.minecraftforge.net/"
                            await downloadAsync(`${forgeBaseUrl}${libraryPath}`, path.join(librariesPath, libraryPath), undefined, {
                                retry: {
                                    count: 3,
                                    timeout: 2500
                                },
                                hash: library["url"].hasOwnProperty("checksums") ? library["url"]["checksums"][0] : undefined
                            }).catch((err) => reject(err));
                        }
                        else if(!library["url"]) {
                            await downloadAsync(`https://libraries.minecraft.net/${libraryPath}`, path.join(librariesPath, libraryPath)).catch((err) => reject(err));
                        }
                        else {
                            console.error("Case not handled or just it won't work");
                        }
                    }

                    if(!skipForgeExtract) {
                        const jarFilePathInInstaller = forgeInstallProfileData["path"] || (forgeInstallProfileData["install"] && forgeInstallProfileData["install"]["filePath"])
                        const jarFileDestPath = mavenToArray(forgeInstallProfileData["path"] || (forgeInstallProfileData["install"] && forgeInstallProfileData["install"]["path"]))

                        const forgeJarPathWithoutFile = jarFileDestPath.slice(0, jarFileDestPath.length - 1).join("/")

                        await fs.mkdir(path.join(librariesPath, forgeJarPathWithoutFile), {recursive: true}).catch((err) => reject(err))

                        // Fetch the jar in the installer
                        if(forgeInstallProfileData["install"] && forgeInstallProfileData["install"]["filePath"]) {
                            await extractSpecificFile(forgeInstallerPath, jarFilePathInInstaller, path.join(librariesPath, jarFileDestPath.join("/"))).catch((err) => reject(err))
                        }

                        // Search for the jar in maven folder in the installer
                        else if(forgeInstallProfileData["path"]) {
                            await extractSpecificFile(forgeInstallerPath, path.join("maven", jarFileDestPath.join("/")), path.join(librariesPath, jarFileDestPath.join("/"))).catch((err) => reject(err))
                        }
                    }

                    if(forgeInstallProfileData["processors"].length > 0) {
                        console.log("Patching Forge");

                        const universalJarPath = forgeInstallProfileData["libraries"].find((lib: {name: string}) => lib.name.startsWith("net.minecraftforge:forge"))["downloads"]["artifact"]["path"]

                        // Getting client.lzma from installer
                        await extractSpecificFile(forgeInstallerPath,
                            "data/client.lzma", path.join(librariesPath, forgeInstallProfileData["path"] ?
                                (mavenToArray(forgeInstallProfileData["path"], "-universal-clientdata", "lzma")).join("/") :
                                universalJarPath.slice(0, -4) + "-clientdata.lzma"))
                            .catch((err) => reject(err))

                        const { processors } = forgeInstallProfileData

                        for(const key in processors) {
                            const p = processors[key]

                            console.log("Patching with " + p["jar"]);

                            if(!p["sides"] || p["sides"].includes("client")) {
                                const replaceDataArg = (arg: string) => {
                                    const finalArg = arg.replace("{", "").replace("}", "")
                                    if(forgeInstallProfileData["data"][finalArg]) {
                                        if(finalArg == "BINPATCH") {
                                            return path.join(librariesPath, universalJarPath || mavenToArray(forgeInstallProfileData["path"]).join("/")).slice(0, -4) + "-clientdata.lzma"
                                        }

                                        let res: string = forgeInstallProfileData["data"][finalArg]["client"]

                                        return res
                                    }

                                    return arg
                                        .replace("{SIDE}", "client")
                                        .replace("{ROOT}", `"${tempPath}"`)
                                        .replace("{MINECRAFT_JAR}", `"${path.join(minecraftVersionPath, forgeInstallProfileData["minecraft"], forgeInstallProfileData["minecraft"] + ".jar")}"`)
                                        .replace("{MINECRAFT_VERSION}", `"${path.join(minecraftVersionPath, forgeInstallProfileData["minecraft"], forgeInstallProfileData["minecraft"] + ".json")}"`)
                                        .replace("{INSTALLER}", `"${path.join(tempPath, forgeInstallProfileData["version"] + ".jar")}"`)
                                        .replace("{LIBRARY_DIR}", `"${librariesPath}"`)
                                }

                                const formatPath = (pathToFormat: string) => {
                                    if(pathToFormat.startsWith("[")) {
                                        pathToFormat = pathToFormat.replace("[", "").replace("]", "")
                                        pathToFormat = (mavenToArray(pathToFormat)).join("/")

                                        return `"${path.join(librariesPath, pathToFormat)}"`
                                    }

                                    return pathToFormat
                                }

                                const jarPath = path.join(librariesPath, ...(mavenToArray(p["jar"])))
                                const args = p["args"].map((arg: string) => replaceDataArg(arg))
                                    .map((arg: string) => formatPath(arg))
                                const classPaths = p["classpath"].map((cp: string) => `"${path.join(librariesPath, ...(mavenToArray(cp)))}"`)

                                console.log(classPaths);

                                await readJarMetaInf(jarPath, "Main-Class").then(async (mainClass) => {
                                    await new Promise<void>((resolve, reject) => {
                                        const proc = cp.spawn(`"${path.join(java17Path, "javaw")}"`, ['-classpath', [`"${jarPath}"`, ...classPaths].join(path.delimiter), mainClass, ...args], {shell: true})

                                        proc.stdout.on("data", data => console.log(data.toString()))
                                        proc.stderr.on("data", err => reject(err))
                                        proc.on("close", () => resolve())
                                    }).catch((err) => reject(err))
                                }).catch((err) => reject(err))
                            }
                        }
                    }

                    resolve()
                }).catch((err) => reject(err))
            }).catch((err) => reject(err))
        }).catch((err) => reject(err))
    })
}

// Download Minecraft libraries
async function downloadMinecraftLibrary(data: any, i: number) {
    return new Promise<number>(async (resolve, reject) => {
        let fetchedByte = 0;

        if (data["libraries"][i].hasOwnProperty("rules")) {
            if (!parseRule(data["libraries"][i]["rules"])) {
                resolve(0)
            }
        }

        if (data["libraries"][i]["downloads"].hasOwnProperty("artifact")) {
            await downloadAsync(data["libraries"][i]["downloads"]["artifact"]["url"], path.join(librariesPath, data["libraries"][i]["downloads"]["artifact"]["path"]), (progress, byteSent) => {
                console.log(`Progression: ${progress}% du téléchargement`);
                fetchedByte += byteSent
            }).catch((err) => reject(err))
        }

        if (data["libraries"][i]["downloads"].hasOwnProperty("classifiers")) {
            for (const e in data["libraries"][i]["downloads"]["classifiers"]) {
                if (e.includes("win") && os.platform() == "win32") {
                    await downloadAsync(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]), (progress, byteSent) => {
                        console.log(`Progression: ${progress}% du téléchargement`);
                        fetchedByte += byteSent
                    }, {
                        retry: {
                            count: 3,
                            timeout: 2500
                        },
                        hash: data["libraries"][i]["downloads"]["classifiers"][e]["sha1"]
                    })
                }

                else if ((e.includes("mac") || e.includes("osx")) && os.platform() == "darwin") {
                    await downloadAsync(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]), (progress, byteSent) => {
                        console.log(`Progression: ${progress}% du téléchargement`);
                        fetchedByte += byteSent
                    }, {
                        retry: {
                            count: 3,
                            timeout: 2500
                        },
                        hash: data["libraries"][i]["downloads"]["classifiers"][e]["sha1"]
                    })
                }

                else if (e.includes("linux") && os.platform() == "linux") {
                    await downloadAsync(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]), (progress, byteSent) => {
                        console.log(`Progression: ${progress}% du téléchargement`);
                        fetchedByte += byteSent
                    }, {
                        retry: {
                            count: 3,
                            timeout: 2500
                        },
                        hash: data["libraries"][i]["downloads"]["classifiers"][e]["sha1"]
                    })
                }
            }
        }

        resolve(fetchedByte)
    })
}

function minecraftLibraryTotalSize(data: any) {
    let totalSize = 0
    for (let i = 0; i < data.libraries.length; i++) {

        if (data["libraries"][i].hasOwnProperty("rules")) {
            if (!parseRule(data["libraries"][i]["rules"])) {
                continue
            }
        }

        if (data["libraries"][i]["downloads"].hasOwnProperty("artifact")) {
            totalSize += data["libraries"][i]["downloads"]["artifact"]["size"]
        }

        if (data["libraries"][i]["downloads"].hasOwnProperty("classifiers")) {
            for (const e in data["libraries"][i]["downloads"]["classifiers"]) {
                if (e.includes("win") && os.platform() == "win32") {
                    totalSize += data.libraries[i]["downloads"]["classifiers"][e]["size"]
                }
                else if ((e.includes("mac") || e.includes("osx")) && os.platform() == "darwin") {
                    totalSize += data.libraries[i]["downloads"]["classifiers"][e]["size"]
                }
                else if (e.includes("linux") && os.platform() == "linux") {
                    totalSize += data.libraries[i]["downloads"]["classifiers"][e]["size"]
                }
            }
        }
    }

    return totalSize
}

export function minecraftLibraryList(data: any) {
    let libraryList = []
    for (let i = 0; i < data.libraries.length; i++) {

        if (data["libraries"][i].hasOwnProperty("rules")) {
            if (!parseRule(data["libraries"][i]["rules"])) {
                continue
            }
        }

        if (data["libraries"][i]["downloads"].hasOwnProperty("artifact")) {
            libraryList.push(path.join(librariesPath, data.libraries[i]["downloads"]["artifact"]["path"]))
        }

        if (data["libraries"][i]["downloads"].hasOwnProperty("classifiers")) {
            for (const e in data["libraries"][i]["downloads"]["classifiers"]) {
                if (e.includes("win") && os.platform() == "win32") {
                    libraryList.push(path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]))
                }
                else if ((e.includes("mac") || e.includes("osx")) && os.platform() == "darwin") {
                    libraryList.push(path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]))
                }
                else if (e.includes("linux") && os.platform() == "linux") {
                    libraryList.push(path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]))
                }
            }
        }
    }

    return libraryList
}

export function parseRule(rules: any) {
    let condition = false
    for (let i = 0; i < rules.length; i++) {
        if (rules[i].hasOwnProperty("os")) {
            if (rules[i]["os"]["name"] == "windows" && os.platform() == "win32") {
                condition = rules[i]["action"] == "allow";
            }
            else if (rules[i]["os"]["name"] == "osx" && os.platform() == "darwin") {
                condition = rules[i]["action"] == "allow";
            }
            else if (rules[i]["os"]["name"] == "linux" && os.platform() == "linux") {
                condition = rules[i]["action"] == "allow";
            }
        } else {
            condition = rules[i]["action"] == "allow";
        }
    }
    return condition
}

/*function downloadLoggingXmlConfFile(data: any) {
    return new Promise(async (resolve, reject) => {

        console.log(data);

        if (!data.hasOwnProperty("logging")) {
            resolve("No logging key found, step passed.")
        }
        if (!existsSync(loggingConfPath)) {
            await fs.mkdir(loggingConfPath, { recursive: true })
        }

        await downloadAsync(data["logging"]["client"]["file"]["url"], path.join(loggingConfPath, data["logging"]["client"]["file"]["id"]), (progress: number) => {
            console.log(`Progression: ${progress}% du téléchargement`);
        })
        resolve("Log4j file downloaded")
    })
}*/

export enum JavaVersions {
    JDK8,
    JDK17
}

export async function downloadAndGetJavaVersion(version: JavaVersions) {
    return new Promise<string>(async (resolve, reject) => {
        await fs.mkdir(javaPath, {recursive: true}).catch((err) => reject(err))
        if (version === JavaVersions.JDK8) {
            if(existsSync(path.join(javaPath, java8Version, java8Name, "bin"))) {
                resolve(path.join(javaPath, java8Version, java8Name, "bin"))
            } else {
                await downloadAsync(java8Url, path.join(javaPath, `${java8Version}.zip`), (progress: number) => {
                    console.log(`Progression: ${progress}% du téléchargement`);
                }, { decompress: true }).catch((err) => reject(err))

                resolve(path.join(javaPath, java8Version, java8Name,  "bin"))
            }
        }
        else if (version === JavaVersions.JDK17) {
            if(existsSync(path.join(javaPath, java17Version, java17Name, "bin"))) {
                resolve(path.join(javaPath, java17Version, java17Name, "bin"))
            } else {
                await downloadAsync(java17Url, path.join(javaPath, `${java17Version}.zip`), (progress: number) => {
                    console.log(`Progression: ${progress}% du téléchargement`);
                }, { decompress: true }).catch((err) => reject(err))

                resolve(path.join(javaPath, java17Version, java17Name, "bin"))
            }
        } else reject()
    })
}