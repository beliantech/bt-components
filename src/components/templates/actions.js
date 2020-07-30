import { html } from "lit-element";

export default (
  opts = {
    editmode: false,
    onSave: () => {},
    onCancel: () => {},
  }
) =>
  opts.editmode
    ? html`
        <div class="mt-1">
          <bt-button class="inline-block" small primary @click=${opts.onSave}
            >Save</bt-button
          >
          <bt-button
            class="inline-block"
            small
            transparent
            @click=${opts.onCancel}
            >Cancel</bt-button
          >
        </div>
      `
    : html``;
