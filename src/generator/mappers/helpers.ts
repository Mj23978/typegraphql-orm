export function pushListUnique<T>(list: T[], ...items: T[]) {
  items.forEach(item => {
    const found = list.find(v => v === item);
    if (found === undefined) {
      list.push(...items);
    }
  })
}

export function filterList<T>(input: T[], filter: T[]): T[] {
  return input.filter(v => {
    if (filter.includes(v)) {
      return true;
    }
    return false;
  });
}