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
exports.updateInstanceState = exports.InstanceState = exports.getInstanceById = exports.getInstanceData = exports.refreshInstanceList = exports.createInstance = exports.addInstanceElement = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const const_1 = require("../Utils/const");
const HFileManagement_1 = require("./HFileManagement");
function addInstanceElement(imagePath, title, instanceDiv, id) {
    instanceDiv.appendChild(generateInstanceBtn(imagePath, title, id));
}
exports.addInstanceElement = addInstanceElement;
function createInstance(name, imagePath, id, version, versionData) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, HFileManagement_1.makeDir)(path_1.default.join(const_1.instancesPath, name));
        // TODO Instance opt in folder
        fs_1.default.writeFile(path_1.default.join(const_1.instancesPath, name, "info.json"), JSON.stringify({ "imagePath": imagePath, "version": version, "name": name, "assets_index_name": versionData["assetIndex"]["id"], "libraries": "", "id": id }), (err) => {
            console.error("Impossible d'écrire la configuration de l'instance " + err);
        });
        const instanceDiv = document.getElementById("instances");
        addInstanceElement(imagePath, name, instanceDiv, id);
    });
}
exports.createInstance = createInstance;
function generateInstanceBtn(imagePath, title, id) {
    let element = document.createElement("div");
    let titleElement = document.createElement("p");
    if (title.length > 12) {
        title = title.substring(0, 15);
        title += "...";
    }
    element.setAttribute("instanceid", id);
    titleElement.innerText = title;
    element.className = "instance";
    const instances = document.getElementById("instances");
    if (instances === null || instances === void 0 ? void 0 : instances.hasChildNodes()) {
        element.id = "element" + (instances === null || instances === void 0 ? void 0 : instances.children.length);
    }
    else {
        element.id = "element0";
    }
    let style = createStyleString(imagePath);
    element.setAttribute("style", style);
    element.appendChild(titleElement);
    return element;
}
function createStyleString(imagePath) {
    let style = `background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("${imagePath}");`;
    return style;
}
function refreshInstanceList(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const instancesDiv = document.getElementById("instances");
        instancesDiv.innerHTML = "";
        if (fs_1.default.existsSync(const_1.instancesPath)) {
            fs_1.default.readdir(const_1.instancesPath, (err, instances) => {
                for (const e in instances) {
                    if (fs_1.default.existsSync(path_1.default.join(const_1.instancesPath, instances[e], "info.json"))) {
                        fs_1.default.readFile(path_1.default.join(const_1.instancesPath, instances[e], "info.json"), "utf-8", (err, data) => {
                            const dataJson = JSON.parse(data);
                            addInstanceElement(dataJson["imagePath"], instances[e], instancesDiv, id);
                        });
                    }
                }
            });
        }
    });
}
exports.refreshInstanceList = refreshInstanceList;
function getInstanceData(instanceId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (fs_1.default.existsSync(const_1.instancesPath)) {
            const instances = fs_1.default.readdirSync(const_1.instancesPath);
            for (const e in instances) {
                const data = fs_1.default.readFileSync(path_1.default.join(const_1.instancesPath, instances[e], "info.json"), "utf-8");
                const id = JSON.parse(data)["id"];
                if (id == instanceId) {
                    return { "data": JSON.parse(data), "gamePath": path_1.default.join(const_1.instancesPath, instances[e]) };
                }
            }
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
