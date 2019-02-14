import { TopSoftkey } from "../../entities/top-softkey";
import { Softkey } from "../../entities/softkey";
import { TopSoftkeyTypes } from "../../constants";

interface PartialTopSoftkey extends Partial<TopSoftkey> {
  type: TopSoftkeyTypes,
  label: string,
  value: string
}

export function genTopSoftkeyXml(softkeys: PartialTopSoftkey[], companyPhoneBook: PartialTopSoftkey[]) {
  const obj = {
    ...Array.from({ length: 20 }, (v, i) => i + 1)
      .map(n => ({
        [`topsoftkey${n} type`]: ""
      }))
      .reduce((acc, val) => Object.assign(acc, val), {}),
    ...softkeys.concat(companyPhoneBook)
      .map((key, i) => {
        const n = i + 1;
        return {
          [`topsoftkey${n} type`]: key.type,
          [`topsoftkey${n} label`]: key.label || "",
          [`topsoftkey${n} value`]: key.value || "",
          [`topsoftkey${n} line`]: (key.line || 0).toString()
        };
      })
      .reduce((acc, val) => Object.assign(acc, val), {})
  };

  return genConfigXml(obj);
}

export function genSoftkeyXml(softkeys: Softkey[]) {
  const obj = {
    ...Array.from({ length: 20 }, (v, i) => i + 1)
      .map(n => ({
        [`softkey${n} type`]: ""
      }))
      .reduce((acc, val) => Object.assign(acc, val), {}),
    ...softkeys
      .map((key, i) => {
        const n = i + 1;
        return {
          [`softkey${n} type`]: key.type,
          [`softkey${n} label`]: key.label || "",
          [`softkey${n} value`]: key.value || "",
          [`softkey${n} line`]: (key.line || 0).toString()
        };
      })
      .reduce((acc, val) => Object.assign(acc, val), {})
  };

  return genConfigXml(obj);
}

export function genConfigXml(obj: { [key: string]: string }) {
  const items = Object.entries(obj).map(
    ([k, v]) => `<ConfigurationItem><Parameter>${k}</Parameter><Value>${v}</Value></ConfigurationItem>`
  ).join("");

  return `xml=<AastraIPPhoneConfiguration setType="local">${items}</AastraIPPhoneConfiguration>`;
}


// function config_to_xml(phone, list = [], offset = 0) {
//
//
//   const out = {
//     ...Array.from({ length: 20 }, (v, i) => i + 1)
//       .map(n => ({
//         [`topsoftkey${n} type`]: ""
//       }))
//       .reduce((acc, val) => Object.assign(acc, val), {}),
//     ...list
//       .map((p, i) => {
//         const n = i + offset + 1;
//         return {
//           [`topsoftkey${n} type`]: "blf",
//           [`topsoftkey${n} label`]: list[i].name,
//           [`topsoftkey${n} value`]: list[i].number,
//           [`topsoftkey${n} line`]: "1"
//         };
//       })
//       .reduce((acc, val) => Object.assign(acc, val), {}),
//     ...phone.config.topsoftkeys
//       .map((key, i) => {
//         const n = i + 1;
//         return {
//           [`topsoftkey${n} type`]: key.type,
//           [`topsoftkey${n} label`]: key.label,
//           [`topsoftkey${n} value`]: key.value,
//           [`topsoftkey${n} line`]: "1"
//         };
//       })
//       .reduce((acc, val) => Object.assign(acc, val), {})
//   };
//
//   return `<AastraIPPhoneConfiguration setType="local">${Object.entries(out)
//     .map(
//       ([k, v]) =>
//         `<ConfigurationItem><Parameter>${k}</Parameter><Value>${v}</Value></ConfigurationItem>`
//     )
//     .join("")}</AastraIPPhoneConfiguration>`;
// }
