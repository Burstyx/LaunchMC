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
exports.generateProfileBtn = void 0;
const HGitHub_1 = require("./HGitHub");
const HInstance_1 = require("./HInstance");
const HDownload_1 = require("./HDownload");
const remote_1 = require("@electron/remote");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
function generateProfileBtn() {
    return __awaiter(this, void 0, void 0, function* () {
        const profiles = yield (0, HGitHub_1.listProfiles)();
        const profileList = document.getElementById("profile-list");
        profileList.innerHTML = "";
        for (const profile of profiles) {
            const profileElement = document.createElement("div");
            profileElement.classList.add("default-btn", "interactable", "profile");
            profileElement.style.width = "200px";
            profileElement.style.height = "100px";
            profileElement.innerText = profile.name;
            profileElement.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
                const dlUrl = profile.download_url;
                const profilePath = yield (0, HDownload_1.downloadAsync)(dlUrl, path_1.default.join(remote_1.app.getPath("temp"), profile.name));
                yield (0, HInstance_1.convertProfileToInstance)(profilePath);
                yield promises_1.default.rm(path_1.default.join(remote_1.app.getPath("temp"), profile.name));
            }));
            profileList.appendChild(profileElement);
        }
    });
}
exports.generateProfileBtn = generateProfileBtn;
