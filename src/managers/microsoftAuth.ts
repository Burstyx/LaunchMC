import { BrowserWindow } from "@electron/remote"
import axios from "axios"
const {clientId, redirectUrl, msAuth, msAccessToken, clientSecret} = require("../utils/const.js")
import url from "url"
import qs from "node:querystring"

export function createOAuthLink(){
    let url = msAuth
    url += "?client_id=" + clientId
    url += "&response_type=" + "code"
    url += "&redirect_uri=" + redirectUrl
    url += "&scope=XboxLive.signin%20offline_access"
    url += "&state=NOT_NEEDED"

    return url
}

export async function msaLogin(){
    const loginWindow = new BrowserWindow({
        backgroundColor: "white",
        center: true,
        fullscreenable: false,
        resizable: false,
    })
    
    loginWindow.setMenu(null)

    await loginWindow.webContents.session.clearStorageData()
    
    loginWindow.loadURL(createOAuthLink())

    loginWindow.webContents.on("update-target-url", async (evt) => {
        console.log(loginWindow.webContents.getURL());
        
        if(loginWindow.webContents.getURL().includes("code=")){
            console.log("Code retrieved");
            const code = new URL(loginWindow.webContents.getURL()).searchParams.get("code")

            const msFetchedData = await getAccessToken(code!)

            console.log(msFetchedData);
            
            

            const accessToken = msFetchedData!["access_token"]

            console.log(accessToken);

            const xbxLiveFetchedData = await getXbxLiveToken(accessToken)
        }
    })
}

export async function getAccessToken(code: string){
    console.log(code);
    
    var header = new Headers();
    header.append("Content-Type", "application/x-www-form-urlencoded")

    var urlencoded = new URLSearchParams();
    urlencoded.append("client_id", clientId)
    urlencoded.append("code", code)
    urlencoded.append("grant_type", "authorization_code")
    urlencoded.append("redirect_uri", redirectUrl)

    console.log(redirectUrl);

    var response = undefined
        

    await fetch(msAccessToken, {method: "POST", headers: header, body: urlencoded, redirect: "follow"}).then(async (res) => {
        await res.json().then((val) => {
            response = val
        })
    }).catch((err) => {
        console.error(err);
        
    })

    return response
}

export async function getXbxLiveToken(accessToken: string){

}