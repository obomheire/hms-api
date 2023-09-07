export const flattenObject = (
  obj: Record<string, unknown> | [],
  parentKey = '',
): Record<string, unknown> => {
  if (parentKey !== '') {
    parentKey += ' ';
  }
  const flattened = {};
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(flattened, flattenObject(obj[key], parentKey + key));
    } else {
      flattened[parentKey + key] = obj[key];
    }
  });
  return flattened;
};
