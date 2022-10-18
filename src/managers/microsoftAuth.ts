import { BrowserWindow } from "@electron/remote"
const {clientId, redirectUrl, msAuth, msAccessToken, clientSecret, xbxLiveAuth} = require("../utils/const.js")

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
            const accessToken = msFetchedData!["access_token"]

            const xbxLiveFetchedData = await getXbxLiveToken(accessToken)
            const uhs = xbxLiveFetchedData!["DisplayClaims"]["xui"][0]["uhs"]
            const token = xbxLiveFetchedData!["Token"]
            
            const xstsFetchedData = await getXstsToken(uhs, token)
        }
    })
}

async function getAccessToken(code: string){
    var header = new Headers();
    header.append("Content-Type", "application/x-www-form-urlencoded")

    var urlencoded = new URLSearchParams();
    urlencoded.append("client_id", clientId)
    urlencoded.append("code", code)
    urlencoded.append("grant_type", "authorization_code")
    urlencoded.append("redirect_uri", redirectUrl)

    var response = undefined
        
    await fetch(msAccessToken, {method: "POST", headers: header, body: urlencoded, redirect: "follow"}).then(async (res) => {
        await res.json().then((val) => {
            response = val
        })
    }).catch((err) => {
        console.log("Error occured when attempting to fetch the MSA access token related to the account!");
        
        console.error(err);
    })

    return response
}

async function getXbxLiveToken(accessToken: string){
    var header = new Headers();
    header.append("Content-Type", "application/json")
    header.append("Accept", "application/json")

    var urlencoded = new URLSearchParams();
    urlencoded.append("Properties", JSON.stringify({"AuthMethod": "RPS", "SiteName": "user.auth.xboxlive.com", "RpsTicket": `d=${accessToken}`}))
    urlencoded.append("RelyingParty", "http://auth.xboxlive.com")
    urlencoded.append("TokenType", "JWT")

    var bodyParam = JSON.stringify({"Properties": {"AuthMethod": "RPS", "SiteName": "user.auth.xboxlive.com", "RpsTicket": `d=${accessToken}`}, "RelyingParty": "http://auth.xboxlive.com", "TokenType": "JWT"})

    var response = undefined

    await fetch(xbxLiveAuth, {method: "POST", headers: header, body: bodyParam, redirect: "follow"}).then(async (res) => {
        await res.json().then((val) => {
            response = val
        })
    }).catch((err) => {
        console.log("Error occured when attempting to fetch the XBL token related to the account!");
        
        console.error(err);
    })

    return response
}

async function getXstsToken(uhs: string, token: string){

}