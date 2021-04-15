import { html, css } from "lit-element";
import BTBase from "../../bt-base";

import { clickOutsideToDismiss } from "../../util/mouse";
import keyBy from "lodash/keyBy";

import "../bt-input";

const ITEM_ROW_HEIGHT = 34;
const MAX_VISIBLE_TAG_ROWS = 5;

// PORTED FROM PD-TAG-EDITOR
class BTFilterableItems extends BTBase {
  static get properties() {
    return {
      items: { type: Array }, // [{ id: String, name: String }]
      model: { type: Array }, // [ id ]

      placeholder: { type: String },

      dropdownMode: { type: Boolean }, // If true, items will only display when user clicks in input

      allowCreate: { type: Boolean }, // If true, will allow user to type in new item
      allowMultiselect: { type: Boolean }, // If true, will allow user to select multiple items
      displayCheckboxes: { type: Boolean },

      _input: { type: String },
      _selectedIndexCounter: { type: Number },

      _displayItems: { type: Boolean },
    };
  }

  static get styles() {
    return [super.styles, css``];
  }

  constructor() {
    super();

    this._input = "";
    this._selectedIndexCounter = 0;
    this._displayItems = false;
    this.items = [];
    this.allowCreate = false;
    this.model = [];
    this.placeholder = "";
    this.dropdownMode = true;
  }

