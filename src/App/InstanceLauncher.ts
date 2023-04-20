import {minecraftManifestForVersion} from "../Utils/HManifests"
import cp from "child_process"
import path from "path"
import {instancesPath, assetsPath, librariesPath, minecraftVersionPath, legacyAssetsPath, javaPath, java8Version, java17Version, loggingConfPath} from "../Utils/const"
import os from "os"
import fs from "fs/promises"
import {existsSync} from "fs"
import { downloadJavaVersion, JavaVersions } from "./MinecraftDownloader"
import { makeDir } from "../Utils/HFileManagement"
import { makeInstanceLoading, makeInstanceNotLoading, makeInstancePlaying } from "./InstancesManager"

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

export function startMinecraft(version: string, instanceId: string, opt: MinecraftArgsOpt, instanceDiv: HTMLElement){
    // TODO If map_to_ressource == true -> object dans legacy
    minecraftManifestForVersion(version).then(async (data) => {
        makeInstanceLoading(instanceId, instanceDiv)
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
                    // if(!existsSync(legacyAssetsPath))
                    //     await fs.mkdir(legacyAssetsPath, {recursive: true})
                    tempSplitedArgs[i] = path.join(instancesPath, instanceId, "resources")
                    break;
                case "${auth_session}":
                    tempSplitedArgs[i] = "OFFLINE"
                    break;
                default:
                    break;
            }
        }

        mcArgs = tempSplitedArgs
        
        console.log(mcArgs);

        // Set command arguments
        var jvmArgs = []
        jvmArgs.push("-Xms2048M")
        jvmArgs.push("-Xmx4096M")

        jvmArgs.push("-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump")

        jvmArgs.push("-Djava.library.path=" + await makeDir(path.join(instancesPath, instanceId, "natives")))

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

        const java8 = path.join(javaPath, java8Version, (await fs.readdir(path.join(javaPath, java8Version))).at(0)!, "bin", "javaw")
        const java17 = path.join(javaPath, java17Version, (await fs.readdir(path.join(javaPath, java17Version))).at(0)!, "bin", "javaw")

        console.log("Extracting natives");
        
        await extractAllNatives(librariesArg, path.join(instancesPath, instanceId, "natives"), path.join(javaPath, java17Version, java17Version, "bin", "jar"))

        console.log("natives extracted");

        const javaVersion = data["javaVersion"]["majorVersion"]

        makeInstanceNotLoading(instanceId, instanceDiv)
        makeInstancePlaying(instanceId, instanceDiv)

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

            const proc = cp.spawn(java8, fullMcArgs)

            proc.stdout.on("data", (data) => {
                console.log(data.toString("utf-8"));
                
            })

            proc.stderr.on("data", (data) => {
                console.error(data.toString("utf-8"));
            })
        }
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

async function extractAllNatives(libraries: string, nativeFolder: string, javaLocation: string) {
    return new Promise(async (resolve, reject) => {
        const allLibs = libraries.split(";")
        for (const e of allLibs){
            console.log(e);
            await new Promise<void>((resolve) => {                
                cp.exec(javaLocation + " --list --file " + e, async (err, stdout, sdterr) => {
                    const filesOfLibrary = stdout.split("\r\n")
                    for (const n of filesOfLibrary){                        
                        if(n.endsWith(".dll")){
                            cp.exec(`${javaLocation} xf ${e} ${n}`, {cwd: nativeFolder});
                        }
                    }
                    resolve()
                })
            })
        }
        console.log("extracted fully");
        
        resolve("All natives are extracted")
    })
}