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