import Component from "../component";
import Emitter from "../events/emitter";
import * as Babel from "@babel/standalone";
import type {PluginObj} from "@babel/core";
import * as monaco from "monaco-editor";
import {getInfo} from "../model-info";

Babel.registerPlugin("npm-resolve", <PluginObj>{
    visitor: {
        ImportDeclaration(path) {
            if (path.node.source.value.startsWith("./")) {
                path.node.source.value = "local" + path.node.source.value.slice(1);
            } else {
                path.node.source.value = "npm/" + path.node.source.value;
            }
        }
    }
})

class IFrame extends Component.create({
    tag: "iframe",
    events: {
        run: Emitter.withName("run", Event)
    }
}) {
    update() {
        this.memory.forEach(URL.revokeObjectURL);
        this.memory = [];

        const imports: Record<string, string> = {
            "npm/": "https://esm.sh/"
        };

        for (const model of monaco.editor.getModels()) {
            const {ext, fileName} = getInfo(model);
            console.log(ext);
            if (["js", "jsx", "ts", "tsx"].includes(ext)) {
                const presets = ["env"];

                if (ext[0] === "t") {
                    presets.push("typescript");
                }

                if (ext[2] === "x") {
                    presets.push("react");
                }

                this.memory.push(
                    imports[`local${model.uri.path}`] = URL.createObjectURL(
                        new File(
                            [
                                Babel.transform(
                                    model.getValue(),
                                    {
                                        presets,
                                        plugins: ["npm-resolve"],
                                        filename: fileName
                                    }
                                ).code || "export{};"
                            ],
                            fileName,
                            {type: "text/javascript"}
                        )
                    )
                );
            }

            if (ext === "css") {
                this.memory.push(
                    imports[`local${model.uri.path}`] = URL.createObjectURL(
                        new File(
                            [`document.head.appendChild(document.createElement("style")).textContent=${JSON.stringify(model.getValue())};export{};`],
                            fileName,
                            {type: "text/javascript"}
                        )
                    )
                );
            }
        }

        const document = this.element.contentDocument!;

        const importmap = document.createElement("script");
        importmap.type = "importmap";
        importmap.textContent = JSON.stringify({imports});
        document.head.appendChild(importmap);

        const script = document.createElement("script");
        script.type = "module";
        script.textContent = "import 'local/index';";
        document.body.appendChild(script);
    }

    init() {
        this.update = this.update.bind(this);
        this.memory = [];
    }

    *listen() {
        yield this.on("run", () => {
            this.element.src = "about:blank";
        });

        yield {
            init: this.element.addEventListener("load", this.update),
            dispose: () => this.element.removeEventListener("load", this.update)
        };
    }

    dispose() {
        super.dispose();
        this.memory.forEach(URL.revokeObjectURL);
    }
}

interface IFrame {
    memory: string[];
}

export default new IFrame();