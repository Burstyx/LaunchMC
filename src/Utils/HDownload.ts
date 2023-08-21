import fs from "fs"
import AdmZip from "adm-zip"
import https from "https"
import { makeDir } from "./HFileManagement"
import {EventEmitter} from "node:events"

interface DownloadOpt {
    decompress?: boolean,
    overwrite?: boolean
}

type CallbackProgress = (progress: number, byteSent: number) => void;

// Download url async
export function downloadAsync(url: string, dest: string, callback?: CallbackProgress, opt?: DownloadOpt) {
    if(fs.existsSync(dest) && (!opt || opt.overwrite == false)) {
        console.log("Already exist, skip dl");
        return
    }

    return new Promise<void>(async (resolve, reject) => {
        const destDir = dest.slice(0, dest.lastIndexOf("\\"))

        console.log("destDir:", destDir);
        
        await makeDir(destDir)
        const file = fs.createWriteStream(dest)

        const xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
            if(xhr.readyState === XMLHttpRequest.DONE){
                if(xhr.status === 200){
                    const responseArrayBuffer = xhr.response;

                    const buffer = Buffer.from(responseArrayBuffer)

                    file.write(buffer)

                    console.log("téléchargement terminé");

                    if(opt && opt["decompress"] == true){
                        console.log("décompression....");
                        
                        const destWithoutExt = dest.substring(0, dest.lastIndexOf("."))

                        const zip = new AdmZip(dest)

                        try{
                            zip.extractAllTo(destWithoutExt, true)
                            console.log("décompressé !");
                        }catch(err){
                            console.error(err);
                        }
                    }

                    file.close()
                    resolve()
                }else{
                    console.log("erreur de téléchargement");
                    reject()
                }
            }
        }

        let lastLoaded = 0

        xhr.onprogress = (evt) => {
            const loaded = evt.loaded
            const total = evt.total

            const percentage = Math.round((loaded / total) * 100)

            if(callback != undefined)
                callback(percentage, loaded - lastLoaded)
            
            lastLoaded = loaded
        }

        xhr.open("GET", url)
        xhr.responseType = "arraybuffer"

        xhr.send()
    })
}