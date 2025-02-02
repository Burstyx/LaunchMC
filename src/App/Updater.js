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
exports.updateCli = exports.checkForUpdate = exports.newVersion = exports.updateAvailable = void 0;
const HRemoteProfiles_1 = require("../Utils/HRemoteProfiles");
const HDownload_1 = require("../Utils/HDownload");
const remote_1 = require("@electron/remote");
const path_1 = __importDefault(require("path"));
const child_process_1 = __importDefault(require("child_process"));
const window = require("../Interface/UIElements/scripts/window.js");
const { addNotification } = require("../Interface/UIElements/scripts/notification.js");
let githubReleaseData = null;
exports.updateAvailable = false;
function checkForUpdate() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield (0, HRemoteProfiles_1.getLatestRelease)().then((res) => {
                const currentVersion = require("../../package.json").version;
                const latestVersion = res["tag_name"];
                githubReleaseData = res;
                exports.updateAvailable = currentVersion !== latestVersion;
                exports.newVersion = latestVersion;
                resolve(exports.updateAvailable);
            }).catch((err) => reject(err));
        }));
    });
}
exports.checkForUpdate = checkForUpdate;
function updateCli() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (githubReleaseData) {
                const dlUrl = githubReleaseData["assets"][0]["browser_download_url"];
                const name = githubReleaseData["assets"][0]["name"];
                yield (0, HDownload_1.downloadAsync)(dlUrl, path_1.default.join(remote_1.app.getPath("temp"), name)).then((installerPath) => __awaiter(this, void 0, void 0, function* () {
                    const child = child_process_1.default.spawn(`${installerPath}`, { detached: true });
                    child.on("spawn", () => {
                        remote_1.app.quit();
                    });
                })).catch((err) => reject(err));
            }
            else {
                addNotification(`Impossible de mettre à jour le client, effectuez une vérification de mise à jour avant d'en lancer une.`, "error", undefined);
            }
        }));
    });
}
exports.updateCli = updateCli;
