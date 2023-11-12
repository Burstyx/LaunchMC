import {listProfiles} from "./HGitHub";
import {convertProfileToInstance} from "./HInstance";
import {downloadAsync} from "./HDownload";
import {app} from "@electron/remote";
import path from "path";
import fs from "fs/promises";

export async function generateProfileBtn() {
    const profiles: any = await listProfiles()
    const profileList = document.getElementById("profile-list")

    profileList!.innerHTML = ""

    for (const profile of profiles) {
        const profileElement = document.createElement("div")
        profileElement.classList.add("default-btn", "interactable", "profile")
        profileElement.style.width = "200px"
        profileElement.style.height = "100px"
        profileElement.innerText = profile.name

        profileElement.addEventListener("click", async (e) => {
            const dlUrl = profile.download_url

            const profilePath = await downloadAsync(dlUrl, path.join(app.getPath("temp"), profile.name))
            await convertProfileToInstance(profilePath)
            await fs.rm(path.join(app.getPath("temp"), profile.name))
        })

        profileList!.appendChild(profileElement)
    }
}