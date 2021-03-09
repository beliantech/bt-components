import { html } from "lit-element";
import BTBase from "../bt-base";

import "./internal/bt-editable-options";
import "./internal/bt-filterable-items";
import "./bt-icon";
import "./bt-field";

import errorTemplate from "./templates/error";

import { clickOutsideToDismiss } from "../util/mouse";

import colors from "../colors";

const ErrorRequired = "required";

class BTSelect extends BTBase {
  static get properties() {
    return {
      label: { type: String },
      placeholder: { type: String },

      filterable: { type: Boolean },
      multiselect: { type: Boolean },
      emptyPlaceholder: { type: Boolean },

      editable: { type: Boolean },
      required: { type: Boolean },
      horizontal: { type: Boolean },
      hideIndicator: { type: Boolean },
      disabled: { type: Boolean },
      disableValidation: { type: Boolean },

      displaymode: { type: Boolean },
      clickToEdit: { type: Boolean },
      small: { type: Boolean },

      description: { type: String },
      options: { type: Array },
      model: { type: String }, // the UUID or some ID

      errorMessage: { type: String },

      _errors: { type: Array },

      _filterableShowItems: { type: Boolean },
      _filterableModel: { type: String },
    };
  }

  constructor() {
    super();

    this.placeholder = "Select an option";
    this.emptyPlaceholder = false;
    this.displaymode = false;
    this.multiselect = false;
    this.filterable = false;
    this.model = "";

    this._errors = [];
    this._filterableModel = "";
  }

  set model(model) {
    const oldModel = this._model;

    if (Array.isArray(model)) {
      this._model = model;
    } else {
      this._model = model == null ? "" : `${model}`; // convert to string...
    }
    this.requestUpdate("model", oldModel);
  }
  get model() {
    return this._model;
  }

  render() {
    let contentTemplate = html``;
    if (this.displaymode) {
      const selectedOption = this.options.find((opt) => opt.id === this.model);
      if (selectedOption) {
        contentTemplate = html`
          <div class="text-sm">${selectedOption.name}</div>
        `;
      } else {
        contentTemplate = html`
          <div class="text-gray-600 text-sm">(empty)</div>
        `;
      }
    } else if (this.filterable || this.multiselect) {
      contentTemplate = html`
        <bt-filterable-items
          id="filterable"
          .items=${this.options}
          .model=${this.model || []}
          .allowMultiselect=${this.multiselect}
          .displayCheckboxes=${this.multiselect}
          @model-change=${(e) => {
            if (e.detail.value && e.detail.value.length) {
              this.model = e.detail.value;

              this._emit("model-change", {
                value: this.model,
              });
              this.validate();
            }
          }}
        ></bt-filterable-items>
      `;
    } else {
      contentTemplate = html`
        <div class="relative">
          <select
            class="block w-full px-2 ${this.small
              ? "small py-1"
              : "py-2"} mr-4 text-sm"
            id="select"
            @change="${this._onChange}"
            ?disabled=${this.disabled}
          >
            ${this.placeholder || this.emptyPlaceholder
              ? html` <option value="${""}">${this.placeholder}</option> `
              : html``}
            ${this.options &&
            this.options.map(
              (option) =>
                html`
                  <option
                    value="${option.id}"
                    ?selected="${this.model === option.id}"
                  >
                    ${option.name}
                  </option>
                `
            )}
          </select>
          <bt-icon
            class="absolute right-0 ${this.small ? "" : "my-2"}"
            style="top:2px;"
            >expand_more</bt-icon
          >
        </div>
      `;
    }

    const errorRequired = this._errors.includes(ErrorRequired);

    return html`
      ${style}
      <bt-field .field=${this}>
        <div class="${this.horizontal ? "flex" : ""}">
          ${contentTemplate}
          ${this.editable
            ? html`
                <bt-editable-options
                  class="mt-2"
                  .model="${this.options}"
                  @model-change="${this._onOptionsModelChange}"
                  .type="${"dropdown"}"
                >
                </bt-editable-options>
              `
            : html``}
          ${errorTemplate(errorRequired, "Please select an option")}
          ${errorTemplate(this.errorMessage != null, this.errorMessage)}
        </div>
      </bt-field>
    `;
  }

  updated(changed) {
    // Need to write the value of input explicitly because value attribute only sets the default value.
    if (this._id("select")) {
      this._id("select").value = this.model;
    }

    if (changed.has("_filterableShowItems")) {
      if (this._filterableShowItems) {
        this._removeClickOutsideHandler =
          this._removeClickOutsideHandler ||
          clickOutsideToDismiss(this, () => {
            this._filterableShowItems = false;

            // Restore input value to selected option
            if (this.model) {
              const option = this.options.find(
                (option) => this.model === option.id
              );
              if (option) {
                this._id("filterable").model = option.name;
                this.model = option.id;
              }
            }

            this.validate();
          });
      } else {
        this._removeClickOutsideHandler && this._removeClickOutsideHandler();
        this._removeClickOutsideHandler = null;
      }
    }
  }

  validate() {
    if (this.disableValidation) return true;
    const errors = [];
    if (this.required) {
      if (!this.model) {
        errors.push(ErrorRequired);
      }
    }

    this._errors = errors;
    this._emit("errors-change", { id: this.id, errors: errors });

    return errors.length === 0;
  }

  _onChange(e) {
    this.model = e.currentTarget.value;

    this._emit("model-change", {
      value: this.model,
    });

    this.validate();
  }

  _onOptionsModelChange(e) {
    this.options = e.detail.value;

    this._emit("options-change", {
      value: this.options,
    });
  }
}
customElements.define("bt-select", BTSelect);

const style = html`
  <style>
    select {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;

      background-color: white;
      border: 1px solid lightgray;
      border-radius: 0;

      outline: none;
      height: 40px;
    }
    select.small {
      height: 32px;
    }

    select:focus {
      border: 1px solid ${colors.blue};
    }

    bt-icon {
      color: gray;
      pointer-events: none;
    }
  </style>
`;
