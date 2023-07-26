import fs from "fs/promises"
import path from "path"
import { instancesPath } from "../Utils/const"
import { makeDir } from "./HFileManagement"
import { existsSync } from "original-fs"
import Color from "color"


async function addInstanceElement(imagePath: string, title: string, id: string){
    const instanceDiv = document.getElementById("instance-list")!

    instanceDiv.appendChild(generateInstanceBtn(imagePath, title, id))
}

interface InstanceInfo {
    name: string,
    imagePath: string,
    id: string,
    author: string,
    accentColor: string,
    modloader: string
}

export async function createInstance(version: string, instanceInfo: InstanceInfo){
    await makeDir(path.join(instancesPath, instanceInfo["id"]))

    // TODO Instance opt in folder
    await fs.writeFile(path.join(instancesPath, instanceInfo["id"], "info.json"), JSON.stringify(
        {"instanceData":
        {"name": instanceInfo["name"], "imagePath": instanceInfo["imagePath"], "author": instanceInfo["author"], "accentColor": instanceInfo["accentColor"],
        "playtime": 0, "lastplayed": "Never", "description": null}, "gameData": {"version": version,
        "modloader": instanceInfo["modloader"]}}
    ))

    await refreshInstanceList()
}

function generateInstanceBtn(imagePath: string, title: string, id: string) {
    let instanceElement = document.createElement("div")

    if(title.length > 20){
        title = title.substring(0, 23)
        title += "..."
    }

    // Instance Btn
    instanceElement.innerText = title
    instanceElement.classList.add("img-btn", "interactable", "instance")
    instanceElement.style.backgroundImage = `linear-gradient(90deg, black 0%, rgba(0, 0, 0, 0) 100%), url(${imagePath})`
    instanceElement.id = id

    // Download track div
    let dlTrackerElement = document.createElement("div")
    dlTrackerElement.classList.add("dltracker")
    dlTrackerElement.style.position = "absolute"
    dlTrackerElement.style.top = "0"
    dlTrackerElement.style.left = "0%"
    dlTrackerElement.style.width = "100%"
    dlTrackerElement.style.height = "100%"
    dlTrackerElement.style.borderRadius = "5px"
    dlTrackerElement.style.backdropFilter = "saturate(0%)"
    dlTrackerElement.style.pointerEvents = "none"

    instanceElement.append(dlTrackerElement)

    instanceElement.addEventListener("click", async (e) => {
        await setContentTo(id)

        document.querySelector(".instance.active")?.classList.remove("active")
        instanceElement.classList.add("active")
    })
    
    return instanceElement
}

export async function setContentTo(id: string) {
    const data = await getInstanceData(id)
    
    const content = document.getElementById("content")!
    content.style.display = "none"

    const loading = document.getElementById("instance-info-loading")!
    loading.style.display = "auto"

    if(data == null) {
        return
    }

    const instanceData = data["data"]["instanceData"]
    const gameData = data["data"]["gameData"]

    const contentTitle = document.getElementById("instance-title")!
    const contentAuthor = document.getElementById("instance-author")!
    contentTitle.innerText = instanceData["name"]
    contentAuthor.innerText = instanceData["author"]

    const widgetVersion = document.getElementById("widget-version")!
    widgetVersion.innerText = gameData["version"]

    const widgetModloader = document.getElementById("widget-modloader")!
    widgetModloader.innerText = gameData["modloader"]

    const widgetPlaytime = document.getElementById("widget-playtime")!

    let h, m;
    const timeInMiliseconds = instanceData["playtime"]

    h = Math.floor(timeInMiliseconds / 1000 / 60 / 60);
    m = Math.floor((timeInMiliseconds / 1000 / 60 / 60 - h) * 60);

    m < 10 ? m = `0${m}` : m = `${m}`
    h < 10 ? h = `0${h}` : h = `${h}`

    widgetPlaytime.innerText = `${h}h${m}`

    const widgetLastplayed = document.getElementById("widget-lastplayed")! // Don't work
    widgetLastplayed.innerText = instanceData["lastplayed"]

    const widgetDesc = document.getElementById("widget-description")! // Write md rules
    widgetDesc.innerText = instanceData["description"]

    const launchBtn = document.getElementById("launchbtn")!
    const accentColor = instanceData["accentColor"]
    launchBtn.style.backgroundColor = accentColor

    const color = Color(accentColor)
    const borderColor = color.darken(-.25).hex()

    contentAuthor.style.color = accentColor

    launchBtn.style.border = `solid ${borderColor}`
    launchBtn.style.boxShadow = `0 0 10px 1px ${accentColor}`

    const contentBackground = document.getElementById("content-background")!
    contentBackground.style.backgroundImage = `linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, black calc(100% + 1px)),
    url(${instanceData["imagePath"]})`

    loading.style.display = "none"
    content.style.display = "flex"
}

export async function refreshInstanceList(){
    const instancesDiv = document.getElementById("instance-list")!
    instancesDiv.innerHTML = ""
    
    if(existsSync(instancesPath)){
        const instances = await fs.readdir(instancesPath)

        for(const e in instances){            
            if(existsSync(path.join(instancesPath, instances[e], "info.json"))){
                const data = await fs.readFile(path.join(instancesPath, instances[e], "info.json"), "utf8")

                const dataJson = JSON.parse(data)
                await addInstanceElement(dataJson["instanceData"]["imagePath"], dataJson["instanceData"]["name"], instances[e])
            }
        }
    }
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
    const dlTracker = document.querySelector(`#${instanceId} .dltracker`)!

    console.log(dlTracker);

    if(dlTracker == null) {
        return
    }
    

    //@ts-ignore
    dlTracker.style.left = `${progress}%`
}

export enum InstanceState {
    Downloading,
    Playing,
    Loading,
    Inactive,
}

export function updateInstanceState(instanceId: string, newState: InstanceState){
    const instance = getInstanceById(instanceId)
    
    if(instance == null){
        return
    }

    switch(newState){
        case InstanceState.Downloading:
            instance.className = "instance downloading"
            break
        case InstanceState.Loading:
            instance.className = "instance loading"
            break
        case InstanceState.Playing:
            instance.className = "instance playing"
            break
        case InstanceState.Inactive:
            instance.className = "instance"
            break
    }
}