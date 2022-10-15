const { app } = require("@electron/remote")

// Path
exports.gamePath = app.getPath("userData")
exports.dataPath = this.gamePath + "/datas"
exports.minecraftJarPath = this.dataPath + "/minecraft"
exports.assetsPath = this.dataPath + "/assets"
exports.indexesPath = this.assetsPath + "/indexes"
exports.instancesPath = this.gamePath + "/instances"

// Url
exports.versionsManifest = "https://piston-meta.mojang.com/mc/game/version_manifest.json"
exports.resourcePackage = "https://resources.download.minecraft.net"