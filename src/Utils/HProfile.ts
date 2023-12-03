import {getInstanceDataOf, getMetadataOf, listProfiles} from "./HGitHub";
import {convertProfileToInstance} from "./HInstance";

export async function generateProfileBtn() {
    const profiles: any = await listProfiles()
    const profileList = document.getElementById("profile-list")

    profileList!.innerHTML = ""

    for (const name in profiles) {
        const profileElement = document.createElement("div")
        profileElement.classList.add("default-btn", "interactable", "profile")
        profileElement.style.width = "200px"
        profileElement.style.height = "100px"
        profileElement.innerText = name

        profileElement.addEventListener("click", async (e) => {
            const metadata = await getMetadataOf(profiles[name])
            const instanceData = await getInstanceDataOf(profiles[name])

            console.log(metadata)
            console.log(instanceData)

            await convertProfileToInstance(metadata, instanceData)
        })

        profileList!.appendChild(profileElement)
    }
}