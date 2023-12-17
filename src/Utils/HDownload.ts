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

                    file.write(buffer, (err) => {
                        if(err) {
                            reject(err)
                        }
                    })

                    file.close((err) => {
                        if(err) {
                            reject(err)
                        }
                    })

                    file.on("close", () => {
                        // Check file hash
                        if(opt?.hash != undefined) {
                            checksum.file(dest, async (err, hash) => {
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
                    })
                }else{
                    if(opt?.retry != undefined) {
                        if(opt.retry.count > 0) {
                            setTimeout(async () => {
                                await downloadAsync(url,  dest, callback, {retry: {count: opt.retry!.count - 1, timeout: opt.retry!.timeout}, hash: opt.hash, headers: opt.headers, decompress: opt.decompress})
                                    .then((res) => resolve(res))
                                    .catch((err) => {
                                        reject(err)
                                    })
                            }, opt.retry.timeout)
                        } else {
                            reject()
                        }
                    } else {
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
        }catch (err) {
            reject(err)
        }
    })
}