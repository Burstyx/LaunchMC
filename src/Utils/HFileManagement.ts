import fs from "fs/promises"
import { move } from "fs-extra"
import path from "path"
import cp from "child_process"
import { tempPath } from "./const"
import { downloadAndGetJavaVersion, JavaVersions } from "../App/DownloadGame"
import { replaceAll } from "./Utils"
import {CallbackEvent} from "./Debug";

export async function getAllFile(pathDir: string, event: CallbackEvent) {
    return new Promise<any>(async (resolve, reject) => {
        let files: any[] = []
        await fs.readdir(pathDir, {withFileTypes: true}).then(async (items) => {
            if(items === null) return files;

            for(const item of items){
                if(item.isDirectory()){
                    files = [
                        ...files,
                        ...(await getAllFile(path.join(pathDir, item.name), event))
                    ]
                }else{
                    files.push(path.join(pathDir, item.name))
                }
            }

            resolve(files)
        }).catch((err) => {
            event(`Impossible de lire le dossier ${pathDir}.`, err, "err")
            reject()
        })
    })
}

export async function extractSpecificFile(compressedDirPath: string, filePath: string, event: CallbackEvent, dest?: string) {
    return new Promise<void>(async (resolve, reject) => {
        filePath = replaceAll(filePath, "\\", "/")

        await downloadAndGetJavaVersion(JavaVersions.JDK17).then((jarPath) => {
            const jar = path.join(jarPath, `jar`)

            cp.exec(jar + ` --list --file ${compressedDirPath}`, async (err, stdout) => {
                const files = stdout.split("\r\n")
                if(err) {
                    event(`La récupération des fichiers de ${compressedDirPath} n'a pu aboutir.`, err, "err")
                    reject()
                }

                for (const n of files) {
                    if (n == filePath) {
                        const proc = cp.exec(`"${jar}" xf ${compressedDirPath} ${n}`, {cwd: path.dirname(compressedDirPath)})

                        proc.on("close", async () => {
                            if(dest != undefined) {
                                await move(path.join(path.dirname(compressedDirPath), filePath), dest, {overwrite: true}).catch((err) => reject(err))
                            }

                            resolve()
                        })

                        proc.on("error", (err) => {
                            event(`L'extraction de ${filePath} dans ${compressedDirPath} n'a pu aboutir.`, err, "err")
                            reject()
                        })
                    }
                }
            })
        }).catch((err) => {
            event(`Le JDK 17 n'a pas pu être récupéré, l'extraction du fichier ${compressedDirPath} n'a pu aboutir.`, err, "err")
            reject()
        })
    })
}

export async function readJarMetaInf(jar: string, attribute: string, event: CallbackEvent) {
    return new Promise<string>(async (resolve, reject) => {
        await extractSpecificFile(jar, "META-INF/MANIFEST.MF", () => {
            // FIXME Handle errors
        }, path.join(tempPath, "MANIFEST.MF"))

        await fs.readFile(path.join(tempPath, "MANIFEST.MF"), "utf-8").then(async (manifest) => {
            await fs.rm(path.join(tempPath, "MANIFEST.MF")).catch((err) => {
                event(`Impossible de supprimer le fichier manifest de ${jar} du dossier temporaire.`, err, "warn")
            })

            const lines = manifest.split("\n")
            const mainClassLine = lines.find((line: string) => line.startsWith(`${attribute}: `))

            if(mainClassLine === undefined) {
                event(`La propriété MainClass du manifest de ${jar} renvoie une valeur undefined.`, null, "err")
                reject()
            }

            // @ts-ignore
            resolve(mainClassLine.substring(`${attribute}: `.length))
        }).catch((err) => {
            event(`Impossible de lire le fichier manifest de ${jar}.`, err, "err")
            reject()
        })
    })
}

export function mavenToArray(maven: string, native?: string, ext?: string) {
    if(!maven.includes(":")) return [maven]

    const pathSplit = maven.split(':');
    const fileName = pathSplit[3]
        ? `${pathSplit[2]}-${pathSplit[3]}`
        : pathSplit[2];
    const finalFileName = fileName.includes('@')
        ? fileName.replace('@', '.')
        : `${fileName}${native || ''}.${ext || 'jar'}`;
    return pathSplit[0]
        .split('.')
        .concat(pathSplit[1])
        .concat(pathSplit[2].split('@')[0])
        .concat(`${pathSplit[1]}-${finalFileName}`);
}