import fs from "fs/promises";
import path from "path";
import {localInstancesPath, serversInstancesPath} from "../Utils/const";
import {concatJson, replaceAll} from "../Utils/Utils";
import {
    generateInstanceBtn,
    InstanceOpts,
    LoaderInfo,
    ServerInstanceOpts
} from "../Utils/HInstance";
import {existsSync} from "fs";
import {addInstanceElement} from "../Utils/HInstance";

let instancesStates : any = {};

export async function createInstance(instanceOpts: ServerInstanceOpts, loaderOpts?: LoaderInfo){
    return new Promise<void>(async (resolve, reject)=> {
        await fs.mkdir(path.join(serversInstancesPath, instanceOpts.name), {recursive: true}).catch((err) => reject(err))

        let instanceConfiguration = {}

        // Default json configuration
        instanceConfiguration = {
            "instance": {
                "name": instanceOpts.name,
                "thumbnail_path": instanceOpts.thumbnailPath,
                "cover_path": instanceOpts.coverPath,
                "play_time": 0,
            },
            "game": {
                "version": instanceOpts.version,
            }
        }

        if(loaderOpts) {
            let defaultLoaderJson = {
                "loader": {
                    "name": loaderOpts.name,
                    "id": loaderOpts.id
                }
            }

            instanceConfiguration = concatJson(instanceConfiguration, defaultLoaderJson)
        }

        // Write instance conf on disk
        await fs.writeFile(path.join(serversInstancesPath, instanceOpts.name, "info.json"), JSON.stringify(
            instanceConfiguration
        )).catch((err) => reject(err))

        await refreshInstanceList().catch((err) => reject(err))

        resolve()
    })
}

export async function setContentTo(name: string) { // TODO: Cleaning
    return new Promise<void>(async (resolve, reject) => {
        const currentState = instancesStates.hasOwnProperty(name) ? instancesStates[name] : InstanceState.Playable

        await getInstanceData(name).then((instanceJson) => {
            const instanceData = instanceJson["data"]["instance"]
            const gameData = instanceJson["data"]["game"]
            const loaderData = instanceJson["data"].hasOwnProperty("loader") ? instanceJson["data"]["loader"] : null

            const serverBrandLogo = document.getElementById("server-brand-logo")!
            serverBrandLogo.setAttribute("src", `${replaceAll(instanceData["cover_path"], '\\', '/')}`)

            // Set version
            const widgetVersion = document.getElementById("server-version")
            if(widgetVersion) {
                const widgetText = document.createElement("p")
                widgetText.innerText = `${loaderData ? loaderData["name"] : "Vanilla"} ${gameData["version"]}`
                widgetVersion.append(widgetText)
            }

            //const timeInMiliseconds = instanceData.playtime

            /*h = Math.floor(timeInMiliseconds / 1000 / 60 / 60);
            m = Math.floor((timeInMiliseconds / 1000 / 60 / 60 - h) * 60);

            m < 10 ? m = `0${m}` : m = `${m}`
            h < 10 ? h = `0${h}` : h = `${h}`

            widgetPlaytime.innerText = `${h}h${m}`*/

            const launchBtn = document.getElementById("server-instance-action")!
            const iconBtn = launchBtn.querySelector("img")!

            switch (currentState) {
                case InstanceState.Playing:
                    launchBtn.style.backgroundColor = "#FF0000"
                    iconBtn.setAttribute("src", "./resources/svg/stop.svg")
                    break;
                case InstanceState.Loading || InstanceState.DlAssets || InstanceState.Patching || InstanceState.Downloading || InstanceState.Verification:
                    launchBtn.style.backgroundColor = "#5C5C5C"
                    iconBtn.setAttribute("src", "./resources/svg/loading.svg")
                    break;
                case InstanceState.Playable:
                    launchBtn.style.backgroundColor = "#05E400"
                    iconBtn.setAttribute("src", "./resources/svg/play.svg")
                    break;
            }

            const contentBackground = document.getElementById("local-instance-thumbnail")!
            contentBackground.style.backgroundImage = `url('${replaceAll(instanceData["thumbnail_path"], '\\', '/')}')`
        }).catch((err) => reject(err))
    })
}

export async function refreshInstanceList() {
    return new Promise<void>(async (resolve, reject) => {
        const instancesDiv = document.getElementById("own-servers")

        if(instancesDiv){
            instancesDiv.innerHTML = ""

            await fs.readdir(serversInstancesPath, {withFileTypes: true}).then(async (instances) => {
                for(const instance of instances){
                    if(existsSync(path.join(serversInstancesPath, instance.name, "info.json"))){
                        const data = await fs.readFile(path.join(serversInstancesPath, instance.name, "info.json"), "utf8")
                        const dataJson = JSON.parse(data)

                        const element = await addInstanceElement({name: dataJson["instance"]["name"], thumbnailPath: dataJson["instance"]["thumbnail_path"], coverPath: dataJson["instance"]["cover_path"], version: dataJson["game"]["version"]}, instancesDiv)
                        element.addEventListener("click", async () => await setContentTo(instance.name))

                    }
                }
            }).then(() => resolve()).catch((err) => reject(err))
        } else reject(`Unexpected error when refreshing instance list.`)
    })
}

export async function getInstanceData(name: string){
    return new Promise<any>(async (resolve, reject) => {
        if(existsSync(path.join(serversInstancesPath, name, "info.json"))){
            await fs.readFile(path.join(serversInstancesPath, name, "info.json"), "utf-8").then((data) => {
                const dataJson = JSON.parse(data)
                resolve({"data": dataJson, "gamePath": path.join(serversInstancesPath, name)})
            }).catch((err) => reject(err))
        } else reject(`Configuration file of the instance "${name}" don't exist.`)
    })
}

export enum InstanceState {
    Loading,
    Downloading,
    Verification,
    Patching,
    DlAssets,
    Playable,
    Playing
}

export async function updateInstanceDlState(name: string, newState: InstanceState) {
    const instance = document.getElementById(name)

    instancesStates[name] = newState

    await setContentTo(name)
}