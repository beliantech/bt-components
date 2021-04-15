import { html, css, unsafeCSS } from "lit-element";
import { classMap } from "lit-html/directives/class-map";
import { styleMap } from "lit-html/directives/style-map";
import BTBase from "../bt-base";

import "./bt-icon";
import colors from "../colors";

import { clickOutsideToDismiss } from "../util/mouse";

export default class BTButton extends BTBase {
  static get properties() {
    return {
      disabled: { type: Boolean, reflect: true },

      primary: { type: Boolean, reflect: true },
      secondary: { type: Boolean, reflect: true },

      // button has no color, hover adds some white
      transparent: { type: Boolean, reflect: true },

      linkTo: { type: String },

      active: { type: Boolean, reflect: true },

      unpadded: { type: Boolean, reflect: true },
      square: { type: Boolean, reflect: true },
      icononly: { type: Boolean, reflect: true },

      small: { type: Boolean, reflect: true },

      rounded: { type: Boolean, reflect: true },
      center: { type: Boolean, reflect: true },
      border: { type: Boolean, reflect: true },
      danger: { type: Boolean, reflect: true },
      left: { type: Boolean, reflect: true },
      muted: { type: Boolean, reflect: true },
      bold: { type: Boolean, reflect: true },
      uppercase: { type: Boolean },

      popup: { type: Boolean, reflect: true }, // Whether or not button has a popup
      popupright: { type: Boolean },
      popuptop: { type: Boolean },

      focus: { type: Boolean },

      icon: { type: String, reflect: true },
      aftericon: { type: String, reflect: true },

      height: { type: Number },

      _showPopup: { type: Boolean },
    };
  }

  constructor() {
    super();

    this.disabled = false;
    this.primary = false;
    this.square = false;
    this.popup = false;

    this._showPopup = false;
  }

  render() {
    let otherClasses = [];

    if (this.primary) otherClasses.push("primary");
    if (this.secondary) otherClasses.push("secondary");
    if (this.transparent) otherClasses.push("transparent");
    if (this.rounded) otherClasses.push("rounded");
    otherClasses.push("items-center");
    if (this.left) {
      otherClasses.push("justify-start");
    } else {
      otherClasses.push("justify-center");
    }
    if (this.uppercase) otherClasses.push("uppercase");
    if (this.border) otherClasses.push("border");
    if (this.danger) otherClasses.push("danger");

    let py = "py-2";
    let px = "px-4";
    let pl, pr;

    if (this.icon) (px = "px-3"), (pl = "pl-2");
    if (this.aftericon) (px = "px-3"), (pr = "pr-2");

    if (this.square) py = px = "p-3";

    if (this.small) {
      py = "py-1";
      px = "px-2";
      if (this.icon) pl = "pl-1";
      if (this.aftericon) pr = "pr-1";
    }
    if (this.icononly) {
      px = "px-1";
      pl = "pl-1";
      pr = "pr-1";
    }

    if (this.unpadded) (px = "px-0"), (py = "py-0");

    const buttonClasses = {
      [px]: true,
      [py]: true,
      [pl]: pl,
      [pr]: pr,
      active: this.active || this._showPopup,
      muted: this.muted,
      small: this.small,
      "font-bold": this.bold,
      "text-lg": this.large,
      "text-sm": !this.large,
    };
    otherClasses.forEach((c) => {
      buttonClasses[c] = true;
    });

    const buttonStyles = {};
    if (this.height) buttonStyles["height"] = `${this.height}px`;
    if (this.disabled) buttonStyles["pointer-events"] = "none";

    const buttonTemplate = html`
      <button
        id="button"
        type="button"
        name="button"
        class="${classMap(buttonClasses)} w-full"
        style="${styleMap(buttonStyles)}"
        ?disabled=${this.disabled}
      >
        ${this.icon
          ? html`
              <bt-icon small class=${this.icononly ? "m-0" : "ml-0 mr-1 my-0"}
                >${this.icon}</bt-icon
              >
            `
          : html``}
        ${this.center || this.left
          ? html`<slot></slot>`
          : html`<div class="flex-1 flex-center"><slot></slot></div>`}
        ${this.aftericon
          ? html`
              <bt-icon small class="ml-1 mr-0 my-0">${this.aftericon}</bt-icon>
            `
          : html``}
      </button>
    `;

    const popupStyles = {
      "min-width": "100%",
    };
    if (this.popupright) {
      popupStyles["right"] = 0;
    } else if (this.popuptop) {
      popupStyles["bottom"] = "100%";
    }

    return html`
      <div
        class="relative block"
        @dismiss=${() => (this._showPopup = false)}
        @click=${this._onClick}
      >
        ${this.linkTo
          ? html` <a href=${this.linkTo}>${buttonTemplate}</a> `
          : buttonTemplate}
        ${(this.popup || this.popupright || this.popuptop) && this._showPopup
          ? html`
              <div class="absolute popup" style=${styleMap(popupStyles)}>
                <slot name="popup"></slot>
              </div>
            `
          : html``}
      </div>
    `;
  }

