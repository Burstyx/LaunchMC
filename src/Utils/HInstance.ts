import fs from "fs/promises"
import path from "path"
import { instancesPath } from "../Utils/const"
import { makeDir } from "./HFileManagement"
import { existsSync } from "original-fs"
import Color from "color"


function addInstanceElement(imagePath: string, title: string, instanceDiv: HTMLElement, id: string){
    instanceDiv.appendChild(generateInstanceBtn(imagePath, title, id))
}

interface InstanceInfo {
    name: string,
    imagePath: string,
    id: string,
    author: string,
    accentColor: string,
    description: string,
    modloader: string
}

export async function createInstance(version: string, instanceInfo: InstanceInfo){
    await makeDir(path.join(instancesPath, instanceInfo["id"]))

    // TODO Instance opt in folder
    await fs.writeFile(path.join(instancesPath, instanceInfo["id"], "info.json"), JSON.stringify(
        {"instanceData":
        {"name": instanceInfo["name"], "imagePath": instanceInfo["imagePath"], "author": instanceInfo["author"], "accentColor": instanceInfo["accentColor"],
        "playtime": 0, "lastplayed": "-1", "description": instanceInfo["description"]}, "gameData": {"version": version,
        "modloader": instanceInfo["modloader"]}}
    ))

    const instanceDiv = document.getElementById("instance-list")!
    addInstanceElement(instanceInfo["imagePath"], instanceInfo["name"], instanceDiv, instanceInfo["id"])
}

function generateInstanceBtn(imagePath: string, title: string, id: string) {
    let instanceElement = document.createElement("div")

    if(title.length > 20){
        title = title.substring(0, 23)
        title += "..."
    }

    instanceElement.innerText = title
    instanceElement.classList.add("img-btn", "interactable", "instance")
    instanceElement.style.backgroundImage = `linear-gradient(90deg, black 0%, rgba(0, 0, 0, 0) 100%), url(${imagePath})`
    instanceElement.id = id

    instanceElement.addEventListener("click", async (e) => {
        await setContentTo(id)

        document.querySelector(".instance.active")?.classList.remove("active")
        instanceElement.classList.add("active")
    })
    
    return instanceElement
}

export async function setContentTo(id: string) {
    const data = await getInstanceData(id)

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
    const accentColor = instanceData["accentcolor"]
    launchBtn.style.backgroundColor = accentColor

    const color = Color(accentColor)
    const borderColor = color.darken(-.25).hex()

    contentAuthor.style.color = accentColor

    launchBtn.style.border = `solid ${borderColor}`
    launchBtn.style.boxShadow = `0 0 10px 1px ${accentColor}`

    const contentBackground = document.getElementById("content-background")!
    contentBackground.style.backgroundImage = `linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, black calc(100% + 1px)),
    url(${instanceData["imagePath"]})`
}

export async function refreshInstanceList(){
    const instancesDiv = document.getElementById("instance-list")!
    instancesDiv.innerHTML = ""
    
    if(existsSync(instancesPath)){
        const instances = await fs.readdir(instancesPath)

        if(instances.length <= 0){
            const content = document.getElementById("content")!
            content.style.display = "none"

            const noInstanceFound = document.getElementById("no-instancefound")!
            noInstanceFound.style.display = "flex"

            return
        }

        const content = document.getElementById("content")!        
        content.style.display = "flex"

        const noInstanceFound = document.getElementById("no-instancefound")!
        noInstanceFound.style.display = "none"

        for(const e in instances){            
            if(existsSync(path.join(instancesPath, instances[e], "info.json"))){
                const data = await fs.readFile(path.join(instancesPath, instances[e], "info.json"), "utf8")

                const dataJson = JSON.parse(data)
                addInstanceElement(dataJson["instanceData"]["imagePath"], dataJson["instanceData"]["name"], instancesDiv, instances[e])
            }
        }

        setContentTo(instancesDiv.children[0].id)
        instancesDiv.children[0].classList.add("active")
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