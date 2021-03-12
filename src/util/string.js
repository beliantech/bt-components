export function pad(number) {
  if (typeof number === "string") {
    if (number.length === 1) {
      return `0${number}`;
    }
    return number;
  }

  if (number < 10) {
    return "0" + number;
  }
  return number;
}

export function replacePlaceholder(input = "", values = {}) {
  return input.replace(/{{(.*?)}}/g, function (match, p1, _offset, _string) {
    return values[p1] || "";
  });
}
