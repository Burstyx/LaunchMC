"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstancesList = exports.addInstanceElement = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const { instancesPath } = require("../utils/const");
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
    instancesDiv.innerHTML = "";
    if (fs_1.default.existsSync(instancesPath)) {
        const instances = fs_1.default.readdirSync(instancesPath);
        for (const e in instances) {
            if (fs_1.default.existsSync(path_1.default.join(instancesPath, instances[e], "info.json"))) {
                const data = JSON.parse(fs_1.default.readFileSync(path_1.default.join(instancesPath, instances[e], "info.json"), "utf-8"));
                addInstanceElement(data["imagePath"], instances[e], instancesDiv);
            }
        }
    }
}
exports.getInstancesList = getInstancesList;
