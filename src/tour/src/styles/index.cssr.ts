import { fadeInTransition } from '../../../_styles/transitions/fade-in.cssr'
import { c, cB } from '../../../_utils/cssr'

export default c([
  cB('tour', `
        position: absolute;
    `),
  cB('tour-mask', `
        position: fixed;
        inset: 0px;
        pointer-events: none;
    `, [
    fadeInTransition({
      enterDuration: '.25s',
      leaveDuration: '.25s',
      enterCubicBezier: 'var(--n-bezier-ease-out)',
      leaveCubicBezier: 'var(--n-bezier-ease-out)'
    })
  ]),
  cB('tour-reference', `
        position: absolute;
        pointer-events: none;
    `),
  cB('tour-footer', `
        display: flex;
        align-items: center;
        width: 100%;
        justify-content: space-between;
    `),
  cB('tour-action', `
        display: flex;
        gap: 8px 
    `)
  // cB('tour-fixed', `
  //     position: fixed;
  // `),
  // cB('tour-highlight', `
  //     transition: .2s var(--n-bezier);
  //     border-radius: var(--n-border-radius);
  // `),
])
