import fs from "fs/promises"
import {existsSync} from "fs"

export async function makeDir(path: string){
    if(!existsSync(path)){
        await fs.mkdir(path, {recursive: true})
    }
    return path
}