import type {
  CSSProperties
} from 'vue'
import type { ThemeProps } from '../../_mixins'
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
import { call } from '../../_utils'
import { tourLight, type TourTheme } from '../styles'
import { useTarget } from './hooks/useTarget'
import {
  tourBaseProps,
  TourStepOptions,
  tourInjectionKey
} from './interface'
import style from './styles/index.cssr'
import { scrollToParentVisibleArea } from './utils/getScrollParet'
import { getTargetEl } from './utils/getTargetEl'

export const tourProps = {
  ...(useTheme.props as ThemeProps<TourTheme>),
  ...tourBaseProps
}

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
      const {
        common: { cubicBezierEaseInOut, cubicBezierEaseIn, cubicBezierEaseOut },
        self: {
          placeholderColor,
          space,
          spaceArrow,
          padding,
          fontSize,
          textColor,
          dividerColor,
          color,
          boxShadow,
          borderRadius,
          arrowHeight,
          arrowOffset,
          arrowOffsetVertical
        }
      } = themeRef.value

      return {
        '--n-box-shadow': boxShadow,
        '--n-bezier': cubicBezierEaseInOut,
        '--n-bezier-ease-in': cubicBezierEaseIn,
        '--n-bezier-ease-out': cubicBezierEaseOut,
        '--n-font-size': fontSize,
        '--n-text-color': textColor,
        '--n-color': color,
        '--n-divider-color': dividerColor,
        '--n-border-radius': borderRadius,
        '--n-arrow-height': arrowHeight,
        '--n-arrow-offset': arrowOffset,
        '--n-arrow-offset-vertical': arrowOffsetVertical,
        '--n-padding': padding,
        '--n-space': space,
        '--n-space-arrow': spaceArrow,
        '--n-placeholder-color': placeholderColor,
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

    // currentStep.value?.scrollIntoViewOptions ??
    const mergedScrollIntoViewOptions = computed(
      () => props.scrollIntoViewOptions
    )

    const mergedPlacement = computed(
      () => currentStep.value?.placement || props.placement
    )

    const mergedMask = computed(() => currentStep.value?.showMask ?? props.showMask)
    const mergedShowMask = computed(() => !!mergedMask.value && props.show)

    const mergedShowArrow = computed(
      () =>
        !!currentTarget.value && (currentStep.value?.showArrow ?? props.showArrow)
    )

    const { mergedPosInfo: pos } = useTarget(
      currentTarget,
      controlledShowRef,
      toRef(props, 'gap'),
      mergedMask,
      mergedScrollIntoViewOptions
    )

    const referenceStyle = computed(() => {
      return {
        top: `${pos.value?.top || 0}px`,
        left: `${pos.value?.left || 0}px`,
        width: `${pos.value?.width || 0}px`,
        height: `${pos.value?.height || 0}px`,
      }
    })

    function doUpdateCurrent(current: number): void {
      const { onUpdateCurrent, 'onUpdate:current': _onUpdateCurrent } = props
      if (onUpdateCurrent)
        call(onUpdateCurrent, current)
      if (_onUpdateCurrent)
        call(_onUpdateCurrent, current)
      controlledCurrentRef.value = current
    }

    function doUpdateShow(show: boolean): void {
      const { onUpdateShow, 'onUpdate:show': _onUpdateShow } = props
      if (onUpdateShow)
        call(onUpdateShow, show)
      if (_onUpdateShow)
        call(_onUpdateShow, show)
      controlledShowRef.value = show
    }

    const handlePrev = () => {
      if (!controlledShowRef.value || controlledCurrentRef.value <= 0)
        return
      doUpdateCurrent(controlledCurrentRef.value - 1)
    }

    const handleNext = () => {
      if (!controlledShowRef.value) return
      doUpdateCurrent(controlledCurrentRef.value + 1)
    }

    const handleSkip = () => {
      if (!controlledShowRef.value) return
      doUpdateShow(false)
      const { onSkip } = props
      if (onSkip)
        call(onSkip, controlledCurrentRef.value, totalSteps.value)
    }

    const handleFinish = () => {
      if (!controlledShowRef.value) return
      doUpdateShow(false)
      const { onFinish } = props
      if (onFinish)
        call(onFinish, controlledCurrentRef.value, totalSteps.value)
    }

    const handleClose = () => {
      if (!controlledShowRef.value) return
      doUpdateShow(false)
      const { onClose } = props
      if (onClose)
        call(onClose, controlledCurrentRef.value, totalSteps.value)
    }

    // 当前高亮的元素
    const currentHighlightLayerElm = ref<HTMLElement>()

    // watch(
    //   () => props.show,
    //   (value) => {
    //     // currentHighlightLayerElm.value = getTargetEl(currentTarget)
    //     // if (currentHighlightLayerElm.value)
    //     //   return
    //     // scrollToParentVisibleArea(currentHighlightLayerElm.value)
    //     // console.log(getTargetEl(currentTarget))
    //   }
    // )

    watch(
      () => props.current,
      (value) => {
        controlledCurrentRef.value = Math.max(0, value)
      },
    )

    // watch(controlledCurrentRef, (val) => {
    //   if (val >= 0 && val < allSteps.value.length) {
    //     console.log(val, allSteps.value.length)
    //     // popupVisible.value = false
    //     // initGuide()
    //   }
    // })

    // const renderModal = () => {

    // }

    function increaseStep(step: TourStepOptions) {
      tmpSteps.add(step)
    }

    function decreaseStep(step: TourStepOptions) {
      tmpSteps.delete(step)
    }

    provide(tourInjectionKey, {
      increaseStep,
      decreaseStep,
    })

    return {
      mergedClsPrefix: mergedClsPrefixRef,
      cssVars: inlineThemeDisabled ? undefined : cssVarsRef,
      onRender: themeClassHandle?.onRender,
      mergedShowMask,
      referenceStyle,
      currentStep,
      controlledCurrent: controlledCurrentRef,
      allSteps,
      controlledShow: controlledShowRef,
      handlePrev,
      handleNext,
      handleSkip,
      handleFinish
    }
  },
  render() {
    const {
      mergedClsPrefix,
      mergedShowMask,
      referenceStyle,
      currentStep,
      controlledShow,
      controlledCurrent,
      allSteps,
      handlePrev,
      handleSkip,
      handleNext,
      handleFinish
    } = this

    const renderTitle = () => {
      return (
        <span>
          {currentStep.title || ''}
        </span>
      )
    }

    const renderContent = () => {
      return (
        <span>
          {currentStep.content || ''}
        </span>
      )
    }

    const renderFooter = () => {
      const { hideSkip, hidePrev } = this
      const isLast = controlledCurrent === allSteps.length - 1
      const isFirst = controlledCurrent === 0
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            class={`${mergedClsPrefix}-tour-counter`}
            style={{
              ...this.cssVars as CSSProperties
            }}
          >
            { `${controlledCurrent + 1}/${allSteps.length}` }
          </div>
          <div
            class={`${mergedClsPrefix}-tour-action`}
            style={{
              ...this.cssVars as CSSProperties
            }}
          >
            {!hideSkip && !isLast && (
              <NButton
                key="skip"
                type="default"
                size="small"
                onClick={() => handleSkip()}
              >
                跳过
              </NButton>
            )}
            {!hidePrev && !isFirst && (
              <NButton
                key="prev"
                type="default"
                size="small"
                onClick={() => handlePrev()}
              >
                上一步
              </NButton>
            )}
            {!isLast && (
              <NButton
                key="next"
                size="small"
                type="primary"
                onClick={() => handleNext()}
              >
                下一步
              </NButton>
            )}
            {isLast && (
              <NButton
                key="finish"
                size="small"
                type="primary"
                onClick={() => handleFinish()}
              >
                完成
              </NButton>
            )}
          </div>
        </div>
      )
    }

    const renderReference = () => {
      return (
        <div
          class={`${mergedClsPrefix}-tour-fixed`}
          style={{
            ...this.cssVars as CSSProperties,
            ...referenceStyle
          }}
        />
      )
    }

    const renderPopover = () => {
      return (
        <NPopover zIndex={this.zIndex - 1} show={controlledShow}>
          {{
            header: () => h(renderTitle),
            trigger: () => h(renderReference),
            default: () => h(renderContent),
            footer: () => h(renderFooter)
          }}
        </NPopover>
      )
    }

    return (
      <VLazyTeleport to={this.to} show={this.controlledShow}>
          {{
            default: () => {
              this.onRender?.()
              return [

                
                renderPopover(),


                withDirectives(
                  <div
                    class={[
                      `${mergedClsPrefix}-tour`
                    ]}
                  >
                    {this.controlledShow ? (
                      <>
                        <div
                          class={[
                            `${mergedClsPrefix}-tour-overlay`
                          ]}
                        />
                        <div
                          class={[
                            `${mergedClsPrefix}-tour-highlight`,
                            `${mergedClsPrefix}-tour-fixed`,
                            `${mergedClsPrefix}-tour-${mergedShowMask ? 'mask' : 'noMask'}`,
                          ]}
                          style={{
                            ...this.cssVars as CSSProperties,
                            ...referenceStyle
                          }}
                        />
                      </>
                    ): null}
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
