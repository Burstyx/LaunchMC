import fs from "fs/promises"
import path from "path"
import cp from "child_process"
import { existsSync } from "fs"

export async function makeDir(path: string){
    if(!existsSync(path)) await fs.mkdir(path, {recursive: true})

    return path
}

export async function getAllFile(pathDir: string): Promise<any> {
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