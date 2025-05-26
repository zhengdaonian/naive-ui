import type { CSSProperties } from 'vue'
import type { ThemeProps } from '../../_mixins'
import type { TourInjection, TourStepOptions } from './interface'
import { zindexable } from 'vdirs'
import { useIsMounted } from 'vooks'
import { computed, defineComponent, h, provide, reactive, ref, toRef, Transition, watch, withDirectives } from 'vue'
import { VBinder, VLazyTeleport } from 'vueuc'
import { useConfig, useTheme, useThemeClass } from '../../_mixins'
import { call, useAdjustedTo, useLockHtmlScroll } from '../../_utils'
import { tourLight, type TourTheme } from '../styles'
import { useTarget } from './hooks/useTarget'
import { tourBaseProps, tourInjectionKey } from './interface'
import style from './styles/index.cssr'
import TourMask from './TourMask'
import TourSteps from './TourSteps'

export const tourProps = {
  ...(useTheme.props as ThemeProps<TourTheme>),
  ...tourBaseProps
}

export default defineComponent({
  name: 'Tour',
  props: tourProps,
  inheritAttrs: false,
  setup(props) {
    const { mergedClsPrefixRef, namespaceRef, inlineThemeDisabled }
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
        self
      } = themeRef.value
      const {
        space,
        spaceArrow,
        padding,
        fontSize,
        color,
        textColor,
        dividerColor,
        boxShadow,
        borderRadius,
        arrowHeight,
        arrowOffset,
        arrowOffsetVertical
      } = self
      return {
        '--n-bezier': cubicBezierEaseInOut,
        '--n-font-size': fontSize,
        '--n-box-shadow': boxShadow,
        '--n-text-color': textColor,
        '--n-bezier-ease-in': cubicBezierEaseIn,
        '--n-bezier-ease-out': cubicBezierEaseOut,
        '--n-color': color,
        '--n-divider-color': dividerColor,
        '--n-border-radius': borderRadius,
        '--n-arrow-height': arrowHeight,
        '--n-arrow-offset': arrowOffset,
        '--n-arrow-offset-vertical': arrowOffsetVertical,
        '--n-padding': padding,
        '--n-space': space,
        '--n-space-arrow': spaceArrow
      }
    })
    const themeClassHandle = inlineThemeDisabled
      ? useThemeClass('theme-class', undefined, cssVarsRef, props)
      : undefined
    const isMountedRef = useIsMounted()

    const controlledShowRef = toRef(props, 'show')
    const controlledCurrentRef = toRef(props, 'current')
    const tmpSteps: Set<TourStepOptions> = reactive(new Set<any>())

    const allSteps = computed(() => {
      return Array.from(tmpSteps)
        .concat(props.steps)
        .sort((prev, next) => (prev.order || 0) - (next.order || 0))
    })
    const currentStep = computed(() => allSteps.value[controlledCurrentRef.value])

    const currentTarget = computed(() => currentStep.value?.target)
    const mergedMask = computed(() => currentStep.value?.showMask ?? props.showMask)
    const mergedShowMask = computed(() => !!mergedMask.value && props.show)

    const mergedScrollIntoViewOptions = computed(
      () => currentStep.value?.scrollIntoViewOptions ?? props.scrollIntoViewOptions
    )

    const mergedPlacement = computed(
      () => currentStep.value?.placement || props.placement
    )

    const mergedShowArrow = computed(
      () =>
        !!currentTarget.value && (currentStep.value?.showArrow ?? props.showArrow)
    )

    function doUpdateShow(show: boolean): void {
      const { onUpdateShow, 'onUpdate:show': _onUpdateShow } = props
      if (onUpdateShow)
        call(onUpdateShow, show)
      if (_onUpdateShow)
        call(_onUpdateShow, show)
    }

    function doUpdateCurrent(current: number): void {
      const { onUpdateCurrent, 'onUpdate:current': _onUpdateCurrent } = props
      if (onUpdateCurrent)
        call(onUpdateCurrent, current)
      if (_onUpdateCurrent)
        call(_onUpdateCurrent, current)
      controlledCurrentRef.value = 0
    }

    const { mergedPosInfo: pos, triggerTarget } = useTarget(
      currentTarget,
      controlledShowRef,
      toRef(props, 'gap'),
      mergedMask,
      mergedScrollIntoViewOptions
    )

    useLockHtmlScroll(mergedShowMask)

    watch(
      () => controlledShowRef.value,
      (val) => {
        console.log(pos, triggerTarget)
        if (!val) {
          doUpdateCurrent(0)
        }
      }
    )

    const followerEnabledRef = ref(props.show)

    provide<TourInjection>('NTour', {
      isMountedRef
    })
    //   currentStep,
    //   current: currentRef,
    //   total

    return {
      mergedClsPrefix: mergedClsPrefixRef,
      cssVars: inlineThemeDisabled ? undefined : cssVarsRef,
      themeClass: themeClassHandle?.themeClass,
      namespace: namespaceRef,
      isMounted: isMountedRef,
      adjustedTo: useAdjustedTo(props),
      onRender: themeClassHandle?.onRender,
      controlledShowRef,
      mergedShowMask,
      pos,
      currentStep,
      followerEnabled: followerEnabledRef,
      triggerTarget,
      mergedPlacement,
      mergedShowArrow
    }
  },
  render() {
    const {
      mergedClsPrefix,
      to,
      controlledShowRef,
      mergedShowMask,
      targetAreaClickable,
      pos,
      adjustedTo,
      currentStep,
      $slots,
      current,
      triggerTarget,
      mergedPlacement,
      mergedShowArrow
    } = this
    return (
      <VBinder>
        <VLazyTeleport to={this.adjustedTo} show={controlledShowRef}>
          {{
            default: () => {
              this.onRender?.()
              return [
                withDirectives(
                  <div
                    class={[
                      `${mergedClsPrefix}-tour`,
                      this.themeClass,
                      this.namespace
                    ]}
                    style={this.cssVars as CSSProperties}
                    role="none"
                  >
                    <Transition
                      name="fade-in-transition"
                      key="mask"
                      appear={this.isMounted}
                    >
                      {{
                        default: () => {
                          return mergedShowMask ? (
                            <TourMask
                              prefixCls={mergedClsPrefix}
                              pos={pos}
                              target-area-clickable={targetAreaClickable}
                            >
                            </TourMask>
                          ) : null
                        }
                      }}
                    </Transition>
                  </div>,
                  [
                    [zindexable, { zIndex: this.zIndex, enabled: this.show }]
                  ]
                ),
                <TourSteps
                  prefixCls={mergedClsPrefix}
                  show={controlledShowRef}
                  to={to}
                  flip={this.flip}
                  placement={this.mergedPlacement}
                  showArrow={this.mergedShowArrow}
                  cssVars={this.cssVars as CSSProperties}
                >
                  <div>123</div>
                </TourSteps>
              ]
            }
          }}

        </VLazyTeleport>
      </VBinder>
    )
  }
})
