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
exports.verifyInstanceFromRemote = exports.downloadServerInstance = exports.updateInstanceState = exports.getInstanceData = exports.refreshInstanceList = exports.setContentTo = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const const_1 = require("../Utils/const");
const Utils_1 = require("../Utils/Utils");
const HInstance_1 = require("../Utils/HInstance");
const fs_1 = require("fs");
const HInstance_2 = require("../Utils/HInstance");
const HRemoteProfiles_1 = require("../Utils/HRemoteProfiles");
const HDownload_1 = require("../Utils/HDownload");
const DownloadGame_1 = require("./DownloadGame");
const GameConsole_1 = require("./GameConsole");
const { openPopup } = require("../Interface/UIElements/scripts/window.js");
const { addNotification } = require("../Interface/UIElements/scripts/notification.js");
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
                    "logo_path": instanceOpts.logoPath,
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
function setContentTo(name) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        yield getInstanceData(name).then((instanceJson) => {
            const currentState = HInstance_1.instancesStates.hasOwnProperty(name) ? HInstance_1.instancesStates[name] : HInstance_1.InstanceState.Playable;
            const console = document.getElementById("instance-console");
            console.style.display = "flex";
            updateInstanceState(name, currentState);
            (0, HInstance_1.updateOpenedInstance)(name);
            const instanceData = instanceJson["data"]["instance"];
            const gameData = instanceJson["data"]["game"];
            const loaderData = instanceJson["data"].hasOwnProperty("loader") ? instanceJson["data"]["loader"] : null;
            const serverBrandLogo = document.querySelector(".brand-logo");
            serverBrandLogo.setAttribute("src", `${(0, Utils_1.replaceAll)(instanceData["logo_path"], '\\', '/')}`);
            // Set version
            /*const widgetVersion = document.getElementById("server-version")
            if(widgetVersion) {
                widgetVersion.innerHTML = ""

                const widgetText = document.createElement("p")
                widgetText.innerText = `${loaderData ? loaderData["name"] : "Vanilla"} ${gameData["version"]}`
                widgetVersion.append(widgetText)
            }*/
            (0, GameConsole_1.initConsole)(name);
            //const timeInMiliseconds = instanceData.playtime
            /*h = Math.floor(timeInMiliseconds / 1000 / 60 / 60);
            m = Math.floor((timeInMiliseconds / 1000 / 60 / 60 - h) * 60);

            m < 10 ? m = `0${m}` : m = `${m}`
            h < 10 ? h = `0${h}` : h = `${h}`

            widgetPlaytime.innerText = `${h}h${m}`*/
            const contentBackground = document.querySelector(".instance-thumbnail");
            if (contentBackground)
                contentBackground.style.backgroundImage = `url('${(0, Utils_1.replaceAll)(instanceData["thumbnail_path"], '\\', '/')}')`;
            resolve();
        }).catch((err) => reject(err));
    }));
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
                            yield promises_1.default.readFile(path_1.default.join(const_1.serversInstancesPath, instance.name, "info.json"), "utf8").then((data) => {
                                const dataJson = JSON.parse(data);
                                const element = (0, HInstance_2.addInstanceElement)({
                                    name: dataJson["instance"]["name"],
                                    thumbnailPath: dataJson["instance"]["thumbnail_path"],
                                    logoPath: dataJson["instance"]["cover_path"],
                                    version: dataJson["game"]["version"]
                                }, instancesDiv);
                                element.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                                    (0, HInstance_1.updateOpenedInstance)(dataJson["instance"]["name"]);
                                    yield setContentTo(dataJson["instance"]["name"]).then(() => openPopup("popup-instance-details")).catch((err) => addNotification(`Impossible d'afficher le contenu de l'instance ${dataJson["instance"]["name"]}.`, "error", err));
                                }));
                            }).catch((err) => reject(err));
                        }
                    }
                    resolve();
                })).catch((err) => reject(err));
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
function updateInstanceState(name, newState) {
    HInstance_1.instancesStates[name] = newState;
    const launchBtn = document.getElementById("instance-action");
    if (launchBtn) {
        const iconBtn = launchBtn.querySelector("img");
        if (iconBtn) {
            switch (newState) {
                case HInstance_1.InstanceState.Playing:
                    launchBtn.style.backgroundColor = "#FF0000";
                    iconBtn.setAttribute("src", "./resources/svg/stop.svg");
                    break;
                case HInstance_1.InstanceState.NeedUpdate:
                    launchBtn.style.backgroundColor = "#D73600";
                    iconBtn.setAttribute("src", "./resources/svg/update.svg");
                    break;
                case HInstance_1.InstanceState.Loading:
                    launchBtn.style.backgroundColor = "#5C5C5C";
                    iconBtn.setAttribute("src", "./resources/svg/loading.svg");
                    break;
                case HInstance_1.InstanceState.Playable:
                    launchBtn.style.backgroundColor = "#05E400";
                    iconBtn.setAttribute("src", "./resources/svg/play.svg");
                    break;
            }
        }
    }
}
exports.updateInstanceState = updateInstanceState;
function downloadServerInstance(instanceOpts) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield (0, HRemoteProfiles_1.getMetadataOf)(instanceOpts.name).then((metadata) => __awaiter(this, void 0, void 0, function* () {
                const isVanilla = !metadata.hasOwnProperty("loader");
                yield (0, DownloadGame_1.downloadMinecraft)(metadata["mcVersion"], instanceOpts.name).catch((err) => reject(err));
                if (!isVanilla) {
                    yield (0, DownloadGame_1.patchInstanceWithForge)(instanceOpts.name, metadata["mcVersion"], metadata["loader"]["id"]).catch((err) => reject(err));
                }
                // Download files
                for (const fileData of metadata["files"]) {
                    const ext = path_1.default.extname(fileData.path);
                    yield (0, HDownload_1.downloadAsync)(fileData.url, path_1.default.join(const_1.serversInstancesPath, instanceOpts.name, fileData.path), undefined, { decompress: ext === ".zip" }).catch((err) => reject(err));
                }
                yield createInstance({
                    name: instanceOpts.name,
                    logoPath: instanceOpts.logoPath,
                    thumbnailPath: instanceOpts.thumbnailPath,
                    version: metadata["mcVersion"]
                }, !isVanilla ? {
                    name: metadata["loader"]["name"],
                    id: metadata["loader"]["id"]
                } : undefined).catch((err) => reject(err));
                resolve();
            })).catch((err) => reject(err));
        }));
    });
}
exports.downloadServerInstance = downloadServerInstance;
function verifyInstanceFromRemote(name) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield (0, HRemoteProfiles_1.listProfiles)().then((profiles) => __awaiter(this, void 0, void 0, function* () {
                if (!profiles.hasOwnProperty(name))
                    reject();
                let metadata;
                yield (0, HRemoteProfiles_1.getMetadataOf)(name).then((res) => {
                    metadata = res;
                });
                if (!metadata)
                    reject();
                const folders = metadata["folders"];
                for (const folder of folders) {
                    yield promises_1.default.rmdir(path_1.default.join(const_1.serversInstancesPath, name, folder), { recursive: true }).catch((err) => reject(err));
                }
                for (const fileData of metadata["files"]) {
                    if (!(0, fs_1.existsSync)(path_1.default.join(const_1.serversInstancesPath, name, fileData["path"]))) {
                        yield (0, HDownload_1.downloadAsync)(fileData["url"], path_1.default.join(const_1.serversInstancesPath, name, fileData["path"])).catch((err) => reject(err));
                        console.log("downloaded: " + fileData["path"] + " from " + fileData["url"]);
                    }
                }
                resolve();
            })).catch((err) => reject(err));
        }));
    });
}
exports.verifyInstanceFromRemote = verifyInstanceFromRemote;
