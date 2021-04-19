import { delay, typeIntoInput } from "./utils";

describe("bt-form", () => {
  let container;
  let el;
  let formSubmitSpy;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);

    el = document.createElement("bt-form");

    formSubmitSpy = sinon.spy();
    el.addEventListener("form-submit", formSubmitSpy);

    container.appendChild(el);
  });

  afterEach(() => {
    el.removeEventListener("form-submit", formSubmitSpy);
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe("props.model", () => {
    it("sets the models of the underlying fields", async () => {
      el.formSchema = {
        fields: [
          {
            id: "foo",
            name: "Foo",
            type: "short_text",
            required: false,
          },
        ],
      };
      el.model = { foo: "Test" };

      await delay();
      assert.equal(el._id("fields").children[0].model, "Test");

      el.model = { foo: "Test 1" };

      await delay();
      assert.equal(el._id("fields").children[0].model, "Test 1");
    });
  });

  describe("props.validator", () => {
    it("calls validator to validate form from the outside on submit", async () => {
      el.formSchema = {
        fields: [
          {
            id: "foo",
            name: "Foo",
            type: "short_text",
            required: false,
          },
          {
            id: "bar",
            name: "Bar",
            type: "short_text",
            required: false,
          },
        ],
      };
      el.model = { foo: "1", bar: "2" };
      el.validator = (model) => {
        if (model.foo !== model.bar) {
          return {
            bar: "Bar does not match foo!",
          };
        }
        return {};
      };

      await el.updateComplete;
      el._id("submit").click();
      assert.ok(formSubmitSpy.notCalled);
    });
  });

  describe("props.validate = false", () => {
    it("disables validation", async () => {
      el.validate = false;
      el.formSchema = {
        fields: [
          {
            id: "foo",
            name: "Foo",
            type: "number",
            required: false,
          },
          {
            id: "check",
            name: "Checklist",
            type: "checklist",
            options: [
              { id: "bar", value: 2 },
              { id: "baz", value: 3 },
            ],
            required: true,
          },
        ],
      };
      await delay();

      el._id("submit").click();
      await el.updateComplete;

      assert.ok(formSubmitSpy.calledOnce);
    });
  });

  describe("props.clickToEdit = true", () => {
    it("on submit, it updates the model", async () => {
      el.clickToEdit = true;
      el.formSchema = {
        fields: [
          {
            id: "foo",
            name: "Foo",
            type: "short_text",
            required: false,
          },
        ],
      };
      el.model = { foo: "Bar" };
      await el.updateComplete;

      typeIntoInput(el._select("bt-input").inputEl, "Baz");
      el._id("submit").click();

      await el.updateComplete;

      assert.strictEqual(el.model["foo"], "Baz");
    });
  });

  describe("props.formFocus", () => {
    it("when true focuses the first field of the form", async () => {
      el.formFocus = true;
      el.formSchema = {
        fields: [
          {
            id: "foo",
            name: "Foo",
            type: "short_text",
            required: false,
          },
        ],
      };

      // note(jon): additional delay helps to ensure test passability
      await delay(100);

      assert.ok(el.shadowRoot.activeElement);
      assert.strictEqual(
        el.shadowRoot.activeElement,
        el._id("fields").children[0]
      );
    });

    it("when false does not focus on the first field of the form", async () => {
      el.formFocus = false;
      el.formSchema = {
        fields: [
          {
            id: "foo",
            name: "Foo",
            type: "short_text",
            required: false,
          },
        ],
      };

      // note(jon): additional delay helps to ensure test passability
      await delay(100);

      assert.isNotOk(el.shadowRoot.activeElement);
      assert.equal(el.shadowRoot.activeElement, null);
    });
  });

  describe("form render", () => {
    it("passes on value of 0 to underlying number input", async () => {
      el.formSchema = {
        fields: [
          {
            id: "foo",
            name: "Foo",
            type: "number",
            required: false,
          },
        ],
      };
      el.model = { foo: 0 };

      await delay();
      assert.equal(el._select("bt-input").model, "0");
    });
  });

  it("submits the form on Enter in field, and emits output", async () => {
    el.formSchema = {
      fields: [
        {
          id: "foo",
          name: "Foo",
          type: "short_text",
          required: false,
        },
      ],
    };

    await delay();

    typeIntoInput(el._select("bt-input").inputEl, "Hello");
    MockInteractions.pressEnter(el._select("bt-input").inputEl);

    await delay();
    assert.ok(formSubmitSpy.calledOnce);
    assert.deepEqual(formSubmitSpy.getCall(0).args[0].detail.model, {
      foo: "Hello",
    });
  });

  it("submits reverts field value on cancel", async () => {
    el.formSchema = {
      fields: [
        {
          id: "foo",
          name: "Foo",
          type: "short_text",
          required: false,
        },
      ],
    };
    el.clickToEdit = true;
    el.model = { foo: "Bar" };

    await delay();
    typeIntoInput(el._select("bt-input").inputEl, "Hello");
    await delay();
    MockInteractions.pressEscape(el._select("bt-input").inputEl);
    await delay();

    assert.deepEqual(el.model, {
      foo: "Bar",
    });
    assert.equal(el._select("bt-input").model, "Bar");
  });

  it("when _disableSubmit=true does not submit the form", async () => {
    el._disableSubmit = true;
    el.formSchema = {
      fields: [
        {
          id: "step",
          name: "Step One",
          type: "step",
        },
        {
          id: "foo",
          name: "Foo",
          type: "short_text",
          required: false,
        },
      ],
    };

    await delay();

    typeIntoInput(el._select("bt-input").inputEl, "Hello");
    MockInteractions.pressEnter(el._select("bt-input").inputEl);

    await delay();
    assert.ok(formSubmitSpy.notCalled);
  });

  describe("showRules", () => {
    it("hides/shows fields according to showRules", async () => {
      el.formSchema = {
        fields: [
          {
            id: "abcd",
            name: "ABCD",
            type: "dropdown",
            options: [
              { id: "foo", name: "Foo" },
              { id: "bar", name: "Bar" },
            ],
            required: true,
          },
          {
            id: "bcde",
            name: "BCDE",
            type: "dropdown",
            options: [{ id: "123", name: "One two three" }],
            showRules: [
              {
                fieldId: "abcd",
                matches: ["foo"],
              },
            ],
            required: true,
          },
        ],
      };

      await el.updateComplete;

      assert.strictEqual(el.fields.length, 1);
      assert.strictEqual(el.fields[0].id, "abcd");

      el.model = { abcd: "foo" };
      await el.updateComplete;

      assert.strictEqual(el.fields.length, 2);
      assert.strictEqual(el.fields[0].id, "abcd");
      assert.strictEqual(el.fields[1].id, "bcde");

      el.model = { abcd: "bar" };
      await el.updateComplete;

      assert.strictEqual(el.fields.length, 1);
      assert.strictEqual(el.fields[0].id, "abcd");
    });

    it("the ANY selector will match any result except empty", async () => {
      el.formSchema = {
        fields: [
          {
            id: "abcd",
            name: "ABCD",
            type: "dropdown",
            options: [
              { id: "foo", name: "Foo" },
              { id: "bar", name: "Bar" },
            ],
            required: true,
          },
          {
            id: "bcde",
            name: "BCDE",
            type: "dropdown",
            options: [{ id: "123", name: "One two three" }],
            showRules: [
              {
                fieldId: "abcd",
                matches: ["ANY"],
              },
            ],
            required: true,
          },
        ],
      };

      await el.updateComplete;

      assert.strictEqual(el.fields.length, 1);
      assert.strictEqual(el.fields[0].id, "abcd");

      el.model = { abcd: "foo" };
      await el.updateComplete;

      assert.strictEqual(el.fields.length, 2);
      assert.strictEqual(el.fields[0].id, "abcd");
      assert.strictEqual(el.fields[1].id, "bcde");

      el.model = { abcd: "bar" };
      await el.updateComplete;

      assert.strictEqual(el.fields.length, 2);
      assert.strictEqual(el.fields[0].id, "abcd");
      assert.strictEqual(el.fields[1].id, "bcde");
    });

    it("re-renders item with showRules when field changes", async () => {
      el.formSchema = {
        fields: [
          {
            id: "abcd",
            name: "ABCD",
            type: "dropdown",
            options: [
              { id: "foo", name: "Foo" },
              { id: "bar", name: "Bar" },
            ],
            required: true,
          },
          {
            id: "bcde",
            name: "BCDE",
            type: "dropdown",
            dynamicOptions: (formModel) => {
              if (formModel.abcd === "foo")
                return [{ id: "123", name: "One two three" }];
              if (formModel.abcd === "bar")
                return [{ id: "234", name: "Two three four" }];
            },
            showRules: [
              {
                fieldId: "abcd",
                matches: ["ANY"],
              },
            ],
            required: true,
          },
        ],
      };

      await el.updateComplete;

      assert.strictEqual(el.fields.length, 1);
      assert.strictEqual(el.fields[0].id, "abcd");

      el.model = { abcd: "foo" };
      await el.updateComplete;

      assert.strictEqual(el.fields.length, 2);
      assert.strictEqual(el.fields[1].options[0].id, "123");

      el.model = { abcd: "bar" };
      await el.updateComplete;

      assert.strictEqual(el.fields.length, 2);
      assert.strictEqual(el.fields[1].options[0].id, "234");
    });
  });
});
