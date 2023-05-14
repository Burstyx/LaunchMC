import fs from "fs"

export async function makeDir(path: string){
    fs.exists(path, (exist) => {
        if(exist) fs.mkdir(path, {recursive: true}, (err) => console.error("[ERROR] Erreur lors de la création d'un dossier : " + err))
    })

    return path
}