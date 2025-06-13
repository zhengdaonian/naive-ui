import { h, defineComponent, withDirectives, computed, reactive, toRef, Transition, provide, CSSProperties } from 'vue'
import { VLazyTeleport } from 'vueuc'
import { ThemeProps, useConfig, useTheme, useThemeClass } from '../../_mixins'
import style from './styles/index.cssr'
import { tourLight, TourTheme } from '../styles'
import { NButton, NPopover, zindexable } from 'naive-ui'
import { tourBaseProps, tourInjectionKey, TourStepOption } from './public-types'
import { useTarget } from './hooks/useTarget'
import { useIsMounted } from 'vooks'
import TourMask from './TourMask'
import { call, useLockHtmlScroll } from '../../_utils'
import { usePreventScroll } from './hooks/usePreventScroll'
// import { ThemeProps } from '../../_mixins'

export const tourProps = {
    ...(useTheme.props as ThemeProps<TourTheme>),
   ...tourBaseProps
}

export default defineComponent({
  name: 'Tour',
  inheritAttrs: false,
  props: tourProps,
  setup(props) {
    const { mergedClsPrefixRef, namespaceRef, inlineThemeDisabled }
      = useConfig(props)
    const isMountedRef = useIsMounted()
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

    const tmpSteps: Set<TourStepOption> = reactive(new Set<any>())

    const allSteps = computed(() => {
      return Array.from(tmpSteps)
        .concat(props.steps)
        .sort((prev, next) => (prev.order || 0) - (next.order || 0))
    })
    const currentStep = computed(() => allSteps.value[controlledCurrentRef.value])
    const totalSteps = computed(() => allSteps.value.length)

    const currentTarget = computed(() => currentStep.value?.target)

    const mergedScrollIntoViewOptions = computed(
      () => props.scrollIntoViewOptions
    )

    const mergedMask = computed(() => currentStep.value?.showMask ?? props.showMask)
    const mergedShowMask = computed(() => !!mergedMask.value && props.show)
    
    const { mergedPosInfo: pos } = useTarget(
      currentTarget,
      controlledShowRef,
      toRef(props, 'gap'),
      mergedScrollIntoViewOptions
    )

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

    const referenceStyle = computed(() => {
      console.log(currentTarget)
      return {
        top: `${pos.value?.top || 0}px`,
        left: `${pos.value?.left || 0}px`,
        width: `${pos.value?.width || 0}px`,
        height: `${pos.value?.height || 0}px`,
      }
    })

    provide(tourInjectionKey, {
        mergedClsPrefixRef
    })
    
    useLockHtmlScroll(controlledShowRef)
    usePreventScroll(controlledShowRef)
    
    return {
        mergedClsPrefix: mergedClsPrefixRef,
        namespace: namespaceRef,
        cssVars: inlineThemeDisabled ? undefined : cssVarsRef,
        themeClass: themeClassHandle?.themeClass,
        onRender: themeClassHandle?.onRender,
        isMounted: isMountedRef,
        controlledShow: controlledShowRef,
        mergedShowMask,
        currentStep,
        controlledCurrent: controlledCurrentRef,
        allSteps,
        pos,
        currentTarget,
        referenceStyle,
        handlePrev,
        handleNext,
        handleSkip,
        handleFinish
    }
  },
  render() {
    const { 
        mergedClsPrefix,
        pos,
        referenceStyle,
        zIndex,
        currentStep,
        controlledCurrent,
        allSteps,
        controlledShow,
        handlePrev,
        handleNext,
        handleSkip,
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
          class={`${mergedClsPrefix}-tour-reference`}
          style={{
            ...referenceStyle
          }}
        />
      )
    }

    const renderPopover = () => {
      return (
        <NPopover zIndex={this.zIndex} show={controlledShow}>
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
        <VLazyTeleport to={this.to} show={controlledShow}>
            {{
                default: () => {
                    this.onRender?.()
                    return (
                        <div 
                          class={[
                            `${mergedClsPrefix}-tour`,
                            this.namespace,
                            this.themeClass
                          ]}
                        >
                            {this.mergedShowMask ? (
                                <Transition name="fade-in-transition" appear={this.isMounted}>
                                    {{
                                        default: () =>
                                        controlledShow ? (
                                            <TourMask
                                                pos={pos}
                                                zIndex={zIndex - 2}
                                            ></TourMask>
                                        ) : null
                                    }}
                                </Transition>
                            ): null}
                            {renderPopover()}
                        </div>
                    )
                }
            }}
        </VLazyTeleport>
    )
  }
})
