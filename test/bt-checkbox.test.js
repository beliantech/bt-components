import { delay } from "./utils";

describe("bt-checkbox", () => {
  let container;
  let el;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);

    el = document.createElement("bt-checkbox");
    container.appendChild(el);
  });

  afterEach(() => {
    container.removeChild(el);
    document.body.removeChild(container);
  });

  describe("model", () => {
    it("shows checked when true", async () => {
      el.model = true;
      await el.updateComplete;
      assert.ok(el._id("input").checked);
      assert.ok(el.model);
    });

    it("shows unchecked when false", async () => {
      el.model = false;
      await el.updateComplete;
      assert.notOk(el._id("input").checked);
      assert.notOk(el.model);
    });

    it("shows indeterminate when null", async () => {
      el.model = null;
      await delay();
      assert.notOk(el._id("input").checked);
      assert.ok(el._select(".i")); // indeterminate state
      assert.strictEqual(el.model, null);
    });

    it("updates on programmatic update (from true to false)", async () => {
      // Trigger indeterminate
      el.model = null;

      el.model = true;
      await el.updateComplete;

      assert.notOk(el._select(".i")); // not indeterminate state
      assert.ok(el._id("input").checked);
      assert.ok(el.model);

      el.model = false;
      await el.updateComplete;

      assert.notOk(el._select(".i")); // not indeterminate state
      assert.notOk(el._id("input").checked);
      assert.notOk(el.model);
    });

    it("updates on programmatic update (from false to true)", async () => {
      // Trigger indeterminate
      el.model = null;

      el.model = false;
      await el.updateComplete;

      assert.notOk(el._select(".i")); // not indeterminate state
      assert.notOk(el._id("input").checked);
      assert.notOk(el.model);

      el.model = true;
      await el.updateComplete;

      assert.notOk(el._select(".i")); // not indeterminate state
      assert.ok(el._id("input").checked);
      assert.ok(el.model);
    });
  });
});
