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
const HInstance_1 = require("../Utils/HInstance");
const DIscordRPC_1 = require("./DIscordRPC");
const HForge_1 = require("../Utils/HForge");
const Utils_1 = require("../Utils/Utils");
let mcProcs = {};
function startMinecraft(version, instanceId, opt, forgeOpt) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO If map_to_ressource == true -> object dans legacy
        // Get Minecraft version manifest
        const mcData = yield (0, HManifests_1.minecraftManifestForVersion)(version);
        yield (0, HInstance_1.updateInstanceDlState)(instanceId, HInstance_1.InstanceState.Loading);
        // Get Forge version manifest
        const isForgeVersion = forgeOpt != undefined;
        const forgeData = isForgeVersion ? yield (0, HForge_1.getForgeVersionIfExist)(version, forgeOpt.version) : undefined;
        const forgeInstallProfileData = isForgeVersion ? yield (0, HForge_1.getForgeInstallProfileIfExist)(version, forgeOpt.version) : undefined;
        // Get all Minecraft arguments
        var mcArgs = mcData["minecraftArguments"];
        if (mcArgs == null) {
            mcArgs = "";
            for (let i = 0; i < mcData["arguments"]["game"].length; i++) {
                if (typeof mcData["arguments"]["game"][i] == "string") {
                    mcArgs += mcData["arguments"]["game"][i] + " ";
                }
            }
        }
        // Get all Forge arguments
        var forgeGameArgs;
        var forgeJvmArgs;
        if (forgeData != undefined) {
            if (forgeData.arguments) {
                forgeGameArgs = forgeData.arguments.game;
                forgeJvmArgs = forgeData.arguments.jvm;
            }
            console.error("No forge arguments found.");
        }
        // Parse Minecraft arguments
        let parsedMcArgs = mcArgs.split(" ");
        for (let i = 0; i < parsedMcArgs.length; i++) {
            switch (parsedMcArgs[i]) {
                case "${auth_player_name}":
                    parsedMcArgs[i] = opt.username;
                    break;
                case "${version_name}":
                    parsedMcArgs[i] = "1.18.2";
                    break;
                case "${game_directory}":
                    parsedMcArgs[i] = path_1.default.join(const_1.instancesPath, instanceId);
                    break;
                case "${assets_root}":
                    parsedMcArgs[i] = const_1.assetsPath;
                    break;
                case "${assets_index_name}":
                    parsedMcArgs[i] = mcData.assets;
                    break;
                case "${auth_uuid}":
                    parsedMcArgs[i] = opt.uuid;
                    break;
                case "${auth_access_token}":
                    parsedMcArgs[i] = opt.accesstoken;
                    break;
                case "${user_properties}":
                    parsedMcArgs[i] = "{}";
                    break;
                case "${user_type}":
                    parsedMcArgs[i] = "msa";
                    break;
                case "${version_type}":
                    parsedMcArgs[i] = opt.versiontype;
                    break;
                case "${game_assets}":
                    // if(!existsSync(legacyAssetsPath))
                    //     await fs.mkdir(legacyAssetsPath, {recursive: true}) // TODO: Assets don't work for pre-1.6 version
                    parsedMcArgs[i] = path_1.default.join(const_1.instancesPath, instanceId, "resources");
                    break;
                case "${auth_session}":
                    parsedMcArgs[i] = "OFFLINE";
                    break;
                default:
                    break;
            }
        }
        mcArgs = parsedMcArgs;
        // Parse forge args
        let parsedForgeGameArgsArray;
        let parsedForgeJvmArgsArray;
        if (forgeJvmArgs != undefined && forgeGameArgs != undefined) {
            // Parse forge game args
            parsedForgeGameArgsArray = forgeGameArgs;
            console.log("called01");
            // Parse forge jvm args
            parsedForgeJvmArgsArray = forgeJvmArgs;
            for (let i = 0; i < parsedForgeJvmArgsArray.length; i++) {
                console.log("called02");
                parsedForgeJvmArgsArray[i] = (0, Utils_1.replaceAll)(parsedForgeJvmArgsArray[i], "${library_directory}", const_1.librariesPath);
                parsedForgeJvmArgsArray[i] = (0, Utils_1.replaceAll)(parsedForgeJvmArgsArray[i], "${classpath_separator}", path_1.default.delimiter);
                parsedForgeJvmArgsArray[i] = (0, Utils_1.replaceAll)(parsedForgeJvmArgsArray[i], "${version_name}", version);
            }
            forgeGameArgs = parsedForgeGameArgsArray;
            forgeJvmArgs = parsedForgeJvmArgsArray;
        }
        // Building jvm args
        var jvmArgs = [];
        // Set min and max allocated ram
        jvmArgs.push("-Xms2048M");
        jvmArgs.push("-Xmx4096M");
        // Intel optimization
        jvmArgs.push("-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump");
        // Set natives path
        jvmArgs.push("-Djava.library.path=" + (yield (0, HFileManagement_1.makeDir)(path_1.default.join(const_1.instancesPath, instanceId, "natives"))));
        // Set classpaths
        let classPathes = [];
        let mcLibrariesArray = (0, DownloadGame_1.minecraftLibraryList)(mcData);
        mcLibrariesArray.push(path_1.default.join(const_1.minecraftVersionPath, "1.18.2", "1.18.2.jar"));
        let forgeLibrariesArray = isForgeVersion ? forgeData.libraries.concat(forgeInstallProfileData.libraries).map((lib) => path_1.default.join(const_1.librariesPath, lib.downloads.artifact.path)) : undefined;
        classPathes = isForgeVersion ? forgeLibrariesArray.concat(mcLibrariesArray) : mcLibrariesArray;
        jvmArgs.push(`-cp`);
        jvmArgs.push(`${classPathes.join(path_1.default.delimiter)}`);
        console.log(classPathes);
        // const library_directory = librariesPath
        // const classpath_separator = path.delimiter
        // // jvmArgs.push(data["mainClass"])
        // jvmArgs.push("-Djava.net.preferIPv6Addresses=system")
        // jvmArgs.push("-DignoreList=bootstraplauncher,securejarhandler,asm-commons,asm-util,asm-analysis,asm-tree,asm,JarJarFileSystems,client-extra,fmlcore,javafmllanguage,lowcodelanguage,mclanguage,forge-,1.18.2.jar")
        // jvmArgs.push("-DmergeModules=jna-5.10.0.jar,jna-platform-5.10.0.jar,java-objc-bridge-1.0.0.jar")
        // jvmArgs.push("-DlibraryDirectory=" + librariesPath)
        // jvmArgs.push("-p")
        // jvmArgs.push(`${library_directory}/cpw/mods/bootstraplauncher/1.0.0/bootstraplauncher-1.0.0.jar${classpath_separator}${library_directory}/cpw/mods/securejarhandler/1.0.8/securejarhandler-1.0.8.jar${classpath_separator}${library_directory}/org/ow2/asm/asm-commons/9.5/asm-commons-9.5.jar${classpath_separator}${library_directory}/org/ow2/asm/asm-util/9.5/asm-util-9.5.jar${classpath_separator}${library_directory}/org/ow2/asm/asm-analysis/9.5/asm-analysis-9.5.jar${classpath_separator}${library_directory}/org/ow2/asm/asm-tree/9.5/asm-tree-9.5.jar${classpath_separator}${library_directory}/org/ow2/asm/asm/9.5/asm-9.5.jar${classpath_separator}${library_directory}/net/minecraftforge/JarJarFileSystems/0.3.19/JarJarFileSystems-0.3.19.jar`)
        // jvmArgs.push("--add-modules")
        // jvmArgs.push("ALL-MODULE-PATH")
        // jvmArgs.push("--add-opens")
        // jvmArgs.push("java.base/java.util.jar=cpw.mods.securejarhandler")
        // jvmArgs.push("--add-opens")
        // jvmArgs.push("java.base/java.lang.invoke=cpw.mods.securejarhandler")
        // jvmArgs.push("--add-exports")
        // jvmArgs.push("java.base/sun.security.util=cpw.mods.securejarhandler")
        // jvmArgs.push("--add-exports")
        // jvmArgs.push("jdk.naming.dns/com.sun.jndi.dns=java.naming")
        isForgeVersion ? jvmArgs.push(...forgeJvmArgs) : null;
        isForgeVersion ? mcArgs.push(...forgeGameArgs) : null;
        jvmArgs.push(isForgeVersion ? forgeData.mainClass : mcData.mainClass);
        const fullMcArgs = [...jvmArgs, ...mcArgs];
        console.log(fullMcArgs);
        // Find correct java executable
        const java8Path = yield (0, DownloadGame_1.downloadAndGetJavaVersion)(DownloadGame_1.JavaVersions.JDK8);
        const java17Path = yield (0, DownloadGame_1.downloadAndGetJavaVersion)(DownloadGame_1.JavaVersions.JDK17);
        const java8 = path_1.default.join(java8Path, "javaw");
        const java17 = path_1.default.join(java17Path, "javaw");
        const javaVersion = mcData["javaVersion"]["majorVersion"];
        const javaVersionToUse = javaVersion >= 16 ? java17 : java8;
        console.log(javaVersionToUse);
        console.log("Extracting natives");
        yield extractAllNatives(classPathes.join(path_1.default.delimiter), path_1.default.join(const_1.instancesPath, instanceId, "natives"), path_1.default.join(const_1.javaPath, const_1.java17Version, const_1.java17Name, "bin", "jar"));
        console.log("natives extracted");
        console.log("here full args");
        console.log(fullMcArgs.join(" "));
        const proc = child_process_1.default.spawn(javaVersionToUse, fullMcArgs);
        console.log("test");
        console.log(proc.spawnargs);
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
