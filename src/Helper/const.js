"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.java17Version = exports.java8Version = exports.clientSecret = exports.clientId = exports.redirectUrl = exports.playerMojangProfile = exports.minecraftHeadProfilePicture = exports.minecraftBearerToken = exports.xstsAuth = exports.xbxLiveAuth = exports.msAccessToken = exports.msAuth = exports.resourcePackage = exports.versionsManifest = exports.javaPath = exports.legacyAssetsPath = exports.loggingConfPath = exports.librariesPath = exports.instancesPath = exports.objectPath = exports.indexesPath = exports.assetsPath = exports.minecraftVersionPath = exports.dataPath = exports.gamePath = void 0;
const { app } = require("@electron/remote");
const path_1 = __importDefault(require("path"));
// Path
exports.gamePath = app.getPath("userData");
exports.dataPath = exports.gamePath + "/datas";
exports.minecraftVersionPath = exports.dataPath + "/versions";
exports.assetsPath = exports.dataPath + "/assets";
exports.indexesPath = exports.assetsPath + "/indexes";
exports.objectPath = exports.assetsPath + "/objects";
exports.instancesPath = exports.gamePath + "/instances";
exports.librariesPath = path_1.default.join(exports.dataPath, "libraries");
exports.loggingConfPath = exports.assetsPath + "/log_configs";
exports.legacyAssetsPath = exports.assetsPath + "/virtual/legacy";
exports.javaPath = exports.gamePath + "/javas";
// Url
exports.versionsManifest = "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json";
exports.resourcePackage = "https://resources.download.minecraft.net";
exports.msAuth = "https://login.live.com/oauth20_authorize.srf";
exports.msAccessToken = "https://login.live.com/oauth20_token.srf";
exports.xbxLiveAuth = "https://user.auth.xboxlive.com/user/authenticate";
exports.xstsAuth = "https://xsts.auth.xboxlive.com/xsts/authorize";
exports.minecraftBearerToken = "https://api.minecraftservices.com/authentication/login_with_xbox";
exports.minecraftHeadProfilePicture = "https://minotar.net/avatar/";
exports.playerMojangProfile = "https://api.minecraftservices.com/minecraft/profile";
// Azure data
exports.redirectUrl = "https://login.microsoftonline.com/common/oauth2/nativeclient";
exports.clientId = "67ebd24f-af85-4d3e-bcb4-a330eb0ba7e1";
exports.clientSecret = "a0c3823e-c125-4f5f-920b-5cbf5c9efe35";
// Java Versions
exports.java8Version = "jdk8u362-b09-jre";
exports.java17Version = "jdk-17.0.6+10-jre";
