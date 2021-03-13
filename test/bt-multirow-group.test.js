import { delay } from "./utils";

const ElementTag = "bt-multirow-group";

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
    el.field = {
      schema: [
        {
          id: "name",
          type: "short_text",
        },
      ],
    };
    el.model = [{ name: "Jonathan" }, { name: "James" }];
  };

  it("sets and gets model correctly", async () => {
    setupTestData();
    await el.updateComplete;

    assert.deepEqual(el.model, [{ name: "Jonathan" }, { name: "James" }]);
  });

  describe("static rows", () => {
    it("displays rows according to .rows", async () => {
      el.field = {
        type: "multipart_input",
        schema: [
          {
            id: "myid",
            type: "hidden",
          },
          {
            id: "name",
            type: "short_text",
          },
        ],
      };
      el.rows = [
        { label: "Foo", modelId: "myid", modelValue: "234" },
        { label: "Bar", modelId: "myid", modelValue: "123" },
      ];
      el.model = [
        { myid: "123", name: "Jonathan" },
        { myid: "234", name: "James" },
      ];

      await delay();

      // The first multipart input should be following .rows
      assert.deepEqual(el._select("bt-multipart-input").model, {
        myid: "234",
        name: "James",
      });

      // Type something into first row
      var event = new Event("input", {
        bubbles: true,
        cancelable: true,
      });
      el._select("bt-multipart-input")
        ._select("bt-input")
        .inputEl.dispatchEvent(event);

      await delay();

      assert.deepEqual(el.model, [
        {
          myid: "123",
          name: "Jonathan",
        },
        {
          myid: "234",
          name: "James",
        },
      ]);
    });
  });
});
