import { app, BrowserWindow } from "electron";
import path from "path"

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
        title: "Bursty Launcher",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })

    mainWindow.webContents.openDevTools()

    require('@electron/remote/main').initialize()
    require("@electron/remote/main").enable(mainWindow.webContents)
    mainWindow.loadFile(path.join(__dirname, "app.html"))
}

app.on("ready", () => {
    createAppWindow()

    mainWindow!.webContents.on("did-finish-load", () => {
        mainWindow.show();
    })
})