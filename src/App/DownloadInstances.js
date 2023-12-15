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
exports.updateInstanceDlState = exports.refreshInstanceList = exports.setContentTo = exports.InstanceState = void 0;
const Utils_1 = require("../Utils/Utils");
const HRemoteProfiles_1 = require("../Utils/HRemoteProfiles");
const HInstance_1 = require("../Utils/HInstance");
const { openPopup } = require("../Interface/UIElements/scripts/window.js");
let instancesStates = {};
var InstanceState;
(function (InstanceState) {
    InstanceState[InstanceState["ToDownload"] = 0] = "ToDownload";
    InstanceState[InstanceState["Owned"] = 1] = "Owned";
    InstanceState[InstanceState["Loading"] = 2] = "Loading";
    InstanceState[InstanceState["Downloading"] = 3] = "Downloading";
    InstanceState[InstanceState["Verification"] = 4] = "Verification";
    InstanceState[InstanceState["Patching"] = 5] = "Patching";
})(InstanceState = exports.InstanceState || (exports.InstanceState = {}));
function setContentTo(name) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const currentState = instancesStates.hasOwnProperty(name) ? instancesStates[name] : InstanceState.ToDownload;
            const dlInfoData = (yield (0, HRemoteProfiles_1.listProfiles)())[name];
            const instanceData = yield (0, HRemoteProfiles_1.getInstanceDataOf)(name);
            const metadata = yield (0, HRemoteProfiles_1.getMetadataOf)(name);
            const serverBrandLogo = document.getElementById("dl-page-server-brand-logo");
            serverBrandLogo.setAttribute("src", `${(0, Utils_1.replaceAll)(dlInfoData["coverUrl"], '\\', '/')}`);
            // Set version
            const widgetVersion = document.getElementById("dl-page-version");
            if (widgetVersion) {
                const widgetText = document.createElement("p");
                widgetText.innerText = `${metadata["type"]} ${metadata["mcVersion"]}`;
                widgetVersion.append(widgetText);
            }
            const dlBtn = document.getElementById("download-instance-action");
            const iconBtn = dlBtn.querySelector("img");
            switch (currentState) {
                case InstanceState.ToDownload:
                    dlBtn.style.backgroundColor = "#FF0000";
                    iconBtn.setAttribute("src", "./resources/svg/download.svg");
                    break;
                case InstanceState.Loading || InstanceState.Patching || InstanceState.Downloading || InstanceState.Verification:
                    dlBtn.style.backgroundColor = "#5C5C5C";
                    iconBtn.setAttribute("src", "./resources/svg/loading.svg");
                    break;
                case InstanceState.Owned:
                    dlBtn.style.backgroundColor = "#05E400";
                    iconBtn.setAttribute("src", "./resources/svg/play.svg");
                    break;
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
                for (const instance in profiles) {
                    console.log(instance);
                    const element = yield (0, HInstance_1.addInstanceElement)({ name: profiles[instance]["name"], thumbnailPath: profiles[instance]["thumbnailPath"], coverPath: profiles[instance]["coverUrl"], version: profiles[instance]["thumbnailPath"] }, instancesDiv);
                    element.addEventListener("click", () => {
                        setContentTo(profiles[instance]["name"]);
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
function updateInstanceDlState(name, newState) {
    return __awaiter(this, void 0, void 0, function* () {
        const instance = document.getElementById(name);
        instancesStates[name] = newState;
        yield setContentTo(name);
    });
}
exports.updateInstanceDlState = updateInstanceDlState;
