// /[{][\W]*[A-z:,"\s`\[\]-]*[}],?/g, ""

const testString = `[
    {
      name: "Index",
      "text": "['postalCode', 'streetAddress']",
    },
    {
      name: "Unique",
      text: \`"check-unique-address", ["postalCode", "streetAddress"]\`,
    },
]`

const newString = `[
    {
      "name": "Index",
      "text": "['postalCode', 'streetAddress']"},
    {
      "name": "Unique",
      "text": "'check-unique-address', ['postalCode', 'streetAddress']"},
  ]`

var jsonStr = testString.replace(/(\w+:)|(\w+ :)/g, (s) => {
  return '"' + s.substring(0, s.length - 1) + '":';
}).replace(/[`][\W]*[A-z:,"'\s`\[\]-]*[`]/g, (str) => {
  return str.replace(/["]/g, `'`).replace(/[`]/g, `"`)
}).replace(/(,)([\W])*(})/g, "}").replace(/(})(,)([\W])(])/g, "}]")


console.log(jsonStr)
console.log(JSON.parse(jsonStr))
