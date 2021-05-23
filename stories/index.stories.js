import { html, render } from "lit-html";

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
  <bt-input label="Label" description="Description"></bt-input>

  <bt-input model="Model" displaymode clicktoedit></bt-input>

  <bt-input model="https://beliantech.com" displaymode clicktoedit></bt-input>

  <bt-input inline></bt-input>

  <bt-input type="richtext"></bt-input>

  <bt-input label="Portal ID" validateregex="^[a-z]+(-[a-z]+)*[a-z]$"></bt-input>
`;

export const BTInlineInput = () =>
  '<bt-inline-input model="Text"></bt-inline-input>';

export const BTSelect = () => {
  const options = [
    { id: "123", name: "Option 1", template: html`<div>Option 1</div>` },
    { id: "234", name: "Option 2", template: html`<div>Option 2</div>` },
    { id: "345", name: "Option 3", template: html`<div>Option 3</div>` },
    { id: "456", name: "Option 4", template: html`<div>Option 4</div>` },
  ];
  // TODO: Hack to get lit-html working
  const renderer = () => {
    return html`
      <bt-select .options=${options}></bt-select>
      <div style="height:1rem;"></div>
      <bt-select .options=${options} filterable></bt-select>
      <div style="height:1rem;"></div>
      <bt-select .options=${options} multiselect></bt-select>
    `;
  };
  setTimeout(() => {
    render(renderer(), document.getElementById("container"));
  }, 100);

  return `
    <link
      href="https://fonts.googleapis.com/css?family=Material+Icons&display=block"
      rel="stylesheet"
    />
    <div id="container"></div>
  `;
};

export const BTRadio = () => {
  const options = [
    { id: "123", name: "Option 1" },
    { id: "234", name: "Option 2" },
    { id: "345", name: "Option 3" },
    { id: "456", name: "Option 4" },
  ];
  return `
    <bt-radio label="Label" description="Description"
      options='${JSON.stringify(options)}'></bt-radio>

    <div style="height:1rem;"></div>

    <bt-radio label="Label" description="Description" horizontal
      options='${JSON.stringify(options)}'></bt-radio>
  `;
};

export const BTSlider = () => '<bt-slider label="Label"></bt-slider>';

export const BTIcon = () => `
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
  <bt-button>Button</bt-button>
  <bt-button icon="add">Button</bt-button>
  <bt-button
    small
    icon="add"
  >Add Label</bt-button>
  <bt-button
    small
    icon="content_copy"
  >Copy</bt-button>
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

export const BTProgress = () => `
  <bt-progress circle></bt-progress>
  <bt-progress linear></bt-progress>
`;

export const BTForm = () => {
  const form = document.createElement("bt-form");

  form.customFieldsFunc = function () {
    return {
      // radio: (model, field, form) => {
      //   return html`<bt-radio
      //     id=${field.id}
      //     .model=${model}
      //     .options=${field.options}
      //     .label=${field.label}
      //     @model-change=${form.onModelChange}
      //   ></bt-radio>`;
      // },
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
        id: "my_dropdown",
        type: "dropdown",
        label: "Short text",
        options: [
          { id: "foo", name: "Foo" },
          { id: "bar", name: "Bar" },
        ],
        // disabled: true,
      },
      {
        id: "my_radio",
        type: "radio",
        label: "Radio",
        options: [
          { id: "foo", name: "Foo" },
          { id: "bar", name: "Bar" },
        ],
        // disabled: true,
      },
    ],
  };
  // form.clickToEdit = true;
  // form.fieldsonly = true;
  // form.displaymode = true;

  return form;
};

export const BTTabs = () => {
  return `
  <bt-tabs horizontal="left">
    <bt-tab-content icon="unpublished" title="Foo" tabid="foo" >
      <div>Foo</div>
    </bt-tab-content>
    <bt-tab-content icon="unpublished" title="Bar" tabid="bar" >
      <div>Bar</div>
    </bt-tab-content>
  </bt-tabs>
  <div style="height:2rem;"></div>
  <bt-tabs>
    <bt-tab-content icon="unpublished" title="Foo" tabid="foo" >
      <div>Foo</div>
    </bt-tab-content>
    <bt-tab-content icon="unpublished" title="Bar" tabid="bar" >
      <div>Bar</div>
    </bt-tab-content>
  </bt-tabs>
  `;
};

export const BTCheckbox = () => {
  return `
  <bt-checkbox label="Enable"></bt-checkbox>
  <bt-checkbox></bt-checkbox>`;
};

export const BTMenu = () => {
  setTimeout(() => {
    document.getElementById("menu").menuItems = [{ text: "Edit Account" }];
    document.getElementById("menu-2").menuItems = [{ text: "Edit Account" }];
  }, 1000);
  return `
    <bt-menu id="menu" menu-left>
      <bt-icon button>more_vert</bt-icon>
    </bt-menu>
    <div style="display:flex;justify-content:flex-end;">
      <bt-menu id="menu-2" menu-right>
        <bt-icon button>more_vert</bt-icon>
      </bt-menu>
    </div>
  `;
};

const multipartSchema = [
  {
    id: "myid",
    type: "hidden",
  },
  {
    id: "read",
    type: "checkbox",
    label: "Text",
    inline: false,
    grid: 1,
  },
  {
    id: "name",
    type: "short_text",
    label: "Sender name",
    placeholder: "My Company",
    required: true,
    grid: 2,
  },
  {
    id: "from",
    type: "short_text",
    label: "From",
    placeholder: "support@mycompany.com",
    validateAs: "email",
    required: true,
    grid: 2,
  },
  {
    id: "to",
    type: "short_text",
    label: "To",
    placeholder: "support@mycompany.com",
    validateAs: "email",
    required: true,
    grid: 2,
  },
  {
    id: "drop",
    type: "dropdown",
    label: "Select",
    options: [
      { id: "123", name: "Option 1" },
      { id: "234", name: "Option 2" },
    ],
    required: true,
    grid: 2,
  },
  {
    id: "random",
    type: "radio",
    label: "Random",
    options: [
      { id: "123", name: "Option 1" },
      { id: "234", name: "Option 2" },
    ],
    required: true,
    hide: true,
    grid: 2,
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
    id: "array",
    type: "multirow_group",
    label: "Array",
    buttonText: "Add item",
    field: {
      type: "multipart_input",
      schema: multipartSchema,
    },
    hide: true,
  });
  const field = {
    type: "multipart_input",
    schema: schema,
  };
  const model = [
    { myid: "123", name: "Jon", array: [{ name: "Bob" }] },
    { myid: "234", name: "James" },
  ];

  const field2 = {
    type: "multipart_input",
    schema: multipartSchema.slice(0, -1),
    layout: "horizontal",
  };
  const rows = [
    { label: "Row 1", modelId: "myid", modelValue: "234" },
    { label: "Row 2", modelId: "myid", modelValue: "123" },
  ];

  return `
    <bt-multirow-group
      label="Multirow Group"
      description="Multirow group description"
      field='${JSON.stringify(field)}'
      model='${JSON.stringify(model)}'
    ></bt-multirow-group>
    <div style="height:1rem;"></div>
    <bt-multirow-group
      label="Table Mode"
      field='${JSON.stringify(field2)}'
      model='${JSON.stringify(model)}'
      rows='${JSON.stringify(rows)}'
    ></bt-multirow-group>
  `;
};
