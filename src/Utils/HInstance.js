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
exports.updateInstanceState = exports.InstanceState = exports.getInstanceById = exports.getInstanceData = exports.refreshInstanceList = exports.setContentTo = exports.createInstance = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const const_1 = require("../Utils/const");
const HFileManagement_1 = require("./HFileManagement");
const original_fs_1 = require("original-fs");
const color_1 = __importDefault(require("color"));
function addInstanceElement(imagePath, title, id) {
    const instanceDiv = document.getElementById("instance-list");
    instanceDiv.appendChild(generateInstanceBtn(imagePath, title, id));
}
function createInstance(version, instanceInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, HFileManagement_1.makeDir)(path_1.default.join(const_1.instancesPath, instanceInfo["id"]));
        // TODO Instance opt in folder
        yield promises_1.default.writeFile(path_1.default.join(const_1.instancesPath, instanceInfo["id"], "info.json"), JSON.stringify({ "instanceData": { "name": instanceInfo["name"], "imagePath": instanceInfo["imagePath"], "author": instanceInfo["author"], "accentColor": instanceInfo["accentColor"],
                "playtime": 0, "lastplayed": "-1", "description": instanceInfo["description"] }, "gameData": { "version": version,
                "modloader": instanceInfo["modloader"] } }));
        addInstanceElement(instanceInfo["imagePath"], instanceInfo["name"], instanceInfo["id"]);
    });
}
exports.createInstance = createInstance;
function generateInstanceBtn(imagePath, title, id) {
    let instanceElement = document.createElement("div");
    if (title.length > 20) {
        title = title.substring(0, 23);
        title += "...";
    }
    instanceElement.innerText = title;
    instanceElement.classList.add("img-btn", "interactable", "instance");
    instanceElement.style.backgroundImage = `linear-gradient(90deg, black 0%, rgba(0, 0, 0, 0) 100%), url(${imagePath})`;
    instanceElement.id = id;
    instanceElement.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        yield setContentTo(id);
        (_a = document.querySelector(".instance.active")) === null || _a === void 0 ? void 0 : _a.classList.remove("active");
        instanceElement.classList.add("active");
    }));
    return instanceElement;
}
function setContentTo(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield getInstanceData(id);
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
        const widgetLastplayed = document.getElementById("widget-lastplayed"); // Don't work
        widgetLastplayed.innerText = instanceData["lastplayed"];
        const widgetDesc = document.getElementById("widget-description"); // Write md rules
        widgetDesc.innerText = instanceData["description"];
        const launchBtn = document.getElementById("launchbtn");
        const accentColor = instanceData["accentColor"];
        launchBtn.style.backgroundColor = accentColor;
        const color = (0, color_1.default)(accentColor);
        const borderColor = color.darken(-.25).hex();
        contentAuthor.style.color = accentColor;
        launchBtn.style.border = `solid ${borderColor}`;
        launchBtn.style.boxShadow = `0 0 10px 1px ${accentColor}`;
        const contentBackground = document.getElementById("content-background");
        contentBackground.style.backgroundImage = `linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, black calc(100% + 1px)),
    url(${instanceData["imagePath"]})`;
    });
}
exports.setContentTo = setContentTo;
function refreshInstanceList() {
    return __awaiter(this, void 0, void 0, function* () {
        const instancesDiv = document.getElementById("instance-list");
        instancesDiv.innerHTML = "";
        if ((0, original_fs_1.existsSync)(const_1.instancesPath)) {
            const instances = yield promises_1.default.readdir(const_1.instancesPath);
            const content = document.getElementById("content");
            content.style.display = "flex";
            for (const e in instances) {
                if ((0, original_fs_1.existsSync)(path_1.default.join(const_1.instancesPath, instances[e], "info.json"))) {
                    const data = yield promises_1.default.readFile(path_1.default.join(const_1.instancesPath, instances[e], "info.json"), "utf8");
                    const dataJson = JSON.parse(data);
                    addInstanceElement(dataJson["instanceData"]["imagePath"], dataJson["instanceData"]["name"], instances[e]);
                }
            }
            setContentTo(instancesDiv.children[0].id);
            instancesDiv.children[0].classList.add("active");
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
var InstanceState;
(function (InstanceState) {
    InstanceState[InstanceState["Downloading"] = 0] = "Downloading";
    InstanceState[InstanceState["Playing"] = 1] = "Playing";
    InstanceState[InstanceState["Loading"] = 2] = "Loading";
    InstanceState[InstanceState["Inactive"] = 3] = "Inactive";
})(InstanceState = exports.InstanceState || (exports.InstanceState = {}));
function updateInstanceState(instanceId, newState) {
    const instance = getInstanceById(instanceId);
    if (instance == null) {
        return;
    }
    switch (newState) {
        case InstanceState.Downloading:
            instance.className = "instance downloading";
            break;
        case InstanceState.Loading:
            instance.className = "instance loading";
            break;
        case InstanceState.Playing:
            instance.className = "instance playing";
            break;
        case InstanceState.Inactive:
            instance.className = "instance";
            break;
    }
}
exports.updateInstanceState = updateInstanceState;
