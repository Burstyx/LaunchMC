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
exports.msaLogin = exports.createOAuthLink = void 0;
const remote_1 = require("@electron/remote");
const const_js_1 = require("../utils/const.js");
function createOAuthLink() {
    let url = const_js_1.msAuth;
    url += "?client_id=" + const_js_1.clientId;
    url += "&response_type=" + "code";
    url += "&redirect_uri=" + const_js_1.redirectUrl;
    url += "&scope=XboxLive.signin%20offline_access";
    url += "&state=NOT_NEEDED";
    return url;
}
exports.createOAuthLink = createOAuthLink;
function msaLogin() {
    return __awaiter(this, void 0, void 0, function* () {
        const loginWindow = new remote_1.BrowserWindow({
            backgroundColor: "white",
            center: true,
            fullscreenable: false,
            resizable: false,
        });
        loginWindow.setMenu(null);
        yield loginWindow.webContents.session.clearStorageData();
        loginWindow.loadURL(createOAuthLink());
        loginWindow.webContents.on("update-target-url", (evt) => __awaiter(this, void 0, void 0, function* () {
            console.log(loginWindow.webContents.getURL());
            if (loginWindow.webContents.getURL().includes("code=")) {
                console.log("Code retrieved");
                const code = new URL(loginWindow.webContents.getURL()).searchParams.get("code");
                loginWindow.close();
                yield connectWithCode(code);
            }
        }));
    });
}
exports.msaLogin = msaLogin;
function connectWithCode(code) {
    return __awaiter(this, void 0, void 0, function* () {
        const msFetchedData = yield getAccessToken(code);
        const accessToken = msFetchedData["access_token"];
        const xbxLiveFetchedData = yield getXbxLiveToken(accessToken);
        const uhs = xbxLiveFetchedData["DisplayClaims"]["xui"][0]["uhs"];
        const xbxToken = xbxLiveFetchedData["Token"];
        const xstsFetchedData = yield getXstsToken(xbxToken);
        const xstsToken = xstsFetchedData["Token"];
        const minecraftFetchedData = yield getMinecraftBearerToken(uhs, xstsToken);
        const minecraftAccessToken = minecraftFetchedData["access_token"];
        const expires_in = minecraftFetchedData["expires_in"];
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
            console.log("Error occured when attempting to refresh the MSA access token related to the account!");
            console.error(err);
        });
        return response;
    });
}
function getAccessToken(code) {
    return __awaiter(this, void 0, void 0, function* () {
        var header = new Headers();
        header.append("Content-Type", "application/x-www-form-urlencoded");
        var urlencoded = new URLSearchParams();
        urlencoded.append("client_id", const_js_1.clientId);
        urlencoded.append("code", code);
        urlencoded.append("grant_type", "authorization_code");
        urlencoded.append("redirect_uri", const_js_1.redirectUrl);
        var response = undefined;
        yield fetch(const_js_1.msAccessToken, { method: "POST", headers: header, body: urlencoded, redirect: "follow" }).then((res) => __awaiter(this, void 0, void 0, function* () {
            yield res.json().then((val) => {
                response = val;
            });
        })).catch((err) => {
            console.log("Error occured when attempting to fetch the MSA access token related to the account!");
            console.error(err);
        });
        return response;
    });
}
function getXbxLiveToken(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        var header = new Headers();
        header.append("Content-Type", "application/json");
        header.append("Accept", "application/json");
        var bodyParam = JSON.stringify({ "Properties": { "AuthMethod": "RPS", "SiteName": "user.auth.xboxlive.com", "RpsTicket": `d=${accessToken}` }, "RelyingParty": "http://auth.xboxlive.com", "TokenType": "JWT" });
        var response = undefined;
        yield fetch(const_js_1.xbxLiveAuth, { method: "POST", headers: header, body: bodyParam, redirect: "follow" }).then((res) => __awaiter(this, void 0, void 0, function* () {
            yield res.json().then((val) => {
                response = val;
            });
        })).catch((err) => {
            console.log("Error occured when attempting to fetch the XBL token related to the account!");
            console.error(err);
        });
        return response;
    });
}
function getXstsToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        var header = new Headers();
        header.append("Content-Type", "application/json");
        header.append("Accept", "application/json");
        var bodyParam = JSON.stringify({ "Properties": { "SandboxId": "RETAIL", "UserTokens": [token] }, "RelyingParty": "rp://api.minecraftservices.com/", "TokenType": "JWT" });
        var response = undefined;
        yield fetch(const_js_1.xstsAuth, { method: "POST", headers: header, body: bodyParam, redirect: "follow" }).then((res) => __awaiter(this, void 0, void 0, function* () {
            yield res.json().then((val) => {
                response = val;
            });
        })).catch((err) => {
            console.log("Error occured when attempting to fetch the XSTS token related to the account!");
            console.error(err);
        });
        return response;
    });
}
function getMinecraftBearerToken(uhs, token) {
    return __awaiter(this, void 0, void 0, function* () {
        var header = new Headers();
        header.append("Content-Type", "application/json");
        var bodyParam = JSON.stringify({ "identityToken": `XBL3.0 x=${uhs};${token}`, "ensureLegacyEnabled": true });
        var response = undefined;
        yield fetch(const_js_1.minecraftBearerToken, { method: "POST", headers: header, body: bodyParam, redirect: "follow" }).then((res) => __awaiter(this, void 0, void 0, function* () {
            yield res.json().then((val) => {
                response = val;
            });
        })).catch((err) => {
            console.log("Error occured when attempting to fetch the Minecraft informations related to the account!");
            console.error(err);
        });
        return response;
    });
}
