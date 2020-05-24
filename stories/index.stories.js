export default {
  title: "BT Components",
};

// export const Button = () => {
//   const btn = document.createElement('button');
//   btn.type = 'button';
//   btn.innerText = 'Hello Button';
//   btn.addEventListener('click', e => console.log(e));
//   return btn;
// };

export const BTInput = () => `
  <bt-input></bt-input>

  <bt-input model="Model" displaymode clicktoedit></bt-input>

  <bt-input inline></bt-input>
`;

export const BTInlineInput = () =>
  '<bt-inline-input model="Text"></bt-inline-input>';

export const BTSlider = () => '<bt-slider label="Label"></bt-slider>';

export const BTRadio = () => {
  const radio = document.createElement("bt-radio");
  radio.options = [
    { id: "123", name: "Option 1" },
    { id: "234", name: "Option 2" },
    { id: "345", name: "Option 3" },
    { id: "456", name: "Option 4" },
  ];
  return radio;
};

export const BTRadioHorizontal = () => {
  const radio = document.createElement("bt-radio");
  radio.options = [
    { id: "123", name: "Option 1" },
    { id: "234", name: "Option 2" },
    { id: "345", name: "Option 3" },
    { id: "456", name: "Option 4" },
  ];
  radio.horizontal = true;
  return radio;
};
