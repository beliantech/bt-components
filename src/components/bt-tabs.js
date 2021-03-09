import { html, css, unsafeCSS } from "lit-element";
import { classMap } from "lit-html/directives/class-map";
import BTBase from "../bt-base";

import colors from "../colors";

class BTTabs extends BTBase {
  static get properties() {
    return {
      tabSchema: { type: Object },
      activeTabId: { type: String },

      horizontal: { type: String }, // (left|right) if set, tabs will be horizontal

      rotate: { type: Boolean },
      tabAlign: { type: String }, // (left|center|right)

      rootPath: { type: String, attribute: false },

      tabs: { type: Array },
      tabParam: { type: String },

      // Array of tabIds to set active border, otherwise active border will be blank when it hits the content
      activeBorderIds: { type: Array },
    };
  }

  static get styles() {
    return [
      super.styles,
      css`
        :host {
          display: block;
        }
        .tab {
          user-select: none;
          background-color: ${unsafeCSS(colors.inactive)};
          line-height: 1;
        }
        .vertical .tab {
          min-width: 90px;
          border-right: 1px solid lightgray;
          border-bottom: 1px solid lightgray;
        }
        .horizontal .tab {
          border-left: 1px solid lightgray;
          border-top: 1px solid lightgray;
          border-bottom: 1px solid lightgray;
          text-align: center;
        }
        .horizontal .tab:last-child {
          border-right: 1px solid lightgray;
        }

        .tab.active {
          background-color: white;
        }
        .non-rotate.vertical .tab.active {
          border-right: 1px solid transparent;
        }
        .horizontal .tab.active {
          background-color: white;
          border-bottom: 1px solid transparent;
        }
        .horizontal .tab.active.active-border-b {
          background-color: white;
          border-bottom: 1px solid lightgray;
        }

        .tab:hover {
          background-color: ${unsafeCSS(colors.hover)};
          cursor: pointer;
        }
        .tab.active:hover {
          background-color: white;
        }

        .vertical .filler-tab-pre,
        .vertical .filler-tab-post {
          border-right: 1px solid lightgray;
        }
        .vertical .filler-tab-post {
          height: 1rem;
        }
        .horizontal-left .filler-tab-post,
        .horizontal-right .filler-tab-pre {
          border-bottom: 1px solid lightgray;
          flex: 1;
        }
        .horizontal-left .filler-tab-pre,
        .horizontal-right .filler-tab-post {
          border-bottom: 1px solid lightgray;
          width: 20px;
        }

        .vertical .name {
          padding-right: 0.25rem;
        }

        /* Rotate tabs CSS */
        .rotate .tabs-container {
          transform-origin: 0 0;
          transform: rotate(-90deg) translateX(-100%) translateY(0);
        }
        .rotate .filler-tab-pre,
        .rotate .filler-tab-post {
          display: none;
        }
        .rotate .tab-content {
          /* Estimated tab height */
          margin-left: 35px;
        }
        .rotate.vertical .tab:last-child {
          border-left: 1px solid lightgray;
        }
        .rotate.vertical .tab:first-child {
          border-right: 0;
        }
      `,
    ];
  }

  constructor() {
    super();

    this.horizontal = false;
    this.right = false;
    this.activeBorderIds = [];

    this.tabAlign = "left";
    this.tabParam = "tab";
  }

