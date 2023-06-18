import * as monaco from "monaco-editor";
import Emitter from "./events/emitter";

abstract class Component<K extends keyof HTMLElementTagNameMap, E extends Record<string, new (...args: any[]) => Event>> extends Emitter<E> implements monaco.IDisposable {
    element: HTMLElementTagNameMap[K];

    constructor(options: {tag: K; events: E;}) {
        super(options.events);
        this.element = document.createElement(options.tag);
        this.init();
        this.disposeables = [...this.listen()];
        document.body.appendChild(this.element);
    }

    abstract update(): void; 
    abstract init(): void;


    *listen() {
        yield monaco.editor.onDidCreateModel(() => {
            this.update();
        });
        yield monaco.editor.onWillDisposeModel(() => {
            this.update();
        });
    }

    disposeables: monaco.IDisposable[];

    dispose(): void {
        for (const disposeable of this.disposeables) {
            disposeable.dispose();
        }
        document.body.removeChild(this.element);
    }

    static create<K extends keyof HTMLElementTagNameMap, E extends Record<string, new (...args: any[]) => Event>>(options: {tag: K; events: E;}) {
        abstract class Tagged extends Component<K, E> {
            constructor() {
                super(options);
            }
        }

        return Tagged;
    }
}

export default Component;