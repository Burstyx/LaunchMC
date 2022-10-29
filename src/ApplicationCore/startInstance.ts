import {minecraftManifestForVersion} from "../Helper/HManifests"
import cp from "child_process"
import path from "path"
import {instancesPath, assetsPath, librariesPath, minecraftVersionPath, legacyAssetsPath, javaPath, java8Version, java17Version, loggingConfPath} from "../Helper/const"
import os from "os"
import fs from "fs/promises"
import {existsSync} from "fs"
import { downloadJavaVersion, JavaVersions } from "./minecraftDownloader"
import { makeDir } from "../Helper/HDirectoryManager"

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
                    tempSplitedArgs[i] = JSON.parse((await fs.readFile(path.join(instancesPath, instanceId, "info.json"), {encoding: "utf-8"})).toString())["assets_index_name"]
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
                    if(!existsSync(legacyAssetsPath))
                        await fs.mkdir(legacyAssetsPath, {recursive: true})
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

        jvmArgs.push("-Djava.library.path=" + await makeDir(path.join(instancesPath, instanceId, "natives")))

       

        // jvmArgs.push("-Dorg.lwjgl.librarypath=" + path.join(librariesPath, "org", "lwjgl", "lwjgl", "lwjgl-platform", "2.9.4-nightly-20150209"))

        const libraries = await getAllFile(librariesPath)
        // console.log(libraries);
        let librariesArg = JSON.parse(await fs.readFile(path.join(instancesPath, instanceId, "info.json"), {encoding: "utf-8"}))["libraries"]
        
        

        jvmArgs.push(`-cp`)
        jvmArgs.push(`${librariesArg}${path.join(minecraftVersionPath, version, `${version}.jar`)}`)
        console.log(`${librariesArg}${path.join(minecraftVersionPath, version, `${version}.jar`)}`);

        jvmArgs.push(data["mainClass"])
        
        const fullMcArgs = [...jvmArgs, ...mcArgs]
        console.log(fullMcArgs);

        

        // Find correct java executable
        if(!existsSync(path.join(javaPath, java8Version))){
            await downloadJavaVersion(JavaVersions.JDK8)
        }
        if(!existsSync(path.join(javaPath, java17Version))){
            await downloadJavaVersion(JavaVersions.JDK17)
        }

        const java8 = path.join(javaPath, java8Version, java8Version, "bin", "java")
        const java17 = path.join(javaPath, java17Version, java17Version, "bin", "java")

        console.log("Extracting natives");
        
        await extractAllNatives(librariesArg, path.join(instancesPath, instanceId, "natives"), path.join(javaPath, java17Version, java17Version, "bin", "jar"))

        console.log("natives extracted");

        const javaVersion = data["javaVersion"]["majorVersion"]

        if(javaVersion >= 16){
            console.log("Launching java 17");
            
            const proc = cp.spawn(java17, fullMcArgs)

            proc.stdout.on("data", (data) => {
                console.log(data.toString("utf-8"));
            })

            proc.stderr.on("data", (data) => {
                console.error(data.toString("utf-8"));                
            })
        }else{
            console.log("Launching java 8");

            const proc = cp.spawn("C:\\Users\\tonib\\Downloads\\OpenJDK8U-jdk_x64_windows_hotspot_8u345b01\\jdk8u345-b01\\bin\\javaw", fullMcArgs)

            proc.stdout.on("data", (data) => {
                console.log(data.toString("utf-8"));
                
            })

            proc.stderr.on("data", (data) => {
                console.error(data.toString("utf-8"));
            })
        }

        // Start Minecraft
        
        
        

        
        

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

async function extractAllNatives(libraries: string, nativeFolder: string, javaLocation: string){
    return new Promise(async (resolve, reject) => {
        const allLibs = libraries.split(";")
        for await (const e of allLibs){
            console.log(e);
            cp.exec(javaLocation + " --list --file " + e, async (err, stdout, sdterr) => {
                const filesOfLibrary = stdout.split("\r\n")
                for await (const n of filesOfLibrary){
                    if(n.includes(".dll")){
                        console.log(n);                        
                        cp.exec(`${javaLocation} xf ${e} ${n}`, {cwd: nativeFolder})
                    }
                }
            })
        }
        resolve("All natives are extracted")
    })
}