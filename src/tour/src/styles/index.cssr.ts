import { fadeInTransition } from '../../../_styles/transitions/fade-in.cssr'
import { c, cB, cE, cM } from '../../../_utils/cssr'

// vars:
// --n-bezier
// --n-box-shadow
// --n-box-shadow-hover
// --n-box-shadow-pressed
// --n-color
// --n-text-color
// --n-color-hover
// --n-color-pressed
// --n-border-radius-square
export default c([
  cB('tour', `
  
  `),
  cB('tour-container', `
    position: relative;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    pointer-events: none;
  `, [
    c('> *', `
      pointer-events: all;
    `)
  ]),
  cB('tour-mask', `
      background-color: rgba(0, 0, 0, .3);
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
    `, [
    cM('invisible', `
        background-color: rgba(0, 0, 0, 0)
      `),
    fadeInTransition({
      enterDuration: '0.2s',
      leaveDuration: '0.2s',
      enterCubicBezier: 'var(--n-bezier-in)',
      leaveCubicBezier: 'var(--n-bezier-out)'
    })
  ])
])
