import CryptoJS from "crypto-js"
import { makeDir } from "./HDirectoryManager"
import {gamePath} from "./const"
import fs from "fs"
import path from "path"

interface AccountInfo {
    accesstoken: any,
    username: string,
    uuid: string,
    usertype: string,
}

export async function accountList(){
    
}

export async function addAccount(opt: AccountInfo){
    let data: any = {"accounts": []}
    data["accounts"].push({"access_token": opt["accesstoken"], "username": opt["username"], "usertype": opt["usertype"], "uuid": opt["uuid"], "active": true})

    fs.writeFileSync(path.join(gamePath, "microsoft_account.json"), JSON.stringify(data))
}

export async function getAccount(uuid: string){
    
}

export async function getActiveAccount(){
    const data = JSON.parse(fs.readFileSync(path.join(gamePath, "minecraft_account.json"), "utf-8"))

    for(const e in data["accounts"]){
        if(data["accounts"][e]["active"] == true){
            return data["accounts"][e]
        }
    }
}