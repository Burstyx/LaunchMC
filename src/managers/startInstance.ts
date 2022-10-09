import {getVersionManifest} from "./getMinecraftVersionManifest"

export function startMinecraft(version: string){
    let minecraftArguments: string[]

    getVersionManifest(version).then((data) => {
        minecraftArguments = data["minecraftArguments"].split('-')
        minecraftArguments.splice(0, 1)
        for(let i = 0; i < minecraftArguments.length; i++){
            if(minecraftArguments[i] == ""){
                minecraftArguments.splice(i, 1)
            }
        }
        console.log(minecraftArguments);
    })
}