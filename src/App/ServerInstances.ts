import {listProfiles} from "../Utils/HGitHub";
import {addInstanceElement} from "../Utils/HInstance";

export async function addServerInstancesTo() {
    const profileList = await listProfiles()

    console.log(profileList)

    const thumbnailImage = profileList!["thumbnailUrl"]
    const name = profileList!["name"]

    await addInstanceElement(thumbnailImage, name, document.getElementById("avail-servers")!)
}