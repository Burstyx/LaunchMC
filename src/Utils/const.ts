const { app } = require("@electron/remote")

// Path
export const gamePath = app.getPath("userData")
export const dataPath = gamePath + "/Data"
export const minecraftVersionPath = dataPath + "/versions"
export const assetsPath = dataPath + "/assets"
export const indexesPath = assetsPath + "/indexes"
export const objectPath = assetsPath + "/objects"
export const instancesPath = gamePath + "/instances"
export const librariesPath = dataPath + "/libraries"
export const loggingConfPath = assetsPath + "/log_configs"
export const legacyAssetsPath = assetsPath + "/virtual/legacy"
export const javaPath = gamePath + "/javas"
export const tempPath = dataPath + "/.temp"

// Url
export const versionsManifest = "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json"
export const forgeVersionsManifest = "https://files.minecraftforge.net/net/minecraftforge/forge/maven-metadata.json"
export const resourcePackage = "https://resources.download.minecraft.net"
export const msAuth = "https://login.live.com/oauth20_authorize.srf"
export const msAccessToken = "https://login.live.com/oauth20_token.srf"
export const xbxLiveAuth = "https://user.auth.xboxlive.com/user/authenticate"
export const xstsAuth = "https://xsts.auth.xboxlive.com/xsts/authorize"
export const minecraftBearerToken = "https://api.minecraftservices.com/authentication/login_with_xbox"
export const minecraftHeadProfilePicture = "https://minotar.net/avatar/"
export const playerMojangProfile = "https://api.minecraftservices.com/minecraft/profile"
export const forgeMaven = "https://maven.minecraftforge.net"

// Azure data
export const redirectUrl = "https://login.microsoftonline.com/common/oauth2/nativeclient"
export const clientId = "67ebd24f-af85-4d3e-bcb4-a330eb0ba7e1"
export const clientSecret = "a0c3823e-c125-4f5f-920b-5cbf5c9efe35"

// Java Versions
export const java8Url = "https://github.com/adoptium/temurin8-binaries/releases/download/jdk8u382-b05/OpenJDK8U-jdk_x64_windows_hotspot_8u382b05.zip"
export const java17Url = "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.8%2B7/OpenJDK17U-jdk_x64_windows_hotspot_17.0.8_7.zip"
export const java8Version = "OpenJDK8U-jdk_x64_windows_hotspot_8u382b05"
export const java17Version = "OpenJDK17U-jdk_x64_windows_hotspot_17.0.8_7"
export const java8Name = "jdk8u382-b05"
export const java17Name = "jdk-17.0.8+7"