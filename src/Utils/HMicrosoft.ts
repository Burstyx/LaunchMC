import {gamePath} from "./const"
import fs from "fs/promises"
import { existsSync } from "fs"
import path from "path"

interface AccountInfo {
    accesstoken: any,
    refreshtoken: any,
    username: string,
    uuid: string,
    usertype: string,
}

export async function accountList(){
    if(!existsSync(path.join(gamePath, "microsoft_account.json"))) {
        console.log("Microsoft accounts data file not found");
        
        return null
    }

    const file = await fs.readFile(path.join(gamePath, "microsoft_account.json"), "utf-8")

    const data = JSON.parse(file)

    let accounts = []

    for(const account of data["accounts"]) {
        accounts.push(account)
    }

    return accounts
}

export async function addAccount(opt: AccountInfo){
    let data: any = {"accounts": []}

    if(existsSync(path.join(gamePath, "microsoft_account.json"))) {
        data = JSON.parse(await fs.readFile(path.join(gamePath, "microsoft_account.json"), "utf-8"))
    }

    const shouldBeActive = await getActiveAccount() == null ? true : false

    data["accounts"].push({"access_token": opt["accesstoken"], "refresh_token": opt["refreshtoken"], "username": opt["username"], "usertype": opt["usertype"], "uuid": opt["uuid"], "active": shouldBeActive})

    await fs.writeFile(path.join(gamePath, "microsoft_account.json"), JSON.stringify(data))
}

export async function getAccount(uuid: string){
    const data = JSON.parse(await fs.readFile(path.join(gamePath, "microsoft_account.json"), "utf-8"))

    for(const e in data["accounts"]){
        if(data["accounts"][e]["uuid"] == uuid){            
            return data["accounts"][e]
        }
    }
}

export async function changeAccountProperty(uuid: string, property: string, newValue: any) {
    const data = JSON.parse(await fs.readFile(path.join(gamePath, "microsoft_account.json"), "utf-8"))    

    for(const e in data["accounts"]){
        if(data["accounts"][e]["uuid"] == uuid){            
            if(!data["accounts"][e].hasOwnProperty(property)) {
                console.log("Property doesn't exist");
                return
            }

            data["accounts"][e][property] = newValue
        }
    }
    
    await fs.writeFile(path.join(gamePath, "microsoft_account.json"), JSON.stringify(data))
}

export async function getActiveAccount(){
    if(!existsSync(path.join(gamePath, "microsoft_account.json"))) {
        return null
    }

    const data = JSON.parse(await fs.readFile(path.join(gamePath, "microsoft_account.json"), "utf-8"))

    for(const e in data["accounts"]){
        if(data["accounts"][e]["active"] == true){
            console.log(data["accounts"][e]);
            
            return data["accounts"][e]
        }
    }

    return null
}