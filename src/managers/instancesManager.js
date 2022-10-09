"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshInstancesList = void 0;
const fs_1 = __importDefault(require("fs"));
const { instancesPath } = require("../utils/const");
function refreshInstancesList(imagePath, title, id, instanceDiv) {
    console.log(fs_1.default.readdirSync(instancesPath));
    instanceDiv.appendChild(generateInstanceBtn(imagePath, title));
}
exports.refreshInstancesList = refreshInstancesList;
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
