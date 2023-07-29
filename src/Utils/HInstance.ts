import fs from "fs/promises"
import path from "path"
import { instancesPath } from "../Utils/const"
import { makeDir } from "./HFileManagement"
import { existsSync } from "original-fs"
import Color from "color"


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

async function generateInstanceBtn(imagePath: string, title: string, id: string) {
    let instanceElement = document.createElement("div")

    if(title.length > 20){
        title = title.substring(0, 23)
        title += "..."
    }

    // Instance Btn
    instanceElement.innerText = title
    instanceElement.classList.add("img-btn", "interactable", "instance")
    instanceElement.style.backgroundImage = `linear-gradient(90deg, black 0%, rgba(0, 0, 0, 0) 100%), url('${imagePath}')`
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

        document.querySelector(".instance.active")?.classList.remove("active")
        instanceElement.classList.add("active")
    })
    
    return instanceElement
}

let currentContentId: string | null = null

export async function setContentTo(id: string) { // TODO: Cleaning
    currentContentId = id

    const instance = document.getElementById(id)
    const currentState = instance?.getAttribute("state")

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
    contentBackground.style.backgroundImage = `linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, black calc(100% + 1px)),
    url('${instanceData["imagePath"]}')`

    loading.style.display = "none"
    content.style.display = "flex"
}

export async function refreshInstanceList(){
    const instancesDiv = document.getElementById("instance-list")!
    instancesDiv.innerHTML = ""
    
    if(existsSync(instancesPath)){
        const instances = await fs.readdir(instancesPath)

        let instancesName: any[] = []
        
        // Get all instances
        for(const e in instances){            
            if(existsSync(path.join(instancesPath, instances[e], "info.json"))){
                const data = await fs.readFile(path.join(instancesPath, instances[e], "info.json"), "utf8")
                const dataJson = JSON.parse(data)

                instancesName[e] = dataJson["instanceData"]["name"]     
                console.log(e, dataJson["instanceData"]["name"]);
            }
        }

        const instancesNameOrdered = Object.values(instancesName).sort()
        
        const orderedInstancesName: any[] = []

        for(const e of instancesNameOrdered) { // name
            for(const el in instancesName) { // index                
                if(e == instancesName[el]){
                    orderedInstancesName.push({name: e, index: el})
                }
            }
        }
                
        // Order instances by name        
        for(const e in orderedInstancesName) {            
            const data = await fs.readFile(path.join(instancesPath, instances[orderedInstancesName[e]["index"]], "info.json"), "utf8")
            const dataJson = JSON.parse(data)

            await addInstanceElement(dataJson["instanceData"]["imagePath"], dataJson["instanceData"]["name"], instances[orderedInstancesName[e]["index"]])
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
    const instance = document.getElementById(instanceId)

    const dlTracker = instance?.firstElementChild

    if(dlTracker == null) {
        return
    }
    
    //@ts-ignore
    dlTracker.style.left = `${progress >= 98 ? '100' : progress}%`
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

export async function checkInstanceIntegrity(instanceId: string) {
    // TODO: Code
}

// DEBUG ZONE
// document.addEventListener("dblclick", (e) => {
//     updateInstanceDlState("cbffedb1-8ef6-4cab-b7bf-a9fdb83d453c", InstanceState.Downloading)
//     setTimeout(() => {
//         updateInstanceDlState("cbffedb1-8ef6-4cab-b7bf-a9fdb83d453c", InstanceState.Loading)
//         setTimeout(() => {
//             updateInstanceDlState("cbffedb1-8ef6-4cab-b7bf-a9fdb83d453c", InstanceState.Playable)
//             setTimeout(() => {
//                 updateInstanceDlState("cbffedb1-8ef6-4cab-b7bf-a9fdb83d453c", InstanceState.Playing)
//                  setTimeout(() => {
//                     updateInstanceDlState("cbffedb1-8ef6-4cab-b7bf-a9fdb83d453c", InstanceState.Update)
//                 }, 2000)
//             }, 2000)
//         }, 2000)
//     }, 2000)
// })