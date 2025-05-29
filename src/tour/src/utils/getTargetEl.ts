import type { Ref } from 'vue'
import { isFunction, isString } from 'lodash-es'

export function getTargetEl(target: Ref<HTMLElement | string | undefined>) {
  let targetEl: HTMLElement
  if (target.value) {
    if (isString(target.value)) {
      targetEl = document.querySelector<HTMLElement>(target.value) as HTMLElement
    }
    else if (isFunction(target.value)) {
      targetEl = target.value()
    }
    else {
      targetEl = target.value as HTMLElement
    }
  }
  else {
    return document.body as HTMLElement
  }
  return targetEl
}
