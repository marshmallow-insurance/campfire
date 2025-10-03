import { ESLintUtils } from '@typescript-eslint/utils'

export const noThemeColorsRule = ESLintUtils.RuleCreator((name) => `${name}`)({
  name: 'no-theme-colors',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow usage of theme.colors',
    },
    messages: {
      noThemeColors:
        'Usage of `theme.colors` is deprecated. Use the new styled-components theme instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      MemberExpression(node) {
        if (
          node.object.type === 'Identifier' &&
          node.object.name === 'theme' &&
          node.property.type === 'Identifier' &&
          node.property.name === 'colors'
        ) {
          context.report({ node, messageId: 'noThemeColors' })
        }
      },
    }
  },
})
