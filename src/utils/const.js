const { app } = require("@electron/remote")

exports.gamePath = app.getPath("userData")

exports.dataPath = this.gamePath + "/datas"
exports.minecraftJarPath = this.dataPath + "/minecraft"

exports.assetsPath = this.dataPath + "/assets"

exports.indexesPath = this.assetsPath + "/indexes"