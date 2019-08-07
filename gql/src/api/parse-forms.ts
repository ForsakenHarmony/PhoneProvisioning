export type Form = {
  id: string;
  action: string;
  fields: {
    [key: string]: string;
  };
};

export function stripToContent(body: string) {
  const noHeader = body.split("<div id='content'>")[1].trim();
  return noHeader.split("</div></div><div id='footer'>")[0].trim();
}

export function parseForm(doc: string) {
  const openTags = doc.match(/<[^/]+?\/?>/g);
  if (!openTags) return [];

  const object: ({
    tagName: string;
    content: { [key: string]: string };
  })[] = (openTags.map(tag =>
    tag.match(/<(\w+)\s*(.*?)>/)
  ) as RegExpMatchArray[])
    .map(({ 1: tagName, 2: content }) => ({ tagName, content }))
    .filter(({ content }) => content.trim().replace("/", ""))
    .map(({ tagName, content: text }) => {
      const pairs = text.match(/[^\s]+?="[^"]+"/g);
      if (!pairs) return { tagName, content: {} };

      const content = (pairs.map(kv =>
        kv.match(/([^\s]+?)="([^"]+)"/)
      ) as RegExpMatchArray[])
        .map(({ 1: key, 2: value }) => ({ [key]: value }))
        .reduce((acc, val) => Object.assign(acc, val), {});
      return { tagName, content };
    });

  const { forms } = object.reduce(
    (
      acc: { forms: Form[]; active: string },
      { tagName, content: { id, action, name, value, selected, type } }
    ) => {
      let { forms, active } = acc;
      const activeForm = forms[forms.length - 1];

      const match: { [key: string]: Function } = {
        form() {
          forms.push({ id, action, fields: {} });
        },
        select() {
          active = name;
        },
        option() {
          if (selected) activeForm.fields[acc.active] = value || "";
        },
        input() {
          if (type !== "submit") activeForm.fields[name] = value || "";
        }
      };

      match[tagName] && match[tagName]();

      return { forms, active };
    },
    { forms: [], active: "" }
  );

  return forms;
}
