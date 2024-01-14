"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameRam = exports.java17Name = exports.java8Name = exports.java17Version = exports.java8Version = exports.java17Url = exports.java8Url = exports.clientSecret = exports.clientId = exports.redirectUrl = exports.forgeMaven = exports.playerMojangProfile = exports.minecraftHeadProfilePicture = exports.minecraftBearerToken = exports.xstsAuth = exports.xbxLiveAuth = exports.msAccessToken = exports.msAuth = exports.resourcePackage = exports.forgeVersionsStatuesManifest = exports.forgeVersionsManifest = exports.versionsManifest = exports.tempPath = exports.javaPath = exports.legacyAssetsPath = exports.loggingConfPath = exports.librariesPath = exports.serversInstancesPath = exports.localInstancesPath = exports.instancesPath = exports.objectPath = exports.indexesPath = exports.assetsPath = exports.minecraftVersionPath = exports.dataPath = exports.gamePath = void 0;
const remote_1 = require("@electron/remote");
// Path
exports.gamePath = remote_1.app.getPath("userData");
exports.dataPath = exports.gamePath + "/Data";
exports.minecraftVersionPath = exports.dataPath + "/versions";
exports.assetsPath = exports.dataPath + "/assets";
exports.indexesPath = exports.assetsPath + "/indexes";
exports.objectPath = exports.assetsPath + "/objects";
exports.instancesPath = exports.gamePath + "/instances";
exports.localInstancesPath = exports.instancesPath + "/locals";
exports.serversInstancesPath = exports.instancesPath + "/servers";
exports.librariesPath = exports.dataPath + "/libraries";
exports.loggingConfPath = exports.assetsPath + "/log_configs";
exports.legacyAssetsPath = exports.assetsPath + "/virtual/legacy";
exports.javaPath = exports.gamePath + "/javas";
exports.tempPath = exports.dataPath + "/.temp";
// Url
exports.versionsManifest = "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json";
exports.forgeVersionsManifest = "https://files.minecraftforge.net/net/minecraftforge/forge/maven-metadata.json";
exports.forgeVersionsStatuesManifest = "https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json";
exports.resourcePackage = "https://resources.download.minecraft.net";
exports.msAuth = "https://login.live.com/oauth20_authorize.srf";
exports.msAccessToken = "https://login.live.com/oauth20_token.srf";
exports.xbxLiveAuth = "https://user.auth.xboxlive.com/user/authenticate";
exports.xstsAuth = "https://xsts.auth.xboxlive.com/xsts/authorize";
exports.minecraftBearerToken = "https://api.minecraftservices.com/authentication/login_with_xbox";
exports.minecraftHeadProfilePicture = "https://minotar.net/avatar/";
exports.playerMojangProfile = "https://api.minecraftservices.com/minecraft/profile";
exports.forgeMaven = "https://maven.minecraftforge.net";
// Azure data
exports.redirectUrl = "https://login.microsoftonline.com/common/oauth2/nativeclient";
exports.clientId = "67ebd24f-af85-4d3e-bcb4-a330eb0ba7e1";
exports.clientSecret = "a0c3823e-c125-4f5f-920b-5cbf5c9efe35";
// Java Versions
exports.java8Url = "https://github.com/adoptium/temurin8-binaries/releases/download/jdk8u382-b05/OpenJDK8U-jdk_x64_windows_hotspot_8u382b05.zip";
exports.java17Url = "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.8%2B7/OpenJDK17U-jdk_x64_windows_hotspot_17.0.8_7.zip";
exports.java8Version = "OpenJDK8U-jdk_x64_windows_hotspot_8u382b05";
exports.java17Version = "OpenJDK17U-jdk_x64_windows_hotspot_17.0.8_7";
exports.java8Name = "jdk8u382-b05";
exports.java17Name = "jdk-17.0.8+7";
// Default settings value
exports.gameRam = 6144;
