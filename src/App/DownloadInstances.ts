import {replaceAll} from "../Utils/Utils";
import {getInstanceDataOf, getMetadataOf, listProfiles} from "../Utils/HRemoteProfiles";
import {addInstanceElement} from "../Utils/HInstance";
const {openPopup} = require("../Interface/UIElements/scripts/window.js")

export let instancesStates : any = {};
export let currentInstanceOpened: string | null = null

export enum InstanceState {
    ToDownload,
    Owned,
    Loading,
}

export async function setContentTo(name: string) { // TODO: Cleaning
    return new Promise<void>(async (resolve, reject) => {
        const currentState = instancesStates.hasOwnProperty(name) ? instancesStates[name] : InstanceState.ToDownload
        updateInstanceState(name, currentState)

        const dlInfoData = (await listProfiles())[name]
        const metadata = await getMetadataOf(name)

        const serverBrandLogo = document.getElementById("dl-page-server-brand-logo")!
        serverBrandLogo.setAttribute("src", `${replaceAll(dlInfoData["brandLogoUrl"], '\\', '/')}`)

        // Set version
        const widgetVersion = document.getElementById("dl-page-version")
        if(widgetVersion) {
            widgetVersion.innerHTML = "";

            const widgetText = document.createElement("p")
            widgetText.innerText = `${metadata["type"]} ${metadata["mcVersion"]}`
            widgetVersion.append(widgetText)
        }



        const contentBackground = document.getElementById("dl-page-thumbnail")!
        contentBackground.style.backgroundImage = `url('${replaceAll(dlInfoData["thumbnailUrl"], '\\', '/')}')`

        resolve()
    })
}

export async function refreshInstanceList() {
    return new Promise<void>(async (resolve, reject) => {
        const instancesDiv = document.getElementById("avail-servers")

        if(instancesDiv){
            instancesDiv.innerHTML = ""

            const profiles = await listProfiles();

            console.log(profiles)

            for(const instanceName in profiles){
                const element = await addInstanceElement({
                        name: instanceName,
                        thumbnailPath: profiles[instanceName]["thumbnailPath"],
                        coverPath: profiles[instanceName]["coverUrl"],
                        version: profiles[instanceName]["thumbnailPath"]
                    },
                    instancesDiv
                )

                element.addEventListener("click", () => {
                    currentInstanceOpened = instanceName
                    console.log(currentInstanceOpened)

                    setContentTo(instanceName)
                    openPopup("download-instance-info")
                })
            }

            resolve()
        } else reject(`Unexpected error when refreshing instance list.`)
    })
}

export function updateInstanceState(name: string, newState: InstanceState) {
    const instance = document.getElementById(name)

    instancesStates[name] = newState

    const dlBtn= document.getElementById("download-instance-action")!
    const iconBtn= dlBtn.querySelector("img")!

    switch (newState) {
        case InstanceState.ToDownload:
            dlBtn.style.backgroundColor = "#05E400"
            iconBtn.setAttribute("src", "./resources/svg/download.svg")
            break;
        case InstanceState.Loading:
            dlBtn.style.backgroundColor = "#5C5C5C"
            iconBtn.setAttribute("src", "./resources/svg/loading.svg")
            break;
        case InstanceState.Owned:
            dlBtn.style.backgroundColor = "#05E400"
            iconBtn.setAttribute("src", "./resources/svg/checkmark.svg")
            break;
    }
}