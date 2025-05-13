import type { CSSProperties, Ref, VNode } from 'vue'
import { createInjectionKey } from '../../_utils/vue/create-injection-key'

export type TourTrigger = 'click' | 'hover' | 'focus' | 'manual'

export interface TourInst {
  syncPosition: () => void
  setShow: (value: boolean) => void
}

export type InternalTourInst = TourInst & {
  getMergedShow: () => boolean
}

export type TourBodyInjection = Ref<HTMLElement | null> | null

export const tourBodyInjectionKey
  = createInjectionKey<TourBodyInjection>('n-tour-body')

export type InternalRenderBody = (
  className: any,
  ref: Ref<HTMLElement | null>,
  style: CSSProperties[],
  onMouseenter: (e: MouseEvent) => void,
  onMouseleave: (e: MouseEvent) => void
) => VNode
