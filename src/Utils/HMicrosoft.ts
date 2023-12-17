import {gamePath} from "./const"
import fs from "fs/promises"
import { existsSync } from "fs"
import path from "path"

interface AccountInfo {
    accessToken: any,
    username: string,
    uuid: string,
    usertype: string,
}

export async function accountList(){
    return new Promise<any>(async (resolve, reject) => {
        if(!existsSync(path.join(gamePath, "microsoft_account.json"))) {
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
            reject(err)
        })
    })
}

export async function addAccount(opt: AccountInfo){
    return new Promise<void>(async (resolve, reject) => {
        let data: any = {"accounts": []}

        if(existsSync(path.join(gamePath, "microsoft_account.json"))) {
            await fs.readFile(path.join(gamePath, "microsoft_account.json"), "utf-8").then((res) => {
                data = JSON.parse(res)
            }).catch((err) => {
                reject(err)
            })
        }

        // FIXME Rien qui marche et ca me met les nerfs

        let activeAccount: any
        await getActiveAccount().then(async (res) => {
            activeAccount = res
        }).catch((err) => reject(err)).finally(async () => {
            data["accounts"].push({"access_token": opt["accessToken"], "username": opt["username"], "usertype": opt["usertype"], "uuid": opt["uuid"], "active": activeAccount === null})

            await fs.writeFile(path.join(gamePath, "microsoft_account.json"), JSON.stringify(data)).catch((err) => {
                reject(err)
            }).catch((err) => reject(err))
        })
    })
}

export async function getAccount(uuid: string){
    return new Promise<void>(async (resolve, reject) => {
        await fs.readFile(path.join(gamePath, "microsoft_account.json"), "utf8").then((res) => {
            const data = JSON.parse(res)

            for(const e in data["accounts"]){
                if(data["accounts"][e]["uuid"] == uuid){
                    resolve(data["accounts"][e])
                }
            }
        }).catch((err) => {
            reject(err)
        })
    })
}

export async function changeAccountProperty(uuid: string, property: string, newValue: any) {
    return new Promise<void>(async (resolve, reject) => {
        await fs.readFile(path.join(gamePath, "microsoft_account.json"), "utf8").then(async (res) => {
            const data = JSON.parse(res)

            for (const e in data["accounts"]) {
                if (data["accounts"][e]["uuid"] == uuid) {
                    if (!data["accounts"][e].hasOwnProperty(property)) {
                        reject()
                    }

                    data["accounts"][e][property] = newValue
                }
            }

            await fs.writeFile(path.join(gamePath, "microsoft_account.json"), JSON.stringify(data)).catch((err) => {
                reject(err)
            })

            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}

export async function getActiveAccount(){
    return new Promise<any>(async (resolve, reject) => {
        if(!existsSync(path.join(gamePath, "microsoft_account.json"))) {
            reject()
        }

        await fs.readFile(path.join(gamePath, "microsoft_account.json"), "utf8").then((res) => {
            const data = JSON.parse(res)

            for(const e in data["accounts"]){
                if(data["accounts"][e]["active"] == true){
                    resolve(data["accounts"][e])
                }
            }

            reject()
        }).catch((err) => {
            reject(err)
        })
    })
}