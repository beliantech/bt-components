import { delay } from "./utils";

describe("bt-inline-input", () => {
  let container;
  let el;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);

    el = document.createElement("bt-inline-input");
    container.appendChild(el);
  });

  afterEach(() => {
    container.removeChild(el);
    document.body.removeChild(container);
  });

  // todo(jon): this test has to be run first, otherwise fails.
  describe("events.click", () => {
    it("focuses on the input box", async () => {
      el.model = "TEXT";

      await el.updateComplete;

      MockInteractions.click(el._select(".display"));

      await delay();

      assert.equal(document.activeElement.nodeName, "BT-INLINE-INPUT");
    });
  });

  describe("props.required = false", () => {
    it("sets required false on kr-input", async () => {
      el.required = false;
      el.editable = true;
      el.edit();

      await el.updateComplete;
      assert.ok(!el._select("bt-input").required);
    });
  });

  describe("events.model-change", () => {
    it("proxies the event from underlying kr-input, sets model", (done) => {
      const listener = function (e) {
        assert.equal(e.detail.value, "TEXT2");
        assert.equal(el.model, "TEXT2");
        el.removeEventListener("model-change", listener);
        done();
      };

      el.addEventListener("model-change", listener);

      el.model = "TEXT";
      el.updateComplete
        .then(() => {
          MockInteractions.click(el._select(".display"));

          return el.updateComplete;
        })
        .then(() => {
          el._id("input")._emit("model-change", {
            value: "TEXT2",
          });
        });
    });
  });

  describe("events.input-submit", () => {
    it("proxies the event from underlying kr-input, turns off editMode", (done) => {
      const listener = function (e) {
        assert.equal(e.detail.value, "TEXT2");
        assert.isFalse(e.composed);
        assert.isFalse(el._editMode);
        el.removeEventListener("input-submit", listener);
        done();
      };
      el.addEventListener("input-submit", listener);

      el.model = "TEXT";
      el.updateComplete
        .then(() => {
          MockInteractions.click(el._select(".display"));

          return el.updateComplete;
        })
        .then(() => {
          el._id("input")._emit("input-submit", {
            value: "TEXT2",
          });
        });
    });
  });

  describe("events.input-blur", () => {
    it("proxies the event as input-submit, turns off editMode", (done) => {
      const listener = function (e) {
        assert.equal(e.detail.value, "TEXT2");
        assert.isFalse(e.composed);
        assert.isFalse(el._editMode);

        el.removeEventListener("input-submit", listener);
        done();
      };
      el.addEventListener("input-submit", listener);

      el.model = "TEXT";
      el.updateComplete
        .then(() => {
          MockInteractions.click(el._select(".display"));

          return el.updateComplete;
        })
        .then(() => {
          el._id("input")._emit("input-blur", {
            value: "TEXT2",
          });
        });
    });

    it("when submitOnBlur=false it does not emit input-submit event", (done) => {
      const listener = function (e) {
        assert.fail("input-submit should not be emitted");
      };
      el.addEventListener("input-submit", listener);

      el.model = "TEXT";
      el.submitOnBlur = false;
      el.updateComplete
        .then(() => {
          MockInteractions.click(el._select(".display"));

          return el.updateComplete;
        })
        .then(() => {
          el._id("input")._emit("input-blur", {
            value: "TEXT2",
          });

          return delay(300);
        })
        .then(() => {
          el.removeEventListener("input-submit", listener);
          done();
        });
    });
  });

  describe("events.keydown", () => {
    it("on Escape turns off edit mode", async () => {
      el.model = "TEXT";

      await el.updateComplete;

      MockInteractions.click(el._select(".display"));

      await el.updateComplete;

      assert.isTrue(el._editMode);
      MockInteractions.pressEscape(el._id("input")._id("input"));

      await el.updateComplete;

      assert.isFalse(el._editMode);
    });
  });
});
