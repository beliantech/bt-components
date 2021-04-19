import { changeSelectValue, delay } from "./utils";

describe("bt-select", () => {
  let container;
  let el;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);

    el = document.createElement("bt-select");
    container.appendChild(el);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe("rendering options", () => {
    it("renders options, including a placeholder by default", async () => {
      el.options = [
        { id: "123", name: "Option 1" },
        { id: "234", name: "Option 2" },
        { id: "345", name: "Option 3" },
        { id: "456", name: "Option 4" },
      ];

      await el.updateComplete;
      assert.equal(el._id("select").value, "");
      assert.equal(el.model, "");
      assert.equal(el._selectAll("option").length, 5);
    });

    it("renders model as the option id", async () => {
      el.model = "123";
      el.options = [
        { id: "123", name: "Option 1" },
        { id: "234", name: "Option 2" },
        { id: "345", name: "Option 3" },
        { id: "456", name: "Option 4" },
      ];

      await el.updateComplete;

      const selectedOption = el._select('option[selected=""]');

      assert.ok(selectedOption);
      assert.equal(selectedOption.value, "123");
    });

    it("resets option to blank when model is empty", async () => {
      el.model = "123";
      el.options = [{ id: "123", name: "Option 1" }];

      await el.updateComplete;

      el.model = "";
      await el.updateComplete;

      const selectedOption = el._select('option[selected=""]');
      assert.isNull(selectedOption);
    });

    it("renders placeholder as an option with empty value", async () => {
      el.placeholder = "Select an option";
      el.options = [
        { id: "123", name: "Option 1" },
        { id: "234", name: "Option 2" },
        { id: "345", name: "Option 3" },
        { id: "456", name: "Option 4" },
      ];

      await el.updateComplete;

      const selectedOption = el._select("option");

      assert.strictEqual(selectedOption.value, "");
      assert.equal(selectedOption.innerText, "Select an option");
    });

    it("renders non-existent option if no model match, retaining model", async () => {
      el.placeholder = "Select an option";
      el.options = [
        { id: 123, name: "Option 1" },
        { id: 234, name: "Option 2" },
        { id: 345, name: "Option 3" },
        { id: 456, name: "Option 4" },
      ];
      el.model = "abcd";

      await el.updateComplete;

      let selectedOption = el._select(`option[selected=""]`);
      assert.strictEqual(selectedOption.value, "abcd");
      assert.equal(selectedOption.innerText, "(invalid option)");
      assert.equal(el.model, "abcd");

      el.model = "123";
      await el.updateComplete;

      // Last option should not be invalid
      selectedOption = el._select(`option:last-child`);
      assert.strictEqual(selectedOption.value, "456");
      assert.equal(selectedOption.innerText, "Option 4");
      assert.equal(el.model, "123");

      selectedOption = el._select(`option[selected=""]`);
      assert.strictEqual(selectedOption.value, "123");
    });
  });

  describe("validation", () => {
    context("props.required = true", () => {
      it("returns false if no value selected", async () => {
        el.required = true;

        await el.updateComplete;
        assert.isNotOk(el.validate());
      });

      it("returns true if value selected", async () => {
        el.options = [
          { id: "123", name: "Option 1" },
          { id: "234", name: "Option 2" },
        ];
        el.required = true;

        await el.updateComplete;
        changeSelectValue(el._id("select"), "234");

        await el.updateComplete;
        assert.isOk(el.validate());
      });

      it("emits errors-change on validation", async () => {
        el.required = true;
        el.options = [
          { id: "123", name: "Option 1" },
          { id: "234", name: "Option 2" },
        ];
        el.id = "some-id";

        const errorsChangeSpy = sinon.spy();
        el.addEventListener("errors-change", errorsChangeSpy);

        await el.updateComplete;

        el.validate();

        assert.strictEqual(errorsChangeSpy.callCount, 1);
        assert.deepEqual(errorsChangeSpy.getCall(0).args[0].detail, {
          id: "some-id",
          errors: ["required"],
        });
      });
    });

    context("props.required = false", () => {
      it("returns true if no value selected", async () => {
        el.required = false;

        await el.updateComplete;
        assert.isOk(el.validate());
      });
    });
  });

  describe("events.changed from select", () => {
    it("updates the model", async () => {
      el.options = [
        { id: "123", name: "Option 1" },
        { id: "234", name: "Option 2" },
      ];

      await el.updateComplete;

      changeSelectValue(el._id("select"), "234");

      await el.updateComplete;
      assert.equal(el.model, "234");
    });

    it("emits model-change event", (done) => {
      const listener = (e) => {
        assert.ok(e);
        assert.isFalse(e.composed);

        el.removeEventListener("model-change", listener);
        done();
      };
      el.addEventListener("model-change", listener);

      el.options = [
        { id: "123", name: "Option 1" },
        { id: "234", name: "Option 2" },
      ];
      el.updateComplete.then(() => {
        changeSelectValue(el._id("select"), "234");
      });
    });

    context("props.required = true", () => {
      it("displays and removes error message", async () => {
        el.required = true;
        el.options = [
          { id: "123", name: "Option 1" },
          { id: "234", name: "Option 2" },
        ];

        await el.updateComplete;

        el.validate();

        await el.updateComplete;

        assert.isNotNull(el._select(".text-error"));

        changeSelectValue(el._id("select"), "234");

        await el.updateComplete;

        assert.isNull(el._select(".text-error"));
      });
    });
  });

  describe("filterable=true,multiselect=false", () => {
    it("returns a single model", async () => {
      el.options = [
        { id: "123", name: "Option 1" },
        { id: "234", name: "Option 2" },
      ];
      el.filterable = true;

      await delay();
      MockInteractions.focus(el._id("filterable")._id("input"));
      await delay();
      MockInteractions.click(el._id("filterable")._id("scroller").children[0]);

      await el.updateComplete;
      assert.equal(el.model, "123");
    });
  });

  describe("filterable=true,multiselect=true", () => {
    it("returns an array model", async () => {
      el.options = [
        { id: "123", name: "Option 1" },
        { id: "234", name: "Option 2" },
      ];
      el.filterable = true;
      el.multiselect = true;

      await delay();
      MockInteractions.focus(el._id("filterable")._id("input"));
      await delay();
      MockInteractions.click(el._id("filterable")._id("scroller").children[0]);

      await el.updateComplete;
      assert.deepEqual(el.model, ["123"]);
    });
  });

  describe("filterable=false,multiselect=true", () => {
    it("returns empty array model by default", async () => {
      el.options = [
        { id: "123", name: "Option 1" },
        { id: "234", name: "Option 2" },
      ];
      el.filterable = false;
      el.multiselect = true;

      await el.updateComplete;
      assert.deepEqual(el.model, []);
    });

    it("setting model to empty returns empty array", async () => {
      el.options = [
        { id: "123", name: "Option 1" },
        { id: "234", name: "Option 2" },
      ];
      el.filterable = false;
      el.multiselect = true;

      await el.updateComplete;

      el.model = null;
      await el.updateComplete;
      assert.deepEqual(el.model, []);
    });

    it("returns the model it was given", async () => {
      el.options = [
        { id: "123", name: "Option 1" },
        { id: "234", name: "Option 2" },
      ];
      el.filterable = false;
      el.multiselect = true;
      el.model = ["123"];

      await el.updateComplete;
      assert.deepEqual(el.model, ["123"]);
    });

    it("returns empty array model when all unchecked", async () => {
      el.options = [
        { id: "123", name: "Option 1" },
        { id: "234", name: "Option 2" },
      ];
      el.filterable = false;
      el.multiselect = true;
      el.model = ["123"];

      await delay();
      MockInteractions.focus(el._id("filterable")._id("input"));
      await delay();
      MockInteractions.click(el._id("filterable")._id("scroller").children[0]);

      await el.updateComplete;
      assert.deepEqual(el.model, []);
    });
  });
});
