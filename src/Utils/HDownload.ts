import fs from "fs/promises"
import AdmZip from "adm-zip"
import { makeDir } from "./HFileManagement"
import checksum from "checksum";
import {createWriteStream} from "fs-extra";
// @ts-ignore
import {info, error} from "./Debug";

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
        await makeDir(destDir)

        const file = createWriteStream(dest)
        const xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
            if(xhr.readyState === XMLHttpRequest.DONE){
                if(xhr.status === 200){
                    info(`Downloading ${dest} from ${url}...`)

                    const responseArrayBuffer = xhr.response;
                    const buffer = Buffer.from(responseArrayBuffer)

                    file.on("finish", async () => {
                        info(`Downloaded ${dest} from ${url}!`)

                        if(opt && opt["decompress"] == true){
                            info(`Extracting ${dest}...`)

                            const destWithoutExt = dest.substring(0, dest.lastIndexOf("."))
                            const zip = new AdmZip(dest)

                            try{
                                zip.extractAllTo(destWithoutExt, true)
                                await fs.rm(dest)
                                info(`Extracted and deleted ${dest}!`)
                            }catch(e){
                                if(opt.retry != undefined) {
                                    if(opt.retry > 0) {
                                        error(`Failed to download ${dest} from ${url}, ${opt.retry} remaining...`)

                                        await fs.rm(dest)
                                        await downloadAsync(url,  dest, callback, {retry: opt.retry - 1, hash: opt.hash, headers: opt.headers, decompress: opt.decompress})
                                    }

                                    return
                                }

                                error(`Can't download ${dest} from ${url}, skip this file: ${e}`)
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
                                            await fs.rm(dest)
                                            await downloadAsync(url,  dest, callback, {retry: opt.retry - 1, hash: opt.hash, headers: opt.headers, decompress: opt.decompress})
                                        }
                                    }
                                }
                            })
                        }

                        resolve(dest)
                    })
                }else{
                    error(`Can't retrieve the URL ${url}, stopped with status code ${xhr.status}.`)
                    reject()
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
        }catch (e) {
            error(`Failed to use XHR object with url ${url}: ${e}`)
        }
    })
}