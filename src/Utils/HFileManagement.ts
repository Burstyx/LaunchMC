import fs from "fs/promises"
import { move } from "fs-extra"
import path from "path"
import cp from "child_process"
import { tempPath } from "./const"
import { downloadAndGetJavaVersion, JavaVersions } from "../App/DownloadGame"
import { replaceAll } from "./Utils"

export async function getAllFile(pathDir: string) {
    return new Promise<any>(async (resolve, reject) => {
        let files: any[] = []
        fs.readdir(pathDir, {withFileTypes: true}).then(async (items) => {
            if(items === null) return files;

            for(const item of items){
                if(item.isDirectory()){
                    files = [
                        ...files,
                        ...(await getAllFile(path.join(pathDir, item.name)))
                    ]
                }else{
                    files.push(path.join(pathDir, item.name))
                }
            }

            resolve(files)
        }).catch((err) => reject(err))
    })
}

export async function extractSpecificFile(compressedDirPath: string, filePath: string, dest?: string) {
    return new Promise<void>(async (resolve, reject) => {
        filePath = replaceAll(filePath, "\\", "/")

        downloadAndGetJavaVersion(JavaVersions.JDK17).then((jarPath) => {
            const jar = path.join(jarPath, `jar`)

            cp.exec(jar + ` --list --file ${compressedDirPath}`, async (err, stdout) => {
                const files = stdout.split("\r\n")
                if(err) {
                    reject(err)
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
                            reject(err)
                        })
                    }
                }
            })
        }).catch((err) => reject(err))

        reject(Error(`${filePath} don't exist in ${compressedDirPath}`))
    })
}

export async function readJarMetaInf(jar: string, attribute: string) {
    return new Promise<string>(async (resolve, reject) => {
        await extractSpecificFile(jar, "META-INF/MANIFEST.MF", path.join(tempPath, "MANIFEST.MF"))

        fs.readFile(path.join(tempPath, "MANIFEST.MF"), "utf-8").then(async (manifest) => {
            await fs.unlink(path.join(tempPath, "MANIFEST.MF"))

            const lines = manifest.split("\n")
            const mainClassLine = lines.find((line: string) => line.startsWith(`${attribute}: `))

            if(mainClassLine === undefined) reject(Error(`Method returned undefined value while retrieving ${attribute} from ${jar}`))

            // @ts-ignore
            resolve(mainClassLine.substring(`${attribute}: `.length))
        }).catch((err) => reject(err))
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