import {LitElement, html, css} from "lit";
import {customElement, property, query} from "lit/decorators.js";
import * as Babel from "@babel/core";
import cssCode from "bundle-text:./css.txt";
import jsCode from "bundle-text:./js.txt";
import {saveAs} from "file-saver";

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

@customElement("npm-playground")
class NPMPlayground extends LitElement {
  static styles = css`
    :host {
      display: grid;
      grid-template-areas: "file-explorer tabs preview" "file-explorer editor preview";
      grid-template-rows: auto 1fr;
      grid-template-columns: 200px 1fr 1fr;
      width: 100vw;
      height: 100vh;
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
      overflow-y: auto;
      overflow-x: hidden;
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
  };

  @property({type: Array})
  tabs: string[] = ["index.tsx", "index.css"];

  @query("iframe")
  iframe!: HTMLIFrameElement;

  @query("nav")
  nav!: HTMLElement;

  @query(".file-explorer")
  fileExplorer!: HTMLUListElement;

  render() {
    const tabs = this.tabs.map(
      file => html`
        <button ?data-active=${this.file === file} @click=${() => (this.file = file)}>
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
        <li @click=${this.openGithub}>Star on GitHub</li>
        <li class="divider"></li>
        <li @click=${this.download}>Save as...</li>
        <li @click=${this.upload}>Open...</li>
        <li @click=${this.newFile}>New file...</li>
        <li class="divider"></li>
        ${Object.keys(this.files).map(
          file => html`<li @click=${open.bind(this, file)}>${file}</li>`
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

  openGithub() {
    window.open("https://github.com/tomas-wrobel/npm-playground", "_blank");
  }

  updateCode(e: CustomEvent<string>) {
    this.files[this.file] = e.detail;
  }

  run() {
    this.iframe.src = "about:blank";
  }

  private imports: Record<string, string> = {
    "npm/": "https://esm.sh/",
  };

  async transpile() {
    for (const src in this.imports) {
      if (src !== "npm/") {
        URL.revokeObjectURL(this.imports[src]);
        delete this.imports[src];
      }
    }

    const document = this.iframe.contentDocument!;

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

        this.imports[`local/${file}`] = URL.createObjectURL(
          new File([js.code || ""], filename, {type: "text/javascript"})
        );
      } else if (ext === "json") {
        this.imports[`local/${filename}`] = URL.createObjectURL(
          new File([this.files[filename]], filename, {
            type: "application/json",
          })
        );
      } else if (ext === "css") {
        this.imports[`local/${filename}`] = URL.createObjectURL(
          new Blob(
            [
              `document.head.appendChild(document.createElement("style")).textContent=${JSON.stringify(
                this.files[filename]
              )};export{};`,
            ],
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
  }

  newFile() {
    const li = document.createElement("li");
    const input = document.createElement("input");
    const validFile = /^[\w\.-]+?$/;

    li.appendChild(input);

    input.onblur = () => {
      if (input.value && validFile.test(input.value)) {
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

    this.fileExplorer.appendChild(li);
    input.focus();
  }

  download() {
    saveAs(new Blob([JSON.stringify(this.files)], {type: "application/json"}), "untitled.npmplg");
  }

  upload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".npmplg";
    input.onchange = async () => {
      this.files = JSON.parse(await input.files![0].text());
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
