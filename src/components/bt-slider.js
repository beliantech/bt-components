import { html, css } from "lit-element";
import BTBase from "../bt-base";

import "./bt-field";
import "@material/mwc-slider";

class BTSlider extends BTBase {
  static get properties() {
    return {
      label: { type: String },
      description: { type: String },

      step: { type: Number },
      max: { type: Number },
      value: { type: Number },

      showNumbers: { type: Boolean },
    };
  }

  constructor() {
    super();

    this.step = 1;
    this.min = 0;
    this.max = 10;
    this.value = 0;
    this.showNumbers = false;

    // No empty value for slider
    this.required = true;
  }

  static get styles() {
    return [
      super.styles,
      css`
        :host {
          --mdc-slider-bg-color-behind-component: transparent;
        }
      `,
    ];
  }

  render() {
    return html`
      <bt-field .field=${this}>
        <div class="-mt-2">
          ${this.showNumbers
            ? html`
                <div class="flex justify-between" style="margin-bottom: -1rem;">
                  <div class="p-1 text-sm inline-block text-gray-500">
                    ${this.min}
                  </div>
                  <div class="p-1 inline-block font-bold">${this.value}</div>
                  <div class="p-1 text-sm inline-block text-gray-500">
                    ${this.max}
                  </div>
                </div>
              `
            : html``}

          <mwc-slider
            class="w-full px-1"
            @change=${(e) => (this.value = e.currentTarget.value)}
            .step=${this.step}
            .max=${this.max}
            .value=${this.value}
          ></mwc-slider>
        </div>
      </bt-field>
    `;
  }
}
customElements.define("bt-slider", BTSlider);
