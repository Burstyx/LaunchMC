import {makeDir} from "../Utils/HFileManagement"
import { v4 } from "uuid"
import { createWriteStream } from "fs"
import { exists, existsSync } from "original-fs"
import { minecraftManifestForVersion } from "../Utils/HManifests"
import { downloadAsync } from "../Utils/HDownload"
import { indexesPath, instancesPath, java17Version, java8Version, javaPath, librariesPath, loggingConfPath, minecraftVersionPath, objectPath, resourcePackage } from "../Utils/const"
import path from "path"
import fs from "fs/promises"
import { createInstance } from "../Utils/HInstance"
import os from "os"

interface InstanceInf{
    name: string,
    imagePath: string
}

export async function createVanillaInstance(version: string, opts: InstanceInf){
    // Préparation
    console.log("[INFO] Préparation à la création d'une nouvelle instance");

    // Variables de tracking du dl
    let numberOfLibrariesToDownload = 0
    let numberOfLibrariesDownloaded = 0

    let numberOfAssetsToDownload = 0
    let numberOfAssetsDownloaded = 0

    // Téléchargement/Récupération des manifests nécessaire
    const versionDataManifest = await minecraftManifestForVersion(version)

    await makeDir(indexesPath)
    await downloadAsync(versionDataManifest["assetIndex"]["url"], path.join(indexesPath, versionDataManifest["assetIndex"]["id"] + ".json"), (progress: number) => {
        console.log(`Progression: ${progress}% du téléchargement du manifest des assets`);
    })

    const indexDataManifest: any = JSON.parse((await fs.readFile(path.join(indexesPath, versionDataManifest["assetIndex"]["id"] + ".json"))).toString("utf-8"))

    if(indexDataManifest == null){
        return
    }

    const instanceId = v4()

    // Initialisation du traking du dl
    numberOfLibrariesToDownload = versionDataManifest.libraries.length

    for(const e in indexDataManifest.objects){
        numberOfAssetsToDownload++
    }

    console.log("numberOfAssetsToDownload: " + numberOfAssetsToDownload);

    // Téléchargement du client
    console.log("[INFO] Téléchargement du client");

    await makeDir(minecraftVersionPath)

    await downloadAsync(versionDataManifest.downloads.client.url, path.join(minecraftVersionPath, version, `${versionDataManifest.id}.jar`), (progress: number) => {
        console.log(`Progression: ${progress}% du téléchargement du client de jeu`);
    })

    // Téléchargement des librairies
    console.log("[INFO] Téléchargement des librairies");
    let librariesArg = ""

    for(let i = 0; i < versionDataManifest.libraries.length; i++){
        librariesArg += await downloadMinecraftLibrary(versionDataManifest, i)
        numberOfLibrariesDownloaded++

        console.log(`Progression: ${numberOfLibrariesDownloaded * 100 / numberOfLibrariesToDownload}% du téléchargement des libraries`);
    }

    // Téléchargement des assets
    console.log("[INFO] Téléchargement des assets");
    
    for(const e in indexDataManifest["objects"]){
        console.log(`Progression: ${numberOfAssetsDownloaded*100/numberOfAssetsToDownload}`);
        
        const hash = indexDataManifest["objects"][e]["hash"]
        const subhash = hash.substring(0, 2)

        await makeDir(path.join(objectPath, subhash))

        const fullPath = path.join(instancesPath, instanceId, "resources", e)
        const fileName = fullPath.split("\\").pop()
        const dirPath  = fullPath.substring(0, fullPath.indexOf(fileName!))

        await makeDir(dirPath)

        await downloadAsync(path.join(resourcePackage, subhash, hash), path.join(objectPath, subhash, hash), (progress) => {
            console.log(`Downloading ${e}`);
            
        })

        numberOfAssetsDownloaded++
    }

    // Création de l'instance
    await createInstance(opts.name, opts.imagePath, instanceId, version, versionDataManifest)
}

