import { dataPath, indexesPath, minecraftVersionPath, instancesPath, librariesPath, loggingConfPath, objectPath, resourcePackage, javaPath, java8Version, java17Version } from "../Helper/const"
import os from "os"
import fs from "fs/promises"
import {existsSync, createWriteStream} from "fs"
import https from "https"
import path from "path"
import {minecraftManifestForVersion} from "../Helper/HManifests"
import {startMinecraft} from "./startInstance"
import {getInstancesList, makeInstanceDownloaded, makeInstanceDownloading} from "./instancesManager"
import { downloadAsync } from "../Helper/Download"
import { makeDir } from "../Helper/HDirectoryManager"

enum DlOperationStep{
    NotDownloading, // Not downloading
    Preparing, // Téléchargement des manifests
    Client, // Téléchargement du client
    Library, // Téléchargement des libraries
    Assets // Téléchargement des assets
}

let currentOperationStep = DlOperationStep.NotDownloading

export async function downloadVanillaVersion(version: string, name: string, instanceDiv: HTMLElement, imagePath: string){
    console.log(version);

    currentOperationStep = DlOperationStep.Preparing
    
    minecraftManifestForVersion(version).then(async (data) => {
        let numberOfLibrariesToDownload = 0
        let numberOfLibrariesDownloaded = 0

        // Create related game folder
        console.log(path.join(instancesPath, name));
        
        await fs.mkdir(path.join(instancesPath, name), {recursive: true})
        
        await fs.writeFile(path.join(instancesPath, name, "info.json"), JSON.stringify({"imagePath": imagePath, "version": version, "name": name, "assets_index_name": data["assetIndex"]["id"], "id": instanceDiv.getAttribute("instanceid")}))
        await getInstancesList(instanceDiv);

        makeInstanceDownloading(name, instanceDiv)

        // Verification of the game version 
        for(let i = 0; i < data["libraries"].length; i++){
            numberOfLibrariesToDownload++
        }
        // Download client
        console.log("Downloading minecraft client");

        currentOperationStep = DlOperationStep.Client

        if(!existsSync(minecraftVersionPath)){
            await fs.mkdir(minecraftVersionPath, {recursive: true})
        } 
        
        //TODO Progression download for client jar
        await downloadAsync(data["downloads"]["client"]["url"], path.join(minecraftVersionPath, version, data["id"] + ".jar"), (progress: number) => {
            console.log(`Progression: ${progress}% du téléchargement du client`);
        })

        console.log("Minecraft client downloaded");

        currentOperationStep = DlOperationStep.Library

        var librariesArg = ""

        //TODO Progression download for Library
        // Download Libraries
        console.log("Downloading minecraft libraries");
        for(let i = 0; i < data["libraries"].length; i++){
            librariesArg += await downloadMinecraftLibrary(data, i)
            numberOfLibrariesDownloaded++
            console.log(`Progression: ${numberOfLibrariesDownloaded * 100 / numberOfLibrariesToDownload}% du téléchargement des libraries`);
        }

        await fs.writeFile(path.join(instancesPath, name, "info.json"), JSON.stringify({"imagePath": imagePath, "version": version, "name": name, "assets_index_name": data["assetIndex"]["id"], "libraries": librariesArg}))

        console.log("Minecraft libraries downloaded");
        // Download indexes
        console.log("Downloading minecraft index");

        if(!existsSync(indexesPath)){
            await fs.mkdir(indexesPath, {recursive: true})
        }

        currentOperationStep = DlOperationStep.Assets

        await downloadAsync(data["assetIndex"]["url"], path.join(indexesPath, data["assetIndex"]["id"] + ".json"), (progress: number) => {
            console.log(`Progression: ${progress}% du téléchargement du manifest des assets`);
        }) 
        console.log("Minecraft index downloaded");

        // Download Logging configuration file
        await downloadLoggingXmlConfFile(data)

        // Download assets
        console.log("Downloading minecraft assets");

        if(!existsSync(objectPath)){
            await fs.mkdir(objectPath, {recursive: true})
        }

        const file = await fs.readFile(path.join(indexesPath, data["assetIndex"]["id"] + ".json"), "utf-8")
        const indexesData = JSON.parse(file)

        if(indexesData["map_to_resources"]){
            var numberOfAssets = 1
            var numberOfAssetsDownloaded = 0

            for(const e in indexesData["objects"]){
                numberOfAssets++
            }

            await makeDir(path.join(path.join(instancesPath, name, "resources")))

            //TODO Progression download for assets
            for(const e in indexesData["objects"]){
                console.log(`Progression: ${numberOfAssetsDownloaded*100/numberOfAssets}`);
                
                const hash = indexesData["objects"][e]["hash"]
                const subhash = hash.substring(0, 2)

                if(!existsSync(path.join(objectPath, subhash))){
                    await fs.mkdir(path.join(objectPath, subhash))
                }

                const fullPath = path.join(path.join(instancesPath, name, "resources"), e)
                const fileName = fullPath.split("\\").pop()
                const dirPath  = fullPath.substring(0, fullPath.indexOf(fileName!))

                await makeDir(dirPath)

                const file = createWriteStream(path.join(path.join(instancesPath, name, "resources"), e))

                await fetch(path.join(resourcePackage, subhash, hash)).then(async (data) => {
                    const arrayBuffer = await data.arrayBuffer()
                    const buffer = Buffer.from(arrayBuffer)
                    file.write(buffer)
                })

                numberOfAssetsDownloaded++
                
            }
        }else{
            var numberOfAssets = 0
            var numberOfAssetsDownloaded = 0

            for(const e in indexesData["objects"]){
                numberOfAssets++
            }

            for(const e in indexesData["objects"]){
                console.log(`Progression: ${numberOfAssetsDownloaded*100/numberOfAssets}`);
                
                const hash = indexesData["objects"][e]["hash"]
                const subhash = hash.substring(0, 2)

                if(!existsSync(path.join(objectPath, subhash))){
                    await fs.mkdir(path.join(objectPath, subhash))
                }

                const file = createWriteStream(path.join(objectPath, subhash, hash))


                await fetch(path.join(resourcePackage, subhash, hash)).then(async (data) => {
                    const arrayBuffer = await data.arrayBuffer()
                    const buffer = Buffer.from(arrayBuffer)
                    file.write(buffer)
                })

                numberOfAssetsDownloaded++
                
            }
        }

        


        
    }).then(() => {
        makeInstanceDownloaded(name, instanceDiv)
    })
}

