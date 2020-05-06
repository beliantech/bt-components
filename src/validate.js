export function isEmail(email) {
  return email.match(/.{1,}@.{1,}\..{1,}/) != null;
}
