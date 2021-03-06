import { html, css } from "lit-element";
import { nothing } from "lit-html";
import { ifDefined } from "lit-html/directives/if-defined";
import { styleMap } from "lit-html/directives/style-map";
import { classMap } from "lit-html/directives/class-map";
import { guard } from "lit-html/directives/guard";
import { replacePlaceholder } from "../util/string";

import BTBase from "../bt-base";

// Only support basic form elements out of the box. For other fields, use customFieldsFunc
import "./bt-input";
import "./bt-select";
import "./bt-radio";
import "./bt-hidden";
import "./bt-button";

class BTForm extends BTBase {
  static get properties() {
    return {
      defaultFormTitle: { type: String },
      hideTitle: { type: Boolean },

      formErrorText: { type: String },
      formSchema: { type: Object },
      formHeight: { type: String },

      horizontal: { type: Boolean, reflect: true },
      displaymode: { type: Boolean, reflect: true },
      hideHeaders: { type: Boolean, reflect: true },
      formFocus: { type: Boolean, reflect: true },
      clickToEdit: { type: Boolean, reflect: true },
      validate: { type: Boolean },
      autosubmit: { type: Boolean },

      buttonPrimary: { type: Boolean },
      buttonsSmall: { type: Boolean },
      buttonsHorizontal: { type: Boolean },
      buttonsClass: { type: String },

      submitButtonText: { type: String },
      cancelButtonText: { type: String },

      validator: { type: Object },

      prefillFields: { type: Object }, // { id/aliasId: value }
      hiddenFields: { type: Object }, // { id/aliasId: Bool }
      interpolateMap: { type: Object }, // { id/aliasId: value }

      _fieldMapping: { type: Object },

      _errors: { type: Object },
      _disableSubmit: { type: Boolean },
      _modelMap: { type: Object },
      _errorMap: { type: Object }, // map of field id to error message
    };
  }

  static get styles() {
    return [
      super.styles,
      css`
        :host {
          display: block;
        }
        .form-fields > *:last-child {
          margin-bottom: 0 !important;
        }
      `,
    ];
  }

  constructor() {
    super();

    this.formSchema = {};
    this.defaultFormTitle = "";

    this._errors = {};

    this._modelMap = {};
    this.errorMap = {};

    // Not a property
    this._prevModelMap = {};

    this.prefillFields = {};
    this.hiddenFields = {};
    this.interpolateMap = {};

    this.shadowRoot.addEventListener("errors-change", (e) => {
      const errors = Object.assign({}, this._errors);

      const inputErrors = e.detail.errors;
      if (inputErrors.length === 0) {
        delete errors[e.detail.id];
      } else {
        errors[e.detail.id] = inputErrors;
      }

      this._errors = errors;
    });

    this.buttonPrimary = true;
    this.buttonsSmall = false;
    this.buttonsHorizontal = false;
    this.buttonsClass = "";

    this.validate = true;
    this.autosubmit = false;
    this.displaymode = false;

    this.formBottomTemplate = nothing;
    // Function to be called right before submit, returns promise
    this.presubmitFuncPromise = () => Promise.resolve();

    this._fieldsById = {};
  }

  // A function that preloads field components (import), and returns a map of field type to function that takes in (model,field,formEl) and returns html``,
  // e.g. { "fieldtype": (model, field, form, options, fieldIdx) => html`<my-field .model={model} .required=${field.required} @model-change(form.onModelChange)></my-field>` }
  set customFieldsFunc(func) {
    // Execute once only
    if (this._fieldMapping != null) return;

    if (typeof func === "function") {
      this._fieldMapping = func();
    }
  }

  // model is a {id: value} object
  set model(model = {}) {
    this._modelMap = Object.assign({}, model);

    // note: We want to re-enable the form after submission success.
    this.enableSubmit();
  }

  get model() {
    return Object.assign({}, this._modelMap);
  }

  set formSchema(formSchema = {}) {
    this._fieldsById = {};

    const fields = formSchema.fields || [];
    fields.forEach((f) => {
      this._fieldsById[f.id] = f;
    });

    const oldFormSchema = this._formSchema;
    this._formSchema = formSchema;
    this.requestUpdate("formSchema", oldFormSchema);
  }

