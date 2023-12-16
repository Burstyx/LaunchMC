import {gamePath} from "./const"
import fs from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import {CallbackEvent} from "./Debug";

interface AccountInfo {
    accessToken: any,
    username: string,
    uuid: string,
    usertype: string,
}

export async function accountList(event: CallbackEvent){
    return new Promise<any>(async (resolve, reject) => {
        if(!existsSync(path.join(gamePath, "microsoft_account.json"))) {
            event(`Aucun compte microsoft enregistré.`, null, "err")
            reject()
        }

        await fs.readFile(path.join(gamePath, "microsoft_account.json"), "utf-8").then((file) => {
            const data = JSON.parse(file)

            let accounts = []

            for(const account of data["accounts"]) {
                accounts.push(account)
            }

            resolve(accounts)
        }).catch((err) => {
            event(`Impossible de lire le fichier des comptes microsoft.`, err, "err")
            reject()
        })
    })
}

export async function addAccount(opt: AccountInfo, event: CallbackEvent){
    return new Promise<void>(async (resolve, reject) => {
        let data: any = {"accounts": []}

        if(existsSync(path.join(gamePath, "microsoft_account.json"))) {
            await fs.readFile(path.join(gamePath, "microsoft_account.json"), "utf-8").then((data) => {
                data = JSON.parse(data)
            }).catch((err) => {
                event(`Impossible d'ajouter le compte. Erreur lors de l'écriture.`, err, "err")
                reject()
            })
        }

        await getActiveAccount(() => {
            // FIXME Handle errors
        }).then(async (res) => {
            data["accounts"].push({"access_token": opt["accessToken"], "username": opt["username"], "usertype": opt["usertype"], "uuid": opt["uuid"], "active": res === null})

            await fs.writeFile(path.join(gamePath, "microsoft_account.json"), JSON.stringify(data)).catch((err) => {
                event(`Impossible d'ajouter le compte. Erreur lors de l'écriture.`, err, "err")
                reject()
            })
        })
    })
}

export async function getAccount(uuid: string, event: CallbackEvent){
    return new Promise<void>(async (resolve, reject) => {
        await fs.readFile(path.join(gamePath, "microsoft_account.json"), "utf8").then((res) => {
            const data = JSON.parse(res)

            for(const e in data["accounts"]){
                if(data["accounts"][e]["uuid"] == uuid){
                    return data["accounts"][e]
                }
            }
        }).catch((err) => {
            event(`Impossible de récupérer le compte ${uuid}. Erreur lors de la lecture.`, err, "err")
            reject()
        })
    })
}

export async function changeAccountProperty(uuid: string, property: string, newValue: any, event: CallbackEvent) {
    return new Promise<void>(async (resolve, reject) => {
        await fs.readFile(path.join(gamePath, "microsoft_account.json"), "utf8").then(async (res) => {
            const data = JSON.parse(res)

            for (const e in data["accounts"]) {
                if (data["accounts"][e]["uuid"] == uuid) {
                    if (!data["accounts"][e].hasOwnProperty(property)) {
                        event(`Impossible de modifier la propriété ${property} car elle n'existe pas.`, null, "err")
                        reject()
                    }

                    data["accounts"][e][property] = newValue
                }
            }

            await fs.writeFile(path.join(gamePath, "microsoft_account.json"), JSON.stringify(data)).catch((err) => {
                event(`Impossible de modifier la propriété ${property} par ${newValue}, erreur lors de l'écriture.`, err, "err")
                reject()
            })

            resolve()
        }).catch((err) => {
            event(`Impossible de modifier la propriété ${property}, erreur lors de la lecture.`, err, "err")
            reject()
        })
    })
}

export async function getActiveAccount(event: CallbackEvent){
    return new Promise<any>(async (resolve, reject) => {
        if(!existsSync(path.join(gamePath, "microsoft_account.json"))) {
            event(`Il n'y a aucun compte actif.`, null, "err")
            reject()
        }

        await fs.readFile(path.join(gamePath, "microsoft_account.json"), "utf8").then((res) => {
            const data = JSON.parse(res)

            for(const e in data["accounts"]){
                if(data["accounts"][e]["active"] == true){
                    console.log(data["accounts"][e]);

                    return data["accounts"][e]
                }
            }

            event(`Il n'y a aucun compte actif.`, null, "err")
            reject()
        }).catch((err) => {
            event(`Impossible de récupérer le compte actif actuel, erreur lors de la lecture.`, err, "err")
            reject()
        })
    })
}