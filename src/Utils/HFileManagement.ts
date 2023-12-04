import fs from "fs/promises"
import fse from "fs-extra"
import path from "path"
import cp from "child_process"
import {tempPath} from "./const"
import {downloadAndGetJavaVersion, JavaVersions} from "../App/DownloadGame"
import {replaceAll} from "./Utils"
import {error, info} from "./Debug";

export async function makeDir(path: fse.PathLike, options?: fse.MakeDirectoryOptions){
    try {
        await fs.mkdir(path, {mode: options?.mode, recursive: options?.recursive === undefined ? true : options.recursive})
        info(`Created folder in ${path}...`)
    } catch (e) {
        error(`Failed to create folder ${path} : ${e}`)
    }

    return path
}

export async function readDir(path: fse.PathLike, options?: {recursive: boolean, encoding: BufferEncoding}) {
    try {
        const dir = await fs.readdir(path, {recursive: options?.recursive, withFileTypes: true, encoding: options?.encoding})
        info(`Reading directory ${path}...`)

        return dir
    } catch (e) {
        error(`Failed to read directory ${path}: ${e}`)
    }

    return null
}

export async function getAllFile(pathDir: string) {
    let files: any[] = []
    const items = await readDir(pathDir)

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

    return files
}

export async function extractSpecificFile(compressedDirPath: string, filePath: string, dest?: string) {
    return new Promise<void>(async (resolve, reject) => {
        info(`Extracting ${filePath} from ${compressedDirPath}...`)

        filePath = replaceAll(filePath, "\\", "/")
        const jar = path.join(await downloadAndGetJavaVersion(JavaVersions.JDK17), "jar")

        cp.exec(jar + ` --list --file ${compressedDirPath}`, async (err, stdout) => {
            const files = stdout.split("\r\n")
            
            for (const n of files) {                            
                if(err != null) {
                    error(`Can't list files in ${compressedDirPath}: ${err}`)
                    reject()
                }                

                if (n == filePath) {                    
                    const proc = cp.exec(`"${jar}" xf ${compressedDirPath} ${n}`, {cwd: path.dirname(compressedDirPath)})

                    proc.on("close", async (code) => {
                        if(dest != undefined) {
                            await fse.move(path.join(path.dirname(compressedDirPath), filePath), dest, {overwrite: true})
                        }

                        info(`Extracted ${filePath} from ${compressedDirPath}.`)
                        resolve()
                    })

                    proc.stderr?.on("data", (data) => error(`An error occurred while extracting ${filePath} from ${compressedDirPath}: ${data}`))
                }                
            }
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

export async function readJarMetaInf(jar: string, attribute: string) {
    await extractSpecificFile(jar, "META-INF/MANIFEST.MF", path.join(tempPath, "MANIFEST.MF"))

    try {
        const manifest = await fs.readFile(path.join(tempPath, "MANIFEST.MF"), "utf-8")
        await fs.unlink(path.join(tempPath, "MANIFEST.MF"))

        const lines = manifest.split("\n")
        const mainClassLine = lines.find((line: string) => line.startsWith(`${attribute}: `))

        return mainClassLine?.substring(`${attribute}: `.length)
    } catch (e) {
        error(`Failed to read MANIFEST file of ${jar}: ${e}`)
    }

    return null
}