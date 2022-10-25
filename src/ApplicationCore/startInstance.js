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
const path_1 = __importDefault(require("path"));
const const_1 = require("../Helper/const");
const promises_1 = __importDefault(require("fs/promises"));
function startMinecraft(version, instanceId, opt) {
    (0, HManifests_1.minecraftManifestForVersion)(version).then((data) => __awaiter(this, void 0, void 0, function* () {
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
        var jvmArgs = "";
        jvmArgs += "-Xms2048M ";
        jvmArgs += "-Xmx4096M ";
        jvmArgs += "-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump ";
        jvmArgs += "-Djava.library.path=" + const_1.librariesPath + " ";
        jvmArgs += "-Dorg.lwjgl.librarypath=" + const_1.librariesPath + " ";
        jvmArgs += "-cp ";
        var librariesStringForArg = "";
        const libraries = yield getAllFile(const_1.librariesPath);
        console.log(libraries);
        const librariesArg = yield buildLibrariesArgument(libraries);
        console.log(librariesArg);
        // Build command string
        // var command: string = `C:\\Users\\tonib\\Downloads\\OpenJDK8U-jdk_x64_windows_hotspot_8u345b01\\jdk8u345-b01\\bin\\java`
        // for(var e in mcArgs){
        //     command += ` `
        //     command += mcArgs[e]
        // }
        // console.log(command);
    }));
}
exports.startMinecraft = startMinecraft;
function getAllFile(pathDir) {
    return __awaiter(this, void 0, void 0, function* () {
        let files = [];
        const items = yield promises_1.default.readdir(pathDir, { withFileTypes: true });
        for (const item of items) {
            console.log(item);
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
function buildLibrariesArgument(listOfLibraries) {
    return __awaiter(this, void 0, void 0, function* () {
        let final = "";
        for (let i = 0; i < listOfLibraries.length; i++) {
            if (i == listOfLibraries.length - 1) {
                final += listOfLibraries[i];
            }
            else {
                final += listOfLibraries[i] + ";";
            }
        }
        return final;
    });
}
function parseRule(rule) {
}
