import type { ThinkingTheme } from './light'
import { commonDark } from '../../_styles/common'
import { self } from './light'

const thinkingDark: ThinkingTheme = {
  name: 'Thinking',
  common: commonDark,
  self(vars) {
    const commonSelf = self(vars)
    return commonSelf
  }
}

export default thinkingDark
