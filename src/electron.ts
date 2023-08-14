import { app, BrowserWindow } from "electron";
import path from "path"
import {initialize, enable} from "@electron/remote/main"
import { initDiscordRPC } from "./App/DIscordRPC";

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
        title: "Burstyx Launcher",
        icon: path.join(__dirname, "icon.ico"),
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

app.on("ready", async () => {
    createAppWindow()

    mainWindow!.webContents.on("did-finish-load", () => {
        mainWindow.show();
    })
})