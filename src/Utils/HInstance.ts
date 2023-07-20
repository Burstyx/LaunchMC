import fs from "fs/promises"
import path from "path"
import { instancesPath } from "../Utils/const"
import { makeDir } from "./HFileManagement"
import { existsSync } from "original-fs"

function addInstanceElement(imagePath: string, title: string, instanceDiv: HTMLElement, id: string){
    instanceDiv.appendChild(generateInstanceBtn(imagePath, title, id))
}

export async function createInstance(name: string, imagePath: string, id: string, version: string, versionData: any){
    await makeDir(path.join(instancesPath, name))

    // TODO Instance opt in folder
    await fs.writeFile(path.join(instancesPath, name, "info.json"), JSON.stringify({"imagePath": imagePath, "version": version, "name": name, "assets_index_name": versionData["assetIndex"]["id"], "id": id}))

    const instanceDiv = document.getElementById("instance-list")!
    addInstanceElement(imagePath, name, instanceDiv, id)
}

function generateInstanceBtn(imagePath: string, title: string, id: string) {
    let instanceElement = document.createElement("div")

    if(title.length > 20){
        title = title.substring(0, 23)
        title += "..."
    }

    instanceElement.innerText = title
    instanceElement.classList.add("img-btn", "interactable")
    instanceElement.style.backgroundImage = `linear-gradient(90deg, black 0%, rgba(0, 0, 0, 0) 100%), url(${imagePath})`
    instanceElement.id = id
    
    return instanceElement
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
                addInstanceElement(dataJson["imagePath"], dataJson["name"], instancesDiv, dataJson["id"])
            }
        }
    }
}

export async function getInstanceData(instanceName: string){
    if(existsSync(instancesPath)){             
        const data = await fs.readFile(path.join(instancesPath, instanceName, "info.json"), "utf-8")
        const dataJson = JSON.parse(data)

        return {"data": dataJson, "gamePath": path.join(instancesPath, instanceName)}
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