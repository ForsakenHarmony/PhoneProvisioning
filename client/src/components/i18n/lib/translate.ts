import delve from "dlv";
import { defined, Obj } from "./util";
import template from "./template";
import { VNode } from "preact";

/** Attempts to look up a translated value from a given dictionary.
 *  Also supports json templating using the format: {{variable}}
 *	Falls back to default text.
 *
 *	@private
 *	@param {String} id				Intl field name/id (subject to scope)
 *	@param {String} [scope='']		Scope, which prefixes `id` with `${scope}.`
 *	@param {Object} dictionary		A nested object containing translations
 *	@param {Object} [fields={}]		Template fields for use by translated strings
 *	@param {Number} [plural]		Indicates a quantity, used to trigger pluralization
 *	@param {String|Array} [fallback]	Text to return if no translation is found
 *	@returns {String} translated
 */
export default function translate(
  id: string,
  scope?: string,
  dictionary?: Obj,
  fields: Obj = {},
  plural?: number,
  fallback?: VNode<any> | null
): VNode<any> | null {
  if (scope) id = scope + "." + id;

  let value = dictionary && delve(dictionary, id);

  // plural forms:
  // key: ['plural', 'singular']
  // key: { none, one, many }
  // key: { singular, plural }
  if ((plural || plural === 0) && value && typeof value === "object") {
    if (value.splice) {
      value = value[plural] || value[0];
    } else if (plural === 0 && defined(value.none)) {
      value = value.none;
    } else if (plural === 1 && defined(value.one || value.singular)) {
      value = value.one || value.singular;
    } else {
      value = value.some || value.many || value.plural || value.other || value;
    }
  }

  return ((value && template(value, fields)) || fallback || null) as VNode<
    any
  > | null;
}
