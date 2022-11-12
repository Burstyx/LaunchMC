import {createWriteStream} from "fs"
import extract from "extract-zip"
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
        const file = createWriteStream(dest)

        https.get(url, (res) => {

            let len = parseInt(res.headers["content-length"]!, 10);
            let cur = 0;
            let total = len / 1048576
            
            res.on("data", (chunk) => {                
                cur += chunk.length
                console.log(100.0 * cur / len);
                
            })

            

            res.on("error", (err) => {
                console.error(err);
                
            })

            res.on("end", async () => {
                if(opt && opt["decompress"] == true){
                
                    const destWithoutExt = dest.substring(0, dest.lastIndexOf("."))

                    console.log(destWithoutExt);

                    await extract(dest, {dir: destWithoutExt})

                    file.close()
                    
                    resolve(dest)
                }else{

                    file.close()
                    
                    resolve(dest)
                }
            })

            res.pipe(file)
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