"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.concatJson = exports.removeDuplicates = exports.replaceAll = void 0;
function replaceAll(text, toReplace, replacer) {
    let replacedText = text;
    while (replacedText.includes(toReplace)) {
        var startIndex = replacedText.indexOf(toReplace);
        // Extraire la partie avant ${library_directory}
        var partBefore = replacedText.substring(0, startIndex);
        // Extraire la partie après ${library_directory}
        var partAfter = replacedText.substring(startIndex + toReplace.length);
        // Concaténer les parties avec le bon dossier
        replacedText = partBefore + replacer + partAfter;
        console.log(replacedText);
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
