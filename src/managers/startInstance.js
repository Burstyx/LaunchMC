"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMinecraft = void 0;
function startMinecraft() {
    let minecraftArguments;
    fetch("https://launchermeta.mojang.com/v1/packages/cfd75871c03119093d7c96a6a99f21137d00c855/1.12.2.json").then((res) => {
        res.json().then((data) => {
            minecraftArguments = data["minecraftArguments"].split('-');
            minecraftArguments.splice(0, 1);
            for (let i = 0; i < minecraftArguments.length; i++) {
                if (minecraftArguments[i] == "") {
                    minecraftArguments.splice(i, 1);
                    minecraftArguments[i].trim();
                }
            }
            console.log(minecraftArguments);
        });
    });
}
exports.startMinecraft = startMinecraft;
