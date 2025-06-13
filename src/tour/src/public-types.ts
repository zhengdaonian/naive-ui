import { PropType, Ref } from "vue";
import { FollowerPlacement } from "vueuc";
import { createInjectionKey, MaybeArray } from "../../_utils";

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
        type: Number,
        default: 99999
    },
    current: {
        type: Number,
        default: 0,
    },
    defaultCurrent: {
        type: Number
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
    hideCounter: {
        type: Boolean,
        default: false
    },
    hideSkip: {
        type: Boolean,
        default: false
    },
    hidePrev: {
        type: Boolean,
        default: false
    },
    'onUpdate:show': [Function, Array] as PropType<
        MaybeArray<(value: boolean) => void>
    >,
    onUpdateShow: [Function, Array] as PropType<
        MaybeArray<(value: boolean) => void>
    >,
    'onUpdate:current': [Function, Array] as PropType<
        MaybeArray<(current: number) => void>
    >,
    onUpdateCurrent: [Function, Array] as PropType<
        MaybeArray<(current: number) => void>
    >,
    onFinish: Function as PropType<(current: number, total: number) => void>,
    onSkip: Function as PropType<(current: number, total: number) => void>,
    onClose: Function as PropType<(current: number, total: number) => void>,
}

export const tourMaskProps = {
    pos: {
        type: [Object] as PropType<PosInfo | null>
    },
    zIndex: {
        type: Number,
        default: 99998
    }
}

export interface TourInjection {
    mergedClsPrefixRef: Ref<string>
}

export const tourInjectionKey
  = createInjectionKey<TourInjection>('n-tour')
