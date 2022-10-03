"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadVanillaVersion = void 0;
const { dataPath, indexesPath, minecraftJarPath } = require("../utils/const");
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
function downloadVanillaVersion(version, name) {
    console.log(version);
    fetch("https://piston-meta.mojang.com/mc/game/version_manifest.json").then((res) => {
        res.json().then((data) => {
            const versions = data["versions"];
            let numberOfLibrariesToDownload = 0;
            let numberOfLibrariesDownloaded = 0;
            // Verification of the game version
            for (let i = 0; i < data["versions"].length; i++) {
                if (data["versions"][i]["id"] == version) {
                    fetch(data["versions"][i]["url"]).then((res) => {
                        res.json().then((data) => {
                            for (let i = 0; i < data["libraries"].length; i++) {
                                numberOfLibrariesToDownload++;
                            }
                            // Download client
                            console.log("Downloading minecraft client");
                            if (!fs_1.default.existsSync(minecraftJarPath)) {
                                fs_1.default.mkdirSync(minecraftJarPath, { recursive: true });
                            }
                            const minecraftJarFile = fs_1.default.createWriteStream(minecraftJarPath + "/" + data["id"] + ".jar");
                            https_1.default.get(data["downloads"]["client"]["url"], (data) => {
                                data.pipe(minecraftJarFile);
                            });
                            console.log("Minecraft client downloaded");
                            // Download Libraries
                            console.log("Downloading minecraft libraries");
                            for (let i = 0; i < data["libraries"].length; i++) {
                                if (data["libraries"][i]["downloads"].hasOwnProperty("classifiers")) {
                                    for (let e in data["libraries"][i]["downloads"]["classifiers"]) {
                                        if (e.includes("windows") && os_1.default.platform() == "win32") {
                                            downloadClassifierMinecraftLibrary(data, e, i);
                                        }
                                        if (e.includes("osx") && os_1.default.platform() == "darwin") {
                                            downloadClassifierMinecraftLibrary(data, e, i);
                                        }
                                        if (e.includes("linux") && os_1.default.platform() == "linux") {
                                            downloadClassifierMinecraftLibrary(data, e, i);
                                        }
                                    }
                                }
                                else {
                                    downloadMinecraftLibrary(data, i);
                                }
                                numberOfLibrariesDownloaded++;
                                console.log(numberOfLibrariesDownloaded + "/" + numberOfLibrariesToDownload);
                            }
                            console.log("Minecraft libraries downloaded");
                            // Download indexes
                            console.log("Downloading minecraft index");
                            if (!fs_1.default.existsSync(indexesPath)) {
                                fs_1.default.mkdirSync(indexesPath, { recursive: true });
                            }
                            const indexFile = fs_1.default.createWriteStream(indexesPath + "/" + data["assetIndex"]["id"] + ".json");
                            https_1.default.get(data["assetIndex"]["url"], (data) => {
                                data.pipe(indexFile);
                            });
                            console.log("Minecraft index downloaded");
                        });
                    });
                }
            }
        });
    });
}
exports.downloadVanillaVersion = downloadVanillaVersion;
function downloadMinecraftLibrary(data, i) {
    const filePath = dataPath + '/libraries/' + data['libraries'][i]['downloads']['artifact']['path'];
    const fileName = filePath.split("/").pop();
    const dirPath = filePath.substring(0, filePath.indexOf(fileName));
    if (!fs_1.default.existsSync(dirPath)) {
        fs_1.default.mkdirSync(dirPath, { recursive: true });
    }
    const file = fs_1.default.createWriteStream(filePath);
    https_1.default.get(data["libraries"][i]["downloads"]["artifact"]["url"], (data) => {
        data.pipe(file);
    });
}
function downloadClassifierMinecraftLibrary(data, e, i) {
    const filePath = dataPath + '/libraries/' + data['libraries'][i]['downloads']['classifiers'][e]['path'];
    const fileName = filePath.split("/").pop();
    const dirPath = filePath.substring(0, filePath.indexOf(fileName));
    if (!fs_1.default.existsSync(dirPath)) {
        fs_1.default.mkdirSync(dirPath, { recursive: true });
    }
    const file = fs_1.default.createWriteStream(filePath);
    https_1.default.get(data["libraries"][i]["downloads"]["classifiers"][e]["url"], (data) => {
        data.pipe(file);
    });
}
