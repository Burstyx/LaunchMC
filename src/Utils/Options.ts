import {readFile, writeFile} from "fs-extra";
import path from "path";
import {gamePath} from "./const";
import {existsSync} from "fs";

export async function setSetting(property: string, value: any) {
    return new Promise<void>(async (resolve, reject) => {
        const settingsPath = path.join(gamePath, "settings.json")
        let data: any = {}

        if(existsSync(settingsPath)) {
            await readFile(settingsPath, "utf8").then((val) => {
                data = JSON.parse(val)
            }).catch((err) => reject(err))
        }

        data[property] = value
        await writeFile(path.join(gamePath, "settings.json"), JSON.stringify(data)).then(() => resolve()).catch((err) => reject(err))
    })
}

export async function getSetting(property: string, propertyNullVal: any) {
    return new Promise<any>(async (resolve, reject) => {
        const settingsPath = path.join(gamePath, "settings.json")

        if(existsSync(settingsPath)) {
            await readFile(settingsPath, "utf8").then((val) => {
                const data = JSON.parse(val)
                if(data.hasOwnProperty(property)) {
                    resolve(data[property])
                }else {
                    resolve(propertyNullVal)
                }
            }).catch((err) => reject(err))
        } else {
            resolve(propertyNullVal)
        }
    })
}