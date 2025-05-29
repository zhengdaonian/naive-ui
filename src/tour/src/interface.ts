import type { CSSProperties, PropType, Ref, VNode } from 'vue'
import type { FollowerPlacement } from 'vueuc'
import type { MaybeArray } from '../../_utils'
import { createInjectionKey, useAdjustedTo } from '../../_utils'

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

export interface TourStepOptions {
  target?: string | HTMLElement
  placement?: FollowerPlacement
  title?: string
  content?: string
  // type?: string
  order?: number
  showMask?: boolean
  showArrow: {
    type: boolean
    default: true
  },
  // scrollIntoViewOptions: {
  //   type: boolean | Object
  //   default: undefined
  // }
}

export const tourBaseProps = {
  to: {
    type: [String, Object] as PropType<string | HTMLElement>,
    default: 'body',
  },
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
    type: Array as PropType<any[]>,
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
  hideSkip: {
    type: Boolean,
    default: false
  },
  hidePrev: {
    type: Boolean,
    default: false
  },
  hideCounter: {
    type: Boolean,
    default: false
  },
  // flip: {
  //   type: Boolean,
  //   default: true
  // },
  showArrow: {
    type: Boolean,
    default: true,
  },
  placement: {
    type: String as PropType<FollowerPlacement>,
    default: 'top'
  },
  // scrollIntoViewOptions: {
  //   type: [Boolean, Object] as PropType<boolean | ScrollIntoViewOptions>,
  //   default: () => ({
  //     block: 'center',
  //   }),
  // },
  // targetAreaClickable: {
  //   type: Boolean,
  //   default: true,
  // },
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

// export const tourMaskProps = {
//   prefixCls: String as PropType<string>,
//   pos: {
//     type: Object as PropType<PosInfo | null>,
//   },
//   fill: {
//     type: String,
//     default: 'rgba(0,0,0,0.5)',
//   },
//   targetAreaClickable: {
//     type: Boolean,
//     default: true,
//   },
// }

// export const tourStepsProps = {
//   prefixCls: String as PropType<string>,
//   show: {
//     type: Boolean as PropType<boolean>,
//     default: false
//   },
//   to: useAdjustedTo.propTo,
//   flip: {
//     type: Boolean,
//     default: true
//   },
//   placement: {
//     type: String as PropType<FollowerPlacement>,
//     default: 'top'
//   },
//   showArrow: {
//     type: Boolean,
//     default: true,
//   },
//   arrowClass: String,
//   arrowStyle: [String, Object] as PropType<string | CSSProperties>,
//   arrowWrapperClass: String,
//   arrowWrapperStyle: [String, Object] as PropType<string | CSSProperties>,
//   // private
//   internalDeactivateImmediately: Boolean,
//   cssVars: [Object] as PropType<CSSProperties>
//   // current: {
//   //   type: Number,
//   //   default: 0,
//   // }
// }

// export const tourStepProps = {
//   show: Boolean,
//   target: [String, Object, Function] as PropType<string | HTMLElement | (() => HTMLElement | null) | null>,
//   showMask: {
//     type: Boolean as PropType<boolean>,
//     default: true,
//   },
//   //   title: String,
//   //   description: String,
//   //   showClose: {
//   //     type: Boolean,
//   //     default: undefined
//   //   },
//   showArrow: {
//     type: Boolean,
//     default: undefined
//   },
//   placement: {
//     type: String as PropType<FollowerPlacement>,
//     default: 'top'
//   },
//   scrollIntoViewOptions: {
//     type: [Boolean, Object] as PropType<boolean | ScrollIntoViewOptions>,
//     default: undefined,
//   },
// }

// export type TourStepProps = typeof tourStepProps

// export const tourContentProps = {
//   prefixCls: String as PropType<string>,
//   placement: {
//     type: String as PropType<FollowerPlacement>,
//     default: 'top'
//   },
//   show: {
//     type: Boolean as PropType<boolean>,
//     default: false
//   },
//   reference: {
//     type: Object as PropType<HTMLElement | null>,
//     default: null,
//   },
//   strategy: {
//     type: String as PropType<'relative' | 'absolute' | 'fixed'>,
//     default: 'absolute',
//   },
//   offset: {
//     type: Number,
//     default: 10,
//   },
//   showArrow: Boolean,
//   zIndex: {
//     type: Number,
//     default: 0
//   },
// //   arrowClass: String,
// //   arrowStyle: [String, Object] as PropType<string | CSSProperties>,
// //   arrowWrapperClass: String,
// //   arrowWrapperStyle: [String, Object] as PropType<string | CSSProperties>,
// }

export interface TourInjection {
  increaseStep(step: TourStepOptions): void,
  decreaseStep(step: TourStepOptions): void
}

export const tourInjectionKey
  = createInjectionKey<TourInjection>('n-tour')

// // export interface TourInst {
// //   syncPosition: () => void
// //   setShow: (value: boolean) => void
// // }

// // export type InternalTourInst = TourInst & {
// //   getMergedShow: () => boolean
// // }
// // Ref<HTMLElement | null> | null

// // export type InternalRenderBody = (
// //   className: any,
// //   ref: Ref<HTMLElement | null>,
// //   style: CSSProperties[]
// // ) => VNode

// export interface TourInst {
//   syncPosition: () => void
//   setShow: (value: boolean) => void
// }

// export type InternalTourInst = TourInst & {
//   getMergedShow: () => boolean
// }

// export type TourBodyInjection = Ref<HTMLElement | null> | null

// export const tourBodyInjectionKey
//   = createInjectionKey<TourBodyInjection>('n-tour-body')

// export type InternalRenderBody = (
//   className: any,
//   ref: Ref<HTMLElement | null>,
//   style: CSSProperties[]
// ) => VNode
