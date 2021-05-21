import { html, css } from "lit-element";
import BTBase from "../bt-base";

import "@material/mwc-circular-progress";
import "@material/mwc-linear-progress";

class BTProgress extends BTBase {
  static get properties() {
    return {
      circle: { type: Boolean, attribute: true },
      linear: { type: Boolean, attribute: true },
    };
  }

  constructor() {
    super();
  }

  static get styles() {
    return [
      super.styles,
      css`
        :host {
          --mdc-circular-progress-track-color: var(--bt-progress-color);
          --mdc-theme-primary: var(--bt-progress-color);
          --mdc-linear-progress-buffer-color: var(--bt-progress-buffer-color);
        }
      `,
    ];
  }

  render() {
    if (this.circle) {
      return html`<mwc-circular-progress
        indeterminate
      ></mwc-circular-progress>`;
    }
    if (this.linear) {
      return html`<mwc-linear-progress indeterminate></mwc-linear-progress>`;
    }
    return html``;
  }
}

customElements.define("bt-progress", BTProgress);
