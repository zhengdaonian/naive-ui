import type { TourTheme } from './light'
import { commonDark } from '../../_styles/common'

const tourDark: TourTheme = {
  name: 'Tour',
  common: commonDark,
  self(vars) {
    const {
      placeholderColor
    } = vars
    return {
      placeholderColor
    }
  }
}

export default tourDark
