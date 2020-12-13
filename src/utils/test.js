function replacOrmeMessageTokens(message, args) {

  const typeMatch = message.match(/\$type\([\w:\s,'"]*(\))/g)
  let typeOptions;

  if (typeMatch.length !== undefined && typeMatch.length >= 1) {
    for (const match of typeMatch) {
      typeOptions = getStringMessageOptions(match)
      console.log(typeOptions)
    }
  }
  message = message.replace(
    /\$type/g,
    args.type,
  );

  return message;
}


function getStringMessageOptions(message) {
  const optionRegEx = /\([\w:\s,'"]*(\))/g;
  let options = new Map()

  const match = message.match(optionRegEx);
  if (match !== null && match.length === 1) {
    options = JSON.parse(match[0].replace("(", "[{").replace(")", "}]"));
  }
  return options
}

replacOrmeMessageTokens("$type(\"camleCase\": true)", { type: "User" })