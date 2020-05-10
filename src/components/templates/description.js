import { html } from "lit-element";

export default ({ description = "", editable = false, omit = false }) => {
  if (omit) return html``;
  if (!editable) {
    if (!description) {
      return html``;
    }
    return html` <div class="text-xs mb-1">${description}</div> `;
  }

  return html`
    <bt-inline-input
      id="description"
      .model="${description}"
      .name="${"description"}"
      .inlineClass="${"text-xs mb-2"}"
      .inputClass="${"mb-1"}"
      .placeholder="${"Add a description..."}"
      highlightOnFocus
      @input-submit="${function (e) {
        this._emit("description-change", { value: e.detail.value }, true);
      }}"
    >
    </bt-inline-input>
  `;
};
