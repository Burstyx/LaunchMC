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
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const HDownload_1 = require("./HDownload");
function getForgeInstallerForVersion(mcVersion, forgeVersion) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get forge installers folder
        const installerPath = path_1.default.join(const_1.tempPath, "forgeinstallers");
        yield (0, HFileManagement_1.makeDir)(installerPath);
        // Check if installer doesn't already exist
        const forgeId = `${mcVersion}-${forgeVersion}`;
        if (!fs_1.default.existsSync(path_1.default.join(installerPath, `forge-${forgeId}-installer.jar`))) {
            yield (0, HDownload_1.downloadAsync)(path_1.default.join(const_1.forgeMaven, "net", "minecraftforge", "forge", forgeId, `forge-${forgeId}-installer.jar`), path_1.default.join(installerPath, `forge-${forgeId}-installer.jar`));
        }
        return path_1.default.join(installerPath, `forge-${forgeId}-installer.jar`);
    });
}
exports.getForgeInstallerForVersion = getForgeInstallerForVersion;
function getForgeInstallProfileIfExist(mcVersion, forgeVersion) {
    return __awaiter(this, void 0, void 0, function* () {
        const forgeInstallerPath = yield getForgeInstallerForVersion(mcVersion, forgeVersion);
        yield (0, HFileManagement_1.extractSpecificFile)(forgeInstallerPath, "install_profile.json");
        const installProfilePath = path_1.default.join(path_1.default.dirname(forgeInstallerPath), "install_profile.json");
        const installProfileJson = yield promises_1.default.readFile(installProfilePath, "utf8");
        // await fsp.unlink(installProfilePath)
        return JSON.parse(installProfileJson);
    });
}
exports.getForgeInstallProfileIfExist = getForgeInstallProfileIfExist;
function getForgeVersionIfExist(mcVersion, forgeVersion) {
    return __awaiter(this, void 0, void 0, function* () {
        const forgeId = `${mcVersion}-${forgeVersion}`;
        const versionPath = path_1.default.join(const_1.minecraftVersionPath, forgeId);
        yield (0, HFileManagement_1.makeDir)(versionPath);
        if (!fs_1.default.existsSync(path_1.default.join(versionPath, `${forgeId}.json`))) {
            const installProfile = yield getForgeInstallProfileIfExist(mcVersion, forgeVersion);
            const forgeInstallerPath = yield getForgeInstallerForVersion(mcVersion, forgeVersion);
            if (installProfile.json) {
                const versionJsonPath = installProfile.json.startsWith("/") ? installProfile.json.replace("/", "") : installProfile.json;
                yield (0, HFileManagement_1.extractSpecificFile)(forgeInstallerPath, versionJsonPath, path_1.default.join(versionPath, `${forgeId}.json`));
            }
        }
        return JSON.parse(yield promises_1.default.readFile(path_1.default.join(versionPath, `${forgeId}.json`), "utf-8"));
    });
}
exports.getForgeVersionIfExist = getForgeVersionIfExist;
