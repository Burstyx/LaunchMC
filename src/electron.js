"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
let mainWindow;
function createAppWindow() {
    mainWindow = new electron_1.BrowserWindow({
        backgroundColor: "#FFF",
        center: true,
        frame: false,
        fullscreenable: false,
        show: false,
        height: 620,
        width: 940,
        title: "Bursty Launcher",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    mainWindow.loadFile(path_1.default.join(__dirname, "src/app.html"));
}
electron_1.app.on("ready", () => {
    createAppWindow();
    mainWindow.webContents.on("did-finish-load", () => {
        mainWindow.show();
    });
});
