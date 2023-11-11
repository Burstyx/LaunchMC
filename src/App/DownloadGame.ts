import { extractSpecificFile, makeDir, mavenToArray, readJarMetaInf } from "../Utils/HFileManagement"

import { existsSync } from "original-fs"
import { minecraftManifestForVersion } from "../Utils/HManifests"
import { downloadAsync } from "../Utils/HDownload"
import { dataPath, gamePath, indexesPath, instancesPath, java17Name, java17Url, java17Version, java8Name, java8Url, java8Version, javaPath, librariesPath, loggingConfPath, minecraftVersionPath, objectPath, resourcePackage, tempPath } from "../Utils/const"
import path from "path"
import fs from "fs/promises"
import os from "os"
import { InstanceState, updateInstanceDlProgress, updateInstanceDlState } from "../Utils/HInstance"
import cp from "child_process"
import { startMinecraft } from "./StartMinecraft"
import { getActiveAccount } from "../Utils/HMicrosoft"
import { getForgeInstallProfileIfExist, getForgeInstallerForVersion, getForgeVersionIfExist } from "../Utils/HForge"
import { osToMCFormat } from "../Utils/Utils"

export async function downloadMinecraft(version: string, instanceId: string) { // TODO: Validate files
    // Préparation
    console.log("[INFO] Preparing to the download");

    await updateInstanceDlState(instanceId, InstanceState.Loading)
    updateInstanceDlProgress(instanceId, 0)

    // Variables de tracking du dl
    let numberOfLibrariesToDownload = 0
    let numberOfLibrariesDownloaded = 0

    let numberOfAssetsToDownload = 0
    let numberOfAssetsDownloaded = 0

    let totalSizeToDl = 0 // TODO: Compute this to track dl efficiently
    let currentDownloadedSize = 0

    // Téléchargement/Récupération des manifests nécessaire
    const versionDataManifest = await minecraftManifestForVersion(version)

    console.log(versionDataManifest["assetIndex"]["url"]);
    console.log(path.join(indexesPath, versionDataManifest["assetIndex"]["id"] + ".json"));

    await makeDir(indexesPath)
    await downloadAsync(versionDataManifest["assetIndex"]["url"], path.join(indexesPath, versionDataManifest["assetIndex"]["id"] + ".json"), (progress: number) => {
        console.log(`Progression: ${progress}% du téléchargement du manifest des assets`);
        console.log("ASSETS DOWNLOADED");
    })

    const indexDataManifest: any = JSON.parse((await fs.readFile(path.join(indexesPath, versionDataManifest["assetIndex"]["id"] + ".json"))).toString("utf-8"))

    if (indexDataManifest == null) {
        return
    }

    // Initialisation du traking du dl
    numberOfLibrariesToDownload = versionDataManifest.libraries.length

    for (const e in indexDataManifest.objects) {
        numberOfAssetsToDownload++
    }

    console.log("numberOfAssetsToDownload: " + numberOfAssetsToDownload);

    // Calcul taille total

    // Calcul taille client + assets + libraries
    // client
    const clientSize = versionDataManifest.downloads.client.size
    const assetsSize = versionDataManifest.assetIndex.totalSize
    const librariesSize = minecraftLibraryTotalSize(versionDataManifest)

    totalSizeToDl = clientSize + assetsSize + librariesSize

    // Téléchargement du client
    await updateInstanceDlState(instanceId, InstanceState.Downloading)
    console.log("[INFO] Téléchargement du client");

    await makeDir(minecraftVersionPath)

    await downloadAsync(versionDataManifest.downloads.client.url, path.join(minecraftVersionPath, version, `${versionDataManifest.id}.jar`), (progress, byteSent) => {
        console.log(`Progression: ${progress}% du téléchargement du client de jeu`);

        currentDownloadedSize += byteSent

        updateInstanceDlProgress(instanceId, (currentDownloadedSize * 100) / totalSizeToDl)
    })

    // Téléchargement des librairies
    console.log("[INFO] Téléchargement des librairies");
    let librariesArg = ""

    for (let i = 0; i < versionDataManifest.libraries.length; i++) {
        const fetchedByte = await downloadMinecraftLibrary(versionDataManifest, i)
        numberOfLibrariesDownloaded++

        console.log(`Progression: ${numberOfLibrariesDownloaded * 100 / numberOfLibrariesToDownload}% du téléchargement des libraries`);
        currentDownloadedSize += fetchedByte

        updateInstanceDlProgress(instanceId, (currentDownloadedSize * 100) / totalSizeToDl)
    }

    // Téléchargement des assets
    console.log("[INFO] Téléchargement des assets");

    for (const e in indexDataManifest["objects"]) {
        console.log(`Progression: ${numberOfAssetsDownloaded * 100 / numberOfAssetsToDownload}`);

        const hash = indexDataManifest["objects"][e]["hash"]
        const subhash = hash.substring(0, 2)

        await makeDir(path.join(objectPath, subhash))

        const fullPath = path.join(instancesPath, instanceId, "resources", e)
        const fileName = fullPath.split("\\").pop()
        const dirPath = fullPath.substring(0, fullPath.indexOf(fileName!))

        await makeDir(dirPath)

        await downloadAsync(path.join(resourcePackage, subhash, hash), path.join(objectPath, subhash, hash), (progress, byteSend) => {
            currentDownloadedSize += byteSend

            updateInstanceDlProgress(instanceId, (currentDownloadedSize * 100) / totalSizeToDl)
        })

        numberOfAssetsDownloaded++
    }

    await updateInstanceDlState(instanceId, InstanceState.Playable)
}

