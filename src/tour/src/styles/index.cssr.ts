import { c, cB } from '../../../_utils/cssr'

// transition:  box-shadow .3s var(--n-bezier),
// background-color .3s var(--n-bezier),
// color .3s var(--n-bezier);
// position: relative;
// font-size: var(--n-font-size);
// color: var(--n-text-color);
// box-shadow: var(--n-box-shadow);
// word-break: break-word;
export default c([
  cB('tour', `
    position: absolute;
  `, [
    cB('tour-mask', `
      position: fixed;
      inset: 0px;
      pointer-events: none;
      width: 100%;
      height: 100%;
    `)
  ])
])
