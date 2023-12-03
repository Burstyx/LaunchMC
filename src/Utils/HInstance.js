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
exports.verifyInstanceFromRemote = exports.checkInstanceIntegrity = exports.checkForUpdate = exports.retrievePosts = exports.retrieveDescription = exports.convertProfileToInstance = exports.restoreInstancesData = exports.saveInstancesData = exports.updateInstanceDlState = exports.InstanceState = exports.updateInstanceDlProgress = exports.getInstanceById = exports.getInstanceData = exports.refreshInstanceList = exports.setContentTo = exports.createInstance = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const const_1 = require("../Utils/const");
const HFileManagement_1 = require("./HFileManagement");
const original_fs_1 = require("original-fs");
const color_1 = __importDefault(require("color"));
const Utils_1 = require("./Utils");
const DownloadGame_1 = require("../App/DownloadGame");
const HDownload_1 = require("./HDownload");
const child_process_1 = __importDefault(require("child_process"));
const HGitHub_1 = require("./HGitHub");
var instancesData = {};
function addInstanceElement(imagePath, title, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const instanceDiv = document.getElementById("instance-list");
        const instanceElement = yield generateInstanceBtn(imagePath, title, id);
        instanceDiv.appendChild(instanceElement);
    });
}
function createInstance(version, instanceInfo, loaderInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, HFileManagement_1.makeDir)(path_1.default.join(const_1.instancesPath, instanceInfo.name));
        // Default json configuration
        let defaultJson = {
            "instanceData": {
                "name": instanceInfo.name,
                "imagePath": instanceInfo.imagePath,
                "author": instanceInfo.author,
                "accentColor": instanceInfo.accentColor,
                "playtime": 0,
                "lastplayed": -1,
                "description": ""
            },
            "gameData": {
                "version": version,
                "versiontype": instanceInfo.versionType,
            }
        };
        let defaultLoaderJson = {
            "loader": {
                "name": loaderInfo === null || loaderInfo === void 0 ? void 0 : loaderInfo.name,
                "id": loaderInfo === null || loaderInfo === void 0 ? void 0 : loaderInfo.id
            }
        };
        // If Forge instance then append forge conf to default conf
        if (loaderInfo) {
            defaultJson = (0, Utils_1.concatJson)(defaultJson, defaultLoaderJson);
        }
        // Write instance conf on disk
        yield promises_1.default.writeFile(path_1.default.join(const_1.instancesPath, instanceInfo.name, "info.json"), JSON.stringify(defaultJson));
        // Update instance list
        yield refreshInstanceList();
    });
}
exports.createInstance = createInstance;
function generateInstanceBtn(imagePath, title, id) {
    return __awaiter(this, void 0, void 0, function* () {
        let instanceElement = document.createElement("div");
        if (title.length > 20) {
            title = title.substring(0, 23);
            title += "...";
        }
        // Instance Btn
        instanceElement.innerText = title;
        instanceElement.classList.add("default-btn", "interactable", "instance");
        instanceElement.setAttribute("state", InstanceState[InstanceState.Playable]);
        instanceElement.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url('${(0, Utils_1.replaceAll)(imagePath, '\\', '/')}')`;
        instanceElement.style.textShadow = "black 0px 0px 10px";
        instanceElement.style.position = "relative";
        instanceElement.id = id;
        // Download track div
        let dlTrackerElement = document.createElement("div");
        dlTrackerElement.classList.add("dltracker");
        dlTrackerElement.style.position = "absolute";
        dlTrackerElement.style.top = "0";
        dlTrackerElement.style.left = "100%";
        dlTrackerElement.style.width = "0%";
        dlTrackerElement.style.height = "100%";
        dlTrackerElement.style.borderRadius = "5px";
        dlTrackerElement.style.backdropFilter = "saturate(0%)";
        dlTrackerElement.style.pointerEvents = "none";
        instanceElement.append(dlTrackerElement);
        instanceElement.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield setContentTo(id);
            (_a = document.querySelector(".instance.active")) === null || _a === void 0 ? void 0 : _a.classList.remove("active");
            instanceElement.classList.add("active");
        }));
        instanceElement.addEventListener("mousedown", (e) => {
            if (e.button === 2) {
                // @ts-ignore
                const id = e.target.id;
                // @ts-ignore
                const state = e.target.getAttribute("state");
                const rcMenu = document.getElementById("rcmenu-instance");
                // @ts-ignore
                rcMenu.style.top = e.clientY + "px";
                // @ts-ignore
                rcMenu.style.left = e.clientX + "px";
                // @ts-ignore
                rcMenu.style.display = "flex";
                document.getElementById("rc_delete_instance").onclick = (e) => __awaiter(this, void 0, void 0, function* () {
                    if (state === InstanceState[InstanceState.Playable]) {
                        yield promises_1.default.rm(path_1.default.join(const_1.instancesPath, id), { recursive: true });
                        yield refreshInstanceList();
                    }
                    else {
                        console.log("Can't delete an instance which is occupied");
                    }
                });
                document.getElementById("rc_open_instance_folder").onclick = (e) => {
                    child_process_1.default.exec(`start "" "${path_1.default.join(const_1.instancesPath, id)}"`);
                };
            }
        });
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
        const desc = yield retrieveDescription(id);
        if (desc !== "") {
            widgetDesc.style.display = "flex";
            widgetDesc.innerText = desc;
        }
        else {
            widgetDesc.style.display = "none";
        }
        const widgetPosts = document.getElementById("widget-post");
        const posts = yield retrievePosts(id);
        if (posts !== "") {
            widgetPosts.style.display = "flex";
            widgetPosts.innerText = desc;
        }
        else {
            widgetPosts.style.display = "none";
        }
        const launchBtn = document.getElementById("launchbtn");
        const accentColor = instanceData["accentColor"];
        contentAuthor.style.color = accentColor;
        const color = (0, color_1.default)(accentColor);
        const borderColor = color.darken(-.25).hex();
        launchBtn.style.backgroundColor = accentColor;
        launchBtn.style.border = `solid ${borderColor}`;
        launchBtn.style.boxShadow = `0 0 10px 1px ${accentColor}`;
        launchBtn.innerText = "Play";
        if (currentState === InstanceState[InstanceState.Playing]) {
            launchBtn.style.backgroundColor = "red";
            const color = (0, color_1.default)("#ff0000");
            const borderColor = color.darken(-.25).hex();
            launchBtn.style.border = `solid ${borderColor}`;
            launchBtn.style.boxShadow = `0 0 10px 1px red`;
            launchBtn.innerText = "Stop";
        }
        else if (currentState === InstanceState[InstanceState.Update]) {
            launchBtn.style.backgroundColor = "green";
            const color = (0, color_1.default)("#00ff00");
            const borderColor = color.darken(-.25).hex();
            launchBtn.style.border = `solid ${borderColor}`;
            launchBtn.style.boxShadow = `0 0 10px 1px green`;
            launchBtn.innerText = "Update";
        }
        else if (currentState === InstanceState[InstanceState.Downloading]) {
            launchBtn.style.backgroundColor = "#2b2b2b";
            launchBtn.style.border = `solid #363636`;
            launchBtn.style.boxShadow = `0 0 10px 1px #2b2b2b`;
            launchBtn.innerText = "Downloading";
        }
        else if (currentState === InstanceState[InstanceState.Loading]) {
            launchBtn.style.backgroundColor = "#2b2b2b";
            launchBtn.style.border = `solid #363636`;
            launchBtn.style.boxShadow = `0 0 10px 1px #2b2b2b`;
            launchBtn.innerText = "Loading";
        }
        else if (currentState === InstanceState[InstanceState.Patching]) {
            launchBtn.style.backgroundColor = "#e05609";
            launchBtn.style.border = `solid #363636`;
            launchBtn.style.boxShadow = `0 0 10px 1px #2b2b2b`;
            launchBtn.innerText = "Patching";
        }
        else if (currentState === InstanceState[InstanceState.DLResources]) {
            launchBtn.style.backgroundColor = "#2b2b2b";
            launchBtn.style.border = `solid #363636`;
            launchBtn.style.boxShadow = `0 0 10px 1px #2b2b2b`;
            launchBtn.innerText = "Downloading Server Files";
        }
        else if (currentState === InstanceState[InstanceState.Verification]) {
            launchBtn.style.backgroundColor = "#2b2b2b";
            launchBtn.style.border = `solid #363636`;
            launchBtn.style.boxShadow = `0 0 10px 1px #2b2b2b`;
            launchBtn.innerText = "Verifying";
        }
        const contentBackground = document.getElementById("content-background");
        contentBackground.style.backgroundImage = `linear-gradient(180deg, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.8) 100%),
    url('${(0, Utils_1.replaceAll)(instanceData["imagePath"], '\\', '/')}')`;
        contentBackground.style.backgroundSize = 'cover';
        loading.style.display = "none";
        content.style.display = "flex";
    });
}
exports.setContentTo = setContentTo;
function refreshInstanceList() {
    return __awaiter(this, void 0, void 0, function* () {
        const instancesDiv = document.getElementById("instance-list");
        saveInstancesData();
        instancesDiv.innerHTML = "";
        if ((0, original_fs_1.existsSync)(const_1.instancesPath)) {
            const instances = yield promises_1.default.readdir(const_1.instancesPath);
            // Get all instances
            for (const e in instances) {
                if ((0, original_fs_1.existsSync)(path_1.default.join(const_1.instancesPath, instances[e], "info.json"))) {
                    const data = yield promises_1.default.readFile(path_1.default.join(const_1.instancesPath, instances[e], "info.json"), "utf8");
                    const dataJson = JSON.parse(data);
                    yield addInstanceElement(dataJson["instanceData"]["imagePath"], dataJson["instanceData"]["name"], dataJson["instanceData"]["name"]);
                }
            }
        }
        restoreInstancesData();
    });
}
exports.refreshInstanceList = refreshInstanceList;
function getInstanceData(instanceId) {
    return __awaiter(this, void 0, void 0, function* () {
        if ((0, original_fs_1.existsSync)(const_1.instancesPath)) {
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
    InstanceState[InstanceState["DLResources"] = 2] = "DLResources";
    InstanceState[InstanceState["Verification"] = 3] = "Verification";
    InstanceState[InstanceState["Patching"] = 4] = "Patching";
    InstanceState[InstanceState["Playable"] = 5] = "Playable";
    InstanceState[InstanceState["Update"] = 6] = "Update";
    InstanceState[InstanceState["Playing"] = 7] = "Playing";
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
function saveInstancesData() {
    var _a;
    const instances = document.getElementById("instance-list").children;
    for (const e of instances) {
        // @ts-ignore
        instancesData[e.id] = {};
        // @ts-ignore
        instancesData[e.id]["state"] = e.getAttribute("state");
        // @ts-ignore
        instancesData[e.id]["dlCount"] = (_a = e.firstElementChild) === null || _a === void 0 ? void 0 : _a.style.left;
    }
    console.log(instancesData);
}
exports.saveInstancesData = saveInstancesData;
function restoreInstancesData() {
    const instances = document.getElementById("instance-list").children;
    for (const e of instances) {
        console.log(instancesData.hasOwnProperty(e.id));
        if (instancesData.hasOwnProperty(e.id)) {
            // @ts-ignore
            e.setAttribute("state", instancesData[e.id]["state"]);
            console.log(e.getAttribute("state"));
            //@ts-ignore
            console.log(Number(instancesData[e.id]["dlCount"].substring(0, instancesData[e.id]["dlCount"].length - 1)));
            // @ts-ignore
            updateInstanceDlProgress(e.id, Number(instancesData[e.id]["dlCount"].substring(0, instancesData[e.id]["dlCount"].length - 1)));
        }
    }
    instancesData = [];
}
exports.restoreInstancesData = restoreInstancesData;
function convertProfileToInstance(metadata, instanceData) {
    return __awaiter(this, void 0, void 0, function* () {
        const isVanilla = metadata["loader"] == null;
        yield createInstance(metadata["mcVersion"], {
            name: instanceData["name"],
            accentColor: instanceData["accentColor"],
            author: instanceData["author"],
            imagePath: yield (0, HDownload_1.downloadAsync)(instanceData["thumbnailPath"], path_1.default.join(const_1.instancesPath, instanceData["name"], "thumbnail" + path_1.default.extname(instanceData["thumbnailPath"]))),
            versionType: metadata["type"]
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
function retrieveDescription(id) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get description on file server
        return JSON.parse(yield promises_1.default.readFile(path_1.default.join(const_1.instancesPath, id, "info.json"), "utf-8")).instanceData.description;
    });
}
exports.retrieveDescription = retrieveDescription;
function retrievePosts(id) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get posts on file server
        return new Promise((resolve, reject) => {
            resolve("");
        });
    });
}
exports.retrievePosts = retrievePosts;
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
function verifyInstanceFromRemote(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const profiles = yield (0, HGitHub_1.listProfiles)();
        console.log(profiles); // @ts-ignore// @ts-ignore
        console.log(profiles.hasOwnProperty(name));
        // @ts-ignore
        if (!profiles.hasOwnProperty(name))
            return;
        const metadata = yield (0, HGitHub_1.getMetadataOf)(profiles[name]);
        console.log(metadata);
        // Delete files not in server side
        const folders = metadata["folders"];
        for (const folder of folders) {
            yield promises_1.default.rmdir(path_1.default.join(const_1.instancesPath, name, folder), { recursive: true });
        }
        // Download files not in the local side
        for (const fileData of metadata["files"]) {
            if (!(0, original_fs_1.existsSync)(path_1.default.join(const_1.instancesPath, name, fileData["path"]))) {
                yield (0, HDownload_1.downloadAsync)(fileData["url"], path_1.default.join(const_1.instancesPath, name, fileData["path"]));
                console.log("downloaded: " + fileData["path"] + " from " + fileData["url"]);
            }
        }
    });
}
exports.verifyInstanceFromRemote = verifyInstanceFromRemote;
