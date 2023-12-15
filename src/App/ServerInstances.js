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
exports.updateInstanceDlState = exports.InstanceState = exports.getInstanceData = exports.refreshInstanceList = exports.setContentTo = exports.createInstance = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const const_1 = require("../Utils/const");
const Utils_1 = require("../Utils/Utils");
const fs_1 = require("fs");
const HInstance_1 = require("../Utils/HInstance");
let instancesStates = {};
function createInstance(instanceOpts, loaderOpts) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield promises_1.default.mkdir(path_1.default.join(const_1.serversInstancesPath, instanceOpts.name), { recursive: true }).catch((err) => reject(err));
            let instanceConfiguration = {};
            // Default json configuration
            instanceConfiguration = {
                "instance": {
                    "name": instanceOpts.name,
                    "thumbnail_path": instanceOpts.thumbnailPath,
                    "cover_path": instanceOpts.coverPath,
                    "play_time": 0,
                },
                "game": {
                    "version": instanceOpts.version,
                }
            };
            if (loaderOpts) {
                let defaultLoaderJson = {
                    "loader": {
                        "name": loaderOpts.name,
                        "id": loaderOpts.id
                    }
                };
                instanceConfiguration = (0, Utils_1.concatJson)(instanceConfiguration, defaultLoaderJson);
            }
            // Write instance conf on disk
            yield promises_1.default.writeFile(path_1.default.join(const_1.serversInstancesPath, instanceOpts.name, "info.json"), JSON.stringify(instanceConfiguration)).catch((err) => reject(err));
            yield refreshInstanceList().catch((err) => reject(err));
            resolve();
        }));
    });
}
exports.createInstance = createInstance;
function setContentTo(name) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const currentState = instancesStates.hasOwnProperty(name) ? instancesStates[name] : InstanceState.Playable;
            yield getInstanceData(name).then((instanceJson) => {
                const instanceData = instanceJson["data"]["instance"];
                const gameData = instanceJson["data"]["game"];
                const loaderData = instanceJson["data"].hasOwnProperty("loader") ? instanceJson["data"]["loader"] : null;
                const serverBrandLogo = document.getElementById("server-brand-logo");
                serverBrandLogo.setAttribute("src", `${(0, Utils_1.replaceAll)(instanceData["cover_path"], '\\', '/')}`);
                // Set version
                const widgetVersion = document.getElementById("server-version");
                if (widgetVersion) {
                    const widgetText = document.createElement("p");
                    widgetText.innerText = `${loaderData ? loaderData["name"] : "Vanilla"} ${gameData["version"]}`;
                    widgetVersion.append(widgetText);
                }
                //const timeInMiliseconds = instanceData.playtime
                /*h = Math.floor(timeInMiliseconds / 1000 / 60 / 60);
                m = Math.floor((timeInMiliseconds / 1000 / 60 / 60 - h) * 60);
    
                m < 10 ? m = `0${m}` : m = `${m}`
                h < 10 ? h = `0${h}` : h = `${h}`
    
                widgetPlaytime.innerText = `${h}h${m}`*/
                const launchBtn = document.getElementById("server-instance-action");
                const iconBtn = launchBtn.querySelector("img");
                switch (currentState) {
                    case InstanceState.Playing:
                        launchBtn.style.backgroundColor = "#FF0000";
                        iconBtn.setAttribute("src", "./resources/svg/stop.svg");
                        break;
                    case InstanceState.Loading || InstanceState.DlAssets || InstanceState.Patching || InstanceState.Downloading || InstanceState.Verification:
                        launchBtn.style.backgroundColor = "#5C5C5C";
                        iconBtn.setAttribute("src", "./resources/svg/loading.svg");
                        break;
                    case InstanceState.Playable:
                        launchBtn.style.backgroundColor = "#05E400";
                        iconBtn.setAttribute("src", "./resources/svg/play.svg");
                        break;
                }
                const contentBackground = document.getElementById("local-instance-thumbnail");
                contentBackground.style.backgroundImage = `url('${(0, Utils_1.replaceAll)(instanceData["thumbnail_path"], '\\', '/')}')`;
            }).catch((err) => reject(err));
        }));
    });
}
exports.setContentTo = setContentTo;
function refreshInstanceList() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const instancesDiv = document.getElementById("own-servers");
            if (instancesDiv) {
                instancesDiv.innerHTML = "";
                yield promises_1.default.readdir(const_1.serversInstancesPath, { withFileTypes: true }).then((instances) => __awaiter(this, void 0, void 0, function* () {
                    for (const instance of instances) {
                        if ((0, fs_1.existsSync)(path_1.default.join(const_1.serversInstancesPath, instance.name, "info.json"))) {
                            const data = yield promises_1.default.readFile(path_1.default.join(const_1.serversInstancesPath, instance.name, "info.json"), "utf8");
                            const dataJson = JSON.parse(data);
                            const element = yield (0, HInstance_1.addInstanceElement)({ name: dataJson["instance"]["name"], thumbnailPath: dataJson["instance"]["thumbnail_path"], coverPath: dataJson["instance"]["cover_path"], version: dataJson["game"]["version"] }, instancesDiv);
                            element.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () { return yield setContentTo(instance.name); }));
                        }
                    }
                })).then(() => resolve()).catch((err) => reject(err));
            }
            else
                reject(`Unexpected error when refreshing instance list.`);
        }));
    });
}
exports.refreshInstanceList = refreshInstanceList;
function getInstanceData(name) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if ((0, fs_1.existsSync)(path_1.default.join(const_1.serversInstancesPath, name, "info.json"))) {
                yield promises_1.default.readFile(path_1.default.join(const_1.serversInstancesPath, name, "info.json"), "utf-8").then((data) => {
                    const dataJson = JSON.parse(data);
                    resolve({ "data": dataJson, "gamePath": path_1.default.join(const_1.serversInstancesPath, name) });
                }).catch((err) => reject(err));
            }
            else
                reject(`Configuration file of the instance "${name}" don't exist.`);
        }));
    });
}
exports.getInstanceData = getInstanceData;
var InstanceState;
(function (InstanceState) {
    InstanceState[InstanceState["Loading"] = 0] = "Loading";
    InstanceState[InstanceState["Downloading"] = 1] = "Downloading";
    InstanceState[InstanceState["Verification"] = 2] = "Verification";
    InstanceState[InstanceState["Patching"] = 3] = "Patching";
    InstanceState[InstanceState["DlAssets"] = 4] = "DlAssets";
    InstanceState[InstanceState["Playable"] = 5] = "Playable";
    InstanceState[InstanceState["Playing"] = 6] = "Playing";
})(InstanceState = exports.InstanceState || (exports.InstanceState = {}));
function updateInstanceDlState(name, newState) {
    return __awaiter(this, void 0, void 0, function* () {
        const instance = document.getElementById(name);
        instancesStates[name] = newState;
        yield setContentTo(name);
    });
}
exports.updateInstanceDlState = updateInstanceDlState;
