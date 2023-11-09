import fs from "fs/promises"
import path from "path"
import { instancesPath } from "../Utils/const"
import { makeDir } from "./HFileManagement"
import { existsSync } from "original-fs"
import Color from "color"
import { concatJson } from "./Utils"

var instancesData: any[] = [];

async function addInstanceElement(imagePath: string, title: string, id: string){
    const instanceDiv = document.getElementById("instance-list")!

    const instanceElement = await generateInstanceBtn(imagePath, title, id)

    instanceDiv.appendChild(instanceElement)
}

interface InstanceInfo {
    name: string,
    imagePath: string,
    id: string,
    author: string,
    accentColor: string,
    versionType: string
}

interface LoaderInfo {
    name: string,
    id: string
}

export async function createInstance(version: string, instanceInfo: InstanceInfo, loaderInfo?: LoaderInfo){
    await makeDir(path.join(instancesPath, instanceInfo.id))

    // Default json configuration
    let defaultJson =
    {
        "instanceData": {
            "name": instanceInfo.name,
            "imagePath": instanceInfo.imagePath,
            "author": instanceInfo.author,
            "accentColor": instanceInfo.accentColor,
            "playtime": 0,
            "lastplayed": null,
            "description": null
        },
        "gameData": {
            "version": version,
            "versiontype": instanceInfo.versionType,
        }
    }

    let defaultLoaderJson = {
        "loader": {
            "name": loaderInfo?.name,
            "id": loaderInfo?.id
        }
    }


    // If Forge instance then append forge conf to default conf
    if(loaderInfo) {
        defaultJson = concatJson(defaultJson, defaultLoaderJson)
    }

    // Write instance conf on disk
    await fs.writeFile(path.join(instancesPath, instanceInfo.id, "info.json"), JSON.stringify(
        defaultJson
    ))

    // Update instance list
    await refreshInstanceList()
}

async function generateInstanceBtn(imagePath: string, title: string, id: string) {
    let instanceElement = document.createElement("div")

    if(title.length > 20){
        title = title.substring(0, 23)
        title += "..."
    }

    // Instance Btn
    instanceElement.innerText = title
    instanceElement.classList.add("default-btn", "interactable", "instance")
    instanceElement.setAttribute("state", InstanceState[InstanceState.Playable])
    instanceElement.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url('${imagePath}')`
    instanceElement.style.textShadow = "black 0px 0px 10px"
    instanceElement.style.position = "relative"
    instanceElement.id = id

    // Download track div
    let dlTrackerElement = document.createElement("div")
    dlTrackerElement.classList.add("dltracker")
    dlTrackerElement.style.position = "absolute"
    dlTrackerElement.style.top = "0"
    dlTrackerElement.style.left = "100%"
    dlTrackerElement.style.width = "100%"
    dlTrackerElement.style.height = "100%"
    dlTrackerElement.style.borderRadius = "5px"
    dlTrackerElement.style.backdropFilter = "saturate(0%)"
    dlTrackerElement.style.pointerEvents = "none"

    instanceElement.append(dlTrackerElement)

    instanceElement.addEventListener("click", async (e) => {
        await setContentTo(id)

        document.querySelector(".instance.active")?.classList.remove("active");
        instanceElement.classList.add("active");
    })

    instanceElement.setAttribute("onclick", 'require("./scripts/window.js").openWindow("instance-info")')
    
    return instanceElement
}

let currentContentId: string | null = null
export async function setContentTo(id: string) { // TODO: Cleaning
    currentContentId = id

    // Get instance state
    const instance = document.getElementById(id)
    const currentState = instance?.getAttribute("state")

    // Fetch instance json
    const instanceJson = await getInstanceData(id)
    
    // Hide current content
    const content = document.getElementById("content")!
    content.style.display = "none"

    // Show loading animation
    const loading = document.getElementById("instance-info-loading")!
    loading.style.display = "auto"

    // No data found, cancel process
    if(!instanceJson) {
        console.error("No instance data found");
        return
    }

    // Separate instance datas
    const instanceData = instanceJson.data.instanceData
    const gameData = instanceJson.data.gameData
    const loaderData = instanceJson.data.loader

    // Set title
    const contentTitle = document.getElementById("instance-title")!
    contentTitle.innerText = instanceData.name

    // Set author
    const contentAuthor = document.getElementById("instance-author")!
    contentAuthor.innerText = instanceData.author

    // Set version
    const widgetVersion = document.getElementById("widget-version")!
    widgetVersion.setAttribute("subname", gameData.versiontype)
    widgetVersion.innerText = gameData.version

    // Set modloader
    let currentModloader = loaderData?.name
    let modloaderId = loaderData?.id
    
    console.log(currentModloader);
    
    const widgetModloader = document.getElementById("widget-modloader")!
    widgetModloader.innerText = currentModloader ? currentModloader[0].toUpperCase() + currentModloader.slice(1) : "Vanilla"

    widgetModloader.setAttribute("subname", currentModloader ? modloaderId : gameData.version)

    // Set playtime
    const widgetPlaytime = document.getElementById("widget-playtime")!

    let h, m;
    const timeInMiliseconds = instanceData.playtime

    h = Math.floor(timeInMiliseconds / 1000 / 60 / 60);
    m = Math.floor((timeInMiliseconds / 1000 / 60 / 60 - h) * 60);

    m < 10 ? m = `0${m}` : m = `${m}`
    h < 10 ? h = `0${h}` : h = `${h}`

    widgetPlaytime.innerText = `${h}h${m}`

    // Set last played
    const widgetLastplayed = document.getElementById("widget-lastplayed")! // FIXME: Don't work
    widgetLastplayed.innerText = instanceData["lastplayed"]

    const widgetDesc = document.getElementById("widget-description")! // TODO: Write md rules
    widgetDesc.innerText = instanceData["description"]

    const launchBtn = document.getElementById("launchbtn")!

    const accentColor = instanceData["accentColor"]
    contentAuthor.style.color = accentColor
    
    const color = Color(accentColor)
    const borderColor = color.darken(-.25).hex()
    
    launchBtn.style.backgroundColor = accentColor
    launchBtn.style.border = `solid ${borderColor}`
    launchBtn.style.boxShadow = `0 0 10px 1px ${accentColor}`

    launchBtn.innerText = "Play"

    if(currentState === InstanceState[InstanceState.Playing]){
        launchBtn.style.backgroundColor = "red"

        const color = Color("#ff0000")
        const borderColor = color.darken(-.25).hex()

        launchBtn.style.border = `solid ${borderColor}`
        launchBtn.style.boxShadow = `0 0 10px 1px red`

        launchBtn.innerText = "Stop"
    }
    else if(currentState === InstanceState[InstanceState.Update]){
        launchBtn.style.backgroundColor = "green"

        const color = Color("#00ff00")
        const borderColor = color.darken(-.25).hex()

        launchBtn.style.border = `solid ${borderColor}`
        launchBtn.style.boxShadow = `0 0 10px 1px green`

        launchBtn.innerText = "Update"
    }
    else if(currentState === InstanceState[InstanceState.Downloading]){
        launchBtn.style.backgroundColor = "#2b2b2b"
        launchBtn.style.border = `solid #363636`
        launchBtn.style.boxShadow = `0 0 10px 1px #2b2b2b`

        launchBtn.innerText = "Downloading"
    }
    else if(currentState === InstanceState[InstanceState.Loading]){
        launchBtn.style.backgroundColor = "#2b2b2b"
        launchBtn.style.border = `solid #363636`
        launchBtn.style.boxShadow = `0 0 10px 1px #2b2b2b`

        launchBtn.innerText = "Loading"
    }

    const contentBackground = document.getElementById("content-background")!
    contentBackground.style.backgroundImage = `linear-gradient(180deg, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.8) 100%),
    url('${instanceData["imagePath"]}')`

    loading.style.display = "none"
    content.style.display = "flex"
}

