describe("bt-radio", () => {
  let container;
  let el;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);

    el = document.createElement("bt-radio");
    container.appendChild(el);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe("rendering selection", () => {
    it("renders options, including a placeholder by default", async () => {
      el.options = [
        { id: "123", name: "Option 1" },
        { id: "234", name: "Option 2" },
        { id: "345", name: "Option 3" },
        { id: "456", name: "Option 4" },
      ];

      await el.updateComplete;
      assert.equal(el.inputs.length, 4);
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

      let selectedInput = el._select('input[checked=""]');
      assert.ok(selectedInput);
      assert.equal(selectedInput.value, "123");

      el.model = "456";
      await el.updateComplete;

      selectedInput = el._select('input[checked=""]');
      assert.ok(selectedInput);
      assert.equal(selectedInput.value, "456");
    });
  });

  describe("validation", () => {
    it("returns false if no value selected", async () => {
      el.required = true;

      await el.updateComplete;
      assert.isNotOk(el.validate());
    });

    it("revalidates on input changes", async () => {
      el.required = true;
      el.options = [
        { id: "123", name: "Option 1" },
        { id: "234", name: "Option 2" },
      ];
      await el.updateComplete;

      el.validate();
      assert.strictEqual(el._errors.length, 1);

      MockInteractions.click(el._select("input"));
      await el.updateComplete;
      assert.strictEqual(el._errors.length, 0);
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

  describe("boolean mode", async () => {
    it("accepts true/false boolean as model", async () => {
      el.boolean = true;
      el.model = false;
      el.options = [
        { id: "true", name: "Yes" },
        { id: "false", name: "No" },
      ];

      await el.updateComplete;
      assert.equal(el.model, false);

      MockInteractions.click(el._select("input"));

      await el.updateComplete;
      assert.equal(el.model, true);
    });
  });

  it("updates the model on input change", async () => {
    el.options = [
      { id: "123", name: "Option 1" },
      { id: "234", name: "Option 2" },
    ];

    await el.updateComplete;

    MockInteractions.click(el._select("input"));

    await el.updateComplete;

    assert.equal(el.model, "123");
  });

  it("updates the checked radio on model change", async () => {
    el.options = [
      { id: "123", name: "Option 1" },
      { id: "234", name: "Option 2" },
    ];

    el.model = "123";
    await el.updateComplete;

    let radios = el._selectAll("input");
    assert.strictEqual(getCheckedRadioId(radios), "123");

    el.model = "234";
    await el.updateComplete;

    radios = el._selectAll("input");
    assert.strictEqual(getCheckedRadioId(radios), "234");
  });

  it("emits model-change on input changes", async () => {
    const modelChangeSpy = sinon.spy();
    el.addEventListener("model-change", modelChangeSpy);

    el.options = [
      { id: "123", name: "Option 1" },
      { id: "234", name: "Option 2" },
    ];

    await el.updateComplete;

    MockInteractions.click(el._select("input"));

    await el.updateComplete;
    assert.strictEqual(modelChangeSpy.callCount, 1);
    assert.deepEqual(modelChangeSpy.getCall(0).args[0].detail, {
      value: "123",
    });
  });
});

function getCheckedRadioId(inputs) {
  let checkedRadioId = null;
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].checked) {
      checkedRadioId = inputs[i].value;
      break;
    }
  }
  return checkedRadioId;
}
