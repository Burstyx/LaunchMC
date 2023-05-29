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
exports.downloadJavaVersion = exports.JavaVersions = exports.runTask = void 0;
const HFileManagement_1 = require("../Utils/HFileManagement");
const uuid_1 = require("uuid");
const original_fs_1 = require("original-fs");
const HManifests_1 = require("../Utils/HManifests");
const HDownload_1 = require("../Utils/HDownload");
const const_1 = require("../Utils/const");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const HInstance_1 = require("../Utils/HInstance");
const os_1 = __importDefault(require("os"));
function runTask(version, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        // Préparation
        console.log("[INFO] Préparation à la création d'une nouvelle instance");
        // Variables de tracking du dl
        let numberOfLibrariesToDownload = 0;
        let numberOfLibrariesDownloaded = 0;
        let numberOfAssetsToDownload = 0;
        let numberOfAssetsDownloaded = 0;
        // Téléchargement/Récupération des manifests nécessaire
        const versionDataManifest = yield (0, HManifests_1.minecraftManifestForVersion)(version);
        yield (0, HFileManagement_1.makeDir)(const_1.indexesPath);
        yield (0, HDownload_1.downloadAsync)(versionDataManifest["assetIndex"]["url"], path_1.default.join(const_1.indexesPath, versionDataManifest["assetIndex"]["id"] + ".json"), (progress) => {
            console.log(`Progression: ${progress}% du téléchargement du manifest des assets`);
        });
        const indexDataManifest = JSON.parse((yield promises_1.default.readFile(path_1.default.join(const_1.indexesPath, versionDataManifest["assetIndex"]["id"] + ".json"))).toString("utf-8"));
        if (indexDataManifest == null) {
            return;
        }
        const instanceId = (0, uuid_1.v4)();
        // Initialisation du traking du dl
        numberOfLibrariesToDownload = versionDataManifest.libraries.length;
        for (const e in indexDataManifest.objects) {
            numberOfAssetsToDownload++;
        }
        console.log("numberOfAssetsToDownload: " + numberOfAssetsToDownload);
        // Téléchargement du client
        console.log("[INFO] Téléchargement du client");
        yield (0, HFileManagement_1.makeDir)(const_1.minecraftVersionPath);
        yield (0, HDownload_1.downloadAsync)(versionDataManifest.downloads.client.url, path_1.default.join(const_1.minecraftVersionPath, version, `${versionDataManifest.id}.jar`), (progress) => {
            console.log(`Progression: ${progress}% du téléchargement du client de jeu`);
        });
        // Téléchargement des librairies
        console.log("[INFO] Téléchargement des librairies");
        let librariesArg = "";
        for (let i = 0; i < versionDataManifest.libraries.length; i++) {
            librariesArg += yield downloadMinecraftLibrary(versionDataManifest, i);
            numberOfLibrariesDownloaded++;
            console.log(`Progression: ${numberOfLibrariesDownloaded * 100 / numberOfLibrariesToDownload}% du téléchargement des libraries`);
        }
        // Téléchargement des assets
        console.log("[INFO] Téléchargement des assets");
        for (const e in indexDataManifest["objects"]) {
            console.log(`Progression: ${numberOfAssetsDownloaded * 100 / numberOfAssetsToDownload}`);
            const hash = indexDataManifest["objects"][e]["hash"];
            const subhash = hash.substring(0, 2);
            yield (0, HFileManagement_1.makeDir)(path_1.default.join(const_1.objectPath, subhash));
            const fullPath = path_1.default.join(const_1.instancesPath, instanceId, "resources", e);
            const fileName = fullPath.split("\\").pop();
            const dirPath = fullPath.substring(0, fullPath.indexOf(fileName));
            yield (0, HFileManagement_1.makeDir)(dirPath);
            yield (0, HDownload_1.downloadAsync)(path_1.default.join(const_1.resourcePackage, subhash, hash), fullPath, (progress) => {
                return;
            });
            // const file = createWriteStream(path.join(path.join(instancesPath, opts.name, "resources"), e))
            // await fetch(path.join(resourcePackage, subhash, hash)).then(async (data) => {
            //     const arrayBuffer = await data.arrayBuffer()
            //     const buffer = Buffer.from(arrayBuffer)
            //     file.write(buffer)
            // })
            numberOfAssetsDownloaded++;
        }
        // Création de l'instance
        yield (0, HInstance_1.createInstance)(opts.name, opts.imagePath, instanceId, version, versionDataManifest, librariesArg);
        // Créer le dossier et l'id
        // Mettre l'état de téléchargement
    });
}
exports.runTask = runTask;
// export async function downloadVanillaVersion(version: string, name: string, instanceDiv: HTMLElement, imagePath: string){
//     // updateInstanceState()
//     const versionDataManifest = await minecraftManifestForVersion(version)
//     let numberOfLibrariesToDownload = 0
//     let numberOfLibrariesDownloaded = 0
//     // Create related game folder
//     console.log(path.join(instancesPath, name));
//     const instanceId = v4()
//     // await getInstancesList(instanceDiv, instanceId);
//     updateInstanceState(name, InstanceState.Downloading)
//     // Verification of the game version 
//     for(let i = 0; i < data["libraries"].length; i++){
//         numberOfLibrariesToDownload++
//     }
//     // Download client
//     console.log("Downloading minecraft client");
//     if(!existsSync(minecraftVersionPath)){
//         await fs.mkdir(minecraftVersionPath, {recursive: true})
//     } 
//     //TODO Progression download for client jar
//     await downloadAsync(data["downloads"]["client"]["url"], path.join(minecraftVersionPath, version, data["id"] + ".jar"), (progress: number) => {
//         console.log(`Progression: ${progress}% du téléchargement du client`);
//     })
//     console.log("Minecraft client downloaded");
//     var librariesArg = ""
//     //TODO Progression download for Library
//     // Download Libraries
//     console.log("Downloading minecraft libraries");
//     for(let i = 0; i < data["libraries"].length; i++){
//         librariesArg += await downloadMinecraftLibrary(data, i)
//         numberOfLibrariesDownloaded++
//         console.log(`Progression: ${numberOfLibrariesDownloaded * 100 / numberOfLibrariesToDownload}% du téléchargement des libraries`);
//     }
//     await fs.writeFile(path.join(instancesPath, name, "info.json"), JSON.stringify({"imagePath": imagePath, "version": version, "name": name, "assets_index_name": data["assetIndex"]["id"], "libraries": librariesArg, "id": instanceId}))
//     console.log("Minecraft libraries downloaded");
//     // Download indexes
//     console.log("Downloading minecraft index");
//     if(!existsSync(indexesPath)){
//         await fs.mkdir(indexesPath, {recursive: true})
//     }
//     await downloadAsync(data["assetIndex"]["url"], path.join(indexesPath, data["assetIndex"]["id"] + ".json"), (progress: number) => {
//         console.log(`Progression: ${progress}% du téléchargement du manifest des assets`);
//     }) 
//     console.log("Minecraft index downloaded");
//     // Download Logging configuration file
//     await downloadLoggingXmlConfFile(data)
//     // Download assets
//     console.log("Downloading minecraft assets");
//     if(!existsSync(objectPath)){
//         await fs.mkdir(objectPath, {recursive: true})
//     }
//     const file = await fs.readFile(path.join(indexesPath, data["assetIndex"]["id"] + ".json"), "utf-8")
//     const indexesData = JSON.parse(file)
//     if(indexesData["map_to_resources"]){
//         var numberOfAssets = 1
//         var numberOfAssetsDownloaded = 0
//         for(const e in indexesData["objects"]){
//             numberOfAssets++
//         }
//         await makeDir(path.join(path.join(instancesPath, name, "resources")))
//         //TODO Progression download for assets
//         for(const e in indexesData["objects"]){
//             console.log(`Progression: ${numberOfAssetsDownloaded*100/numberOfAssets}`);
//             const hash = indexesData["objects"][e]["hash"]
//             const subhash = hash.substring(0, 2)
//             if(!existsSync(path.join(objectPath, subhash))){
//                 await fs.mkdir(path.join(objectPath, subhash))
//             }
//             const fullPath = path.join(path.join(instancesPath, name, "resources"), e)
//             const fileName = fullPath.split("\\").pop()
//             const dirPath  = fullPath.substring(0, fullPath.indexOf(fileName!))
//             await makeDir(dirPath)
//             const file = createWriteStream(path.join(path.join(instancesPath, name, "resources"), e))
//             await fetch(path.join(resourcePackage, subhash, hash)).then(async (data) => {
//                 const arrayBuffer = await data.arrayBuffer()
//                 const buffer = Buffer.from(arrayBuffer)
//                 file.write(buffer)
//             })
//             numberOfAssetsDownloaded++
//         }
//     }else{
//         var numberOfAssets = 0
//         var numberOfAssetsDownloaded = 0
//         for(const e in indexesData["objects"]){
//             numberOfAssets++
//         }
//         for(const e in indexesData["objects"]){
//             console.log(`Progression: ${numberOfAssetsDownloaded*100/numberOfAssets}`);
//             const hash = indexesData["objects"][e]["hash"]
//             const subhash = hash.substring(0, 2)
//             if(!existsSync(path.join(objectPath, subhash))){
//                 await fs.mkdir(path.join(objectPath, subhash))
//             }
//             const file = createWriteStream(path.join(objectPath, subhash, hash))
//             await fetch(path.join(resourcePackage, subhash, hash)).then(async (data) => {
//                 const arrayBuffer = await data.arrayBuffer()
//                 const buffer = Buffer.from(arrayBuffer)
//                 file.write(buffer)
//             })
//             numberOfAssetsDownloaded++
//         }
//     }
// }
// Download Minecraft libraries
function downloadMinecraftLibrary(data, i) {
    return __awaiter(this, void 0, void 0, function* () {
        var library = "";
        if (data["libraries"][i].hasOwnProperty("rules")) {
            if (!parseRule(data["libraries"][i]["rules"])) {
                return "";
            }
        }
        if (data["libraries"][i]["downloads"].hasOwnProperty("artifact")) {
            yield (0, HDownload_1.downloadAsync)(data["libraries"][i]["downloads"]["artifact"]["url"], path_1.default.join(const_1.librariesPath, data["libraries"][i]["downloads"]["artifact"]["path"]), (progress) => {
                console.log(`Progression: ${progress}% du téléchargement`);
            });
            library = path_1.default.join(const_1.librariesPath, data["libraries"][i]["downloads"]["artifact"]["path"]) + ";";
        }
        if (data["libraries"][i]["downloads"].hasOwnProperty("classifiers")) {
            for (const e in data["libraries"][i]["downloads"]["classifiers"]) {
                if (e.includes("win") && os_1.default.platform() == "win32") {
                    yield (0, HDownload_1.downloadAsync)(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path_1.default.join(const_1.librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]), (progress) => {
                        console.log(`Progression: ${progress}% du téléchargement`);
                    });
                }
                else if ((e.includes("mac") || e.includes("osx")) && os_1.default.platform() == "darwin") {
                    yield (0, HDownload_1.downloadAsync)(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path_1.default.join(const_1.librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]), (progress) => {
                        console.log(`Progression: ${progress}% du téléchargement`);
                    });
                }
                else if (e.includes("linux") && os_1.default.platform() == "linux") {
                    yield (0, HDownload_1.downloadAsync)(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path_1.default.join(const_1.librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]), (progress) => {
                        console.log(`Progression: ${progress}% du téléchargement`);
                    });
                }
                library = path_1.default.join(const_1.librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]) + ";";
            }
        }
        return library;
    });
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
        if (!(0, original_fs_1.existsSync)(const_1.loggingConfPath)) {
            yield promises_1.default.mkdir(const_1.loggingConfPath, { recursive: true });
        }
        yield (0, HDownload_1.downloadAsync)(data["logging"]["client"]["file"]["url"], path_1.default.join(const_1.loggingConfPath, data["logging"]["client"]["file"]["id"]), (progress) => {
            console.log(`Progression: ${progress}% du téléchargement`);
        });
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
        if (!(0, original_fs_1.existsSync)(const_1.javaPath)) {
            yield promises_1.default.mkdir(const_1.javaPath);
        }
        if (version == JavaVersions.JDK8) {
            yield (0, HDownload_1.downloadAsync)("https://builds.openlogic.com/downloadJDK/openlogic-openjdk-jre/8u362-b09/openlogic-openjdk-jre-8u362-b09-windows-x64.zip", path_1.default.join(const_1.javaPath, `${const_1.java8Version}.zip`), (progress) => {
                console.log(`Progression: ${progress}% du téléchargement`);
            }, { decompress: true });
            resolve("Java 8 downloaded");
        }
        if (version == JavaVersions.JDK17) {
            yield (0, HDownload_1.downloadAsync)("https://builds.openlogic.com/downloadJDK/openlogic-openjdk-jre/17.0.6+10/openlogic-openjdk-jre-17.0.6+10-windows-x64.zip", path_1.default.join(const_1.javaPath, `${const_1.java17Version}.zip`), (progress) => {
                console.log(`Progression: ${progress}% du téléchargement`);
            }, { decompress: true });
            resolve("Java 17 downloaded");
        }
    }));
}
exports.downloadJavaVersion = downloadJavaVersion;
