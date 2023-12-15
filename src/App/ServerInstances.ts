import fs from "fs/promises";
import path from "path";
import {instancesPath, localInstancesPath, serversInstancesPath} from "../Utils/const";
import {concatJson, replaceAll} from "../Utils/Utils";
import {
    generateInstanceBtn,
    InstanceOpts,
    LoaderOpts,
    ServerInstanceOpts
} from "../Utils/HInstance";
import {existsSync} from "fs";
import {addInstanceElement} from "../Utils/HInstance";
import {getMetadataOf, listProfiles} from "../Utils/HRemoteProfiles";
import {downloadAsync} from "../Utils/HDownload";
import {downloadMinecraft, patchInstanceWithForge} from "./DownloadGame";

let instancesStates : any = {};

async function createInstance(instanceOpts: ServerInstanceOpts, loaderOpts?: LoaderOpts){
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
        await getInstanceData(name).then((instanceJson) => {
            const currentState = instancesStates.hasOwnProperty(name) ? instancesStates[name] : InstanceState.Playable
            updateInstanceState(name, currentState)

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

                resolve()
            }).catch((err) => reject(err))
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
    Playable,
    Loading,
    Playing,
    NeedUpdate
}

export function updateInstanceState(name: string, newState: InstanceState) {
    const instance = document.getElementById(name)

    instancesStates[name] = newState

    const launchBtn = document.getElementById("server-instance-action")!
    const iconBtn = launchBtn.querySelector("img")!

    switch (newState) {
        case InstanceState.Playing:
            launchBtn.style.backgroundColor = "#FF0000"
            iconBtn.setAttribute("src", "./resources/svg/stop.svg")
            break;
        case InstanceState.NeedUpdate:
            launchBtn.style.backgroundColor = "#D73600"
            iconBtn.setAttribute("src", "./resources/svg/update.svg")
            break;
        case InstanceState.Loading:
            launchBtn.style.backgroundColor = "#5C5C5C"
            iconBtn.setAttribute("src", "./resources/svg/loading.svg")
            break;
        case InstanceState.Playable:
            launchBtn.style.backgroundColor = "#05E400"
            iconBtn.setAttribute("src", "./resources/svg/play.svg")
            break;
    }
}

export async function downloadServerInstance(instanceOpts: ServerInstanceOpts) {
    return new Promise<void>(async (resolve, reject) => {
        await getMetadataOf(instanceOpts.name).then(async (metadata) => {
            const isVanilla = !metadata.hasOwnProperty("loader")

            await createInstance(instanceOpts,
                !isVanilla ? {
                name: metadata["loader"]["name"],
                id: metadata["loader"]["id"]
            } : undefined).catch((err) => reject(err))

            console.log("instance created downloading mc")

            await downloadMinecraft(metadata["mcVersion"], instanceOpts.name).catch((err) => reject(err))
            if(!isVanilla) {
                console.log("miencraft downloaded, dl forge")
                await patchInstanceWithForge(instanceOpts.name, metadata["mcVersion"], metadata["loader"]["id"]).catch((err) => reject(err))
            }

            console.log("forge downloaded updating instance")

            // Download files
            for (const fileData of metadata["files"]) {
                const ext = path.extname(fileData.path)
                ext === ".zip" ? console.log("zip file detected") : null
                await downloadAsync(fileData.url, path.join(serversInstancesPath, instanceOpts.name, fileData.path), undefined, {decompress: ext === ".zip"}).catch((err) => reject(err))
            }

            resolve()
        }).catch((err) => reject(err))
    })
}