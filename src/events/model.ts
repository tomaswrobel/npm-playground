import type * as monaco from "monaco-editor";

class ModelEvent extends Event {
    constructor(type: string, public model: monaco.editor.ITextModel) {
        super(type);
    }
}

export default ModelEvent;