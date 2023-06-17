import {LitElement, html, css} from "lit";
import {customElement, property, query} from "lit/decorators.js";
import * as Babel from "@babel/core";
import cssCode from "bundle-text:./css.txt";
import jsCode from "bundle-text:./js.txt";
import counter from "bundle-text:./counter.txt";
import * as files from "./file-icons.json";
import {saveAs} from "file-saver";
import JSZip from "jszip";

function close(this: NPMPlayground, file: string) {
  if (this.tabs.length > 1) {
    this.tabs = this.tabs.filter(tab => tab !== file);
  }
}

function open(this: NPMPlayground, file: string) {
  if (!this.tabs.includes(file)) {
    this.tabs.push(file);
  }
  this.file = file;
}

function getIcon(filename: string) {
  const {name} =
    files.icons.find(file => file.fileNames?.includes(filename)) ||
    files.icons.find(file => file.fileExtensions?.some(ext => filename.endsWith("." + ext))) ||
    files.defaultIcon;
  return `https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/main/icons/${name}.svg`;
}

@customElement("npm-playground")
class NPMPlayground extends LitElement {
  static styles = css`
    :host {
      display: grid;
      grid-template-areas: "file-explorer tabs preview" "file-explorer editor preview";
      grid-template-rows: auto 1fr;
      grid-template-columns: 200px 1fr 1fr;
      width: 100vw;
    }

    .console {
      grid-area: preview;
      height: 25vh;
      width: 50vw;
      place-self: end;
    }

    img {
      width: 1em;
      height: 1em;
      margin-right: 0.5em;
      transform: translateY(0.125em);
    }

    nav {
      grid-area: tabs;
      overflow: auto;
    }

    code-editor {
      grid-area: editor;
    }

    .file-explorer {
      grid-area: file-explorer;
      background: #000;
      display: flex;
      flex-direction: column;
      margin: 0;
      padding: 0;
      border-right: 1px solid #30363d;
    }

    .file-explorer li {
      list-style: none;
      padding: 10px;
      color: #c9d1d9;
      cursor: pointer;
      font: 16px sans-serif;
      display: inline-block;
    }

    .file-explorer li:hover {
      background: #161b22;
    }

    .divider {
      height: 1px;
      padding: 0px !important;
      background: #30363d !important;
    }

    iframe {
      grid-area: preview;
      width: 100%;
      height: 100%;
    }

    [hidden] {
      display: none;
    }

    button {
      all: unset;
      color: #c9d1d9;
      padding: 10px;
      font: 16px sans-serif;
    }

    button[data-active] {
      background: #0d1117;
    }

    nav {
      display: flex;
      background: #000;
    }

    div {
      flex-grow: 1;
    }

    span {
      margin: 2px;
    }

    input {
      background: #0d1117;
      color: #c9d1d9;
      width: 100px;
      border: 1px solid #30363d;
    }

    button,
    li {
      cursor: pointer;
    }

    button:not([data-active]) > span {
      visibility: hidden;
    }
  `;

  @property({type: String})
  file = "index.tsx";

  @property({type: Object})
  files: Record<string, string> = {
    "index.css": cssCode,
    "index.tsx": jsCode,
    "Counter.tsx": counter,
  };

  @property({type: Array})
  tabs: string[] = ["Counter.tsx", "index.css"];

  @query("iframe")
  iframe!: HTMLIFrameElement;

  @query("nav")
  nav!: HTMLElement;

  render() {
    const tabs = this.tabs.map(
      file => html`
        <button ?data-active=${this.file === file} @click=${() => (this.file = file)}>
          <img src=${getIcon(file)} />
          ${file}
          <span @click=${close.bind(this, file)}>×</span>
        </button>
      `
    );

    return html`
      <nav>
        ${tabs}
        <div></div>
        <button @click=${this.run}>▶</button>
      </nav>
      <ul class="file-explorer">
        <li @click=${this.download}>Save as...</li>
        <li @click=${this.upload}>Open...</li>
        <li @click=${this.newFile}>New file...</li>
        <li class="divider"></li>
        ${Object.keys(this.files).map(
          file => html`<li @click=${open.bind(this, file)}><img src=${getIcon(file)} />${file}</li>`
        )}
      </ul>
      <code-editor
        .value=${this.files[this.file]}
        language=${this.file.slice(this.file.lastIndexOf(".") + 1)}
        @codechange=${this.updateCode}
        ?readonly=${this.file === "package.json"}
      ></code-editor>
      <iframe src="about:blank" frameborder="0" @load=${this.transpile}></iframe>
    `;
  }

  updateCode(e: CustomEvent<string>) {
    this.files[this.file] = e.detail;
  }

  run() {
    this.iframe.src = "about:blank";
  }

  memory: string[] = [];

  async transpile() {
    const imports: Record<string, string> = {
      "npm/": "https://esm.sh/",
    };

    this.memory.forEach(URL.revokeObjectURL);

    for (const filename in this.files) {
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

        const js = await Babel.transformAsync(this.files[filename], {
          presets,
          plugins: [
            require("@babel/plugin-syntax-import-attributes"),
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

        const url = URL.createObjectURL(
          new File([js.code || ""], filename, {type: "text/javascript"})
        );

        this.memory.push(url);
        imports[`local/${file}`] = url;
      } else if (ext === "json") {
        const url = URL.createObjectURL(
          new File([this.files[filename]], filename, {
            type: "application/json",
          })
        );

        this.memory.push(url);
        imports[`local/${filename}`] = url;
      }
    }

    const document = this.iframe.contentDocument!;

    const style = document.createElement("style");
    style.textContent = this.files["index.css"];
    document.head.appendChild(style);

    const importmap = document.createElement("script");
    importmap.type = "importmap";
    importmap.textContent = JSON.stringify({imports});
    document.head.appendChild(importmap);

    const script = document.createElement("script");
    script.type = "module";
    script.textContent = "import 'local/index';";
    document.body.appendChild(script);
  }

  addFile() {
    const file = prompt("File name:", ".tsx");

    if (!file) {
      return;
    }

    this.files[file] = "";
    this.file = file;
    this.requestUpdate();
  }

  newFile() {
    const li = document.createElement("li");
    const img = document.createElement("img");
    img.src = getIcon("");
    const input = document.createElement("input");

    li.appendChild(img);
    li.appendChild(input);

    input.oninput = () => {
      img.src = getIcon(input.value);
    };

    input.onblur = () => {
      if (input.value) {
        this.files[input.value] = "";
        this.tabs.push(input.value);
        this.file = input.value;
      }
      li.remove();
    };

    input.onkeydown = e => {
      if (e.key === "Enter") {
        input.blur();
      }
    };

    this.shadowRoot!.querySelector(".file-explorer")!.appendChild(li);

    input.focus();
  }

  async download() {
    const zip = new JSZip();

    for (const filename in this.files) {
      zip.file(filename, this.files[filename]);
    }

    saveAs(await zip.generateAsync({type: "blob"}), "untitled.npmplg");
  }

  async upload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".npmplg";
    input.onchange = async () => {
      const zip = await JSZip.loadAsync(await input.files![0].arrayBuffer());

      for (const filename in zip.files) {
        this.files[filename] = await zip.files[filename].async("text");
      }

      this.requestUpdate();
    };

    input.click();
  }
 
  updated() {
    if (this.tabs.indexOf(this.file) === -1) {
      this.file = this.tabs[0];
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "npm-playground": NPMPlayground;
  }
}

export default NPMPlayground;
