import fs from "fs/promises"
import AdmZip from "adm-zip"
import checksum from "checksum";
import { createWriteStream } from "fs-extra";

interface DownloadOpt {
    decompress?: boolean,
    headers?: any,
    retry?: {
        count: number,
        timeout: number,
    }
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

        xhr.onreadystatechange = async () => {
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
                            }catch (err) {
                                reject(err)
                            }
                        }
                    })

                    file.write(buffer)
                    file.close()

                    file.on("close", () => {
                        // Check file hash
                        if(opt?.hash != undefined) {
                            checksum.file(dest, async (err, hash) => {
                                if(hash !== opt.hash) {
                                    console.log(`${destDir} is not valid!`)
                                    if(opt.retry != undefined) {
                                        if(opt.retry.count > 0) {
                                            await fs.rm(dest).catch((err) => reject(err))
                                            setTimeout(async () => {
                                                await downloadAsync(url,  dest, callback, {retry: {count: opt.retry!.count - 1, timeout: opt.retry!.timeout}, hash: opt.hash, headers: opt.headers, decompress: opt.decompress})
                                            }, opt.retry.timeout)
                                        } else {
                                            reject(`Can't download file from ${url}, the checksum cannot be verified: expected -> ${opt.hash} ; current -> ${hash}.`)
                                        }
                                    }
                                } else {
                                    console.log(`${dest} validated successfully!`)
                                    resolve(dest)
                                }
                            })
                        } else {
                            resolve(dest)
                        }
                    })
                }else{
                    if(opt?.retry != undefined) {
                        if(opt.retry.count > 0) {
                            await fs.rm(dest).catch((err) => reject(err))
                            setTimeout(async () => {
                                await downloadAsync(url,  dest, callback, {retry: {count: opt.retry!.count - 1, timeout: opt.retry!.timeout}, hash: opt.hash, headers: opt.headers, decompress: opt.decompress})
                            }, opt.retry.timeout)
                        } else {
                            reject(`All attempt has be used to download file from ${url} without success. Error code: ${xhr.status}.`)
                        }
                    } else {
                        reject(`Can't download file from ${url}, code: ${xhr.status}.`)
                    }
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