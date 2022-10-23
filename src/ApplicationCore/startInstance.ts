import {minecraftManifestForVersion} from "../Helper/HManifests"

export function startMinecraft(version: string){
    minecraftManifestForVersion(version).then((data) => {
        if(data.hasOwnProperty("minecraftArguments")){
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
        }else{
            console.log(data["arguments"]["game"]);
            
        }

        
    })
}