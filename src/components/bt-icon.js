import { html } from "lit-element";
import BTBase from "../bt-base";
import { styleMap } from "lit-html/directives/style-map";
import { ifDefined } from "lit-html/directives/if-defined";
import "@material/mwc-icon";

import { clickOutsideToDismiss } from "../util/mouse";

export default class BTIcon extends BTBase {
  static get properties() {
    return {
      icon: { type: String },

      button: { type: Boolean, reflect: true },
      circle: { type: Boolean, reflect: true },
      muted: { type: Boolean, reflect: true },
      popup: { type: Boolean, reflect: true },

      linkTo: { type: String },
      linkTarget: { type: String },
      tooltip: { type: String },
      tooltipPosition: { type: String },

      _openMenu: { type: Boolean },
    };
  }

  constructor() {
    super();

    this._openMenu = false;
  }

  render() {
    const tooltipStyle = {};
    if (this.tooltipPosition === "right") {
      tooltipStyle["right"] = 0;
    } else if (this.tooltipPosition === "left") {
      tooltipStyle["left"] = 0;
    } else {
      tooltipStyle["transform"] = "translateX(-50%)";
      tooltipStyle["left"] = "50%";
    }

    let contentTemplate = html` <mwc-icon><slot></slot></mwc-icon> `;
    if (this.linkTo) {
      contentTemplate = html`
        <a
          href="${this.linkTo}"
          target="${ifDefined(this.linkTarget)}"
          style="line-height:0"
          >${contentTemplate}</a
        >
      `;
    }
    if (this.tooltip) {
      contentTemplate = html`
        ${contentTemplate}
        <div
          class="absolute tooltip font-bold text-xs py-2 px-3 mt-1 bg-gray-800 leading-normal text-white text-center z-20 whitespace-no-wrap"
          style=${styleMap(tooltipStyle)}
        >
          ${this.tooltip}
        </div>
      `;
    }

    return html`
      ${style(this.linkTo, this.muted)}
      <div
        class="icon-container relative flex items-center justify-center"
        @click=${(e) => {
          // Prevent click from going to parent element.
          if (this.button && !this.linkTo) {
            e.preventDefault();
          }

          if (this.popup) {
            this._openMenu = !this._openMenu;
          }
        }}
      >
        ${contentTemplate}
        ${this.popup && this._openMenu
          ? html`<div class="absolute popup" style="top:100%;">
              <slot name="popup"></slot>
            </div>`
          : html``}
      </div>
    `;
  }

  updated(changed) {
    if (changed.has("_openMenu")) {
      if (this._openMenu) {
        this.__removeClickOutsideHandler =
          this.__removeClickOutsideHandler ||
          clickOutsideToDismiss(this, () => {
            this._openMenu = false;
          });
      } else {
        this.__removeClickOutsideHandler && this._removeClickOutsideHandler();
        this.__removeClickOutsideHandler = null;
      }
    }
  }

  close() {
    this._openMenu = false;
  }
}
customElements.get("bt-icon") || customElements.define("bt-icon", BTIcon);

const style = (linkTo = false, muted = false) => {
  return html`
    <style>
      :host {
        margin: 0.25rem;
        user-select: none;
        position: relative;
        color: inherit;
        display: inline-flex;
        ${muted ? "opacity: 0.5" : ""};

        --mdc-icon-size: 20px;
      }

      :host([xsmall]) {
        --mdc-icon-size: 14px;
      }
      :host([small]) {
        --mdc-icon-size: 18px;
      }
      :host([medium]) {
        --mdc-icon-size: 24px;
      }
      :host([large]) {
        --mdc-icon-size: 36px;
      }

      :host .popup,
      :host[popup-right] .popup {
        top: 100%;
        right: 0;
      }
      :host([popup-left]) .popup {
        top: 100%;
        left: 0;
      }

      :host .icon-container,
      :host .icon-container mwc-icon {
        width: 20px;
        height: 20px;
      }
      :host([xsmall]) .icon-container,
      :host([xsmall]) .icon-container mwc-icon {
        width: 14px;
        height: 14px;
      }
      :host([small]) .icon-container,
      :host([small]) .icon-container mwc-icon {
        width: 18px;
        height: 18px;
      }
      :host([medium]) .icon-container,
      :host([medium]) .icon-container mwc-icon {
        width: 24px;
        height: 24px;
      }
      :host([large]) .icon-container,
      :host([large]) .icon-container mwc-icon {
        width: 36px;
        height: 36px;
      }

      :host([circle]) {
        height: 36px;
        width: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      :host([circle]:hover) {
        background-color: var(--bt-icon-circle-bg-color, #eeeeee);
        border-radius: 50%;
      }

      :host([button]) {
        cursor: pointer;
      }
      :host([button]:hover) {
        color: var(--bt-icon-button-hover-color, #616161);
      }
      :host([button]:active) {
        color: var(--bt-icon-button-active-color, #9e9e9e);
      }

      ${linkTo ? html` a, a:visited { color: inherit; } ` : html``}

      .icon-container .tooltip {
        display: block;
        visibility: hidden;
      }
      :host(:hover) .icon-container .tooltip {
        visibility: visible;
        transition: 0.3s;
        transition-delay: 0.5s;
      }
      .tooltip {
        top: 100%;
        min-width: 90px;
      }
    </style>
  `;
};
