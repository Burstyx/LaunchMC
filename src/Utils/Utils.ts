export function replaceAll(text: string, toReplace: string, replacer: string) {
    let replacedText = text

    while(replacedText.includes(toReplace)) {
        const startIndex = replacedText.indexOf(toReplace);
        const partBefore = replacedText.substring(0, startIndex);
        const partAfter = replacedText.substring(startIndex + toReplace.length);
        replacedText = partBefore + replacer + partAfter;
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