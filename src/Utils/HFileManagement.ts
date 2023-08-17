import fs from "fs/promises"
import path from "path"
import cp from "child_process"
import { existsSync } from "fs"
import { gamePath, java17Name, java17Version, javaPath } from "./const"

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

export async function extractSpecificFile(compressedDirPath: string, filePath: string) {
    return new Promise<void>((res, rej) => {
        const jar = path.join(javaPath, java17Version, java17Name, "bin", "jar")

        cp.exec(jar + ` --list --file ${compressedDirPath}`, async (err, stdout) => {
            const files = stdout.split("\r\n")
            console.log(files);
            
            for (const n of files) {                
                if(err != null) {
                    console.error(err);
                    rej()
                }

                if (n == filePath) {
                    cp.exec(`${jar} xf ${compressedDirPath} ${n}`, { cwd: gamePath }).addListener("close", (code) => { console.log(code); res() });
                }
            }
        })
    })
}

export async function extractFilesWithExt(compressedDirPath: string, ext: string) {
    
}

export async function extractAll(compressedDirPath: string, dest?: string) {
    
}

export async function mavenToArray(maven: string, ext?: string) {
    let mavenArray: string[] = []

    const mavenParts = maven.split(":")
    const linkParts = mavenParts[0].split(".")

    mavenArray = linkParts.concat(mavenParts.slice(1))

    mavenArray.push(`${mavenParts[mavenParts.length - 2]}-${mavenParts[mavenParts.length - 1]}.${ext != undefined ? ext : "jar"}`)

    return mavenArray
}