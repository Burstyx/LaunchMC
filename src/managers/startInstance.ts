import {getVersionManifest} from "./getManifest"

export function startMinecraft(version: string){
    getVersionManifest(version).then((data) => {
        console.log(data["minecraftArguments"]);

        let minecraftArguments = data["minecraftArguments"]
        
        if(minecraftArguments.includes("-")){
            let args = minecraftArguments.split('-')
            args.splice(0, 1)
            for(let i = 0; i < args.length; i++){
                if(args[i] == ""){
                    args.splice(i, 1)
                }
            }
        }
        
        console.log(minecraftArguments);
    })
}