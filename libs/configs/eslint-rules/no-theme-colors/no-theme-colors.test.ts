import { RuleTester } from '@typescript-eslint/rule-tester'
import { noThemeColorsRule } from './no-theme-colors'

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
})

/* Valid code samples */
const fontThemeCode = `
  import styled from 'styled-components';
  const Box = styled.div\`
    font-weight: \${ theme.font.weight.bold};
  \`;
`
;('const x = ;')

const themeCode = `
  import styled from 'styled-components';
  const Box = styled.div\`
    color: \${({ theme }) => theme.color.feedback.negative[100]};
  \`;
`

const extendedThemeCode = `
  import styled from 'styled-components';
  const Box = styled.div\`
    color: \${({ $border, theme }) =>
      $border ? theme.color.border.subtle : theme.color.background['000']};
  \`;
`
const useThemHookCode = `
	import { useTheme } from 'styled-components';
	const MyComponent = () => {
		const theme = useTheme();
		return <div style={{ color: theme.color.text.primary }}>Hello</div>;
	};
`

/* Invalid code samples */
const failingBorderCode = `
  import styled from 'styled-components';
  const Box = styled.div\`
    color: \${({ $border, theme }) =>
      $border ? theme.colors.liquorice : theme.colors.lollipop};
  \`;
`

ruleTester.run('no-theme-colors', noThemeColorsRule, {
  valid: [
    { name: 'old theme font usage', code: fontThemeCode },
    { name: 'new theme colour usage', code: themeCode },
    { name: 'styled component usage', code: extendedThemeCode },
    { name: 'useTheme hook usage', code: useThemHookCode },
  ],
  invalid: [
    {
      name: 'using old theme colors',
      code: failingBorderCode,
      errors: [{ messageId: 'noThemeColors' }, { messageId: 'noThemeColors' }],
    },
  ],
})
