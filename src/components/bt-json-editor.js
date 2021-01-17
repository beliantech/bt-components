import { html, css, unsafeCSS } from "lit-element";

import CodeFlask from "codeflask";

import BTBase from "../bt-base";

class BTJSONEditor extends BTBase {
  static get properties() {
    return {
      model: { type: String },
    };
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <div id="editor"></div>
      <div>Foo</div>
    `;
  }

  firstUpdated() {
    const container = this._id("editor");

    this._flask = new CodeFlask(container, {
      language: "js",
      lineNumbers: true,
      styleParent: this.shadowRoot,
    });

    this._flask.onUpdate((code) => {
      this._emit("model-change", { value: code });
    });
  }

  updated(changed) {
    if (changed.has("model")) {
      this._flask.updateCode(this.model);
    }
  }

  static get styles() {
    return [super.styles, css``];
  }
}
customElements.get("bt-json-editor") ||
  customElements.define("bt-json-editor", BTJSONEditor);