  get formSchema() {
    return this._formSchema;
  }

  render() {
    if (!this.formSchema) {
      return html``;
    }

    return html`
      <div
        class="form"
        style="height:${this.formHeight || "fit-content"}"
        @bt-copied=${this._onCopy}
      >
        ${this._formHeaderTemplate}
        <div class="form-fields flex-1" id="fields">
          ${this.formSchema.fields.map((field, fieldIdx, ary) => {
            // Handle conditionals, decide whether or not this field should be shown
            let showField = true;
            const dependentFields = [];
            if (field.showRules) {
              // Found show rules, hide field by default
              showField = false;
              for (let i = 0; i < field.showRules.length; i++) {
                const showRule = field.showRules[i];
                if (showRule && showRule.matches) {
                  const fieldValue = this._modelMap[showRule.fieldId];
                  if (fieldValue != null && fieldValue != "") {
                    for (let j = 0; j < showRule.matches.length; j++) {
                      const match = showRule.matches[j];
                      if (match === fieldValue || match === "ANY") {
                        showField = true;
                        dependentFields.push(
                          this._fieldsById[showRule.fieldId]
                        );
                      }
                    }
                  }
                }
              }
            }

            const model = this._modelForField(field);
            const models = [model].concat(
              dependentFields.map((f) => this._modelForField(f))
            );
            return guard(
              [
                this.displaymode,
                this.formSchema,
                showField,
                this.errorMap,
                ...models,
              ],
              () => {
                if (!showField) return html``;
                return this._fieldTemplate(model, field, fieldIdx);
              }
            );
          })}
        </div>

        ${this._submitButtonTemplate}
      </div>
    `;
  }

  get _formHeaderTemplate() {
    if (this.hideHeaders) return html``;

    return html`
      ${(this.formSchema.title || this.defaultFormTitle) && !this.hideTitle
        ? html`
            <h2 class="text-2xl font-bold mt-2 mb-6">
              ${this.formSchema.title || this.defaultFormTitle}
            </h2>
          `
        : html`<div class="mt-2"></div>`}
      ${this.formSchema.description
        ? /* prettier-ignore */
          html`<p class="mt-0 mb-4 text-sm whitespace-pre-line">${this.formSchema.description}</p>`
        : html``}
    `;
  }

  get _submitButtonTemplate() {
    if (this.autosubmit) return html``;

    const errorCount = Object.keys(this._errors).length;
    return !this.displaymode
      ? html`
          <div
            class="
              ${this.buttonsHorizontal ? "flex align-items-center" : ""}
              ${this.buttonsClass || "py-4"}"
          >
            <bt-button
              class="block"
              ?primary=${this.buttonPrimary}
              ?secondary=${!this.buttonPrimary}
              ?small=${this.buttonsSmall}
              ?disabled="${errorCount > 0 || this._disableSubmit}"
              id="submit"
              button
              @click=${this.onSubmit}
              >${this.submitButtonText
                ? this.submitButtonText
                : "Submit"}</bt-button
            >
            ${this.cancelButtonText
              ? html`
                  <bt-button
                    class="block"
                    transparent
                    ?small=${this.buttonsSmall}
                    class="${this.buttonsHorizontal ? "ml-2" : "mt-1"}"
                    @click="${this._onCancel}"
                    >${this.cancelButtonText}</bt-button
                  >
                `
              : html``}
            ${this.formBottomTemplate}
          </div>
        `
      : html``;
  }

  get fields() {
    return Array.from(this._id("fields").children);
  }

