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
exports.updateInstanceState = exports.refreshInstanceList = exports.setContentTo = exports.InstanceState = exports.currentInstanceOpened = exports.instancesStates = void 0;
const Utils_1 = require("../Utils/Utils");
const HRemoteProfiles_1 = require("../Utils/HRemoteProfiles");
const HInstance_1 = require("../Utils/HInstance");
const fs_1 = require("fs");
const const_1 = require("../Utils/const");
const path_1 = __importDefault(require("path"));
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
            yield (0, HRemoteProfiles_1.listProfiles)().then((profiles) => __awaiter(this, void 0, void 0, function* () {
                const serverBrandLogo = document.getElementById("dl-page-server-brand-logo");
                if (serverBrandLogo)
                    serverBrandLogo.setAttribute("src", `${(0, Utils_1.replaceAll)(profiles[name]["brandLogoUrl"], '\\', '/')}`);
                const widgetVersion = document.getElementById("dl-page-version");
                if (widgetVersion) {
                    widgetVersion.innerHTML = "";
                    const widgetText = document.createElement("p");
                    yield (0, HRemoteProfiles_1.getMetadataOf)(name).then((metadata) => {
                        widgetText.innerText = `${metadata["type"]} ${metadata["mcVersion"]}`;
                    }).catch((err) => reject(err));
                    widgetVersion.append(widgetText);
                }
                const contentBackground = document.getElementById("dl-page-thumbnail");
                if (contentBackground)
                    contentBackground.style.backgroundImage = `url('${(0, Utils_1.replaceAll)(profiles[name]["thumbnailUrl"], '\\', '/')}')`;
                resolve();
            })).catch((err) => reject(err));
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
                const loading = document.createElement("img");
                loading.setAttribute("src", "./resources/svg/loading.svg");
                instancesDiv.append(loading);
                yield (0, HRemoteProfiles_1.listProfiles)().then((profiles) => {
                    instancesDiv.innerHTML = "";
                    for (const instanceName in profiles) {
                        const element = (0, HInstance_1.addInstanceElement)({
                            name: instanceName,
                            thumbnailPath: profiles[instanceName]["thumbnailPath"],
                            logoPath: profiles[instanceName]["coverUrl"],
                            version: profiles[instanceName]["thumbnailPath"]
                        }, instancesDiv);
                        if ((0, fs_1.existsSync)(path_1.default.join(const_1.serversInstancesPath, instanceName, "info.json"))) {
                            exports.instancesStates[instanceName] = InstanceState.Owned;
                        }
                        element.addEventListener("click", () => {
                            exports.currentInstanceOpened = instanceName;
                            setContentTo(instanceName);
                            openPopup("download-instance-info");
                        });
                    }
                }).catch((err) => reject(err));
                resolve();
            }
            else
                reject();
        }));
    });
}
exports.refreshInstanceList = refreshInstanceList;
function updateInstanceState(name, newState) {
    exports.instancesStates[name] = newState;
    const dlBtn = document.getElementById("download-instance-action");
    if (dlBtn) {
        const iconBtn = dlBtn.querySelector("img");
        if (iconBtn) {
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
    }
}
exports.updateInstanceState = updateInstanceState;
