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
exports.getMinecraftVersions = void 0;
const const_1 = require("../utils/const");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const https_1 = __importDefault(require("https"));
// Get all Minecraft version with filtering options
function getMinecraftVersions(parentList, loading, notFound, release, snapshot, beta, alpha) {
    return __awaiter(this, void 0, void 0, function* () {
        loading.style.display = "block";
        notFound.style.display = "none";
        if (!fs_1.default.existsSync(path_1.default.join(const_1.dataPath, "versions_manifest.json"))) {
            const file = fs_1.default.createWriteStream(path_1.default.join(const_1.dataPath, "versions_manifest.json"));
            yield new Promise((resolve, reject) => {
                https_1.default.get(const_1.versionsManifest, (data) => {
                    data.pipe(file);
                    data.on("end", () => {
                        resolve(data);
                    });
                    data.on("error", (err) => {
                        reject(err);
                    });
                });
            });
        }
        const data = JSON.parse(fs_1.default.readFileSync(path_1.default.join(const_1.dataPath, "versions_manifest.json"), "utf-8"));
        for (let i = 0; i < data["versions"].length; i++) {
            // Create a version button if filter accept it
            if ((data["versions"][i]["type"] == "release" && release)
                || (data["versions"][i]["type"] == "snapshot" && snapshot)
                || (data["versions"][i]["type"] == "old_beta" && beta)
                || (data["versions"][i]["type"] == "old_alpha" && alpha)) {
                // Create version button element
                let versionParent = document.createElement("div");
                versionParent.id = "vanilla-" + data["versions"][i]["id"];
                versionParent.className = "vanillabootloaderinformation bootloaderinformation";
                // Create version label for the button element
                let version = document.createElement("p");
                version.innerText = data["versions"][i]["id"];
                // Create version type label for the button element
                let versionState = document.createElement("p");
                versionState.innerText = data["versions"][i]["type"];
                versionParent.appendChild(version);
                versionParent.appendChild(versionState);
                parentList.appendChild(versionParent);
            }
        }
        loading.style.display = "none";
        if (parentList.children.length == 0) {
            notFound.style.display = "block";
        }
        else {
            notFound.style.display = "none";
        }
    });
}
exports.getMinecraftVersions = getMinecraftVersions;
