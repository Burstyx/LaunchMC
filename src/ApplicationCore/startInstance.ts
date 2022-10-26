import {minecraftManifestForVersion} from "../Helper/HManifests"
import cp from "child_process"
import path from "path"
import {instancesPath, assetsPath, librariesPath, minecraftVersionPath, legacyAssetsPath} from "../Helper/const"
import os from "os"
import fsp from "fs/promises"
import fs from "fs"

interface MinecraftArgsOpt {
    username: string,
    uuid: string,
    accesstoken: string,
    usertype: string,
    versiontype: string,
    isdemouser?: boolean,
    resolutions?: {
        width: number,
        height: number
    }
}

export function startMinecraft(version: string, instanceId: string, opt: MinecraftArgsOpt ){
    minecraftManifestForVersion(version).then(async (data) => {
        // var mcArgs = []
        // if(data.hasOwnProperty("minecraftArguments")){
        //     var args = data["minecraftArguments"].split(" ")
        //     mcArgs = args
        // }else{
        //     var args: any = []
        //     for(var e in data["arguments"]["game"]){
        //         if(data["arguments"]["game"][e].hasOwnProperty("rules")){
        //             const rule = parseRule(data["arguments"]["game"][e])
        //             if(rule != undefined){
        //                 args.push(rule)
        //             }
        //         }else{
        //             args.push(data["arguments"]["game"][e])
        //         }
        //     }
        //     mcArgs = args
        // } 

        // Get all Minecraft arguments
        var mcArgs = data["minecraftArguments"]
        if(mcArgs == null){
            mcArgs = ""
            for(let i = 0; i < data["arguments"]["game"].length; i++){
                if(typeof data["arguments"]["game"][i] == "string"){
                    mcArgs += data["arguments"]["game"][i] + " "
                }
            }
        }        

        // Parse Minecraft arguments
        let tempSplitedArgs = mcArgs.split(" ")
        console.log(tempSplitedArgs);
        
        for(let i = 0; i < tempSplitedArgs.length; i++){
            switch (tempSplitedArgs[i]) {
                case "${auth_player_name}":
                    tempSplitedArgs[i] = opt.username
                    break;
                case "${version_name}":
                    tempSplitedArgs[i] = version
                    break;
                case "${game_directory}":
                    tempSplitedArgs[i] = path.join(instancesPath, instanceId)
                    break;
                case "${assets_root}":
                    tempSplitedArgs[i] = assetsPath
                    break;
                case "${assets_index_name}":
                    tempSplitedArgs[i] = JSON.parse((await fsp.readFile(path.join(instancesPath, instanceId, "info.json"), {encoding: "utf-8"})).toString())["assets_index_name"]
                    break;
                case "${auth_uuid}":
                    tempSplitedArgs[i] = opt.uuid
                    break;
                case "${auth_access_token}":
                    tempSplitedArgs[i] = opt.accesstoken
                    break;
                case "${user_properties}":
                    tempSplitedArgs[i] = opt.username
                    break;
                case "${user_type}":
                    tempSplitedArgs[i] = "mojang"
                    break;
                case "${version_type}":
                    tempSplitedArgs[i] = opt.versiontype
                    break;
                case "${game_assets}":
                    if(!fs.existsSync(legacyAssetsPath))
                        await fsp.mkdir(legacyAssetsPath, {recursive: true})
                    tempSplitedArgs[i] = legacyAssetsPath
                    break;
                case "${auth_session}":
                    tempSplitedArgs[i] = ""
                    break;
                default:
                    break;
            }
        }

        mcArgs = tempSplitedArgs
        
        console.log(mcArgs);

        // Set command arguments
        var jvmArgs = []
        // jvmArgs.push("C:\\Program Files\\Eclipse Adoptium\\jdk-8.0.345.1-hotspot\\bin\\java")
        jvmArgs.push("-Xms2048M")
        jvmArgs.push("-Xmx4096M")

        jvmArgs.push("-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump")
        jvmArgs.push("-Djava.library.path=" + librariesPath)
        jvmArgs.push("-Dorg.lwjgl.librarypath=" + librariesPath)

        

        const libraries = await getAllFile(librariesPath)
        // console.log(libraries);
        let librariesArg = JSON.parse(await fsp.readFile(path.join(instancesPath, instanceId, "info.json"), {encoding: "utf-8"}))["libraries"]
        // console.log(librariesArg);

        jvmArgs.push(`-cp`)
        jvmArgs.push(`${librariesArg};${path.join(minecraftVersionPath, version, `${version}.jar`)}`)

        jvmArgs.push("net.minecraft.client.main.Main")
        
        const fullMcArgs = [...jvmArgs, ...mcArgs]
        console.log(fullMcArgs);

        // Start Minecraft
        const proc = cp.spawn("C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.4.101-hotspot\\bin\\java", fullMcArgs)

        proc.stdout.on("data", (data) => {
            console.log(data.toString("utf-8"));
            
        })

        proc.stderr.on("data", (data) => {
            console.error(data.toString("utf-8"));
            
        })
        
        

        
        

        // Build command string
        // var command: string = `C:\\Users\\tonib\\Downloads\\OpenJDK8U-jdk_x64_windows_hotspot_8u345b01\\jdk8u345-b01\\bin\\java`
        // for(var e in mcArgs){
        //     command += ` `
        //     command += mcArgs[e]
        // }

        // console.log(command);
    })
}

async function getAllFile(pathDir: string): Promise<any> {
    let files: any[] = []
    const items = await fsp.readdir(pathDir, {withFileTypes: true})
    for(const item of items){        
        if(item.isDirectory()){
            files = [
                ...files,
                ...(await getAllFile(path.join(pathDir, item.name)))
            ]
        }else{
            files.push(path.join(pathDir, item.name))
        }
    }
    return files
}

async function buildLibrariesArgument(listOfLibraries: any[], version: string, data: any){
    let final = ""
    for(let i = 0; i < listOfLibraries.length; i++){
        final += listOfLibraries[i] + ";"
    }
    final += path.join(minecraftVersionPath, version, `${version}.json`)
    return final
}

function parseRule(rule: any){

}