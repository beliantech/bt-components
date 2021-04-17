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
    it("shows checked", async () => {
      el.model = true;
      await el.updateComplete;
      assert.ok(el._id("input").checked);
      assert.ok(el.model);
    });

    it("shows unchecked", async () => {
      el.model = false;
      await el.updateComplete;
      assert.notOk(el._id("input").checked);
      assert.notOk(el.model);
    });

    it("updates on programmatic update (from true to false)", async () => {
      el.model = true;
      await el.updateComplete;

      assert.ok(el._id("input").checked);
      assert.ok(el.model);

      el.model = false;
      await el.updateComplete;

      assert.notOk(el._id("input").checked);
      assert.notOk(el.model);
    });

    it("updates on programmatic update (from false to true)", async () => {
      el.model = false;
      await el.updateComplete;

      assert.notOk(el._id("input").checked);
      assert.notOk(el.model);

      el.model = true;
      await el.updateComplete;

      assert.ok(el._id("input").checked);
      assert.ok(el.model);
    });
  });
});
