import { html, css } from "lit-element";
import { classMap } from "lit-html/directives/class-map";
import { ifDefined } from "lit-html/directives/if-defined";
import BTBase from "../bt-base";

import "./bt-multirow-group";
import "./bt-radio";
import "./bt-input";
import "./bt-select";
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

      _modelMap: { type: Object },
      _showAll: { type: Boolean },
    };
  }

  constructor() {
    super();

    this.layout = LayoutVertical;

    this._modelMap = {};
    this._showAll = false;
  }

  get model() {
    const fields = Array.from(this._id("fields").children).filter(
      (node) => node.nodeName !== "DIV"
    );

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

          const fieldClasses = { "pb-2": true, "pr-2": true };
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
                  .placeholder=${ifDefined(s.placeholder)}
                  .validateAs=${s.validateAs}
                  .hideIndicator=${s.hideIndicator}
                  .label=${s.name}
                  .description=${s.description}
                  .model=${this._modelMap[s.id]}
                  @model-change=${(e) => {
                    this._emit("model-change", {
                      value: this.model,
                    });
                  }}
                ></bt-input>
              `;
            }
            case "dropdown": {
              return html`
                <bt-select
                  class="block field ${classMap(fieldClasses)}"
                  id=${s.id}
                  .required=${s.required}
                  .filterable=${s.filterable}
                  .displaymode=${this.displaymode}
                  .placeholder=${ifDefined(s.placeholder)}
                  .options=${s.options}
                  .label=${!this.hidelabel && s.name}
                  .description=${!this.hidelabel && s.description}
                  .model=${this._modelMap[s.id]}
                  @model-change=${(e) => {
                    this._emit("model-change", {
                      value: this.model,
                    });
                  }}
                ></bt-select>
              `;
            }
            case "radio": {
              return html`
                <bt-radio
                  class="block field ${classMap(fieldClasses)}"
                  id=${s.id}
                  .required=${s.required}
                  .displaymode=${this.displaymode}
                  .options=${s.options}
                  .label=${!this.hidelabel && s.name}
                  .description=${!this.hidelabel && s.description}
                  ?horizontal=${s.horizontal}
                  .model=${this._modelMap[s.id]}
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
                  .label=${!this.hidelabel && s.name}
                  .description=${!this.hidelabel && s.description}
                  .buttonText=${s.buttonText}
                  .model=${this._modelMap[s.id]}
                  @model-change=${(e) => {
                    this._emit("model-change", {
                      value: this.model,
                    });
                  }}
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
                  .label=${!this.hidelabel && s.name}
                  .inline=${s.inline != null ? s.inline : true}
                  .model=${this._modelMap[s.id]}
                  @model-change=${(e) => {
                    this._emit("model-change", {
                      value: this.model,
                    });
                  }}
                ></bt-checkbox>
              `;
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
