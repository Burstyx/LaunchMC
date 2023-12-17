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
const HDownload_1 = require("./HDownload");
function minecraftManifest() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield promises_1.default.mkdir(const_1.dataPath, { recursive: true }).catch((err) => {
                reject(err);
            });
            if (!(0, fs_1.existsSync)(path_1.default.join(const_1.dataPath, "versions_manifest.json"))) {
                yield (0, HDownload_1.downloadAsync)(const_1.versionsManifest, path_1.default.join(const_1.dataPath, "versions_manifest.json"), (progress) => {
                    console.log(`Progression: ${progress}% du téléchargement du manifest`);
                }).catch((err) => reject(err));
            }
            yield promises_1.default.readFile(path_1.default.join(const_1.dataPath, "versions_manifest.json"), "utf8").then((res) => {
                resolve(JSON.parse(res));
            }).catch((err) => {
                reject(err);
            });
        }));
    });
}
exports.minecraftManifest = minecraftManifest;
function minecraftManifestForVersion(version) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield promises_1.default.mkdir(path_1.default.join(const_1.minecraftVersionPath, version), { recursive: true }).catch((err) => {
                reject(err);
            });
            const versionPath = path_1.default.join(const_1.minecraftVersionPath, version);
            if (!(0, fs_1.existsSync)(path_1.default.join(versionPath, `${version}.json`))) {
                yield minecraftManifest().then((data) => __awaiter(this, void 0, void 0, function* () {
                    for (let i = 0; i < data["versions"].length; i++) {
                        if (data["versions"][i]["id"] == version) {
                            yield (0, HDownload_1.downloadAsync)(data["versions"][i]["url"], path_1.default.join(versionPath, `${version}.json`), (progress) => {
                                console.log(`Progression: ${progress}% du téléchargement du manifest`);
                            }).catch((err) => reject(err));
                        }
                    }
                })).catch((err) => reject(err));
            }
            yield promises_1.default.readFile(path_1.default.join(versionPath, `${version}.json`), "utf-8").then((res) => {
                resolve(JSON.parse(res));
            }).catch((err) => reject(err));
        }));
    });
}
exports.minecraftManifestForVersion = minecraftManifestForVersion;
// Download manifest containing all versions informations
function forgeManifest() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield promises_1.default.mkdir(const_1.dataPath, { recursive: true }).catch((err) => {
                reject(err);
            });
            if (!(0, fs_1.existsSync)(path_1.default.join(const_1.dataPath, "forge_manifest.json"))) {
                // Download manifest and return data
                yield (0, HDownload_1.downloadAsync)(const_1.forgeVersionsManifest, path_1.default.join(const_1.dataPath, "forge_manifest.json"), (progress) => {
                    console.log(`Progression: ${progress}% du téléchargement du manifest`);
                }).catch((err) => reject(err));
            }
            yield promises_1.default.readFile(path_1.default.join(const_1.dataPath, "forge_manifest.json"), "utf-8").then((res) => {
                resolve(JSON.parse(res));
            }).catch((err) => reject(err));
        }));
    });
}
exports.forgeManifest = forgeManifest;
// Download manifest containing the states of all forge versions (which is latest and which is recommended)
function forgeVerStateManifest() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield promises_1.default.mkdir(const_1.dataPath, { recursive: true }).catch((err) => {
                reject(err);
            });
            if (!(0, fs_1.existsSync)(path_1.default.join(const_1.dataPath, "forge_manifest_promos.json"))) {
                // Download manifest and return data
                yield (0, HDownload_1.downloadAsync)(const_1.forgeVersionsStatuesManifest, path_1.default.join(const_1.dataPath, "forge_manifest_promos.json"), (progress) => {
                    console.log(`Progression: ${progress}% du téléchargement du manifest`);
                }).catch((err) => reject(err));
            }
            yield promises_1.default.readFile(path_1.default.join(const_1.dataPath, "forge_manifest_promos.json"), "utf-8").then((res) => {
                resolve(JSON.parse(res));
            }).catch((err) => {
                reject(err);
            });
        }));
    });
}
exports.forgeVerStateManifest = forgeVerStateManifest;
