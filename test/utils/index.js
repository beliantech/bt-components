export function delay(timeout = 5) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

export function typeIntoInput(input, text) {
  input.value = text;
  input.dispatchEvent(new InputEvent("input"));
}

export function changeSelectValue(select, value) {
  select.value = value;
  select.dispatchEvent(new InputEvent("change"));
}
