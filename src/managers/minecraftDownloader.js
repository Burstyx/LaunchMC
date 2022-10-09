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
const { dataPath, indexesPath, minecraftJarPath } = require("../utils/const");
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const getMinecraftVersionManifest_1 = require("./getMinecraftVersionManifest");
const startInstance_1 = require("./startInstance");
function downloadVanillaVersion(version, name) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(version);
        (0, getMinecraftVersionManifest_1.getVersionManifest)(version).then((data) => {
            let numberOfLibrariesToDownload = 0;
            let numberOfLibrariesDownloaded = 0;
            // Verification of the game version
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
        (0, startInstance_1.startMinecraft)(version);
    });
}
exports.downloadVanillaVersion = downloadVanillaVersion;
// Download Minecraft libraries
function downloadMinecraftLibrary(data, i) {
    const filePath = dataPath + '/libraries/' + data['libraries'][i]['downloads']['artifact']['path'];
    const fileName = filePath.split("/").pop();
    const dirPath = filePath.substring(0, filePath.indexOf(fileName));
    // Create folder if dir does not exist
    if (!fs_1.default.existsSync(dirPath)) {
        fs_1.default.mkdirSync(dirPath, { recursive: true });
    }
    // Download the jar file
    const file = fs_1.default.createWriteStream(filePath);
    https_1.default.get(data["libraries"][i]["downloads"]["artifact"]["url"], (data) => {
        data.pipe(file);
    });
}
// Download Minecraft libraries (classify by os version)
function downloadClassifierMinecraftLibrary(data, e, i) {
    const filePath = dataPath + '/libraries/' + data['libraries'][i]['downloads']['classifiers'][e]['path'];
    const fileName = filePath.split("/").pop();
    const dirPath = filePath.substring(0, filePath.indexOf(fileName));
    // Create folder if dir does not exist
    if (!fs_1.default.existsSync(dirPath)) {
        fs_1.default.mkdirSync(dirPath, { recursive: true });
    }
    // Download the jar file
    const file = fs_1.default.createWriteStream(filePath);
    https_1.default.get(data["libraries"][i]["downloads"]["classifiers"][e]["url"], (data) => {
        data.pipe(file);
    });
}
