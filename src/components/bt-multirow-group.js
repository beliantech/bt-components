import { html, css } from "lit-element";
import { ifDefined } from "lit-html/directives/if-defined";
import BTBase from "../bt-base";

import errorTemplate from "./templates/error";

import "./bt-multipart-input";
import "./bt-field";
import "./bt-input";
import "./bt-icon";
import "./bt-button";

const ErrorNoRows = "error_no_rows";

// This element makes it possible to turn any supported field into a multirow field.
class BTMultirowGroup extends BTBase {
  static get properties() {
    return {
      field: { type: Object },
      model: { type: Array }, // Array of row models
      rows: { type: Array }, // Array of rows, used in tablemode to fix the row content

      label: { type: String },
      description: { type: String },

      required: { type: Boolean },
      displaymode: { type: Boolean, reflect: true },
      tablemode: { type: Boolean, reflect: true }, // static number of rows, displayed in table-like manner

      defaultRowCount: { type: Number }, // number of rows created by default on first render

      buttonText: { type: String },

      errorMessage: { type: String },
      _errors: { type: Array },
    };
  }

  constructor() {
    super();
    this.rowCount = 1;
    this._model = [];
    this._errors = [];
    this.defaultRowCount = 0;
    this.tablemode = false;
  }

  get model() {
    return this._model || [];
  }

  set model(model) {
    const oldValue = this._model;
    this._model = model || [];
    this.requestUpdate("model", oldValue);
  }

  render() {
    if (!this.field) return html``;

    return html`
      <bt-field .field=${this}>
        <div>
          <div id="fields">${this._renderRows()}</div>
          ${this.displaymode || this.tablemode
            ? html``
            : html`
                <bt-button
                  block
                  secondary
                  center
                  small
                  class="block mt-2"
                  @click=${this._addRow}
                  icon="add"
                >
                  ${this.buttonText || "Add row"}
                </bt-button>
                ${this._errorTemplate}
              `}
        </div>
      </bt-field>
    `;
  }

  firstUpdated() {
    const currRowCount = this._model.length;
    if (currRowCount < this.defaultRowCount) {
      for (let i = 0; i < this.defaultRowCount - currRowCount; i++) {
        this._addRow();
      }
    }
  }

  get _errorTemplate() {
    if (this.errorMessage) {
      return errorTemplate(true, this.errorMessage);
    }

    const errorNoRows = this._errors.indexOf(ErrorNoRows) >= 0;
    return errorTemplate(errorNoRows, "Add at least one row");
  }

  validate() {
    let hasError = false;
    this._selectAll(".field").forEach((component) => {
      const ok = component.validate();
      if (!ok) {
        hasError = true;
      }
    });

    return !hasError && this._validateRowCount();
  }

  _validateRowCount() {
    const errors = [];

    if (this.required && this.model.length === 0) {
      errors.push(ErrorNoRows);
    }

    this._errors = errors;
    this._emit("errors-change", { id: this.id, errors: errors });
    return errors.length === 0;
  }

  _renderRows() {
    const templates = [];
    switch (this.field.type) {
      case "multipart_input": {
        let array = [];
        if (this.tablemode && this.rows) {
          array = this.rows;
        } else {
          array = this._model;
        }

        for (let i = 0; i < array.length; i++) {
          const idx = i;
          templates.push(html`
            <bt-multipart-input
              class="field"
              .schema=${this.field.schema}
              .layout=${ifDefined(this.field.layout)}
              .model=${array[idx]}
              ?displaymode=${this.displaymode}
              ?hidelabel=${this.tablemode && idx > 0}
              @model-change=${(e) => {
                this._model[idx] = e.detail.value;

                this._emit("model-change", {
                  value: this._model,
                });
              }}
            ></bt-multipart-input>
          `);
        }
        break;
      }
      case "short_text":
      case "long_text":
      case "number": {
        for (let i = 0; i < this._model.length; i++) {
          const idx = i;
          templates.push(html`
            <bt-input
              class="field"
              .model=${this._model[idx]}
              ?displaymode=${this.displaymode}
              ?required=${this.field.required}
              .inputType=${this.field.type === "number" ? "number" : "text"}
              @model-change=${(e) => {
                this._model[idx] = e.detail.value;

                this._emit("model-change", {
                  value: this._model,
                });
              }}
              .min=${ifDefined(this.field.min)}
              .max=${ifDefined(this.field.max)}
              .validateAs=${this.field.validateAs}
            ></bt-input>
          `);
        }
        break;
      }
    }
    if (templates.length) {
      return templates.map((t, idx) => {
        if (this.tablemode) {
          return t;
        }

        return html`
          ${idx > 0
            ? html`<div
                class="border-t-2"
                style="border-color:lightgray;"
              ></div>`
            : html``}
          <div
            class="flex items-center my-2 py-2 pl-4 border-l-4"
            style="border-color:lightgray"
          >
            <div class="pr-2 mr-2 flex-1 border-r" style="border-color:#eee">
              ${t}
            </div>
            ${this.displaymode
              ? html``
              : html`
                  <bt-icon button @click=${() => this._deleteRow(idx)}
                    >close</bt-icon
                  >
                `}
          </div>
        `;
      });
    }

    return html``;
  }

  _addRow() {
    // Append empty model
    const model = (this.model || []).slice();
    switch (this.field.type) {
      case "multipart_input": {
        model.push([]);
        break;
      }
      case "short_text": {
        model.push("");
        break;
      }
      case "number": {
        model.push(0);
        break;
      }
    }
    this.model = model;
    this._emit("model-change", {
      value: model,
    });

    this.updateComplete.then(() => this._validateRowCount());
  }

  _deleteRow(rowIndex) {
    const model = this.model.slice();
    model.splice(rowIndex, 1);

    this.model = model;
    this._emit("model-change", {
      value: model,
    });

    this.updateComplete.then(() => this._validateRowCount());
  }

  get updateComplete() {
    return Promise.all([
      super.updateComplete,
      ...this._selectAll(".field").map((f) => f.updateComplete),
    ]);
  }

  static get styles() {
    return [
      super.styles,
      css`
        :host {
          display: block;
        }
      `,
    ];
  }
}
customElements.define("bt-multirow-group", BTMultirowGroup);
