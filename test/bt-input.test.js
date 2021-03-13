import { delay } from "./utils";

describe("bt-input", () => {
  let container;
  let el;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);

    el = document.createElement("bt-input");
    container.appendChild(el);
  });

  afterEach(() => {
    container.removeChild(el);
    document.body.removeChild(container);
  });

  describe("props.type = 'input'", () => {
    it("input element exists", async () => {
      await el.updateComplete;
      assert.ok(el.shadowRoot.querySelector("input"));
    });
  });

  describe("props.type = 'textarea'", () => {
    it("textarea element exists", async () => {
      el.type = "textarea";

      await el.updateComplete;
      assert.ok(el._select("textarea"));
      assert.equal(el._select("textarea").value, "");
    });

    it("textarea element is adjustable by default", async () => {
      el.type = "textarea";

      await el.updateComplete;
      assert.strictEqual(el._select("textarea").style.resize, "vertical");
    });

    it("textarea element is not adjustable is adjustable=false", async () => {
      el.type = "textarea";
      el.adjustable = false;

      await el.updateComplete;

      assert.strictEqual(el._select("textarea").style.resize, "none");
    });

    it("textarea element expands automatically when expandable=true", async () => {
      el.type = "textarea";
      el.expandable = true;
      el.model = `Supercalifragilisticexpialidocious Supercalifragilisticexpialidocious Supercalifragilisticexpialidocious Supercalifragilisticexpialidocious Supercalifragilisticexpialidocious Supercalifragilisticexpialidocious Supercalifragilisticexpialidocious Supercalifragilisticexpialidocious Supercalifragilisticexpialidocious Supercalifragilisticexpialidocious Supercalifragilisticexpialidocious Supercalifragilisticexpialidocious
        Supercalifragilisticexpialidocious Supercalifragilisticexpialidocious Supercalifragilisticexpialidocious Supercalifragilisticexpialidocious Supercalifragilisticexpialidocious Supercalifragilisticexpialidocious Supercalifragilisticexpialidocious Supercalifragilisticexpialidocious Supercalifragilisticexpialidocious Supercalifragilisticexpialidocious Supercalifragilisticexpialidocious Supercalifragilisticexpialidocious`;

      await el.updateComplete;
      await delay(); // wait for autosize in setTimeout

      // Just check that height is set
      assert.notStrictEqual(el._select("textarea").style.height, "");
    });
  });

  describe("props.inputType = 'number'", () => {
    it("input[type='number'] element exists", async () => {
      el.inputType = "number";

      await el.updateComplete;
      assert.ok(el._select('input[type="number"]'));
    });

    it("returns a model of type number", async () => {
      el.inputType = "number";
      el.model = "2";

      await el.updateComplete;
      assert.strictEqual(el.model, 2);
      assert.equal(typeof el.model, "number");
    });

    it("setting model to non-number will try to transform to number", async () => {
      el.inputType = "number";
      el.model = "abc123";

      await el.updateComplete;
      assert.strictEqual(el.model, 123);
    });

    it("empty model should return empty", async () => {
      el.inputType = "number";
      el.model = "";

      await el.updateComplete;
      assert.strictEqual(el.model, "");
    });

    it("model value of 0 is shown", async () => {
      el.inputType = "number";
      el.model = 0;

      await el.updateComplete;
      assert.strictEqual(el.model, 0);
      assert.equal(el._select('input[type="number"]').value, "0");
    });
  });

  describe("props.model", () => {
    ["input", "textarea"].forEach((type) => {
      it(`${type}: sets the input value`, async () => {
        el.model = "Some text";
        el.type = type;

        await el.updateComplete;
        assert.equal(el._id("input").value, "Some text");

        el.model = "Some other text";

        await el.updateComplete;
        assert.equal(el._id("input").value, "Some other text");
      });

      it(`${type}: if empty it clears out input value`, async () => {
        el.model = null;
        el.type = type;

        await el.updateComplete;
        assert.equal(el._id("input").value, "");

        el.model = undefined;

        await el.updateComplete;
        assert.equal(el._id("input").value, "");
      });
    });
  });

  describe("props.annotation", () => {
    it("sets the field annotation label", async () => {
      el.annotation = "foobar";
      el.label = "Foo";

      await el.updateComplete;

      assert.isTrue(
        el._select("bt-field")._select("label").textContent.indexOf("foobar") >
          0
      );
    });
  });

  // note(jon): DEPRECATED BEHAVIOUR
  // describe("props.value", () => {
  //   it("sets the initial value of the input", async () => {
  //     el.value = "Initial";
  //     await el.updateComplete;

  //     assert.equal(el._id("input").value, "Initial");

  //     el.value = "Updated";
  //     await el.updateComplete;

  //     assert.equal(el._id("input").value, "Initial");
  //   });
  // });

  describe("events.keydown", () => {
    // it("on Enter emits the model-change event", done => {
    //   const listener = e => {
    //     assert.equal(e.detail.value, "TEXT");
    //     assert.isFalse(e.composed);
    //     el.removeEventListener("model-change", listener);
    //     done();
    //   };
    //   el.addEventListener("model-change", listener);

    //   el.model = "TEXT";
    //   el.updateComplete.then(() => {
    //     MockInteractions.pressEnter(el._id("input"));
    //   });
    // });
    describe("input", () => {
      it("on Enter emits the input-submit event", (done) => {
        const listener = (e) => {
          assert.ok(e);
          assert.isFalse(e.composed);

          el.removeEventListener("input-submit", listener);
          done();
        };
        el.addEventListener("input-submit", listener);

        el.model = "TEXT";
        el.editable = false;
        el.updateComplete.then(() => {
          MockInteractions.pressEnter(el._id("input"));
        });
      });
    });

    describe("textarea", () => {
      it("on Enter DOES NOT emit the input-submit event", async () => {
        const inputSubmitSpy = sinon.spy();
        el.addEventListener("input-submit", inputSubmitSpy);

        el.model = "TEXT";
        el.type = "textarea";
        el.editable = false;
        await el.updateComplete;

        MockInteractions.pressEnter(el._id("input"));

        await el.updateComplete;

        assert.ok(inputSubmitSpy.notCalled);
      });

      it("on Enter emits the input-submit event when textareaSubmitOnEnter=true", async () => {
        const inputSubmitSpy = sinon.spy();
        el.addEventListener("input-submit", inputSubmitSpy);

        el.model = "TEXT";
        el.type = "textarea";
        el.editable = false;
        el.textareaSubmitOnEnter = true;
        await el.updateComplete;

        MockInteractions.pressEnter(el._id("input"));

        await el.updateComplete;

        assert.ok(inputSubmitSpy.calledOnce);
      });

      it("on Ctrl/Cmd+Enter emits the input-submit event", (done) => {
        const listener = (e) => {
          assert.ok(e);
          assert.isFalse(e.composed);

          el.removeEventListener("input-submit", listener);
          done();
        };
        el.addEventListener("input-submit", listener);

        el.model = "TEXT";
        el.type = "textarea";
        el.editable = false;
        el.updateComplete.then(() => {
          MockInteractions.pressAndReleaseKeyOn(
            el._id("input"),
            13,
            "ctrl",
            "Enter"
          );
        });
      });
    });
  });

  describe("props.editable is true", async () => {
    describe("events.label-change", () => {
      let labelChangeSpy;
      beforeEach(() => {
        labelChangeSpy = sinon.spy();
        el.addEventListener("label-change", labelChangeSpy);
      });
      afterEach(() => {
        el.removeEventListener("label-change", labelChangeSpy);
      });

      it("emits the label-change event", async () => {
        el.editable = true;
        el.label = "Label Name";

        await delay();

        MockInteractions.click(
          el._select("bt-field")._id("label")._select(".display")
        );

        await delay();

        MockInteractions.pressEnter(
          el
            ._select("bt-field")
            ._id("label") // kr-inline-input
            ._id("input") // kr-input
            ._id("input") // input
        );

        await delay();

        assert.equal(
          labelChangeSpy.getCall(0).args[0].detail.value,
          "Label Name"
        );
        assert.isTrue(labelChangeSpy.getCall(0).args[0].composed);
      });
    });

    describe("events.description-change", () => {
      let descriptionChangeSpy;
      beforeEach(() => {
        descriptionChangeSpy = sinon.spy();
        el.addEventListener("description-change", descriptionChangeSpy);
      });
      afterEach(() => {
        el.removeEventListener("description-change", descriptionChangeSpy);
      });

      it("emits the description-change event", async () => {
        el.editable = true;
        el.description = "Description Name";

        await delay();

        MockInteractions.click(
          el._select("bt-field")._id("description")._select(".display")
        );

        await delay();

        MockInteractions.pressEnter(
          el
            ._select("bt-field")
            ._id("description") // kr-inline-input
            ._id("input") // kr-input
            ._id("input") // input
        );

        await delay();

        assert.equal(
          descriptionChangeSpy.getCall(0).args[0].detail.value,
          "Description Name"
        );
        assert.isTrue(descriptionChangeSpy.getCall(0).args[0].composed);
      });
    });

    describe("validate", () => {
      context("props.inputType = 'text'", () => {
        it("validates required", () => {
          el.required = true;
          assert.notOk(el.validate());
        });
      });

      context("props.inputType = 'number'", () => {
        it("validates required", () => {
          el.inputType = "number";
          el.required = true;
          assert.notOk(el.validate());
        });
      });

      it("validates regex", () => {
        el.validateRegex = "[a-z]+";
        el.model = "123";
        assert.notOk(el.validate());
      });
    });
  });

  describe("events.blur", () => {
    // it("on blur emits the model-change event", done => {
    //   el.addEventListener("model-change", e => {
    //     assert.isFalse(e.composed);
    //     done();
    //   });

    //   el.updateComplete.then(() => {
    //     MockInteractions.focus(el._id("input"));
    //     MockInteractions.blur(el._id("input"));
    //   });
    // });

    ["input", "textarea"].forEach((type) => {
      it(`on ${type} blur emits the input-blur event`, (done) => {
        if (type === "textarea") {
          el.type = "textarea";
        }

        const listener = (e) => {
          assert.isTrue(e.composed);
          el.removeEventListener("input-blur", listener);
          done();
        };
        el.addEventListener("input-blur", listener);

        el.updateComplete.then(() => {
          MockInteractions.focus(el._id("input"));
          MockInteractions.blur(el._id("input"));
        });
      });
    });
  });
});
