import Component from "../classes/component";
import {FileOpenEvent, FileDeleteEvent} from "../classes/file-events";
import {saveAs} from "file-saver";
import css from "bundle-text:../data/css.txt?raw";
import js from "bundle-text:../data/js.txt?raw";
import getIcon from "./get-icon";
import licenses from "../licenses";

class FileExplorer extends Component.create({
    tag: "ul",
    events: {
        open: FileOpenEvent,
        delete: FileDeleteEvent
    },
    props: {
        fileSystem: new Map([
            ["index.tsx", js],
            ["index.css", css]
        ])
    }
}) {
    init() {
        this.element.classList.add("file-explorer");

        this.element.append(
            this.githubLink = this.li(
                "Star on GitHub",
                open.bind(
                    window,
                    "https://github.com/tomas-wrobel/npm-playground",
                    "_blank"
                )
            ),
            this.licenses = this.li("Licenses", licenses),
            this.divider(),
            this.open = this.li("Open...", this.upload.bind(this)),
            this.saveAs = this.li("Export...", this.download),
            this.newFile = this.li("New file...", () => {
                const li = this.element.appendChild(document.createElement("li"));
                li.appendChild(getIcon(""));
                const input = li.appendChild(document.createElement("input"));

                input.onblur = () => {
                    if (input.value) {
                        this.fileSystem.set(input.value, "");
                    }
                    this.update();
                };

                input.onkeydown = ({key}) => {
                    if (key === "Enter" && input.value) {
                        input.blur();
                    }

                    if (key === "Escape") {
                        input.value = "";
                        input.blur();
                    }
                };

                input.oninput = () => {
                    li.replaceChild(getIcon(input.value), li.firstElementChild!);
                };

                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }
                input.focus();
            }),
            this.itemsDivider = this.divider()
        );

        this.update();
    }

    update() {
        this.element.innerHTML = "";

        this.element.append(
            this.githubLink,
            this.licenses,
            this.divider(),
            this.open,
            this.saveAs,
            this.newFile,
            this.itemsDivider,
        )

        for (const file of this.fileSystem.keys()) {
            const li = this.element.appendChild(this.li(file, this.emit.bind(this, "open", file)));
            li.prepend(getIcon(file));
            const remove = document.createElement("span");
            remove.classList.add("icon-delete");
            remove.onclick = () => {
                this.fileSystem.delete(file);
                this.emit("delete", file);
                this.update();
            }; 
            li.append(remove);
        }
    }

    private divider() {
        const li = document.createElement("li");
        li.classList.add("divider");
        return li;
    }

    private li(text: string, onclick: () => void) {
        const li = document.createElement("li");
        li.onclick = onclick;
        li.textContent = text;
        return li;
    }

    private download() {
        saveAs(new Blob([JSON.stringify([...this.fileSystem])], {type: "application/json"}), "untitled.npmplg");
    }

    private upload() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".npmplg";
        input.onchange = async () => {
            const [file] = input.files!;
            if (file) {
                this.fileSystem.clear();
                for (const [key, value] of JSON.parse(await file.text())) {
                    this.fileSystem.set(key, value);
                }
                this.update();
            }
        };

        input.click();
    }
}

interface FileExplorer {
    githubLink: HTMLLIElement;
    saveAs: HTMLLIElement;
    open: HTMLLIElement;
    newFile: HTMLLIElement;
    itemsDivider: HTMLLIElement;
    licenses: HTMLLIElement;
}

export default new FileExplorer();