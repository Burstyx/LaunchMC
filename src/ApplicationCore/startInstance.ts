import {minecraftManifestForVersion} from "../Helper/HManifests"
import cp from "child_process"
import path from "path"
import {instancesPath, assetsPath} from "../Helper/const"

interface MinecraftArgsOpt {
    username: string,
    version: string,
    uuid: string,
    accesstoken: string,
    xuid: string,
    usertype: string,
    versiontype: string,
    isdemouser?: boolean,
    resolutions?: {
        width: number,
        height: number
    }
}

export function startMinecraft(version: string, instanceId: string, opt: MinecraftArgsOpt ){
    minecraftManifestForVersion(version).then((data) => {
        var mcArgs = []
        if(data.hasOwnProperty("minecraftArguments")){
            var args = data["minecraftArguments"].split(" ")
            mcArgs = args
        }else{
            var args: any = []
            for(var e in data["arguments"]["game"]){
                if(data["arguments"]["game"][e].hasOwnProperty("rules")){
                    const rule = parseRule(data["arguments"]["game"][e])
                    if(rule != undefined){
                        args.push(rule)
                    }
                }else{
                    args.push(data["arguments"]["game"][e])
                }
            }
            mcArgs = args
        }      
        
        console.log(mcArgs);

        // Set command arguments
        for(var i = 0; i < mcArgs.length/2; i++){
            for(var e in mcArgs){
                switch (mcArgs[e]) {
                    case "${auth_player_name}":
                        mcArgs[e] = opt["username"]
                        break;
                    case "${version_name}":
                        mcArgs[e] = opt["version"]
                        break;
                    case "${game_directory}":
                        mcArgs[e] = path.join(instancesPath, instanceId)
                        break;
                    case "${assets_root}":
                        mcArgs[e] = assetsPath
                        break;
                    case "${assets_index_name}":
                        mcArgs[e] = version
                        break;
                    case "${auth_uuid}":
                        mcArgs[e] = opt["uuid"]
                        break;
                    case "${auth_access_token}":
                        mcArgs[e] = opt["accesstoken"]
                        break;
                    case "${clientid}":
                        mcArgs[e] = ""
                        break
                    case "${auth_xuid}":
                        mcArgs[e] = opt["xuid"]
                        break;
                    case "${user_type}":
                        mcArgs[e] = opt["usertype"]
                        break;
                    case "${version_type}":
                        mcArgs[e] = opt["versiontype"]
                        break;
                    case "${is_demo_user}":
                        break;
                    case "${has_custom_resolution}":
                        break
                    default:
                        break;
                }
            }
        }

        // Build command string
        var command: string = `C:\\Users\\tonib\\Downloads\\OpenJDK8U-jdk_x64_windows_hotspot_8u345b01\\jdk8u345-b01\\bin\\java`
        for(var e in mcArgs){
            command += ` `
            command += mcArgs[e]
        }

        console.log(command);
    })
}

function parseRule(rule: any){

}