// Download Minecraft libraries
function downloadMinecraftLibrary(data: any, i: number): Promise<string>{
    return new Promise(async (resolve, reject) => {
        var pieceOfLibraryArgs = ""

        if(data["libraries"][i].hasOwnProperty("rules")){
            if(parseRule(data["libraries"][i]["rules"])){
                if(data["libraries"][i]["downloads"].hasOwnProperty("artifact")){
                    await downloadAsync(data["libraries"][i]["downloads"]["artifact"]["url"], path.join(librariesPath, data["libraries"][i]["downloads"]["artifact"]["path"]), (progress: number) => {
                        console.log(`Progression: ${progress}% du téléchargement`);
                    })
                    pieceOfLibraryArgs += path.join(librariesPath, data["libraries"][i]["downloads"]["artifact"]["path"]) + ";"
                }
                
                if(data["libraries"][i]["downloads"].hasOwnProperty("classifiers")){
                    for(const e in data["libraries"][i]["downloads"]["classifiers"]){
                        if(e.includes("win") && os.platform() == "win32"){
                            await downloadAsync(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]), (progress: number) => {
                                console.log(`Progression: ${progress}% du téléchargement`);
                            })
                            pieceOfLibraryArgs += path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]) + ";"
                        }
                        else if((e.includes("mac") || e.includes("osx")) && os.platform() == "darwin"){
                            await downloadAsync(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]), (progress: number) => {
                                console.log(`Progression: ${progress}% du téléchargement`);
                            })
                            pieceOfLibraryArgs += path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]) + ";"
                        }
                        else if(e.includes("linux") && os.platform() == "linux"){
                            await downloadAsync(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]), (progress: number) => {
                                console.log(`Progression: ${progress}% du téléchargement`);
                            })
                            pieceOfLibraryArgs += path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]) + ";"
                        }
                    }
                }
            }
        }else{
            if(data["libraries"][i]["downloads"].hasOwnProperty("artifact")){
                await downloadAsync(data["libraries"][i]["downloads"]["artifact"]["url"], path.join(librariesPath, data["libraries"][i]["downloads"]["artifact"]["path"]), (progress: number) => {
                    console.log(`Progression: ${progress}% du téléchargement`);
                })
                pieceOfLibraryArgs += path.join(librariesPath, data["libraries"][i]["downloads"]["artifact"]["path"]) + ";"
            }

            if(data["libraries"][i]["downloads"].hasOwnProperty("classifiers")){
                for(const e in data["libraries"][i]["downloads"]["classifiers"]){
                    if(e.includes("win") && os.platform() == "win32"){
                        await downloadAsync(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]), (progress: number) => {
                            console.log(`Progression: ${progress}% du téléchargement`);
                        })
                        pieceOfLibraryArgs += path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]) + ";"
                    }
                    else if((e.includes("mac") || e.includes("osx")) && os.platform() == "darwin"){
                        await downloadAsync(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]), (progress: number) => {
                            console.log(`Progression: ${progress}% du téléchargement`);
                        })
                        pieceOfLibraryArgs += path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]) + ";"
                    }
                    else if(e.includes("linux") && os.platform() == "linux"){
                        await downloadAsync(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]), (progress: number) => {
                            console.log(`Progression: ${progress}% du téléchargement`);
                        })
                        pieceOfLibraryArgs += path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]) + ";"
                    }
                }
            }
        }  

        

        resolve(pieceOfLibraryArgs)
        
    })
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

