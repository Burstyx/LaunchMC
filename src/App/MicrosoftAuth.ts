import { BrowserWindow } from "@electron/remote"
import { clientId, redirectUrl, msAuth, msAccessToken, xstsAuth, xbxLiveAuth, minecraftBearerToken, playerMojangProfile } from "../Utils/const.js"
import { addAccount } from "../Utils/HMicrosoft.js"

function createOAuthLink(){
    let url = msAuth
    url += "?client_id=" + clientId
    url += "&response_type=" + "code"
    url += "&redirect_uri=" + redirectUrl
    url += "&scope=xboxlive.signin%20offline_access"
    url += "&cobrandid=8058f65d-ce06-4c30-9559-473c9275a65d"

    return url
}

export async function msaLogin(){ // TODO: Return profile data
    return new Promise<void>(async (resolve, reject) => {
        const loginWindow = new BrowserWindow({
            backgroundColor: "white",
            center: true,
            fullscreenable: false,
            resizable: false,
        })

        loginWindow.setMenu(null)

        await loginWindow.webContents.session.clearStorageData().catch((err) => reject(err))
        await loginWindow.loadURL(createOAuthLink()).catch((err) => reject(err))

        let workingOnConnection = false

        loginWindow.webContents.on("update-target-url", async (evt) => {
            if(loginWindow.webContents.getURL().includes("code=")){
                const code = new URL(loginWindow.webContents.getURL()).searchParams.get("code")

                workingOnConnection = true
                loginWindow.close()

                if(code) {
                    await connectWithCode(code).then(() => {
                        resolve()
                    }).catch((err) => reject(err))
                }else{
                    reject()
                }
            }
        })

        loginWindow.on("close", () => {
            if(!workingOnConnection) reject()
        })
    })
}

async function connectWithCode(code: string){
    const msFetchedData = await getAccessToken(code)
    const accessToken = msFetchedData["access_token"]

    const xbxLiveFetchedData = await getXbxLiveToken(accessToken)
    const uhs = xbxLiveFetchedData!["DisplayClaims"]["xui"][0]["uhs"]
    const xbxToken = xbxLiveFetchedData!["Token"]
    
    const xstsFetchedData = await getXstsToken(xbxToken)
    const xstsToken = xstsFetchedData!["Token"]

    const minecraftFetchedData = await getMinecraftBearerToken(uhs, xstsToken)
    const minecraftAccessToken = minecraftFetchedData!["access_token"]
    const expires_in = minecraftFetchedData!["expires_in"]

    const minecraftProfileData = await getMinecraftProfile(minecraftAccessToken)
    const username = minecraftProfileData!["name"]
    const uuid = minecraftProfileData!["id"]   
        
    await addAccount({accessToken: minecraftAccessToken, username: username, usertype: "msa", uuid: uuid})
}

async function getMinecraftProfile(accessToken: string){
    var header = new Headers();
    header.append("Authorization", "Bearer " + accessToken)

    var response = undefined
        
    await fetch(playerMojangProfile, {method: "GET", headers: header, redirect: "follow"}).then(async (res) => {
        await res.json().then((val) => {
            response = val
        })
    }).catch((err) => {
        console.log("Error occured when attempting to get the profile attached to the account!");
        
        console.error(err);
    })

    return response
}

async function refreshAccessToken(refreshToken: string){
    var header = new Headers();
    header.append("Content-Type", "application/x-www-form-urlencoded")

    var urlencoded = new URLSearchParams();
    urlencoded.append("client_id", clientId)
    urlencoded.append("refresh_token", refreshToken)
    urlencoded.append("grant_type", "refresh_token")
    urlencoded.append("redirect_uri", redirectUrl)

    var response = undefined
        
    await fetch(msAccessToken, {method: "POST", headers: header, body: urlencoded, redirect: "follow"}).then(async (res) => {
        await res.json().then((val) => {
            response = val
        })
    }).catch((err) => {
        console.log("Error occured when attempting to refresh the MSA access token related to the account!");
        
        console.error(err);
    })

    return response
}

async function getAccessToken(code: string){
    return new Promise<any>(async (resolve, reject) => {
        const header = new Headers();
        header.append("Content-Type", "application/x-www-form-urlencoded")

        const urlencoded = new URLSearchParams();
        urlencoded.append("client_id", clientId)
        urlencoded.append("code", code)
        urlencoded.append("grant_type", "authorization_code")
        urlencoded.append("redirect_uri", redirectUrl)

        await fetch(msAccessToken, {method: "POST", headers: header, body: urlencoded, redirect: "follow"}).then(async (res) => {
            await res.json().then((res) => {
                resolve(res)
            }).catch((err) => reject(err))
        }).catch((err) => {
            reject(err)
        })
    })
}

async function getXbxLiveToken(accessToken: string){
    return new Promise<any>(async (resolve, reject) => {
        const header = new Headers();
        header.append("Content-Type", "application/json")
        header.append("Accept", "application/json")

        const bodyParam = JSON.stringify({
            "Properties": {
                "AuthMethod": "RPS",
                "SiteName": "user.auth.xboxlive.com",
                "RpsTicket": `d=${accessToken}`
            }, "RelyingParty": "http://auth.xboxlive.com", "TokenType": "JWT"
        });

        await fetch(xbxLiveAuth, {method: "POST", headers: header, body: bodyParam, redirect: "follow"}).then(async (res) => {
            await res.json().then((res) => {
                resolve(res)
            }).catch((err) => reject(err))
        }).catch((err) => {
            reject(err)
        })
    })
}

async function getXstsToken(token: string){
    return new Promise<any>(async (resolve, reject) => {
        const header = new Headers();
        header.append("Content-Type", "application/json")
        header.append("Accept", "application/json")

        const bodyParam = JSON.stringify({
            "Properties": {"SandboxId": "RETAIL", "UserTokens": [token]},
            "RelyingParty": "rp://api.minecraftservices.com/",
            "TokenType": "JWT"
        });

        await fetch(xstsAuth, {method: "POST", headers: header, body: bodyParam, redirect: "follow"}).then(async (res) => {
            await res.json().then((res) => {
                resolve(res)
            }).catch((err) => reject(err))
        }).catch((err) => {
            reject(err)
        })
    })
}

async function getMinecraftBearerToken(uhs: string, token: string){
    return new Promise<any>(async (resolve, reject) => {
        const header = new Headers();
        header.append("Content-Type", "application/json")

        const bodyParam = JSON.stringify({"identityToken": `XBL3.0 x=${uhs};${token}`, "ensureLegacyEnabled": true});

        await fetch(minecraftBearerToken, {method: "POST", headers: header, body: bodyParam, redirect: "follow"}).then(async (res) => {
            await res.json().then((res) => {
                resolve(res)
            }).catch((err) => reject(err))
        }).catch((err) => {
            reject(err)
        })
    })
}