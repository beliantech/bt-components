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
      // CSS attributes: primary, secondary, square, large,
      // transparent, danger, muted, border, rounded

      disabled: { type: Boolean, reflect: true },

      linkTo: { type: String },

      unpadded: { type: Boolean, reflect: true },
      icononly: { type: Boolean, reflect: true },

      small: { type: Boolean, reflect: true },
      center: { type: Boolean, reflect: true },
      left: { type: Boolean, reflect: true },
      bold: { type: Boolean, reflect: true },

      popup: { type: Boolean, reflect: true }, // Whether or not button has a popup
      popupright: { type: Boolean },
      popuptop: { type: Boolean },

      focus: { type: Boolean },

      icon: { type: String, reflect: true },
      aftericon: { type: String, reflect: true },

      height: { type: Number },

      spin: { type: Boolean },

      _showPopup: { type: Boolean },
    };
  }

  constructor() {
    super();

    this.disabled = false;
    this.popup = false;
    this.spin = false;

    this._showPopup = false;
  }

  render() {
    let otherClasses = [];

    if (this.spin) otherClasses.push("spin");
    otherClasses.push("items-center");
    if (this.left) {
      otherClasses.push("justify-start");
    } else {
      otherClasses.push("justify-center");
    }

    let py = "py-2";
    let px = "px-4";
    let pl, pr;

    if (this.icon) (px = "px-3"), (pl = "pl-2");
    if (this.aftericon) (px = "px-3"), (pr = "pr-2");

    if (this.square) py = px = "p-3";

    if (this.small) {
      py = "py-1";
      px = "px-2";
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
        ${this.spin
          ? html`<div class="lds-ring ${this.primary && "primary"}">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>`
          : html``}
        ${this.icon && !this.spin
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
        class="relative"
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
    if (this.disabled || this.spin) {
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
          align-items: center;
          /* Minimal line height to keep line centered without cutting text. */
          line-height: 1.2;
          margin: 0;
          height: 36px;
        }
        :host([muted]) button {
          opacity: 0.5;
        }
        :host([border]) button {
          border: 1px solid lightgray;
        }
        :host([rounded]) button {
          border-radius: 0.75rem;
        }
        :host([uppercase]) button {
          text-transform: uppercase;
          font-weight: 600;
        }
        :host([small]) button {
          height: 28px;
        }
        :host([square]) button {
          height: 48px;
          width: 48px;
        }
        :host([large][square]) button {
          height: 60px;
          width: 60px;
        }
        button:hover {
          background-color: var(
            --bt-button-hover-color,
            ${unsafeCSS(colors.hover)}
          );
        }
        :host([active]) button {
          border: 1px solid
            var(--bt-button-active-color, ${unsafeCSS(colors.blue)});
        }
        button:active,
        :host([active]) button {
          background-color: #dddddd;
        }
        :host([primary]) button {
          background-color: var(
            --bt-button-primary-color,
            ${unsafeCSS(colors.lightblue)}
          );
          color: white;
        }
        :host([primary]) button:hover {
          background-color: var(
            --bt-button-primary-hover-color,
            ${unsafeCSS(colors.blue)}
          );
        }
        :host([primary]) button:active {
          background-color: var(
            --bt-button-primary-active-color,
            ${unsafeCSS(colors.darkblue)}
          );
        }
        :host([secondary]) button {
          border: 1px solid
            var(--bt-button-secondary-color, ${unsafeCSS(colors.lightblue)});
          color: var(
            --bt-button-secondary-color,
            ${unsafeCSS(colors.lightblue)}
          );
          border-color: var(
            --bt-button-secondary-color,
            ${unsafeCSS(colors.lightblue)}
          );
        }
        :host([secondary]) button:hover {
          border: 1px solid
            var(--bt-button-secondary-hover-color, ${unsafeCSS(colors.blue)});
          color: var(
            --bt-button-secondary-hover-color,
            ${unsafeCSS(colors.blue)}
          );
        }
        :host([transparent]) button {
          background-color: transparent;
        }
        :host([transparent]) button:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }
        :host([transparent]) button.primary:hover {
          background-color: rgba(255, 255, 255, 0.25);
        }
        :host([transparent]) button.primary:active {
          background-color: rgba(255, 255, 255, 0.5);
        }
        button[disabled],
        button.spin {
          background-color: lightgray !important;
          border: 0 !important;
          cursor: not-allowed !important;
          color: inherit !important;
        }
        :host([danger]) button {
          background-color: ${unsafeCSS(colors.red)}cc;
          color: white;
          font-weight: 500;
        }
        :host([danger][secondary]) button {
          color: ${unsafeCSS(colors.red)};
          background-color: white;
          font-weight: normal;
          border-color: ${unsafeCSS(colors.red)};
        }
        :host([danger][secondary]) button:hover {
          color: white;
        }
        :host([danger]) button:hover {
          background-color: ${unsafeCSS(colors.red)};
        }
        :host([danger]) button:active {
          background-color: ${unsafeCSS(colors.darkred)};
        }
        :host([danger][border]) {
          border-color: ${unsafeCSS(colors.red)}cc;
        }

        .popup {
          /* necessary to lift it up */
          z-index: 1;
        }

        .lds-ring {
          display: flex;
          position: relative;
          width: 24px;
          height: 24px;
          margin-right: 0.5rem;
          align-items: center;
          justify-items: center;
        }
        .lds-ring div {
          box-sizing: border-box;
          display: block;
          position: absolute;
          width: 20px;
          height: 20px;
          margin: 2px;
          border: 2px solid black;
          border-radius: 50%;
          animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
          border-color: black transparent transparent transparent;
        }
        :host([primary]) .lds-ring div {
          border: 4px solid white;
          border-color: white transparent transparent transparent;
        }
        .lds-ring div:nth-child(1) {
          animation-delay: -0.45s;
        }
        .lds-ring div:nth-child(2) {
          animation-delay: -0.3s;
        }
        .lds-ring div:nth-child(3) {
          animation-delay: -0.15s;
        }
        @keyframes lds-ring {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `,
    ];
  }
}
customElements.get("bt-button") || customElements.define("bt-button", BTButton);
