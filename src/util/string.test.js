import { replacePlaceholder } from "./string";

beforeEach(() => {});

afterEach(() => {});

test("replacePlaceholder", () => {
  expect(replacePlaceholder("{{foo}}", { foo: "bar" })).toBe("bar");
  expect(replacePlaceholder("{{foo}} {{bar}}", { foo: "bar" })).toBe("bar ");
  expect(
    replacePlaceholder("{{foo}} {{bar}}", { foo: "bar", bar: "baz" })
  ).toBe("bar baz");
});