  render() {
    const modelMap = {};
    this.model.forEach((id) => {
      modelMap[id] = id;
    });

    const filteredItems = this.items.filter(
      (item) => item.name.toLowerCase().indexOf(this._input.toLowerCase()) >= 0
    );

    const shouldCreateInput = this._input.length && filteredItems.length === 0;

    // Construct row models
    this._rows = filteredItems.map((item, idx) => ({
      type: "tag",
      id: item.id,
      value: item,
      action: this._toggleItem.bind(this, item),
      onhover: this._selectIndex.bind(this, idx),
    }));
    if (shouldCreateInput && this.allowCreate) {
      const len = this._rows.length;
      this._rows.push({
        type: "create",
        id: "____create____",
        value: this._input,
        action: this._addNewItem.bind(this, this._input),
        onhover: this._selectIndex.bind(this, len),
      });
    }

    // Calculate the selected row index
    const selectedIndex = this._selectedIndex;

    // Whether or not to show chips in input
    const displayChips = this.allowMultiselect && this.model.length > 0;

    return html`
      <div @keydown=${this.onKeydown} @click=${this._blockClick}>
        <bt-input
          class="block"
          id="input"
          .placeholder=${this.placeholder}
          .chips=${displayChips ? this._selectedItems.map((i) => i.name) : []}
          .inline=${displayChips}
          .noline=${displayChips}
          .noindent=${displayChips}
          .model=${this._input}
          @model-change=${this._onModelChange}
          @focus=${() => (this._displayItems = true)}
        ></bt-input>
        <div class="relative">
          ${(!this.dropdownMode || this._displayItems) && this._rows.length
            ? html`
                <div
                  id="scroller"
                  class="absolute z-10 w-full overflow-y-auto bg-white border-b border-l border-r border-gray-400"
                  style="max-height:${ITEM_ROW_HEIGHT *
                  MAX_VISIBLE_TAG_ROWS}px;"
                >
                  ${this._rows.map((r, i) => {
                    if (r.type === "tag") {
                      return html`
                        <div
                          @click=${r.action}
                          @keydown=${(e) => {
                            if (e.key === "Enter") {
                              r.action(e);
                            }
                          }}
                          @mouseenter=${r.onhover}
                          class="item flex items-center cursor-pointer py-1 outline-none
                            ${selectedIndex === i ? "bg-gray-200" : ""}"
                          tabindex="0"
                        >
                          ${this.allowMultiselect && this.displayCheckboxes
                            ? html`
                                <div
                                  class="m-1
                                    ${modelMap[r.value.id] != null
                                    ? "checkbox-checked"
                                    : "checkbox-empty"}"
                                ></div>
                              `
                            : html``}
                          <div class="ml-1 w-full">
                            ${r.value.template
                              ? r.value.template
                              : html`
                                  <div class="text-sm">${r.value.name}</div>
                                `}
                          </div>
                        </div>
                      `;
                    }

                    if (this.allowCreate) {
                      return html`
                        <div
                          class="${selectedIndex === i ? "selected" : ""}"
                          tabindex="0"
                          @mouseenter=${r.onhover}
                          @click=${r.action}
                        >
                          <div>Create "${r.value.name}"</div>
                        </div>
                      `;
                    }

                    return html``;
                  })}
                </div>
              `
            : html``}
        </div>
      </div>
    `;
  }

  updated(changed) {
    if (changed.has("_displayItems")) {
      if (this.dropdownMode && this._displayItems) {
        this._removeClickOutsideHandler =
          this._removeClickOutsideHandler ||
          clickOutsideToDismiss(this, () => {
            this._displayItems = false;

            // Restore input value to selected option
            if (!this.allowMultiselect && this.model.length > 0) {
              const selectedItems = this._selectedItems;
              if (selectedItems.length) {
                this._input = selectedItems[0].name;
              }
            }
          });
      } else {
        this._removeClickOutsideHandler && this._removeClickOutsideHandler();
        this._removeClickOutsideHandler = null;
      }
    }
  }

  _onModelChange(e) {
    this._input = e.detail.value.trim();
    this._selectedIndexCounter = 0;
    this._displayItems = true;
  }

  onKeydown(e) {
    if (e.key === "ArrowDown") {
      this._selectedIndexCounter++;
      this._scrollIfNecessary();

      // Prevent input cursor move
      e.preventDefault();
      // Prevent global listener trigger
      e.stopPropagation();
    } else if (e.key === "ArrowUp") {
      this._selectedIndexCounter--;
      this._scrollIfNecessary();

      // Prevent input cursor move
      e.preventDefault();
      // Prevent global listener trigger
      e.stopPropagation();
    } else if (e.key === "Enter") {
      const selectedRow = this._rows[this._selectedIndex];
      if (selectedRow) {
        selectedRow.action();
      }
    }
  }

  get _selectedItems() {
    const itemsMap = keyBy(this.items, "id");

    // Handle model id no longer in items
    return this.model
      .filter((mid) => itemsMap[mid] != null)
      .map((mid) => itemsMap[mid]);
  }

  _scrollIfNecessary() {
    const itemsContainer = this.shadowRoot.getElementById("scroller");

    const firstVisibleIndex = Math.floor(
      itemsContainer.scrollTop / ITEM_ROW_HEIGHT
    );
    const lastVisibleIndex =
      Math.floor(
        (itemsContainer.scrollTop + ITEM_ROW_HEIGHT * MAX_VISIBLE_TAG_ROWS) /
          ITEM_ROW_HEIGHT
      ) - 1;

    if (this._selectedIndex <= firstVisibleIndex) {
      itemsContainer.scrollTop = ITEM_ROW_HEIGHT * this._selectedIndex;
    } else if (this._selectedIndex > lastVisibleIndex) {
      itemsContainer.scrollTop =
        ITEM_ROW_HEIGHT * (this._selectedIndex - MAX_VISIBLE_TAG_ROWS + 1);
    }
  }

  _toggleItem(item) {
    if (!this.dropdownMode) {
      // Nothing to do
      return;
    }

    if (!this.allowMultiselect) {
      this._input = item.name;
      this._displayItems = false;

      this.model = [item.id];
      this._emit("model-change", {
        value: this.model,
      });
      return;
    }

    const itemNameLowerCase = item.name.toLowerCase();
    if (this.model.findIndex((id) => id === item.id) >= 0) {
      // Currently checked
      this.model = this._selectedItems
        .filter((i) => i.name.toLowerCase() !== itemNameLowerCase)
        .map((i) => i.id);
      this._emit("model-change", {
        value: this.model,
      });
    } else {
      // Currently unchecked
      const model = this.model.slice();
      model.push(item.id);
      this.model = model;
      this._emit("model-change", {
        value: this.model,
      });
    }
  }

  // _addNewItem(tagInput) {
  //   if (!this.allowCreate) return;

  //   const tags = this.selectedItems.slice();
  //   const allTags = this.items.slice();
  //   tags.push(tagInput);
  //   allTags.push(tagInput);
  //   this.selectedItems = tags;
  //   this.items = allTags;

  //   // Clear input
  //   this._input = "";
  //   this.shadowRoot.getElementById("input").value = "";
  //   this._selectedIndexCounter = 0;
  // }

  _selectIndex(index) {
    this._selectedIndexCounter = index;
  }

  get _selectedIndex() {
    if (this._rows.length === 0) return -1;

    let selectedIndex = this._selectedIndexCounter % this._rows.length;
    if (selectedIndex < 0) {
      selectedIndex += this._rows.length;
    }
    return selectedIndex;
  }

  _blockClick(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  focus() {
    this._id("input").focus();
  }

  static get styles() {
    return [
      super.styles,
      css`
        :host {
          max-width: 225px;
        }
        .container {
          max-width: 225px;
          background-color: white;
        }
        .title {
          padding: var(--pd-unit) var(--pd-space);
          border-bottom: 1px solid lightgray;
          color: var(--pd-primary-color);

          font-size: var(--pd-font-size-normal);
        }
        input {
          width: 100%;
          border: 0;
          border-bottom: 1px solid lightgray;
          height: 2.5rem;
          font-size: 0.9rem;
          padding: 0.5rem 1rem;
        }
        .checkbox-empty {
          display: inline-block;
          height: 18px;
          opacity: 0.54;
          width: 18px;
          background: url(data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWw6c3BhY2U9InByZXNlcnZlIiB2ZXJzaW9uPSIxLjEiIHk9IjBweCIgeD0iMHB4IiB2aWV3Qm94PSIwIDAgMTggMTgiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDE4IDE4Ij4KICA8cGF0aCBkPSJtMTQgM2MwLjYgMCAxIDAuNCAxIDF2MTBjMCAwLjYtMC40IDEtMSAxaC0xMGMtMC42IDAtMS0wLjQtMS0xdi0xMGMwLTAuNiAwLjQtMSAxLTFoMTBtMC0xaC0xMGMtMS4xIDAtMiAwLjktMiAydjEwYzAgMS4xIDAuOSAyIDIgMmgxMGMxLjEgMCAyLTAuOSAyLTJ2LTEwYzAtMS4xLTAuOS0yLTItMnoiLz4KPC9zdmc+Cg==)
            no-repeat center;
          fill: var(--pd-primary-color);
          outline: none;
        }
        .checkbox-checked {
          display: inline-block;
          height: 18px;
          opacity: 0.54;
          width: 18px;
          background: url(data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWw6c3BhY2U9InByZXNlcnZlIiB2ZXJzaW9uPSIxLjEiIHk9IjBweCIgeD0iMHB4IiB2aWV3Qm94PSIwIDAgMTggMTgiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDE4IDE4Ij4KICA8cGF0aCBkPSJtMTQgMmgtMTBjLTEuMSAwLTIgMC45LTIgMnYxMGMwIDEuMSAwLjkgMiAyIDJoMTBjMS4xIDAgMi0wLjkgMi0ydi0xMGMwLTEuMS0wLjktMi0yLTJ6bS02LjYgMTAuOWwtMy44LTMuOSAxLjEtMS4xIDIuOCAyLjggNS45LTUuOSAxLjEgMS4xLTcuMSA3eiIvPgo8L3N2Zz4K)
            no-repeat center;
          outline: none;
        }
      `,
    ];
  }
}

customElements.define("bt-filterable-items", BTFilterableItems);
