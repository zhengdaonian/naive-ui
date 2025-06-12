import { h, defineComponent, withDirectives, computed, reactive, toRef, Transition, provide } from 'vue'
import { VLazyTeleport } from 'vueuc'
import { ThemeProps, useConfig, useTheme, useThemeClass } from '../../_mixins'
import style from './styles/index.cssr'
import { tourLight, TourTheme } from '../styles'
import { zindexable } from 'naive-ui'
import { tourBaseProps, tourInjectionKey, TourStepOption } from './public-types'
import { useTarget } from './hooks/useTarget'
import { useIsMounted } from 'vooks'
import TourMask from './TourMask'
import { useLockHtmlScroll } from '../../_utils'
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
        controlledShowRef,
        mergedShowMask,
        currentStep,
        pos,
        currentTarget,
        referenceStyle
    }
  },
  render() {
    const { 
        mergedClsPrefix,
        pos,
        referenceStyle
     } = this

    return (
        <VLazyTeleport to={this.to} show={this.controlledShowRef}>
            {{
                default: () => {
                    this.onRender?.()
                    return withDirectives(
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
                                        this.controlledShowRef ? (
                                            <TourMask
                                                pos={pos}
                                            ></TourMask>
                                        ) : null
                                    }}
                                </Transition>
                            ): null}
                            {
                              this.controlledShowRef && this.currentTarget ? (
                                <div
                                  class={`${mergedClsPrefix}-tour-reference`}
                                  style={{
                                    ...referenceStyle
                                  }}
                                />
                              ): null
                            }
                            <div>234</div>
                        </div>,
                        [[zindexable, { zIndex: this.zIndex, enabled: this.controlledShowRef }]]
                    )
                }
            }}
        </VLazyTeleport>
    )
  }
})
