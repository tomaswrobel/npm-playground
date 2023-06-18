import Component from "../component";
import Emitter from "../events/emitter";
import ModelEvent from "../events/model";
import FileExplorer from "./file-explorer";
import * as monaco from "monaco-editor";
import IFrame from "./iframe";
import {getIcon} from "../model-info";

class Nav extends Component.create({
    tag: "nav", 
    events: {
        modelchange: Emitter.withName("modelchange", ModelEvent)
    }
}) {
    init() {
        this.tabs = [];
    }
    
    update() {
        this.element.innerHTML = "";
        for (const model of monaco.editor.getModels()) {
            const button = this.element.appendChild(document.createElement("button"));
            button.onclick = () => {
                this.emit("modelchange", model);
            };
            if (model === this.tab) {
                button.dataset.active = "true";
            }
            button.append(getIcon(model), model.uri.path.slice(1));
        }
        this.element.appendChild(document.createElement("div"));
        const run = this.element.appendChild(document.createElement("button"));
        run.onclick = () => IFrame.emit("run");
        run.innerText = "▶";
    }

    override *listen() {
        yield* super.listen();
        yield FileExplorer.on("modelopen", e => {
            this.tabs.push(e.model);
            this.tab = e.model;
            this.update();
        });
    }
}

interface Nav {
    tabs: monaco.editor.ITextModel[];
    tab: monaco.editor.ITextModel | null;
}

export default new Nav();