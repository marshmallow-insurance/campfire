import { ESLintUtils } from '@typescript-eslint/utils'

const COLOR_MAP = {
  fairyFloss: 'color.surface.brand.100',
  bubblegum: 'color.surface.brand.200',
  marshmallowPink: 'color.surface.brand.300',
  lollipop: 'color.surface.brand.400',
  chia: 'color.feedback.inactive.100',
  sesame: 'color.text.subtle',
  liquorice: 'color.text.base',
  boba: 'color.text.contrast',
  cream: 'color.surface.base.000',
  coconut: 'color.surface.base.100',
  mascarpone: 'color.surface.base.200',
  custard: 'color.surface.base.300',
  feijoa: 'color.illustration.accent1.100',
  spearmint: 'color.illustration.accent1.200',
  macaroon: 'color.illustration.accent2.100',
  blueberry: 'color.illustration.accent2.200',
  pistachio: 'color.illustration.accent3.200',
  matcha: 'color.illustration.accent3.100',
  caramel: 'color.illustration.accent4.200',
  peanut: 'color.illustration.accent4.100',
  marzipan: 'color.illustration.neutral.400',
  oatmeal: 'color.illustration.neutral.300',
  satsuma: 'extended1.20',
  watermelon: 'color.feedback.negative.100',
  strawberry: 'color.feedback.negative.200',
  apple: 'color.feedback.positive.200',
  mint: 'color.feedback.positive.100',
  lemon: 'color.feedback.notice.200',
  sherbert: 'color.feedback.notice.100',
  tangerine: 'extended1.100',
  compareTheMarket: 'thirdParty.compareTheMarket',
  confused: 'thirdParty.confusedCom',
  onfido: 'thirdParty.onfido',
  x: 'thirdParty.twitter',
  premfina: 'thirdParty.premfina',
  checkout: 'thirdParty.checkout',
  meta: 'thirdParty.facebook',
  stripe: 'thirdParty.stripe',
  intercom: 'thirdParty.intercom',
  ravelin: 'thirdParty.ravelin',
  rac: 'thirdParty.rac',
  hometree: 'thirdParty.hometree',
}

const COLOR_KEYS = Object.keys(COLOR_MAP)

const AMBIGUOUS_NAMES = new Set([
  'cream',
  'apple',
  'mint',
  'lemon',
  'x',
  'meta',
  'stripe',
  'checkout',
  'intercom',
])

const DEFAULT_COLOR_PROPS = new Set([
  'color',
  'bgColor',
  'borderColor',
  'iconColor',
  'toggle',
  'background',
  'tagText',
  'backgroundColor',
  'fillColor',
  'strokeColor',
  'textColor',
  'hoverColor',
  'activeColor',
])

export const noColorPropRule = ESLintUtils.RuleCreator((name) => `${name}`)({
  name: 'no-color-prop',
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description:
        'Disallow Color props (any prop) on design system components',
    },
    messages: {
      noColorProp:
        'Legacy color "{{val}}" is deprecated. Use "{{replacement}}" instead.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          additionalColorProps: { type: 'array', items: { type: 'string' } },
          strictMode: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{}],
  create(context) {
    const options = context.options[0] || {}
    const additionalColorProps = new Set(options.additionalColorProps || [])
    const strictMode = options.strictMode === true

    function isColorContext(propName, val) {
      if (strictMode) return true
      if (!AMBIGUOUS_NAMES.has(val)) return true
      if (DEFAULT_COLOR_PROPS.has(propName)) return true
      if (additionalColorProps.has(propName)) return true
      return false
    }

    function reportAndFix(node, literalNode, val) {
      const replacement = COLOR_MAP[val]
      const raw = literalNode && typeof literalNode.raw === 'string' ? literalNode.raw : ''
      const quote = raw.length > 0 ? raw[0] : '"'
      context.report({
        node,
        messageId: 'noColorProp',
        data: { val, replacement },
        fix(fixer) {
          return fixer.replaceText(literalNode, quote + replacement + quote)
        },
      })
    }

    const colorVariables = new Map()

    return {
      JSXAttribute(node) {
        if (node.value?.type === 'Literal') {
          const val = String(node.value.value)
          if (COLOR_KEYS.includes(val)) {
            const propName = node.name.name
            if (isColorContext(propName, val)) {
              reportAndFix(node, node.value, val)
            }
          }
        } else if (
          node.value?.type === 'JSXExpressionContainer' &&
          node.value.expression?.type === 'Identifier'
        ) {
          const tracked = colorVariables.get(node.value.expression.name)
          if (tracked) {
            const propName = node.name.name
            if (isColorContext(propName, tracked.val)) {
              reportAndFix(node, tracked.literalNode, tracked.val)
            }
          }
        }
      },
      Property(node) {
        if (node.value?.type === 'Literal') {
          const val = String(node.value.value)
          if (COLOR_KEYS.includes(val)) {
            const propName = node.key.name || node.key.value
            if (isColorContext(propName, val)) {
              reportAndFix(node, node.value, val)
            }
          }
        }
      },
      VariableDeclarator(node) {
        if (node.init?.type === 'Literal') {
          const val = String(node.init.value)
          if (COLOR_KEYS.includes(val)) {
            const varName = node.id.name
            colorVariables.set(varName, { literalNode: node.init, val })
            if (isColorContext(varName, val)) {
              reportAndFix(node, node.init, val)
            }
          }
        }
      },
    }
  },
})
