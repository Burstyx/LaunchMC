import CryptoJS from "crypto-js"
import { makeDir } from "./HDirectoryManager"
import {gamePath} from "./const"
import fs from "fs"

interface AccountInfo {
    accesstoken: any,
    username: string,
    uuid: string,
    xuid: string,
    usertype: string,
}

export async function accountList(){
    
}

export async function addAccount(opt: AccountInfo){
    const data = JSON.parse("{ 'account' : {} }}")
    data["account"][opt["uuid"]] = {}
    data["account"][opt["uuid"]]["access_token"] = opt["accesstoken"]
    data["account"][opt["uuid"]]["username"] = opt["username"]
    data["account"][opt["uuid"]]["xuid"] = opt["xuid"]
    data["account"][opt["uuid"]]["usertype"] = opt["usertype"]

    fs.writeFileSync(gamePath, CryptoJS.AES.encrypt(JSON.stringify(data), "a").toString(CryptoJS.format.Hex))
}