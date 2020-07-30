module.exports = {
  corePlugins: {
    preflight: true,
    container: true,
    appearance: false,
    backgroundAttachment: false,
    backgroundColor: true,
    backgroundPosition: false,
    backgroundRepeat: false,
    backgroundSize: false,
    borderCollapse: false,
    borderColor: true,
    borderRadius: false,
    borderStyle: false,
    borderWidth: true,
    cursor: true,
    display: true,
    flexDirection: true,
    flexWrap: true,
    alignItems: true,
    alignSelf: false,
    justifyContent: true,
    alignContent: false,
    flex: true,
    flexGrow: true,
    flexShrink: false,
    float: true,
    fontFamily: false,
    height: true,
    lineHeight: true,
    listStylePosition: false,
    listStyleType: false,
    maxHeight: false,
    maxWidth: true,
    minHeight: false,
    minWidth: true,
    negativeMargin: false,
    objectFit: false,
    objectPosition: false,
    order: true,
    opacity: true,
    outline: true,
    overflow: true,
    placeholderColor: false,
    pointerEvents: false,
    position: true,
    inset: true,
    resize: false,
    boxShadow: false,
    fill: false,
    stroke: false,
    tableLayout: false,
    textAlign: true,
    textColor: true,
    fontStyle: true,
    textTransform: true,
    textDecoration: true,
    fontSmoothing: false,
    letterSpacing: false,
    userSelect: true,
    verticalAlign: false,
    visibility: false,
    whitespace: true,
    wordBreak: true,
    width: true,
    zIndex: true,
  },
  theme: {
    // Some useful comment
    extend: {
      colors: {
        error: "var(--bt-error-color, red)",
        link: "var(--bt-link-color, #00A1DE)",
        lightgray: "lightgray",
      },
    },
  },
  variants: {
    // Some useful comment
    backgroundColor: ["hover"],
    borderColor: [],
    borderWidth: ["responsive"],
    container: [],
    cursor: [],
    display: ["responsive"],
    fontSize: [],
    fontWeight: [],
    flexGrow: [],
    flexWrap: [],
    float: [],
    fontStyle: [],
    height: [],
    inset: [],
    lineHeight: [],
    margin: ["responsive"],
    maxWidth: ["responsive"],
    minWidth: [],
    padding: ["responsive"],
    placeholderColor: [],
    order: ["responsive"],
    overflow: [],
    opacity: [],
    position: [],
    textColor: [],
    textAlign: ["responsive"],
    textTransform: [],
    textDecoration: ["hover"],
    userSelect: [],
    whitespace: [],
    width: ["responsive"],
    wordBreak: [],
    zIndex: [],
  },
  plugins: [
    // Some useful comment
  ],
  purge: {
    content: ["./src/components/**/*.js", "./src/util/*.js", "./src/*.js"],
  },
};
