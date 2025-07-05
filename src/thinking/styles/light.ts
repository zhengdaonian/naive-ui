import type { Theme } from '../../_mixins'
import type { ThemeCommonVars } from '../../_styles/common'
import { commonLight } from '../../_styles/common'
import commonVariables from './_common'

export function self(vars: ThemeCommonVars) {
  const {
    lineHeight,
    textColor3,
    borderColor,
    buttonColor2,
    buttonColor2Hover
  } = vars
  return {
    ...commonVariables,
    lineHeight,
    textColor: textColor3,
    borderColor,
    colorTertiary: buttonColor2,
    colorTertiaryHover: buttonColor2Hover
  }
}

export type ThinkingThemeVars = ReturnType<typeof self>

const thinkingLight: Theme<'Thinking', ThinkingThemeVars> = {
  name: 'Thinking',
  common: commonLight,
  self
}

export default thinkingLight
export type ThinkingTheme = typeof thinkingLight
