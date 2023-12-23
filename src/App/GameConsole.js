"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyConsoleToClipboard = exports.clearConsole = exports.initConsole = exports.makeConsoleDirty = void 0;
const StartMinecraft_1 = require("./StartMinecraft");
const HInstance_1 = require("../Utils/HInstance");
const gameConsole = document.getElementById("console-logs");
let autoScroll = true;
gameConsole.addEventListener("wheel", () => console.log("gege"));
function makeConsoleDirty(name) {
    if (gameConsole && HInstance_1.currentOpenedInstance === name) {
        const lastLog = StartMinecraft_1.logs[name][StartMinecraft_1.logs[name].length - 1];
        const text = document.createElement("p");
        text.innerText = lastLog["message"];
        text.classList.add(lastLog["type"] === "err" ? "error" : "info");
        gameConsole.append(text);
        if (autoScroll) {
            gameConsole.scrollTo(0, gameConsole.scrollHeight);
        }
    }
}
exports.makeConsoleDirty = makeConsoleDirty;
function initConsole(name) {
    if (gameConsole) {
        gameConsole.innerHTML = "";
        for (const index in StartMinecraft_1.logs[name]) {
            const text = document.createElement("p");
            text.innerText = StartMinecraft_1.logs[name][index]["message"];
            text.classList.add(StartMinecraft_1.logs[name][index]["err"] ? "error" : "info");
            gameConsole.append(text);
        }
    }
}
exports.initConsole = initConsole;
function clearConsole(name) {
    if (gameConsole) {
        gameConsole.innerHTML = "";
    }
}
exports.clearConsole = clearConsole;
function copyConsoleToClipboard(name) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (gameConsole) {
                let finalStr = "";
                for (let child of gameConsole.children) {
                    finalStr += child.innerText;
                }
                yield navigator.clipboard.writeText(finalStr)
                    .then(() => resolve())
                    .catch((err) => reject(err));
            }
        }));
    });
}
exports.copyConsoleToClipboard = copyConsoleToClipboard;
