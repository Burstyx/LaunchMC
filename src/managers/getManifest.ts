import fs from "fs"
import { minecraftVersionPath, versionsManifest } from "../utils/const"
import https from "https"
import path from "path"

export async function getVersionManifest(version: string): Promise<any>{
    return await new Promise((resolve, reject) => {
        if(!fs.existsSync(path.join(minecraftVersionPath, version))){
            fs.mkdirSync(path.join(minecraftVersionPath, version), {recursive: true})
        }
        
        if(!fs.existsSync(path.join(minecraftVersionPath, version, version + ".json"))){
            fetch(versionsManifest).then((res) => {
                res.json().then((data) => {
                    for(let i = 0; i < data["versions"].length; i++){
                        if(data["versions"][i]["id"] == version){
                            const indexFile = fs.createWriteStream(path.join(minecraftVersionPath, version, version + ".json"))
            
                            https.get(data["versions"][i]["url"], (data) => {
                                data.pipe(indexFile)
                                data.on("end", () => {
                                    console.log("aaa");
                                    
                                    resolve(JSON.parse(fs.readFileSync(path.join(minecraftVersionPath, version, version + ".json"), "utf-8")))
                                })
                            })                    
                        }
                    }
                })
            })
        }else{
            resolve(JSON.parse(fs.readFileSync(path.join(minecraftVersionPath, version, version + ".json"), "utf-8")))
        }
    })
}