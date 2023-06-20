import Component from "../classes/component";
import EventEmitter from "../classes/event-emitter";
import * as prism from "prismjs";
import "prismjs/themes/prism-okaidia.css";
import "prismjs/components/prism-markup.js";
import "prismjs/components/prism-clike.js";
import "prismjs/components/prism-javascript.js";
import "prismjs/components/prism-typescript.js";
import "prismjs/components/prism-jsx.js";
import "prismjs/components/prism-tsx.js";
import "prismjs/components/prism-css.js";

class Prism extends Component.create({tag: "pre", events: EventEmitter.events("highlight")}) {
    async init() {
        this.on("highlight", () => prism.highlightElement(this.element));
    }

    set language(language: string) {
        this.element.className = `language-${language}`;
        this.emit("highlight");
    }

    set code(code: string) {
        this.element.textContent = code;
        this.emit("highlight");
    }

    get code() {
        return this.element.textContent ?? "";
    }

    get language() {
        return this.element.className.replace("language-", "");
    }
}

export default new Prism();