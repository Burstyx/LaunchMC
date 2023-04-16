"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMinecraft = void 0;
const HManifests_1 = require("../Helper/HManifests");
const child_process_1 = __importDefault(require("child_process"));
const path_1 = __importDefault(require("path"));
const const_1 = require("../Helper/const");
const promises_1 = __importDefault(require("fs/promises"));
const fs_1 = require("fs");
const minecraftDownloader_1 = require("./minecraftDownloader");
const HDirectoryManager_1 = require("../Helper/HDirectoryManager");
const instancesManager_1 = require("./instancesManager");
function startMinecraft(version, instanceId, opt, instanceDiv) {
    // TODO If map_to_ressource == true -> object dans legacy
    (0, HManifests_1.minecraftManifestForVersion)(version).then((data) => __awaiter(this, void 0, void 0, function* () {
        (0, instancesManager_1.makeInstanceLoading)(instanceId, instanceDiv);
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
        var mcArgs = data["minecraftArguments"];
        if (mcArgs == null) {
            mcArgs = "";
            for (let i = 0; i < data["arguments"]["game"].length; i++) {
                if (typeof data["arguments"]["game"][i] == "string") {
                    mcArgs += data["arguments"]["game"][i] + " ";
                }
            }
        }
        // Parse Minecraft arguments
        let tempSplitedArgs = mcArgs.split(" ");
        console.log(tempSplitedArgs);
        for (let i = 0; i < tempSplitedArgs.length; i++) {
            switch (tempSplitedArgs[i]) {
                case "${auth_player_name}":
                    tempSplitedArgs[i] = opt.username;
                    break;
                case "${version_name}":
                    tempSplitedArgs[i] = version;
                    break;
                case "${game_directory}":
                    tempSplitedArgs[i] = path_1.default.join(const_1.instancesPath, instanceId);
                    break;
                case "${assets_root}":
                    tempSplitedArgs[i] = const_1.assetsPath;
                    break;
                case "${assets_index_name}":
                    tempSplitedArgs[i] = JSON.parse((yield promises_1.default.readFile(path_1.default.join(const_1.instancesPath, instanceId, "info.json"), { encoding: "utf-8" })).toString())["assets_index_name"];
                    break;
                case "${auth_uuid}":
                    tempSplitedArgs[i] = opt.uuid;
                    break;
                case "${auth_access_token}":
                    tempSplitedArgs[i] = opt.accesstoken;
                    break;
                case "${user_properties}":
                    tempSplitedArgs[i] = opt.username;
                    break;
                case "${user_type}":
                    tempSplitedArgs[i] = "mojang";
                    break;
                case "${version_type}":
                    tempSplitedArgs[i] = opt.versiontype;
                    break;
                case "${game_assets}":
                    // if(!existsSync(legacyAssetsPath))
                    //     await fs.mkdir(legacyAssetsPath, {recursive: true})
                    tempSplitedArgs[i] = path_1.default.join(const_1.instancesPath, instanceId, "resources");
                    break;
                case "${auth_session}":
                    tempSplitedArgs[i] = "OFFLINE";
                    break;
                default:
                    break;
            }
        }
        mcArgs = tempSplitedArgs;
        console.log(mcArgs);
        // Set command arguments
        var jvmArgs = [];
        jvmArgs.push("-Xms2048M");
        jvmArgs.push("-Xmx4096M");
        jvmArgs.push("-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump");
        jvmArgs.push("-Djava.library.path=" + (yield (0, HDirectoryManager_1.makeDir)(path_1.default.join(const_1.instancesPath, instanceId, "natives"))));
        const libraries = yield getAllFile(const_1.librariesPath);
        // console.log(libraries);
        let librariesArg = JSON.parse(yield promises_1.default.readFile(path_1.default.join(const_1.instancesPath, instanceId, "info.json"), { encoding: "utf-8" }))["libraries"];
        jvmArgs.push(`-cp`);
        jvmArgs.push(`${librariesArg}${path_1.default.join(const_1.minecraftVersionPath, version, `${version}.jar`)}`);
        console.log(`${librariesArg}${path_1.default.join(const_1.minecraftVersionPath, version, `${version}.jar`)}`);
        jvmArgs.push(data["mainClass"]);
        const fullMcArgs = [...jvmArgs, ...mcArgs];
        console.log(fullMcArgs);
        // Find correct java executable
        if (!(0, fs_1.existsSync)(path_1.default.join(const_1.javaPath, const_1.java8Version))) {
            yield (0, minecraftDownloader_1.downloadJavaVersion)(minecraftDownloader_1.JavaVersions.JDK8);
        }
        if (!(0, fs_1.existsSync)(path_1.default.join(const_1.javaPath, const_1.java17Version))) {
            yield (0, minecraftDownloader_1.downloadJavaVersion)(minecraftDownloader_1.JavaVersions.JDK17);
        }
        const java8 = path_1.default.join(const_1.javaPath, const_1.java8Version, (yield promises_1.default.readdir(path_1.default.join(const_1.javaPath, const_1.java8Version))).at(0), "bin", "javaw");
        const java17 = path_1.default.join(const_1.javaPath, const_1.java17Version, (yield promises_1.default.readdir(path_1.default.join(const_1.javaPath, const_1.java17Version))).at(0), "bin", "javaw");
        console.log("Extracting natives");
        yield extractAllNatives(librariesArg, path_1.default.join(const_1.instancesPath, instanceId, "natives"), path_1.default.join(const_1.javaPath, const_1.java17Version, const_1.java17Version, "bin", "jar"));
        console.log("natives extracted");
        const javaVersion = data["javaVersion"]["majorVersion"];
        (0, instancesManager_1.makeInstanceNotLoading)(instanceId, instanceDiv);
        (0, instancesManager_1.makeInstancePlaying)(instanceId, instanceDiv);
        if (javaVersion >= 16) {
            console.log("Launching java 17");
            const proc = child_process_1.default.spawn(java17, fullMcArgs);
            proc.stdout.on("data", (data) => {
                console.log(data.toString("utf-8"));
            });
            proc.stderr.on("data", (data) => {
                console.error(data.toString("utf-8"));
            });
        }
        else {
            console.log("Launching java 8");
            const proc = child_process_1.default.spawn(java8, fullMcArgs);
            proc.stdout.on("data", (data) => {
                console.log(data.toString("utf-8"));
            });
            proc.stderr.on("data", (data) => {
                console.error(data.toString("utf-8"));
            });
        }
    }));
}
exports.startMinecraft = startMinecraft;
function getAllFile(pathDir) {
    return __awaiter(this, void 0, void 0, function* () {
        let files = [];
        const items = yield promises_1.default.readdir(pathDir, { withFileTypes: true });
        for (const item of items) {
            if (item.isDirectory()) {
                files = [
                    ...files,
                    ...(yield getAllFile(path_1.default.join(pathDir, item.name)))
                ];
            }
            else {
                files.push(path_1.default.join(pathDir, item.name));
            }
        }
        return files;
    });
}
function extractAllNatives(libraries, nativeFolder, javaLocation) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const allLibs = libraries.split(";");
            for (const e of allLibs) {
                console.log(e);
                yield new Promise((resolve) => {
                    child_process_1.default.exec(javaLocation + " --list --file " + e, (err, stdout, sdterr) => __awaiter(this, void 0, void 0, function* () {
                        const filesOfLibrary = stdout.split("\r\n");
                        for (const n of filesOfLibrary) {
                            if (n.endsWith(".dll")) {
                                child_process_1.default.exec(`${javaLocation} xf ${e} ${n}`, { cwd: nativeFolder });
                            }
                        }
                        resolve();
                    }));
                });
            }
            console.log("extracted fully");
            resolve("All natives are extracted");
        }));
    });
}
