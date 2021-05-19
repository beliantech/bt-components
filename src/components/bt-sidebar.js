import { html } from "lit-element";
import BTBase from "../bt-base";

import "./bt-icon";

class BTSidebar extends BTBase {
  static get properties() {
    return {
      title: { type: String },
      position: { type: String }, // right or left
      resourceLink: { type: String },
      width: { type: Number },
    };
  }

  constructor() {
    super();

    this.position = "right";
    this.onClose = () => {}; // caller can set onClose to be notified when sidebar closes
  }

  render() {
    return html`
      ${style}
      <div
        id="modal"
        class="modal absolute inset-y-0 inset-x-0"
        @click=${this._onBackgroundClick}
      >
        <div
          id="container"
          class="sidebar-container absolute
            ${this.position === "right" ? "right-0" : "left-0"}
            inset-y-0 overflow-y-auto z-10 flex flex-col"
          style=${this.width ? `width:${this.width}px` : ""}
        >
          ${this._headerTemplate}
          <div class="flex-1 overflow-y-auto" id="view"></div>
        </div>
      </div>
    `;
  }

  get _headerTemplate() {
    return html`
      <div
        class="px-4 py-2 header font-bold text-white text-lg flex justify-between items-center"
      >
        <span>${this.title}</span>
        <div class="flex">
          ${this.resourceLink
            ? html`
                <bt-icon
                  class="text-white m-0 mr-2"
                  .linkTo=${this.resourceLink}
                  .linkTarget=${"_blank"}
                  button
                  >open_in_new</bt-icon
                >
              `
            : html``}
          <bt-icon
            class="text-white m-0 -mr-1"
            @click=${this.close}
            button
            button-light
            >close</bt-icon
          >
        </div>
      </div>
    `;
  }

  get hasView() {
    return this._hasView;
  }

  addView(el, width) {
    // Remove current view first
    this._clearView();
    if (width) {
      this.width = width;
    }
    this._id("view").appendChild(el);
    this.style.display = "";
    this._hasView = true;
    this._emit("sidebar-show");
  }

  close() {
    if (this._isClosing) return;

    this._clearView();
    this.style.display = "none";
    this.title = "";
    this.resourceLink = "";

    if (this.onClose) {
      this.onClose();
    }

    // Trigger notification
    this._isClosing = true;
    this._emit("bt-sidebar-hide", {}, true);
    this._isClosing = false;
  }

  _clearView() {
    const view = this._id("view");
    while (view.firstChild) {
      view.removeChild(view.firstChild);
    }

    this._hasView = false;
    this._emit("sidebar-hide");

    // Clear width
    this.width = 0;
  }

  _onBackgroundClick(e) {
    // dismiss only if click on modal background
    if (e.target.classList.contains("modal")) {
      this.close();
    }
  }
}
customElements.define("bt-sidebar", BTSidebar);

const style = html`
  <style>
    .modal {
      background-color: rgba(0, 0, 0, 0.5);
    }
    .sidebar-container {
      min-width: 300px;
      max-width: 80%;

      background-color: white;
    }
    .header {
      background-color: var(--bt-sidebar-header-color, #000);
      height: 40px;
    }
  </style>
`;
