import { html } from "lit-element";

export default (condition = false, errorText = "") =>
  condition
    ? html` <div class="text-kr-red text-sm my-1">${errorText}</div> `
    : html``;
