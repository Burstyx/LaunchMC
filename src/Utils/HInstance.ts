import fs from "fs/promises"
import path from "path"
import {instancesPath, localInstancesPath, serversInstancesPath} from "../Utils/const"
import {makeDir} from "./HFileManagement"
import {existsSync} from "fs"
import {concatJson, replaceAll} from "./Utils"
import {downloadMinecraft, patchInstanceWithForge} from "../App/DownloadGame";
import {downloadAsync} from "./HDownload";
import {getMetadataOf, listProfiles} from "./HGitHub";
import isUrl from "is-url"
const {openPopup} = require("../Interface/UIElements/scripts/window.js")

let occupiedInstancesWithStates : any = {};

export async function addInstanceElement(imagePath: string, title: string, parentDiv: HTMLElement){
    const instanceElement = await generateInstanceBtn(imagePath, title)

    parentDiv.appendChild(instanceElement)

    return instanceElement
}

interface InstanceInfo {
    name: string,
    thumbnailPath: string,
    type: "instance"
}

interface ServerInstanceInfo{
    name: string,
    thumbnailPath: string,
    "coverPath": string,
    type: "server_instance"
}

interface LoaderInfo {
    name: string,
    id: string
}

export async function createInstance(version: string, instanceInfo: InstanceInfo | ServerInstanceInfo, loaderInfo?: LoaderInfo){
    await makeDir(path.join(serversInstancesPath, instanceInfo.name))

    let instanceConfiguration = {}

    // Default json configuration
    if(instanceInfo.type === 'server_instance') {
        instanceConfiguration = {
            "instance": {
                "name": instanceInfo.name,
                "thumbnail_path": instanceInfo.thumbnailPath,
                "cover_path": instanceInfo.coverPath,
                "play_time": 0,
            },
            "game": {
                "version": version,
            }
        }
    } else {
        instanceConfiguration = {
            "instance": {
                "name": instanceInfo.name,
                "thumbnail_path": instanceInfo.thumbnailPath,
                "play_time": 0,
            },
            "game_data": {
                "version": version,
            }
        }
    }

    if(loaderInfo) {
        let defaultLoaderJson = {
            "loader": {
                "name": loaderInfo.name,
                "id": loaderInfo.id
            }
        }

        instanceConfiguration = concatJson(instanceConfiguration, defaultLoaderJson)
    }

    // Write instance conf on disk
    await fs.writeFile(path.join(serversInstancesPath, instanceInfo.name, "info.json"), JSON.stringify(
        instanceConfiguration
    ))

    // Update instance list
    await refreshLocalInstanceList()
}

async function generateInstanceBtn(imagePath: string, title: string) {
    const instanceElement = document.createElement("div")

    // Instance text
    const titleElement = document.createElement("p")
    titleElement.innerText = title;
    instanceElement.append(titleElement)

    // Instance Btn
    instanceElement.id = title
    instanceElement.classList.add("instance")

    if(!isUrl(imagePath)) imagePath = replaceAll(imagePath, '\\', '/')
    instanceElement.style.backgroundImage = `linear-gradient(transparent, rgba(0, 0, 0, 0.85)), url('${imagePath}'))`

    /*instanceElement.addEventListener("mousedown", (e) => {
        if(e.button === 2) {
            // @ts-ignore
            const id = e.target.id
            // @ts-ignore
            const state = e.target.getAttribute("state")

            const rcMenu = document.getElementById("rcmenu-instance")
            // @ts-ignore
            rcMenu.style.top = e.clientY + "px"
            // @ts-ignore
            rcMenu.style.left = e.clientX + "px"
            // @ts-ignore
            rcMenu.style.display = "flex"

            document.getElementById("rc_delete_instance")!.onclick = async (e) => {
                if(state === InstanceState[InstanceState.Playable]) {
                    await fs.rm(path.join(instancesPath, id), {recursive: true})
                    await refreshLocalInstanceList()
                } else {
                    console.log("Can't delete an instance which is occupied")
                }
            }

            document.getElementById("rc_open_instance_folder")!.onclick = (e) => {
                cp.exec(`start "" "${path.join(instancesPath, id)}"`)
            }
        }
    })*/

    return instanceElement
}

