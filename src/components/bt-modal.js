import { html } from "lit-element";
import BTBase from "../bt-base";
import { escapeToDismiss } from "../util/mouse";

class BTModal extends BTBase {
  static get properties() {
    return {};
  }

  constructor() {
    super();

    this._views = [];
  }

  connectedCallback() {
    super.connectedCallback();

    // Remove view on escape
    this.__removeEscapeListener = escapeToDismiss(() => this._removeTopModal());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.__removeEscapeListener();
  }

  render() {
    return html`
      ${style}
      <div
        id="container"
        class="fixed top-0 bottom-0 left-0 right-0 flex justify-center items-center overflow-y-auto z-10"
        @mousedown="${this._onMousedown}"
        @click="${this._onContainerClick}"
      ></div>
    `;
  }

  clear() {
    Array.from(this._id("container").children).forEach((view) => {
      this._id("container").removeChild(view);
    });
    this.style.display = "none";
    this._views = [];
  }

  _removeTopModal() {
    if (this._views.length) {
      const view = this._views[this._views.length - 1];

      // Call close on view if method exists.
      if (view.close) {
        view.close();
      }

      this.removeView(view);
    }
  }

  removeView(el) {
    const viewIdx = this._views.findIndex((v) => v === el);
    if (viewIdx < 0) return;

    this._views.splice(viewIdx, 1);

    // Find existing window and remove
    const child = this._id("container").children[viewIdx];
    if (child) {
      this._id("container").removeChild(child);
    }

    if (this._views.length === 0) {
      this.style.display = "none";
    }
  }

  addView(el) {
    // Allow at most one custom element type in the modal...
    const viewIdx = this._views.findIndex((v) => v.nodeName === el.nodeName);

    if (viewIdx >= 0) {
      this._views[viewIdx] = el;
    } else {
      this._views.push(el);
    }

    if (viewIdx >= 0) {
      // Retrieve window, flush window, and append window child
      const w = this._id("container").children[viewIdx];
      while (w.firstChild) {
        w.removeChild(w.firstChild);
      }
      w.appendChild(el);
    } else {
      // Create new window and add child
      const layer = document.createElement("div");
      layer.classList.add(
        "window",
        "absolute",
        "inset-x-0",
        "inset-y-0",
        "flex-center",
        "m-auto"
      );

      // Dynamically ensure that the z-index is increasing in value for higher layers
      layer.style.zIndex = `${this._id("container").children.length + 1 * 10}`;
      layer.appendChild(el);

      this._id("container").appendChild(layer);
    }

    if (this._views.length > 0) {
      this.style.display = "";
    }
  }

  _onMousedown(e) {
    // Only set mousedown flag if click on window background.
    if (e.target.classList.contains("window")) {
      this._mousedown = true;
    }
  }

  _onContainerClick(e) {
    // If start of click was outside, ignore this.
    if (!this._mousedown) {
      return;
    }
    this._mousedown = false;

    // dismiss only if click on window background
    if (e.target.classList.contains("window")) {
      this._removeTopModal();
    }
  }
}
customElements.define("bt-modal", BTModal);

const style = html`
  <style>
    .window {
      background-color: rgba(0, 0, 0, 0.5);
    }
  </style>
`;
