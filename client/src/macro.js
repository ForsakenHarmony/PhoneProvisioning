const {createMacro} = require('babel-plugin-macros');
const graphql = require('graphql');

module.exports = createMacro(({ references, state, babel }) => {
  references.gql.map(referencePath => {
    if (referencePath.parentPath.type === 'TaggedTemplateExpression') {
      asTag(referencePath.parentPath.get('quasi'), state, babel)
    } else {
      throw new Error("You can only use `@pql/macro` as a tagged template expression");
    }
  });
});

function asTag(quasiPath, {file: {opts: fileOptions}}, babel) {
  const string = quasiPath.parentPath.get('quasi').evaluate().value;

  const gqlAst = graphql.parse(string);
  graphql.visit(gqlAst,{
    Field(field) {
      field.selectionSet && field.selectionSet.selections.unshift({
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "__typename",
        },
        "arguments": [],
        "directives": [],
      });
    },
  });

  const expr = `
    const x = (() => {
      const {gql} = require('@pql/client');
      return gql\`${graphql.print(gqlAst)}\`;
    })();
  `;

  const variableDeclarationNode  = babel.template(expr, {
    preserveComments: true,
    placeholderPattern: false,
    ...fileOptions.parserOpts,
    sourceType: 'module',
  })();

  const ast = variableDeclarationNode.declarations[0].init;

  quasiPath.parentPath.replaceWith(ast);
}
