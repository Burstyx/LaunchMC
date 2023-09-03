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
exports.forgeVerStateManifest = exports.forgeManifest = exports.minecraftManifestForVersion = exports.minecraftManifest = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const fs_1 = require("fs");
const const_1 = require("./const");
const path_1 = __importDefault(require("path"));
const HFileManagement_1 = require("./HFileManagement");
const HDownload_1 = require("./HDownload");
// Download manifest containing all versions informations
function minecraftManifest() {
    return __awaiter(this, void 0, void 0, function* () {
        // Create directory if doesn't exist
        const manifestPath = yield (0, HFileManagement_1.makeDir)(const_1.dataPath);
        if (!(0, fs_1.existsSync)(path_1.default.join(manifestPath, "versions_manifest.json"))) {
            // Download manifest and return data
            yield (0, HDownload_1.downloadAsync)(const_1.versionsManifest, path_1.default.join(manifestPath, "versions_manifest.json"), (progress) => {
                console.log(`Progression: ${progress}% du téléchargement du manifest`);
            });
        }
        return JSON.parse(yield promises_1.default.readFile(path_1.default.join(manifestPath, "versions_manifest.json"), "utf-8"));
    });
}
exports.minecraftManifest = minecraftManifest;
// Download manifest for a specific Minecraft versions
function minecraftManifestForVersion(version) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create directory if doesn't exist
        const versionPath = yield (0, HFileManagement_1.makeDir)(path_1.default.join(const_1.minecraftVersionPath, version));
        if (!(0, fs_1.existsSync)(path_1.default.join(versionPath, `${version}.json`))) {
            // Get manifest containing all versions informations
            yield minecraftManifest().then((data) => __awaiter(this, void 0, void 0, function* () {
                // Retrieve data for the wanted version
                for (var i = 0; i < data["versions"].length; i++) {
                    if (data["versions"][i]["id"] == version) {
                        // Download manifest of wanted version
                        yield (0, HDownload_1.downloadAsync)(data["versions"][i]["url"], path_1.default.join(versionPath, `${version}.json`), (progress) => {
                            console.log(`Progression: ${progress}% du téléchargement du manifest`);
                        });
                    }
                }
            }));
        }
        return JSON.parse(yield promises_1.default.readFile(path_1.default.join(versionPath, `${version}.json`), "utf-8"));
    });
}
exports.minecraftManifestForVersion = minecraftManifestForVersion;
// Download manifest containing all versions informations
function forgeManifest() {
    return __awaiter(this, void 0, void 0, function* () {
        // Create directory if doesn't exist
        const manifestPath = yield (0, HFileManagement_1.makeDir)(const_1.dataPath);
        if (!(0, fs_1.existsSync)(path_1.default.join(manifestPath, "forge_manifest.json"))) {
            // Download manifest and return data
            yield (0, HDownload_1.downloadAsync)(const_1.forgeVersionsManifest, path_1.default.join(manifestPath, "forge_manifest.json"), (progress) => {
                console.log(`Progression: ${progress}% du téléchargement du manifest`);
            });
        }
        return JSON.parse(yield promises_1.default.readFile(path_1.default.join(manifestPath, "forge_manifest.json"), "utf-8"));
    });
}
exports.forgeManifest = forgeManifest;
// Download manifest containing the states of all forge versions (which is latest and which is recommended)
function forgeVerStateManifest() {
    return __awaiter(this, void 0, void 0, function* () {
        // Create directory if doesn't exist
        const manifestPath = yield (0, HFileManagement_1.makeDir)(const_1.dataPath);
        if (!(0, fs_1.existsSync)(path_1.default.join(manifestPath, "forge_manifest_promos.json"))) {
            // Download manifest and return data
            yield (0, HDownload_1.downloadAsync)(const_1.forgeVersionsStatuesManifest, path_1.default.join(manifestPath, "forge_manifest_promos.json"), (progress) => {
                console.log(`Progression: ${progress}% du téléchargement du manifest`);
            });
        }
        return JSON.parse(yield promises_1.default.readFile(path_1.default.join(manifestPath, "forge_manifest_promos.json"), "utf-8"));
    });
}
exports.forgeVerStateManifest = forgeVerStateManifest;
