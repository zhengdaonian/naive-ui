import { PropType, Ref } from "vue";
import { FollowerPlacement } from "vueuc";
import { createInjectionKey } from "../../_utils";

export interface TourGap {
  offset?: number | [number, number]
  radius?: number
}

export interface PosInfo {
  left: number
  top: number
  height: number
  width: number
  radius: number
}

export interface TourStepOption {
    target?: string | HTMLElement
    placement?: FollowerPlacement
    title?: string
    content?: string
    order?: number
    showMask?: boolean
    showArrow: {
        type: boolean
        default: true
    },
}

export const tourBaseProps = {
    to: [String, Object] as PropType<string | HTMLElement>,
    show: {
        type: Boolean as PropType<boolean>,
        default: false
    },
    zIndex: {
        type: Number
    },
    current: {
        type: Number,
        default: 0,
    },
    steps: {
        type: Array as PropType<TourStepOption[]>,
        default: []
    },
    showMask: {
        type: Boolean as PropType<boolean>,
        default: true
    },
    gap: {
        type: Object as PropType<TourGap>,
        default: () => ({
            offset: 6,
            radius: 2,
        }),
    },
    scrollIntoViewOptions: {
        type: [Boolean, Object] as PropType<boolean | ScrollIntoViewOptions>,
        default: () => ({
            block: 'center',
        }),
    },
}

export const tourMaskProps = {
    pos: {
        type: [Object] as PropType<PosInfo | null>
    },
}

export interface TourInjection {
    mergedClsPrefixRef: Ref<string>
}

export const tourInjectionKey
  = createInjectionKey<TourInjection>('n-tour')
