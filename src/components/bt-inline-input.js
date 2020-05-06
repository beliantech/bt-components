import { html } from "lit-element";
import BTBase from "bt-base";

class BTInlineInput extends BTBase {
  static get properties() {
    return {
      editable: { type: Boolean, reflect: true },

      model: { type: String },
      type: { type: String },
      placeholder: { type: String },
      required: { type: Boolean },

      name: { type: String },

      inlineClass: { type: String },
      inputClass: { type: String },

      submitOnBlur: { type: Boolean },

      // if true, Enter submits a textarea (no newline allowed)
      textareaSubmitOnEnter: { type: Boolean },

      highlightOnFocus: { type: Boolean },
      highlightOnClick: { type: Boolean },

      noline: { type: Boolean },

      _editMode: { type: Boolean },
    };
  }

  constructor() {
    super();

    this.model = "";
    this.editable = true;
    this.required = false;
    this.placeholder = "";
    this._editMode = false;
    this.noline = false;
    this.submitOnBlur = true;

    this.inlineClass = "";
    this.inputClass = "";
  }

  get inputEl() {
    const input = this._id("input");
    if (input) {
      return input.inputEl;
    }
    return null;
  }

  // Activate edit mode
  edit() {
    this._editMode = true;
  }

  render() {
    let contentTemplate = html``;

    if (this._editMode && this.editable) {
      contentTemplate = html`
        <kr-input
          id="input"
          inline
          expandable
          .textareaSubmitOnEnter=${this.textareaSubmitOnEnter}
          .adjustable=${false}
          .noline="${this.noline}"
          .required="${this.required}"
          .highlightOnFocus="${this.highlightOnFocus}"
          .highlightOnClick="${this.highlightOnClick}"
          .showErrorText="${false}"
          .model="${this.model}"
          .type="${this.type}"
          .name="${this.name}"
          .placeholder="${this.placeholder}"
          .inputClass="${this.inputClass}"
          @keydown="${e => {
            // keypress does not cross Shadom DOM boundary
            if (e.key === "Escape") {
              this._editMode = false;
            }
          }}"
          @input-blur="${e => {
            this._editMode = false;

            // note(jon): submit inline input on input blur
            if (this.submitOnBlur) {
              this._emitInputSubmitDebounced(e);
            }
          }}"
          @model-change="${e => {
            this.model = e.detail.value;

            // proxy the event up
            this._emit("model-change", {
              value: e.detail.value,
            });
          }}"
          @input-submit="${e => {
            this._editMode = false;

            // proxy the event up
            this._emitInputSubmitDebounced(e);
          }}"
        >
        </kr-input>
      `;
    } else {
      contentTemplate = html`
        <div class="flex items-center ${this.inlineClass}">
          <span
            class="display
              ${this.model ? "" : "text-muted"}
              ${this.type ? `type-${this.type}` : ""}"
            >${this.model || this.placeholder}</span
          >
          <div class="ml-1"><slot></slot></div>
        </div>
      `;
    }
    return html`
      ${style({ editable: this.editable })}
      <div>${contentTemplate}</div>
    `;
  }

  // Emits input-submit at most once if called multiple times within debounce period
  _emitInputSubmitDebounced(e) {
    if (this._emitted) return;

    this._emitted = true;
    this._emit("input-submit", {
      value: e.detail.value,
    });

    // note(jon): DIY debounce
    setTimeout(() => {
      this._emitted = false;
    }, 200);
  }

  updated(changedProps) {
    if (changedProps.get("_editMode") === false) {
      this.updateComplete.then(() => {
        if (this._id("input")) {
          this._id("input").focus();
        }
      });
    }
  }

  get updateComplete() {
    return super.updateComplete.then(() => {
      return this._id("input")
        ? this._id("input").updateComplete
        : Promise.resolve();
    });
  }

  connectedCallback() {
    super.connectedCallback();

    this._clickListener = (() => {
      this._editMode = true;
    }).bind(this);
    this.addEventListener("click", this._clickListener);

    this._blurListener = (() => {
      this._editMode = false;
    }).bind(this);
    this.addEventListener("blur", this._blurListener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener("click", this._clickListener);
    this.removeEventListener("blur", this._blurListener);
  }
}
customElements.define("bt-inline-input", BTInlineInput);

const editableStyle = html`
  <style>
    :host(:hover) {
      cursor: pointer;
    }
    :host(:hover) .display {
      background-color: lightgray;
    }

    .display {
      cursor: pointer;
    }
    .display:hover {
      background-color: lightgray;
    }
    .display.type-textarea {
      white-space: pre-wrap;
    }
    .text-muted {
      color: gray;
    }
  </style>
`;

const style = ({ editable }) => html`
  ${editable ? editableStyle : null}
`;
