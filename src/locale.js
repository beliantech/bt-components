const en = {
  delete: "Delete",
  description: "Description",
  duplicate: "Duplicate",
  required: "Required",
  variant: "Variant",
  label: "Label",
  type: "Type",

  number: "Number",
  dropdown: "Dropdown",
  radio: "Radio",
  short_text: "Short Text",
  long_text: "Long Text",
  step: "Step",
  section: "Section",
};

export default function(key) {
  return en[key] || key || "";
}
