import fs from "fs/promises"
import {createWriteStream} from "fs"
import extract from "extract-zip"

interface DownloadOpt {
    decompress: boolean
}

// Download url async
export function downloadAsync(url: string, dest: string, opt?: DownloadOpt): Promise<string> {
    return new Promise(async (resolve, reject) => {
        const file = createWriteStream(dest)

        // Download the file with fetch and resolve response
        await fetch(url).then(async (res) => {
            // Get buffer
            const arrayBuffer = await res.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            console.log(arrayBuffer.byteLength);

            file.write(buffer)            

            // Write buffer
            if(opt && opt["decompress"] == true){
                
                    const destWithoutExt = dest.substring(0, dest.lastIndexOf("."))

                    console.log(destWithoutExt);

                    await extract(dest, {dir: destWithoutExt})

                    file.close()
                    
                    resolve(dest)
                }else{
                    console.log(res);

                    file.close()
                    
                    resolve(dest)
                }

            

            
        }).catch((err) => reject(err))

        
    })
}