"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.msaLogin = void 0;
const remote_1 = require("@electron/remote");
const const_js_1 = require("../Utils/const.js");
const HMicrosoft_js_1 = require("../Utils/HMicrosoft.js");
const { addNotification } = require("../Interface/UIElements/scripts/notification.js");
function createOAuthLink() {
    let url = const_js_1.msAuth;
    url += "?client_id=" + const_js_1.clientId;
    url += "&response_type=" + "code";
    url += "&redirect_uri=" + const_js_1.redirectUrl;
    url += "&scope=xboxlive.signin%20offline_access";
    url += "&cobrandid=8058f65d-ce06-4c30-9559-473c9275a65d";
    return url;
}
function msaLogin() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const loginWindow = new remote_1.BrowserWindow({
                backgroundColor: "white",
                center: true,
                fullscreenable: false,
                resizable: false,
            });
            loginWindow.setMenu(null);
            yield loginWindow.webContents.session.clearStorageData().catch((err) => reject(err));
            yield loginWindow.loadURL(createOAuthLink()).catch((err) => reject(err));
            let workingOnConnection = false;
            loginWindow.webContents.on("update-target-url", (evt) => __awaiter(this, void 0, void 0, function* () {
                if (loginWindow.webContents.getURL().includes("code=")) {
                    const code = new URL(loginWindow.webContents.getURL()).searchParams.get("code");
                    workingOnConnection = true;
                    loginWindow.close();
                    if (code) {
                        yield connectWithCode(code).then(() => {
                            resolve();
                        }).catch((err) => reject(err));
                    }
                    else {
                        reject(`Aucun code trouvé`);
                    }
                }
            }));
            loginWindow.on("close", () => {
                if (!workingOnConnection)
                    reject("La fenêtre a été fermé");
            });
        }));
    });
}
exports.msaLogin = msaLogin;
function connectWithCode(code) {
    return __awaiter(this, void 0, void 0, function* () {
        const msFetchedData = yield getAccessToken(code);
        const accessToken = msFetchedData["access_token"];
        const refreshToken = msFetchedData["refresh_token"];
        const xbxLiveFetchedData = yield getXbxLiveToken(accessToken);
        const uhs = xbxLiveFetchedData["DisplayClaims"]["xui"][0]["uhs"];
        const xbxToken = xbxLiveFetchedData["Token"];
        const xstsFetchedData = yield getXstsToken(xbxToken);
        const xstsToken = xstsFetchedData["Token"];
        const minecraftFetchedData = yield getMinecraftBearerToken(uhs, xstsToken);
        const minecraftAccessToken = minecraftFetchedData["access_token"];
        const minecraftProfileData = yield getMinecraftProfile(minecraftAccessToken);
        const username = minecraftProfileData["name"];
        const uuid = minecraftProfileData["id"];
        yield (0, HMicrosoft_js_1.addAccount)({ accessToken: minecraftAccessToken, refreshToken: refreshToken, username: username, usertype: "msa", uuid: uuid });
    });
}
function refreshToken() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield (0, HMicrosoft_js_1.getActiveAccount)().then((activeAccount) => __awaiter(this, void 0, void 0, function* () {
                if (activeAccount === null)
                    return;
                const uuid = activeAccount["uuid"];
                const refreshToken = activeAccount["refresh_token"];
                let refreshedData;
                yield refreshAccessToken(refreshToken).then((res) => {
                    refreshedData = res;
                }).catch((err) => reject(err));
                if (!refreshedData)
                    reject();
                let xbxLiveFetchedData;
                yield getXbxLiveToken(refreshedData["access_token"]).then((res) => {
                    xbxLiveFetchedData = res;
                }).catch((err) => reject(err));
                if (!xbxLiveFetchedData)
                    reject();
                const uhs = xbxLiveFetchedData["DisplayClaims"]["xui"][0]["uhs"];
                const xbxToken = xbxLiveFetchedData["Token"];
                let xstsFetchedData;
                yield getXstsToken(xbxToken).then((res) => {
                    xstsFetchedData = res;
                }).catch((err) => reject(err));
                if (!xstsFetchedData)
                    reject();
                const xstsToken = xstsFetchedData["Token"];
                let minecraftFetchedData;
                yield getMinecraftBearerToken(uhs, xstsToken).then((res) => {
                    minecraftFetchedData = res;
                }).catch((err) => reject(err));
                if (!minecraftFetchedData)
                    reject();
                const minecraftAccessToken = minecraftFetchedData["access_token"];
                yield (0, HMicrosoft_js_1.changeAccountProperty)(uuid, "access_token", minecraftAccessToken).catch((err) => reject(err));
                yield (0, HMicrosoft_js_1.changeAccountProperty)(uuid, "refresh_token", refreshedData["refresh_token"]).catch((err) => reject(err));
                resolve();
            })).catch((err) => reject(err));
        }));
    });
}
exports.refreshToken = refreshToken;
function getMinecraftProfile(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        var header = new Headers();
        header.append("Authorization", "Bearer " + accessToken);
        var response = undefined;
        yield fetch(const_js_1.playerMojangProfile, { method: "GET", headers: header, redirect: "follow" }).then((res) => __awaiter(this, void 0, void 0, function* () {
            yield res.json().then((val) => {
                response = val;
            });
        })).catch((err) => {
            addNotification(`Une erreur est survenue en récupérant le profile du compte Minecraft.`, "error", err);
        });
        return response;
    });
}
function refreshAccessToken(refreshToken) {
    return __awaiter(this, void 0, void 0, function* () {
        var header = new Headers();
        header.append("Content-Type", "application/x-www-form-urlencoded");
        var urlencoded = new URLSearchParams();
        urlencoded.append("client_id", const_js_1.clientId);
        urlencoded.append("refresh_token", refreshToken);
        urlencoded.append("grant_type", "refresh_token");
        urlencoded.append("redirect_uri", const_js_1.redirectUrl);
        var response = undefined;
        yield fetch(const_js_1.msAccessToken, { method: "POST", headers: header, body: urlencoded, redirect: "follow" }).then((res) => __awaiter(this, void 0, void 0, function* () {
            yield res.json().then((val) => {
                response = val;
            });
        })).catch((err) => {
            addNotification(`Une erreur est survenue en tentant de raffraichir le compte Microsoft lié au compte Minecraft`, "error", err);
        });
        return response;
    });
}
function getAccessToken(code) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const header = new Headers();
            header.append("Content-Type", "application/x-www-form-urlencoded");
            const urlencoded = new URLSearchParams();
            urlencoded.append("client_id", const_js_1.clientId);
            urlencoded.append("code", code);
            urlencoded.append("grant_type", "authorization_code");
            urlencoded.append("redirect_uri", const_js_1.redirectUrl);
            yield fetch(const_js_1.msAccessToken, { method: "POST", headers: header, body: urlencoded, redirect: "follow" }).then((res) => __awaiter(this, void 0, void 0, function* () {
                yield res.json().then((res) => {
                    resolve(res);
                }).catch((err) => reject(err));
            })).catch((err) => {
                reject(err);
            });
        }));
    });
}
function getXbxLiveToken(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const header = new Headers();
            header.append("Content-Type", "application/json");
            header.append("Accept", "application/json");
            const bodyParam = JSON.stringify({
                "Properties": {
                    "AuthMethod": "RPS",
                    "SiteName": "user.auth.xboxlive.com",
                    "RpsTicket": `d=${accessToken}`
                }, "RelyingParty": "http://auth.xboxlive.com", "TokenType": "JWT"
            });
            yield fetch(const_js_1.xbxLiveAuth, { method: "POST", headers: header, body: bodyParam, redirect: "follow" }).then((res) => __awaiter(this, void 0, void 0, function* () {
                yield res.json().then((res) => {
                    resolve(res);
                }).catch((err) => reject(err));
            })).catch((err) => {
                reject(err);
            });
        }));
    });
}
function getXstsToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const header = new Headers();
            header.append("Content-Type", "application/json");
            header.append("Accept", "application/json");
            const bodyParam = JSON.stringify({
                "Properties": { "SandboxId": "RETAIL", "UserTokens": [token] },
                "RelyingParty": "rp://api.minecraftservices.com/",
                "TokenType": "JWT"
            });
            yield fetch(const_js_1.xstsAuth, { method: "POST", headers: header, body: bodyParam, redirect: "follow" }).then((res) => __awaiter(this, void 0, void 0, function* () {
                yield res.json().then((res) => {
                    resolve(res);
                }).catch((err) => reject(err));
            })).catch((err) => {
                reject(err);
            });
        }));
    });
}
function getMinecraftBearerToken(uhs, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const header = new Headers();
            header.append("Content-Type", "application/json");
            const bodyParam = JSON.stringify({ "identityToken": `XBL3.0 x=${uhs};${token}`, "ensureLegacyEnabled": true });
            yield fetch(const_js_1.minecraftBearerToken, { method: "POST", headers: header, body: bodyParam, redirect: "follow" }).then((res) => __awaiter(this, void 0, void 0, function* () {
                yield res.json().then((res) => {
                    resolve(res);
                }).catch((err) => reject(err));
            })).catch((err) => {
                reject(err);
            });
        }));
    });
}
