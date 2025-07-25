import type { Ref } from 'vue'
import type { PosInfo, TourGap } from '../interface'
import { isArray, isFunction, isString } from 'lodash-es'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

function isInViewPort(element: HTMLElement) {
  const viewWidth = window.innerWidth || document.documentElement.clientWidth
  const viewHeight = window.innerHeight || document.documentElement.clientHeight
  const { top, right, bottom, left } = element.getBoundingClientRect()

  return top >= 0 && left >= 0 && right <= viewWidth && bottom <= viewHeight
}

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

export function useTarget(
  target: Ref<HTMLElement | string | undefined>,
  open: Ref<boolean>,
  gap: Ref<TourGap>,
  mergedMask: Ref<boolean>,
  scrollIntoViewOptions: Ref<boolean | ScrollIntoViewOptions>
) {
  const posInfo: Ref<PosInfo | null> = ref(null)

  const updatePosInfo = async () => {
    const targetEl = getTargetEl(target)
    if (!targetEl || !open.value) {
      posInfo.value = null
      return
    }
    if (!isInViewPort(targetEl)) {
      targetEl.scrollIntoView(scrollIntoViewOptions.value)
    }
    const { left, top, width, height } = targetEl.getBoundingClientRect()
    posInfo.value = {
      left,
      top,
      width,
      height,
      radius: 0,
    }
  }

  onMounted(() => {
    watch(
      [open, target],
      () => {
        updatePosInfo()
      },
      {
        immediate: true,
      }
    )
    window.addEventListener('resize', updatePosInfo)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updatePosInfo)
  })

  const getGapOffset = (index: number) =>
    (isArray(gap.value.offset) ? gap.value.offset[index] : gap.value.offset)
    ?? 6

  const mergedPosInfo = computed(() => {
    if (!posInfo.value)
      return posInfo.value

    const gapOffsetX = getGapOffset(0)
    const gapOffsetY = getGapOffset(1)
    const gapRadius = gap.value?.radius || 2

    return {
      left: posInfo.value.left - gapOffsetX,
      top: posInfo.value.top - gapOffsetY,
      width: posInfo.value.width + gapOffsetX * 2,
      height: posInfo.value.height + gapOffsetY * 2,
      radius: gapRadius,
    }
  })

  const triggerTarget = computed(() => {
    const targetEl = getTargetEl(target)
    if (!mergedMask.value || !targetEl || !window.DOMRect) {
      return targetEl || undefined
    }

    return {
      getBoundingClientRect() {
        return window.DOMRect.fromRect({
          width: mergedPosInfo.value?.width || 0,
          height: mergedPosInfo.value?.height || 0,
          x: mergedPosInfo.value?.left || 0,
          y: mergedPosInfo.value?.top || 0,
        })
      },
    }
  })

  return {
    mergedPosInfo,
    triggerTarget
  }
}
