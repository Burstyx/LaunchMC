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
exports.getXbxLiveToken = exports.getAccessToken = exports.msaLogin = exports.createOAuthLink = void 0;
const remote_1 = require("@electron/remote");
const { clientId, redirectUrl, msAuth, msAccessToken, clientSecret } = require("../utils/const.js");
function createOAuthLink() {
    let url = msAuth;
    url += "?client_id=" + clientId;
    url += "&response_type=" + "code";
    url += "&redirect_uri=" + redirectUrl;
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
                const msFetchedData = yield getAccessToken(code);
                console.log(msFetchedData);
                const accessToken = msFetchedData["access_token"];
                console.log(accessToken);
                const xbxLiveFetchedData = yield getXbxLiveToken(accessToken);
            }
        }));
    });
}
exports.msaLogin = msaLogin;
function getAccessToken(code) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(code);
        var header = new Headers();
        header.append("Content-Type", "application/x-www-form-urlencoded");
        var urlencoded = new URLSearchParams();
        urlencoded.append("client_id", clientId);
        urlencoded.append("code", code);
        urlencoded.append("grant_type", "authorization_code");
        urlencoded.append("redirect_uri", redirectUrl);
        console.log(redirectUrl);
        var response = undefined;
        yield fetch(msAccessToken, { method: "POST", headers: header, body: urlencoded, redirect: "follow" }).then((res) => __awaiter(this, void 0, void 0, function* () {
            yield res.json().then((val) => {
                response = val;
            });
        })).catch((err) => {
            console.error(err);
        });
        return response;
    });
}
exports.getAccessToken = getAccessToken;
function getXbxLiveToken(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
exports.getXbxLiveToken = getXbxLiveToken;
