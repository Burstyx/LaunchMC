import {replaceAll} from "../Utils/Utils";
import {getMetadataOf, listProfiles} from "../Utils/HRemoteProfiles";
import {addInstanceElement} from "../Utils/HInstance";
import {existsSync} from "fs";
import {serversInstancesPath} from "../Utils/const";
import path from "path";
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

        await listProfiles().then(async (profiles) => {
            const serverBrandLogo = document.getElementById("dl-page-server-brand-logo")
            if(serverBrandLogo)
                serverBrandLogo.setAttribute("src", `${replaceAll(profiles[name]["brandLogoUrl"], '\\', '/')}`)

            const widgetVersion = document.getElementById("dl-page-version")
            if(widgetVersion) {
                widgetVersion.innerHTML = "";

                const widgetText = document.createElement("p")

                await getMetadataOf(name).then((metadata) => {
                    widgetText.innerText = `${metadata["type"]} ${metadata["mcVersion"]}`
                }).catch((err) => reject(err))

                widgetVersion.append(widgetText)
            }

            const contentBackground = document.getElementById("dl-page-thumbnail")
            if(contentBackground) contentBackground.style.backgroundImage = `url('${replaceAll(profiles[name]["thumbnailUrl"], '\\', '/')}')`

            resolve()
        }).catch((err) => reject(err))
    })
}

export async function refreshInstanceList() {
    return new Promise<void>(async (resolve, reject) => {
        const instancesDiv = document.getElementById("avail-servers")

        if(instancesDiv){
            instancesDiv.innerHTML = ""

            const loading= document.createElement("img")
            loading.setAttribute("src", "./resources/svg/loading.svg")
            instancesDiv.append(loading)

            await listProfiles().then((profiles) => {
                instancesDiv.innerHTML = ""

                for(const instanceName in profiles){
                    const element = addInstanceElement({
                            name: instanceName,
                            thumbnailPath: profiles[instanceName]["thumbnailPath"],
                            logoPath: profiles[instanceName]["coverUrl"],
                            version: profiles[instanceName]["thumbnailPath"]
                        },
                        instancesDiv
                    )

                    if(existsSync(path.join(serversInstancesPath, instanceName, "info.json"))) {
                        instancesStates[instanceName] = InstanceState.Owned
                    }

                    element.addEventListener("click", () => {
                        currentInstanceOpened = instanceName

                        setContentTo(instanceName)
                        openPopup("download-instance-info")
                    })
                }
            }).catch((err) => reject(err))

            resolve()
        } else reject()
    })
}

export function updateInstanceState(name: string, newState: InstanceState) {
    instancesStates[name] = newState

    const dlBtn= document.getElementById("download-instance-action")
    if(dlBtn) {
        const iconBtn= dlBtn.querySelector("img")
        if(iconBtn) {
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
    }
}