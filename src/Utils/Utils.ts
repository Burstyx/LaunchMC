import os from "os"

export function replaceAll(text: string, toReplace: string, replacer: string) {
    let replacedText = text

    while(replacedText.includes(toReplace)) {
        var startIndex = replacedText.indexOf(toReplace);

        // Extraire la partie avant ${library_directory}
        var partBefore = replacedText.substring(0, startIndex);

        // Extraire la partie après ${library_directory}
        var partAfter = replacedText.substring(startIndex + toReplace.length);

        // Concaténer les parties avec le bon dossier
        replacedText = partBefore + replacer + partAfter;

        console.log(replacedText);
        
    }

    return replacedText
}

export function removeDuplicates(arr: string[]){
    return arr.filter((item, index) => arr.indexOf(item) === index);
}

export function concatJson(j1: any, j2: any) {
    for (let key in j2) {
        j1[key] = j2[key];
    }

    return j1;
}

export function osToMCFormat(os: string) {
    switch(os) {
        case "win32":
            return "windows"
        case "darwin":
            return "osx"
        case "linux":
            return "linux"
        default:
            return ""
    }
}