export async function patchInstanceWithForge(instanceId: string, mcVersion: string, forgeId: string) {
    await updateInstanceDlState(instanceId, InstanceState.Patching)

    // Download java if it doesn't exist
    const java17Path = await downloadAndGetJavaVersion(JavaVersions.JDK17)

    // Download forge installer, work only for all versions after 1.5.2
    const forgeInstallerPath = await getForgeInstallerForVersion(forgeId)
    const forgeInstallProfileData = await getForgeInstallProfileIfExist(forgeId)

    // Get all libraries to download
    let libraries
    if(!forgeInstallProfileData.versionInfo)
        libraries = forgeInstallProfileData.libraries
    else
        libraries = forgeInstallProfileData.versionInfo.libraries

    if(forgeInstallProfileData.json) {
        const forgeVersionData = await getForgeVersionIfExist(forgeId)
        libraries = libraries.concat(forgeVersionData.libraries)
    }

    // Skip forge extract and download it instead
    let skipForgeExtract = false
    
    if(!forgeInstallProfileData.path && !forgeInstallProfileData.install?.filePath) {
        skipForgeExtract = true
    }

    console.log(libraries);

    for(const library of libraries) {
        console.log("Downloading: " + library.name);

        let natives = ""

        if(library.rules) {
            if(!parseRule(library.rules)) {
                console.log("Rule don't allow the download of this library, skipping.");
                continue
            }
        }

        if(library.natives) {
            natives = library.natives[osToMCFormat(process.platform)]
        }

        const libraryPath = (mavenToArray(library.name, natives != "" ? `-${natives}` : undefined)).join("/");

        if(library.downloads?.artifact) {
            const dlLink = library.downloads.artifact.url
            const dlDest = library.downloads.artifact.path

            // If not url as been assigned
            if(dlLink == "") {
                const fileToFetch = "maven/" + library.downloads.artifact.path
                const destFile = `${librariesPath}/` + library.downloads.artifact.path

                await extractSpecificFile(forgeInstallerPath, fileToFetch, destFile)
            }
            
            await downloadAsync(dlLink, path.join(librariesPath, dlDest))
        }
        else if (library?.name.includes("net.minecraftforge:forge:") || library?.name.includes("net.minecraftforge:minecraftforge:")) {
            console.log("Skip " + library.name);
        }
        else if(library.url) {
            const forgeBaseUrl = "https://maven.minecraftforge.net/"
            await downloadAsync(`${forgeBaseUrl}${libraryPath}`, path.join(librariesPath, libraryPath), (prog, byte) => console.log(prog + " forge library"));
        }
        else if(!library.url) {
            await downloadAsync(`https://libraries.minecraft.net/${libraryPath}`, path.join(librariesPath, libraryPath), (prog, byte) => console.log(prog + " forge library"));
        }
        else {
            console.log("Case not handled or just it won't work");
        }
    }
    
    if(!skipForgeExtract) {        
        const jarFilePathInInstaller = forgeInstallProfileData.path || forgeInstallProfileData.install.filePath  
        const jarFileDestPath = mavenToArray(forgeInstallProfileData.path || forgeInstallProfileData.install.path)      

        const forgeJarPathWithoutFile = jarFileDestPath.slice(0, jarFileDestPath.length - 1).join("/")

        await makeDir(path.join(librariesPath, forgeJarPathWithoutFile))
        // Fetch the jar in the installer
        if(forgeInstallProfileData.install?.filePath) {
            await extractSpecificFile(forgeInstallerPath, jarFilePathInInstaller, path.join(librariesPath, jarFileDestPath.join("/")))
        }
        // Search for the jar in maven folder in the installer
        else if(forgeInstallProfileData.path) {
            await extractSpecificFile(forgeInstallerPath, path.join("maven", jarFileDestPath.join("/")), path.join(librariesPath, jarFileDestPath.join("/")))
        }
    }

    if(forgeInstallProfileData.processors?.length) {
        console.log("Patching Forge");

        const universalJarPath = forgeInstallProfileData.libraries.find((lib: {name: string}) => lib.name.startsWith("net.minecraftforge:forge")).downloads.artifact.path
        console.log(universalJarPath);
        

        // Getting client.lzma from installer
        await extractSpecificFile(forgeInstallerPath, "data/client.lzma", path.join(librariesPath, forgeInstallProfileData.path ? (mavenToArray(forgeInstallProfileData.path, "-universal-clientdata", "lzma")).join("/") : universalJarPath.slice(0, -4) + "-clientdata.lzma"))
        
        const { processors } = forgeInstallProfileData

        for(const key in processors) {
            const p = processors[key]

            console.log("Patching with " + p.jar);

            if(!p.sides || p.sides.includes("client")) {
                const replaceDataArg = (arg: string) => {
                    const finalArg = arg.replace("{", "").replace("}", "")
                    if(forgeInstallProfileData.data[finalArg]) {
                        if(finalArg == "BINPATCH") {
                            return path.join(librariesPath, universalJarPath || mavenToArray(forgeInstallProfileData.path).join("/")).slice(0, -4) + "-clientdata.lzma"
                        }

                        let res: string = forgeInstallProfileData.data[finalArg].client                        

                        console.log(arg + " transformed to " + res);
                        
                        return res
                    }

                    return arg
                        .replace("{SIDE}", "client")
                        .replace("{ROOT}", `"${tempPath}"`)
                        .replace("{MINECRAFT_JAR}", `"${path.join(minecraftVersionPath, forgeInstallProfileData.minecraft, forgeInstallProfileData.minecraft + ".jar")}"`)
                        .replace("{MINECRAFT_VERSION}", `"${path.join(minecraftVersionPath, forgeInstallProfileData.minecraft, forgeInstallProfileData.minecraft + ".json")}"`)
                        .replace("{INSTALLER}", `"${path.join(tempPath, forgeInstallProfileData.version + ".jar")}"`)
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

                const jarPath = path.join(librariesPath, ...(mavenToArray(p.jar)))
                const args = p.args.map((arg: string) => replaceDataArg(arg))
                    .map((arg: string) => formatPath(arg))
                const classPaths = p.classpath.map((cp: string) => `"${path.join(librariesPath, ...(mavenToArray(cp)))}"`)
                
                console.log(classPaths);

                const mainClass = await readJarMetaInf(jarPath, "Main-Class")
                console.log("Main class: " + mainClass);
                

                await new Promise<void>((res) => {
                    const proc = cp.spawn(`"${path.join(java17Path, "javaw")}"`, ['-classpath', [`"${jarPath}"`, ...classPaths].join(path.delimiter), mainClass, ...args], {shell: true})
                    console.log(proc.spawnargs);
                    
                    proc.stdout.on("data", data => console.log(data.toString()))
                    proc.stderr.on("data", err => console.error(err.toString()))
                    proc.on("close", code => {console.log("Exited with code " + code); res()})
                })
            }
        }
    }

    await updateInstanceDlState(instanceId, InstanceState.Playable)
}

// Download Minecraft libraries
async function downloadMinecraftLibrary(data: any, i: number) {
    var fetchedByte = 0

    if (data["libraries"][i].hasOwnProperty("rules")) {
        if (!parseRule(data["libraries"][i]["rules"])) {
            return 0
        }
    }

    if (data["libraries"][i]["downloads"].hasOwnProperty("artifact")) {
        await downloadAsync(data["libraries"][i]["downloads"]["artifact"]["url"], path.join(librariesPath, data["libraries"][i]["downloads"]["artifact"]["path"]), (progress, byteSent) => {
            console.log(`Progression: ${progress}% du téléchargement`);
            fetchedByte += byteSent
        })
    }

    if (data["libraries"][i]["downloads"].hasOwnProperty("classifiers")) {
        for (const e in data["libraries"][i]["downloads"]["classifiers"]) {
            if (e.includes("win") && os.platform() == "win32") {
                await downloadAsync(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]), (progress, byteSent) => {
                    console.log(`Progression: ${progress}% du téléchargement`);
                    fetchedByte += byteSent
                })
            }
            else if ((e.includes("mac") || e.includes("osx")) && os.platform() == "darwin") {
                await downloadAsync(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]), (progress, byteSent) => {
                    console.log(`Progression: ${progress}% du téléchargement`);
                    fetchedByte += byteSent
                })
            }
            else if (e.includes("linux") && os.platform() == "linux") {
                await downloadAsync(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]), (progress, byteSent) => {
                    console.log(`Progression: ${progress}% du téléchargement`);
                    fetchedByte += byteSent
                })
            }
        }
    }

    return fetchedByte
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
            totalSize += data.libraries[i].downloads.artifact.size
        }

        if (data["libraries"][i]["downloads"].hasOwnProperty("classifiers")) {
            for (const e in data["libraries"][i]["downloads"]["classifiers"]) {
                if (e.includes("win") && os.platform() == "win32") {
                    totalSize += data.libraries[i].downloads.classifiers[e].size
                }
                else if ((e.includes("mac") || e.includes("osx")) && os.platform() == "darwin") {
                    totalSize += data.libraries[i].downloads.classifiers[e].size
                }
                else if (e.includes("linux") && os.platform() == "linux") {
                    totalSize += data.libraries[i].downloads.classifiers[e].size
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
            libraryList.push(path.join(librariesPath, data.libraries[i].downloads.artifact.path))
        }

        if (data["libraries"][i]["downloads"].hasOwnProperty("classifiers")) {
            for (const e in data["libraries"][i]["downloads"]["classifiers"]) {
                if (e.includes("win") && os.platform() == "win32") {
                    libraryList.push(path.join(librariesPath, data.libraries[i].downloads.classifiers[e].path))
                }
                else if ((e.includes("mac") || e.includes("osx")) && os.platform() == "darwin") {
                    libraryList.push(path.join(librariesPath, data.libraries[i].downloads.classifiers[e].path))
                }
                else if (e.includes("linux") && os.platform() == "linux") {
                    libraryList.push(path.join(librariesPath, data.libraries[i].downloads.classifiers[e].path))
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
                if (rules[i]["action"] == "allow") {
                    condition = true
                } else {
                    condition = false
                }
            }
            else if (rules[i]["os"]["name"] == "osx" && os.platform() == "darwin") {
                if (rules[i]["action"] == "allow") {
                    condition = true
                } else {
                    condition = false
                }
            }
            else if (rules[i]["os"]["name"] == "linux" && os.platform() == "linux") {
                if (rules[i]["action"] == "allow") {
                    condition = true
                } else {
                    condition = false
                }
            }
        } else {
            if (rules[i]["action"] == "allow") {
                condition = true
            } else {
                condition = false
            }
        }
    }
    return condition
}

function downloadLoggingXmlConfFile(data: any) {
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
}

export enum JavaVersions {
    JDK8,
    JDK17
}

export async function downloadAndGetJavaVersion(version: JavaVersions) {
    await makeDir(javaPath)

    if (version == JavaVersions.JDK8) {
        if(existsSync(path.join(javaPath, java8Version, java8Name, "bin"))) {
            return path.join(javaPath, java8Version, java8Name, "bin")
        }

        await downloadAsync(java8Url, path.join(javaPath, `${java8Version}.zip`), (progress: number) => {
            console.log(`Progression: ${progress}% du téléchargement`);
        }, { decompress: true })

        return path.join(javaPath, java8Version, java8Name,  "bin")
    }

    if (version == JavaVersions.JDK17) {
        if(existsSync(path.join(javaPath, java17Version, java17Name, "bin"))) {
            return path.join(javaPath, java17Version, java17Name, "bin")
        }

        await downloadAsync(java17Url, path.join(javaPath, `${java17Version}.zip`), (progress: number) => {
            console.log(`Progression: ${progress}% du téléchargement`);
        }, { decompress: true })

        return path.join(javaPath, java17Version, java17Name, "bin")
    }

    return ""
}