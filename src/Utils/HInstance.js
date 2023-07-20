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
exports.updateInstanceState = exports.InstanceState = exports.getInstanceById = exports.getInstanceData = exports.refreshInstanceList = exports.createInstance = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const const_1 = require("../Utils/const");
const HFileManagement_1 = require("./HFileManagement");
const original_fs_1 = require("original-fs");
function addInstanceElement(imagePath, title, instanceDiv, id) {
    instanceDiv.appendChild(generateInstanceBtn(imagePath, title, id));
}
function createInstance(name, imagePath, id, version, versionData) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, HFileManagement_1.makeDir)(path_1.default.join(const_1.instancesPath, name));
        // TODO Instance opt in folder
        yield promises_1.default.writeFile(path_1.default.join(const_1.instancesPath, name, "info.json"), JSON.stringify({ "imagePath": imagePath, "version": version, "name": name, "assets_index_name": versionData["assetIndex"]["id"], "id": id }));
        const instanceDiv = document.getElementById("instance-list");
        addInstanceElement(imagePath, name, instanceDiv, id);
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
    instanceElement.classList.add("img-btn", "interactable");
    instanceElement.style.backgroundImage = `linear-gradient(90deg, black 0%, rgba(0, 0, 0, 0) 100%), url(${imagePath})`;
    instanceElement.id = id;
    return instanceElement;
}
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
                    addInstanceElement(dataJson["imagePath"], dataJson["name"], instancesDiv, dataJson["id"]);
                }
            }
        }
    });
}
exports.refreshInstanceList = refreshInstanceList;
function getInstanceData(instanceName) {
    return __awaiter(this, void 0, void 0, function* () {
        if ((0, original_fs_1.existsSync)(const_1.instancesPath)) {
            const data = yield promises_1.default.readFile(path_1.default.join(const_1.instancesPath, instanceName, "info.json"), "utf-8");
            const dataJson = JSON.parse(data);
            return { "data": dataJson, "gamePath": path_1.default.join(const_1.instancesPath, instanceName) };
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
