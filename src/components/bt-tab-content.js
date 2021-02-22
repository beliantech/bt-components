import { html } from "lit-element";
import BTBase from "../bt-base";

class BTTabContent extends BTBase {
  static get properties() {
    return {
      tabId: { type: String },
      currentTabId: { type: String },
      title: { type: String },
      icon: { type: String },

      hidetitle: { type: Boolean },
      scroll: { type: Boolean },

      nopadding: { type: Boolean },

      relPath: { type: String, attribute: false },
      templateFunc: { type: Object },
    };
  }

  // Property to dynamically set scroll top from parent.
  set scrollTop(scrollTop = 0) {
    this._id("content").scrollTop = scrollTop;
  }

  render() {
    if (!this.tabId || !this.currentTabId || this.tabId !== this.currentTabId) {
      return html``;
    }

    return html`
      ${style}
      <div
        id="content"
        class="relative h-full ${this.scroll ? "overflow-y-auto" : ""}"
        @scroll=${(e) => {
          this._emit("content-scroll", { scrollTop: e.target.scrollTop }, true);
        }}
      >
        <div
          class="absolute inset-x-0 inset-y-0
            ${this.nopadding ? "" : "px-3 py-2"}"
        >
          ${this.title && !this.hidetitle
            ? html`
                <div class="mt-2 mb-4">
                  <h3 class="m-0 text-base font-semibold">${this.title}</h3>
                </div>
              `
            : html``}
          ${this.templateFunc ? this.templateFunc() : html` <slot></slot> `}
        </div>
      </div>
    `;
  }

  updated(changed) {
    if (changed.has("title")) {
      this._emit("title-change");
    }
  }
}
customElements.define("bt-tab-content", BTTabContent);

const style = html`
  <style>
    :host {
      display: block;
      height: 100%; /* take full tab height */
    }
    .content-title {
      height: 36px;
      display: flex;
      align-items: center;
    }
  </style>
`;
