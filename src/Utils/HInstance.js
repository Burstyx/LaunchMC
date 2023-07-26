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
exports.updateInstanceDlState = exports.InstanceState = exports.updateInstanceDlProgress = exports.getInstanceById = exports.getInstanceData = exports.refreshInstanceList = exports.setContentTo = exports.createInstance = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const const_1 = require("../Utils/const");
const HFileManagement_1 = require("./HFileManagement");
const original_fs_1 = require("original-fs");
const color_1 = __importDefault(require("color"));
function addInstanceElement(imagePath, title, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const instanceDiv = document.getElementById("instance-list");
        const instanceElement = yield generateInstanceBtn(imagePath, title, id);
        instanceDiv.appendChild(instanceElement);
    });
}
function createInstance(version, instanceInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, HFileManagement_1.makeDir)(path_1.default.join(const_1.instancesPath, instanceInfo["id"]));
        // TODO Instance opt in folder
        yield promises_1.default.writeFile(path_1.default.join(const_1.instancesPath, instanceInfo["id"], "info.json"), JSON.stringify({ "instanceData": { "name": instanceInfo["name"], "imagePath": instanceInfo["imagePath"], "author": instanceInfo["author"], "accentColor": instanceInfo["accentColor"],
                "playtime": 0, "lastplayed": "Never", "description": null }, "gameData": { "version": version,
                "modloader": instanceInfo["modloader"] } }));
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
        instanceElement.classList.add("img-btn", "interactable", "instance");
        instanceElement.style.backgroundImage = `linear-gradient(90deg, black 0%, rgba(0, 0, 0, 0) 100%), url(${imagePath})`;
        instanceElement.id = id;
        // Download track div
        let dlTrackerElement = document.createElement("div");
        dlTrackerElement.classList.add("dltracker");
        dlTrackerElement.style.position = "absolute";
        dlTrackerElement.style.top = "0";
        dlTrackerElement.style.left = "100%";
        dlTrackerElement.style.width = "100%";
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
        return instanceElement;
    });
}
let currentContentId = null;
function setContentTo(id) {
    return __awaiter(this, void 0, void 0, function* () {
        currentContentId = id;
        const instance = document.getElementById(id);
        const currentState = instance === null || instance === void 0 ? void 0 : instance.getAttribute("state");
        const data = yield getInstanceData(id);
        const content = document.getElementById("content");
        content.style.display = "none";
        const loading = document.getElementById("instance-info-loading");
        loading.style.display = "auto";
        if (data == null) {
            return;
        }
        const instanceData = data["data"]["instanceData"];
        const gameData = data["data"]["gameData"];
        const contentTitle = document.getElementById("instance-title");
        const contentAuthor = document.getElementById("instance-author");
        contentTitle.innerText = instanceData["name"];
        contentAuthor.innerText = instanceData["author"];
        const widgetVersion = document.getElementById("widget-version");
        widgetVersion.innerText = gameData["version"];
        const widgetModloader = document.getElementById("widget-modloader");
        widgetModloader.innerText = gameData["modloader"];
        const widgetPlaytime = document.getElementById("widget-playtime");
        let h, m;
        const timeInMiliseconds = instanceData["playtime"];
        h = Math.floor(timeInMiliseconds / 1000 / 60 / 60);
        m = Math.floor((timeInMiliseconds / 1000 / 60 / 60 - h) * 60);
        m < 10 ? m = `0${m}` : m = `${m}`;
        h < 10 ? h = `0${h}` : h = `${h}`;
        widgetPlaytime.innerText = `${h}h${m}`;
        const widgetLastplayed = document.getElementById("widget-lastplayed"); // FIXME: Don't work
        widgetLastplayed.innerText = instanceData["lastplayed"];
        const widgetDesc = document.getElementById("widget-description"); // TODO: Write md rules
        widgetDesc.innerText = instanceData["description"];
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
        const contentBackground = document.getElementById("content-background");
        contentBackground.style.backgroundImage = `linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, black calc(100% + 1px)),
    url(${instanceData["imagePath"]})`;
        loading.style.display = "none";
        content.style.display = "flex";
    });
}
exports.setContentTo = setContentTo;
function refreshInstanceList() {
    return __awaiter(this, void 0, void 0, function* () {
        const instancesDiv = document.getElementById("instance-list");
        instancesDiv.innerHTML = "";
        if ((0, original_fs_1.existsSync)(const_1.instancesPath)) {
            const instances = yield promises_1.default.readdir(const_1.instancesPath);
            for (const e in instances) {
                if ((0, original_fs_1.existsSync)(path_1.default.join(const_1.instancesPath, instances[e], "info.json"))) {
                    const data = yield promises_1.default.readFile(path_1.default.join(const_1.instancesPath, instances[e], "info.json"), "utf8");
                    const dataJson = JSON.parse(data);
                    yield addInstanceElement(dataJson["instanceData"]["imagePath"], dataJson["instanceData"]["name"], instances[e]);
                }
            }
        }
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
    //@ts-ignore
    dlTracker.style.left = `${progress}%`;
}
exports.updateInstanceDlProgress = updateInstanceDlProgress;
var InstanceState;
(function (InstanceState) {
    InstanceState[InstanceState["Loading"] = 0] = "Loading";
    InstanceState[InstanceState["Downloading"] = 1] = "Downloading";
    InstanceState[InstanceState["Playable"] = 2] = "Playable";
    InstanceState[InstanceState["Update"] = 3] = "Update";
    InstanceState[InstanceState["Playing"] = 4] = "Playing";
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
// DEBUG ZONE
// document.addEventListener("dblclick", (e) => {
//     updateInstanceDlState("cbffedb1-8ef6-4cab-b7bf-a9fdb83d453c", InstanceState.Downloading)
//     setTimeout(() => {
//         updateInstanceDlState("cbffedb1-8ef6-4cab-b7bf-a9fdb83d453c", InstanceState.Loading)
//         setTimeout(() => {
//             updateInstanceDlState("cbffedb1-8ef6-4cab-b7bf-a9fdb83d453c", InstanceState.Playable)
//             setTimeout(() => {
//                 updateInstanceDlState("cbffedb1-8ef6-4cab-b7bf-a9fdb83d453c", InstanceState.Playing)
//                  setTimeout(() => {
//                     updateInstanceDlState("cbffedb1-8ef6-4cab-b7bf-a9fdb83d453c", InstanceState.Update)
//                 }, 2000)
//             }, 2000)
//         }, 2000)
//     }, 2000)
// })
