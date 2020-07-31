export function urlify(text) {
  if (!text) return text;
  if (text.replace == null) return text;

  var urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(
    urlRegex,
    (url) => `<a class="text-link" href="${url}" target="_blank">${url}</a>`
  );
}
