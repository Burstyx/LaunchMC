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
exports.verifyInstanceFromRemote = exports.checkInstanceIntegrity = exports.checkForUpdate = exports.retrievePosts = exports.retrieveDescription = exports.convertProfileToInstance = exports.updateInstanceDlState = exports.InstanceState = exports.updateInstanceDlProgress = exports.getInstanceById = exports.getInstanceData = exports.refreshLocalInstanceList = exports.setContentTo = exports.createInstance = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const const_1 = require("../Utils/const");
const HFileManagement_1 = require("./HFileManagement");
const fs_1 = require("fs");
const color_1 = __importDefault(require("color"));
const Utils_1 = require("./Utils");
const DownloadGame_1 = require("../App/DownloadGame");
const HDownload_1 = require("./HDownload");
const HGitHub_1 = require("./HGitHub");
let instanceStates = {};
function addInstanceElement(imagePath, title) {
    return __awaiter(this, void 0, void 0, function* () {
        const instanceDiv = document.getElementById("instances");
        const instanceElement = yield generateInstanceBtn(imagePath, title);
        instanceDiv.appendChild(instanceElement);
    });
}
function createInstance(version, instanceInfo, loaderInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, HFileManagement_1.makeDir)(path_1.default.join(const_1.instancesPath, instanceInfo.name));
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
                "gameData": {
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
                "gameData": {
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
        yield promises_1.default.writeFile(path_1.default.join(const_1.instancesPath, instanceInfo.name, "info.json"), JSON.stringify(instanceConfiguration));
        // Update instance list
        yield refreshLocalInstanceList();
    });
}
exports.createInstance = createInstance;
function generateInstanceBtn(imagePath, title) {
    return __awaiter(this, void 0, void 0, function* () {
        const instanceElement = document.createElement("div");
        // Instance text
        const titleElement = document.createElement("p");
        titleElement.innerText = title;
        instanceElement.append(titleElement);
        // Instance Btn
        instanceElement.id = title;
        instanceElement.classList.add("instance");
        instanceElement.style.backgroundImage = `linear-gradient(transparent, rgba(0, 0, 0, 0.85)), url('${(0, Utils_1.replaceAll)(imagePath, '\\', '/')}'))`;
        instanceElement.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            yield setContentTo(title);
        }));
        /*instanceElement.addEventListener("mousedown", (e) => {
            if(e.button === 2) {
                // @ts-ignore
                const id = e.target.id
                // @ts-ignore
                const state = e.target.getAttribute("state")
    
                const rcMenu = document.getElementById("rcmenu-instance")
                // @ts-ignore
                rcMenu.style.top = e.clientY + "px"
                // @ts-ignore
                rcMenu.style.left = e.clientX + "px"
                // @ts-ignore
                rcMenu.style.display = "flex"
    
                document.getElementById("rc_delete_instance")!.onclick = async (e) => {
                    if(state === InstanceState[InstanceState.Playable]) {
                        await fs.rm(path.join(instancesPath, id), {recursive: true})
                        await refreshLocalInstanceList()
                    } else {
                        console.log("Can't delete an instance which is occupied")
                    }
                }
    
                document.getElementById("rc_open_instance_folder")!.onclick = (e) => {
                    cp.exec(`start "" "${path.join(instancesPath, id)}"`)
                }
            }
        })*/
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
function refreshLocalInstanceList() {
    return __awaiter(this, void 0, void 0, function* () {
        const instancesDiv = document.getElementById("instances");
        instancesDiv.innerHTML = "";
        if ((0, fs_1.existsSync)(const_1.localInstancesPath)) {
            const instances = yield promises_1.default.readdir(const_1.localInstancesPath, { withFileTypes: true });
            for (const file of instances) {
                if (file.isDirectory() && (0, fs_1.existsSync)(path_1.default.join(const_1.localInstancesPath, file.name, "info.json"))) {
                    const data = yield promises_1.default.readFile(path_1.default.join(const_1.localInstancesPath, file.name, "info.json"), "utf8");
                    const dataJson = JSON.parse(data);
                    yield addInstanceElement(dataJson["instance"]["thumbnail_path"], dataJson["instance"]["name"]);
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
            if (!(0, fs_1.existsSync)(path_1.default.join(const_1.instancesPath, name, fileData["path"]))) {
                yield (0, HDownload_1.downloadAsync)(fileData["url"], path_1.default.join(const_1.instancesPath, name, fileData["path"]));
                console.log("downloaded: " + fileData["path"] + " from " + fileData["url"]);
            }
        }
    });
}
exports.verifyInstanceFromRemote = verifyInstanceFromRemote;
