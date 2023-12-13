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
exports.checkInstanceIntegrity = exports.checkForUpdate = exports.convertProfileToInstance = exports.updateInstanceDlState = exports.InstanceState = exports.updateInstanceDlProgress = exports.getInstanceById = exports.getInstanceData = exports.refreshLocalInstanceList = exports.setContentTo = exports.createInstance = exports.addInstanceElement = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const const_1 = require("./const");
const fs_1 = require("fs");
const Utils_1 = require("./Utils");
const DownloadGame_1 = require("../App/DownloadGame");
const HDownload_1 = require("./HDownload");
const { openPopup } = require("../Interface/UIElements/scripts/window.js");
function addInstanceElement(thumbnailPath, title, parentDiv) {
    return __awaiter(this, void 0, void 0, function* () {
        const instanceElement = yield generateInstanceBtn({ name: title, thumbnailPath: thumbnailPath, coverPath: thumbnailPath, type: "server_instance" });
        parentDiv.appendChild(instanceElement);
        return instanceElement;
    });
}
exports.addInstanceElement = addInstanceElement;
function createInstance(version, instanceInfo, loaderInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield promises_1.default.mkdir(path_1.default.join(const_1.serversInstancesPath, instanceInfo.name), { recursive: true }).catch((err) => reject(err));
            let instanceConfiguration = {};
            // Default json configuration
            if (instanceInfo.type === 'server_instance') {
                instanceConfiguration = {
                    "instance": {
                        "name": instanceInfo.name,
                        "thumbnail_path": instanceInfo.thumbnailPath,
                        "cover_path": instanceInfo.coverPath,
                        "play_time": 0,
                    },
                    "game": {
                        "version": version,
                    }
                };
            }
            else {
                instanceConfiguration = {
                    "instance": {
                        "name": instanceInfo.name,
                        "thumbnail_path": instanceInfo.thumbnailPath,
                        "play_time": 0,
                    },
                    "game_data": {
                        "version": version,
                    }
                };
            }
            if (loaderInfo) {
                let defaultLoaderJson = {
                    "loader": {
                        "name": loaderInfo.name,
                        "id": loaderInfo.id
                    }
                };
                instanceConfiguration = (0, Utils_1.concatJson)(instanceConfiguration, defaultLoaderJson);
            }
            // Write instance conf on disk
            yield promises_1.default.writeFile(path_1.default.join(const_1.serversInstancesPath, instanceInfo.name, "info.json"), JSON.stringify(instanceConfiguration)).catch((err) => reject(err));
            //FIXME Refresh server instances list
            resolve();
        }));
    });
}
exports.createInstance = createInstance;
function generateInstanceBtn(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const instanceElement = document.createElement("div");
        const textElement = document.createElement("p");
        textElement.innerText = opts.name;
        instanceElement.append(textElement);
        instanceElement.id = opts.name;
        instanceElement.classList.add("instance");
        instanceElement.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield setContentTo(opts.name);
            (_a = document.querySelector(".instance.active")) === null || _a === void 0 ? void 0 : _a.classList.remove("active");
            instanceElement.classList.add("active");
        }));
        instanceElement.setAttribute("onclick", 'require("./scripts/window.js").openWindow("instance-info")');
        return instanceElement;
    });
}
let currentContentId = null;
function setContentTo(id) {
    return __awaiter(this, void 0, void 0, function* () {
        currentContentId = id;
        // Get instance state
        const instance = document.getElementById(id);
        const currentState = instance === null || instance === void 0 ? void 0 : instance.getAttribute("state");
        // Fetch instance json
        const instanceJson = yield getInstanceData(id);
        // Hide current content
        const content = document.getElementById("content");
        content.style.display = "none";
        // Show loading animation
        const loading = document.getElementById("instance-info-loading");
        loading.style.display = "auto";
        // No data found, cancel process
        if (!instanceJson) {
            console.error("No instance data found");
            return;
        }
        // Separate instance datas
        const instanceData = instanceJson.data.instanceData;
        const gameData = instanceJson.data.gameData;
        const loaderData = instanceJson.data.loader;
        // Set title
        const contentTitle = document.getElementById("instance-title");
        contentTitle.innerText = instanceData.name;
        // Set author
        const contentAuthor = document.getElementById("instance-author");
        contentAuthor.innerText = instanceData.author;
        // Set version
        const widgetVersion = document.getElementById("widget-version");
        widgetVersion.setAttribute("subname", gameData.versiontype);
        widgetVersion.innerText = gameData.version;
        // Set modloader
        let currentModloader = loaderData === null || loaderData === void 0 ? void 0 : loaderData.name;
        let modloaderId = loaderData === null || loaderData === void 0 ? void 0 : loaderData.id;
        console.log(currentModloader);
        const widgetModloader = document.getElementById("widget-modloader");
        widgetModloader.innerText = currentModloader ? currentModloader[0].toUpperCase() + currentModloader.slice(1) : "Vanilla";
        widgetModloader.setAttribute("subname", currentModloader ? modloaderId : gameData.version);
        // Set playtime
        const widgetPlaytime = document.getElementById("widget-playtime");
        let h, m;
        const timeInMiliseconds = instanceData.playtime;
        h = Math.floor(timeInMiliseconds / 1000 / 60 / 60);
        m = Math.floor((timeInMiliseconds / 1000 / 60 / 60 - h) * 60);
        m < 10 ? m = `0${m}` : m = `${m}`;
        h < 10 ? h = `0${h}` : h = `${h}`;
        widgetPlaytime.innerText = `${h}h${m}`;
        // Set last played
        const widgetLastplayed = document.getElementById("widget-lastplayed"); // FIXME: Don't work
        widgetLastplayed.innerText = instanceData["lastplayed"];
        const widgetDesc = document.getElementById("widget-description"); // TODO: Write md rules
        const widgetPosts = document.getElementById("widget-post");
        const launchBtn = document.getElementById("launchbtn");
        const accentColor = instanceData["accentColor"];
        contentAuthor.style.color = accentColor;
        launchBtn.innerText = "Play";
    });
}
exports.setContentTo = setContentTo;
function refreshLocalInstanceList() {
    return __awaiter(this, void 0, void 0, function* () {
        const instancesDiv = document.getElementById("own-servers");
        instancesDiv.innerHTML = "";
        if ((0, fs_1.existsSync)(const_1.instancesPath)) {
            const instances = yield promises_1.default.readdir(const_1.instancesPath);
            // Get all instances
            for (const e in instances) {
                if ((0, fs_1.existsSync)(path_1.default.join(const_1.instancesPath, instances[e], "info.json"))) {
                    const data = yield promises_1.default.readFile(path_1.default.join(const_1.instancesPath, instances[e], "info.json"), "utf8");
                    const dataJson = JSON.parse(data);
                    const element = yield addInstanceElement(dataJson["instance"]["thumbnail_path"], dataJson["instance"]["name"], instancesDiv);
                    element.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
                        yield setContentTo(dataJson["instance"]["name"]);
                        openPopup('server-instance-info');
                    }));
                }
            }
        }
    });
}
exports.refreshLocalInstanceList = refreshLocalInstanceList;
function getInstanceData(instanceId) {
    return __awaiter(this, void 0, void 0, function* () {
        if ((0, fs_1.existsSync)(const_1.instancesPath)) {
            const data = yield promises_1.default.readFile(path_1.default.join(const_1.instancesPath, instanceId, "info.json"), "utf-8");
            const dataJson = JSON.parse(data);
            return { "data": dataJson, "gamePath": path_1.default.join(const_1.instancesPath, instanceId) };
        }
    });
}
exports.getInstanceData = getInstanceData;
function getInstanceById(id) {
    const instancesDiv = document.getElementById("instances");
    for (let i = 0; i < instancesDiv.childElementCount; i++) {
        if (instancesDiv.children[i].getAttribute("instanceid") == id) {
            return instancesDiv.children[i];
        }
    }
}
exports.getInstanceById = getInstanceById;
function updateInstanceDlProgress(instanceId, progress) {
    const instance = document.getElementById(instanceId);
    const dlTracker = instance === null || instance === void 0 ? void 0 : instance.firstElementChild;
    if (dlTracker == null) {
        return;
    }
    console.log(progress);
    //@ts-ignore
    dlTracker.style.left = `${progress}%`;
    //@ts-ignore
    dlTracker.style.width = 100 - Number(dlTracker.style.left.substring(0, dlTracker.style.left.length - 1)) + '%';
}
exports.updateInstanceDlProgress = updateInstanceDlProgress;
var InstanceState;
(function (InstanceState) {
    InstanceState[InstanceState["Loading"] = 0] = "Loading";
    InstanceState[InstanceState["Downloading"] = 1] = "Downloading";
    InstanceState[InstanceState["ToDownload"] = 2] = "ToDownload";
    InstanceState[InstanceState["DLResources"] = 3] = "DLResources";
    InstanceState[InstanceState["Verification"] = 4] = "Verification";
    InstanceState[InstanceState["Patching"] = 5] = "Patching";
    InstanceState[InstanceState["Playable"] = 6] = "Playable";
    InstanceState[InstanceState["Update"] = 7] = "Update";
    InstanceState[InstanceState["Playing"] = 8] = "Playing";
})(InstanceState = exports.InstanceState || (exports.InstanceState = {}));
function updateInstanceDlState(instanceId, newState) {
    return __awaiter(this, void 0, void 0, function* () {
        const instance = document.getElementById(instanceId);
        instance === null || instance === void 0 ? void 0 : instance.setAttribute("state", InstanceState[newState]);
        if (currentContentId == instanceId)
            yield setContentTo(instanceId);
    });
}
exports.updateInstanceDlState = updateInstanceDlState;
function convertProfileToInstance(metadata, instanceData) {
    return __awaiter(this, void 0, void 0, function* () {
        const isVanilla = metadata["loader"] == null;
        yield createInstance(metadata["mcVersion"], {
            name: instanceData["name"],
            thumbnailPath: yield (0, HDownload_1.downloadAsync)(instanceData["thumbnailPath"], path_1.default.join(const_1.instancesPath, instanceData["name"], "thumbnail" + path_1.default.extname(instanceData["thumbnailPath"]))),
            type: "instance"
        }, !isVanilla ? {
            name: metadata["loader"]["name"],
            id: metadata["loader"]["id"]
        } : undefined);
        yield (0, DownloadGame_1.downloadMinecraft)(metadata["mcVersion"], instanceData["name"]);
        if (!isVanilla) {
            yield (0, DownloadGame_1.patchInstanceWithForge)(instanceData["name"], metadata["mcVersion"], metadata["loader"]["id"]);
        }
        yield updateInstanceDlState(instanceData["name"], InstanceState.DLResources);
        // Download files
        for (const fileData of metadata["files"]) {
            const ext = path_1.default.extname(fileData.path);
            ext === ".zip" ? console.log("zip file detected") : null;
            yield (0, HDownload_1.downloadAsync)(fileData.url, path_1.default.join(const_1.instancesPath, instanceData["name"], fileData.path), undefined, { decompress: ext === ".zip" });
        }
        yield updateInstanceDlState(instanceData["name"], InstanceState.Playable);
    });
}
exports.convertProfileToInstance = convertProfileToInstance;
function checkForUpdate(instanceId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield updateInstanceDlState(instanceId, InstanceState.Loading);
        let updateFound = false;
        // Check difference between this instance version and the serverside instance version
        // If version is different, delete game files and replace them and update instance properties
        if (updateFound)
            yield updateInstanceDlState(instanceId, InstanceState.Update);
        yield updateInstanceDlState(instanceId, InstanceState.Playable);
    });
}
exports.checkForUpdate = checkForUpdate;
function checkInstanceIntegrity(instanceId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield updateInstanceDlState(instanceId, InstanceState.Verification);
        // TODO: Code
        yield updateInstanceDlState(instanceId, InstanceState.Playable);
    });
}
exports.checkInstanceIntegrity = checkInstanceIntegrity;
/*
export async function verifyInstanceFromRemote(name: string) {
    const profiles = await listProfiles()

    console.log(profiles)// @ts-ignore// @ts-ignore
    console.log(profiles.hasOwnProperty(name))

    // @ts-ignore
    if(!profiles.hasOwnProperty(name)) return;

    const metadata = await getMetadataOf(profiles![name])

    console.log(metadata)

    // Delete files not in server side
    const folders = metadata["folders"]
    for (const folder of folders) {
        await fs.rmdir(path.join(instancesPath, name, folder), {recursive: true})
    }

    // Download files not in the local side
    for (const fileData of metadata["files"]) {
        if(!existsSync(path.join(instancesPath, name, fileData["path"]))) {
            await downloadAsync(fileData["url"], path.join(instancesPath, name, fileData["path"]))
            console.log("downloaded: " + fileData["path"] + " from " + fileData["url"])
        }
    }
}*/