  _fieldTemplate(model, field, fieldIdx) {
    const fieldStyles = {
      display:
        this.hiddenFields[field.id] || this.hiddenFields[field.aliasId]
          ? "none"
          : "block",
    };

    const fieldClasses = {
      block: true,
      "mb-4": true,
    };

    switch (field.type) {
      case "long_text":
      case "short_text":
      case "number":
        return html`
          <bt-input
            class=${classMap(fieldClasses)}
            id="${field.id}"
            ?required="${field.required}"
            ?horizontal=${this.horizontal}
            .displaymode=${this.displaymode}
            .clickToEdit=${this.clickToEdit}
            .description=${field.description}
            .type=${field.type === "long_text" ? "textarea" : null}
            .inputType=${field.type === "number"
              ? "number"
              : field.inputType || "text"}
            .min=${field.min}
            .max=${field.max}
            .minlength=${field.minlength}
            .maxlength=${field.maxlength}
            .placeholder=${field.placeholder}
            .label=${field.name}
            .corrector=${field.corrector}
            .transformer=${field.transformer}
            .allowedCharacters=${field.allowedCharacters}
            .validator=${field.validator}
            .validateAs=${ifDefined(field.validateAs)}
            .validateRegex=${ifDefined(field.validateRegex)}
            .errorMessage=${this.errorMap[field.id]}
            .rows=${ifDefined(field.rows)}
            .disableValidation=${!this.validate}
            .annotation=${field.computed ? "computed" : ""}
            .model=${model}
            .disabled=${field.disabled || field.computed || false}
            @model-change=${this.onModelChange}
            @input-submit=${this.onSubmit}
            @input-cancel=${this.onInputCancel}
            style=${styleMap(fieldStyles)}
          ></bt-input>
        `;
      case "radio": {
        return html`
          <bt-radio
            class=${classMap(fieldClasses)}
            id=${field.id}
            ?required=${field.required}
            ?boolean=${ifDefined(field.boolean)}
            .displaymode=${this.displaymode}
            .clickToEdit=${this.clickToEdit}
            .label=${field.name}
            .description=${field.description}
            .options=${field.options}
            .disableValidation=${!this.validate}
            .model=${model || ""}
            .disabled=${field.disabled || false}
            @model-change=${this.onModelChange}
            @input-submit=${this.onSubmit}
            @input-cancel=${this.onInputCancel}
            style=${styleMap(fieldStyles)}
          ></bt-radio>
        `;
      }
      case "dropdown": {
        return html`
          <bt-select
            class=${classMap(fieldClasses)}
            id=${field.id}
            ?required=${field.required}
            ?horizontal=${this.horizontal}
            .displaymode=${this.displaymode}
            .clickToEdit=${this.clickToEdit}
            .placeholder=${ifDefined(field.placeholder)}
            .label=${field.name}
            .description=${field.description}
            .filterable=${field.filterable}
            .multiselect=${field.multiselect}
            .options=${field.dynamicOptions
              ? field.dynamicOptions(this.model)
              : field.options}
            .errorMessage=${this.errorMap[field.id]}
            .disableValidation=${!this.validate}
            .model=${model || ""}
            .disabled=${field.disabled || false}
            @model-change=${this.onModelChange}
            @input-submit=${this.onSubmit}
            @input-cancel=${this.onInputCancel}
            style=${styleMap(fieldStyles)}
          ></bt-select>
        `;
      }
      case "hidden": {
        return html`<bt-hidden id=${field.id} .model=${model}></bt-hidden>`;
      }

      default: {
        if (this._fieldMapping && this._fieldMapping[field.type]) {
          return this._fieldMapping[field.type](
            model,
            field,
            this,
            { styles: fieldStyles, classes: fieldClasses },
            fieldIdx
          );
        }
        return html``;
      }
    }
  }

  _modelForField(field) {
    if (field.computed && field.computedExpression) {
      // Use interpolate map to get resolved computed expression from backend
      if (this.interpolateMap && this.interpolateMap[field.aliasId]) {
        return this.interpolateMap[field.aliasId];
      }

      // Fallback to frontend interpolation
      return replacePlaceholder(field.computedExpression, this.interpolateMap);
    }

    let model = this._modelMap[field.id];
    if (model == null || model === "") {
      // 0 is valid value
      model = this.prefillFields[field.id] || this.prefillFields[field.aliasId];
    }
    return model;
  }

  firstUpdated(changedProperties) {
    if (this.formSchema && this.formFocus) {
      setTimeout(() => {
        if (this.fields.length) {
          const firstInput = this.fields[0];
          if (firstInput && firstInput.focus) {
            firstInput.focus();
          }
        }
      });
    }
  }

