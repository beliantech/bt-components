import { html } from "lit-element";
import t from "locale";
import { ifDefined } from "lit-html/directives/if-defined";

import { styleMap } from "lit-html/directives/style-map";

import "../kr-inline-input";

export default ({
  label = "",
  labelAlign = "",
  labelColor = "",
  required = false,
  forId = "",
  hideIndicator = false,
  hasDescription = false,
  editable = false,
  annotation = "",
} = {}) => {
  let annotationTemplate = null;
  if ((!required && !hideIndicator) || annotation) {
    annotationTemplate = html`
      <span
        class="font-normal optional text-xs leading-none"
        style="color: gray;"
        >(${annotation || "optional"})</span
      >
    `;
  }

  if (!editable) {
    if (!label) {
      return html``;
    }

    const labelStyles = {
      "text-align": labelAlign,
      color: labelColor,
    };
    if (hasDescription) {
      labelStyles["margin-bottom"] = "2px";
    }

    return html`
      <label
        class="block text-sm font-bold ${hasDescription ? "" : "mb-1"}"
        style=${styleMap(labelStyles)}
        for=${ifDefined(forId)}
      >
        ${t(label)} ${annotationTemplate}
      </label>
    `;
  }

  // Editable mode (form builder)
  return html`
    <kr-inline-input
      id="label"
      editable
      highlightOnFocus
      .name="${"label"}"
      .model="${label}"
      .inlineClass="${"text-sm font-bold mb-1"}"
      .inputClass="${"mb-1"}"
      .placeholder="${"Add a field name..."}"
      @input-submit="${function(e) {
        this._emit("label-change", { value: e.detail.value }, true);
      }}"
    >
      ${annotationTemplate}
    </kr-inline-input>
  `;
};
