import { dataPath, indexesPath, minecraftVersionPath, instancesPath, librariesPath, loggingConfPath, objectPath, resourcePackage, javaPath, java8Version, java17Version } from "../Helper/const"
import os from "os"
import fs from "fs/promises"
import {existsSync} from "fs"
import https from "https"
import path from "path"
import {minecraftManifestForVersion} from "../Helper/HManifests"
import {startMinecraft} from "./startInstance"
import {getInstancesList, makeInstanceDownloaded, makeInstanceDownloading} from "./instancesManager"
import { createWriteStream } from "original-fs"
import { downloadAsync } from "../Helper/Download"

export async function downloadVanillaVersion(version: string, name: string, instanceDiv: HTMLElement, imagePath: string){
    console.log(version);

    // makeInstanceDownloading(name, instanceDiv)
    
    minecraftManifestForVersion(version).then(async (data) => {
        let numberOfLibrariesToDownload = 0
        let numberOfLibrariesDownloaded = 0

        // Create related game folder
        console.log(path.join(instancesPath, name));
        
        await fs.mkdir(path.join(instancesPath, name), {recursive: true})
        
        await fs.writeFile(path.join(instancesPath, name, "info.json"), JSON.stringify({"imagePath": imagePath, "version": version, "name": name, "assets_index_name": data["assetIndex"]["id"]}))
        await getInstancesList(instanceDiv);

        makeInstanceDownloading(name, instanceDiv)

        // Verification of the game version 
        for(let i = 0; i < data["libraries"].length; i++){
            numberOfLibrariesToDownload++
        }
        // Download client
        console.log("Downloading minecraft client");

        if(!existsSync(minecraftVersionPath)){
            await fs.mkdir(minecraftVersionPath, {recursive: true})
        } 
        
        const minecraftJarFile = createWriteStream(path.join(minecraftVersionPath, version, data["id"] + ".jar"))
        
        await new Promise((resolve, reject) => {
            https.get(data["downloads"]["client"]["url"], (data) => {
                data.pipe(minecraftJarFile)

                data.on("end", () => {
                    resolve(data)
                })

                data.on("error", (err) => {
                    console.log(err);
                    reject(err)
                })
            })
        })
        

        console.log("Minecraft client downloaded");

        var librariesArg = ""

        // Download Libraries
        console.log("Downloading minecraft libraries");
        for(let i = 0; i < data["libraries"].length; i++){
            if(data["libraries"][i]["downloads"].hasOwnProperty("classifiers")){
                for(let e in data["libraries"][i]["downloads"]["classifiers"]){
                    if(e.includes("windows") && os.platform() == "win32"){
                        await downloadClassifierMinecraftLibrary(data, e, i)
                        librariesArg += path.join(librariesPath, data['libraries'][i]['downloads']['classifiers'][e]['path']) + ";"
                    }
                    if(e.includes("osx") && os.platform() == "darwin"){
                        await downloadClassifierMinecraftLibrary(data, e, i)
                        librariesArg += path.join(librariesPath, data['libraries'][i]['downloads']['classifiers'][e]['path']) + ";"
                    }
                    if(e.includes("linux") && os.platform() == "linux"){
                        await downloadClassifierMinecraftLibrary(data, e, i)
                        librariesArg += path.join(librariesPath, data['libraries'][i]['downloads']['classifiers'][e]['path']) + ";"
                    }
                }
            }else{
                await downloadMinecraftLibrary(data, i)
                librariesArg += path.join(librariesPath, data['libraries'][i]['downloads']['artifact']['path']) + ";"
            }
            numberOfLibrariesDownloaded++
            console.log(numberOfLibrariesDownloaded + "/" + numberOfLibrariesToDownload);
        }

        await fs.writeFile(path.join(instancesPath, name, "info.json"), JSON.stringify({"imagePath": imagePath, "version": version, "name": name, "assets_index_name": data["assetIndex"]["id"], "libraries": librariesArg}))

        console.log("Minecraft libraries downloaded");
        // Download indexes
        console.log("Downloading minecraft index");

        if(!existsSync(indexesPath)){
            await fs.mkdir(indexesPath, {recursive: true})
        }
        
        const indexFile = createWriteStream(path.join(indexesPath, data["assetIndex"]["id"] + ".json"))
        
        await new Promise((resolve, reject) => {
            https.get(data["assetIndex"]["url"], (data) => {
                data.pipe(indexFile)

                data.on("end", () => {
                    resolve(data)
                })

                data.on("error", (err) => {
                    reject(err)
                })
            })
        })
        
        console.log("Minecraft index downloaded");

        // Download Logging configuration file
        await downloadLoggingXmlConfFile(data)

        // Download objects
        console.log("Downloading minecraft assets");

        if(!existsSync(objectPath)){
            await fs.mkdir(objectPath, {recursive: true})
        }

        const file = await fs.readFile(path.join(indexesPath, data["assetIndex"]["id"] + ".json"), "utf-8")
        const indexesData = JSON.parse(file)

        var numberOfAssets = 0
        var numberOfAssetsDownloaded = 0

        for(const e in indexesData["objects"]){
            numberOfAssets++
        }

        for(const e in indexesData["objects"]){
            console.log("status assets : " + numberOfAssetsDownloaded + "/" + numberOfAssets);
            
            const hash = indexesData["objects"][e]["hash"]
            const subhash = hash.substring(0, 2)

            if(!existsSync(path.join(objectPath, subhash))){
                await fs.mkdir(path.join(objectPath, subhash))
            }

            const file = createWriteStream(path.join(objectPath, subhash, hash))

            // await new Promise((resolve, reject) => {
            //     https.get(path.join(resourcePackage, subhash, hash), (data) => {
            //         data.pipe(file)

            //         data.on("end", () => {
            //             numberOfAssetsDownloaded++
            //             resolve(data)
            //         })
                    
            //         data.on("error", (err) => {
            //             reject(err)
            //         })
            //     })
            // })

            // let fetch = await import("node-fetch")

            // await fetch.default(path.join(resourcePackage, subhash, hash)).then((data) => {
            //     data.body?.pipe(file)
            // })

            await fetch(path.join(resourcePackage, subhash, hash)).then(async (data) => {
                const arrayBuffer = await data.arrayBuffer()
                const buffer = Buffer.from(arrayBuffer)
                file.write(buffer)
            })

            numberOfAssetsDownloaded++
            
        }


        
    }).then(() => {
        makeInstanceDownloaded(name, instanceDiv)
    })
}