// Download Minecraft libraries (classify by os version)
// function downloadClassifierMinecraftLibrary(data: any, e: string, i: number){
//     return new Promise(async (resolve, reject) => {
//         const filePath = path.join(librariesPath, data['libraries'][i]['downloads']['classifiers'][e]['path'])
//         const fileName = filePath.split("\\").pop()
//         const dirPath = filePath.substring(0, filePath.indexOf(fileName!))

//         // Create folder if dir does not exist
//         if(!existsSync(dirPath)){
//             await fs.mkdir(dirPath, {recursive: true})
//         }

//         console.log(filePath);
//         if(data["libraries"][i]["downloads"].hasOwnProperty("artifact")){
//             await downloadAsync(data["libraries"][i]["downloads"]["artifact"]["url"], path.join(librariesPath, data["libraries"][i]["downloads"]["artifact"]["path"]))
//         }

//         for(const e in data["libraries"][i]["downloads"]["classifiers"]){
//             if(e.includes("win")){
//                 await downloadAsync(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]))
//             }
//             else if(e.includes("mac") || e.includes("osx")){
//                 await downloadAsync(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]))
//             }
//             else if(e.includes("linux")){
//                 await downloadAsync(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]))
//             }
//         }
//     })
// }

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

export function downloadJavaVersion(version: JavaVersions){
    return new Promise(async (resolve, reject) => {
        if(!existsSync(javaPath)){
            await fs.mkdir(javaPath)
        }

        if(version == JavaVersions.JDK8){
            await downloadAsync("https://builds.openlogic.com/downloadJDK/openlogic-openjdk-jre/8u362-b09/openlogic-openjdk-jre-8u362-b09-windows-x64.zip", path.join(javaPath, `${java8Version}.zip`), (progress: number) => {
                console.log(`Progression: ${progress}% du téléchargement`);
            }, {decompress: true})
            resolve("Java 8 downloaded")
        }
            
        if(version == JavaVersions.JDK17){
            await downloadAsync("https://builds.openlogic.com/downloadJDK/openlogic-openjdk-jre/17.0.6+10/openlogic-openjdk-jre-17.0.6+10-windows-x64.zip", path.join(javaPath, `${java17Version}.zip`), (progress: number) => {
                console.log(`Progression: ${progress}% du téléchargement`);
            }, {decompress: true})
            resolve("Java 17 downloaded")
        }
            
    })
}