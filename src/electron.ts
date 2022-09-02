import { app, BrowserWindow } from "electron";
import path from "path"

let mainWindow: BrowserWindow;

function createAppWindow() {
    mainWindow = new BrowserWindow({
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
    })

    mainWindow.loadFile(path.join(__dirname, "src/app.html"))
}

app.on("ready", () => {
    createAppWindow()

    mainWindow!.webContents.on("did-finish-load", () => {
        mainWindow.show();
    })
})