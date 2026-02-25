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
      noColorMember:
        'Legacy color "{{val}}" accessed via theme.colors is deprecated. Use "{{replacement}}" instead.',
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

    function isInsideTaggedTemplate(node) {
      let current = node.parent
      while (current) {
        if (current.type === 'TaggedTemplateExpression') return true
        current = current.parent
      }
      return false
    }

    function needsArrowWrapper(node) {
      let current = node.parent
      while (current) {
        if (
          current.type === 'ArrowFunctionExpression' ||
          current.type === 'FunctionExpression'
        ) {
          return false
        }
        if (current.type === 'TemplateLiteral') return true
        current = current.parent
      }
      return false
    }

    function reportAndFix(node, literalNode, val) {
      const replacement = COLOR_MAP[val]
      const raw =
        literalNode && typeof literalNode.raw === 'string'
          ? literalNode.raw
          : ''
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

    function tokenPathToMemberAccess(tokenPath) {
      let result = ''
      for (const segment of tokenPath.split('.')) {
        if (/^\d+$/.test(segment)) {
          result += `[${segment}]`
        } else {
          result += `.${segment}`
        }
      }
      return result
    }

    function resolveIdentifierToLiteral(identifierNode) {
      const scope = context.sourceCode.getScope(identifierNode)
      let current = scope
      while (current) {
        for (const variable of current.variables) {
          if (variable.name === identifierNode.name) {
            for (const def of variable.defs) {
              if (
                def.type === 'Variable' &&
                def.node.init?.type === 'Literal'
              ) {
                return def.node.init
              }
            }
            return null
          }
        }
        current = current.upper
      }
      return null
    }

    return {
      JSXAttribute(node) {
        const propName =
          node.name?.type === 'JSXIdentifier' ? node.name.name : undefined
        if (typeof propName !== 'string') return

        if (node.value?.type === 'Literal') {
          const val = String(node.value.value)
          if (COLOR_KEYS.includes(val) && isColorContext(propName, val)) {
            reportAndFix(node, node.value, val)
          }
        } else if (node.value?.type === 'JSXExpressionContainer') {
          const expr = node.value.expression
          if (expr?.type === 'Identifier') {
            const literalNode = resolveIdentifierToLiteral(expr)
            if (literalNode) {
              const val = String(literalNode.value)
              if (COLOR_KEYS.includes(val) && isColorContext(propName, val)) {
                reportAndFix(node, literalNode, val)
              }
            }
          } else if (expr?.type === 'ConditionalExpression') {
            for (const branch of [expr.consequent, expr.alternate]) {
              if (branch?.type === 'Literal') {
                const val = String(branch.value)
                if (COLOR_KEYS.includes(val) && isColorContext(propName, val)) {
                  reportAndFix(node, branch, val)
                }
              }
            }
          }
        }
      },
      Property(node) {
        if (node.value?.type === 'Literal') {
          const val = String(node.value.value)
          if (COLOR_KEYS.includes(val)) {
            let propName
            if (
              node.key &&
              (node.key.type === 'Identifier' || node.key.type === 'Literal')
            ) {
              propName =
                node.key.type === 'Identifier' ? node.key.name : node.key.value
            }
            if (typeof propName === 'string' && isColorContext(propName, val)) {
              reportAndFix(node, node.value, val)
            }
          }
        }
      },
      MemberExpression(node) {
        if (
          node.property?.type === 'Identifier' &&
          COLOR_KEYS.includes(node.property.name) &&
          node.object?.type === 'MemberExpression' &&
          node.object.property?.type === 'Identifier' &&
          node.object.property.name === 'colors' &&
          isInsideTaggedTemplate(node)
        ) {
          const val = node.property.name
          const replacement = COLOR_MAP[val]
          const memberAccess = tokenPathToMemberAccess(replacement)

          if (needsArrowWrapper(node)) {
            context.report({
              node,
              messageId: 'noColorMember',
              data: { val, replacement },
              fix(fixer) {
                return fixer.replaceText(
                  node,
                  `({theme}) => theme${memberAccess}`,
                )
              },
            })
          } else {
            const baseText = context.sourceCode.getText(node.object.object)
            context.report({
              node,
              messageId: 'noColorMember',
              data: { val, replacement },
              fix(fixer) {
                return fixer.replaceText(
                  node,
                  `${baseText}${memberAccess}`,
                )
              },
            })
          }
        }
      },
      VariableDeclarator(node) {
        if (node.init?.type === 'Literal') {
          const val = String(node.init.value)
          if (COLOR_KEYS.includes(val)) {
            const varName = node.id.name
            if (isColorContext(varName, val)) {
              reportAndFix(node, node.init, val)
            }
          }
        }
      },
    }
  },
})
