import { app, BrowserWindow } from "electron";
import path from "path"
import {initialize, enable} from "@electron/remote/main"
import { initDiscordRPC } from "./App/DIscordRPC";

let mainWindow: BrowserWindow;

function createAppWindow() {
    mainWindow = new BrowserWindow({
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
            devTools: true
        }
    })

    mainWindow.webContents.openDevTools({mode: "undocked"})

    initialize()
    enable(mainWindow.webContents)
    mainWindow.loadFile(path.join(__dirname, "./Interface/UIElements/app.html"))
}

app.on("ready", () => {
    createAppWindow()

    mainWindow!.webContents.on("did-finish-load", () => {
        mainWindow.show();
    })

    initDiscordRPC()
})