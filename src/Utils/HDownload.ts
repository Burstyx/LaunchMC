import fs from "fs/promises"
import AdmZip from "adm-zip"
import checksum from "checksum";
import { createWriteStream } from "fs-extra";

interface DownloadOpt {
    decompress?: boolean,
    headers?: any,
    retry?: number,
    hash?: string
}

type CallbackProgress = (progress: number, byteSent: number) => void;

// Download url async
export function downloadAsync(url: string, dest: string, callback?: CallbackProgress, opt?: DownloadOpt) {
    return new Promise<string>(async (resolve, reject) => {
        const destDir = dest.slice(0, dest.lastIndexOf("\\"))
        await fs.mkdir(destDir, {recursive: true}).catch((err) => reject(err))

        const file = createWriteStream(dest)
        const xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
            if(xhr.readyState === XMLHttpRequest.DONE){
                if(xhr.status === 200){
                    const responseArrayBuffer = xhr.response;
                    const buffer = Buffer.from(responseArrayBuffer)

                    file.on("finish", async () => {
                        if(opt && opt["decompress"] == true){
                            const destWithoutExt = dest.substring(0, dest.lastIndexOf("."))
                            const zip = new AdmZip(dest)

                            try{
                                zip.extractAllTo(destWithoutExt, true)

                                await fs.rm(dest).catch((err) => reject(err))
                            }catch(err){
                                if(opt.retry != undefined) {
                                    if(opt.retry > 0) {
                                        await fs.rm(dest)
                                        await downloadAsync(url,  dest, callback, {retry: opt.retry - 1, hash: opt.hash, headers: opt.headers, decompress: opt.decompress})
                                    }
                                }

                                reject(err)
                            }
                        }
                    })

                    file.write(buffer)
                    file.close()

                    file.on("close", () => {
                        if(opt?.hash != undefined) {
                            checksum.file(dest, async (err, hash) => {
                                if(hash !== opt.hash) {
                                    if(opt.retry != undefined) {
                                        if(opt.retry > 0) {
                                            await fs.rm(dest).catch((err) => reject(err))
                                            await downloadAsync(url,  dest, callback, {retry: opt.retry - 1, hash: opt.hash, headers: opt.headers, decompress: opt.decompress})
                                        }
                                    }
                                }
                            })
                        }

                        resolve(dest)
                    })
                }else{
                    reject(Error(`${url} return code ${xhr.status}`))
                }
            }
        }

        let lastLoaded = 0

        xhr.onprogress = (evt) => {
            const loaded = evt.loaded
            const total = evt.total

            const percentage = Math.round((loaded / total) * 100)

            if(callback != undefined) callback(percentage, loaded - lastLoaded)
            
            lastLoaded = loaded
        }

        try {
            xhr.open("GET", url)

            if(opt?.headers != undefined) {
                for (const header of opt.headers) {
                    xhr.setRequestHeader(header.name, header.value)
                }
            }

            xhr.responseType = "arraybuffer"
            xhr.send()
        }catch (err) {
            reject(err)
        }
    })
}