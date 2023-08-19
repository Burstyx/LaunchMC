import { extractSpecificFile, makeDir, mavenToArray } from "../Utils/HFileManagement"

import { existsSync } from "original-fs"
import { minecraftManifestForVersion } from "../Utils/HManifests"
import { downloadAsync } from "../Utils/HDownload"
import { gamePath, indexesPath, instancesPath, java17Name, java17Url, java17Version, java8Url, java8Version, javaPath, librariesPath, loggingConfPath, minecraftVersionPath, objectPath, resourcePackage } from "../Utils/const"
import path from "path"
import fs from "fs/promises"
import os from "os"
import { InstanceState, updateInstanceDlProgress, updateInstanceDlState } from "../Utils/HInstance"
import cp from "child_process"
import { startMinecraft } from "./StartMinecraft"
import { getActiveAccount } from "../Utils/HMicrosoft"

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

    await patchInstanceWithForge(instanceId, version)
    await updateInstanceDlState(instanceId, InstanceState.Playable)
}

export async function patchInstanceWithForge(instanceId: string, mcVersion: string) {
    // Télécharger l'installer forge
    const forgeVersionsUrl = await downloadAsync("https://files.minecraftforge.net/net/minecraftforge/forge/maven-metadata.json", path.join(gamePath, "maven-metadata.json"), (progress, byte) => { console.log(progress + "% of forge manifest"); })

    await downloadJavaVersion(JavaVersions.JDK17)

    const file = await fs.readFile(path.join(gamePath, "maven-metadata.json"), "utf-8")
    const forgeVersions = JSON.parse(file)

    const version = forgeVersions["1.12.2"][0]

    console.log(version);

    const forgeInstallerUrl = `https://maven.minecraftforge.net/net/minecraftforge/forge/${version}/forge-${version}-installer.jar`
    await downloadAsync(forgeInstallerUrl, path.join(gamePath, version + ".jar"), (prog, byte) => { console.log(prog); })

    await extractSpecificFile(path.join(gamePath, version + ".jar"), "install_profile.json")

    const installProfileFile = await fs.readFile(path.join(gamePath, "install_profile.json"), "utf-8")
    const installProfileJson = JSON.parse(installProfileFile)

    console.log(installProfileJson);
    
    // Télécharger les librairies
    const installInfo = installProfileJson.install
    const versionInfo = installProfileJson.versionInfo

    const libraries = versionInfo.libraries

    for(const library of libraries) {
        if(library.name.includes("minecraftforge") || library.name.includes("forge")) {
            console.log("Skip " + library.name);
            
            continue
        }

        console.log(library);
        const libraryPath = (await mavenToArray(library.name)).join("/");

        if(!library.url) {
            await downloadAsync(`https://libraries.minecraft.net/${libraryPath}`, path.join(librariesPath, libraryPath), (prog, byte) => console.log(prog + " forge library"));
            
            continue
        }
        
        const forgeBaseUrl = "https://maven.minecraftforge.net/"

        console.log(`${forgeBaseUrl}${libraryPath}`);
        console.log(path.join(librariesPath, libraryPath));

        await downloadAsync(`${forgeBaseUrl}${libraryPath}`, path.join(librariesPath, libraryPath), (prog, byte) => console.log(prog + " forge library"));
    }

    await extractSpecificFile(path.join(gamePath, version + ".jar"), `forge-${version}-universal.jar`)

    await makeDir(path.join(librariesPath, "net", "minecraftforge", "forge", version))
    await fs.copyFile(path.join(gamePath, `forge-${version}-universal.jar`), path.join(librariesPath, "net", "minecraftforge", "forge", version, "forge-" + version + ".jar"))

    await startMinecraft("1.12.2-forge1.12.2-14.23.0.2486", instanceId, {accesstoken: (await getActiveAccount()).access_token, username: "ItsBursty", usertype: "msa", uuid: "5905494c31674f60abda3ac0bcbafcd7", versiontype: "Forge"})



    // Changer type de l'instance pour utiliser les bons arguments
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

function parseRule(rules: any) {
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

export async function downloadJavaVersion(version: JavaVersions) {
    if (!existsSync(javaPath)) {
        await fs.mkdir(javaPath)
    }

    if (version == JavaVersions.JDK8) {
        await downloadAsync(java8Url, path.join(javaPath, `${java8Version}.zip`), (progress: number) => {
            console.log(`Progression: ${progress}% du téléchargement`);
        }, { decompress: true })

        return
    }

    if (version == JavaVersions.JDK17) {
        await downloadAsync(java17Url, path.join(javaPath, `${java17Version}.zip`), (progress: number) => {
            console.log(`Progression: ${progress}% du téléchargement`);
        }, { decompress: true })
        return
    }
}