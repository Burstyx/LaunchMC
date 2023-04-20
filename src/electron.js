"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const main_1 = require("@electron/remote/main");
let mainWindow;
function createAppWindow() {
    mainWindow = new electron_1.BrowserWindow({
        backgroundColor: "#2C2C2C",
        center: true,
        frame: false,
        fullscreenable: false,
        show: false,
        height: 620,
        width: 1080,
        minHeight: 620,
        minWidth: 1080,
        title: "Burstyx Launcher",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    mainWindow.webContents.openDevTools();
    (0, main_1.initialize)();
    (0, main_1.enable)(mainWindow.webContents);
    mainWindow.loadFile(path_1.default.join(__dirname, "./Interface/UIElements/app.html"));
}
electron_1.app.on("ready", () => {
    createAppWindow();
    mainWindow.webContents.on("did-finish-load", () => {
        mainWindow.show();
    });
});
