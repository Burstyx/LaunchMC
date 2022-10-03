const { app } = require("@electron/remote")

exports.gamePath = app.getPath("userData")