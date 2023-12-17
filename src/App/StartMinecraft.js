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
exports.extractAllNatives = exports.killGame = exports.startMinecraft = void 0;
const HManifests_1 = require("../Utils/HManifests");
const child_process_1 = __importDefault(require("child_process"));
const path_1 = __importDefault(require("path"));
const const_1 = require("../Utils/const");
const DownloadGame_1 = require("./DownloadGame");
const HFileManagement_1 = require("../Utils/HFileManagement");
const DiscordRPC_1 = require("./DiscordRPC");
const HForge_1 = require("../Utils/HForge");
const Utils_1 = require("../Utils/Utils");
const semver_1 = __importDefault(require("semver"));
const promises_1 = __importDefault(require("fs/promises"));
let mcProc = {};
let logs = {};
function startMinecraft(name, mcOpts, forgeId) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield (0, HManifests_1.minecraftManifestForVersion)(mcOpts.version).then((mcData) => __awaiter(this, void 0, void 0, function* () {
                const isForgeVersion = forgeId != undefined;
                let forgeData = null;
                if (isForgeVersion) {
                    yield (0, HForge_1.getForgeVersionIfExist)(forgeId).then((data) => {
                        forgeData = data;
                    }).catch((err) => reject(err));
                }
                let mcArgs = mcData["minecraftArguments"];
                if (mcArgs == null) {
                    mcArgs = "";
                    for (let i = 0; i < mcData["arguments"]["game"].length; i++) {
                        if (typeof mcData["arguments"]["game"][i] == "string") {
                            mcArgs += mcData["arguments"]["game"][i] + " ";
                        }
                    }
                }
                let forgeReplaceMcArgs = false;
                let forgeGameArgs;
                let forgeJvmArgs;
                if (forgeData != undefined) {
                    if (forgeData["arguments"]) {
                        forgeGameArgs = forgeData["arguments"]["game"];
                        forgeJvmArgs = forgeData["arguments"]["jvm"];
                    }
                    else if (forgeData["minecraftArguments"]) {
                        forgeReplaceMcArgs = true;
                        forgeGameArgs = forgeData["minecraftArguments"].split(" ");
                    }
                    else if (forgeData["versionInfo"]["minecraftArguments"]) {
                        forgeReplaceMcArgs = true;
                        forgeGameArgs = forgeData["versionInfo"]["minecraftArguments"].split(" ");
                    }
                }
                let parsedMcArgs = forgeReplaceMcArgs ? forgeGameArgs : mcArgs.split(" ");
                for (let i = 0; i < parsedMcArgs.length; i++) {
                    switch (parsedMcArgs[i]) {
                        case "${auth_player_name}":
                            parsedMcArgs[i] = mcOpts.username;
                            break;
                        case "${version_name}":
                            parsedMcArgs[i] = mcOpts.version;
                            break;
                        case "${game_directory}":
                            parsedMcArgs[i] = path_1.default.join(const_1.serversInstancesPath, name);
                            break;
                        case "${assets_root}":
                            parsedMcArgs[i] = const_1.assetsPath;
                            break;
                        case "${assets_index_name}":
                            parsedMcArgs[i] = mcData["assets"];
                            break;
                        case "${auth_uuid}":
                            parsedMcArgs[i] = mcOpts.uuid;
                            break;
                        case "${auth_access_token}":
                            parsedMcArgs[i] = mcOpts.accessToken;
                            break;
                        case "${user_properties}":
                            parsedMcArgs[i] = "{}";
                            break;
                        case "${user_type}":
                            parsedMcArgs[i] = "msa";
                            break;
                        case "${version_type}":
                            parsedMcArgs[i] = "custom";
                            break;
                        case "${game_assets}":
                            // if(!existsSync(legacyAssetsPath))
                            //     await fs.mkdir(legacyAssetsPath, {recursive: true}) // TODO: Assets don't work for pre-1.6 version
                            parsedMcArgs[i] = path_1.default.join(const_1.serversInstancesPath, name, "resources");
                            break;
                        case "${auth_session}":
                            parsedMcArgs[i] = "OFFLINE";
                            break;
                        default:
                            break;
                    }
                }
                mcArgs = parsedMcArgs;
                let parsedForgeGameArgsArray;
                let parsedForgeJvmArgsArray;
                if (forgeJvmArgs != undefined) {
                    parsedForgeJvmArgsArray = forgeJvmArgs;
                    for (let i = 0; i < parsedForgeJvmArgsArray.length; i++) {
                        parsedForgeJvmArgsArray[i] = (0, Utils_1.replaceAll)(parsedForgeJvmArgsArray[i], "${library_directory}", const_1.librariesPath);
                        parsedForgeJvmArgsArray[i] = (0, Utils_1.replaceAll)(parsedForgeJvmArgsArray[i], "${classpath_separator}", path_1.default.delimiter);
                        parsedForgeJvmArgsArray[i] = (0, Utils_1.replaceAll)(parsedForgeJvmArgsArray[i], "${version_name}", mcOpts.version);
                    }
                    forgeJvmArgs = parsedForgeJvmArgsArray;
                }
                if (forgeGameArgs != undefined && !forgeReplaceMcArgs) {
                    parsedForgeGameArgsArray = forgeGameArgs;
                    forgeGameArgs = parsedForgeGameArgsArray;
                }
                let jvmArgs = [];
                jvmArgs.push("-Xms2048M");
                jvmArgs.push("-Xmx6144M");
                // Intel optimization
                jvmArgs.push("-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump");
                // Ignore Invalid Certificates Verification
                jvmArgs.push("-Dfml.ignoreInvalidMinecraftCertificates=true");
                // Ignore FML check for jar injection
                jvmArgs.push("-Dfml.ignorePatchDiscrepancies=true");
                yield promises_1.default.mkdir(path_1.default.join(const_1.serversInstancesPath, name, "natives"), { recursive: true }).catch((err) => reject(err));
                jvmArgs.push(`-Djava.library.path=${path_1.default.join(const_1.serversInstancesPath, name, "natives")}`);
                let classPaths;
                let mcLibrariesArray = (0, DownloadGame_1.minecraftLibraryList)(mcData);
                mcLibrariesArray.push(path_1.default.join(const_1.minecraftVersionPath, mcOpts.version, `${mcOpts.version}.jar`));
                const librariesPathInJson = isForgeVersion ? forgeData["libraries"] ? forgeData["libraries"] : forgeData["versionInfo"]["libraries"] : undefined;
                const forgeLibrariesArray = isForgeVersion ? librariesPathInJson.filter((lib) => {
                    if (lib["rules"]) {
                        return (0, DownloadGame_1.parseRule)(lib["rules"]);
                    }
                    return true;
                }).map((lib) => {
                    if (lib["downloads"]) {
                        return path_1.default.join(const_1.librariesPath, lib["downloads"]["artifact"]["path"]);
                    }
                    else {
                        return path_1.default.join(const_1.librariesPath, (0, HFileManagement_1.mavenToArray)(lib.name).join("/"));
                    }
                }) : undefined;
                classPaths = (0, Utils_1.removeDuplicates)(isForgeVersion ? forgeLibrariesArray.concat(mcLibrariesArray) : mcLibrariesArray);
                jvmArgs.push(`-cp`);
                jvmArgs.push(`${classPaths.join(path_1.default.delimiter)}`);
                jvmArgs = isForgeVersion && forgeJvmArgs != undefined ? jvmArgs.concat(...forgeJvmArgs) : jvmArgs;
                mcArgs = isForgeVersion && forgeGameArgs != undefined && !forgeReplaceMcArgs ? mcArgs.concat(...forgeGameArgs) : mcArgs;
                jvmArgs.push(isForgeVersion ? forgeData["mainClass"] ? forgeData["mainClass"] : forgeData["versionInfo"]["mainClass"] : mcData["mainClass"]);
                const fullMcArgs = [...jvmArgs, ...mcArgs].filter((val, _) => val != "");
                // Find correct java executable
                let java8Path = "";
                yield (0, DownloadGame_1.downloadAndGetJavaVersion)(DownloadGame_1.JavaVersions.JDK8).then((res) => {
                    java8Path = res;
                }).catch((err) => reject(err));
                let java17Path = "";
                yield (0, DownloadGame_1.downloadAndGetJavaVersion)(DownloadGame_1.JavaVersions.JDK17).then((res) => {
                    java17Path = res;
                }).catch((err) => reject(err));
                const java8 = path_1.default.join(java8Path, "javaw");
                const java17 = path_1.default.join(java17Path, "javaw");
                const semverVersionCompatibility = mcOpts.version.split(".").length == 2 ? mcOpts.version + ".0" : mcOpts.version;
                const below117 = semver_1.default.lt(semverVersionCompatibility, "1.17.0");
                const javaVersionToUse = below117 ? java8 : java17;
                yield extractAllNatives(mcLibrariesArray.join(path_1.default.delimiter), path_1.default.join(const_1.serversInstancesPath, name, "natives"), path_1.default.join(const_1.javaPath, const_1.java17Version, const_1.java17Name, "bin", "jar")).catch((err) => reject(err));
                const proc = child_process_1.default.spawn(javaVersionToUse, fullMcArgs, { cwd: path_1.default.join(const_1.serversInstancesPath, name) });
                console.log(proc.spawnargs);
                //await updateInstanceDlState(instanceId, InstanceState.Playing)
                yield (0, DiscordRPC_1.switchDiscordRPCState)(DiscordRPC_1.DiscordRPCState.InGame);
                mcProc[name] = proc;
                logs[name] = [];
                proc.stdout.on("data", (data) => {
                    logs[name].push({ "message": data, "type": "info" });
                });
                proc.stderr.on("data", (data) => {
                    logs[name].push({ "message": data, "type": "err" });
                });
                proc.on("error", (err) => reject(err));
                proc.on("close", (code) => __awaiter(this, void 0, void 0, function* () {
                    //await updateInstanceDlState(instanceId, InstanceState.Playable)
                    yield (0, DiscordRPC_1.switchDiscordRPCState)(DiscordRPC_1.DiscordRPCState.InLauncher);
                    delete mcProc[name];
                    delete logs[name];
                    resolve();
                }));
                resolve();
            })).catch((err) => reject(err));
        }));
    });
}
exports.startMinecraft = startMinecraft;
function killGame(name) {
    if (mcProc.hasOwnProperty(name)) {
        mcProc[name].kill();
        delete mcProc[name];
        delete logs[name];
    }
}
exports.killGame = killGame;
function extractAllNatives(libraries, nativeFolder, javaLocation) {
    return new Promise((resolve, reject) => {
        const allLibs = libraries.split(";");
        for (const e of allLibs) {
            console.log(e);
            child_process_1.default.exec(javaLocation + " --list --file " + e, (err, stdout) => {
                const filesOfLibrary = stdout.split("\r\n");
                for (const n of filesOfLibrary) {
                    if (err != null) {
                        reject(err);
                    }
                    if (n.endsWith(".dll")) {
                        child_process_1.default.exec(`${javaLocation} xf ${e} ${n}`, { cwd: nativeFolder });
                    }
                }
            });
        }
        resolve();
    });
}
exports.extractAllNatives = extractAllNatives;
