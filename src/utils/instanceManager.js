"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInstanceBtn = void 0;
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
exports.generateInstanceBtn = generateInstanceBtn;
function createStyleString(imagePath) {
    let style = `background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("${imagePath}");`;
    return style;
}
