"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMinecraft = void 0;
const HManifests_1 = require("../Helper/HManifests");
function startMinecraft(version) {
    (0, HManifests_1.minecraftManifestForVersion)(version).then((data) => {
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
