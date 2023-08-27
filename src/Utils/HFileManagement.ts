import fs from "fs/promises"
import fse from "fs-extra"
import path from "path"
import cp from "child_process"
import { existsSync } from "fs"
import { gamePath, java17Name, java17Version, javaPath, tempPath } from "./const"
import { JavaVersions, downloadAndGetJavaVersion } from "../App/DownloadGame"

export async function makeDir(path: string){
    if(!existsSync(path)) await fs.mkdir(path, {recursive: true})

    return path
}

export async function getAllFile(pathDir: string) {
    let files: any[] = []
    const items = await fs.readdir(pathDir, {withFileTypes: true})

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
    return new Promise<void>(async (res, rej) => {
        const jar = path.join(await downloadAndGetJavaVersion(JavaVersions.JDK17), "jar")

        console.log(`Extracting ${filePath} from ${compressedDirPath}...`);

        cp.exec(jar + ` --list --file ${compressedDirPath}`, async (err, stdout) => {
            const files = stdout.split("\r\n")
            
            for (const n of files) {                            
                if(err != null) {
                    console.error(err);
                    rej()
                }

                if (n == filePath) {                    
                    const proc = cp.exec(`"${jar}" xf ${compressedDirPath} ${n}`, {cwd: path.dirname(compressedDirPath)})

                    proc.on("close", async (code) => {
                        console.log("Exited with code " + code);

                        if(dest != undefined) {
                            await fse.move(path.join(path.dirname(compressedDirPath), filePath), dest, {overwrite: true})
                        }

                        res()
                    })

                    proc.stderr?.on("data", (data) => console.error(data))
                }                
            }
        })         
    })
}

export async function extractFilesWithExt(compressedDirPath: string, ext: string) {
    
}

export async function extractAll(compressedDirPath: string, dest?: string) {
    
}

export function mavenToArray(maven: string, native?: string, ext?: string) {
    // let mavenArray: string[] = []

    // console.log("Here maven to array way");
    

    // const mavenExt = maven.split("@")[1]

    // console.log("mavenExt: " + mavenExt);
    
    // maven = maven.split("@")[0]

    // console.log("maven: " + maven);

    // const mavenParts = maven.split(":")
    // console.log("mavenParts: " + mavenParts);
    // const linkParts = mavenParts[0].split(".")
    // console.log("linkParts: " + linkParts);

    // mavenArray = linkParts.concat(mavenParts.slice(1))

    // console.log("mavenArray: " + mavenArray);

    // mavenArray.push(`${mavenParts[mavenParts.length - 2]}-${mavenParts[mavenParts.length - 1]}${native ? `-${native}` : ""}.${ext != undefined ? ext : mavenExt != undefined ? mavenExt : "jar"}`)

    // console.log("mavenArray: " + mavenArray);
    

    // return mavenArray

    const pathSplit = maven.split(':');
  const fileName = pathSplit[3]
    ? `${pathSplit[2]}-${pathSplit[3]}`
    : pathSplit[2];
  const finalFileName = fileName.includes('@')
    ? fileName.replace('@', '.')
    : `${fileName}${native || ''}.${ext || 'jar'}`;
  const initPath = pathSplit[0]
    .split('.')
    .concat(pathSplit[1])
    .concat(pathSplit[2].split('@')[0])
    .concat(`${pathSplit[1]}-${finalFileName}`);
  return initPath;
}

export async function readJarMetaInf(jar: string, attribute: string) {
    await extractSpecificFile(jar, "META-INF/MANIFEST.MF", path.join(tempPath, "MANIFEST.MF"))

    const manifest = await fs.readFile(path.join(tempPath, "MANIFEST.MF"), "utf-8")
    await fs.unlink(path.join(tempPath, "MANIFEST.MF"))

    const lines = manifest.split("\n")
    const mainClassLine = lines.find((line: string) => line.startsWith(`${attribute}: `))

    return mainClassLine?.substring(`${attribute}: `.length)
}