let currentContentId: string | null = null
export async function setContentTo(name: string) { // TODO: Cleaning
    currentContentId = name

    const instanceJson = await getInstanceData(name)

    // No data found, cancel process
    if(!instanceJson) {
        console.error("No instance data found");
        return
    }

    // Split instance data
    const instanceData = instanceJson["data"]["instance"]
    const gameData = instanceJson["data"]["game"]
    const loaderData = instanceJson["data"]["loader"]

    // Set title
    const contentTitle = document.getElementById("instance-title")!
    contentTitle.innerText = instanceData["name"]

    // Set version
    const instanceVersion = document.getElementById("instance-version")!
    instanceVersion.innerHTML = "";

    const instanceVersionText = document.createElement("p")
    instanceVersionText.innerText = `${loaderData ? loaderData["name"] : "Vanilla"} ${gameData["version"]}`

    instanceVersion.append(instanceVersionText)

    // Set playtime
    /*const instancePlaytime = document.getElementById("instance-playtime")!

    let h, m;
    const timeInMiliseconds = instanceData["play_time"]

    h = Math.floor(timeInMiliseconds / 1000 / 60 / 60);
    m = Math.floor((timeInMiliseconds / 1000 / 60 / 60 - h) * 60);

    m < 10 ? m = `0${m}` : m = `${m}`
    h < 10 ? h = `0${h}` : h = `${h}`

    instancePlaytime.innerText = `${h}h${m}`*/

    const launchBtn = document.getElementById("instance-action")!
    const iconBtn = launchBtn.querySelector("img")!

    const currentState = occupiedInstancesWithStates.hasOwnProperty(name)
        ? occupiedInstancesWithStates["name"]
        : InstanceState.Playable

    switch (currentState) {
        case InstanceState.Playing:
            launchBtn.style.backgroundColor = "#FF0000"
            iconBtn.setAttribute("src", "./resources/svg/stop.svg")
            break;
        case InstanceState.Loading && InstanceState.Patching && InstanceState.Downloading && InstanceState.DLResources && InstanceState.Verification:
            launchBtn.style.backgroundColor = "#5C5C5C"
            iconBtn.setAttribute("src", "./resources/svg/loading.svg")
            break;
        case InstanceState.Playable:
            launchBtn.style.backgroundColor = "#05E400"
            iconBtn.setAttribute("src", "./resources/svg/play.svg")
            break;
        case InstanceState.Update:
            launchBtn.style.backgroundColor = "#FF6600"
            iconBtn.setAttribute("src", "./resources/svg/update.svg")
            break;
    }

    const contentBackground = document.getElementById("local-instance-thumbnail")!
    contentBackground.style.backgroundImage = `url('${replaceAll(instanceData["thumbnail_path"], '\\', '/')}')`
}

export async function refreshLocalInstanceList() {
    const instancesDiv = document.getElementById("instances")!
    instancesDiv.innerHTML = ""
    
    if(existsSync(localInstancesPath)){
        const instances = await fs.readdir(localInstancesPath, {withFileTypes: true})
        
        for(const file of instances){
            if(file.isDirectory() && existsSync(path.join(localInstancesPath, file.name, "info.json"))){
                const data = await fs.readFile(path.join(localInstancesPath, file.name, "info.json"), "utf8")
                const dataJson = JSON.parse(data)
                
                const element = await addInstanceElement(dataJson["instance"]["thumbnail_path"], dataJson["instance"]["name"], instancesDiv)
                element.addEventListener("click", async (e) => {
                    await setContentTo(dataJson["instance"]["name"])
                    openPopup('instance-info')
                })
            }
        }
    }
}

export async function refreshServerInstanceList() {
    const instancesDiv = document.getElementById("own-servers")!
    instancesDiv.innerHTML = ""

    if(existsSync(serversInstancesPath)){
        const instances = await fs.readdir(serversInstancesPath, {withFileTypes: true})

        for(const file of instances){
            if(file.isDirectory() && existsSync(path.join(serversInstancesPath, file.name, "info.json"))){
                const data = await fs.readFile(path.join(serversInstancesPath, file.name, "info.json"), "utf8")
                const dataJson = JSON.parse(data)

                const element = await addInstanceElement(dataJson["instance"]["thumbnail_path"], dataJson["instance"]["name"], instancesDiv)
                element.addEventListener("click", async (e) => {
                    await setContentTo(dataJson["instance"]["name"])
                    openPopup('server-instance-info')
                })
            }
        }
    }
}

export async function getInstanceData(instanceId: string){
    if(existsSync(localInstancesPath)){
        const data = await fs.readFile(path.join(localInstancesPath, instanceId, "info.json"), "utf-8")
        const dataJson = JSON.parse(data)

        return {"data": dataJson, "game_path": path.join(localInstancesPath, instanceId)}
    }
}

