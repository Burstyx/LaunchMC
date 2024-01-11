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
exports.wait = exports.osToMCFormat = exports.concatJson = exports.removeDuplicates = exports.replaceAll = void 0;
function replaceAll(text, toReplace, replacer) {
    let replacedText = text;
    while (replacedText.includes(toReplace)) {
        const startIndex = replacedText.indexOf(toReplace);
        const partBefore = replacedText.substring(0, startIndex);
        const partAfter = replacedText.substring(startIndex + toReplace.length);
        replacedText = partBefore + replacer + partAfter;
    }
    return replacedText;
}
exports.replaceAll = replaceAll;
function removeDuplicates(arr) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
}
exports.removeDuplicates = removeDuplicates;
function concatJson(j1, j2) {
    for (let key in j2) {
        j1[key] = j2[key];
    }
    return j1;
}
exports.concatJson = concatJson;
function osToMCFormat(os) {
    switch (os) {
        case "win32":
            return "windows";
        case "darwin":
            return "osx";
        case "linux":
            return "linux";
        default:
            return "";
    }
}
exports.osToMCFormat = osToMCFormat;
function wait(time) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    });
}
exports.wait = wait;
