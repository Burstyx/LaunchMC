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
exports.getInstanceData = exports.makeInstanceDownloading = exports.makeInstanceDownloaded = exports.getInstancesList = exports.addInstanceElement = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const const_1 = require("../Helper/const");
function addInstanceElement(imagePath, title, instanceDiv) {
    instanceDiv.appendChild(generateInstanceBtn(imagePath, title));
}
exports.addInstanceElement = addInstanceElement;
function generateInstanceBtn(imagePath, title) {
    let element = document.createElement("div");
    let titleElement = document.createElement("p");
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
function getInstancesList(instancesDiv) {
    return __awaiter(this, void 0, void 0, function* () {
        instancesDiv.innerHTML = "";
        if ((0, fs_1.existsSync)(const_1.instancesPath)) {
            const instances = yield promises_1.default.readdir(const_1.instancesPath);
            for (const e in instances) {
                if ((0, fs_1.existsSync)(path_1.default.join(const_1.instancesPath, instances[e], "info.json"))) {
                    const data = JSON.parse(yield promises_1.default.readFile(path_1.default.join(const_1.instancesPath, instances[e], "info.json"), "utf-8"));
                    addInstanceElement(data["imagePath"], instances[e], instancesDiv);
                }
            }
        }
    });
}
exports.getInstancesList = getInstancesList;
function makeInstanceDownloaded(id, instancesDiv) {
    for (let i = 0; i < instancesDiv.childElementCount; i++) {
        if (instancesDiv.children[i].children[0].innerHTML == id) {
            instancesDiv.children[i].className = "instance";
        }
    }
}
exports.makeInstanceDownloaded = makeInstanceDownloaded;
function makeInstanceDownloading(id, instancesDiv) {
    for (let i = 0; i < instancesDiv.childElementCount; i++) {
        console.log(instancesDiv.children[i].children[0].innerHTML);
        if (instancesDiv.children[i].children[0].innerHTML == id) {
            instancesDiv.children[i].className = "instance downloading";
        }
    }
}
exports.makeInstanceDownloading = makeInstanceDownloading;
function getInstanceData(instanceId) {
    return __awaiter(this, void 0, void 0, function* () {
        if ((0, fs_1.existsSync)(path_1.default.join(const_1.instancesPath))) {
            const instances = yield promises_1.default.readdir(const_1.instancesPath);
            for (const e in instances) {
                if (instances[e] == instanceId) {
                    const data = yield promises_1.default.readFile(path_1.default.join(const_1.instancesPath, instances[e], "info.json"), "utf-8");
                    return { "data": JSON.parse(data), "gamePath": path_1.default.join(const_1.instancesPath, instances[e]) };
                }
            }
        }
    });
}
exports.getInstanceData = getInstanceData;
