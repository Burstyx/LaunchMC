import { BrowserWindow } from "@electron/remote"
import { clientId, redirectUrl, msAuth, msAccessToken, xstsAuth, xbxLiveAuth, minecraftBearerToken, playerMojangProfile } from "../Utils/const.js"
import {addAccount, changeAccountProperty, getAccount, getActiveAccount} from "../Utils/HMicrosoft.js"

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
                    reject(`Aucun code trouvé`)
                }
            }
        })

        loginWindow.on("close", () => {
            if(!workingOnConnection) reject("La fenêtre a été fermé")
        })
    })
}

async function connectWithCode(code: string){
    const msFetchedData = await getAccessToken(code)
    const accessToken = msFetchedData["access_token"]
    const refreshToken = msFetchedData!["refresh_token"]

    const xbxLiveFetchedData = await getXbxLiveToken(accessToken)
    const uhs = xbxLiveFetchedData!["DisplayClaims"]["xui"][0]["uhs"]
    const xbxToken = xbxLiveFetchedData!["Token"]
    
    const xstsFetchedData = await getXstsToken(xbxToken)
    const xstsToken = xstsFetchedData!["Token"]

    const minecraftFetchedData = await getMinecraftBearerToken(uhs, xstsToken)
    const minecraftAccessToken = minecraftFetchedData!["access_token"]

    const minecraftProfileData = await getMinecraftProfile(minecraftAccessToken)
    const username = minecraftProfileData!["name"]
    const uuid = minecraftProfileData!["id"]   
        
    await addAccount({accessToken: minecraftAccessToken, refreshToken: refreshToken, username: username, usertype: "msa", uuid: uuid})
}

export async function refreshToken() {
    return new Promise<void>(async (resolve, reject) => {
        await getActiveAccount().then(async (activeAccount) => {
            if(activeAccount === null) return;

            const uuid = activeAccount["uuid"]
            const refreshToken = activeAccount["refresh_token"]

            let refreshedData: any
            await refreshAccessToken(refreshToken).then((res) => {
                refreshedData = res
            }).catch((err) => reject(err))

            if(!refreshedData) reject()

            let xbxLiveFetchedData: any
            await getXbxLiveToken(refreshedData!["access_token"]).then((res) => {
                xbxLiveFetchedData = res
            }).catch((err) => reject(err))

            if(!xbxLiveFetchedData) reject()

            const uhs = xbxLiveFetchedData!["DisplayClaims"]["xui"][0]["uhs"]
            const xbxToken = xbxLiveFetchedData!["Token"]

            let xstsFetchedData: any
            await getXstsToken(xbxToken).then((res) => {
                xstsFetchedData = res
            }).catch((err) => reject(err))

            if(!xstsFetchedData) reject()

            const xstsToken = xstsFetchedData!["Token"]

            let minecraftFetchedData: any
            await getMinecraftBearerToken(uhs, xstsToken).then((res) => {
                minecraftFetchedData = res
            }).catch((err) => reject(err))

            if(!minecraftFetchedData) reject()

            const minecraftAccessToken = minecraftFetchedData!["access_token"]

            await changeAccountProperty(uuid, "access_token", minecraftAccessToken).catch((err) => reject(err))
            await changeAccountProperty(uuid, "refresh_token", refreshedData!["refresh_token"]).catch((err) => reject(err))

            resolve()
        }).catch((err) => reject(err))
    })
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
        
        addNotification(err);
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
        
        addNotification(err);
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