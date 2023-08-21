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
const promises_1 = __importDefault(require("fs/promises"));
const DownloadGame_1 = require("./DownloadGame");
const HFileManagement_1 = require("../Utils/HFileManagement");
const HInstance_1 = require("../Utils/HInstance");
const DIscordRPC_1 = require("./DIscordRPC");
let mcProcs = {};
function startMinecraft(version, instanceId, opt) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO If map_to_ressource == true -> object dans legacy
        const data = yield (0, HManifests_1.minecraftManifestForVersion)("1.12.2"); // FIXME: TEMP
        yield (0, HInstance_1.updateInstanceDlState)(instanceId, HInstance_1.InstanceState.Loading);
        // Get all Minecraft arguments
        var mcArgs = data["minecraftArguments"];
        if (mcArgs == null) {
            mcArgs = "";
            for (let i = 0; i < data["arguments"]["game"].length; i++) {
                if (typeof data["arguments"]["game"][i] == "string") {
                    mcArgs += data["arguments"]["game"][i] + " ";
                }
            }
        }
        // Parse Minecraft arguments
        let tempSplitedArgs = mcArgs.split(" ");
        console.log(tempSplitedArgs);
        for (let i = 0; i < tempSplitedArgs.length; i++) {
            switch (tempSplitedArgs[i]) {
                case "${auth_player_name}":
                    tempSplitedArgs[i] = opt.username;
                    break;
                case "${version_name}":
                    tempSplitedArgs[i] = "1.12.2";
                    break;
                case "${game_directory}":
                    tempSplitedArgs[i] = path_1.default.join(const_1.instancesPath, instanceId);
                    break;
                case "${assets_root}":
                    tempSplitedArgs[i] = const_1.assetsPath;
                    break;
                case "${assets_index_name}":
                    tempSplitedArgs[i] = data.assets;
                    break;
                case "${auth_uuid}":
                    tempSplitedArgs[i] = opt.uuid;
                    break;
                case "${auth_access_token}":
                    tempSplitedArgs[i] = opt.accesstoken;
                    break;
                case "${user_properties}":
                    tempSplitedArgs[i] = "{}";
                    break;
                case "${user_type}":
                    tempSplitedArgs[i] = "msa";
                    break;
                case "${version_type}":
                    tempSplitedArgs[i] = opt.versiontype;
                    break;
                case "${game_assets}":
                    // if(!existsSync(legacyAssetsPath))
                    //     await fs.mkdir(legacyAssetsPath, {recursive: true}) // TODO: Assets don't work for pre-1.6 version
                    tempSplitedArgs[i] = path_1.default.join(const_1.instancesPath, instanceId, "resources");
                    break;
                case "${auth_session}":
                    tempSplitedArgs[i] = "OFFLINE";
                    break;
                default:
                    break;
            }
        }
        tempSplitedArgs.push("--tweakClass");
        tempSplitedArgs.push("net.minecraftforge.fml.common.launcher.FMLTweaker");
        mcArgs = tempSplitedArgs;
        // mcArgs += " --tweakClass net.minecraftforge.fml.common.launcher.FMLTweaker" // FIXME: TEMP
        console.log(mcArgs);
        // Set command arguments
        var jvmArgs = [];
        jvmArgs.push("-Xms2048M");
        jvmArgs.push("-Xmx4096M");
        jvmArgs.push("-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump");
        jvmArgs.push("-Djava.library.path=" + (yield (0, HFileManagement_1.makeDir)(path_1.default.join(const_1.instancesPath, instanceId, "natives"))));
        const libraries = yield (0, HFileManagement_1.getAllFile)(const_1.librariesPath);
        // FIXME: START TEMP
        const installProfileFile = yield promises_1.default.readFile(path_1.default.join(const_1.gamePath, "install_profile.json"), "utf-8");
        const installProfileJson = JSON.parse(installProfileFile);
        let forgeArgs = [];
        forgeArgs.push(path_1.default.join(const_1.librariesPath, (yield (0, HFileManagement_1.mavenToArray)(installProfileJson.install.path)).join("/")));
        const forgeLibraries = installProfileJson.versionInfo.libraries;
        for (const library of forgeLibraries) {
            if (library.name.includes("minecraftforge") || library.name.includes("forge")) {
                console.log("Skip " + library.name);
                continue;
            }
            forgeArgs.push(path_1.default.join(const_1.librariesPath, (yield (0, HFileManagement_1.mavenToArray)(library.name)).join("/")));
        }
        const forgeLibraryPathes = forgeArgs.join(";");
        // FIXME: END TEMP
        let librariesArg = (0, DownloadGame_1.minecraftLibraryList)(data).join(";");
        const finalLibrariesArg = `${forgeLibraryPathes};${librariesArg}`;
        console.log(libraries);
        console.log('---');
        console.log(librariesArg);
        console.log('----');
        console.log(finalLibrariesArg);
        jvmArgs.push(`-cp`);
        jvmArgs.push(`${finalLibrariesArg};${path_1.default.join(const_1.minecraftVersionPath, "1.12.2", `${"1.12.2"}.jar`)}`);
        // jvmArgs.push(data["mainClass"])
        jvmArgs.push("net.minecraft.launchwrapper.Launch");
        const fullMcArgs = [...jvmArgs, ...mcArgs];
        console.log(fullMcArgs);
        // Find correct java executable
        const java8Path = yield (0, DownloadGame_1.downloadAndGetJavaVersion)(DownloadGame_1.JavaVersions.JDK8);
        const java17Path = yield (0, DownloadGame_1.downloadAndGetJavaVersion)(DownloadGame_1.JavaVersions.JDK17);
        const java8 = path_1.default.join(java8Path, "javaw");
        const java17 = path_1.default.join(java17Path, "javaw");
        const javaVersion = data["javaVersion"]["majorVersion"];
        const javaVersionToUse = javaVersion >= 16 ? java17 : java8;
        console.log(javaVersionToUse);
        console.log("Extracting natives");
        // TEMP
        yield extractAllNatives(librariesArg, path_1.default.join(const_1.instancesPath, instanceId, "natives"), path_1.default.join(const_1.javaPath, const_1.java17Version, const_1.java17Name, "bin", "jar"));
        console.log("natives extracted");
        console.log("here full args");
        console.log(fullMcArgs.join(" "));
        const proc = child_process_1.default.spawn(javaVersionToUse, fullMcArgs);
        yield (0, HInstance_1.updateInstanceDlState)(instanceId, HInstance_1.InstanceState.Playing);
        yield (0, DIscordRPC_1.switchDiscordRPCState)(DIscordRPC_1.DiscordRPCState.InGame);
        mcProcs[instanceId] = proc;
        proc.stdout.on("data", (data) => {
            console.log(data.toString("utf-8"));
        });
        proc.stderr.on("data", (data) => {
            console.error(data.toString("utf-8"));
        });
        proc.stdout.on("error", (err) => console.error(err));
        proc.on("close", (code) => __awaiter(this, void 0, void 0, function* () {
            switch (code) {
                case 0:
                    console.log("Game stopped");
                    break;
                case 1:
                    console.error("Game stopped with error");
                    break;
                case null:
                    console.log("Game killed!");
                    break;
                default:
                    break;
            }
            yield (0, HInstance_1.updateInstanceDlState)(instanceId, HInstance_1.InstanceState.Playable);
            yield (0, DIscordRPC_1.switchDiscordRPCState)(DIscordRPC_1.DiscordRPCState.InLauncher);
            delete mcProcs[instanceId];
        }));
    });
}
exports.startMinecraft = startMinecraft;
function killGame(associatedInstanceId) {
    if (mcProcs.hasOwnProperty(associatedInstanceId)) {
        mcProcs[associatedInstanceId].kill();
    }
}
exports.killGame = killGame;
function extractAllNatives(libraries, nativeFolder, javaLocation) {
    return __awaiter(this, void 0, void 0, function* () {
        const allLibs = libraries.split(";");
        for (const e of allLibs) {
            console.log(e);
            child_process_1.default.exec(javaLocation + " --list --file " + e, (err, stdout, sdterr) => __awaiter(this, void 0, void 0, function* () {
                const filesOfLibrary = stdout.split("\r\n");
                for (const n of filesOfLibrary) {
                    if (err != null) {
                        console.error(err);
                    }
                    if (n.endsWith(".dll")) {
                        child_process_1.default.exec(`${javaLocation} xf ${e} ${n}`, { cwd: nativeFolder });
                    }
                }
            }));
        }
        return true;
    });
}
exports.extractAllNatives = extractAllNatives;
