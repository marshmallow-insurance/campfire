import { ESLintUtils } from '@typescript-eslint/utils'

const COLOR_KEYS = [
  'lollipop',
  'marshmallowPink',
  'bubblegum',
  'fairyFloss',
  'boba',
  'liquorice',
  'sesame',
  'chia',
  'custard',
  'mascarpone',
  'coconut',
  'cream',
  'spearmint',
  'feijoa',
  'blueberry',
  'macaroon',
  'pistachio',
  'matcha',
  'caramel',
  'peanut',
  'marzipan',
  'oatmeal',
  'satsuma',
  'strawberry',
  'watermelon',
  'apple',
  'mint',
  'lemon',
  'sherbert',
  'tangerine',
  'compareTheMarket',
  'confused',
  'onfido',
  'x',
  'premfina',
  'checkout',
  'meta',
  'stripe',
  'intercom',
  'ravelin',
  'rac',
  'hometree',
]

export const noColorPropRule = ESLintUtils.RuleCreator((name) => `${name}`)({
  name: 'no-color-prop',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow Color props (any prop) on design system components',
    },
    messages: {
      noColorProp:
        'Passing a design-system `Color` ("{{val}}") as a prop is deprecated. Use styled-components theme tokens instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.value?.type === 'Literal') {
          const val = String(node.value.value)
          if (COLOR_KEYS.includes(val)) {
            context.report({
              node,
              messageId: 'noColorProp',
              data: { val },
            })
          }
        }
      },
    }
  },
})
