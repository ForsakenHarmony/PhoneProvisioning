export type Obj = { [k: string]: any };

/** Check if an object is not null or undefined
 *	@private
 */
export function defined(obj: any) {
  return obj !== null && obj !== undefined;
}

/** A simpler Object.assign
 *  @private
 */
export function assign(obj: Obj, props: Obj) {
  for (let i in props) {
    obj[i] = props[i];
  }
  return obj;
}

/** Recursively copy keys from `source` to `target`, skipping truthy values already in `target`.
 *	@private
 */
export function deepAssign(target: Obj, source: Obj) {
  let out = assign({}, target);
  for (let i in source) {
    if (source.hasOwnProperty(i)) {
      if (
        target[i] &&
        source[i] &&
        typeof target[i] === "object" &&
        typeof source[i] === "object"
      ) {
        out[i] = deepAssign(target[i], source[i]);
      } else {
        out[i] = target[i] || source[i];
      }
    }
  }
  return out;
}

/** select('foo,bar') creates a mapping: `{ foo, bar }`
 *	@private
 */
export function select(properties: Obj | string | null) {
  properties = properties || {};
  if (typeof properties === "string") {
    properties = properties.split(",");
  }
  if ("join" in properties) {
    let selected: Obj = {};
    for (let i = 0; i < properties.length; i++) {
      let val = properties[i].trim();
      if (val) selected[val.split(".").pop()] = val;
    }
    return selected;
  }
  return properties;
}
