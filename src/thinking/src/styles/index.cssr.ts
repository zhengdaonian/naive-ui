import { c, cB, cE, cM } from '../../../_utils/cssr'

export default c([
  cB('thinking', `
    margin-bottom: 13px;
    `, [
    cE('header', `
        margin-bottom: 12px;
        width: fit-content;
        user-select: none;
        padding: 7px 14px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 10px;
        background-color: var(--n-color);
        cursor: pointer;
    `, [
      c('&:hover', {
        backgroundColor: 'var(--n-color-hover)',
      })
    ]),
    cE('content--wrapper', `
        display: grid;
        gap: var(--n-gap);
        font-size: var(--n-font-size);
        line-height: var(--n-line-height);
        color: var(--n-text-color);
        margin: 0;
        margin-top: 12px;
        margin-bottom: 12px;
        box-sizing: border-box;
        padding-left: 12px;
        border-left: 4px solid var(--n-prefix-color);
        transition:
            color .3s var(--n-bezier),
            border-color .3s var(--n-bezier);
    `, [
      c('&:first-child', {
        marginTop: 0
      }),
      c('&:last-child', {
        marginBottom: 0
      }),
      cM('align-text', {
        marginLeft: '-16px'
      })
    ])
  ])
])
