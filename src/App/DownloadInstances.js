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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInstanceState = exports.refreshInstanceList = exports.setContentTo = exports.InstanceState = exports.currentInstanceOpened = exports.instancesStates = void 0;
const Utils_1 = require("../Utils/Utils");
const HRemoteProfiles_1 = require("../Utils/HRemoteProfiles");
const HInstance_1 = require("../Utils/HInstance");
const { openPopup } = require("../Interface/UIElements/scripts/window.js");
exports.instancesStates = {};
exports.currentInstanceOpened = null;
var InstanceState;
(function (InstanceState) {
    InstanceState[InstanceState["ToDownload"] = 0] = "ToDownload";
    InstanceState[InstanceState["Owned"] = 1] = "Owned";
    InstanceState[InstanceState["Loading"] = 2] = "Loading";
})(InstanceState = exports.InstanceState || (exports.InstanceState = {}));
function setContentTo(name) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const currentState = exports.instancesStates.hasOwnProperty(name) ? exports.instancesStates[name] : InstanceState.ToDownload;
            updateInstanceState(name, currentState);
            const dlInfoData = (yield (0, HRemoteProfiles_1.listProfiles)())[name];
            const metadata = yield (0, HRemoteProfiles_1.getMetadataOf)(name);
            const serverBrandLogo = document.getElementById("dl-page-server-brand-logo");
            serverBrandLogo.setAttribute("src", `${(0, Utils_1.replaceAll)(dlInfoData["brandLogoUrl"], '\\', '/')}`);
            // Set version
            const widgetVersion = document.getElementById("dl-page-version");
            if (widgetVersion) {
                widgetVersion.innerHTML = "";
                const widgetText = document.createElement("p");
                widgetText.innerText = `${metadata["type"]} ${metadata["mcVersion"]}`;
                widgetVersion.append(widgetText);
            }
            const contentBackground = document.getElementById("dl-page-thumbnail");
            contentBackground.style.backgroundImage = `url('${(0, Utils_1.replaceAll)(dlInfoData["thumbnailUrl"], '\\', '/')}')`;
            resolve();
        }));
    });
}
exports.setContentTo = setContentTo;
function refreshInstanceList() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const instancesDiv = document.getElementById("avail-servers");
            if (instancesDiv) {
                instancesDiv.innerHTML = "";
                const profiles = yield (0, HRemoteProfiles_1.listProfiles)();
                console.log(profiles);
                for (const instanceName in profiles) {
                    const element = yield (0, HInstance_1.addInstanceElement)({
                        name: instanceName,
                        thumbnailPath: profiles[instanceName]["thumbnailPath"],
                        logoPath: profiles[instanceName]["coverUrl"],
                        version: profiles[instanceName]["thumbnailPath"]
                    }, instancesDiv);
                    element.addEventListener("click", () => {
                        exports.currentInstanceOpened = instanceName;
                        setContentTo(instanceName);
                        openPopup("download-instance-info");
                    });
                }
                resolve();
            }
            else
                reject(`Unexpected error when refreshing instance list.`);
        }));
    });
}
exports.refreshInstanceList = refreshInstanceList;
function updateInstanceState(name, newState) {
    const instance = document.getElementById(name);
    exports.instancesStates[name] = newState;
    const dlBtn = document.getElementById("download-instance-action");
    const iconBtn = dlBtn.querySelector("img");
    switch (newState) {
        case InstanceState.ToDownload:
            dlBtn.style.backgroundColor = "#05E400";
            iconBtn.setAttribute("src", "./resources/svg/download.svg");
            break;
        case InstanceState.Loading:
            dlBtn.style.backgroundColor = "#5C5C5C";
            iconBtn.setAttribute("src", "./resources/svg/loading.svg");
            break;
        case InstanceState.Owned:
            dlBtn.style.backgroundColor = "#05E400";
            iconBtn.setAttribute("src", "./resources/svg/checkmark.svg");
            break;
    }
}
exports.updateInstanceState = updateInstanceState;
