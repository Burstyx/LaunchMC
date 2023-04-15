import fs from "fs/promises"
import {existsSync} from "fs"
import path from "path"
import { instancesPath } from "../Helper/const"
import {v4} from "uuid"

export function addInstanceElement(imagePath: string, title: string, instanceDiv: HTMLElement){
    instanceDiv.appendChild(generateInstanceBtn(imagePath, title))
}

function generateInstanceBtn(imagePath: string, title: string) {
    let element = document.createElement("div")
    let titleElement = document.createElement("p")

    if(title.length > 12){
        title = title.substring(0, 15)
        title += "..."
    }

    const uuid = v4()

    element.setAttribute("instanceid", uuid)

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

export async function getInstancesList(instancesDiv: HTMLElement){
    instancesDiv.innerHTML = ""
    
    if(existsSync(instancesPath)){
        const instances = await fs.readdir(instancesPath)
        for(const e in instances){
            if(existsSync(path.join(instancesPath, instances[e], "info.json"))){
                const data = JSON.parse(await fs.readFile(path.join(instancesPath, instances[e], "info.json"), "utf-8"))
                addInstanceElement(data["imagePath"], instances[e], instancesDiv)
            }
        }
    }
}

export function makeInstanceDownloaded(id: string, instancesDiv: HTMLElement){
    for(let i = 0; i < instancesDiv.childElementCount; i++){
        if(instancesDiv.children[i].children[0].innerHTML == id){
            instancesDiv.children[i].classList.remove("downloading")   
        }
    }
}

export function makeInstanceDownloading(id: string, instancesDiv: HTMLElement){
    for(let i = 0; i < instancesDiv.childElementCount; i++){
        console.log(instancesDiv.children[i].children[0].innerHTML);
        if(instancesDiv.children[i].children[0].innerHTML == id){
            instancesDiv.children[i].classList.add("downloading")            
        }
    }
}

export function makeInstancePlaying(id: string, instancesDiv: HTMLElement){
    for(let i = 0; i < instancesDiv.childElementCount; i++){
        console.log(instancesDiv.children[i].children[0].innerHTML);
        if(instancesDiv.children[i].children[0].innerHTML == id){
            instancesDiv.children[i].classList.add("playing")             
        }
    }
}

export function makeInstanceNotPlaying(id: string, instancesDiv: HTMLElement){
    for(let i = 0; i < instancesDiv.childElementCount; i++){
        console.log(instancesDiv.children[i].children[0].innerHTML);
        if(instancesDiv.children[i].children[0].innerHTML == id){
            instancesDiv.children[i].classList.remove("playing")      
        }
    }
}

export function makeInstanceLoading(id: string, instancesDiv: HTMLElement){
    for(let i = 0; i < instancesDiv.childElementCount; i++){
        if(instancesDiv.children[i].getAttribute("instanceid") == id){
            instancesDiv.children[i].classList.add("loading")            
        }
    }
}

export function makeInstanceNotLoading(id: string, instancesDiv: HTMLElement){
    for(let i = 0; i < instancesDiv.childElementCount; i++){        
        if(instancesDiv.children[i].getAttribute("instanceid") == id){
            instancesDiv.children[i].classList.remove("loading")      
        }
    }
}

export async function getInstanceData(instanceId: string){
    if(existsSync(path.join(instancesPath))){
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