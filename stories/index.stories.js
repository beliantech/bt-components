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
