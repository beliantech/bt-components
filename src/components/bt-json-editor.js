import { html, css, unsafeCSS } from "lit-element";
import JSONEditor from "jsoneditor";
import jsonEditorStyle from "jsoneditor/dist/jsoneditor.css";

import BTBase from "../bt-base";

class BTJSONEditor extends BTBase {
  static get properties() {
    return {};
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <div id="jsoneditor"></div>
      <div>Foo</div>
    `;
  }

  firstUpdated() {
    const container = this._id("jsoneditor");
    const editor = new JSONEditor(container, { mode: "code" });

    console.debug("json editor style", jsonEditorStyle);
  }

  static get styles() {
    return [
      super.styles,
      css`
        ${unsafeCSS(jsonEditorStyle)}
      `,
    ];
  }
}
customElements.get("bt-json-editor") ||
  customElements.define("bt-json-editor", BTJSONEditor);
