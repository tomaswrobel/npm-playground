import Component from "../component";
import * as monaco from "monaco-editor";
import ModelEvent from "../events/model";
import Emitter from "../events/emitter";
import {getIcon} from "../model-info";

class FileExplorer extends Component.create({
    tag: "aside", 
    events: {
        modelopen: Emitter.withName("modelopen", ModelEvent)
    }
}) {
    init() {
        this.githubLink = this.element.appendChild(document.createElement("section"));
        this.line = this.element.appendChild(document.createElement("hr"));
        this.saveAs = this.element.appendChild(document.createElement("section"));
        this.open = this.element.appendChild(document.createElement("section"));
        this.newFile = this.element.appendChild(document.createElement("section"));
        this.line = this.element.appendChild(document.createElement("hr"));

        this.githubLink.innerHTML = "Star on GitHub";
        this.saveAs.innerHTML = "Export...";
        this.open.innerHTML = "Open...";
        this.newFile.innerHTML = "New file...";

        this.newFile.onclick = () => {
            this.element.appendChild(document.createElement("section")).appendChild(document.createElement("input")).onblur = e => {
                const name = (e.currentTarget as HTMLInputElement).value;
                if (name) {
                    monaco.editor.createModel("", undefined, monaco.Uri.file(name));
                }
            };
        };
    }

    update() {
        this.element.innerHTML = "";
        this.init();

        for (const model of monaco.editor.getModels()) {
            const section = this.element.appendChild(document.createElement("section"));
            section.onclick = () => this.emit("modelopen", model);
            section.append(getIcon(model), model.uri.path.slice(1));
        }
    }
}

interface FileExplorer {
    githubLink: HTMLElement;
    saveAs: HTMLElement;
    open: HTMLElement;
    newFile: HTMLElement;
    line: HTMLHRElement;
}

export default new FileExplorer();