import * as monaco from "monaco-editor";
import Component from "../component";
import script from "../data/js.txt";
import style from "../data/css.txt";
import Nav from "./nav";

class CodeEditor extends Component.create({
    tag: "main",
    events: {}
}) {
    init() {
        const js = monaco.editor.createModel(script, undefined, monaco.Uri.file("index.tsx"));
        const css = monaco.editor.createModel(style, undefined, monaco.Uri.file("index.css"));

        this.monaco = monaco.editor.create(
            this.element,
            {
                model: js,
                automaticLayout: true,
                theme: "vs-dark"
            }
        );
    }

    update() {}

    *listen() {
        yield Nav.on("modelchange", e => {
            this.monaco.setModel(e.model);
        });
    }
}

interface CodeEditor {
    monaco: monaco.editor.IEditor;
}

export default CodeEditor;