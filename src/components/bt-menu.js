import { html, css, unsafeCSS } from "lit-element";
import BTBase from "../bt-base";

import { clickOutsideToDismiss } from "../util/mouse";
import colors from "../colors";

class BTMenu extends BTBase {
  static get properties() {
    return {
      _activeMenuItems: { type: Array },
      _showMenu: { type: Boolean },

      _submenuTemplate: { type: Object },

      stopPropagation: { type: Boolean, attribute: "stop-propagation" },
    };
  }

  set menuItems(items) {
    this.__menuItems = items; // top level items
    this._activeMenuItems = items;
  }

  get menuItems() {
    return this.__menuItems;
  }

  constructor() {
    super();

    this._showMenu = false;
    this.menuItems = [];
  }

  render() {
    const menuItems = this._activeMenuItems.filter((mi) =>
      mi.showIf != null ? mi.showIf() : true
    );

    return html`
      <div class="relative" @menu-dismiss=${this._onMenuDismiss}>
        <div
          class="flex items-center"
          @click=${(_e) => {
            this._showMenu = !this._showMenu;

            if (this._showMenu) {
              this._emit("menu-open");
            } else {
              this.dismiss();
            }

            if (this.stopPropagation) {
              e.stopPropagation();
            }
          }}
        >
          <slot></slot>
        </div>
        ${this._submenuTemplate
          ? html`<div class="menu absolute">${this._submenuTemplate}</div>`
          : html`
              <ul
                class="menu absolute text-sm py-1
            ${this._showMenu && menuItems.length ? "" : "hidden"}"
              >
                ${menuItems.map((mi) => {
                  if (mi.divider) {
                    return html`
                      <div
                        class="my-1"
                        style="border-top: 1px solid lightgray;"
                      ></div>
                    `;
                  }

                  return html`
                    <li>
                      ${mi.linkTo
                        ? html`
                            <a
                              class="py-2 px-3"
                              href="${mi.linkTo}"
                              @click=${(e) => {
                                this._showMenu = false;
                                this._emit("item-select");
                              }}
                              >${mi.text}</a
                            >
                          `
                        : html`
                            <a
                              class="py-2 px-3 ${mi.disabled ? "disabled" : ""}"
                              href="#"
                              @click=${(e) => {
                                e.preventDefault();
                                if (mi.disabled) return;

                                if (mi.items) {
                                  this._activeMenuItems = mi.items;
                                } else if (mi.action) {
                                  mi.action(mi); // pass in info
                                  this._showMenu = false;
                                  this._emit("item-select");
                                } else if (mi.template) {
                                  if (mi.templatePreloadFunc) {
                                    mi.templatePreloadFunc();
                                  }

                                  this._submenuTemplate = mi.template;
                                } else {
                                  this._showMenu = false;
                                }
                              }}
                              >${mi.text}</a
                            >
                          `}
                    </li>
                  `;
                })}
              </ul>
            `}
      </div>
    `;
  }

  updated(changed) {
    if (changed.has("_showMenu")) {
      if (this._showMenu) {
        this._removeClickOutsideHandler =
          this._removeClickOutsideHandler ||
          clickOutsideToDismiss(this, () => {
            this.dismiss();
          });
      } else {
        this._removeClickOutsideHandler && this._removeClickOutsideHandler();
        this._removeClickOutsideHandler = null;
      }
    }
  }

  _onMenuDismiss(e) {
    this.dismiss();
    e.stopPropagation();
  }

  dismiss() {
    this._showMenu = false;
    this._submenuTemplate = null;
    this._activeMenuItems = this.__menuItems; // restore menu items
    this._emit("menu-close");
  }

  static get styles() {
    return [
      super.styles,
      css`
        :host {
          display: inline-block;
        }
        ul {
          background-color: white;
          width: 200px;

          z-index: 100;
          box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.302),
            0 2px 6px 2px rgba(60, 64, 67, 0.149);
        }
        a {
          display: block;
          text-decoration: none;
          color: ${unsafeCSS(colors.darkgray)};
        }
        a.disabled {
          color: ${unsafeCSS(colors.lightgray)};
          cursor: not-allowed;
        }
        a:hover {
          background-color: ${unsafeCSS(colors.hover)};
        }
        a:hover.disabled {
          background-color: white;
        }
        :host .menu,
        :host([menu-right]) .menu {
          right: 0;
        }
        :host([menu-left]) .menu {
          right: auto;
          left: 0;
        }
      `,
    ];
  }
}
customElements.define("bt-menu", BTMenu);