export async function patchInstanceWithForge(instanceId: string){
    // Télécharger l'installer forge

    // Décompresser installer

    // Télécharger les librairies

    // Changer type de l'instance pour utiliser les bons arguments
}

// Download Minecraft libraries
async function downloadMinecraftLibrary(data: any, i: number) {
    var library = ""

    if(data["libraries"][i].hasOwnProperty("rules")){
        if(!parseRule(data["libraries"][i]["rules"])){
            return ""
        }
    }

    if(data["libraries"][i]["downloads"].hasOwnProperty("artifact")){
        await downloadAsync(data["libraries"][i]["downloads"]["artifact"]["url"], path.join(librariesPath, data["libraries"][i]["downloads"]["artifact"]["path"]), (progress: number) => {
            console.log(`Progression: ${progress}% du téléchargement`);
        })

        library = path.join(librariesPath, data["libraries"][i]["downloads"]["artifact"]["path"]) + ";"
    }
    
    if(data["libraries"][i]["downloads"].hasOwnProperty("classifiers")){
        for(const e in data["libraries"][i]["downloads"]["classifiers"]){
            if(e.includes("win") && os.platform() == "win32"){
                await downloadAsync(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]), (progress: number) => {
                    console.log(`Progression: ${progress}% du téléchargement`);
                })
            }
            else if((e.includes("mac") || e.includes("osx")) && os.platform() == "darwin"){
                await downloadAsync(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]), (progress: number) => {
                    console.log(`Progression: ${progress}% du téléchargement`);
                })
            }
            else if(e.includes("linux") && os.platform() == "linux"){
                await downloadAsync(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]), (progress: number) => {
                    console.log(`Progression: ${progress}% du téléchargement`);
                })
            }

            library = path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]) + ";"
        }
    }

    return library
}

function parseRule(rules: any){
    let condition = false
    for(let i = 0; i < rules.length; i++){
        if(rules[i].hasOwnProperty("os")){
            if(rules[i]["os"]["name"] == "windows" && os.platform() == "win32"){
                if(rules[i]["action"] == "allow"){
                    condition = true
                }else{
                    condition = false
                }
            }
            else if(rules[i]["os"]["name"] == "osx" && os.platform() == "darwin"){
                if(rules[i]["action"] == "allow"){
                    condition = true
                }else{
                    condition = false
                }
            }
            else if(rules[i]["os"]["name"] == "linux" && os.platform() == "linux"){
                if(rules[i]["action"] == "allow"){
                    condition = true
                }else{
                    condition = false
                }
            }
        }else{
            if(rules[i]["action"] == "allow"){
                condition = true
            }else{
                condition = false
            }
        }
    }
    return condition
}

function downloadLoggingXmlConfFile(data: any){
    return new Promise(async (resolve, reject) => {

        console.log(data);
        
        if(!data.hasOwnProperty("logging")){
            resolve("No logging key found, step passed.")
        }
        if(!existsSync(loggingConfPath)){
            await fs.mkdir(loggingConfPath, {recursive: true})
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

export async function downloadJavaVersion(version: JavaVersions){
    if(!existsSync(javaPath)){
        await fs.mkdir(javaPath)
    }

    if(version == JavaVersions.JDK8){
        await downloadAsync("https://builds.openlogic.com/downloadJDK/openlogic-openjdk-jre/8u362-b09/openlogic-openjdk-jre-8u362-b09-windows-x64.zip", path.join(javaPath, `${java8Version}.zip`), (progress: number) => {
            console.log(`Progression: ${progress}% du téléchargement`);
        }, {decompress: true})
        
        return
    }
        
    if(version == JavaVersions.JDK17){
        await downloadAsync("https://builds.openlogic.com/downloadJDK/openlogic-openjdk-jre/17.0.6+10/openlogic-openjdk-jre-17.0.6+10-windows-x64.zip", path.join(javaPath, `${java17Version}.zip`), (progress: number) => {
            console.log(`Progression: ${progress}% du téléchargement`);
        }, {decompress: true})
        return
    }
}