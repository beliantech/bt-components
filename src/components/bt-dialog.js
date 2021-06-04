import { html } from "lit-element";
import BTBase from "../bt-base";
import colors from "../colors";

import "./bt-icon";
import "./bt-button";

class BTDialog extends BTBase {
  static get properties() {
    return {
      title: { type: String },
      body: { type: Object }, // if supplied, <slot></slot> is not rendered

      icon: { type: String },

      cancel: { type: String },
      ok: { type: String },

      noPadding: { type: Boolean },
      disableOk: { type: Boolean },
      danger: { type: Boolean, reflect: true },

      notice: { type: String },
    };
  }

  constructor() {
    super();

    this.notice = "";
    this.disableOk = false;
    this.noPadding = false;

    // this.ok/this.cancel is blank, signifying no OK/cancel button should be rendered
    this.ok = "";
    this.cancel = "";
  }

  static get styles() {
    return [
      super.styles,
      css`
        :host {
          min-width: 350px;
        }
        .notice {
          background-color: ${colors.yellow};
        }
        .title-bar {
          background-color: ${colors.theme};
          color: white;
        }
        .title-bar.danger {
          background-color: ${colors.red}cc;
        }
        .content {
          height: 100%;
        }
        .readonly .codeflask {
          opacity: 0.725;
        }
      `,
    ];
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  render() {
    return html`
      <div class="bg-white">
        <!-- Header -->
        <div
          class="flex items-center justify-between title-bar ${this.danger
            ? "danger"
            : ""}"
        >
          <div
            class="flex items-center text-lg px-4 py-2 font-bold leading-none"
          >
            ${this.icon
              ? html`<bt-icon medium class="ml-0 mr-2">${this.icon}</bt-icon>`
              : html``}
            ${this.title}
          </div>
          <bt-icon button button-light class="m-2" @click=${this._onCancel}
            >close</bt-icon
          >
        </div>
        ${this.notice
          ? html`
              <div class="px-4 py-2 notice text-sm font-bold">
                ${this.notice}
              </div>
            `
          : html``}
        <div class="${this.noPadding ? "" : "p-4"} content text-sm">
          ${this.body || html` <slot></slot> `}
        </div>
        ${this.ok || this.cancel
          ? html`
              <div class="px-4 pb-2 flex justify-end">
                ${this.cancel
                  ? html`
                      <bt-button class="mr-1" small @click=${this._onCancel}>
                        ${this.cancel}
                      </bt-button>
                    `
                  : html``}
                ${this.ok
                  ? html`
                <bt-button
                  small
                  @click=${this._onOk}
                  ?disabled=${this.disableOk}
                  >${this.ok}</bt-button
                >
              </div>
            `
                  : html``}
              </div>
            `
          : html``}
      </div>
    `;
  }

  open(el) {
    // Keep reference to original dialog
    this._el = el || this;

    // Allow generic use of bt-dialog
    if (!el) document.body.appendChild(this);

    return this.updateComplete.then(() => {
      this._emit("bt-modal-show", { el: this._el }, true);

      return new Promise((resolve, reject) => {
        this._cancelFn = reject;
        this._okFn = resolve;
      });
    });
  }

  close() {
    // Cancel the promise, if still unresolved
    this._cancelFn();

    this._emit("bt-modal-hide", { el: this._el }, true);
    this._emit("close", {});
  }

  _onCancel() {
    this._cancelFn();
    this.close();
  }

  _onOk() {
    this._okFn();
    this.close();
  }
}
customElements.define("bt-dialog", BTDialog);
