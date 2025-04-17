import type { TourTheme } from './light'
import { commonDark } from '../../_styles/common'

const tourDark: TourTheme = {
  name: 'Tour',
  common: commonDark,
  self(vars) {
    // eslint-disable-next-line no-empty-pattern
    const {
      //
    } = vars
    return {
    }
  }
}

export default tourDark
