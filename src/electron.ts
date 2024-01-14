import { app, BrowserWindow, ipcMain } from "electron";
import path from "path"
import {initialize, enable} from "@electron/remote/main"
import {getSetting} from "./Utils/Options";

let mainWindow: BrowserWindow;

function createAppWindow() {


    mainWindow = new BrowserWindow({
        backgroundColor: "black",
        center: true,
        frame: false,
        fullscreenable: false,
        show: false,
        height: 620,
        width: 1080,
        minHeight: 620,
        minWidth: 1080,
        icon: path.join(__dirname, "icon.ico"),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: true
        }
    })

    initialize()
    enable(mainWindow.webContents)

    mainWindow.loadFile(path.join(__dirname, "./Interface/UIElements/app.html"))
}

app.on("ready", () => {
    createAppWindow()

    mainWindow!.webContents.on("did-finish-load", () => {
        mainWindow.show();
    })
})

app.on("window-all-closed", () => {
    app.quit() // TODO: Quit if no mc instance are opened, otherwise, if the window is still hidden, wait for mc instances to be closed before closing launcher
})