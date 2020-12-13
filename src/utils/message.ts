export function replacOrmMessageTokens(
  message: string,
  args: { type?: string; catchErrFunc?: string },
): string {
  const regExps = [/\$type\([\w:\s,'"]*(\))/g];
  const typeMatch = message.match(regExps[0]);
  let typeOptions: Map<string, any>;

  if (typeMatch?.length !== undefined && typeMatch?.length >= 1) {
    for (const match of typeMatch) {
      typeOptions = getStringMessageOptions(match);
    }
  }

  if (args.type) {
    message = message.replace(/\$type/g, args.type);
  }

  if (args.catchErrFunc) {
    message = message.replace(/\$catchErrFunc/g, args.catchErrFunc);
  }

  return message;
}

export function getStringMessageOptions(message: string): Map<string, any> {
  const optionRegEx = /\([\w:\s,'"]*(\))/g;
  let options: Map<string, any> = new Map();

  const match = message.match(optionRegEx);
  if (match?.length === 1) {
    options = JSON.parse(match[0].replace("(", "{").replace(")", "}"));
  }
  return options;
}
