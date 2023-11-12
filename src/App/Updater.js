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
const HGitHub_1 = require("../Utils/HGitHub");
const HDownload_1 = require("../Utils/HDownload");
const remote_1 = require("@electron/remote");
const path_1 = __importDefault(require("path"));
const child_process_1 = __importDefault(require("child_process"));
const promises_1 = __importDefault(require("fs/promises"));
const window = require("../Interface/UIElements/scripts/window.js");
let githubReleaseData = null;
function checkForUpdate() {
    return __awaiter(this, void 0, void 0, function* () {
        githubReleaseData = yield (0, HGitHub_1.getLatestRelease)();
        const currentVersion = require("../../package.json").version;
        const latestVersion = githubReleaseData === null || githubReleaseData === void 0 ? void 0 : githubReleaseData.tag_name;
        if (currentVersion !== latestVersion) {
            console.log("Need to be updated!");
            const updateBtn = document.getElementById("update-btn");
            updateBtn.style.display = "flex";
            return;
        }
        console.log("Latest version already installed!");
    });
}
exports.checkForUpdate = checkForUpdate;
function updateCli() {
    return __awaiter(this, void 0, void 0, function* () {
        const loading = document.getElementById("loading-startup-launcher");
        window.setLoading(true);
        const dlUrl = githubReleaseData.assets[0].browser_download_url;
        const name = githubReleaseData.assets[0].name;
        console.log(remote_1.app.getPath("exe"));
        yield (0, HDownload_1.downloadAsync)(dlUrl, path_1.default.join(remote_1.app.getPath("temp"), name)).then((installerPath) => {
            var _a, _b;
            const child = child_process_1.default.exec(`${installerPath} /S /LAUNCH`);
            child.on("spawn", () => console.log("starting updating"));
            (_a = child.stdout) === null || _a === void 0 ? void 0 : _a.on("data", (data) => console.log(data));
            (_b = child.stderr) === null || _b === void 0 ? void 0 : _b.on("data", (data) => console.error(data));
            child.on("exit", () => __awaiter(this, void 0, void 0, function* () {
                console.log("finish updating");
                yield promises_1.default.rm(installerPath);
                remote_1.app.quit();
            }));
        });
    });
}
exports.updateCli = updateCli;
