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
  <link href="https://fonts.googleapis.com/css?family=Material+Icons&display=block" rel="stylesheet">

  <bt-input></bt-input>

  <bt-input model="Model" displaymode clicktoedit></bt-input>

  <bt-input model="https://beliantech.com" displaymode clicktoedit></bt-input>

  <bt-input inline></bt-input>

  <bt-input type="richtext"></bt-input>
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

export const BTIcon = () => `
  <link href="https://fonts.googleapis.com/css?family=Material+Icons&display=block" rel="stylesheet">

  <bt-icon>navigate_before</bt-icon>
  <bt-icon xsmall>navigate_before</bt-icon>
  <bt-icon small>navigate_before</bt-icon>
  <bt-icon medium>navigate_before</bt-icon>
  <bt-icon large>navigate_before</bt-icon>
  <bt-icon large>navigate_before</bt-icon>

  <bt-icon>
    settings
    <div class="absolute right-0" slot="dropdown">Dropdown</div>
  </bt-icon>
  <bt-icon button tooltip="Foo Bar Long Tooltip">
    navigate_before
  </bt-icon>
  <bt-icon circle linkTo="https://beliantech.com">
    open_in_new
  </bt-icon>
`;

export const BTButton = () => `
  <link href="https://fonts.googleapis.com/css?family=Material+Icons&display=block" rel="stylesheet">

  <bt-button>Button</bt-button>
  <bt-button icon="add">Button</bt-button>
`;

export const BTJsonEditor = () => `
  <bt-json-editor model="const foo = 'Hello World!;'"></bt-json-editor>
`;
