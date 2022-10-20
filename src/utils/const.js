"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientSecret = exports.clientId = exports.redirectUrl = exports.minecraftHeadProfilePicture = exports.minecraftBearerToken = exports.xstsAuth = exports.xbxLiveAuth = exports.msAccessToken = exports.msAuth = exports.resourcePackage = exports.versionsManifest = exports.loggingConfPath = exports.librariesPath = exports.instancesPath = exports.objectPath = exports.indexesPath = exports.assetsPath = exports.minecraftVersionPath = exports.dataPath = exports.gamePath = void 0;
const { app } = require("@electron/remote");
// Path
exports.gamePath = app.getPath("userData");
exports.dataPath = exports.gamePath + "/datas";
exports.minecraftVersionPath = exports.dataPath + "/versions";
exports.assetsPath = exports.dataPath + "/assets";
exports.indexesPath = exports.assetsPath + "/indexes";
exports.objectPath = exports.assetsPath + "/objects";
exports.instancesPath = exports.gamePath + "/instances";
exports.librariesPath = exports.dataPath + "/libraries";
exports.loggingConfPath = exports.assetsPath + "/log_configs";
// Url
exports.versionsManifest = "https://piston-meta.mojang.com/mc/game/version_manifest.json";
exports.resourcePackage = "https://resources.download.minecraft.net";
exports.msAuth = "https://login.live.com/oauth20_authorize.srf";
exports.msAccessToken = "https://login.live.com/oauth20_token.srf";
exports.xbxLiveAuth = "https://user.auth.xboxlive.com/user/authenticate";
exports.xstsAuth = "https://xsts.auth.xboxlive.com/xsts/authorize";
exports.minecraftBearerToken = "https://api.minecraftservices.com/authentication/login_with_xbox";
exports.minecraftHeadProfilePicture = "https://minotar.net/avatar/";
// Azure data
exports.redirectUrl = "https://login.microsoftonline.com/common/oauth2/nativeclient";
exports.clientId = "67ebd24f-af85-4d3e-bcb4-a330eb0ba7e1";
exports.clientSecret = "a0c3823e-c125-4f5f-920b-5cbf5c9efe35";
