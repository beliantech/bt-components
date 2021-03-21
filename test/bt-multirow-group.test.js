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
});