// Download Minecraft libraries
function downloadMinecraftLibrary(data: any, i: number){
    return new Promise(async (resolve, reject) => {
        const filePath = path.join(librariesPath, data['libraries'][i]['downloads']['artifact']['path'])
        const fileName = filePath.split("\\").pop()
        const dirPath = filePath.substring(0, filePath.indexOf(fileName!))

        // Create folder if dir does not exist
        if(!existsSync(dirPath)){
            await fs.mkdir(dirPath, {recursive: true})
        }

        console.log(filePath);

        // Download the jar file
        const file = createWriteStream(filePath)
        https.get(data["libraries"][i]["downloads"]["artifact"]["url"], (data) => {
            data.pipe(file)

            data.on("end", () => {
                resolve(data)
            })

            data.on("error", (err) => {
                reject(err)
            })
        })
    })
}

// Download Minecraft libraries (classify by os version)
function downloadClassifierMinecraftLibrary(data: any, e: string, i: number){
    return new Promise(async (resolve, reject) => {
        const filePath = path.join(librariesPath, data['libraries'][i]['downloads']['classifiers'][e]['path'])
        const fileName = filePath.split("\\").pop()
        const dirPath = filePath.substring(0, filePath.indexOf(fileName!))

        // Create folder if dir does not exist
        if(!existsSync(dirPath)){
            await fs.mkdir(dirPath, {recursive: true})
        }

        console.log(filePath);
        
        // Download the jar file
        const file = createWriteStream(filePath)
        https.get(data["libraries"][i]["downloads"]["classifiers"][e]["url"], (data) => {
            data.pipe(file)

            data.on("end", () => {
                resolve(data)
            })

            data.on("error", (err) => {
                reject(err)
            })
        })
    })
}

function downloadLoggingXmlConfFile(data: any){
    return new Promise(async (resolve, reject) => {
        if(!data.hasOwnProperty("logging")){
            resolve("No logging key found, step passed.")
        }
        if(!existsSync(loggingConfPath)){
            await fs.mkdir(loggingConfPath, {recursive: true})
        }

        const file = createWriteStream(path.join(loggingConfPath, data["logging"]["client"]["file"]["id"]))

        https.get(data["logging"]["client"]["file"]["url"], (data) => {
            data.pipe(file)

            data.on("end", () => {
                resolve(data)
            })

            data.on("error", (err) => {
                reject(err)
            })
        })
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
            await downloadAsync("https://github.com/adoptium/temurin8-binaries/releases/download/jdk8u345-b01/OpenJDK8U-jdk_x64_windows_hotspot_8u345b01.zip", path.join(javaPath, `${java8Version}.zip`), {decompress: true})
            resolve("Java 8 downloaded")
        }
            
        if(version == JavaVersions.JDK17){
            await downloadAsync("https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.5%2B8/OpenJDK17U-jdk_x64_windows_hotspot_17.0.5_8.zip", path.join(javaPath, `${java17Version}.zip`), {decompress: true})
            resolve("Java 17 downloaded")
        }
            
    })
}