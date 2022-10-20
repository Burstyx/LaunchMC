"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMinecraft = void 0;
const getManifest_1 = require("./getManifest");
function startMinecraft(version) {
    (0, getManifest_1.getVersionManifest)(version).then((data) => {
        if (data.hasOwnProperty("minecraftArguments")) {
            let minecraftArguments = data["minecraftArguments"];
            if (minecraftArguments.includes("-")) {
                let args = minecraftArguments.split('-');
                args.splice(0, 1);
                for (let i = 0; i < args.length; i++) {
                    if (args[i] == "") {
                        args.splice(i, 1);
                    }
                }
            }
            console.log(minecraftArguments);
        }
        else {
            console.log(data["arguments"]["game"]);
        }
    });
}
exports.startMinecraft = startMinecraft;
