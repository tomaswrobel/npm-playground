import Component from "../classes/component";
import * as Prism from "prismjs";
import "prismjs/themes/prism-okaidia.css";
import "prismjs/components/prism-markup.js";
import "prismjs/components/prism-clike.js";
import "prismjs/components/prism-javascript.js";
import "prismjs/components/prism-typescript.js";
import "prismjs/components/prism-jsx.js";
import "prismjs/components/prism-tsx.js";
import "prismjs/components/prism-css.js";
import nav from "./nav";
import fileExplorer from "./file-explorer";

class CodeEditor extends Component.create({
    tag: "main",
    props: {
        textarea: document.createElement("textarea"),
        prism: document.createElement("pre"),
        nums: document.createElement("div")
    }
}) {
    init() {
        this.textarea.spellcheck = false;
        this.textarea.autocapitalize = "off";
        this.nums.style.gridArea = "nums";
        this.nums.classList.add("nums");

        this.textarea.addEventListener(
            "input",
            () => {
                fileExplorer.fileSystem.set(nav.current, this.textarea.value);
                this.prism.textContent = this.textarea.value;
                Prism.highlightElement(this.prism);
                this.update();
            }
        );

        this.textarea.onkeydown = function (e) {
            if (e.key === "Tab") {
                e.preventDefault();
                document.execCommand("insertText", false, "\t");
            }
        };

        nav.on("open", e => {
            if (e.file) {
                this.textarea.value = this.prism.textContent = fileExplorer.fileSystem.get(e.file)!;
                this.prism.className = `language-${e.file.split(".").pop()}`;
                Prism.highlightElement(this.prism);
                this.textarea.readOnly = false;
            } else {
                this.textarea.value = "";
                this.prism.textContent = "";
                this.prism.className = "";
                this.textarea.readOnly = true;
            }
            this.update();
        });

        nav.emit("open", "index.tsx");
        this.element.append(this.prism, this.textarea, this.nums);
    }

    update() {
        this.nums.innerHTML = this.textarea.value.split("\n").map((_, i) => i + 1).join("<br>");
    }
}

export default new CodeEditor();