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
exports.downloadJavaVersion = exports.JavaVersions = exports.downloadVanillaVersion = void 0;
const const_1 = require("../Helper/const");
const os_1 = __importDefault(require("os"));
const promises_1 = __importDefault(require("fs/promises"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const HManifests_1 = require("../Helper/HManifests");
const instancesManager_1 = require("./instancesManager");
const Download_1 = require("../Helper/Download");
const HDirectoryManager_1 = require("../Helper/HDirectoryManager");
function downloadVanillaVersion(version, name, instanceDiv, imagePath) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(version);
        // makeInstanceDownloading(name, instanceDiv)
        (0, HManifests_1.minecraftManifestForVersion)(version).then((data) => __awaiter(this, void 0, void 0, function* () {
            let numberOfLibrariesToDownload = 0;
            let numberOfLibrariesDownloaded = 0;
            // Create related game folder
            console.log(path_1.default.join(const_1.instancesPath, name));
            yield promises_1.default.mkdir(path_1.default.join(const_1.instancesPath, name), { recursive: true });
            yield promises_1.default.writeFile(path_1.default.join(const_1.instancesPath, name, "info.json"), JSON.stringify({ "imagePath": imagePath, "version": version, "name": name, "assets_index_name": data["assetIndex"]["id"] }));
            yield (0, instancesManager_1.getInstancesList)(instanceDiv);
            (0, instancesManager_1.makeInstanceDownloading)(name, instanceDiv);
            // Verification of the game version 
            for (let i = 0; i < data["libraries"].length; i++) {
                numberOfLibrariesToDownload++;
            }
            // Download client
            console.log("Downloading minecraft client");
            if (!(0, fs_1.existsSync)(const_1.minecraftVersionPath)) {
                yield promises_1.default.mkdir(const_1.minecraftVersionPath, { recursive: true });
            }
            yield (0, Download_1.downloadAsync)(data["downloads"]["client"]["url"], path_1.default.join(const_1.minecraftVersionPath, version, data["id"] + ".jar"));
            console.log("Minecraft client downloaded");
            var librariesArg = "";
            // Download Libraries
            console.log("Downloading minecraft libraries");
            for (let i = 0; i < data["libraries"].length; i++) {
                librariesArg += yield downloadMinecraftLibrary(data, i);
                numberOfLibrariesDownloaded++;
                console.log(numberOfLibrariesDownloaded + "/" + numberOfLibrariesToDownload);
            }
            yield promises_1.default.writeFile(path_1.default.join(const_1.instancesPath, name, "info.json"), JSON.stringify({ "imagePath": imagePath, "version": version, "name": name, "assets_index_name": data["assetIndex"]["id"], "libraries": librariesArg }));
            console.log("Minecraft libraries downloaded");
            // Download indexes
            console.log("Downloading minecraft index");
            if (!(0, fs_1.existsSync)(const_1.indexesPath)) {
                yield promises_1.default.mkdir(const_1.indexesPath, { recursive: true });
            }
            yield (0, Download_1.downloadAsync)(data["assetIndex"]["url"], path_1.default.join(const_1.indexesPath, data["assetIndex"]["id"] + ".json"));
            console.log("Minecraft index downloaded");
            // Download Logging configuration file
            yield downloadLoggingXmlConfFile(data);
            // Download assets
            console.log("Downloading minecraft assets");
            if (!(0, fs_1.existsSync)(const_1.objectPath)) {
                yield promises_1.default.mkdir(const_1.objectPath, { recursive: true });
            }
            const file = yield promises_1.default.readFile(path_1.default.join(const_1.indexesPath, data["assetIndex"]["id"] + ".json"), "utf-8");
            const indexesData = JSON.parse(file);
            if (indexesData["map_to_resources"]) {
                var numberOfAssets = 1;
                var numberOfAssetsDownloaded = 0;
                for (const e in indexesData["objects"]) {
                    numberOfAssets++;
                }
                yield (0, HDirectoryManager_1.makeDir)(path_1.default.join(path_1.default.join(const_1.instancesPath, name, "resources")));
                for (const e in indexesData["objects"]) {
                    console.log("status assets : " + numberOfAssetsDownloaded + "/" + numberOfAssets);
                    const hash = indexesData["objects"][e]["hash"];
                    const subhash = hash.substring(0, 2);
                    if (!(0, fs_1.existsSync)(path_1.default.join(const_1.objectPath, subhash))) {
                        yield promises_1.default.mkdir(path_1.default.join(const_1.objectPath, subhash));
                    }
                    const fullPath = path_1.default.join(path_1.default.join(const_1.instancesPath, name, "resources"), e);
                    const fileName = fullPath.split("\\").pop();
                    const dirPath = fullPath.substring(0, fullPath.indexOf(fileName));
                    yield (0, HDirectoryManager_1.makeDir)(dirPath);
                    const file = (0, fs_1.createWriteStream)(path_1.default.join(path_1.default.join(const_1.instancesPath, name, "resources"), e));
                    yield fetch(path_1.default.join(const_1.resourcePackage, subhash, hash)).then((data) => __awaiter(this, void 0, void 0, function* () {
                        const arrayBuffer = yield data.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);
                        file.write(buffer);
                    }));
                    numberOfAssetsDownloaded++;
                }
            }
            else {
                var numberOfAssets = 0;
                var numberOfAssetsDownloaded = 0;
                for (const e in indexesData["objects"]) {
                    numberOfAssets++;
                }
                for (const e in indexesData["objects"]) {
                    console.log("status assets : " + numberOfAssetsDownloaded + "/" + numberOfAssets);
                    const hash = indexesData["objects"][e]["hash"];
                    const subhash = hash.substring(0, 2);
                    if (!(0, fs_1.existsSync)(path_1.default.join(const_1.objectPath, subhash))) {
                        yield promises_1.default.mkdir(path_1.default.join(const_1.objectPath, subhash));
                    }
                    const file = (0, fs_1.createWriteStream)(path_1.default.join(const_1.objectPath, subhash, hash));
                    yield fetch(path_1.default.join(const_1.resourcePackage, subhash, hash)).then((data) => __awaiter(this, void 0, void 0, function* () {
                        const arrayBuffer = yield data.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);
                        file.write(buffer);
                    }));
                    numberOfAssetsDownloaded++;
                }
            }
        })).then(() => {
            (0, instancesManager_1.makeInstanceDownloaded)(name, instanceDiv);
        });
    });
}
exports.downloadVanillaVersion = downloadVanillaVersion;
// Download Minecraft libraries
function downloadMinecraftLibrary(data, i) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        var pieceOfLibraryArgs = "";
        if (data["libraries"][i].hasOwnProperty("rules")) {
            if (parseRule(data["libraries"][i]["rules"])) {
                if (data["libraries"][i]["downloads"].hasOwnProperty("artifact")) {
                    yield (0, Download_1.downloadAsync)(data["libraries"][i]["downloads"]["artifact"]["url"], path_1.default.join(const_1.librariesPath, data["libraries"][i]["downloads"]["artifact"]["path"]));
                    pieceOfLibraryArgs += path_1.default.join(const_1.librariesPath, data["libraries"][i]["downloads"]["artifact"]["path"]) + ";";
                }
                if (data["libraries"][i]["downloads"].hasOwnProperty("classifiers")) {
                    for (const e in data["libraries"][i]["downloads"]["classifiers"]) {
                        if (e.includes("win") && os_1.default.platform() == "win32") {
                            yield (0, Download_1.downloadAsync)(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path_1.default.join(const_1.librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]));
                            pieceOfLibraryArgs += path_1.default.join(const_1.librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]) + ";";
                        }
                        else if ((e.includes("mac") || e.includes("osx")) && os_1.default.platform() == "darwin") {
                            yield (0, Download_1.downloadAsync)(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path_1.default.join(const_1.librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]));
                            pieceOfLibraryArgs += path_1.default.join(const_1.librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]) + ";";
                        }
                        else if (e.includes("linux") && os_1.default.platform() == "linux") {
                            yield (0, Download_1.downloadAsync)(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path_1.default.join(const_1.librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]));
                            pieceOfLibraryArgs += path_1.default.join(const_1.librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]) + ";";
                        }
                    }
                }
            }
        }
        else {
            if (data["libraries"][i]["downloads"].hasOwnProperty("artifact")) {
                yield (0, Download_1.downloadAsync)(data["libraries"][i]["downloads"]["artifact"]["url"], path_1.default.join(const_1.librariesPath, data["libraries"][i]["downloads"]["artifact"]["path"]));
                pieceOfLibraryArgs += path_1.default.join(const_1.librariesPath, data["libraries"][i]["downloads"]["artifact"]["path"]) + ";";
            }
            if (data["libraries"][i]["downloads"].hasOwnProperty("classifiers")) {
                for (const e in data["libraries"][i]["downloads"]["classifiers"]) {
                    if (e.includes("win") && os_1.default.platform() == "win32") {
                        yield (0, Download_1.downloadAsync)(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path_1.default.join(const_1.librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]));
                        pieceOfLibraryArgs += path_1.default.join(const_1.librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]) + ";";
                    }
                    else if ((e.includes("mac") || e.includes("osx")) && os_1.default.platform() == "darwin") {
                        yield (0, Download_1.downloadAsync)(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path_1.default.join(const_1.librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]));
                        pieceOfLibraryArgs += path_1.default.join(const_1.librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]) + ";";
                    }
                    else if (e.includes("linux") && os_1.default.platform() == "linux") {
                        yield (0, Download_1.downloadAsync)(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path_1.default.join(const_1.librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]));
                        pieceOfLibraryArgs += path_1.default.join(const_1.librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]) + ";";
                    }
                }
            }
        }
        resolve(pieceOfLibraryArgs);
    }));
}
function parseRule(rules) {
    let condition = false;
    for (let i = 0; i < rules.length; i++) {
        if (rules[i].hasOwnProperty("os")) {
            if (rules[i]["os"]["name"] == "windows" && os_1.default.platform() == "win32") {
                if (rules[i]["action"] == "allow") {
                    condition = true;
                }
                else {
                    condition = false;
                }
            }
            else if (rules[i]["os"]["name"] == "osx" && os_1.default.platform() == "darwin") {
                if (rules[i]["action"] == "allow") {
                    condition = true;
                }
                else {
                    condition = false;
                }
            }
            else if (rules[i]["os"]["name"] == "linux" && os_1.default.platform() == "linux") {
                if (rules[i]["action"] == "allow") {
                    condition = true;
                }
                else {
                    condition = false;
                }
            }
        }
        else {
            if (rules[i]["action"] == "allow") {
                condition = true;
            }
            else {
                condition = false;
            }
        }
    }
    return condition;
}
// Download Minecraft libraries (classify by os version)
// function downloadClassifierMinecraftLibrary(data: any, e: string, i: number){
//     return new Promise(async (resolve, reject) => {
//         const filePath = path.join(librariesPath, data['libraries'][i]['downloads']['classifiers'][e]['path'])
//         const fileName = filePath.split("\\").pop()
//         const dirPath = filePath.substring(0, filePath.indexOf(fileName!))
//         // Create folder if dir does not exist
//         if(!existsSync(dirPath)){
//             await fs.mkdir(dirPath, {recursive: true})
//         }
//         console.log(filePath);
//         if(data["libraries"][i]["downloads"].hasOwnProperty("artifact")){
//             await downloadAsync(data["libraries"][i]["downloads"]["artifact"]["url"], path.join(librariesPath, data["libraries"][i]["downloads"]["artifact"]["path"]))
//         }
//         for(const e in data["libraries"][i]["downloads"]["classifiers"]){
//             if(e.includes("win")){
//                 await downloadAsync(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]))
//             }
//             else if(e.includes("mac") || e.includes("osx")){
//                 await downloadAsync(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]))
//             }
//             else if(e.includes("linux")){
//                 await downloadAsync(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path.join(librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]))
//             }
//         }
//     })
// }
function downloadLoggingXmlConfFile(data) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        console.log(data);
        if (!data.hasOwnProperty("logging")) {
            resolve("No logging key found, step passed.");
        }
        if (!(0, fs_1.existsSync)(const_1.loggingConfPath)) {
            yield promises_1.default.mkdir(const_1.loggingConfPath, { recursive: true });
        }
        yield (0, Download_1.downloadAsync)(data["logging"]["client"]["file"]["url"], path_1.default.join(const_1.loggingConfPath, data["logging"]["client"]["file"]["id"]));
        resolve("Log4j file downloaded");
    }));
}
var JavaVersions;
(function (JavaVersions) {
    JavaVersions[JavaVersions["JDK8"] = 0] = "JDK8";
    JavaVersions[JavaVersions["JDK17"] = 1] = "JDK17";
})(JavaVersions = exports.JavaVersions || (exports.JavaVersions = {}));
function downloadJavaVersion(version) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        if (!(0, fs_1.existsSync)(const_1.javaPath)) {
            yield promises_1.default.mkdir(const_1.javaPath);
        }
        if (version == JavaVersions.JDK8) {
            yield (0, Download_1.downloadAsync)("https://github.com/adoptium/temurin8-binaries/releases/download/jdk8u345-b01/OpenJDK8U-jdk_x64_windows_hotspot_8u345b01.zip", path_1.default.join(const_1.javaPath, `${const_1.java8Version}.zip`), { decompress: true });
            resolve("Java 8 downloaded");
        }
        if (version == JavaVersions.JDK17) {
            yield (0, Download_1.downloadAsync)("https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.5%2B8/OpenJDK17U-jdk_x64_windows_hotspot_17.0.5_8.zip", path_1.default.join(const_1.javaPath, `${const_1.java17Version}.zip`), { decompress: true });
            resolve("Java 17 downloaded");
        }
    }));
}
exports.downloadJavaVersion = downloadJavaVersion;
