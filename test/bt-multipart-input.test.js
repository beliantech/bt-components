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
    el.model = {
      name: "Jonathan",
      email: "hello@beliantech.com",
    };
  };

  it("sets and gets model correctly", async () => {
    setupTestData();
    await el.updateComplete;

    assert.deepEqual(el.model, {
      name: "Jonathan",
      email: "hello@beliantech.com",
    });
  });

  it("sets underlying models", async () => {
    setupTestData();
    await el.updateComplete;

    const btInput = el._selectAll("bt-input");
    assert.strictEqual(btInput[0].model, "Jonathan");
    assert.strictEqual(btInput[1].model, "hello@beliantech.com");
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
    el.model = {
      name: "",
      email: "hello@beliantech.com",
    };
    await delay();

    assert.strictEqual(el.validate(), false);
  });

  describe("hidden fields", () => {
    it("adds 'Show more' link when there are hidden fields", async () => {
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
          hide: true,
        },
      ];
      el.model = {
        name: "Jonathan",
        email: "hello@beliantech.com",
      };
      await delay();

      assert.strictEqual(el._id("show").textContent, "Show more");
    });

    it("shows 'Show less' link when hidden fields are displayed", async () => {
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
          hide: true,
        },
      ];
      el.model = {
        name: "Jonathan",
        email: "hello@beliantech.com",
      };

      await delay();
      MockInteractions.click(el._id("show"));
      await el.updateComplete;

      assert.strictEqual(el._id("show").textContent, "Show less");
    });

    it("hides 'Show more' link when there are no hidden fields", async () => {
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
      el.model = {
        name: "Jonathan",
        email: "hello@beliantech.com",
      };
      await delay();

      assert.isNull(el._id("show"));
    });
  });
});