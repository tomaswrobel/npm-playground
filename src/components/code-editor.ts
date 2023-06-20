import component from "../classes/component";
import prism from "./prism";
import textarea from "./textarea";

class CodeEditor extends component.create({tag: "main"}) {
    init(): void {
        this.element.append(
            prism.element,
            textarea.element,
        )
    }
}

export default new CodeEditor();