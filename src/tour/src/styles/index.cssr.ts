import { c, cB } from "../../../_utils/cssr";


export default c([
    cB('tour', `
        position: absolute;
    `),
    cB('tour-mask', `
        position: fixed;
        inset: 0px;
        pointer-events: none;
    `),
    // cB('tour-fixed', `
    //     position: fixed;
    // `),
    // cB('tour-highlight', `
    //     transition: .2s var(--n-bezier);
    //     border-radius: var(--n-border-radius);
    // `),
    // cB('tour-mask', `
    //     box-shadow: 0 0 0 0 rgba(0, 0, 0, .6), rgba(0, 0, 0, .6) 0 0 0 5000px;
    //     `, [
    //     // fadeInTransition({
    //     // enterDuration: '.25s',
    //     // leaveDuration: '.25s',
    //     // enterCubicBezier: 'var(--n-bezier-ease-out)',
    //     // leaveCubicBezier: 'var(--n-bezier-ease-out)'
    //     // })
    // ]),
])