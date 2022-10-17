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