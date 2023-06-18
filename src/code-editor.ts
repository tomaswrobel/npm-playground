import {LitElement, css, html} from "lit";
import {customElement, property, query} from "lit/decorators.js";
import {highlightElement} from "./prism";

@customElement("code-editor")
class CodeEditor extends LitElement {
  static styles = css`
    :host {
      display: grid;
      overflow: auto;
    }
    textarea,
    pre {
      all: unset;
      grid-area: 1 / 1;
      font-family: monospace;
      white-space: pre;
      font-size: 1rem;
      line-height: 1.5;
      tab-size: 4;
      padding: 3px 5px;
    }

    textarea {
      caret-color: #c9d1d9;
      -webkit-text-fill-color: transparent;
    }

    pre {
      color: #c9d1d9;
      background: #0d1117;
    }

    .token.comment,
    .token.prolog,
    .token.doctype,
    .token.cdata {
      color: #8292a2;
    }

    .token.punctuation {
      color: #f8f8f2;
    }

    .token.namespace {
      opacity: 0.7;
    }

    .token.property,
    .token.tag,
    .token.constant,
    .token.symbol,
    .token.deleted {
      color: #f92672;
    }

    .token.boolean,
    .token.number {
      color: #ae81ff;
    }

    .token.selector,
    .token.attr-name,
    .token.string,
    .token.char,
    .token.builtin,
    .token.inserted {
      color: #a6e22e;
    }

    .token.operator,
    .token.entity,
    .token.url,
    .language-css .token.string,
    .style .token.string,
    .token.variable {
      color: #f8f8f2;
    }

    .token.atrule,
    .token.attr-value,
    .token.function,
    .token.class-name {
      color: #e6db74;
    }

    .token.keyword {
      color: #66d9ef;
    }

    .token.regex,
    .token.important {
      color: #fd971f;
    }

    .token.important,
    .token.bold {
      font-weight: bold;
    }
    .token.italic {
      font-style: italic;
    }

    .token.entity {
      cursor: help;
    }
  `;

  @property({attribute: false})
  value = "";

  @query("pre code")
  code!: HTMLElement;

  @query("textarea")
  textarea!: HTMLTextAreaElement;

  @property({type: Boolean})
  readonly = false;

  render() {
    return html`
      <pre><code class=${"language-" + this.language} .textContent=${this.value}></code></pre>
      <textarea
        .value=${this.value}
        @keydown=${this.keydown}
        @input=${this.onInput}
        spellcheck="false"
        ?readonly=${this.readonly}
      ></textarea>
    `;
  }

  onInput() {
	this.value = this.textarea.value;
    this.dispatchEvent(new CustomEvent("codechange", {detail: this.value}));
  }

  updated() {
    highlightElement(this.code);
  }

  @property({type: String})
  language: "css" | "ts" = "ts";

  keydown(e: KeyboardEvent) {
    if (e.key === "Tab") {
      e.preventDefault();
      document.execCommand("insertText", false, "\t");
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "code-editor": CodeEditor;
  }
}

export default CodeEditor;
