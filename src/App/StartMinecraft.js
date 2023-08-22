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
        const data = yield (0, HManifests_1.minecraftManifestForVersion)("1.18.2"); // FIXME: TEMP
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
                    tempSplitedArgs[i] = "1.18.2";
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
        tempSplitedArgs.push("--launchTarget");
        tempSplitedArgs.push("forgeclient");
        tempSplitedArgs.push("--fml.forgeVersion");
        tempSplitedArgs.push("40.2.10");
        tempSplitedArgs.push("--fml.mcVersion");
        tempSplitedArgs.push("1.18.2");
        tempSplitedArgs.push("--fml.forgeGroup");
        tempSplitedArgs.push("net.minecraftforge");
        tempSplitedArgs.push("--fml.mcpVersion");
        tempSplitedArgs.push("20220404.173914");
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
        const installProfileFile = yield promises_1.default.readFile(path_1.default.join(const_1.minecraftVersionPath, version, version + ".json"), "utf-8");
        const installProfileJson = JSON.parse(installProfileFile);
        let forgeArgs = [];
        const forgeLibraries = installProfileJson.libraries;
        for (const library of forgeLibraries) {
            forgeArgs.push(path_1.default.join(const_1.librariesPath, ((0, HFileManagement_1.mavenToArray)(library.name)).join("/")));
        }
        // forgeArgs.push(path.join(librariesPath, `net/minecraftforge/forge/${version}/forge-${version}-universal.jar`))
        // forgeArgs.push(path.join(librariesPath, `net/minecraftforge/accesstransformers/8.0.4/accesstransformers-8.0.4.jar`))
        // forgeArgs.push(path.join(librariesPath, `net/minecraftforge/forgespi/4.0.15-4.x/forgespi-4.0.15-4.x.jar`))
        // forgeArgs.push(path.join(librariesPath, `net/minecraftforge/eventbus/5.0.3/eventbus-5.0.3.jar`))
        // forgeArgs.push(path.join(librariesPath, `net/minecraftforge/coremods/5.0.1/coremods-5.0.1.jar`))
        // forgeArgs.push(path.join(librariesPath, `net/minecraftforge/unsafe/0.2.0/unsafe-0.2.0.jar`))
        // forgeArgs.push(path.join(librariesPath, `net/minecraftforge/JarJarSelector/0.3.19/JarJarSelector-0.3.19.jar`))
        // forgeArgs.push(path.join(librariesPath, `net/minecraftforge/JarJarMetadata/0.3.19/JarJarMetadata-0.3.19.jar`))
        // forgeArgs.push(path.join(librariesPath, `net/minecraftforge/JarJarFileSystems/0.3.19/JarJarFileSystems-0.3.19.jar`))
        // forgeArgs.push(path.join(librariesPath, `net/minecraftforge/fmlloader/1.18.2-40.2.10/fmlloader-1.18.2-40.2.10.jar`))
        const forgeLibraryPathes = forgeArgs.join(";");
        // FIXME: END TEMP
        let librariesArg = (0, DownloadGame_1.minecraftLibraryList)(data).join(";");
        const finalLibrariesArg = `${forgeLibraryPathes};${librariesArg};${path_1.default.join(const_1.minecraftVersionPath, "1.18.2", "1.18.2.jar")}`;
        console.log(libraries);
        console.log('---');
        console.log(librariesArg);
        console.log('----');
        console.log(finalLibrariesArg);
        jvmArgs.push(`-cp`);
        jvmArgs.push(`${finalLibrariesArg}`);
        const library_directory = const_1.librariesPath;
        const classpath_separator = path_1.default.delimiter;
        // jvmArgs.push(data["mainClass"])
        jvmArgs.push("-Djava.net.preferIPv6Addresses=system");
        jvmArgs.push("-DignoreList=bootstraplauncher,securejarhandler,asm-commons,asm-util,asm-analysis,asm-tree,asm,JarJarFileSystems,client-extra,fmlcore,javafmllanguage,lowcodelanguage,mclanguage,forge-,1.18.2.jar");
        jvmArgs.push("-DmergeModules=jna-5.10.0.jar,jna-platform-5.10.0.jar,java-objc-bridge-1.0.0.jar");
        jvmArgs.push("-DlibraryDirectory=" + const_1.librariesPath);
        jvmArgs.push("-p");
        jvmArgs.push(`${library_directory}/cpw/mods/bootstraplauncher/1.0.0/bootstraplauncher-1.0.0.jar${classpath_separator}${library_directory}/cpw/mods/securejarhandler/1.0.8/securejarhandler-1.0.8.jar${classpath_separator}${library_directory}/org/ow2/asm/asm-commons/9.5/asm-commons-9.5.jar${classpath_separator}${library_directory}/org/ow2/asm/asm-util/9.5/asm-util-9.5.jar${classpath_separator}${library_directory}/org/ow2/asm/asm-analysis/9.5/asm-analysis-9.5.jar${classpath_separator}${library_directory}/org/ow2/asm/asm-tree/9.5/asm-tree-9.5.jar${classpath_separator}${library_directory}/org/ow2/asm/asm/9.5/asm-9.5.jar${classpath_separator}${library_directory}/net/minecraftforge/JarJarFileSystems/0.3.19/JarJarFileSystems-0.3.19.jar`);
        jvmArgs.push("--add-modules");
        jvmArgs.push("ALL-MODULE-PATH");
        jvmArgs.push("--add-opens");
        jvmArgs.push("java.base/java.util.jar=cpw.mods.securejarhandler");
        jvmArgs.push("--add-opens");
        jvmArgs.push("java.base/java.lang.invoke=cpw.mods.securejarhandler");
        jvmArgs.push("--add-exports");
        jvmArgs.push("java.base/sun.security.util=cpw.mods.securejarhandler");
        jvmArgs.push("--add-exports");
        jvmArgs.push("jdk.naming.dns/com.sun.jndi.dns=java.naming");
        jvmArgs.push("cpw.mods.bootstraplauncher.BootstrapLauncher");
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
