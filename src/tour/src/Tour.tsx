import type {
  ComputedRef,
  CSSProperties,
  PropType,
  Ref
} from 'vue'
import type { FollowerPlacement } from 'vueuc'
import type { ThemeProps } from '../../_mixins'
import type { MaybeArray } from '../../_utils'
import type {
  TourGap
  ,
  TourStepOptions
} from './interface'
import { NButton, NFlex, NPopover } from 'naive-ui'
import { zindexable } from 'vdirs'
import {
  computed,
  defineComponent,
  Fragment,
  h,
  provide,
  reactive,
  ref,
  toRef,
  watch,
  withDirectives
} from 'vue'
import { VLazyTeleport } from 'vueuc'
import { useConfig, useTheme, useThemeClass } from '../../_mixins'
import { call, createInjectionKey } from '../../_utils'
import { tourLight, type TourTheme } from '../styles'
import { useTarget } from './hooks/useTarget'
import style from './styles/index.cssr'
import TourMask from './TourMask'
import TourSteps from './TourSteps'

export const tourProps = {
  ...(useTheme.props as ThemeProps<TourTheme>),
  to: {
    type: [String, Object] as PropType<string | HTMLElement>,
    default: 'body',
  },
  show: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  zIndex: {
    type: Number,
    default: 9999
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
  targetAreaClickable: {
    type: Boolean,
    default: true,
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

export interface TourInjection {
  mergedClsPrefixRef: Ref<string>
}

export const tourInjectionKey
  = createInjectionKey<TourInjection>('n-anchor')

export default defineComponent({
  name: 'Tour',
  inheritAttrs: false,
  props: tourProps,
  // slots: Object as SlotsType<TourSlots>,
  __popover__: true,
  setup(props) {
    const { mergedClsPrefixRef, inlineThemeDisabled }
      = useConfig(props)
    const themeRef = useTheme(
      'Tour',
      '-tour',
      style,
      tourLight,
      props,
      mergedClsPrefixRef
    )

    const cssVarsRef = computed(() => {
    //   const {
    //     common: { cubicBezierEaseInOut, cubicBezierEaseIn, cubicBezierEaseOut },
    //     self: {
    //       placeholderColor,
    //       space,
    //       spaceArrow,
    //       padding,
    //       fontSize,
    //       textColor,
    //       dividerColor,
    //       color,
    //       boxShadow,
    //       borderRadius,
    //       arrowHeight,
    //       arrowOffset,
    //       arrowOffsetVertical
    //     }
    //   } = themeRef.value

      return {
        //     '--n-box-shadow': boxShadow,
        //     '--n-bezier': cubicBezierEaseInOut,
        //     '--n-bezier-ease-in': cubicBezierEaseIn,
        //     '--n-bezier-ease-out': cubicBezierEaseOut,
        //     '--n-font-size': fontSize,
        //     '--n-text-color': textColor,
        //     '--n-color': color,
        //     '--n-divider-color': dividerColor,
        //     '--n-border-radius': borderRadius,
        //     '--n-arrow-height': arrowHeight,
        //     '--n-arrow-offset': arrowOffset,
        //     '--n-arrow-offset-vertical': arrowOffsetVertical,
        //     '--n-padding': padding,
        //     '--n-space': space,
        //     '--n-space-arrow': spaceArrow,
        //     '--n-placeholder-color': placeholderColor,
      }
    })

    const themeClassHandle = inlineThemeDisabled
      ? useThemeClass('theme-class', undefined, cssVarsRef, props)
      : undefined

    const controlledShowRef = toRef(props, 'show')
    const controlledCurrentRef = toRef(props, 'current')

    const tmpSteps: Set<TourStepOptions> = reactive(new Set<any>())

    const allSteps = computed(() => {
      return Array.from(tmpSteps)
        .concat(props.steps)
        .sort((prev, next) => (prev.order || 0) - (next.order || 0))
    })
    const currentStep = computed(() => allSteps.value[controlledCurrentRef.value])
    const totalSteps = computed(() => allSteps.value.length)

    const currentTarget = computed(() => currentStep.value?.target)

    const mergedScrollIntoViewOptions = computed(
      () => (currentStep.value.scrollIntoViewOptions || props.scrollIntoViewOptions) as boolean | ScrollIntoViewOptions
    )

    provide(tourInjectionKey, {
      mergedClsPrefixRef,
    })

    const mergedPlacement = computed(
      () => currentStep.value?.placement || props.placement
    )

    const mergedMask = computed(() => currentStep.value?.showMask ?? props.showMask)
    const mergedShowMask = computed(() => !!mergedMask.value && props.show)

    const mergedShowArrow = computed(
      () =>
        !!currentTarget.value && (currentStep.value?.showArrow ?? props.showArrow)
    )

    const { mergedPosInfo: pos, triggerTarget } = useTarget(
      currentTarget,
      controlledShowRef,
      toRef(props, 'gap'),
      mergedMask,
      mergedScrollIntoViewOptions
    )

    // function doUpdateCurrent(current: number): void {
    //   const { onUpdateCurrent, 'onUpdate:current': _onUpdateCurrent } = props
    //   if (onUpdateCurrent)
    //     call(onUpdateCurrent, current)
    //   if (_onUpdateCurrent)
    //     call(_onUpdateCurrent, current)
    //   controlledCurrentRef.value = current
    // }

    // function doUpdateShow(show: boolean): void {
    //   const { onUpdateShow, 'onUpdate:show': _onUpdateShow } = props
    //   if (onUpdateShow)
    //     call(onUpdateShow, show)
    //   if (_onUpdateShow)
    //     call(_onUpdateShow, show)
    //   controlledShowRef.value = show
    // }

    // const handlePrev = () => {
    //   if (!controlledShowRef.value || controlledCurrentRef.value <= 0)
    //     return
    //   doUpdateCurrent(controlledCurrentRef.value - 1)
    // }

    // const handleNext = () => {
    //   if (!controlledShowRef.value) return
    //   doUpdateCurrent(controlledCurrentRef.value + 1)
    // }

    // const handleSkip = () => {
    //   if (!controlledShowRef.value) return
    //   doUpdateShow(false)
    //   const { onSkip } = props
    //   if (onSkip)
    //     call(onSkip, controlledCurrentRef.value, totalSteps.value)
    // }

    // const handleFinish = () => {
    //   if (!controlledShowRef.value) return
    //   doUpdateShow(false)
    //   const { onFinish } = props
    //   if (onFinish)
    //     call(onFinish, controlledCurrentRef.value, totalSteps.value)
    // }

    // const handleClose = () => {
    //   if (!controlledShowRef.value) return
    //   doUpdateShow(false)
    //   const { onClose } = props
    //   if (onClose)
    //     call(onClose, controlledCurrentRef.value, totalSteps.value)
    // }

    // // 当前高亮的元素
    // const currentHighlightLayerElm = ref<HTMLElement>()

    // // watch(
    // //   () => props.show,
    // //   (value) => {
    // //     // currentHighlightLayerElm.value = getTargetEl(currentTarget)
    // //     // if (currentHighlightLayerElm.value)
    // //     //   return
    // //     // scrollToParentVisibleArea(currentHighlightLayerElm.value)
    // //     // console.log(getTargetEl(currentTarget))
    // //   }
    // // )

    // watch(
    //   () => props.current,
    //   (value) => {
    //     controlledCurrentRef.value = Math.max(0, value)
    //   },
    // )

    // // watch(controlledCurrentRef, (val) => {
    // //   if (val >= 0 && val < allSteps.value.length) {
    // //     console.log(val, allSteps.value.length)
    // //     // popupVisible.value = false
    // //     // initGuide()
    // //   }
    // // })

    // // const renderModal = () => {

    // // }

    // function increaseStep(step: TourStepOptions) {
    //   tmpSteps.add(step)
    // }

    // function decreaseStep(step: TourStepOptions) {
    //   tmpSteps.delete(step)
    // }

    // provide(tourInjectionKey, {
    //   increaseStep,
    //   decreaseStep,
    // })

    return {
      mergedClsPrefix: mergedClsPrefixRef,
      cssVars: inlineThemeDisabled ? undefined : cssVarsRef,
      onRender: themeClassHandle?.onRender,
      controlledShow: controlledShowRef,
      mergedShowMask,
      pos,
      triggerTarget,
      controlledCurrent: controlledCurrentRef,
      mergedPlacement,
      mergedShowArrow,
      //   allSteps,
    //   handlePrev,
    //   handleNext,
    //   handleSkip,
    //   handleFinish
    }
  },
  render() {
    const {
      mergedClsPrefix,
      mergedShowMask,
      pos,
      zIndex,
      targetAreaClickable,
      triggerTarget,
      controlledCurrent,
      mergedPlacement,
      mergedShowArrow,
    //   allSteps,
    //   handlePrev,
    //   handleSkip,
    //   handleNext,
    //   handleFinish
    } = this

    // const renderTitle = () => {
    //   return (
    //     <span>
    //       {currentStep.title || ''}
    //     </span>
    //   )
    // }

    // const renderContent = () => {
    //   return (
    //     <span>
    //       {currentStep.content || ''}
    //     </span>
    //   )
    // }

    // const renderFooter = () => {
    //   const { hideSkip, hidePrev } = this
    //   const isLast = controlledCurrent === allSteps.length - 1
    //   const isFirst = controlledCurrent === 0
    //   return (
    //     <div style={{ display: 'flex', alignItems: 'center' }}>
    //       <div
    //         class={`${mergedClsPrefix}-tour-counter`}
    //         style={{
    //           ...this.cssVars as CSSProperties
    //         }}
    //       >
    //         { `${controlledCurrent + 1}/${allSteps.length}` }
    //       </div>
    //       <div
    //         class={`${mergedClsPrefix}-tour-action`}
    //         style={{
    //           ...this.cssVars as CSSProperties
    //         }}
    //       >
    //         {!hideSkip && !isLast && (
    //           <NButton
    //             key="skip"
    //             type="default"
    //             size="small"
    //             onClick={() => handleSkip()}
    //           >
    //             跳过
    //           </NButton>
    //         )}
    //         {!hidePrev && !isFirst && (
    //           <NButton
    //             key="prev"
    //             type="default"
    //             size="small"
    //             onClick={() => handlePrev()}
    //           >
    //             上一步
    //           </NButton>
    //         )}
    //         {!isLast && (
    //           <NButton
    //             key="next"
    //             size="small"
    //             type="primary"
    //             onClick={() => handleNext()}
    //           >
    //             下一步
    //           </NButton>
    //         )}
    //         {isLast && (
    //           <NButton
    //             key="finish"
    //             size="small"
    //             type="primary"
    //             onClick={() => handleFinish()}
    //           >
    //             完成
    //           </NButton>
    //         )}
    //       </div>
    //     </div>
    //   )
    // }

    // const renderReference = () => {
    //   return (
    //     <div
    //       class={`${mergedClsPrefix}-tour-fixed`}
    //       style={{
    //         ...this.cssVars as CSSProperties,
    //         ...referenceStyle
    //       }}
    //     />
    //   )
    // }

    return (
      <VLazyTeleport to={this.to} show={this.controlledShow}>
        {{
          default: () => {
            this.onRender?.()
            return [
              withDirectives(
                <div
                  class={[
                    `${mergedClsPrefix}-tour`
                  ]}
                >
                  {
                    mergedShowMask ? (
                      <TourMask
                        pos={pos}
                        zIndex={zIndex - 2}
                        targetAreaClickable={targetAreaClickable}
                      />
                    ) : null

                  }
                  {
                    this.controlledShow ? (
                      <TourSteps
                        key={controlledCurrent}
                        reference={triggerTarget}
                        placement={mergedPlacement}
                        showArrow={mergedShowArrow}
                        zIndex={zIndex - 1}
                      />
                    ) : null
                  }
                </div>,
                [
                  [zindexable, { zIndex: (this.zIndex), enabled: this.show }]
                ]
              ),
            ]
          }
        }}
      </VLazyTeleport>
    )
  }
})
