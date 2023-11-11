import {getLatestRelease} from "../Utils/HGitHub";
import {downloadAsync} from "../Utils/HDownload";
import {app} from "@electron/remote";
import path from "path";
import cp from "child_process"

let githubReleaseData: any = null;

export async function checkForUpdate() {
    githubReleaseData = await getLatestRelease()

    const currentVersion = require("../../package.json").version;
    const latestVersion = githubReleaseData?.tag_name;

    if(currentVersion == latestVersion) {
        console.log("Need to be updated!")

        const updateBtn = document.getElementById("update-btn")
        updateBtn!.style.display = "flex"

        return
    }

    console.log("Latest version already installed!")
}

export async function updateCli() {
    const dlUrl = githubReleaseData.assets[0].browser_download_url
    const name = githubReleaseData.assets[0].name

    const installerPath = await downloadAsync(dlUrl, path.join(app.getPath("temp"), name))
    console.log(installerPath)
    cp.exec(installerPath)
}