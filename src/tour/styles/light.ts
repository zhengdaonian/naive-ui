import type { Theme } from '../../_mixins'
import type { ThemeCommonVars } from '../../_styles/common'
import { commonLight } from '../../_styles/common'
import commonVariables from './_common'

function self(vars: ThemeCommonVars) {
  const {
    boxShadow2,
    popoverColor,
    textColor2,
    borderRadius,
    fontSize,
    dividerColor,
    placeholderColor
  } = vars
  return {
    ...commonVariables,
    fontSize,
    borderRadius,
    color: popoverColor,
    dividerColor,
    textColor: textColor2,
    boxShadow: boxShadow2,
    placeholderColor
  }
}

export type TourThemeVars = ReturnType<typeof self>

const tourLight: Theme<'Tour', TourThemeVars> = {
  name: 'Tour',
  common: commonLight,
  self
}

export default tourLight
export type TourTheme = typeof tourLight
