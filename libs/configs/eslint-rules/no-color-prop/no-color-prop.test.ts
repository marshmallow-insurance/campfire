import { RuleTester } from '@typescript-eslint/rule-tester'
import { noColorPropRule } from './no-color-prop'

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
  ],
  invalid: [
    {
      name: 'old color usage with color prop',
      code: '<Loader height="200px" color="lollipop" />',
      errors: [{ messageId: 'noColorProp' }],
    },
    {
      name: 'old color usage with any prop name',
      code: '<Loader height="200px" backgroundColor="marshmallowPink" />',
      errors: [{ messageId: 'noColorProp' }],
    },
  ],
})
