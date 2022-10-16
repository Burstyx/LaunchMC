import fs from "fs"
import path from "path"
const {instancesPath} = require("../utils/const")

export function refreshInstancesList(imagePath: string, title: string, instanceDiv: HTMLElement){
    console.log(fs.readdirSync(instancesPath))
    instanceDiv.appendChild(generateInstanceBtn(imagePath, title))
}

function generateInstanceBtn(imagePath: string, title: string) {
    let element = document.createElement("div")
    let titleElement = document.createElement("p")
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

export function getInstancesList(instancesDiv: HTMLElement){
    if(fs.existsSync(instancesPath)){
        const instances = fs.readdirSync(instancesPath)
        for(const e in instances){
            if(fs.existsSync(path.join(instancesPath, instances[e], "info.json"))){
                const data = JSON.parse(fs.readFileSync(path.join(instancesPath, instances[e], "info.json"), "utf-8"))
                refreshInstancesList(data["imagePath"], instances[e], instancesDiv)
            }
        }
    }
}