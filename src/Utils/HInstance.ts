import fs from "fs/promises"
import {existsSync} from "fs"
import path from "path"
import { instancesPath } from "../Utils/const"

export function addInstanceElement(imagePath: string, title: string, instanceDiv: HTMLElement, id: string){
    instanceDiv.appendChild(generateInstanceBtn(imagePath, title, id))
}

function generateInstanceBtn(imagePath: string, title: string, id: string) {
    let element = document.createElement("div")
    let titleElement = document.createElement("p")

    if(title.length > 12){
        title = title.substring(0, 15)
        title += "..."
    }

    element.setAttribute("instanceid", id)

    titleElement.innerText = title

    element.className = "instance"

    const instances = document.getElementById("instances")

    if(instances?.hasChildNodes()){
        element.id = "element" + instances?.children.length
        
    }else{
        element.id = "element0"
    }

    let style = createStyleString(imagePath)

    element.setAttribute("style", style)
    element.appendChild(titleElement)
    
    return element
}

function createStyleString(imagePath: string){
    let style = `background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("${imagePath}");`
    return style
}

export async function getInstancesList(instancesDiv: HTMLElement, id: string){
    instancesDiv.innerHTML = ""
    
    if(existsSync(instancesPath)){
        const instances = await fs.readdir(instancesPath)
        for(const e in instances){
            if(existsSync(path.join(instancesPath, instances[e], "info.json"))){
                const data = JSON.parse(await fs.readFile(path.join(instancesPath, instances[e], "info.json"), "utf-8"))
                addInstanceElement(data["imagePath"], instances[e], instancesDiv, id)
            }
        }
    }
}

export async function getInstanceData(instanceId: string){
    if(existsSync(instancesPath)){
        const instances = await fs.readdir(instancesPath)
        for(const e in instances){
            const data = await fs.readFile(path.join(instancesPath, instances[e], "info.json"), "utf-8")
            const id = JSON.parse(data)["id"]
            if(id == instanceId){
                return {"data": JSON.parse(data), "gamePath": path.join(instancesPath, instances[e])}
            }
        }
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