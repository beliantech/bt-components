import { html, css, unsafeCSS } from "lit-element";
import { unsafeHTML } from "lit-html/directives/unsafe-html";
import { ifDefined } from "lit-html/directives/if-defined";
import { classMap } from "lit-html/directives/class-map";
import { styleMap } from "lit-html/directives/style-map";

import BTBase from "../bt-base";
import t from "../locale";

import errorTemplate from "./templates/error";

import { urlify } from "../util/url";

import "./bt-inline-input";
import "./bt-field";

import { isEmail } from "../validate";

import debounce from "lodash/debounce";
import keyBy from "lodash/keyBy";
import isEmpty from "lodash/isEmpty";

const TypeInput = "input";
const TypeTextarea = "textarea";
const TypeRichText = "richtext";

const ErrorInvalidEmail = "error-invalid-email";
const ErrorInvalid = "error-invalid";
const ErrorRequired = "error-required";
const ErrorMinLength = "error-minlength";

const InputTypeNumber = "number";
const InputTypeText = "text";
const InputTypePassword = "password";

class BTInput extends BTBase {
  static get properties() {
    return {
      label: { type: String },
      placeholder: { type: String },
      description: { type: String },
      validateAs: { type: String },
      validateRegex: { type: String },

      // Annotation, e.g. "computed"
      annotation: { type: String },

      inline: { type: Boolean, reflect: true },

      // if true, as the user types, the textarea's height increases automatically
      expandable: { type: Boolean, reflect: true },
      rows: { type: Number },

      // if true, a UI handler is shown in textarea to adjust height
      adjustable: { type: Boolean, reflect: true },

      editable: { type: Boolean, reflect: true },
      required: { type: Boolean, reflect: true },
      disabled: { type: Boolean, reflect: true },
      horizontal: { type: Boolean, reflect: true },
      displaymode: { type: Boolean, reflect: true },
      clickToEdit: { type: Boolean, reflect: true },
      debounced: { type: Boolean, reflect: true },
      disableValidation: { type: Boolean, reflect: true },

      // if true, Enter submits a textarea (no newline allowed)
      textareaSubmitOnEnter: { type: Boolean },

      highlightOnFocus: { type: Boolean, reflect: true },
      highlightOnClick: { type: Boolean, reflect: true },

      model: { type: String },
      chips: { type: Array },

      type: { type: String }, // input or textarea
      inputType: { type: String }, // number, password, etc. default is text

      width: { type: String },
      inputAlign: { type: String },
      labelAlign: { type: String },
      labelColor: { type: String },
      showErrorText: { type: Boolean },
      hideIndicator: { type: Boolean },
      noline: { type: Boolean },
      noindent: { type: Boolean },

      inputClass: { type: String },

      min: { type: Number },
      max: { type: Number },
      minlength: { type: Number },
      maxlength: { type: Number },
      step: { type: Number },

      // value: { type: String },

      errorMessage: { type: String },

      _errors: { type: Array },
    };
  }

  /* Properties not required for render.*/
  get validator() {
    return this._validator;
  }
  set validator(validator) {
    this._validator = validator;
  }
  get corrector() {
    return this._corrector;
  }
  set corrector(corrector) {
    this._corrector = corrector;
  }
  get transformer() {
    return this._transformer;
  }
  set transformer(transformer) {
    this._transformer = transformer;
  }
  set allowedCharacters(characters = "") {
    if (characters) {
      this._allowedCharactersMap = keyBy(characters.split(""));
    }
  }
  get name() {
    return this._name;
  }
  set name(name) {
    this._name = name;
  }
  get model() {
    if (this.inputType === InputTypeNumber) {
      if (this._model) {
        return +this._model;
      }
    }

    return this._model || "";
  }
  set model(model) {
    if (model == null) {
      model = "";
    }

    const oldModel = this.model;

    // note(jon): treat the underlying _model as string
    if (this.inputType === InputTypeNumber) {
      // Strip non digits away
      let numberModelCandidate = String(model);
      this._model = numberModelCandidate.replace(/[^\d]/g, "");
    } else {
      this._model = String(model);
    }

    // requestUpdate only on changes
    if (this._model != oldModel) {
      this.requestUpdate("model", oldModel);
    }
  }

