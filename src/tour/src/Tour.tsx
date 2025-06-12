import { h, defineComponent, PropType, Fragment, withDirectives, computed, CSSProperties, reactive, toRef, Transition, provide, watch } from 'vue'
import { VLazyTeleport } from 'vueuc'
import { ThemeProps, useConfig, useTheme, useThemeClass } from '../../_mixins'
import style from './styles/index.cssr'
import { tourLight, TourTheme } from '../styles'
import { NPopover, zindexable } from 'naive-ui'
import { tourBaseProps, tourInjectionKey, TourStepOption } from './public-types'
import { useTarget } from './hooks/useTarget'
import { useIsMounted } from 'vooks'
import TourMask from './TourMask'
import { getTargetEl } from './utils/getTargetEl'
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

    provide(tourInjectionKey, {
        mergedClsPrefixRef
    })

    watch(
        () => controlledShowRef.value,
        (value) => {
            const currentHighlightLayerElm = getTargetEl(currentTarget)
            console.log(currentHighlightLayerElm)
            // scrollToParentVisibleArea(currentHighlightLayerElm)
        }
    )
    
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
        pos
    }
  },
  render() {
    const { 
        mergedClsPrefix,
        pos
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
                            
                        </div>,
                        [[zindexable, { zIndex: this.zIndex, enabled: this.controlledShowRef }]]
                    )
                }
            }}
        </VLazyTeleport>
    )
  }
})
