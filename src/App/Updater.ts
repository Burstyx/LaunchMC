import {getLatestRelease} from "../Utils/HRemoteProfiles";
import {downloadAsync} from "../Utils/HDownload";
import {app} from "electron";
import path from "path";
import cp from "child_process"
import fs from "fs/promises";
const window = require("../Interface/UIElements/scripts/window.js")

let githubReleaseData: any = null;

export async function checkForUpdate() {
    return new Promise<boolean>(async (resolve, reject) => {
        await getLatestRelease().then((res) => {
            const currentVersion = require("../../package.json").version;
            const latestVersion = res["tag_name"];

            if(currentVersion !== latestVersion) {
                const settings = document.getElementById("settings")
                settings!.setAttribute("badge", "");

                resolve(true)
            }

            resolve(false)
        }).catch((err) => reject(err))
    })
}

export async function updateCli() {
    return new Promise<void>(async (resolve, reject) => {
        const dlUrl = githubReleaseData["assets"][0]["browser_download_url"]
        const name = githubReleaseData["assets"][0]["name"]

        await downloadAsync(dlUrl, path.join(app.getPath("temp"), name)).then((installerPath) => {
            const child = cp.exec(`${installerPath} /S /LAUNCH`)

            child.on("error", (err) => {
                reject(err)
            })

            child.on("exit", async () => {
                await fs.rm(installerPath).finally(() => app.quit())
            })
        }).catch((err) => reject(err))
    })
}