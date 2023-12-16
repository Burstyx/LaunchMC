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
exports.downloadAndGetJavaVersion = exports.JavaVersions = exports.parseRule = exports.minecraftLibraryList = exports.patchInstanceWithForge = exports.downloadMinecraft = void 0;
const HFileManagement_1 = require("../Utils/HFileManagement");
const original_fs_1 = require("original-fs");
const HManifests_1 = require("../Utils/HManifests");
const HDownload_1 = require("../Utils/HDownload");
const const_1 = require("../Utils/const");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const os_1 = __importDefault(require("os"));
const child_process_1 = __importDefault(require("child_process"));
const HForge_1 = require("../Utils/HForge");
const Utils_1 = require("../Utils/Utils");
function downloadMinecraft(version, instanceName) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            // Préparation
            //updateInstanceDlProgress(instanceId, 0)
            // Variables de tracking du dl
            let numberOfLibrariesToDownload = 0;
            let numberOfLibrariesDownloaded = 0;
            let numberOfAssetsToDownload = 0;
            let numberOfAssetsDownloaded = 0;
            let totalSizeToDl = 0; // TODO: Compute this to track dl efficiently
            let currentDownloadedSize = 0;
            // Téléchargement/Récupération des manifests nécessaire
            yield (0, HManifests_1.minecraftManifestForVersion)(version).then((versionDataManifest) => __awaiter(this, void 0, void 0, function* () {
                yield promises_1.default.mkdir(const_1.indexesPath, { recursive: true }).catch((err) => reject(err));
                yield (0, HDownload_1.downloadAsync)(versionDataManifest["assetIndex"]["url"], path_1.default.join(const_1.indexesPath, versionDataManifest["assetIndex"]["id"] + ".json"), (progress) => {
                    console.log(`Progression: ${progress}% du téléchargement du manifest des assets`);
                }, {
                    retry: {
                        count: 3,
                        timeout: 2500
                    },
                    hash: versionDataManifest["assetIndex"]["sha1"]
                }).catch((err) => reject(err));
                const indexDataManifest = JSON.parse((yield promises_1.default.readFile(path_1.default.join(const_1.indexesPath, versionDataManifest["assetIndex"]["id"] + ".json"))).toString("utf-8"));
                if (indexDataManifest == null)
                    return;
                // Initialisation du traking du dl
                numberOfLibrariesToDownload = versionDataManifest["libraries"].length;
                for (const e in indexDataManifest.objects) {
                    numberOfAssetsToDownload++;
                }
                // Calcul taille total
                // Calcul taille client + assets + libraries
                // client
                const clientSize = versionDataManifest["downloads"]["client"]["size"];
                const assetsSize = versionDataManifest["assetIndex"]["totalSize"];
                const librariesSize = minecraftLibraryTotalSize(versionDataManifest);
                totalSizeToDl = clientSize + assetsSize + librariesSize;
                // Téléchargement du client
                console.log("[INFO] Téléchargement du client");
                yield promises_1.default.mkdir(const_1.minecraftVersionPath, { recursive: true }).catch((err) => reject(err));
                yield (0, HDownload_1.downloadAsync)(versionDataManifest["downloads"]["client"]["url"], path_1.default.join(const_1.minecraftVersionPath, version, `${versionDataManifest.id}.jar`), (progress, byteSent) => {
                    console.log(`Progression: ${progress}% du téléchargement du client de jeu`);
                    currentDownloadedSize += byteSent;
                    //updateInstanceDlProgress(instanceId, (currentDownloadedSize * 100) / totalSizeToDl)
                }, {
                    retry: {
                        count: 3,
                        timeout: 2500
                    },
                    hash: versionDataManifest["downloads"]["client"]["sha1"]
                }).catch((err) => reject(err));
                // Téléchargement des librairies
                console.log("[INFO] Téléchargement des librairies");
                for (let i = 0; i < versionDataManifest.libraries.length; i++) {
                    yield downloadMinecraftLibrary(versionDataManifest, i).then((fetchedByte) => {
                        numberOfLibrariesDownloaded++;
                        console.log(`Progression: ${numberOfLibrariesDownloaded * 100 / numberOfLibrariesToDownload}% du téléchargement des libraries`);
                        currentDownloadedSize += fetchedByte;
                        //updateInstanceDlProgress(instanceId, (currentDownloadedSize * 100) / totalSizeToDl)
                    }).catch((err) => reject(err));
                }
                // Téléchargement des assets
                console.log("[INFO] Téléchargement des assets");
                for (const e in indexDataManifest["objects"]) {
                    console.log(`Progression: ${numberOfAssetsDownloaded * 100 / numberOfAssetsToDownload}`);
                    const hash = indexDataManifest["objects"][e]["hash"];
                    const subhash = hash.substring(0, 2);
                    yield promises_1.default.mkdir(path_1.default.join(const_1.objectPath, subhash), { recursive: true }).catch((err) => reject(err));
                    const fullPath = path_1.default.join(const_1.serversInstancesPath, instanceName, "resources", e);
                    const fileName = fullPath.split("\\").pop();
                    const dirPath = fullPath.substring(0, fullPath.indexOf(fileName));
                    yield promises_1.default.mkdir(dirPath, { recursive: true }).catch((err) => reject(err));
                    yield (0, HDownload_1.downloadAsync)(path_1.default.join(const_1.resourcePackage, subhash, hash), path_1.default.join(const_1.objectPath, subhash, hash), (progress, byteSend) => {
                        currentDownloadedSize += byteSend;
                        //updateInstanceDlProgress(instanceId, (currentDownloadedSize * 100) / totalSizeToDl)
                    }, {
                        retry: {
                            count: 3,
                            timeout: 2500
                        },
                        hash: hash
                    }).catch((err) => reject(err));
                    numberOfAssetsDownloaded++;
                }
                resolve();
            }));
        }));
    });
}
exports.downloadMinecraft = downloadMinecraft;
function patchInstanceWithForge(instanceId, mcVersion, forgeId) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            //await updateInstanceDlState(instanceId, InstanceState.Patching)
            yield downloadAndGetJavaVersion(JavaVersions.JDK17).then((java17Path) => __awaiter(this, void 0, void 0, function* () {
                // FIXME: Download forge installer, work only for all versions after 1.5.2
                yield (0, HForge_1.getForgeInstallerForVersion)(forgeId).then((forgeInstallerPath) => __awaiter(this, void 0, void 0, function* () {
                    yield (0, HForge_1.getForgeInstallProfileIfExist)(forgeId).then((forgeInstallProfileData) => __awaiter(this, void 0, void 0, function* () {
                        // Get all libraries to download
                        let libraries;
                        if (!forgeInstallProfileData["versionInfo"])
                            libraries = forgeInstallProfileData["libraries"];
                        else
                            libraries = forgeInstallProfileData["versionInfo"]["libraries"];
                        if (forgeInstallProfileData.json) {
                            yield (0, HForge_1.getForgeVersionIfExist)(forgeId).then((forgeVersionData) => {
                                libraries = libraries.concat(forgeVersionData["libraries"]);
                            }).catch((err) => reject(err));
                        }
                        // Skip forge extract and download it instead
                        let skipForgeExtract = false;
                        if (!forgeInstallProfileData["path"] && !forgeInstallProfileData["install"]["filePath"]) {
                            skipForgeExtract = true;
                        }
                        for (const library of libraries) {
                            console.log("Downloading: " + library["name"]);
                            let natives = "";
                            if (library["rules"]) {
                                if (!parseRule(library["rules"])) {
                                    console.log("Rule don't allow the download of this library, skipping.");
                                    continue;
                                }
                            }
                            if (library["natives"]) {
                                natives = library["natives"][(0, Utils_1.osToMCFormat)(process.platform)];
                            }
                            const libraryPath = ((0, HFileManagement_1.mavenToArray)(library.name, natives != "" ? `-${natives}` : undefined)).join("/");
                            if (library["downloads"]["artifact"]) {
                                const dlLink = library["downloads"]["artifact"]["url"];
                                const hash = library["downloads"]["artifact"]["sha1"];
                                const dlDest = library["downloads"]["artifact"]["path"];
                                // If not url as been assigned
                                if (dlLink == "") {
                                    const fileToFetch = "maven/" + library["downloads"]["artifact"]["path"];
                                    const destFile = `${const_1.librariesPath}/${library["downloads"]["artifact"]["path"]}`;
                                    yield (0, HFileManagement_1.extractSpecificFile)(forgeInstallerPath, fileToFetch, destFile).catch((err) => reject(err));
                                }
                                else {
                                    yield (0, HDownload_1.downloadAsync)(dlLink, path_1.default.join(const_1.librariesPath, dlDest), undefined, {
                                        retry: {
                                            count: 3,
                                            timeout: 2500
                                        },
                                        hash: hash
                                    }).catch((err) => reject(err));
                                }
                            }
                            else if (library["name"].includes("net.minecraftforge:forge:") || library["name"].includes("net.minecraftforge:minecraftforge:")) {
                                console.log("Skip " + library.name);
                            }
                            else if (library["url"]) {
                                const forgeBaseUrl = "https://maven.minecraftforge.net/";
                                yield (0, HDownload_1.downloadAsync)(`${forgeBaseUrl}${libraryPath}`, path_1.default.join(const_1.librariesPath, libraryPath), undefined, {
                                    retry: {
                                        count: 3,
                                        timeout: 2500
                                    },
                                    hash: library["url"].hasOwnProperty("checksums") ? library["url"]["checksums"][0] : undefined
                                }).catch((err) => reject(err));
                            }
                            else if (!library["url"]) {
                                yield (0, HDownload_1.downloadAsync)(`https://libraries.minecraft.net/${libraryPath}`, path_1.default.join(const_1.librariesPath, libraryPath)).catch((err) => reject(err));
                            }
                            else {
                                console.error("Case not handled or just it won't work");
                            }
                        }
                        if (!skipForgeExtract) {
                            const jarFilePathInInstaller = forgeInstallProfileData["path"] || (forgeInstallProfileData["install"] && forgeInstallProfileData["install"]["filePath"]);
                            const jarFileDestPath = (0, HFileManagement_1.mavenToArray)(forgeInstallProfileData["path"] || (forgeInstallProfileData["install"] && forgeInstallProfileData["install"]["path"]));
                            const forgeJarPathWithoutFile = jarFileDestPath.slice(0, jarFileDestPath.length - 1).join("/");
                            yield promises_1.default.mkdir(path_1.default.join(const_1.librariesPath, forgeJarPathWithoutFile), { recursive: true });
                            // Fetch the jar in the installer
                            if (forgeInstallProfileData["install"] && forgeInstallProfileData["install"]["filePath"]) {
                                yield (0, HFileManagement_1.extractSpecificFile)(forgeInstallerPath, jarFilePathInInstaller, path_1.default.join(const_1.librariesPath, jarFileDestPath.join("/"))).catch((err) => reject(err));
                            }
                            // Search for the jar in maven folder in the installer
                            else if (forgeInstallProfileData["path"]) {
                                yield (0, HFileManagement_1.extractSpecificFile)(forgeInstallerPath, path_1.default.join("maven", jarFileDestPath.join("/")), path_1.default.join(const_1.librariesPath, jarFileDestPath.join("/"))).catch((err) => reject(err));
                            }
                        }
                        if (forgeInstallProfileData["processors"].length > 0) {
                            console.log("Patching Forge");
                            const universalJarPath = forgeInstallProfileData["libraries"].find((lib) => lib.name.startsWith("net.minecraftforge:forge"))["downloads"]["artifact"]["path"];
                            // Getting client.lzma from installer
                            yield (0, HFileManagement_1.extractSpecificFile)(forgeInstallerPath, "data/client.lzma", path_1.default.join(const_1.librariesPath, forgeInstallProfileData["path"] ?
                                ((0, HFileManagement_1.mavenToArray)(forgeInstallProfileData["path"], "-universal-clientdata", "lzma")).join("/") :
                                universalJarPath.slice(0, -4) + "-clientdata.lzma"))
                                .catch((err) => reject(err));
                            const { processors } = forgeInstallProfileData;
                            for (const key in processors) {
                                const p = processors[key];
                                console.log("Patching with " + p["jar"]);
                                if (!p["sides"] || p["sides"].includes("client")) {
                                    const replaceDataArg = (arg) => {
                                        const finalArg = arg.replace("{", "").replace("}", "");
                                        if (forgeInstallProfileData["data"][finalArg]) {
                                            if (finalArg == "BINPATCH") {
                                                return path_1.default.join(const_1.librariesPath, universalJarPath || (0, HFileManagement_1.mavenToArray)(forgeInstallProfileData["path"]).join("/")).slice(0, -4) + "-clientdata.lzma";
                                            }
                                            let res = forgeInstallProfileData["data"][finalArg]["client"];
                                            return res;
                                        }
                                        return arg
                                            .replace("{SIDE}", "client")
                                            .replace("{ROOT}", `"${const_1.tempPath}"`)
                                            .replace("{MINECRAFT_JAR}", `"${path_1.default.join(const_1.minecraftVersionPath, forgeInstallProfileData["minecraft"], forgeInstallProfileData["minecraft"] + ".jar")}"`)
                                            .replace("{MINECRAFT_VERSION}", `"${path_1.default.join(const_1.minecraftVersionPath, forgeInstallProfileData["minecraft"], forgeInstallProfileData["minecraft"] + ".json")}"`)
                                            .replace("{INSTALLER}", `"${path_1.default.join(const_1.tempPath, forgeInstallProfileData["version"] + ".jar")}"`)
                                            .replace("{LIBRARY_DIR}", `"${const_1.librariesPath}"`);
                                    };
                                    const formatPath = (pathToFormat) => {
                                        if (pathToFormat.startsWith("[")) {
                                            pathToFormat = pathToFormat.replace("[", "").replace("]", "");
                                            pathToFormat = ((0, HFileManagement_1.mavenToArray)(pathToFormat)).join("/");
                                            return `"${path_1.default.join(const_1.librariesPath, pathToFormat)}"`;
                                        }
                                        return pathToFormat;
                                    };
                                    const jarPath = path_1.default.join(const_1.librariesPath, ...((0, HFileManagement_1.mavenToArray)(p["jar"])));
                                    const args = p.args.map((arg) => replaceDataArg(arg))
                                        .map((arg) => formatPath(arg));
                                    const classPaths = p["classpath"].map((cp) => `"${path_1.default.join(const_1.librariesPath, ...((0, HFileManagement_1.mavenToArray)(cp)))}"`);
                                    console.log(classPaths);
                                    yield (0, HFileManagement_1.readJarMetaInf)(jarPath, "Main-Class").then((mainClass) => __awaiter(this, void 0, void 0, function* () {
                                        yield new Promise((resolve, reject) => {
                                            const proc = child_process_1.default.spawn(`"${path_1.default.join(java17Path, "javaw")}"`, ['-classpath', [`"${jarPath}"`, ...classPaths].join(path_1.default.delimiter), mainClass, ...args], { shell: true });
                                            proc.stdout.on("data", data => console.log(data.toString()));
                                            proc.stderr.on("data", err => reject(err));
                                            proc.on("close", () => resolve());
                                        }).catch((err) => reject(err));
                                    })).catch((err) => reject(err));
                                }
                            }
                        }
                        resolve();
                    })).catch((err) => reject(err));
                })).catch((err) => reject(err));
            })).catch((err) => reject(err));
        }));
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
                    }, {
                        retry: {
                            count: 3,
                            timeout: 2500
                        },
                        hash: data["libraries"][i]["downloads"]["classifiers"][e]["url"]
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
            totalSize += data["libraries"][i]["downloads"]["artifact"]["size"];
        }
        if (data["libraries"][i]["downloads"].hasOwnProperty("classifiers")) {
            for (const e in data["libraries"][i]["downloads"]["classifiers"]) {
                if (e.includes("win") && os_1.default.platform() == "win32") {
                    totalSize += data.libraries[i]["downloads"]["classifiers"][e]["size"];
                }
                else if ((e.includes("mac") || e.includes("osx")) && os_1.default.platform() == "darwin") {
                    totalSize += data.libraries[i]["downloads"]["classifiers"][e]["size"];
                }
                else if (e.includes("linux") && os_1.default.platform() == "linux") {
                    totalSize += data.libraries[i]["downloads"]["classifiers"][e]["size"];
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
                condition = rules[i]["action"] == "allow";
            }
            else if (rules[i]["os"]["name"] == "osx" && os_1.default.platform() == "darwin") {
                condition = rules[i]["action"] == "allow";
            }
            else if (rules[i]["os"]["name"] == "linux" && os_1.default.platform() == "linux") {
                condition = rules[i]["action"] == "allow";
            }
        }
        else {
            condition = rules[i]["action"] == "allow";
        }
    }
    return condition;
}
exports.parseRule = parseRule;
/*function downloadLoggingXmlConfFile(data: any) {
    return new Promise(async (resolve, reject) => {

        console.log(data);

        if (!data.hasOwnProperty("logging")) {
            resolve("No logging key found, step passed.")
        }
        if (!existsSync(loggingConfPath)) {
            await fs.mkdir(loggingConfPath, { recursive: true })
        }

        await downloadAsync(data["logging"]["client"]["file"]["url"], path.join(loggingConfPath, data["logging"]["client"]["file"]["id"]), (progress: number) => {
            console.log(`Progression: ${progress}% du téléchargement`);
        })
        resolve("Log4j file downloaded")
    })
}*/
var JavaVersions;
(function (JavaVersions) {
    JavaVersions[JavaVersions["JDK8"] = 0] = "JDK8";
    JavaVersions[JavaVersions["JDK17"] = 1] = "JDK17";
})(JavaVersions = exports.JavaVersions || (exports.JavaVersions = {}));
function downloadAndGetJavaVersion(version) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield promises_1.default.mkdir(const_1.javaPath, { recursive: true }).catch((err) => reject(err));
            if (version == JavaVersions.JDK8) {
                if ((0, original_fs_1.existsSync)(path_1.default.join(const_1.javaPath, const_1.java8Version, const_1.java8Name, "bin"))) {
                    console.log("tesetA");
                    resolve(path_1.default.join(const_1.javaPath, const_1.java8Version, const_1.java8Name, "bin"));
                    console.log("tesetB");
                }
                else {
                    yield (0, HDownload_1.downloadAsync)(const_1.java8Url, path_1.default.join(const_1.javaPath, `${const_1.java8Version}.zip`), (progress) => {
                        console.log(`Progression: ${progress}% du téléchargement`);
                    }, { decompress: true }).catch((err) => reject(err));
                    resolve(path_1.default.join(const_1.javaPath, const_1.java8Version, const_1.java8Name, "bin"));
                }
            }
            else if (version == JavaVersions.JDK17) {
                if ((0, original_fs_1.existsSync)(path_1.default.join(const_1.javaPath, const_1.java17Version, const_1.java17Name, "bin"))) {
                    resolve(path_1.default.join(const_1.javaPath, const_1.java17Version, const_1.java17Name, "bin"));
                }
                else {
                    yield (0, HDownload_1.downloadAsync)(const_1.java17Url, path_1.default.join(const_1.javaPath, `${const_1.java17Version}.zip`), (progress) => {
                        console.log(`Progression: ${progress}% du téléchargement`);
                    }, { decompress: true }).catch((err) => reject(err));
                    resolve(path_1.default.join(const_1.javaPath, const_1.java17Version, const_1.java17Name, "bin"));
                }
            }
            reject(`${version} is not a valid Java version.`);
        }));
    });
}
exports.downloadAndGetJavaVersion = downloadAndGetJavaVersion;
