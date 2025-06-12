import type { Ref } from 'vue'
import type { PosInfo, TourGap } from '../public-types'
import { isArray } from 'lodash-es'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getTargetEl } from '../utils/getTargetEl'

function isInViewPort(element: HTMLElement) {
  const viewWidth = window.innerWidth || document.documentElement.clientWidth
  const viewHeight = window.innerHeight || document.documentElement.clientHeight
  const { top, right, bottom, left } = element.getBoundingClientRect()

  return top >= 0 && left >= 0 && right <= viewWidth && bottom <= viewHeight
}

export function useTarget(
  target: Ref<HTMLElement | string | undefined>,
  open: Ref<boolean>,
  gap: Ref<TourGap>,
  scrollIntoViewOptions: Ref<boolean | ScrollIntoViewOptions>
) {
  const posInfo: Ref<PosInfo | null> = ref(null)

  const updatePosInfo = () => {
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

  return {
    mergedPosInfo,
  }
}
