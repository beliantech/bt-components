import { html } from "lit-element";
import BTBase from "../bt-base";
import { classMap } from "lit-html/directives/class-map";

import labelTemplate from "./templates/label";
import descriptionTemplate from "./templates/description";
import actionsTemplate from "./templates/actions";

import "./bt-icon";

const NodeNamesAllowCopyPaste = {
  "BT-INPUT": true,
  "BT-DATE-INPUT": true,
  "BT-DATETIME-INPUT": true,
};

class BTField extends BTBase {
  static get properties() {
    return {
      field: { type: Object },
      enableOverlay: { type: Boolean },

      // if true, Enter submits a textarea (no newline allowed)
      textareaSubmitOnEnter: { type: Boolean },

      _editmode: { type: Boolean },
    };
  }

  constructor() {
    super();

    this.enableOverlay = true;
    this.hideDescription = false;
  }

  render() {
    if (!this.field) return html``;

    const shouldOverlay =
      this.field.clickToEdit && this.field.displaymode && !this.field.disabled;

    const containerClasses = {
      overlay: shouldOverlay,
    };

    let overlayTemplate = html``;
    if (this.enableOverlay) {
      if (shouldOverlay) {
        overlayTemplate = html`
          <div
            class="edit-overlay flex items-center justify-end"
            @click=${this._onOverlayClick}
          >
            <bt-icon button>edit</bt-icon>
            ${NodeNamesAllowCopyPaste[this.field.nodeName]
              ? html`
                  <bt-icon class="ml-1" button small @click=${this._onCopyClick}
                    >filter_none</bt-icon
                  >
                `
              : html``}
          </div>
        `;
      }
    } else {
      if (shouldOverlay) {
        overlayTemplate = html`
          <div class="absolute top-0 right-0 leading-none">
            <a
              href="#"
              class="text-xs leading-none"
              @click=${this._onOverlayClick}
              >Edit</a
            >
          </div>
        `;
      }
    }

    return html`
      ${style}
      <div
        class="relative ${classMap(containerClasses)}"
        @keydown=${this._onKeyDown}
        @input-submit=${this._exitEditMode /* Close from deep nested fields. */}
        @input-cancel=${this._exitEditMode /* Close from deep nested fields. */}
      >
        ${overlayTemplate}
        ${labelTemplate({
          label: this.field.label,
          labelAlign: this.field.labelAlign,
          labelColor: this.field.labelColor,
          editable: this.field.editable,
          hideIndicator: this.field.hideIndicator,
          hasDescription: !!this.field.description,
          required: this.field.required,
          annotation: this.field.annotation,
        })}
        ${descriptionTemplate({
          description: this.field.description,
          editable: this.field.editable,
          omit: this.field.clickToEdit && this.field.displaymode,
        })}
        <div>
          <slot></slot>
        </div>
        ${actionsTemplate({
          editmode: this.field.clickToEdit && !this.field.displaymode,
          onSave: (e) => {
            this._onSave(e);
            // Prevent clash with nested click controller
            e.stopPropagation();
          },
          onCancel: (e) => {
            this._onCancel(e);
            // Prevent clash with nested click controller
            e.stopPropagation();
          },
        })}
      </div>
    `;
  }

  _onSave(e) {
    if (!this.field) return;

    if (
      (this.field.validate && this.field.validate()) ||
      this.field.validate == null
    ) {
      // Emit from the field to penetrate Shadow DOM
      this.field._emit("input-submit", {
        value: this.field.model,
      });

      this._emit("input-save", {}, true);
      this._exitEditMode();
    }
  }

  _onCancel(e) {
    this._emit("input-cancel", {}, true);
    this._exitEditMode();
  }

  _onKeyDown(e) {
    if (!this.field) return;

    // note(jon): this code was moved from kr-input. Is this right?
    if (e.key === "Enter") {
      if (
        e.target.nodeName === "INPUT" ||
        (e.target.nodeName === "TEXTAREA" &&
          (this.textareaSubmitOnEnter || e.metaKey || e.ctrlKey))
      ) {
        // Don't exit edit mode if validation failed
        if (
          (this.field.validate && this.field.validate()) ||
          !this.field.validate
        ) {
          // Emit from the field to penetrate Shadow DOM
          this.field._emit("input-submit", {
            value: this.field.model,
          });

          this._exitEditMode();
        }
      }
    } else if (e.key === "Escape") {
      this._onCancel(e);
    }
  }

  _onOverlayClick(e) {
    // Prevent click from going through.
    e.preventDefault();

    if (!this.field) return;
    if (this.field.disabled) return;

    if (this.field.clickToEdit && this.field.displaymode) {
      this._enterEditMode();
    }
  }

  _onCopyClick(e) {
    e.stopPropagation();

    if (NodeNamesAllowCopyPaste[this.field.nodeName] && this.field.model) {
      const textarea = document.createElement("textarea");
      textarea.innerHTML = this.field.model;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);

      this._emit(
        "bt-copied",
        {
          text: this.field.model,
        },
        true
      );
    }
  }

  _enterEditMode() {
    if (this.field.clickToEdit) {
      this.field.displaymode = false;
      this._emit("edit-mode");

      this._editmode = true;
    }
  }

  _exitEditMode() {
    if (this.field.clickToEdit) {
      this.field.displaymode = true;

      this._editmode = false;
    }
  }
}
customElements.get("bt-field") || customElements.define("bt-field", BTField);

const style = html`
  <style>
    .overlay .edit-overlay:hover {
      border: 1px solid lightgray;
      background-color: rgba(0, 0, 0, 0.05);
    }
    .overlay .edit-overlay {
      cursor: pointer;
    }
    .edit-overlay {
      border: 1px solid transparent;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 1;
    }
  </style>
`;
