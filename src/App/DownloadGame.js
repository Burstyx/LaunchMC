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
exports.downloadJavaVersion = exports.JavaVersions = exports.minecraftLibraryList = exports.patchInstanceWithForge = exports.downloadMinecraft = void 0;
const HFileManagement_1 = require("../Utils/HFileManagement");
const original_fs_1 = require("original-fs");
const HManifests_1 = require("../Utils/HManifests");
const HDownload_1 = require("../Utils/HDownload");
const const_1 = require("../Utils/const");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const os_1 = __importDefault(require("os"));
const HInstance_1 = require("../Utils/HInstance");
function downloadMinecraft(version, instanceId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Préparation
        console.log("[INFO] Preparing to the download");
        yield (0, HInstance_1.updateInstanceDlState)(instanceId, HInstance_1.InstanceState.Loading);
        (0, HInstance_1.updateInstanceDlProgress)(instanceId, 0);
        // Variables de tracking du dl
        let numberOfLibrariesToDownload = 0;
        let numberOfLibrariesDownloaded = 0;
        let numberOfAssetsToDownload = 0;
        let numberOfAssetsDownloaded = 0;
        let totalSizeToDl = 0; // TODO: Compute this to track dl efficiently
        let currentDownloadedSize = 0;
        // Téléchargement/Récupération des manifests nécessaire
        const versionDataManifest = yield (0, HManifests_1.minecraftManifestForVersion)(version);
        console.log(versionDataManifest["assetIndex"]["url"]);
        console.log(path_1.default.join(const_1.indexesPath, versionDataManifest["assetIndex"]["id"] + ".json"));
        yield (0, HFileManagement_1.makeDir)(const_1.indexesPath);
        yield (0, HDownload_1.downloadAsync)(versionDataManifest["assetIndex"]["url"], path_1.default.join(const_1.indexesPath, versionDataManifest["assetIndex"]["id"] + ".json"), (progress) => {
            console.log(`Progression: ${progress}% du téléchargement du manifest des assets`);
            console.log("ASSETS DOWNLOADED");
        });
        const indexDataManifest = JSON.parse((yield promises_1.default.readFile(path_1.default.join(const_1.indexesPath, versionDataManifest["assetIndex"]["id"] + ".json"))).toString("utf-8"));
        if (indexDataManifest == null) {
            return;
        }
        // Initialisation du traking du dl
        numberOfLibrariesToDownload = versionDataManifest.libraries.length;
        for (const e in indexDataManifest.objects) {
            numberOfAssetsToDownload++;
        }
        console.log("numberOfAssetsToDownload: " + numberOfAssetsToDownload);
        // Calcul taille total
        // Calcul taille client + assets + libraries
        // client
        const clientSize = versionDataManifest.downloads.client.size;
        const assetsSize = versionDataManifest.assetIndex.totalSize;
        const librariesSize = minecraftLibraryTotalSize(versionDataManifest);
        totalSizeToDl = clientSize + assetsSize + librariesSize;
        // Téléchargement du client
        yield (0, HInstance_1.updateInstanceDlState)(instanceId, HInstance_1.InstanceState.Downloading);
        console.log("[INFO] Téléchargement du client");
        yield (0, HFileManagement_1.makeDir)(const_1.minecraftVersionPath);
        yield (0, HDownload_1.downloadAsync)(versionDataManifest.downloads.client.url, path_1.default.join(const_1.minecraftVersionPath, version, `${versionDataManifest.id}.jar`), (progress, byteSent) => {
            console.log(`Progression: ${progress}% du téléchargement du client de jeu`);
            currentDownloadedSize += byteSent;
            (0, HInstance_1.updateInstanceDlProgress)(instanceId, (currentDownloadedSize * 100) / totalSizeToDl);
        });
        // Téléchargement des librairies
        console.log("[INFO] Téléchargement des librairies");
        let librariesArg = "";
        for (let i = 0; i < versionDataManifest.libraries.length; i++) {
            const fetchedByte = yield downloadMinecraftLibrary(versionDataManifest, i);
            numberOfLibrariesDownloaded++;
            console.log(`Progression: ${numberOfLibrariesDownloaded * 100 / numberOfLibrariesToDownload}% du téléchargement des libraries`);
            currentDownloadedSize += fetchedByte;
            (0, HInstance_1.updateInstanceDlProgress)(instanceId, (currentDownloadedSize * 100) / totalSizeToDl);
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
            yield (0, HDownload_1.downloadAsync)(path_1.default.join(const_1.resourcePackage, subhash, hash), path_1.default.join(const_1.objectPath, subhash, hash), (progress, byteSend) => {
                currentDownloadedSize += byteSend;
                (0, HInstance_1.updateInstanceDlProgress)(instanceId, (currentDownloadedSize * 100) / totalSizeToDl);
            });
            numberOfAssetsDownloaded++;
        }
        yield (0, HInstance_1.updateInstanceDlState)(instanceId, HInstance_1.InstanceState.Playable);
    });
}
exports.downloadMinecraft = downloadMinecraft;
function patchInstanceWithForge(instanceId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Télécharger l'installer forge
        // Décompresser installer
        // Télécharger les librairies
        // Changer type de l'instance pour utiliser les bons arguments
    });
}
exports.patchInstanceWithForge = patchInstanceWithForge;
// Download Minecraft libraries
function downloadMinecraftLibrary(data, i) {
    return __awaiter(this, void 0, void 0, function* () {
        var fetchedByte = 0;
        if (data["libraries"][i].hasOwnProperty("rules")) {
            if (!parseRule(data["libraries"][i]["rules"])) {
                return 0;
            }
        }
        if (data["libraries"][i]["downloads"].hasOwnProperty("artifact")) {
            yield (0, HDownload_1.downloadAsync)(data["libraries"][i]["downloads"]["artifact"]["url"], path_1.default.join(const_1.librariesPath, data["libraries"][i]["downloads"]["artifact"]["path"]), (progress, byteSent) => {
                console.log(`Progression: ${progress}% du téléchargement`);
                fetchedByte += byteSent;
            });
        }
        if (data["libraries"][i]["downloads"].hasOwnProperty("classifiers")) {
            for (const e in data["libraries"][i]["downloads"]["classifiers"]) {
                if (e.includes("win") && os_1.default.platform() == "win32") {
                    yield (0, HDownload_1.downloadAsync)(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path_1.default.join(const_1.librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]), (progress, byteSent) => {
                        console.log(`Progression: ${progress}% du téléchargement`);
                        fetchedByte += byteSent;
                    });
                }
                else if ((e.includes("mac") || e.includes("osx")) && os_1.default.platform() == "darwin") {
                    yield (0, HDownload_1.downloadAsync)(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path_1.default.join(const_1.librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]), (progress, byteSent) => {
                        console.log(`Progression: ${progress}% du téléchargement`);
                        fetchedByte += byteSent;
                    });
                }
                else if (e.includes("linux") && os_1.default.platform() == "linux") {
                    yield (0, HDownload_1.downloadAsync)(data["libraries"][i]["downloads"]["classifiers"][e]["url"], path_1.default.join(const_1.librariesPath, data["libraries"][i]["downloads"]["classifiers"][e]["path"]), (progress, byteSent) => {
                        console.log(`Progression: ${progress}% du téléchargement`);
                        fetchedByte += byteSent;
                    });
                }
            }
        }
        return fetchedByte;
    });
}
function minecraftLibraryTotalSize(data) {
    let totalSize = 0;
    for (let i = 0; i < data.libraries.length; i++) {
        if (data["libraries"][i].hasOwnProperty("rules")) {
            if (!parseRule(data["libraries"][i]["rules"])) {
                continue;
            }
        }
        if (data["libraries"][i]["downloads"].hasOwnProperty("artifact")) {
            totalSize += data.libraries[i].downloads.artifact.size;
        }
        if (data["libraries"][i]["downloads"].hasOwnProperty("classifiers")) {
            for (const e in data["libraries"][i]["downloads"]["classifiers"]) {
                if (e.includes("win") && os_1.default.platform() == "win32") {
                    totalSize += data.libraries[i].downloads.classifiers[e].size;
                }
                else if ((e.includes("mac") || e.includes("osx")) && os_1.default.platform() == "darwin") {
                    totalSize += data.libraries[i].downloads.classifiers[e].size;
                }
                else if (e.includes("linux") && os_1.default.platform() == "linux") {
                    totalSize += data.libraries[i].downloads.classifiers[e].size;
                }
            }
        }
    }
    return totalSize;
}
function minecraftLibraryList(data) {
    let libraryList = [];
    for (let i = 0; i < data.libraries.length; i++) {
        if (data["libraries"][i].hasOwnProperty("rules")) {
            if (!parseRule(data["libraries"][i]["rules"])) {
                continue;
            }
        }
        if (data["libraries"][i]["downloads"].hasOwnProperty("artifact")) {
            libraryList.push(path_1.default.join(const_1.librariesPath, data.libraries[i].downloads.artifact.path));
        }
        if (data["libraries"][i]["downloads"].hasOwnProperty("classifiers")) {
            for (const e in data["libraries"][i]["downloads"]["classifiers"]) {
                if (e.includes("win") && os_1.default.platform() == "win32") {
                    libraryList.push(path_1.default.join(const_1.librariesPath, data.libraries[i].downloads.classifiers[e].path));
                }
                else if ((e.includes("mac") || e.includes("osx")) && os_1.default.platform() == "darwin") {
                    libraryList.push(path_1.default.join(const_1.librariesPath, data.libraries[i].downloads.classifiers[e].path));
                }
                else if (e.includes("linux") && os_1.default.platform() == "linux") {
                    libraryList.push(path_1.default.join(const_1.librariesPath, data.libraries[i].downloads.classifiers[e].path));
                }
            }
        }
    }
    return libraryList;
}
exports.minecraftLibraryList = minecraftLibraryList;
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
    return __awaiter(this, void 0, void 0, function* () {
        if (!(0, original_fs_1.existsSync)(const_1.javaPath)) {
            yield promises_1.default.mkdir(const_1.javaPath);
        }
        if (version == JavaVersions.JDK8) {
            yield (0, HDownload_1.downloadAsync)(const_1.java8Url, path_1.default.join(const_1.javaPath, `${const_1.java8Version}.zip`), (progress) => {
                console.log(`Progression: ${progress}% du téléchargement`);
            }, { decompress: true });
            return;
        }
        if (version == JavaVersions.JDK17) {
            yield (0, HDownload_1.downloadAsync)(const_1.java17Url, path_1.default.join(const_1.javaPath, `${const_1.java17Version}.zip`), (progress) => {
                console.log(`Progression: ${progress}% du téléchargement`);
            }, { decompress: true });
            return;
        }
    });
}
exports.downloadJavaVersion = downloadJavaVersion;