export async function refreshInstanceList() { // FIXME: instance state are clear and that's not good at all
    const instancesDiv = document.getElementById("instance-list")!
    await saveInstancesData();

    instancesDiv.innerHTML = ""
    
    if(existsSync(instancesPath)){
        const instances = await fs.readdir(instancesPath)
        
        // Get all instances
        for(const e in instances){            
            if(existsSync(path.join(instancesPath, instances[e], "info.json"))){
                const data = await fs.readFile(path.join(instancesPath, instances[e], "info.json"), "utf8")
                const dataJson = JSON.parse(data)
                
                await addInstanceElement(dataJson["instanceData"]["imagePath"], dataJson["instanceData"]["name"], dataJson["instanceData"]["name"])
            }
        }
    }

    await restoreInstancesData();
}

export async function getInstanceData(instanceId: string){
    if(existsSync(instancesPath)){             
        const data = await fs.readFile(path.join(instancesPath, instanceId, "info.json"), "utf-8")
        const dataJson = JSON.parse(data)

        return {"data": dataJson, "gamePath": path.join(instancesPath, instanceId)}
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
    dlTracker.style.left = `${progress >= 95 ? '100' : progress}%`
}

export enum InstanceState {
    Loading,
    Downloading,
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

export async function saveInstancesData() {
    const instances = document.getElementById("instance-list")!.children

    for (const e of instances) {
        // @ts-ignore
        instancesData[e.id] = {};
        // @ts-ignore
        instancesData[e.id]["state"] = e.getAttribute("state");
        // @ts-ignore
        instancesData[e.id]["dlCount"] = e.firstElementChild.computedStyleMap().get("left").toString();
    }

    console.log(instancesData)
}

export async function restoreInstancesData() {
    const instances = document.getElementById("instance-list")!.children

    for (const e of instances) {
        if(instancesData.includes(e.id)) {
            // @ts-ignore
            e.setAttribute("state", instancesData[e.id]["state"]);
            // @ts-ignore
            (e.firstElementChild as HTMLElement).style.left = instancesData[e.id]["dlCount"];
        }
    }
}

export async function checkInstanceIntegrity(instanceId: string) {
    // TODO: Code
}