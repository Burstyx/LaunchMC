import fs from "fs"
import AdmZip from "adm-zip"
import https from "https"
import { makeDir } from "./HDirectoryManager"

interface DownloadOpt {
    decompress: boolean,
}

// Download url async
export function downloadAsync(url: string, dest: string, opt?: DownloadOpt): Promise<string> {
    return new Promise(async (resolve, reject) => {
        const destDir = dest.slice(0, dest.lastIndexOf("\\"))

        console.log("destDir:", destDir);
        
        await makeDir(destDir)
        const file = fs.createWriteStream(dest)

        // https.get(url, {headers: {"Content-Type": "application/octet-stream"}}, (res) => {
        //     res.pipe(file)

        //     let len = parseInt(res.headers["content-length"]!, 10);
        //     let cur = 0;
        //     let total = len / 1048576
            
        //     res.on("data", (chunk) => {                
        //         cur += chunk.length
        //         console.log(100.0 * cur / len);
        //     })

            

        //     file.on("error", (err) => {
        //         console.error(err);
                
        //     })

        //     file.on("finish", async () => {
        //         if(opt && opt["decompress"] == true){
                
        //             const destWithoutExt = dest.substring(0, dest.lastIndexOf("."))

        //             console.log(destWithoutExt);

        //             const zip = new AdmZip(dest)

        //             try{
        //                 zip.extractAllTo(destWithoutExt, true)
        //             }catch(err){
        //                 console.error(err);
        //             }

        //             file.close()
                    
        //             resolve(dest)
        //         }else{

        //             file.close()
                    
        //             resolve(dest)
        //         }
        //     })
        // })

        fetch(url).then(res => {
            res.arrayBuffer().then(arrayBuffer => {
                const buffer = Buffer.from(arrayBuffer)

                fs.writeFile(dest, buffer, err => {
                    if(err){
                        console.error(err);
                    }else{
                        console.log("téléchargement parfait");

                        if(opt && opt["decompress"] == true){
                            const destWithoutExt = dest.substring(0, dest.lastIndexOf("."))

                            const zip = new AdmZip(dest)

                            try{
                                zip.extractAllTo(destWithoutExt, true)
                            }catch(err){
                                console.error(err);
                            }

                            file.close()
                            
                            resolve(dest)
                        }else{

                            file.close()
                            
                            resolve(dest)
                        }
                    }
                })
            })
        })

        // Download the file with fetch and resolve response
        // const response = await fetch(url)
        // // Get buffer
        // const arrayBuffer = await response.arrayBuffer()
        // const buffer = Buffer.from(arrayBuffer)

        // const interval = setInterval(async () => {
        //     const reader = await res.body!.getReader().read()
        //     response..on("data", (chunk) => {

        //     })

        //     const sizeToDownload = opt!.size;
        //     const sizeDownloaded = reader!.value?.length

        //     if(reader!.done){
        //         clearInterval(interval)
        //     }

        //     console.log((sizeDownloaded! * 100)/sizeToDownload!);
            
        // }, 1000)

        

        

        // file.write(buffer)   

        // Write buffer
        


        
    })
}