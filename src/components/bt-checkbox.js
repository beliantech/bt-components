import { html, css, unsafeCSS } from "lit-element";
import { unsafeHTML } from "lit-html/directives/unsafe-html";
import BTBase from "../bt-base";

import "./bt-icon";
import "./bt-inline-input";
import { urlify } from "../util/url";
import labelTemplate from "./templates/label";

import colors from "../colors";

export default class BTCheckbox extends BTBase {
  static get properties() {
    return {
      label: { type: String },
      description: { type: String },
      model: { type: Boolean },
      disabled: { type: Boolean, reflect: true },
      editable: { type: Boolean, reflect: true },
      _indeterminate: {
        type: Boolean,
        reflect: true,
        attribute: "indeterminate",
      },

      inline: { type: Boolean }, // whether or not label is inline
    };
  }

  constructor() {
    super();

    this.inline = true;
    this._model = false;
  }

  get model() {
    return this._model;
  }

  set model(model = null) {
    const oldModel = this._model;

    if (model === null) {
      this._indeterminate = true;
    }

    this._model = model;
    this.requestUpdate("model", oldModel);
  }

  get inputEl() {
    const inlineInput = this._id("inline");
    if (inlineInput) {
      return inlineInput.inputEl;
    }
    return null;
  }

  get input() {
    return this._select("input");
  }

  edit() {
    if (this.editable) {
      this._id("inline").edit();
    }
  }

  render() {
    return html`
      ${this.inline
        ? html``
        : labelTemplate({
            label: this.label,
            hideIndicator: true,
          })}
      <div class="flex items-center container">
        <input
          id="input"
          class="mr-1"
          type="checkbox"
          ?disabled=${this.disabled}
          ?checked=${this.model}
          @change=${this._onChange}
        />
        <bt-icon class="o m-0" small @click=${(e) => this._onIconClick(e, true)}
          >check_box_outline_blank</bt-icon
        >
        ${this._indeterminate
          ? html`
              <bt-icon
                class="i m-0"
                small
                @click=${(e) => this._onIconClick(e, false)}
                >indeterminate_check_box</bt-icon
              >
            `
          : html``}
        <bt-icon
          class="x m-0"
          small
          @click=${(e) => this._onIconClick(e, false)}
          >check_box</bt-icon
        >
        ${this.editable
          ? html`
              <bt-inline-input
                id="inline"
                class="ml-1 w-full"
                textareaSubmitOnEnter
                .model=${this.label}
                .inlineClass=${"text-sm"}
                .type=${"textarea"}
                @input-submit="${this._onInputSubmit}"
              >
              </bt-inline-input>
            `
          : this.inline && this.label
          ? html`
              <label
                class="block text-sm w-full pl-1"
                for="input"
                @click=${this._onLabelClick}
              >
                <span class="w-full" style="word-break:break-word;"
                  >${unsafeHTML(urlify(this.label))}</span
                >
              </label>
            `
          : html``}
      </div>
      ${this.description
        ? html`<div class="text-xs mt-1">${this.description}</div>`
        : html``}
    `;
  }

  // Handle label click toggles input manually in order to prevent click checkbox within <a></a> triggering navigation
  _onLabelClick(e) {
    if (this.disabled) return;
    if (e.target.nodeName === "A") {
      // If click on link within label, navigate
      return;
    }

    this.model = !this.model;
    this._emit("model-change", {
      value: this.model,
    });
    // prevent click checkbox within <a></a> triggering navigation
    e.preventDefault();
  }

  _onIconClick(e, nextmodel) {
    if (this.disabled) return;

    if (!nextmodel) {
      this._indeterminate = false;
    }
    this.model = nextmodel;
    this._emit("model-change", {
      value: this.model,
    });
    // prevent click checkbox within <a></a> triggering navigation
    e.preventDefault();
    e.stopPropagation();
  }

  updated(changedProps) {}

  _onChange(e) {
    this.model = e.currentTarget.checked;
    this._emit("model-change", {
      value: this.model,
    });
  }

  _onInputSubmit(e) {
    // Strip all newlines
    let value = e.detail.value;
    value = value.replace(/(\r?\n|\r)+/g, " ");

    if (this.label !== value) {
      this._emit("label-change", {
        value,
      });
    }
  }

  static get styles() {
    return [
      super.styles,
      css`
        :host([indeterminate]) .x,
        :host([indeterminate]) .o {
          display: none;
        }
        input[type="checkbox"] {
          display: none;
        }
        input[type="checkbox"] ~ .o {
          display: inline-block;
          padding: 0 0 0 0px;
        }
        input[type="checkbox"] ~ .x {
          display: none;
        }
        input[type="checkbox"]:checked ~ .x {
          display: inline-block;
          padding: 0 0 0 0px;
        }
        input[type="checkbox"]:checked ~ .o {
          display: none;
        }
        input[type="checkbox"]:disabled ~ label,
        input[type="checkbox"]:disabled ~ .x,
        input[type="checkbox"]:disabled ~ .o {
          cursor: unset !important;
          user-select: auto;
          color: ${unsafeCSS(colors.lightgray)};
        }
        .o,
        .x {
          color: inherit;
        }
        label {
          user-select: none;
          cursor: pointer;
        }
        bt-icon {
          cursor: pointer;
        }
      `,
    ];
  }
}
customElements.define("bt-checkbox", BTCheckbox);
