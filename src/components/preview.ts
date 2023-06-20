import Component from "../classes/component";
import EventEmitter from "../classes/event-emitter";
import fileExplorer from "./file-explorer";
import * as babel from "@babel/core";

class Preview extends Component.create({
    tag: "iframe",
    events: EventEmitter.events("run"),
    props: {
        imports: {"npm/": "https://esm.sh/"} as Record<string, string>
    }
}) {
    init() {
        this.on("run", () => {
            this.element.src = "about:blank";
        });

        this.element.onload = async () => {
            for (const src in this.imports) {
                if (src !== "npm/") {
                    URL.revokeObjectURL(this.imports[src]);
                    delete this.imports[src];
                }
            }

            const document = this.element.contentDocument!;

            for (const [filename, content] of fileExplorer.fileSystem) {
                const file = filename.slice(0, filename.lastIndexOf("."));
                const ext = filename.slice(filename.lastIndexOf(".") + 1);

                if (["ts", "tsx", "js", "jsx"].includes(ext)) {
                    const presets = [];

                    if (ext[0] === "t") {
                        presets.push(require("@babel/preset-typescript"));
                    }

                    if (ext[2] === "x") {
                        presets.push(require("@babel/preset-react"));
                    }

                    const js = await babel.transformAsync(content, {
                        presets,
                        plugins: [
                            {
                                visitor: {
                                    ImportDeclaration(path) {
                                        if (path.node.source.value.startsWith("./")) {
                                            path.node.source.value = path.node.source.value.replace("./", "local/");
                                        } else {
                                            path.node.source.value = `npm/${path.node.source.value}`;
                                        }
                                    },
                                },
                            },
                        ],
                        filename,
                        minified: true,
                    });

                    if (!js) {
                        continue;
                    }

                    this.imports[`local/${file}`] = URL.createObjectURL(
                        new File([js.code || ""], filename, {type: "text/javascript"})
                    );
                } else if (ext === "json") {
                    this.imports[`local/${filename}`] = URL.createObjectURL(
                        new File([content], filename, {
                            type: "application/json",
                        })
                    );
                } else if (ext === "css") {
                    this.imports[`local/${filename}`] = URL.createObjectURL(
                        new File(
                            [`document.head.appendChild(document.createElement("style")).textContent=${JSON.stringify(content)};export{};`],
                            filename,
                            {type: "text/javascript"}
                        )
                    );
                }
            }

            const importmap = document.createElement("script");
            importmap.type = "importmap";
            importmap.textContent = JSON.stringify({imports: this.imports});
            document.head.appendChild(importmap);

            const script = document.createElement("script");
            script.type = "module";
            script.textContent = "import 'local/index';";
            document.body.appendChild(script);
        };
    }
}

export default new Preview();