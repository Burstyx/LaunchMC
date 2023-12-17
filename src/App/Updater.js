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
exports.updateCli = exports.checkForUpdate = void 0;
const HRemoteProfiles_1 = require("../Utils/HRemoteProfiles");
const HDownload_1 = require("../Utils/HDownload");
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const child_process_1 = __importDefault(require("child_process"));
const promises_1 = __importDefault(require("fs/promises"));
const window = require("../Interface/UIElements/scripts/window.js");
let githubReleaseData = null;
function checkForUpdate() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield (0, HRemoteProfiles_1.getLatestRelease)().then((res) => {
                const currentVersion = require("../../package.json").version;
                const latestVersion = res["tag_name"];
                if (currentVersion !== latestVersion) {
                    const settings = document.getElementById("settings");
                    settings.setAttribute("badge", "");
                    resolve(true);
                }
                resolve(false);
            }).catch((err) => reject(err));
        }));
    });
}
exports.checkForUpdate = checkForUpdate;
function updateCli() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const dlUrl = githubReleaseData["assets"][0]["browser_download_url"];
            const name = githubReleaseData["assets"][0]["name"];
            yield (0, HDownload_1.downloadAsync)(dlUrl, path_1.default.join(electron_1.app.getPath("temp"), name)).then((installerPath) => {
                const child = child_process_1.default.exec(`${installerPath} /S /LAUNCH`);
                child.on("error", (err) => {
                    reject(err);
                });
                child.on("exit", () => __awaiter(this, void 0, void 0, function* () {
                    yield promises_1.default.rm(installerPath).finally(() => electron_1.app.quit());
                }));
            }).catch((err) => reject(err));
        }));
    });
}
exports.updateCli = updateCli;
