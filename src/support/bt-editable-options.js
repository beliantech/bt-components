import { html } from "lit-element";
import BTBase from "bt-base";

import { v4 as uuidv4 } from "uuid";

import isEqual from "lodash/isEqual";

import "components/bt-inline-input";

import { moveIndex } from "util/positioning";

/**
 * An editable item consists of a row (L to R): icon, editable text field, dragger icon, delete icon
 */
class BTEditableOptions extends BTBase {
  static get properties() {
    return {
      type: { type: String }, // one of "radio", "dropdown", "checklist"
      _model: { type: Array },
    };
  }

  constructor() {
    super();

    this._model = [];
    this.type = "dropdown";
  }

  get model() {
    return this._model;
  }

  set model(model) {
    if (model == null) return;
    if (isEqual(model, this._model)) return;

    const prevModel = this._model;
    this._model = model;
    this.requestUpdate("_model", prevModel);
  }

  render() {
    let icon;
    let showIcon = true;
    switch (this.type) {
      case "dropdown": {
        showIcon = false;
        break;
      }
      case "radio": {
        showIcon = false;
        break;
      }
      default: {
        icon = "check_box_outline";
      }
    }

    return html`
      ${style}

      <div id="options">
        ${this._model.map(
          (m, idx) => html`
            <div
              class="flex justify-between items-center w-full option-item"
              @dragstart="${(e) => this.dndEvent("start", m.id, e)}"
              @dragenter="${(e) => this.dndEvent("enter", m.id, e)}"
              @dragover="${(e) => this.dndEvent("over", m.id, e)}"
              @dragend="${(e) => this.dndEvent("end", m.id, e)}"
              @dragleave="${(e) => this.dndEvent("leave", m.id, e)}"
              @drop="${(e) => this.dndEvent("drop", m.id, e)}"
              draggable="true"
            >
              ${showIcon
                ? html` <kr-icon small class="m-0" .icon="${icon}"></kr-icon> `
                : html` <div class="text-sm">${idx + 1}.</div> `}
              <bt-inline-input
                class="ml-1 flex-1 py-1"
                highlightOnFocus
                .model="${m.name}"
                data-item-index="${idx}"
                .inlineClass="${"text-sm"}"
                @input-submit="${this._onInputSubmit}"
              ></bt-inline-input>
              <kr-icon
                class="m-0 mx-1 cursor-move dragger"
                data-item-index="${idx}"
                .icon="${"drag_indicator"}"
              ></kr-icon>
              <kr-icon
                button
                class="m-0 mx-1 delete"
                data-item-index="${idx}"
                .icon="${"delete"}"
                @click="${this._onItemDelete}"
              ></kr-icon>
            </div>
          `
        )}
      </div>
      <bt-inline-input
        id="add-input"
        class="block my-2"
        .submitOnBlur="${false}"
        required
        .placeholder="${"Add item..."}"
        .inlineClass="${"text-sm"}"
        @input-submit="${this._onNewItemSubmit}"
      >
      </bt-inline-input>
    `;
  }

  dndEvent(eventname, itemId, e) {
    // note(jon): nobody outside needs to know. Prevent affecting parent with dnd.
    e.stopPropagation();

    switch (eventname) {
      case "start":
        this._draggedId = itemId;
        e.target.closest(".option-item").classList.add("drag-item");

        break;
      case "enter": {
        if (this._draggedId == null) return; // ignore drag from other places
        e.target.closest(".option-item").classList.add("drag-hover");

        this._moveItem(this._draggedId, itemId);

        // See https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_operations#droptargets
        e.preventDefault();
        break;
      }
      case "over": {
        // See https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_operations#droptargets
        e.preventDefault();
        break;
      }
      case "leave":
        if (this._draggedId == null) return; // ignore drag from other places
        e.target.closest(".option-item").classList.remove("drag-hover");

        break;
      case "drop": {
        if (this._draggedId == null) return; // ignore drag from other places
        e.target.closest(".option-item").classList.remove("drag-hover");
        e.target.closest(".option-item").classList.remove("drag-item");

        this._moveItem(this._draggedId, itemId, true);
        break;
      }
      case "end":
        if (this._draggedId == null) return; // ignore drag from other places
        e.target.closest(".option-item").classList.remove("drag-item");

        this._draggedId = null;
        break;
    }
  }

  _moveItem(draggedId, currentId, emitEvent = false) {
    // Find index of current item
    const targetIdx = this._model.findIndex((m) => m.id === currentId);
    const draggedIdx = this._model.findIndex((m) => m.id === draggedId);

    this._model = moveIndex(this._model, draggedIdx, targetIdx);

    if (emitEvent) {
      this._emit("model-change", { value: this._model });
    }
  }

  _onInputSubmit(e) {
    const editIdx = +e.currentTarget.getAttribute("data-item-index");
    const newValue = e.detail.value;

    const model = this._model.slice();
    const modelItem = Object.assign({}, model[editIdx]);
    modelItem.name = newValue;
    model[editIdx] = modelItem;

    this._model = model;
    this._emit("model-change", { value: this._model });
  }

  _onItemDelete(e) {
    const deleteIdx = +e.currentTarget.getAttribute("data-item-index");

    this._model = this._model.filter((_m, i) => i !== deleteIdx);
    this._emit("model-change", { value: this._model });
  }

  _onNewItemSubmit(e) {
    const newValue = e.detail.value;

    this._model = this._model.concat([
      {
        id: uuidv4(),
        name: newValue,
      },
    ]);

    this._emit("model-change", { value: this._model });

    // Clear input model after new submission
    const addInput = this._id("add-input");
    if (addInput) {
      // Go back to edit mode after render complete.
      addInput.updateComplete.then(() => {
        addInput.edit();
      });

      addInput.model = "";
    }
  }

  get updateComplete() {
    return super.updateComplete.then(() => {
      return Promise.all(
        this._selectAll("bt-inline-input").map((el) => el.updateComplete)
      );
    });
  }
}
customElements.define("bt-editable-options", BTEditableOptions);

import colors from "../colors";

const style = html`
  <style>
    :host {
      display: block;
    }
    .option-item kr-icon {
      display: none;
    }
    .option-item:hover {
      background-color: ${colors.hover};
    }
    .option-item:hover kr-icon {
      display: inline-block;
    }

    .option-item.drag-item {
      background-color: white;
    }
    .option-item.drag-hover {
      background-color: lightgray;
    }
  </style>
`;
