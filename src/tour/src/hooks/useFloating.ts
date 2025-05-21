import type { CSSProperties, Ref } from 'vue'
import type { FollowerPlacement } from 'vueuc'
import { computed, onBeforeUnmount, onMounted, ref, unref, watchEffect } from 'vue'

export function useFloating(referenceRef: Ref<HTMLElement | null>, contentRef: Ref<HTMLElement | null>, arrowRef: Ref<HTMLElement | null>, placement: Ref<FollowerPlacement | undefined>, strategy: Ref<'relative' | 'absolute' | 'fixed'>, offset: Ref<number>, zIndex: Ref<number>, showArrow: Ref<boolean>) {
  const x = ref<number>()
  const y = ref<number>()
  const middlewareData = ref<ComputePositionReturn['middlewareData']>({})

  const states = {
    x,
    y,
    placement,
    strategy,
    middlewareData,
  } as const

  const middleware = computed(() => {
    const _middleware: Middleware[] = [
      offsetMiddelware(unref(offset)),
      flip(),
      shift(),
      overflowMiddleware(),
    ]

    if (unref(showArrow) && unref(arrowRef)) {
      _middleware.push(
        arrow({
          element: unref(arrowRef)!,
        })
      )
    }
    return _middleware
  })

  const update = async () => {
    if (!isClient)
      return

    const referenceEl = unref(referenceRef)
    const contentEl = unref(contentRef)
    if (!referenceEl || !contentEl)
      return

    const data = await computePosition(referenceEl, contentEl, {
      placement: unref(placement),
      strategy: unref(strategy),
      middleware: unref(middleware),
    })

    keysOf(states).forEach((key) => {
      states[key].value = data[key]
    })
  }

  const contentStyle = computed<CSSProperties>(() => {
    if (!unref(referenceRef)) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate3d(-50%, -50%, 0)',
        maxWidth: '100vw',
        zIndex: unref(zIndex),
      }
    }

    const { overflow } = unref(middlewareData)

    return {
      position: unref(strategy),
      zIndex: unref(zIndex),
      top: unref(y) != null ? `${unref(y)}px` : '',
      left: unref(x) != null ? `${unref(x)}px` : '',
      maxWidth: overflow?.maxWidth ? `${overflow?.maxWidth}px` : '',
    }
  })

  const arrowStyle = computed<CSSProperties>(() => {
    if (!unref(showArrow))
      return {}

    const { arrow } = unref(middlewareData)
    return {
      left: arrow?.x != null ? `${arrow?.x}px` : '',
      top: arrow?.y != null ? `${arrow?.y}px` : '',
    }
  })

  let cleanup: any
  onMounted(() => {
    const referenceEl = unref(referenceRef)
    const contentEl = unref(contentRef)
    if (referenceEl && contentEl) {
      cleanup = autoUpdate(referenceEl, contentEl, update)
    }

    watchEffect(() => {
      update()
    })
  })

  onBeforeUnmount(() => {
    cleanup && cleanup()
  })

  return {
    update,
    contentStyle,
    arrowStyle,
  }
}
