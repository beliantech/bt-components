import { html } from "lit-element";
import { classMap } from "lit-html/directives/class-map";

import BTBase from "../bt-base";

import "./internal/bt-editable-options";
import "./bt-field";

import errorTemplate from "./templates/error";

const ErrorRequired = "required";

class BTRadio extends BTBase {
  static get properties() {
    return {
      label: { type: String },

      editable: { type: Boolean },
      required: { type: Boolean },
      hideIndicator: { type: Boolean },
      disableValidation: { type: Boolean },
      displaymode: { type: Boolean },
      clickToEdit: { type: Boolean },
      horizontal: { type: Boolean },

      description: { type: String },
      options: { type: Array },
      model: { type: String }, // the UUID

      _errors: { type: Array },
    };
  }

  constructor() {
    super();

    this._errors = [];
    this.options = [];
    this.horizontal = false;
  }

  render() {
    const errorRequired = this._errors.includes(ErrorRequired);

    const containerClasses = {
      "border-hover": this.clickToEdit && this.displaymode,
    };

    return html`
      ${style}
      <bt-field .field=${this}>
        <div class=${classMap(containerClasses)}>
          <!--Need to use <form> because Safari at one point does not scope radios using Shadow DOM boundary.-->
          <form
            class="m-0 py-0 px-0
              ${this.horizontal ? "flex flex-row" : "flex flex-col"}"
          >
            ${this.options.map((option) => {
              return html`
                <label
                  class="text-sm mr-4 my-1 cursor-pointer flex items-center"
                  for="${option.id}"
                >
                  <input
                    type="radio"
                    id="${option.id}"
                    class="cursor-pointer"
                    value="${option.id}"
                    ?checked="${option.id === this.model}"
                    ?disabled=${this.displaymode}
                    @change="${this._onChange}"
                    style="margin-right:8px;"
                    name="radios"
                  />
                  <span class="inline-block">${option.name}</span></label
                >
              `;
            })}
          </form>
          ${this.editable
            ? html`
                <bt-editable-options
                  class="mt-2"
                  .model="${this.options || []}"
                  @model-change="${this._onOptionsModelChange}"
                  .type="${"radio"}"
                >
                </bt-editable-options>
              `
            : html``}
          ${errorTemplate(errorRequired, "Please select an option")}
        </div>
      </bt-field>
    `;
  }

  updated(changed) {
    if (changed.has("model") && this.model) {
      // Need to write the value of input explicitly because value attribute only sets the default value.
      const input = this._id(this.model);
      if (input) input.checked = true;
    }
  }

  get inputs() {
    return this._selectAll("form input");
  }

  get selectedInput() {
    return this.inputs.find((input) => input.checked);
  }

  get selectedValue() {
    return this.selectedInput ? this.selectedInput.value : "";
  }

  validate() {
    if (this.disableValidation) return true;
    const errors = [];
    if (this.required) {
      if (!this.selectedValue) {
        errors.push(ErrorRequired);
      }
    }

    this._errors = errors;
    this._emit("errors-change", { id: this.id, errors: errors });

    return errors.length === 0;
  }

  _onChange(e) {
    this.validate();
    this.model = e.currentTarget.value;

    this._emit("model-change", {
      value: this.model,
    });
  }

  _onOptionsModelChange(e) {
    this.options = e.detail.value;

    this._emit("options-change", {
      value: this.options,
    });
  }
}
customElements.define("bt-radio", BTRadio);

const style = html`
  <style>
    .border-hover:hover {
      border: 1px solid lightgray;
    }
    .border-hover {
      border: 1px solid transparent;
      cursor: pointer;
    }

    fieldset {
      border: 0;
    }
  </style>
`;
