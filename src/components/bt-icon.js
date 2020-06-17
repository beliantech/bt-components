import { html } from "lit-element";
import BTBase from "bt-base";
import { styleMap } from "lit-html/directives/style-map";
import { ifDefined } from "lit-html/directives/if-defined";
import "@material/mwc-icon";

export default class BTIcon extends BTBase {
  static get properties() {
    return {
      icon: { type: String },

      small: { type: Boolean, reflect: true },
      medium: { type: Boolean, reflect: true },
      large: { type: Boolean, reflect: true },
      button: { type: Boolean, reflect: true },

      muted: { type: Boolean, reflect: true },

      linkTo: { type: String },
      linkTarget: { type: String },
      tooltip: { type: String },
      tooltipWidth: { type: Number },
      tooltipPosition: { type: String },
    };
  }

  constructor() {
    super();
  }

  render() {
    const tooltipStyle = {};
    if (this.width) {
      tooltipStyle["width"] = `${this.width}px`;
    }
    if (this.tooltipPosition === "right") {
      tooltipStyle["right"] = 0;
    }
    if (this.tooltipPosition === "left") {
      tooltipStyle["left"] = 0;
    }

    let contentTemplate = html` <mwc-icon><slot></slot></mwc-icon> `;
    if (this.linkTo) {
      contentTemplate = html`
        <a href="${this.linkTo}" target="${ifDefined(this.linkTarget)}"
          >${contentTemplate}</a
        >
      `;
    }
    if (this.tooltip) {
      contentTemplate = html`
        ${contentTemplate}
        <div
          class="absolute tooltip font-bold text-xs py-2 px-3 mt-1 bg-gray-800 leading-normal text-white text-center z-20"
          style=${styleMap(tooltipStyle)}
        >
          ${this.tooltip}
        </div>
      `;
    }

    return html`
      ${style(this.linkTo, this.muted)}
      <div
        class="icon-container relative inline-flex"
        @click=${(e) => {
          // Prevent click from going to parent element.
          if (this.button && !this.linkTo) {
            e.preventDefault();
          }
        }}
      >
        ${contentTemplate} <slot name="dropdown"></slot>
      </div>
    `;
  }
}
customElements.define("bt-icon", BTIcon);

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

      :host([button]) {
        cursor: pointer;
      }
      :host([button]:hover) {
        color: var(--bt-icon-button-hover-color, #616161);
      }
      :host([button]:active) {
        color: var(--bt-icon-button-active-color, #9e9e9e);
      }

      ${linkTo
        ? html` a, a:visited { height: ${size}; color: inherit; } `
        : html``}

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