  /* test helper */
  get inputEl() {
    return this._id("input");
  }

  constructor() {
    super();

    this.model = "";
    this.chips = [];
    this.width = "100%";
    this._errors = [];
    this.placeholder = "";
    this.showErrorText = true;
    this.inputClass = "";
    this.inputType = InputTypeText;
    this.type = "input";
    this.inline = false;
    this.noline = false;
    this.expandable = false;
    this.adjustable = true;
    this.editable = false;
    this.required = false;
    this.horizontal = false;
    this.displaymode = false;
    this.clickToEdit = false;
    this.disableValidation = false;
    this.rows = 6;
    this._allowedCharactersMap = {};
  }

  focus() {
    const input = this._id("input");
    if (input) {
      input.focus();

      // note(jon): cannot set selection on number type
      if (this.inputType === InputTypeText) {
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }
  }

  validate({ silent = false } = {}) {
    if (this.disableValidation) return true;

    const errors = [];
    const trimmedModel = this._model.trim();

    if (this.required) {
      if (trimmedModel.length === 0) {
        errors.push(ErrorRequired);
      } else if (this.minlength && trimmedModel.length < this.minlength) {
        errors.push(ErrorMinLength);
      }
    }

    if (this.validator) {
      const { valid, error } = this.validator(trimmedModel);
      if (!valid) {
        errors.push(error);
      }
    }

    if (this.validateAs === "email") {
      if (!isEmail(trimmedModel)) {
        errors.push(ErrorInvalidEmail);
      }
    }

    if (trimmedModel && this.validateRegex) {
      if (!trimmedModel.match(this.validateRegex)) {
        errors.push(ErrorInvalid);
      }
    }

    if (!silent) {
      this._errors = errors;
      this._emit("errors-change", { id: this.id, errors: errors });
    }

    return this._errors.length === 0;
  }

  render() {
    let contentTemplate = null;
    let errorTemplate = null;
    let inputTemplate = null;
    if (this.displaymode) {
      contentTemplate = html`
        ${this.model != null && this.model !== ""
          ? /*prettier-ignore */ html`
              <div class="display text-sm" @click=${this._onDisplayClick}>${unsafeHTML(urlify(this.model))}</div>
            `
          : html` <div class="text-gray-600 text-sm">(empty)</div> `}
      `;
    } else {
      errorTemplate = this._renderErrorTemplate();
      inputTemplate = this._renderInputTemplate();
    }

    const containerClasses = {
      flex: this.horizontal,
    };

    return html`
      <bt-field
        .field=${this}
        .textareaSubmitOnEnter=${this.textareaSubmitOnEnter}
        @edit-mode=${() => this.updateComplete.then(() => this.focus())}
      >
        <div
          class="inline-block ${classMap(containerClasses)}"
          style="${this.width
            ? `width: ${this.width};`
            : ""} position: relative;"
        >
          <div>
            ${contentTemplate} ${inputTemplate} ${errorTemplate}
          </div>
        </div>
      </bt-field>
    `;
  }

  _renderErrorTemplate() {
    // In order of importance
    if (this._errors.includes(ErrorRequired)) {
      return errorTemplate(
        this.showErrorText,
        `${t(this.label)} cannot be blank`
      );
    } else if (this._errors.includes(ErrorMinLength)) {
      return errorTemplate(
        this.showErrorText,
        `${t(this.label)} should have at least length ${this.minlength}`
      );
    } else if (this._errors.includes(ErrorInvalidEmail)) {
      return errorTemplate(
        this.showErrorText,
        `${t(this.label)} is not a valid email`
      );
    } else if (this._errors.includes(ErrorInvalid)) {
      return errorTemplate(this.showErrorText, `${t(this.label)} is invalid`);
    } else if (this._errors.length > 0) {
      // Take message from errors object
      return errorTemplate(this.showErrorText, this._errors[0]);
    } else if (this.errorMessage) {
      return errorTemplate(this.showErrorText, this.errorMessage);
    }
  }

  _renderInputTemplate() {
    if (this.type === "textarea") {
      const textAreaStyle = {};
      if (this.adjustable) {
        textAreaStyle["resize"] = "vertical";
      } else {
        textAreaStyle["resize"] = "none";
      }
      if (this.expandable) textAreaStyle["overflow"] = "hidden";

      return html`
        <textarea
          rows=${this.expandable ? 1 : this.rows}
          id="input"
          value=${this.model}
          class="p-2 w-full text-sm ${this._errors.length > 0
            ? "border-error"
            : ""}"
          style="${styleMap(textAreaStyle)}"
          placeholder="${ifDefined(this.placeholder)}"
          ?disabled="${this.disabled}"
          @input="${this._onInput}"
          @blur="${this._onBlur}"
          @keydown=${(e) => {
            if (this.expandable) {
              this._resizeTextarea();
            }
          }}
          @cut=${(e) => {
            if (this.expandable) {
              this._resizeTextarea();
            }
          }}
          @paste=${(e) => {
            if (this.expandable) {
              this._resizeTextarea();
            }
          }}
        >
${this.model}</textarea
        >
      `;
    } else if (this.type === TypeRichText) {
      return html` <slot></slot> `;
    } else {
      const inputClasses = {
        "text-sm": true,
        "flex-1": true,
      };
      if (this.inline) {
        inputClasses["inline"] = true;
        inputClasses["px-0"] = true;
        inputClasses["py-1"] = true;
      } else {
        inputClasses["py-2"] = true;
        inputClasses["px-1"] = true;
      }
      if (this.noline) {
        inputClasses["noline"] = true;
      }
      if (this.noindent) {
        inputClasses["noindent"] = true;
      }
      if (this.chips.length === 0) {
        inputClasses["w-full"] = true;
      }
      if (this._errors.length > 0) {
        inputClasses["border-error"] = true;
      }
      if (this.inputType === InputTypeNumber) {
        inputClasses["pr-1"] = true;
      }

      return html`
        <div
          class="w-full
            ${this.chips.length
            ? "border border-lightgray inline-block p-2 flex items-center"
            : ""}"
        >
          ${this.chips.length > 0
            ? this.chips.map(
                (chip) =>
                  html`
                    <span class="px-2 py-1 text-sm bg-gray-200 mr-2"
                      >${chip}</span
                    >
                  `
              )
            : html``}
          <input
            class=${classMap(inputClasses)}
            ?disabled="${this.disabled}"
            id="input"
            style="${this.inputAlign ? `text-align: ${this.inputAlign}` : ""}"
            placeholder="${ifDefined(t(this.placeholder))}"
            type="${this.inputType || "text"}"
            value="${ifDefined(this.model)}"
            min="${ifDefined(this.min)}"
            max="${ifDefined(this.max)}"
            maxlength="${ifDefined(this.maxlength)}"
            minlength="${ifDefined(this.minlength)}"
            step="${ifDefined(this.step)}"
            @keydown="${this._onKeydown}"
            @focus="${this._onFocus}"
            @click="${this._onClick}"
            @blur="${this._onBlur}"
            @input="${this._onInput}"
          />
        </div>
      `;
    }
  }

  _resizeTextarea(textarea) {
    setTimeout(() => {
      const textarea = this._id("input");
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }, 0);
  }

  updated(changed) {
    if (changed.has("model")) {
      // Need to write the value of input explicitly because value attribute only sets the default value.
      const input = this._id("input");
      if (input && input.value !== this.model) {
        input.value = this.model;
      }
    }
    if (changed.has("type") && this.type === TypeRichText) {
      if (!window.__btComponentsTrixLoad) {
        window.__btComponentsTrixLoad = true;

        // Load Trix dependencies ONCE
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/trix/1.2.3/trix-core.min.js";
        document.body.appendChild(script);

        import("./trix.css").then((module) => {
          const style = document.createElement("style");
          style.innerText = module.default;
          document.body.appendChild(style);
        });
      }

      if (!this.__initTrixEditor) {
        this.__initTrixEditor = true;

        const trixEditor = document.createElement("trix-editor");
        trixEditor.classList.add("trix-content");
        trixEditor.addEventListener("trix-change", this._onInput.bind(this));
        this.appendChild(trixEditor);
      }
    }

    if (this.expandable && this.type === TypeTextarea) {
      this._resizeTextarea();
    }
  }

  get updateComplete() {
    return super.updateComplete.then(() =>
      Promise.all([
        super.updateComplete,
        this._id("label")
          ? this._id("label").updateComplete
          : Promise.resolve(),
        this._id("description")
          ? this._id("description").updateComplete
          : Promise.resolve(),
      ])
    );
  }

  _onInput(e) {
    const value = e.target.value;

    if (this.__onInput == null) {
      const onInput = (value) => {
        this.model = this.transformer ? this.transformer(value) : value;

        // Validate silently if user is typing and no current errors.
        const validateSilently = this._errors.length === 0;

        this.validate({ silent: validateSilently });

        // Whether or not validation passed, the model has indeed changed, we need to emit.
        this._emit("model-change", { value: this.model });
      };

      if (this.debounced) {
        this.__onInput = debounce(onInput, 200);
      } else {
        this.__onInput = onInput;
      }
    }

    this.__onInput(value);
  }

  _onKeydown(e) {
    if (
      e.key &&
      e.key.length === 1 &&
      !isEmpty(this._allowedCharactersMap) &&
      !this._allowedCharactersMap[e.key]
    ) {
      e.preventDefault();
    }

    if (e.key === "Enter" && e.target.nodeName === "INPUT") {
      if (this.__onInput && this.__onInput.flush) {
        // Force flush debounced input.
        this.__onInput.flush();
      }
    }
  }

  _onBlur(e) {
    setTimeout(() => {
      // Validate after some delay
      this.validate();

      if (this.corrector) {
        const output = this.corrector(this.model);
        if (output !== this.model) {
          this.model = output;
          this._emit("model-change", { value: this.model });

          // Validate again
          this.validate();
        }
      }

      this._emit("input-blur", { value: this.model }, true);
    }, 200);
  }

  _onFocus(e) {
    // Set cursor to the end of the input
    const input = e.target;
    if (this.highlightOnFocus) {
      setTimeout(() => {
        // note(jon): cannot set selection on number type
        if (this.inputType === InputTypeText) {
          input.setSelectionRange(0, input.value.length);
        }
      });
    }
  }

  _onClick(e) {
    // Set cursor to the end of the input
    const input = e.target;
    if (this.highlightOnClick) {
      setTimeout(() => {
        // note(jon): cannot set selection on number type
        if (this.inputType === InputTypeText) {
          input.setSelectionRange(0, input.value.length);
        }
      }, 25);
    }
  }

  _onDisplayClick(e) {
    if (e.target.nodeName === "A") {
      e.stopPropagation();
    }
  }

  _submit() {
    if (this.validate()) {
      this._emit("model-change", {
        value: this.model,
      });
    }
  }

  static get styles() {
    return [
      super.styles,
      css`
        .field-label-horizontal {
          width: 200px;
          max-width: 200px;
          min-width: 200px;
        }
      `,
      css`
        input {
          height: 40px;
          text-indent: 0.25rem;
        }
        input.inline {
          height: auto;
          min-height: 17px;
        }
        input,
        textarea {
          outline: none;
          border: 1px solid lightgray;
          /*width: 100%;*/
        }
        textarea {
          vertical-align: top; /* https://stackoverflow.com/q/7144843/1161743 */
          min-height: 45px;
        }
        input.inline {
          border: 1px solid transparent;
          border-bottom: 1px solid lightgray;
        }
        input:focus,
        textarea:focus {
          border: 1px solid
            var(--bt-input-border-color, ${unsafeCSS(colors.blue)});
        }
        input.inline:focus {
          border: 1px solid transparent;
          border-bottom: 1px solid
            var(--bt-input-border-color, ${unsafeCSS(colors.blue)});
        }
        input.inline.noline {
          border-bottom: 1px solid transparent;
        }
        input.noindent {
          text-indent: 0;
        }
        .display {
          white-space: pre-wrap;
          word-wrap: break-word;
        }
      `,
    ];
  }
}
customElements.get("bt-input") || customElements.define("bt-input", BTInput);

import colors from "../colors";
