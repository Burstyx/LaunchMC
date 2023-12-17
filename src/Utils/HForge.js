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
exports.getForgeVersionIfExist = exports.getForgeInstallProfileIfExist = exports.getForgeInstallerForVersion = void 0;
const HFileManagement_1 = require("./HFileManagement");
const const_1 = require("./const");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const HDownload_1 = require("./HDownload");
const fs_1 = require("fs");
function getForgeInstallerForVersion(forgeId) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const installerPath = path_1.default.join(const_1.tempPath, "forgeinstallers");
            yield promises_1.default.mkdir(installerPath, { recursive: true }).catch((err) => {
                reject(err);
            });
            if (!(0, fs_1.existsSync)(path_1.default.join(installerPath, `forge-${forgeId}-installer.jar`))) {
                yield (0, HDownload_1.downloadAsync)(path_1.default.join(const_1.forgeMaven, "net", "minecraftforge", "forge", forgeId, `forge-${forgeId}-installer.jar`), path_1.default.join(installerPath, `forge-${forgeId}-installer.jar`)).catch((err) => reject(err));
            }
            resolve(path_1.default.join(installerPath, `forge-${forgeId}-installer.jar`));
        }));
    });
}
exports.getForgeInstallerForVersion = getForgeInstallerForVersion;
function getForgeInstallProfileIfExist(forgeId) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield getForgeInstallerForVersion(forgeId).then((forgeInstallerPath) => __awaiter(this, void 0, void 0, function* () {
                yield (0, HFileManagement_1.extractSpecificFile)(forgeInstallerPath, "install_profile.json").catch((err) => reject(err));
                const installProfilePath = path_1.default.join(path_1.default.dirname(forgeInstallerPath), "install_profile.json");
                promises_1.default.readFile(installProfilePath, "utf8").then((file) => __awaiter(this, void 0, void 0, function* () {
                    const data = JSON.parse(file);
                    yield promises_1.default.rm(installProfilePath).catch((err) => reject(err));
                    resolve(data);
                })).catch((err) => {
                    reject(err);
                });
            })).catch((err) => reject(err));
        }));
    });
}
exports.getForgeInstallProfileIfExist = getForgeInstallProfileIfExist;
function getForgeVersionIfExist(forgeId) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const versionPath = path_1.default.join(const_1.minecraftVersionPath, forgeId);
            yield promises_1.default.mkdir(versionPath, { recursive: true }).catch((err) => {
                reject(err);
            });
            if (!(0, fs_1.existsSync)(path_1.default.join(versionPath, `${forgeId}.json`))) {
                yield getForgeInstallerForVersion(forgeId).then((forgeInstaller) => __awaiter(this, void 0, void 0, function* () {
                    yield getForgeInstallProfileIfExist(forgeId).then((forgeInstallProfile) => __awaiter(this, void 0, void 0, function* () {
                        if (forgeInstallProfile.json) {
                            const versionJsonPath = forgeInstallProfile.json.startsWith("/") ? forgeInstallProfile.json.replace("/", "") : forgeInstallProfile.json;
                            yield (0, HFileManagement_1.extractSpecificFile)(forgeInstaller, versionJsonPath, path_1.default.join(versionPath, `${forgeId}.json`)).catch((err) => reject(err));
                        }
                        else {
                            yield (0, HFileManagement_1.extractSpecificFile)(forgeInstaller, "install_profile.json", path_1.default.join(versionPath, `${forgeId}.json`)).catch((err) => reject(err));
                        }
                    })).catch((err) => reject(err));
                })).catch((err) => reject(err));
            }
            yield promises_1.default.readFile(path_1.default.join(versionPath, `${forgeId}.json`), "utf-8").then((res) => {
                resolve(JSON.parse(res));
            }).catch((err) => reject(err));
        }));
    });
}
exports.getForgeVersionIfExist = getForgeVersionIfExist;
