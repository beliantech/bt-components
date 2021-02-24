import { delay } from "./utils";

const ElementTag = "bt-multipart-input";

describe(ElementTag, () => {
  let container;
  let el;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);

    el = document.createElement(ElementTag);
    container.appendChild(el);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  const setupTestData = () => {
    el.schema = [
      {
        id: "name",
        type: "short_text",
      },
      {
        id: "email",
        type: "short_text",
      },
    ];
    el.model = [
      {
        id: "name",
        value: "Jonathan",
      },
      {
        id: "email",
        value: "hello@beliantech.com",
      },
    ];
  };

  it("sets and gets model correctly", async () => {
    setupTestData();
    await el.updateComplete;

    assert.deepEqual(el.model, [
      {
        id: "name",
        value: "Jonathan",
      },
      {
        id: "email",
        value: "hello@beliantech.com",
      },
    ]);
  });

  it("sets underlying models", async () => {
    setupTestData();
    await el.updateComplete;

    const krInputs = el._selectAll("bt-input");
    assert.strictEqual(krInputs[0].model, "Jonathan");
    assert.strictEqual(krInputs[1].model, "hello@beliantech.com");
  });

  it("has validate method that validates", async () => {
    el.schema = [
      {
        id: "name",
        type: "short_text",
        required: true,
      },
      {
        id: "email",
        type: "short_text",
        required: false,
      },
    ];
    el.model = [
      {
        id: "name",
        value: "",
      },
      {
        id: "email",
        value: "hello@beliantech.com",
      },
    ];
    await delay();

    assert.strictEqual(el.validate(), false);
  });
});
