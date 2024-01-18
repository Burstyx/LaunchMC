import fs from "fs/promises"
import AdmZip from "adm-zip"
import checksum from "checksum";
import { createWriteStream } from "fs-extra";
import {existsSync} from "fs";

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
        if(existsSync(dest) && opt?.hash) {
            checksum.file(dest, (err, hash) => {
                if(hash === opt.hash) {
                    console.log("Fichier existe déjà et n'est pas corrompu, fichier passé.")
                    resolve(dest)
                }
            })
        }

        const destDir = dest.slice(0, dest.lastIndexOf("\\"))
        await fs.mkdir(destDir, {recursive: true}).catch((err) => reject(err))

        const file = createWriteStream(dest)
        const xhr = new XMLHttpRequest();

        file.on("error", (err) => {
            file.close()
            reject(err)
        })

        xhr.onreadystatechange = async () => {
            if(xhr.readyState === XMLHttpRequest.DONE){
                if(xhr.status === 200){
                    const responseArrayBuffer = xhr.response;
                    const buffer = Buffer.from(responseArrayBuffer)

                    file.on("finish", async () => {
                        if(opt && opt["decompress"] == true){
                            const destWithoutExt = dest.substring(0, dest.lastIndexOf("."))
                            const zip = new AdmZip(dest)

                            zip.extractAllTo(destWithoutExt, true) // FIXME: launcher freeze during decompressing

                            await fs.rm(dest).catch((err) => {
                                file.close()
                                reject(err)
                            })
                        }
                    })

                    file.write(buffer, (err) => {
                        if(err) {
                            file.close()
                            reject(err)
                        }
                    })

                    file.close((err) => {
                        if(err) {
                            reject(err)
                        }else {
                            // Check file hash
                            if(opt?.hash != undefined) {
                                checksum.file(dest, async (err, hash) => {
                                    console.log(hash + " is a valid hash!")
                                    if(hash !== opt.hash) {
                                        if(opt.retry != undefined) {
                                            if(opt.retry.count > 0) {
                                                await fs.rm(dest).catch((err) => {
                                                    reject(err)
                                                })
                                                setTimeout(async () => {
                                                    await downloadAsync(url, dest, callback, {retry: {count: opt.retry!.count - 1, timeout: opt.retry!.timeout}, hash: opt.hash, headers: opt.headers, decompress: opt.decompress})
                                                        .then((res) => resolve(res))
                                                        .catch((err) => {
                                                            reject(err)
                                                        })
                                                }, opt.retry.timeout)
                                            } else {
                                                reject(err)
                                            }
                                        }
                                    } else {
                                        resolve(dest)
                                    }
                                })
                            } else {
                                resolve(dest)
                            }
                        }
                    })
                }else{
                    if(opt?.retry != undefined) {
                        if(opt.retry.count > 0) {
                            setTimeout(async () => {
                                file.close()

                                await downloadAsync(url,  dest, callback, {retry: {count: opt.retry!.count - 1, timeout: opt.retry!.timeout}, hash: opt.hash, headers: opt.headers, decompress: opt.decompress})
                                    .then((res) => resolve(res))
                                    .catch((err) => {
                                        reject(err)
                                    })
                            }, opt.retry.timeout)
                        } else {
                            file.close()
                            reject()
                        }
                    } else {
                        file.close()
                        reject()
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
            xhr.setRequestHeader("Cache-Control", "no-cache")

            if(opt?.headers != undefined) {
                for (const header of opt.headers) {
                    xhr.setRequestHeader(header.name, header.value)
                }
            }

            xhr.responseType = "arraybuffer"
            xhr.send()
        } catch (err) {
            file.close()
            reject(err)
        }
    })
}