  connectedCallback() {
    super.connectedCallback();

    this._setDisplayedTab();

    this.__setDisplayedTabListener = this._setDisplayedTab.bind(this);
    window.addEventListener("kr-navigate", this.__setDisplayedTabListener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("kr-navigate", this.__setDisplayedTabListener);
  }

  _setDisplayedTab() {
    // Route to correct tab
    if (this.rootPath) {
      const relPath = window.location.pathname
        .replace(this.rootPath, "")
        .replace("/", "");
      if (relPath) {
        const matchingTab = this.tabs.find((t) => {
          if (t.relPath) {
            return relPath.indexOf(t.relPath) === 0;
          }
        });

        if (matchingTab) {
          this.activeTabId = matchingTab.tabId;
        }
      }
      // else default root tab
    } else {
      const params = new URLSearchParams(window.location.search);
      if (params.get(this.tabParam)) {
        this.activeTabId = params.get(this.tabParam);
      } else {
        this.activeTabId = this.tabs[0].tabId;
      }
    }
  }

  render() {
    const containerClasses = {
      horizontal: this.horizontal,
      "horizontal-left": this.horizontal === "left",
      "horizontal-right": this.horizontal === "right",
      vertical: !this.horizontal,
      "flex-col": this.horizontal,
      rotate: this.rotate,
      "non-rotate": !this.rotate,
    };
    const tabsContainerClasses = {
      "flex-col": !this.horizontal,
      absolute: this.rotate,
    };
    const tabsClasses = {
      "flex-col": !this.horizontal && !this.rotate,
      "items-end": this.horizontal === "right",
      "flex-row-reverse": this.rotate,
    };

    return html`
      <div class="flex h-full ${classMap(containerClasses)}">
        <div class="flex tabs-container ${classMap(tabsContainerClasses)}">
          <div class="filler-tab-pre"></div>
          <div class="flex tabs overflow-x-auto ${classMap(tabsClasses)}">
            ${this.tabs.map((t, idx) => {
              const tabClasses = {
                active: this.activeTabId
                  ? t.tabId === this.activeTabId
                  : idx === 0,
                "font-bold": true,
                "active-border-b": this.activeBorderIds.includes(t.tabId),
              };

              tabClasses["text-sm"] = true;
              if (this.horizontal) {
                tabClasses["py-2"] = true;
                tabClasses["px-3"] = true;
              } else {
                tabClasses["p-2"] = true;
              }

              const tabContentClasses = {
                "justify-center": this.tabAlign === "center",
                "justify-start": this.tabAlign === "left",
                "justify-end": this.tabAlign === "right",
              };

              return html`
                <div
                  class="tab ${classMap(tabClasses)}"
                  @click=${(e) => {
                    this.activeTabId = t.tabId;
                  }}
                >
                  <div
                    class="flex items-center leading-none h-full ${classMap(
                      tabContentClasses
                    )}"
                  >
                    ${t.icon
                      ? html`
                          <bt-icon muted class="m-0 ml-1 mr-3"
                            >${t.icon}</bt-icon
                          >
                        `
                      : html``}
                    <span class="name whitespace-nowrap">${t.title}</span>
                  </div>
                </div>
              `;
            })}
          </div>
          <div class="filler-tab-post"></div>
        </div>
        <div
          class="flex-grow relative tab-content"
          @title-change=${(e) => {
            this.requestUpdate("tabs");
          }}
        >
          <!-- absolute is necessary to fix Safari -->
          <div class="absolute inset-x-0 inset-y-0">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
  }

  get tabs() {
    // Children of bt-tabs should be kr-tab-content
    return Array.from(this.children);
  }

  updated(changed) {
    // Expect kr-tab-content as children
    this.tabs.forEach((tab) => {
      tab.currentTabId = this.activeTabId || this.tabs[0].tabId;
    });

    if (changed.has("activeTabId")) {
      // Don't trigger on the first time
      this._onTabChange();
    }
  }

  _onTabChange() {
    const tab = this.tabs.find((t) => this.activeTabId === t.tabId);
    const tabRelPath = tab.relPath;

    this._emit("tabchange", { tabId: this.activeTabId });

    let query = "";
    if (this.rootPath) {
      // Path-based tabs, e.g. /rootPath/fooTab
      if (tabRelPath != null) {
        const newPath = new URL(
          tabRelPath,
          `${window.location.origin}${
            this.rootPath.endsWith("/") ? this.rootPath : `${this.rootPath}/`
          }`
        ).pathname;

        if (
          window.location.pathname.indexOf(newPath) === -1 ||
          tabRelPath === ""
        ) {
          // Only navigate if our current path doesn't contain desired new path, there may be child routes we should retain
          this.navigate(newPath);
        }
      }
    } else {
      // Query-based tabs, e.g. ?tab=fooTab
      const params = new URLSearchParams(window.location.search);
      // Should try to not need push tab param if on root path, just show first
      if (
        this.activeTabId !== this.tabs[0].tabId ||
        (params.get(this.tabParam) &&
          params.get(this.tabParam) !== this.activeTabId)
      ) {
        params.set(this.tabParam, this.activeTabId);
        query = `?${params.toString()}`;
        history.pushState(
          {
            prev: window.location.href,
          },
          null,
          `${window.location.origin}${window.location.pathname}${query}`
        );
      }
    }
  }
}
customElements.define("bt-tabs", BTTabs);