  onModelChange(e) {
    const fieldId = e.currentTarget.id;

    if (this._prevModelMap[fieldId] == null) {
      // Record the instance right before model starts to change...
      this._prevModelMap = Object.assign({}, this._prevModelMap, {
        [fieldId]: this._modelMap[fieldId],
      });
    }

    this._modelMap = Object.assign({}, this._modelMap, {
      [fieldId]: e.detail.value,
    });

    if (this.errorMap[fieldId]) {
      // this field has error, try to revalidate
      this.validator && this._validateForm(this._modelMap);
    }

    if (this.autosubmit) {
      this.onSubmit();
    }
  }

  _validateForm(model) {
    const validationErrorMap = this.validator(model);
    if (validationErrorMap && Object.keys(validationErrorMap).length) {
      this.errorMap = validationErrorMap;
    } else {
      this.errorMap = {};
    }
    // true if no error
    return Object.keys(this.errorMap).length === 0;
  }

  onInputCancel(e) {
    const fieldId = e.currentTarget.id;

    // Revert to old model if available
    if (this._prevModelMap[fieldId] != null) {
      const prevModel = this._prevModelMap[fieldId];

      const prevModelMap = this._prevModelMap;
      delete prevModelMap[fieldId];
      this._prevModelMap = Object.assign({}, prevModelMap);

      this._modelMap = Object.assign({}, this._modelMap, {
        [fieldId]: prevModel,
      });
    }
  }

  onSubmit(e) {
    if (Object.keys(this._errors).length > 0 || this._disableSubmit) return;

    if (this.clickToEdit) {
      const fieldEl = e.currentTarget;
      if ((fieldEl.validate && fieldEl.validate()) || !fieldEl.validate) {
        const submitAndResetModelMap = () => {
          this._emit(
            "form-submit",
            {
              model: {
                [fieldEl.id]: e.detail.value,
              },
            },
            true
          );

          const prevModelMap = this._prevModelMap;
          delete prevModelMap[fieldEl.id];
          this._prevModelMap = Object.assign({}, prevModelMap);
        };

        submitAndResetModelMap();

        return;
      }
    }

    let shouldSubmit = true;
    const model = {};
    let firstFieldWithErrorId; // id of first field with error

    this.fields.forEach((f) => {
      const fieldModel = typeof f.model === "string" ? f.model.trim() : f.model;

      // Update fresh model object
      if (fieldModel != null) {
        model[f.id] = fieldModel;
      }

      // Sync our model map so that same model is written back to field
      this._modelMap[f.id] = fieldModel;

      // Call validate on field
      if (this.validate) {
        if (f.validate && !f.validate()) {
          shouldSubmit = false;

          if (firstFieldWithErrorId == null) {
            firstFieldWithErrorId = f.id;
          }
        }
      }
    });

    // If OK so far, run custom validator
    if (shouldSubmit && this.validator) {
      if (!this._validateForm(model)) {
        shouldSubmit = false;
      }

      // Try to identify first problematic field
      if (
        Object.keys(this.errorMap).length > 0 &&
        firstFieldWithErrorId == null
      ) {
        this.fields.forEach((f) => {
          if (this.errorMap[f.id] && firstFieldWithErrorId == null) {
            firstFieldWithErrorId = f.id;
          }
        });
      }
    }

    if (shouldSubmit) {
      if (!this.autosubmit) {
        // Should only be able to submit once.
        this._disableSubmit = true;
      }

      this.presubmitFuncPromise()
        .then(() => {
          // submit
          this._emit(
            "form-submit",
            {
              model,
            },
            true
          );
        })
        .catch(() => {
          this.enableSubmit();

          return Promise.reject();
        });
    }

    // Scroll to first field with error
    if (firstFieldWithErrorId) {
      setTimeout(() => {
        this._id(firstFieldWithErrorId).scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }

  _onCancel(e) {
    this._emit("form-cancel", {}, true);
  }

  // Form submit automatically disabled after submit. Use this to reenable form
  // (e.g. server validation failed)
  enableSubmit() {
    this._disableSubmit = false;
  }

  // Set field errors due to external validation
  setError(fieldId, errorMessage) {
    this.errorMap = Object.assign({}, this.errorMap, {
      [fieldId]: errorMessage,
    });
  }

  clearForm() {
    // Turn off validation, set model, then turn on validation again (hacky, yes)
    this.validate = false;
    this.model = {};

    setTimeout(() => {
      this.validate = true;
    }, 300);
  }
}
customElements.define("bt-form", BTForm);
