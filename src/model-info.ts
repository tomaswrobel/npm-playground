import type * as monaco from "monaco-editor";
import * as icons from "./data/vs-seti.json";

export function getInfo(model: monaco.editor.ITextModel) {
    const fileName = model.uri.path.slice(1);

    return {
        fileName, 
        ext: fileName.slice(fileName.lastIndexOf(".") + 1)
    };
}

export function getIcon(model: monaco.editor.ITextModel) {
    const {fileName, ext} = getInfo(model);

    const data = icons.iconDefinitions[icons.fileNames[fileName] || icons.fileExtensions[ext] || icons.languageIds[model.getLanguageId()] || icons.file];
    const icon = document.createElement("i");
    icon.style.fontStyle = "normal";

    icon.innerText = data.fontCharacter;
    icon.style.color = data.fontColor;
    icon.style.fontFamily = "vs-seti";

    return icon;
}