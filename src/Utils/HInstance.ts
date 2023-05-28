import fs from "fs"
import path from "path"
import { instancesPath } from "../Utils/const"
import { makeDir } from "./HFileManagement"

export function addInstanceElement(imagePath: string, title: string, instanceDiv: HTMLElement, id: string){
    instanceDiv.appendChild(generateInstanceBtn(imagePath, title, id))
}

export async function createInstance(name: string, imagePath: string, id: string, version: string, versionData: any){
    await makeDir(path.join(instancesPath, id))

    // TODO Instance opt in folder
    fs.writeFile(path.join(instancesPath, name, "info.json"), JSON.stringify({"imagePath": imagePath, "version": version, "name": name, "assets_index_name": versionData["assetIndex"]["id"], "libraries": "", "id": id}), (err) => {
        console.error("Impossible d'écrire la configuration de l'instance " + err);
    })

    const instanceDiv = document.getElementById("instances")!
    addInstanceElement(imagePath, name, instanceDiv, id)
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

export async function refreshInstanceList(id: string){
    const instancesDiv = document.getElementById("instances")!
    instancesDiv.innerHTML = ""
    
    if(fs.existsSync(instancesPath)){
        fs.readdir(instancesPath, (err, instances) => {
            for(const e in instances){
                if(fs.existsSync(path.join(instancesPath, instances[e], "info.json"))){
                    fs.readFile(path.join(instancesPath, instances[e], "info.json"), "utf-8", (err, data) => {
                        const dataJson = JSON.parse(data)
                        addInstanceElement(dataJson["imagePath"], instances[e], instancesDiv, id)
                    })
                }
            }
        })
    }
}

export async function getInstanceData(instanceId: string){
    if(fs.existsSync(instancesPath)){
        const instances = fs.readdirSync(instancesPath)
        for(const e in instances){
            const data = fs.readFileSync(path.join(instancesPath, instances[e], "info.json"), "utf-8")
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