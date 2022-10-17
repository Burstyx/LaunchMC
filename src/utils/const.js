const { app } = require("@electron/remote")

// Path
exports.gamePath = app.getPath("userData")
exports.dataPath = this.gamePath + "/datas"
exports.minecraftVersionPath = this.dataPath + "/versions"
exports.assetsPath = this.dataPath + "/assets"
exports.indexesPath = this.assetsPath + "/indexes"
exports.objectPath = this.assetsPath + "/objects"
exports.instancesPath = this.gamePath + "/instances"
exports.librariesPath = this.dataPath + "/libraries"
exports.loggingConfPath = this.assetsPath + "/log_configs"

// Url
exports.versionsManifest = "https://piston-meta.mojang.com/mc/game/version_manifest.json"
exports.resourcePackage = "https://resources.download.minecraft.net"
exports.msAuth = "https://login.live.com/oauth20_authorize.srf"
exports.msAccessToken = "https://login.live.com/oauth20_token.srf"
exports.xbxLiveAuth = "https://user.auth.xboxlive.com/user/authenticate"

// Azure data
exports.redirectUrl = "https://login.microsoftonline.com/common/oauth2/nativeclient"
exports.clientId = "67ebd24f-af85-4d3e-bcb4-a330eb0ba7e1"
exports.clientSecret = "a0c3823e-c125-4f5f-920b-5cbf5c9efe35"