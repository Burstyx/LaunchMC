"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMinecraft = void 0;
const getMinecraftVersionManifest_1 = require("./getMinecraftVersionManifest");
function startMinecraft(version) {
    let minecraftArguments;
    (0, getMinecraftVersionManifest_1.getVersionManifest)(version).then((data) => {
        minecraftArguments = data["minecraftArguments"].split('-');
        minecraftArguments.splice(0, 1);
        for (let i = 0; i < minecraftArguments.length; i++) {
            if (minecraftArguments[i] == "") {
                minecraftArguments.splice(i, 1);
            }
        }
        console.log(minecraftArguments);
    });
}
exports.startMinecraft = startMinecraft;
