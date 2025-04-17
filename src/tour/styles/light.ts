import type { Theme } from '../../_mixins'
import type { ThemeCommonVars } from '../../_styles/common'
import { commonLight } from '../../_styles/common'

function self(vars: ThemeCommonVars) {
  // eslint-disable-next-line no-empty-pattern
  const {
  } = vars
  return {
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
