import { assign, select } from "./util";
import translate from "./translate";
import { Text } from "../components/text";
import { toChildArray } from "preact";

/** Translates the property values in an Object, returning a copy.
 *	**Note:** By default, `String` keys will be treated as Intl ID's.
 *	Pass `true` to return an Object containing *only* translated
 *	values where the prop is a <Text /> node.
 *
 *	@private
 *	@param {Object} props	An object with values to translate
 *	@param {Object} intl	An intl context object (eg: `context.intl`)
 *	@param {Boolean} [onlyTextNodes=false]	Only process `<Text />` values
 *	@returns {Object} translatedProps
 */
export default function translateMapping(props, intl, onlyTextNodes) {
  let out = {};
  intl = intl || {};
  props = select(props);
  for (let name in props) {
    if (props.hasOwnProperty(name) && props[name]) {
      let def = props[name];

      // if onlyTextNodes=true, skip any props that aren't <Text /> vnodes
      if (!onlyTextNodes && typeof def === "string") {
        out[name] = translate(def, intl.scope, intl.dictionary);
      } else if (def.type === Text) {
        // it's a <Text />, just grab its props:
        let c = toChildArray(def.props.children);
        def = assign(
          {
            //no fallback if there are no children.  Return first child if there is only 1, or array of children if there are more than one
            fallback: c.length && (c.length === 1 ? c[0] : c)
          },
          def.props
        );
        out[name] = translate(
          def.id,
          intl.scope,
          intl.dictionary,
          def.fields,
          def.plural,
          def.fallback
        );
      }
    }
  }
  return out;
}