  _onClick(e) {
    if (this.disabled) {
      e.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();
      return;
    }

    if (this.popup || this.popuptop || this.popupright) {
      this._showPopup = !this._showPopup;
    }
  }

  // Close the popup from outside.
  close() {
    this._showPopup = false;
  }

  updated(changed) {
    if (changed.has("_showPopup")) {
      if (this._showPopup) {
        // note(jon): null to dismiss on any click anywhere in window.
        this._dismissPopupListener =
          this._dismissPopupListener ||
          clickOutsideToDismiss(null, () => {
            this._showPopup = false;
          });
      } else {
        this._dismissPopupListener && this._dismissPopupListener();
        this._dismissPopupListener = null;
      }
    }
  }

  firstUpdated() {
    if (this.focus) {
      this.shadowRoot.getElementById("button").focus();
    }
  }

  static get styles() {
    return [
      super.styles,
      css`
        a {
          text-decoration: none !important;
        }
        button {
          outline: none !important;
          background-color: white;
          border: 1px solid transparent;
          cursor: pointer;
          display: flex;
          /* Minimal line height to keep line centered without cutting text. */
          line-height: 1.2;
          margin: 0;
          min-height: 34px;
        }
        button.muted {
          opacity: 0.5;
        }
        button.border {
          border: 1px solid lightgray;
        }
        button.rounded {
          border-radius: 0.75rem;
        }
        button.uppercase {
          text-transform: uppercase;
          font-weight: 600;
        }
        button.small {
          min-height: 28px;
        }
        button.active {
          border: 1px solid
            var(--bt-button-active-color, ${unsafeCSS(colors.blue)});
        }
        button:hover {
          background-color: var(
            --bt-button-hover-color,
            ${unsafeCSS(colors.hover)}
          );
        }
        button:active,
        button.active {
          background-color: #dddddd;
        }
        button.primary {
          background-color: var(
            --bt-button-primary-color,
            ${unsafeCSS(colors.lightblue)}
          );
          color: white;
        }
        button.primary:hover {
          background-color: var(
            --bt-button-primary-hover-color,
            ${unsafeCSS(colors.blue)}
          );
        }
        button.primary:active {
          background-color: var(
            --bt-button-primary-active-color,
            ${unsafeCSS(colors.darkblue)}
          );
        }
        button.secondary {
          border: 1px solid
            var(--bt-button-secondary-color, ${unsafeCSS(colors.lightblue)});
          color: var(
            --bt-button-secondary-color,
            ${unsafeCSS(colors.lightblue)}
          );
        }
        button.secondary:hover {
          border: 1px solid
            var(--bt-button-secondary-hover-color, ${unsafeCSS(colors.blue)});
          color: var(
            --bt-button-secondary-hover-color,
            ${unsafeCSS(colors.blue)}
          );
        }
        button.transparent {
          background-color: transparent;
        }
        button.transparent:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }
        button.transparent.primary:hover {
          background-color: rgba(255, 255, 255, 0.25);
        }
        button.transparent.primary:active {
          background-color: rgba(255, 255, 255, 0.5);
        }
        button[disabled] {
          background-color: lightgray !important;
          border: 0 !important;
          color: white !important;
          cursor: not-allowed !important;
        }

        button.danger {
          background-color: ${unsafeCSS(colors.red)}cc;
          color: white;
          font-weight: 500;
        }
        button.danger.secondary {
          color: ${unsafeCSS(colors.red)};
          background-color: white;
          font-weight: normal;
          border-color: ${unsafeCSS(colors.red)};
        }
        button.danger.secondary:hover {
          color: white;
        }
        button.danger:hover {
          background-color: ${unsafeCSS(colors.red)};
        }
        button.danger:active {
          background-color: ${unsafeCSS(colors.darkred)};
        }
        button.danger.border {
          border-color: ${unsafeCSS(colors.red)}cc;
        }

        .popup {
          /* necessary to lift it up */
          z-index: 1;
        }
      `,
    ];
  }
}
customElements.get("bt-button") || customElements.define("bt-button", BTButton);
