import { html, css } from "lit-element";

import CodeFlask from "codeflask";

import BTBase from "../bt-base";
import { isEmpty } from "lodash";

const ErrorInvalidJSON = "error_invalid_json";

// A text editor for JSON, not meant to be used as a form field as yet.
class BTJSONEditor extends BTBase {
  static get properties() {
    return {
      model: { type: String },
      readonly: { type: Boolean },

      _errors: { type: Array },
    };
  }

  constructor() {
    super();

    this._errors = [];
  }

  render() {
    return html` <div id="editor"></div> `;
  }

  firstUpdated() {
    const container = this._id("editor");

    this._flask = new CodeFlask(container, {
      language: "js",
      lineNumbers: true,
      styleParent: this.shadowRoot,
    });

    this._flask.onUpdate((code) => {
      this._silentUpdateModel = true;
      this.model = code;
      this._silentUpdateModel = false;

      this.validate();
      this._emit("model-change", { value: code });
    });
  }

  updated(changed) {
    if (changed.has("model")) {
      if (!this._silentUpdateModel) {
        this._flask.updateCode(this.model);
      }
    }

    if (changed.has("readonly")) {
      if (this.readonly) {
        this._flask.enableReadonlyMode();
      } else {
        this._flask.disableReadonlyMode();
      }
    }
  }

  validate() {
    const errors = [];
    try {
      const json = JSON.parse(this.model);
      const isValid = typeof json === "object" && !isEmpty(json);
      if (!isValid) {
        errors.push(ErrorInvalidJSON);
      }
    } catch (e) {
      errors.push(ErrorInvalidJSON);
    }

    this._errors = errors;

    return errors.length === 0;
  }

  format() {
    try {
      const json = JSON.parse(this.model);
      this.model = JSON.stringify(json, null, 4);
      return true;
    } catch (e) {
      console.error("Error formatting");
    }

    return false;
  }

  static get styles() {
    return [super.styles, css``];
  }
}
customElements.get("bt-json-editor") ||
  customElements.define("bt-json-editor", BTJSONEditor);