export function getInstanceById(id: string) {
    const instancesDiv = document.getElementById("instances")!

    for(let i = 0; i < instancesDiv.childElementCount; i++){        
        if(instancesDiv.children[i].getAttribute("instanceid") == id){
            return instancesDiv.children[i]     
        }
    }
} 

export function updateInstanceDlProgress(instanceId: string, progress: number) {
    const instance = document.getElementById(instanceId)

    const dlTracker = instance?.firstElementChild

    if(dlTracker == null) {
        return
    }

    console.log(progress);



    //@ts-ignore
    dlTracker.style.left = `${progress}%`;
    //@ts-ignore
    dlTracker.style.width = 100 - Number(dlTracker.style.left.substring(0, dlTracker.style.left.length - 1)) + '%';

}

export enum InstanceState {
    Loading,
    Downloading,
    DLResources,
    Verification,
    Patching,
    Playable,
    Update,
    Playing
}

export async function updateInstanceDlState(instanceId: string, newState: InstanceState) {
    const instance = document.getElementById(instanceId)
    
    instance?.setAttribute("state", InstanceState[newState])

    if(currentContentId == instanceId)
        await setContentTo(instanceId)
}

export async function convertProfileToInstance(metadata: any, instanceData: any) {
    const isVanilla = metadata["loader"] == null;

    await createInstance(metadata["mcVersion"], {
        name: instanceData["name"],
        thumbnailPath: await downloadAsync(
            instanceData["thumbnailPath"],
            path.join(serversInstancesPath, instanceData["name"], "thumbnail" + path.extname(instanceData["thumbnailPath"]))
        ),
        coverPath: await downloadAsync(
            instanceData["thumbnailPath"],
            path.join(serversInstancesPath, instanceData["name"], "thumbnail" + path.extname(instanceData["thumbnailPath"]))
        ),
        type: "server_instance"
    },
        !isVanilla ? {
        name: metadata["loader"]["name"],
        id: metadata["loader"]["id"]
    } : undefined)

    await downloadMinecraft(metadata["mcVersion"], instanceData["name"])
    if(!isVanilla) {
        await patchInstanceWithForge(instanceData["name"], metadata["mcVersion"], metadata["loader"]["id"])
    }

    await updateInstanceDlState(instanceData["name"], InstanceState.DLResources)

    // Download files
    for (const fileData of metadata["files"]) {
        const ext = path.extname(fileData.path)
        ext === ".zip" ? console.log("zip file detected") : null
        await downloadAsync(fileData.url, path.join(instancesPath, instanceData["name"], fileData.path), undefined, {decompress: ext === ".zip"})
    }

    await updateInstanceDlState(instanceData["name"], InstanceState.Playable)
}

export async function retrieveDescription(id: string) {
    // Get description on file server
    return JSON.parse(await fs.readFile(path.join(instancesPath, id, "info.json"), "utf-8")).instanceData.description
}

export async function retrievePosts(id: string): Promise<string> {
    // Get posts on file server
    return new Promise((resolve, reject) => {
        resolve("")
    })
}

export async function checkForUpdate(instanceId: string) {
    await updateInstanceDlState(instanceId, InstanceState.Loading)

    let updateFound = false

    // Check difference between this instance version and the serverside instance version
    // If version is different, delete game files and replace them and update instance properties

    if(updateFound) await updateInstanceDlState(instanceId, InstanceState.Update)

    await updateInstanceDlState(instanceId, InstanceState.Playable)
}

export async function checkInstanceIntegrity(instanceId: string) {
    await updateInstanceDlState(instanceId, InstanceState.Verification)

    // TODO: Code

    await updateInstanceDlState(instanceId, InstanceState.Playable)
}

export async function verifyInstanceFromRemote(name: string) {
    const profiles = await listProfiles()

    console.log(profiles)// @ts-ignore// @ts-ignore
    console.log(profiles.hasOwnProperty(name))

    // @ts-ignore
    if(!profiles.hasOwnProperty(name)) return;

    const metadata = await getMetadataOf(profiles![name])

    console.log(metadata)

    // Delete files not in server side
    const folders = metadata["folders"]
    for (const folder of folders) {
        await fs.rmdir(path.join(instancesPath, name, folder), {recursive: true})
    }

    // Download files not in the local side
    for (const fileData of metadata["files"]) {
        if(!existsSync(path.join(instancesPath, name, fileData["path"]))) {
            await downloadAsync(fileData["url"], path.join(instancesPath, name, fileData["path"]))
            console.log("downloaded: " + fileData["path"] + " from " + fileData["url"])
        }
    }
}