import fs from "fs/promises"
import AdmZip from "adm-zip"
import checksum from "checksum";
import { createWriteStream } from "fs-extra";
import {CallbackEvent} from "./Debug";

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
export function downloadAsync(url: string, dest: string, event: CallbackEvent, callback?: CallbackProgress, opt?: DownloadOpt) {
    return new Promise<string>(async (resolve, reject) => {
        const destDir = dest.slice(0, dest.lastIndexOf("\\"))
        await fs.mkdir(destDir, {recursive: true}).catch((err) => {
            event(`Impossible de créer le dossier ${destDir}.`, err, "err")
            reject()
        })

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

                                await fs.rm(dest).catch((err) => {
                                    event(`Impossible de supprimer le fichier ${dest}.`, err, "warn")
                                })
                            }catch (err) {
                                event(`Le fichier ${dest} n'a pas pu être extrait.`, err, "err")
                                reject()
                            }
                        }
                    })

                    file.write(buffer, (err) => {
                        if(err) {
                            event(`Impossible d'écrire dans le fichier ${dest}.`, err, "err")
                            reject()
                        }

                    })

                    file.close((err) => {
                        if(err) {
                            event(`Impossible de fermer le fichier ${dest}.`, err, "err")
                            reject()
                        }
                    })

                    file.on("close", () => {
                        // Check file hash
                        if(opt?.hash != undefined) {
                            checksum.file(dest, async (err, hash) => {
                                if(hash !== opt.hash) {
                                    event(`La vérification de ${dest} ne s'est pas passé comme prévu.`, err, "err")
                                    if(opt.retry != undefined) {
                                        if(opt.retry.count > 0) {
                                            await fs.rm(dest).catch((err) => {
                                                event(`Impossible de supprimer le fichier ${dest}.`, err, "warn")
                                            })
                                            setTimeout(async () => {
                                                await downloadAsync(url, dest, event, callback, {retry: {count: opt.retry!.count - 1, timeout: opt.retry!.timeout}, hash: opt.hash, headers: opt.headers, decompress: opt.decompress})
                                                    .then((res) => resolve(res))
                                                    .catch((err) => {
                                                        event(`La tentative de téléchargement de ${url} a échoué.`, err, "err")
                                                        reject()
                                                    })
                                            }, opt.retry.timeout)
                                        } else {
                                            event(`La vérification du fichier ${dest} a échoué, le checksum attendu (${opt.hash}) ne correspond pas au checksum obtenu (${hash}).`, err, "err")
                                            reject()
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
                                await downloadAsync(url,  dest, event, callback, {retry: {count: opt.retry!.count - 1, timeout: opt.retry!.timeout}, hash: opt.hash, headers: opt.headers, decompress: opt.decompress})
                                    .then((res) => resolve(res))
                                    .catch((err) => {
                                        event(`La connexion avec ${url} n'a pas pu être établi (code ${xhr.status}), il reste ${opt.retry?.count} tentative(s).`, err, "warn")
                                    })
                            }, opt.retry.timeout)
                        } else {
                            event(`La connexion avec ${url} n'a pas pu être établi (code ${xhr.status}), toutes les tentatives ont été utilisé.`, null, "err")
                            reject()
                        }
                    } else {
                        event(`La connexion avec ${url} n'a pas pu être établi (code ${xhr.status}).`, null, "err")
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