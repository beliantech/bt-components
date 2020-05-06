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
          <kr-button class="inline-block" small primary @click=${opts.onSave}
            >Save</kr-button
          >
          <kr-button
            class="inline-block"
            small
            transparent
            @click=${opts.onCancel}
            >Cancel</kr-button
          >
        </div>
      `
    : html``;
