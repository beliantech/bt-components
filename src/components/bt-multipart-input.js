import { html, css } from "lit-element";
import { classMap } from "lit-html/directives/class-map";
import BTBase from "../bt-base";

import "./bt-multirow-group";
import "./bt-radio";
import "./bt-input";
import "./bt-hidden";
import "./bt-checkbox";

const LayoutHorizontal = "horizontal";
const LayoutHorizontalWrap = "horizontal-wrap";
const LayoutVertical = "vertical";

class BTMultipartInput extends BTBase {
  static get properties() {
    return {
      schema: { type: Array },
      displaymode: { type: Boolean },

      layout: { type: String }, // horizontal|vertical|horizontal-wrap
      hidelabel: { type: Boolean },

      _modelMap: { type: Object },
      _showAll: { type: Boolean },
    };
  }

  constructor() {
    super();

    this.layout = LayoutVertical;
    this.hidelabel = false;

    this._modelMap = {};
    this._showAll = false;
  }

  get model() {
    const fields = Array.from(this._id("fields").children);

    const model = {};
    fields.forEach((val) => {
      model[val.id] = val.model;
    });
    return model;
  }
  set model(model = {}) {
    this._modelMap = Object.assign({}, model);
  }

  render() {
    if (!this.schema) return html``;

    const rowClasses = {
      flex: true,
      "flex-wrap": this.layout === LayoutHorizontalWrap,
      "flex-col": this.layout === LayoutVertical,
      "item-center": true,
      "justify-start": true,
    };

    let didHaveHiddenField = false;

    return html`
      <div class=${classMap(rowClasses)} id="fields">
        ${this.schema.map((s, idx) => {
          if (s.hide) {
            didHaveHiddenField = true;
          }

          const fieldClasses = { "pb-2": true };
          if (idx !== 0) {
            fieldClasses["pl-2"] = this.layout === LayoutHorizontal;
            fieldClasses["pr-2"] = this.layout === LayoutHorizontalWrap;
          }
          if (idx === 0) {
            fieldClasses["pr-2"] = this.layout === LayoutHorizontalWrap;
          }
          if (s.hide && !this._showAll) {
            fieldClasses["hidden"] = true;
          }
          if (s.grid && this.layout == LayoutHorizontal) {
            fieldClasses[`w-${s.grid}/12`] = true;
          }

          switch (s.type) {
            case "short_text": {
              return html`
                <bt-input
                  class="block field ${classMap(fieldClasses)}"
                  id=${s.id}
                  .required=${s.required}
                  .displaymode=${this.displaymode}
                  .placeholder=${s.placeholder}
                  .validateAs=${s.validateAs}
                  .model=${this._modelMap[s.id]}
                  .label=${!this.hidelabel && s.label}
                  .description=${!this.hidelabel && s.description}
                  @model-change=${(e) => {
                    this._emit("model-change", {
                      value: this.model,
                    });
                  }}
                ></bt-input>
              `;
            }
            case "radio": {
              return html`
                <bt-radio
                  class="block field ${classMap(fieldClasses)}"
                  id=${s.id}
                  .required=${s.required}
                  .displaymode=${this.displaymode}
                  .placeholder=${s.placeholder}
                  .model=${this._modelMap[s.id]}
                  .options=${s.options}
                  .label=${!this.hidelabel && s.label}
                  .description=${!this.hidelabel && s.description}
                  ?horizontal=${s.horizontal}
                  @model-change=${(e) => {
                    this._emit("model-change", {
                      value: this.model,
                    });
                  }}
                ></bt-radio>
              `;
            }
            case "multirow_group": {
              return html`
                <bt-multirow-group
                  id=${s.id}
                  class=${classMap(fieldClasses)}
                  .field=${s.field}
                  .label=${this.hidelabel && s.label}
                  .description=${this.hidelabel && s.description}
                  .model=${this._modelMap[s.id]}
                  .buttonText=${s.buttonText}
                >
                </bt-multirow-group>
              `;
            }
            case "hidden": {
              return html`
                <bt-hidden
                  id=${s.id}
                  .model=${this._modelMap[s.id] ||
                  (s.default ? s.default() : "")}
                ></bt-hidden>
              `;
            }
            case "checkbox": {
              return html`
                <bt-checkbox
                  id=${s.id}
                  class=${classMap(fieldClasses)}
                  .model=${this._modelMap[s.id]}
                  .label=${s.label}
                  .inline=${s.inline != null ? s.inline : true}
                ></bt-checkbox>
              `;
            }
            case "label": {
              return html`<div
                class=${classMap(fieldClasses)}
                style=${this.layout !== LayoutVertical
                  ? "margin-top:16px;"
                  : ""}
              >
                <span class="inline-block pt-1 pr-2 text-sm font-bold"
                  >${s.label}</span
                >
              </div>`;
            }

            default: {
              return html``;
            }
          }
        })}
      </div>
      ${this._showMoreTemplate(didHaveHiddenField)}
    `;
  }

  _showMoreTemplate(didHideField) {
    if (didHideField) {
      if (this._showAll) {
        return html`
          <a
            id="show"
            class="text-xs hover:underline"
            href="#"
            @click=${this._onShowLessClick}
            >Show less</a
          >
        `;
      } else {
        return html`
          <a
            id="show"
            class="text-xs hover:underline"
            href="#"
            @click=${this._onShowMoreClick}
            >Show more</a
          >
        `;
      }
    }

    return html``;
  }

  _onShowMoreClick(e) {
    this._showAll = true;
    e.preventDefault();
  }
  _onShowLessClick(e) {
    this._showAll = false;
    e.preventDefault();
  }

  validate() {
    let hasError = false;

    // note(jon): Cannot use .every because it stops on first false
    this._selectAll(".field").forEach((field) => {
      const ok = field.validate();
      if (!ok) {
        hasError = true;
      }
    });

    return !hasError;
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
customElements.define("bt-multipart-input", BTMultipartInput);
