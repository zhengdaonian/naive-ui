/**
 * 检查元素是否在父元素视图
 * http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
 * @param elm 元素
 * @param parent
 * @returns boolean
 */
export function elementInViewport(elm: HTMLElement, parent?: HTMLElement): boolean {
  const rect = elm.getBoundingClientRect()
  if (parent) {
    const parentRect = parent.getBoundingClientRect()
    return (
      rect.top >= parentRect.top
      && rect.left >= parentRect.left
      && rect.bottom <= parentRect.bottom
      && rect.right <= parentRect.right
    )
  }
  return rect.top >= 0 && rect.left >= 0 && rect.bottom + 80 <= window.innerHeight && rect.right <= window.innerWidth
}

export function getScrollParent(element: HTMLElement) {
  let style = window.getComputedStyle(element)
  const excludeStaticParent = style.position === 'absolute'
  const overflowRegex = /(auto|scroll)/

  if (style.position === 'fixed')
    return document.body

  for (let parent = element; parent.parentElement;) {
    parent = parent.parentElement
    style = window.getComputedStyle(parent)
    if (excludeStaticParent && style.position === 'static') {
      continue
    }
    if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX))
      return parent
  }

  return document.body
}

export function scrollToParentVisibleArea(element: HTMLElement) {
  const parent = getScrollParent(element)
  if (parent === document.body)
    return
  if (elementInViewport(element, parent))
    return
  parent.scrollTop = element.offsetTop - parent.offsetTop
}
