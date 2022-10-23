import fs from "fs"

export function makeDir(path: string){
    if(!fs.existsSync(path)){
        fs.mkdirSync(path, {recursive: true})
    }
    return path
}