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
exports.downloadVanillaVersion = void 0;
const const_1 = require("../utils/const");
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const path_1 = __importDefault(require("path"));
const getManifest_1 = require("./getManifest");
const startInstance_1 = require("./startInstance");
const instancesManager_1 = require("./instancesManager");
function downloadVanillaVersion(version, name, instanceDiv, imagePath) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(version);
        (0, getManifest_1.getVersionManifest)(version).then((data) => __awaiter(this, void 0, void 0, function* () {
            let numberOfLibrariesToDownload = 0;
            let numberOfLibrariesDownloaded = 0;
            // Verification of the game version 
            for (let i = 0; i < data["libraries"].length; i++) {
                numberOfLibrariesToDownload++;
            }
            // Download client
            console.log("Downloading minecraft client");
            if (!fs_1.default.existsSync(const_1.minecraftVersionPath)) {
                fs_1.default.mkdirSync(const_1.minecraftVersionPath, { recursive: true });
            }
            const minecraftJarFile = fs_1.default.createWriteStream(path_1.default.join(const_1.minecraftVersionPath, version, data["id"] + ".jar"));
            yield new Promise((resolve, reject) => {
                https_1.default.get(data["downloads"]["client"]["url"], (data) => {
                    data.pipe(minecraftJarFile);
                    data.on("end", () => {
                        resolve(data);
                    });
                    data.on("error", (err) => {
                        console.log(err);
                        reject(err);
                    });
                });
            });
            console.log("Minecraft client downloaded");
            // Download Libraries
            console.log("Downloading minecraft libraries");
            for (let i = 0; i < data["libraries"].length; i++) {
                if (data["libraries"][i]["downloads"].hasOwnProperty("classifiers")) {
                    for (let e in data["libraries"][i]["downloads"]["classifiers"]) {
                        if (e.includes("windows") && os_1.default.platform() == "win32") {
                            yield downloadClassifierMinecraftLibrary(data, e, i);
                        }
                        if (e.includes("osx") && os_1.default.platform() == "darwin") {
                            yield downloadClassifierMinecraftLibrary(data, e, i);
                        }
                        if (e.includes("linux") && os_1.default.platform() == "linux") {
                            yield downloadClassifierMinecraftLibrary(data, e, i);
                        }
                    }
                }
                else {
                    yield downloadMinecraftLibrary(data, i);
                }
                numberOfLibrariesDownloaded++;
                console.log(numberOfLibrariesDownloaded + "/" + numberOfLibrariesToDownload);
            }
            console.log("Minecraft libraries downloaded");
            // Download indexes
            console.log("Downloading minecraft index");
            if (!fs_1.default.existsSync(const_1.indexesPath)) {
                fs_1.default.mkdirSync(const_1.indexesPath, { recursive: true });
            }
            const indexFile = fs_1.default.createWriteStream(path_1.default.join(const_1.indexesPath, data["assetIndex"]["id"] + ".json"));
            yield new Promise((resolve, reject) => {
                https_1.default.get(data["assetIndex"]["url"], (data) => {
                    data.pipe(indexFile);
                    data.on("end", () => {
                        resolve(data);
                    });
                    data.on("error", (err) => {
                        reject(err);
                    });
                });
            });
            console.log("Minecraft index downloaded");
            // Download Logging configuration file
            yield downloadLoggingXmlConfFile(data);
            // Download objects
            console.log("Downloading minecraft assets");
            if (!fs_1.default.existsSync(const_1.objectPath)) {
                fs_1.default.mkdirSync(const_1.objectPath, { recursive: true });
            }
            const file = fs_1.default.readFileSync(path_1.default.join(const_1.indexesPath, data["assetIndex"]["id"] + ".json"), "utf-8");
            const indexesData = JSON.parse(file);
            var numberOfAssets = 0;
            var numberOfAssetsDownloaded = 0;
            for (const e in indexesData["objects"]) {
                numberOfAssets++;
            }
            for (const e in indexesData["objects"]) {
                console.log("status assets : " + numberOfAssetsDownloaded + "/" + numberOfAssets);
                const hash = indexesData["objects"][e]["hash"];
                const subhash = hash.substring(0, 2);
                if (!fs_1.default.existsSync(path_1.default.join(const_1.objectPath, subhash))) {
                    fs_1.default.mkdirSync(path_1.default.join(const_1.objectPath, subhash));
                }
                const file = fs_1.default.createWriteStream(path_1.default.join(const_1.objectPath, subhash, hash));
                // await new Promise((resolve, reject) => {
                //     https.get(path.join(resourcePackage, subhash, hash), (data) => {
                //         data.pipe(file)
                //         data.on("end", () => {
                //             numberOfAssetsDownloaded++
                //             resolve(data)
                //         })
                //         data.on("error", (err) => {
                //             reject(err)
                //         })
                //     })
                // })
                // let fetch = await import("node-fetch")
                // await fetch.default(path.join(resourcePackage, subhash, hash)).then((data) => {
                //     data.body?.pipe(file)
                // })
                yield fetch(path_1.default.join(const_1.resourcePackage, subhash, hash)).then((data) => __awaiter(this, void 0, void 0, function* () {
                    const arrayBuffer = yield data.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    file.write(buffer);
                }));
                numberOfAssetsDownloaded++;
            }
        })).then(() => {
            // Create related game folder
            fs_1.default.mkdirSync(const_1.instancesPath + "/" + name, { recursive: true });
            fs_1.default.writeFileSync(path_1.default.join(const_1.instancesPath, name, "info.json"), JSON.stringify({ "imagePath": imagePath, "version": version }));
            (0, instancesManager_1.getInstancesList)(instanceDiv);
            (0, startInstance_1.startMinecraft)(version);
        });
    });
}
exports.downloadVanillaVersion = downloadVanillaVersion;
// Download Minecraft libraries
function downloadMinecraftLibrary(data, i) {
    return new Promise((resolve, reject) => {
        const filePath = path_1.default.join(const_1.librariesPath, data['libraries'][i]['downloads']['artifact']['path']);
        const fileName = filePath.split("\\").pop();
        const dirPath = filePath.substring(0, filePath.indexOf(fileName));
        // Create folder if dir does not exist
        if (!fs_1.default.existsSync(dirPath)) {
            fs_1.default.mkdirSync(dirPath, { recursive: true });
        }
        console.log(filePath);
        // Download the jar file
        const file = fs_1.default.createWriteStream(filePath);
        https_1.default.get(data["libraries"][i]["downloads"]["artifact"]["url"], (data) => {
            data.pipe(file);
            data.on("end", () => {
                resolve(data);
            });
            data.on("error", (err) => {
                reject(err);
            });
        });
    });
}
// Download Minecraft libraries (classify by os version)
function downloadClassifierMinecraftLibrary(data, e, i) {
    return new Promise((resolve, reject) => {
        const filePath = path_1.default.join(const_1.librariesPath, data['libraries'][i]['downloads']['classifiers'][e]['path']);
        const fileName = filePath.split("\\").pop();
        const dirPath = filePath.substring(0, filePath.indexOf(fileName));
        // Create folder if dir does not exist
        if (!fs_1.default.existsSync(dirPath)) {
            fs_1.default.mkdirSync(dirPath, { recursive: true });
        }
        console.log(filePath);
        // Download the jar file
        const file = fs_1.default.createWriteStream(filePath);
        https_1.default.get(data["libraries"][i]["downloads"]["classifiers"][e]["url"], (data) => {
            data.pipe(file);
            data.on("end", () => {
                resolve(data);
            });
            data.on("error", (err) => {
                reject(err);
            });
        });
    });
}
function downloadLoggingXmlConfFile(data) {
    return new Promise((resolve, reject) => {
        if (!data.hasOwnProperty("logging")) {
            resolve("No logging key found, step passed.");
        }
        if (!fs_1.default.existsSync(const_1.loggingConfPath)) {
            fs_1.default.mkdirSync(const_1.loggingConfPath, { recursive: true });
        }
        const file = fs_1.default.createWriteStream(path_1.default.join(const_1.loggingConfPath, data["logging"]["client"]["file"]["id"]));
        https_1.default.get(data["logging"]["client"]["file"]["url"], (data) => {
            data.pipe(file);
            data.on("end", () => {
                resolve(data);
            });
            data.on("error", (err) => {
                reject(err);
            });
        });
    });
}
