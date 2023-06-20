import Component from "../classes/component";
import fileExplorer from "./file-explorer";
import nav from "./nav";
import prism from "./prism";

class TextArea extends Component.create({tag: "textarea", events: {}}) {
    init(): void {
        this.element.spellcheck = false;
        this.element.autocapitalize = "off";


        this.element.addEventListener(
            "input", 
            function () {
                prism.code = this.value;
                fileExplorer.fileSystem.set(nav.current, this.value);
            },
            false
        );

        this.element.onkeydown = e => {
            if (e.key === "Tab") {
                e.preventDefault();
                document.execCommand("insertText", false, "\t");
            }
        };

        nav.on("open", e => {
            this.element.value = prism.code = fileExplorer.fileSystem.get(e.file) || "";
            prism.language = e.file.split(".").pop() || "";
        });

        nav.emit("open", "index.tsx");
    }
}

export default new TextArea();