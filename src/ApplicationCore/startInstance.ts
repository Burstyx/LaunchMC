import {minecraftManifestForVersion} from "../Helper/HManifests"
import cp from "child_process"
import path from "path"
import {instancesPath, assetsPath, librariesPath, minecraftVersionPath} from "../Helper/const"
import os from "os"
import fs from "fs/promises"

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

        
        // console.log(mcArgs);

        // Set command arguments
        var jvmArgs = ""
        jvmArgs += "-Xms2048M "
        jvmArgs += "-Xmx4096M "

        jvmArgs += "-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump "
        jvmArgs += "-Djava.library.path=" + librariesPath + " "
        jvmArgs += "-Dorg.lwjgl.librarypath=" + librariesPath + " "

        jvmArgs += "-cp "

        const libraries = await getAllFile(librariesPath)
        console.log(libraries);
        const librariesArg = await buildLibrariesArgument(libraries, version)
        console.log(librariesArg);
        
        jvmArgs += librariesArg
        

        
        

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
    const items = await fs.readdir(pathDir, {withFileTypes: true})
    for(const item of items){
        console.log(item);
        
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

async function buildLibrariesArgument(listOfLibraries: any[], version: string){
    let final = ""
    for(let i = 0; i < listOfLibraries.length; i++){
        final += listOfLibraries[i] + ";"
    }
    final += path.join(minecraftVersionPath, version, `${version}.json`)
    return final
}

function parseRule(rule: any){

}