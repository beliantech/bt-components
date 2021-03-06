import { html } from "lit-element";
import BTBase from "../bt-base";
import { ifDefined } from "lit-html/directives/if-defined";
import "@material/mwc-icon";

import { clickOutsideToDismiss } from "../util/mouse";
import colors from "../colors";

export default class BTIcon extends BTBase {
  static get properties() {
    return {
      icon: { type: String },

      button: { type: Boolean, reflect: true },
      circle: { type: Boolean, reflect: true },
      muted: { type: Boolean, reflect: true },
      popup: { type: Boolean, reflect: true },
      stopPropagation: { type: Boolean, attribute: "stop-propagation" },

      linkTo: { type: String, reflect: true },
      linkTarget: { type: String },
      tooltip: { type: String, reflect: true },

      _openMenu: { type: Boolean },
    };
  }

  constructor() {
    super();

    this._openMenu = false;
  }

  render() {
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
          class="absolute tooltip font-bold text-xs py-2 px-3 mt-1 leading-normal text-white text-center z-20 whitespace-nowrap"
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
          if (this.stopPropagation) {
            e.stopPropagation();
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
        this._removeClickOutsideHandler =
          this._removeClickOutsideHandler ||
          clickOutsideToDismiss(this, () => {
            this._openMenu = false;
          });
      } else {
        this._removeClickOutsideHandler && this._removeClickOutsideHandler();
        this._removeClickOutsideHandler = null;
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
        --mdc-icon-size: 20px;
        --bt-icon-color: inherit;

        margin: 0.25rem;
        user-select: none;
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        ${muted ? "opacity: 0.5" : ""};

        color: var(--bt-icon-color);
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
      :host([popup-right]) .popup {
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
      }
      :host([circle]) {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: 50%;
      }
      :host([circle]:hover) {
        background-color: var(--bt-icon-circle-hover-color, #eeeeee);
      }
      :host([circle]:active) {
        background-color: var(--bt-icon-circle-hover-color, lightgray);
      }

      :host([button]) {
        cursor: pointer;
      }
      :host([button]) mwc-icon:hover {
        color: var(--bt-icon-button-hover-color, ${colors.gray});
      }
      :host([button][button-light]) mwc-icon:hover {
        color: var(--bt-icon-button-hover-color, lightgray);
      }
      :host([button]) mwc-icon:active {
        color: var(--bt-icon-button-active-color, ${colors.lightgray});
      }
      :host([button][button-light]) mwc-icon:active {
        color: var(--bt-icon-button-active-color, ${colors.lightgray});
      }

      ${linkTo ? html` a, a:visited { color: inherit; } ` : html``}

      .icon-container .tooltip {
        display: none;
      }
      :host(:hover) .icon-container .tooltip {
        display: block;
      }
      .tooltip {
        top: 100%;
        background-color: ${colors.darkgray}
      }

      :host([tooltip]) .tooltip {
        transform: translateX(-50%);
        left: 50%;
      }
      :host([tooltip-right]) .tooltip {
        transform: none;
        right: 0;
        left: unset;
      }
      :host([tooltip-left]) .tooltip {
        transform: none;
        left: 0;
      }
    </style>
  `;
};
