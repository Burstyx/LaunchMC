const {dataPath, indexesPath, minecraftJarPath} = require("../utils/const")
import os from "os"
import fs from "fs"
import https from "https"
import {getVersionManifest} from "./getMinecraftVersionManifest"
import { getMinecraftVersions } from "./fetchBootloaderVersions"
import {startMinecraft} from "./startInstance"

export async function downloadVanillaVersion(version: string, name: string){
    console.log(version);
    
    getVersionManifest(version).then((data) => {
        let numberOfLibrariesToDownload = 0
        let numberOfLibrariesDownloaded = 0

        // Verification of the game version
        for(let i = 0; i < data["libraries"].length; i++){
            numberOfLibrariesToDownload++
        }
        // Download client
        console.log("Downloading minecraft client");

        if(!fs.existsSync(minecraftJarPath)){
            fs.mkdirSync(minecraftJarPath, {recursive: true})
        } 
        
        const minecraftJarFile = fs.createWriteStream(minecraftJarPath + "/" + data["id"] + ".jar")
        
        https.get(data["downloads"]["client"]["url"], (data) => {
            data.pipe(minecraftJarFile)
        })

        console.log("Minecraft client downloaded");

        // Download Libraries
        console.log("Downloading minecraft libraries");
        for(let i = 0; i < data["libraries"].length; i++){
            if(data["libraries"][i]["downloads"].hasOwnProperty("classifiers")){
                for(let e in data["libraries"][i]["downloads"]["classifiers"]){
                    if(e.includes("windows") && os.platform() == "win32"){
                        downloadClassifierMinecraftLibrary(data, e, i)
                    }
                    if(e.includes("osx") && os.platform() == "darwin"){
                        downloadClassifierMinecraftLibrary(data, e, i)
                    }
                    if(e.includes("linux") && os.platform() == "linux"){
                        downloadClassifierMinecraftLibrary(data, e, i)
                    }
                }
            }else{
                downloadMinecraftLibrary(data, i)
            }
            numberOfLibrariesDownloaded++
            console.log(numberOfLibrariesDownloaded + "/" + numberOfLibrariesToDownload);
        }
        console.log("Minecraft libraries downloaded");
        // Download indexes
        console.log("Downloading minecraft index");

        if(!fs.existsSync(indexesPath)){
            fs.mkdirSync(indexesPath, {recursive: true})
        }
        
        const indexFile = fs.createWriteStream(indexesPath + "/" + data["assetIndex"]["id"] + ".json")
        
        https.get(data["assetIndex"]["url"], (data) => {
            data.pipe(indexFile)
        })
        console.log("Minecraft index downloaded");
    })

    startMinecraft(version)
}

// Download Minecraft libraries
function downloadMinecraftLibrary(data: any, i: number){
    const filePath = dataPath + '/libraries/' + data['libraries'][i]['downloads']['artifact']['path']
    const fileName = filePath.split("/").pop()
    const dirPath = filePath.substring(0, filePath.indexOf(fileName!))

    // Create folder if dir does not exist
    if(!fs.existsSync(dirPath)){
        fs.mkdirSync(dirPath, {recursive: true})
    }

    // Download the jar file
    const file = fs.createWriteStream(filePath)
    https.get(data["libraries"][i]["downloads"]["artifact"]["url"], (data) => {
        data.pipe(file)
    })
}

// Download Minecraft libraries (classify by os version)
function downloadClassifierMinecraftLibrary(data: any, e: string, i: number){
    const filePath = dataPath + '/libraries/' + data['libraries'][i]['downloads']['classifiers'][e]['path']
    const fileName = filePath.split("/").pop()
    const dirPath = filePath.substring(0, filePath.indexOf(fileName!))

    // Create folder if dir does not exist
    if(!fs.existsSync(dirPath)){
        fs.mkdirSync(dirPath, {recursive: true})
    }

    // Download the jar file
    const file = fs.createWriteStream(filePath)
    https.get(data["libraries"][i]["downloads"]["classifiers"][e]["url"], (data) => {
        data.pipe(file)
    })
}