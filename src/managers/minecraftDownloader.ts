const {gamePath} = require("../utils/const")
import os from "os"
import fs from "fs"
import https from "https"

export function downloadVanillaVersion(version: string, name: string){
    console.log(version);
    
    
    fetch("https://piston-meta.mojang.com/mc/game/version_manifest.json").then((res) => {
        res.json().then((data) => {
            
            const versions = data["versions"]
            let numberOfLibrariesToDownload = 0
            let numberOfLibrariesDownloaded = 0
            for(let i = 0; i < data["versions"].length; i++){
                
                if(data["versions"][i]["id"] == version){
                    console.log("df");
                    fetch(data["versions"][i]["url"]).then((res) => {
                        res.json().then((data) => {
                            for(let i = 0; i < data["libraries"].length; i++){
                                numberOfLibrariesToDownload++
                            }
                            for(let i = 0; i < data["libraries"].length; i++){
                                if(data["libraries"][i]["downloads"].hasOwnProperty("classifiers")){
                                    for(let e in data["libraries"][i]["downloads"]["classifiers"]){
                                        if(e.includes("windows") && os.platform() == "win32"){
                                            downloadClassifierMinecraftLibrary(data, e, i)
                                        }
                                        if(e.includes("osx") && os.platform() == "darwin"){
                                            downloadClassifierMinecraftLibrary(data, e, i)
                                        }
                                        if(e.includes("linux")&& os.platform() == "linux"){
                                            downloadClassifierMinecraftLibrary(data, e, i)
                                        }
                                    }
                                }else{
                                    downloadMinecraftLibrary(data, i)
                                }
                                numberOfLibrariesDownloaded++
                                console.log(numberOfLibrariesDownloaded + "/" + numberOfLibrariesToDownload);
                                
                            }
                        })
                    })
                }
            }
        })
    })
}

function downloadMinecraftLibrary(data: any, i: number){

    const filePath = gamePath + '/libraries/' + data['libraries'][i]['downloads']['artifact']['path']
    const fileName = filePath.split("/").pop()
    const dirPath = filePath.substring(0, filePath.indexOf(fileName!))

    if(!fs.existsSync(dirPath)){
        fs.mkdirSync(dirPath, {recursive: true})
    }
    const file = fs.createWriteStream(filePath)
    https.get(data["libraries"][i]["downloads"]["artifact"]["url"], (data) => {
        data.pipe(file)
    })
}

function downloadClassifierMinecraftLibrary(data: any, e: string, i: number){

    const filePath = gamePath + '/libraries/' + data['libraries'][i]['downloads']['classifiers'][e]['path']
    const fileName = filePath.split("/").pop()
    const dirPath = filePath.substring(0, filePath.indexOf(fileName!))

    if(!fs.existsSync(dirPath)){
        fs.mkdirSync(dirPath, {recursive: true})
    }
    const file = fs.createWriteStream(filePath)
    https.get(data["libraries"][i]["downloads"]["classifiers"][e]["url"], (data) => {
        data.pipe(file)

    })
}