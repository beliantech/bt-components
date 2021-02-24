import { html, css } from "lit-element";
import { classMap } from "lit-html/directives/class-map";
import BTBase from "../bt-base";

import "./bt-multirow-group";
import "./bt-radio";
import "./bt-input";
import "./bt-hidden";

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
    };
  }

  constructor() {
    super();

    this.layout = LayoutHorizontal;
    this._modelMap = {};
  }

  get model() {
    const fields = Array.from(this._id("fields").children);
    return fields.map((val) => ({
      id: val.id,
      value: val.model,
    }));
  }
  set model(model = []) {
    this._modelMap = {};
    model.forEach((m) => {
      this._modelMap[m.id] = m.value;
    });
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

    return html`
      <div class=${classMap(rowClasses)} id="fields">
        ${this.schema.map((s, idx) => {
          const fieldClasses = { "pb-2": true };
          if (idx !== 0) {
            fieldClasses["pl-2"] = this.layout === LayoutHorizontal;
            fieldClasses["flex-1"] = this.layout === LayoutHorizontal;
            fieldClasses["pr-2"] = this.layout === LayoutHorizontalWrap;
          }
          if (idx === 0) {
            fieldClasses["pr-2"] = this.layout === LayoutHorizontalWrap;
          }

          switch (s.type) {
            case "short_text": {
              return html`
                <bt-input
                  class="block field ${classMap(fieldClasses)}"
                  id="${s.id}"
                  .required=${s.required}
                  .displaymode=${this.displaymode}
                  .placeholder=${s.placeholder}
                  .validateAs=${s.validateAs}
                  .model=${this._modelMap[s.id]}
                  .label=${s.label}
                  .description=${s.description}
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
                  id="${s.id}"
                  .required=${s.required}
                  .displaymode=${this.displaymode}
                  .placeholder=${s.placeholder}
                  .model=${this._modelMap[s.id]}
                  .options=${s.options}
                  .label=${s.label}
                  .description=${s.description}
                  ?horizontal=${s.horizontal}
                  @model-change=${(e) => {
                    this._emit("model-change", {
                      value: this.model,
                    });
                  }}
                ></bt-radio>
              `;
            }
            case "multirow-group": {
              return html`
                <bt-multirow-group nested .field=${s.field} .label=${s.label}>
                </bt-multirow-group>
              `;
            }
            case "hidden": {
              return html`
                <bt-hidden
                  id="${s.id}"
                  .model=${this._modelMap[s.id] ||
                  (s.default ? s.default() : "")}
                ></bt-hidden>
              `;
            }
            default: {
              return html``;
            }
          }
        })}
      </div>
    `;
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
