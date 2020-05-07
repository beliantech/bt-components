import { LitElement, css, unsafeCSS } from "lit-element";
import utilCSS from "./bt-utils.css";

export default class BTBase extends LitElement {
  _id(id) {
    return this.shadowRoot.getElementById(id);
  }

  _select(selector) {
    return this.shadowRoot.querySelector(selector);
  }

  _selectAll(selector) {
    return Array.from(this.shadowRoot.querySelectorAll(selector));
  }

  _emit(eventName, detail = {}, composed = false) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail,
        bubbles: true,
        cancelable: true,
        composed
      })
    );
  }

  static get styles() {
    console.debug("Tailwind injection", utilCSS);
    return [
      css`
        ${unsafeCSS(utilCSS)}
      `,
      css`
        ${unsafeCSS(
          `
            .text-2xs {
              font-size: 0.675rem;
            }
            .flex-center {
              display: flex;
              justify-content: center;
              align-items: center;
            }
          `
        )}
      `
    ];
  }
}
