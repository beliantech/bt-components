import { html, LitElement } from "lit-element";

class BTHidden extends LitElement {
  static get properties() {
    return {
      model: { type: String },
    };
  }

  render() {
    return html`<input type="hidden" value=${this.model}></input>`;
  }
}
customElements.get("bt-hidden") || customElements.define("bt-hidden", BTHidden);
