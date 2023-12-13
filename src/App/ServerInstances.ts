import {getInstanceDataOf, getMetadataOf, listProfiles} from "../Utils/HGitHub";
import {addInstanceElement, convertProfileToInstance, setContentTo} from "../Utils/HInstance";
const {openPopup} = require("../Interface/UIElements/scripts/window.js")

let currentServerInstanceId = ""

export async function addServerInstancesTo() {
    const availServerDiv = document.getElementById("avail-servers")!
    const profileList = await listProfiles()

    availServerDiv.innerHTML = "";

    // @ts-ignore
    for (const profile in profileList) {
        const element = await addInstanceElement(profileList![profile]["thumbnailUrl"], profile, availServerDiv)
        element.addEventListener("click", () => {
            openPopup("download-instance-info")
            currentServerInstanceId = profileList![profile]["name"]
        })
    }
}

export function getCurrentServerInstanceId() {
    return currentServerInstanceId
}