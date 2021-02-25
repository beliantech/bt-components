import { html } from "lit-element";

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

  <bt-input label="Label" description="Description"></bt-input>

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
  radio.label = "Label";
  radio.description = "Description";
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
  radio.label = "Label";
  radio.description = "Description";
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
  <bt-icon button muted>settings</bt-icon>
  <div style="background-color: black; color: white; padding: 1rem;">
  <bt-icon button button-light>settings</bt-icon>
  </div>
  <bt-icon popup>
    add
    <div class="p-1" slot="popup">Booyah</div>
  </bt-icon>
  <bt-icon popup popup-left>
    add
    <div class="p-1" slot="popup">Booyah</div>
  </bt-icon>

  <bt-icon button tooltip="Foo Bar Long Tooltip">
    navigate_before
  </bt-icon>
  <bt-icon button tooltip="Foo Bar Long Tooltip" tooltip-right>
    navigate_before
  </bt-icon>
  <bt-icon button tooltip="Foo Bar Long Tooltip" tooltip-left>
    navigate_before
  </bt-icon>
  <bt-icon circle linkTo="https://beliantech.com">
    open_in_new
  </bt-icon>
  <bt-icon>visibility_on</bt-icon>
`;

export const BTButton = () => `
  <link href="https://fonts.googleapis.com/css?family=Material+Icons&display=block" rel="stylesheet">

  <bt-button>Button</bt-button>
  <bt-button icon="add">Button</bt-button>
  <bt-button
    small
    icon="add"
  >Add Label</bt-button>
  <bt-button
    icononly
    small
    icon="add"
  ></bt-button>
  <bt-button
    border
    center
    block
    icon="arrow_back"
    style="width:300px;"
    >
    <span class="truncate">Move to left</span>
  </bt-button>
  <bt-button
    border
    block
    icon="arrow_back"
    style="width:300px;"
    >
    <span class="truncate">Move to left</span>
  </bt-button>
  <bt-button
    border
    block
    left
    style="width:300px;"
    >
    <span class="truncate">Move to left</span>
  </bt-button>
  <bt-button
    border
    center
    aftericon="arrow_forward"
    >
    <span class="truncate">Move to right</span>
  </bt-button>
`;

export const BTJsonEditor = () => `
  <bt-json-editor model="const foo = 'Hello World!;'"></bt-json-editor>
`;

export const BTForm = () => {
  const form = document.createElement("bt-form");

  form.customFieldsFunc = function () {
    return {
      radio: (model, field, form) => {
        return html`<bt-radio
          id=${field.id}
          .model=${model}
          .options=${field.options}
          .label=${field.label}
          @model-change=${form.onModelChange}
        ></bt-radio>`;
      },
    };
  };
  form.formSchema = {
    fields: [
      {
        id: "my_short_text",
        type: "short_text",
        label: "Short text",
      },
      {
        id: "my_radio",
        type: "radio",
        label: "Radio",
        options: [
          { id: "foo", name: "Foo" },
          { id: "bar", name: "Bar" },
        ],
      },
    ],
  };

  return form;
};

export const BTTabs = () => {
  return `<bt-tabs horizontal="left">
    <bt-tab-content title="Foo" tabid="foo" >
      <div>Foo</div>
    </bt-tab-content>
    <bt-tab-content title="Bar" tabid="bar" >
      <div>Bar</div>
    </bt-tab-content>
  </bt-tabs>`;
};

export const BTCheckbox = () => {
  return `
  <link href="https://fonts.googleapis.com/css?family=Material+Icons&display=block" rel="stylesheet">
  <bt-checkbox label="Enable"></bt-checkbox>`;
};

const multipartSchema = [
  {
    id: "name",
    type: "short_text",
    label: "Sender name",
    placeholder: "My Company",
    required: true,
  },
  {
    id: "from",
    type: "short_text",
    label: "From",
    placeholder: "support@mycompany.com",
    validateAs: "email",
    required: true,
  },
  {
    id: "to",
    type: "short_text",
    label: "To",
    placeholder: "support@mycompany.com",
    validateAs: "email",
    required: true,
  },
  {
    id: "cc",
    type: "short_text",
    label: "CC",
    placeholder: "support@mycompany.com",
    validateAs: "email",
    required: true,
    hide: true,
  },
  {
    id: "bcc",
    type: "short_text",
    label: "BCC",
    placeholder: "support@mycompany.com",
    validateAs: "email",
    required: true,
    hide: true,
  },
  {
    id: "random",
    type: "radio",
    label: "Random",
    options: [
      { id: "123", name: "Option 1" },
      { id: "234", name: "Option 2" },
    ],
    horizontal: true,
    required: true,
    hide: true,
  },
];

export const BTMultipartInput = () => {
  return `
    <bt-multipart-input schema='${JSON.stringify(
      multipartSchema
    )}' layout="horizontal"></bt-multipart-input>
    <hr/>
    <bt-multipart-input schema='${JSON.stringify(
      multipartSchema
    )}' layout="horizontal-wrap"></bt-multipart-input>
    <hr/>
    <bt-multipart-input schema='${JSON.stringify(
      multipartSchema
    )}' layout="vertical"></bt-multipart-input>
  `;
};

export const BTMultirowGroup = () => {
  const schema = multipartSchema.slice();
  schema.push({
    type: "multirow-group",
    label: "Array",
    field: {
      type: "multipart-input",
      schema: multipartSchema,
    },
    hide: true,
  });
  const field = {
    type: "multipart-input",
    schema: schema,
  };

  return `
    <link href="https://fonts.googleapis.com/css?family=Material+Icons&display=block" rel="stylesheet">
    <bt-multirow-group
      label="Multirow Group"
      description="Multirow group description"
      field='${JSON.stringify(field)}'
    ></bt-multirow-group>
  `;
};
