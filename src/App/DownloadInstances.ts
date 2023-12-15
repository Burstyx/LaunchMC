import {replaceAll} from "../Utils/Utils";
import {getInstanceDataOf, getMetadataOf, listProfiles} from "../Utils/HRemoteProfiles";
import {addInstanceElement} from "../Utils/HInstance";
const {openPopup} = require("../Interface/UIElements/scripts/window.js")

let instancesStates : any = {};

export enum InstanceState {
    ToDownload,
    Owned,
    Loading,
    Downloading,
    Verification,
    Patching
}

export async function setContentTo(name: string) { // TODO: Cleaning
    return new Promise<void>(async (resolve, reject) => {
        const currentState = instancesStates.hasOwnProperty(name) ? instancesStates[name] : InstanceState.ToDownload

        const dlInfoData = (await listProfiles())[name]
        const instanceData = await getInstanceDataOf(name)
        const metadata = await getMetadataOf(name)

        const serverBrandLogo = document.getElementById("dl-page-server-brand-logo")!
        serverBrandLogo.setAttribute("src", `${replaceAll(dlInfoData["coverUrl"], '\\', '/')}`)

        // Set version
        const widgetVersion = document.getElementById("dl-page-version")
        if(widgetVersion) {
            const widgetText = document.createElement("p")
            widgetText.innerText = `${metadata["type"]} ${metadata["mcVersion"]}`
            widgetVersion.append(widgetText)
        }

        const dlBtn= document.getElementById("download-instance-action")!
        const iconBtn= dlBtn.querySelector("img")!

        switch (currentState) {
            case InstanceState.ToDownload:
                dlBtn.style.backgroundColor = "#FF0000"
                iconBtn.setAttribute("src", "./resources/svg/download.svg")
                break;
            case InstanceState.Loading || InstanceState.Patching || InstanceState.Downloading || InstanceState.Verification:
                dlBtn.style.backgroundColor = "#5C5C5C"
                iconBtn.setAttribute("src", "./resources/svg/loading.svg")
                break;
            case InstanceState.Owned:
                dlBtn.style.backgroundColor = "#05E400"
                iconBtn.setAttribute("src", "./resources/svg/play.svg")
                break;
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

            for(const instance in profiles){
                console.log(instance)
                const element = await addInstanceElement({name: profiles[instance]["name"], thumbnailPath: profiles[instance]["thumbnailPath"], coverPath: profiles[instance]["coverUrl"], version: profiles[instance]["thumbnailPath"]}, instancesDiv)
                element.addEventListener("click", () => {
                    setContentTo(profiles[instance]["name"])
                    openPopup("download-instance-info")
                })
            }

            resolve()
        } else reject(`Unexpected error when refreshing instance list.`)
    })
}

export async function updateInstanceDlState(name: string, newState: InstanceState) {
    const instance = document.getElementById(name)

    instancesStates[name] = newState

    await setContentTo(name)
}