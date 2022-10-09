import fs from "fs"
const {manifestsVersionsPath, versionsManifest} = require("../utils/const")
import https from "https"
import path from "path"

export async function getVersionManifest(version: string): Promise<any>{
    return await new Promise((resolve, reject) => {
        if(!fs.existsSync(manifestsVersionsPath)){
            fs.mkdirSync(manifestsVersionsPath, {recursive: true})
        }
        
        if(!fs.existsSync(manifestsVersionsPath + "/" + version + ".json")){
            fetch(versionsManifest).then((res) => {
                res.json().then((data) => {
                    for(let i = 0; i < data["versions"].length; i++){
                        if(data["versions"][i]["id"] == version){
                            const indexFile = fs.createWriteStream(manifestsVersionsPath + "/" + version + ".json")
            
                            https.get(data["versions"][i]["url"], (data) => {
                                data.pipe(indexFile)
                                data.on("end", () => {
                                    console.log("aaa");
                                    
                                    resolve(JSON.parse(fs.readFileSync(manifestsVersionsPath + "/" + version + ".json", "utf-8")))
                                })
                            })                    
                        }
                    }
                })
            })
        }else{
            resolve(JSON.parse(fs.readFileSync(manifestsVersionsPath + "/" + version + ".json", "utf-8")))
        }
    })
}