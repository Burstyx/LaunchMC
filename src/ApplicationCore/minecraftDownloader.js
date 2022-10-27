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
const https_1 = __importDefault(require("https"));
const path_1 = __importDefault(require("path"));
const HManifests_1 = require("../Helper/HManifests");
const instancesManager_1 = require("./instancesManager");
const original_fs_1 = require("original-fs");
const Download_1 = require("../Helper/Download");
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
            const minecraftJarFile = (0, original_fs_1.createWriteStream)(path_1.default.join(const_1.minecraftVersionPath, version, data["id"] + ".jar"));
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
            var librariesArg = "";
            // Download Libraries
            console.log("Downloading minecraft libraries");
            for (let i = 0; i < data["libraries"].length; i++) {
                if (data["libraries"][i]["downloads"].hasOwnProperty("classifiers")) {
                    for (let e in data["libraries"][i]["downloads"]["classifiers"]) {
                        if (e.includes("windows") && os_1.default.platform() == "win32") {
                            yield downloadClassifierMinecraftLibrary(data, e, i);
                            librariesArg += path_1.default.join(const_1.librariesPath, data['libraries'][i]['downloads']['classifiers'][e]['path']) + ";";
                        }
                        if (e.includes("osx") && os_1.default.platform() == "darwin") {
                            yield downloadClassifierMinecraftLibrary(data, e, i);
                            librariesArg += path_1.default.join(const_1.librariesPath, data['libraries'][i]['downloads']['classifiers'][e]['path']) + ";";
                        }
                        if (e.includes("linux") && os_1.default.platform() == "linux") {
                            yield downloadClassifierMinecraftLibrary(data, e, i);
                            librariesArg += path_1.default.join(const_1.librariesPath, data['libraries'][i]['downloads']['classifiers'][e]['path']) + ";";
                        }
                    }
                }
                else {
                    yield downloadMinecraftLibrary(data, i);
                    librariesArg += path_1.default.join(const_1.librariesPath, data['libraries'][i]['downloads']['artifact']['path']) + ";";
                }
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
            const indexFile = (0, original_fs_1.createWriteStream)(path_1.default.join(const_1.indexesPath, data["assetIndex"]["id"] + ".json"));
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
            if (!(0, fs_1.existsSync)(const_1.objectPath)) {
                yield promises_1.default.mkdir(const_1.objectPath, { recursive: true });
            }
            const file = yield promises_1.default.readFile(path_1.default.join(const_1.indexesPath, data["assetIndex"]["id"] + ".json"), "utf-8");
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
                if (!(0, fs_1.existsSync)(path_1.default.join(const_1.objectPath, subhash))) {
                    yield promises_1.default.mkdir(path_1.default.join(const_1.objectPath, subhash));
                }
                const file = (0, original_fs_1.createWriteStream)(path_1.default.join(const_1.objectPath, subhash, hash));
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
            (0, instancesManager_1.makeInstanceDownloaded)(name, instanceDiv);
        });
    });
}
exports.downloadVanillaVersion = downloadVanillaVersion;
// Download Minecraft libraries
function downloadMinecraftLibrary(data, i) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        const filePath = path_1.default.join(const_1.librariesPath, data['libraries'][i]['downloads']['artifact']['path']);
        const fileName = filePath.split("\\").pop();
        const dirPath = filePath.substring(0, filePath.indexOf(fileName));
        // Create folder if dir does not exist
        if (!(0, fs_1.existsSync)(dirPath)) {
            yield promises_1.default.mkdir(dirPath, { recursive: true });
        }
        console.log(filePath);
        // Download the jar file
        const file = (0, original_fs_1.createWriteStream)(filePath);
        https_1.default.get(data["libraries"][i]["downloads"]["artifact"]["url"], (data) => {
            data.pipe(file);
            data.on("end", () => {
                resolve(data);
            });
            data.on("error", (err) => {
                reject(err);
            });
        });
    }));
}
// Download Minecraft libraries (classify by os version)
function downloadClassifierMinecraftLibrary(data, e, i) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        const filePath = path_1.default.join(const_1.librariesPath, data['libraries'][i]['downloads']['classifiers'][e]['path']);
        const fileName = filePath.split("\\").pop();
        const dirPath = filePath.substring(0, filePath.indexOf(fileName));
        // Create folder if dir does not exist
        if (!(0, fs_1.existsSync)(dirPath)) {
            yield promises_1.default.mkdir(dirPath, { recursive: true });
        }
        console.log(filePath);
        // Download the jar file
        const file = (0, original_fs_1.createWriteStream)(filePath);
        https_1.default.get(data["libraries"][i]["downloads"]["classifiers"][e]["url"], (data) => {
            data.pipe(file);
            data.on("end", () => {
                resolve(data);
            });
            data.on("error", (err) => {
                reject(err);
            });
        });
    }));
}
function downloadLoggingXmlConfFile(data) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        if (!data.hasOwnProperty("logging")) {
            resolve("No logging key found, step passed.");
        }
        if (!(0, fs_1.existsSync)(const_1.loggingConfPath)) {
            yield promises_1.default.mkdir(const_1.loggingConfPath, { recursive: true });
        }
        const file = (0, original_fs_1.createWriteStream)(path_1.default.join(const_1.loggingConfPath, data["logging"]["client"]["file"]["id"]));
        https_1.default.get(data["logging"]["client"]["file"]["url"], (data) => {
            data.pipe(file);
            data.on("end", () => {
                resolve(data);
            });
            data.on("error", (err) => {
                reject(err);
            });
        });
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
