import { RuleTester } from '@typescript-eslint/rule-tester'
import { noColorPropRule } from './no-color-prop'
import { AST_NODE_TYPES } from '@typescript-eslint/utils'

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
})

ruleTester.run('no-color-prop', noColorPropRule, {
  valid: [
    { name: 'no props at all', code: '<Loader />' },
    { name: 'other props', code: '<Loader height="200px" />' },
    {
      name: 'new theme colour usage',
      code: '<Loader color="color.feedback.negative.100" />',
    },
    {
      name: 'non-string value with untracked variable',
      code: '<Loader color={someVar} />',
    },
    {
      name: 'ambiguous name in non-color prop',
      code: '<Loader name="cream" />',
    },
    {
      name: 'ambiguous name in non-color prop (mint)',
      code: '<Tag label="mint" />',
    },
    {
      name: 'ambiguous name x in non-color prop',
      code: '<Input placeholder="x" />',
    },
    {
      name: 'expression container with ambiguous color in non-color prop',
      code: 'const x = "cream"; const el = <Loader name={x} />',
    },
    {
      name: 'namespaced JSX attribute with legacy color is ignored',
      code: '<Loader xml:color="lollipop" />',
    },
  ],
  invalid: [
    {
      name: 'old color usage with color prop',
      code: '<Loader height="200px" color="lollipop" />',
      output: '<Loader height="200px" color="color.surface.brand.400" />',
      errors: [{ messageId: 'noColorProp', type: AST_NODE_TYPES.JSXAttribute }],
    },
    {
      name: 'old color usage with any prop name',
      code: '<Loader height="200px" backgroundColor="marshmallowPink" />',
      output:
        '<Loader height="200px" backgroundColor="color.surface.brand.300" />',
      errors: [{ messageId: 'noColorProp', type: AST_NODE_TYPES.JSXAttribute }],
    },
    {
      name: 'ambiguous name in color context',
      code: '<Loader color="cream" />',
      output: '<Loader color="color.surface.base.000" />',
      errors: [{ messageId: 'noColorProp', type: AST_NODE_TYPES.JSXAttribute }],
    },
    {
      name: 'object property with legacy color',
      code: 'const obj = { tagText: "liquorice" }',
      output: 'const obj = { tagText: "color.text.base" }',
      errors: [{ messageId: 'noColorProp', type: AST_NODE_TYPES.Property }],
    },
    {
      name: 'variable declarator with legacy color',
      code: 'const c = "liquorice"',
      output: 'const c = "color.text.base"',
      errors: [
        { messageId: 'noColorProp', type: AST_NODE_TYPES.VariableDeclarator },
      ],
    },
    {
      name: 'strictMode flags ambiguous name everywhere',
      code: '<Loader name="cream" />',
      output: '<Loader name="color.surface.base.000" />',
      options: [{ strictMode: true }],
      errors: [{ messageId: 'noColorProp', type: AST_NODE_TYPES.JSXAttribute }],
    },
    {
      name: 'additionalColorProps triggers detection for ambiguous name',
      code: '<Loader variant="mint" />',
      output: '<Loader variant="color.feedback.positive.100" />',
      options: [{ additionalColorProps: ['variant'] }],
      errors: [{ messageId: 'noColorProp', type: AST_NODE_TYPES.JSXAttribute }],
    },
    {
      name: 'single quote preservation',
      code: "<Loader color='lollipop' />",
      output: "<Loader color='color.surface.brand.400' />",
      errors: [{ messageId: 'noColorProp', type: AST_NODE_TYPES.JSXAttribute }],
    },
    {
      name: 'double quote preservation',
      code: '<Loader color="lollipop" />',
      output: '<Loader color="color.surface.brand.400" />',
      errors: [{ messageId: 'noColorProp', type: AST_NODE_TYPES.JSXAttribute }],
    },
    {
      name: 'expression container referencing variable with non-ambiguous legacy color',
      code: 'const myColor = "lollipop"; const el = <Loader color={myColor} />',
      output:
        'const myColor = "color.surface.brand.400"; const el = <Loader color={myColor} />',
      errors: [
        { messageId: 'noColorProp', type: AST_NODE_TYPES.VariableDeclarator },
        { messageId: 'noColorProp', type: AST_NODE_TYPES.JSXAttribute },
      ],
    },
    {
      name: 'expression container referencing variable with ambiguous color in color prop',
      code: 'const x = "cream"; const el = <Loader color={x} />',
      output:
        'const x = "color.surface.base.000"; const el = <Loader color={x} />',
      errors: [{ messageId: 'noColorProp', type: AST_NODE_TYPES.JSXAttribute }],
    },
    {
      name: 'non-ambiguous color in non-color prop via variable',
      code: 'const myVar = "lollipop"; const el = <Loader name={myVar} />',
      output:
        'const myVar = "color.surface.brand.400"; const el = <Loader name={myVar} />',
      errors: [
        { messageId: 'noColorProp', type: AST_NODE_TYPES.VariableDeclarator },
        { messageId: 'noColorProp', type: AST_NODE_TYPES.JSXAttribute },
      ],
    },
  ],
})
