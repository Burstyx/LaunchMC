import {getLatestRelease} from "../Utils/HGitHub";
import {downloadAsync} from "../Utils/HDownload";
import {app} from "@electron/remote";
import path from "path";
import cp from "child_process"
import fs from "fs/promises";

let githubReleaseData: any = null;

export async function checkForUpdate() {
    githubReleaseData = await getLatestRelease()

    const currentVersion = require("../../package.json").version;
    const latestVersion = githubReleaseData?.tag_name;

    if(currentVersion !== latestVersion) {
        console.log("Need to be updated!")

        const updateBtn = document.getElementById("update-btn")
        updateBtn!.style.display = "flex"

        return
    }

    console.log("Latest version already installed!")
}

export async function updateCli() {
    const loading = document.getElementById("loading-startup-launcher")
    loading!.style.display = "flex"

    const dlUrl = githubReleaseData.assets[0].browser_download_url
    const name = githubReleaseData.assets[0].name

    await downloadAsync(dlUrl, path.join(app.getPath("temp"), name)).then((installerPath) => {
        const child = cp.exec(`${installerPath} /S`)
        child.on("spawn", () => console.log("starting updating"))
        child.stdout?.on("data", (data) => console.log(data))
        child.stderr?.on("data", (data) => console.error(data))
        child.on("exit", async () => {
            console.log("finish updating")
            await fs.rm(installerPath)
            app.relaunch()
            app.exit()
        })
    })
}