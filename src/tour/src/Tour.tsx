import type { ThemeProps } from '../../_mixins'
import type { TourStepProps } from './interface'
import { zindexable } from 'vdirs'
import { useMergedState } from 'vooks'
import { computed, defineComponent, h, mergeProps, provide, ref, toRef, watch, withDirectives } from 'vue'
import { VLazyTeleport } from 'vueuc'
import { useConfig, useTheme, useThemeClass } from '../../_mixins'
import { tourLight, type TourTheme } from '../styles'
import { useTarget } from './hooks/useTarget'
import { tourBaseProps, tourInjectionKey } from './interface'
import style from './styles/index.cssr'
import TourContent from './TourContent'
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
      // eslint-disable-next-line no-empty-pattern
      const {
      } = themeRef.value
      return {
      }
    })
    const themeClassHandle = inlineThemeDisabled
      ? useThemeClass('theme-class', undefined, cssVarsRef, props)
      : undefined

    const total = ref(0)
    const currentStep = ref<TourStepProps>()

    const currentTarget = computed(() => currentStep.value?.target)

    const mergedMask = computed(() => currentStep.value?.showMask ?? props.showMask)
    const mergedShowMask = computed(() => !!mergedMask.value && props.show)

    const mergedScrollIntoViewOptions = computed(
      () => currentStep.value?.scrollIntoViewOptions ?? props.scrollIntoViewOptions
    )

    const mergedPlacement = computed(
      () => currentStep.value?.placement || props.placement
    )

    const uncontrolledCurrentRef = ref(props.defaultCurrent)
    const controlledCurrentRef = computed(() => props.current)
    const mergedCurrentRef = useMergedState(
      controlledCurrentRef,
      uncontrolledCurrentRef
    )

    const mergedShowArrow = computed(
      () =>
        !!currentTarget.value && (currentStep.value?.showArrow ?? props.showArrow)
    )

    const { mergedPosInfo: pos, triggerTarget } = useTarget(
      currentTarget,
      toRef(props, 'show'),
      toRef(props, 'gap'),
      mergedMask,
      mergedScrollIntoViewOptions
    )

    watch(
      () => props.show,
      (val) => {
        if (!val) {
          uncontrolledCurrentRef.value = 0
        }
      }
    )

    provide(tourInjectionKey, {
      currentStep,
      current: mergedCurrentRef,
      total
    })
    return {
      mergedClsPrefix: mergedClsPrefixRef,
      themeClass: themeClassHandle?.themeClass,
      namespace: namespaceRef,
      mergedShowMask,
      onRender: themeClassHandle?.onRender,
      pos,
      triggerTarget,
      mergedPlacement,
      mergedShowArrow
    }
  },
  render() {
    const {
      $slots,
      mergedClsPrefix,
      to,
      show,
      mergedShowMask,
      pos,
      targetAreaClickable,
      current,
      triggerTarget,
      mergedPlacement,
      mergedShowArrow
    } = this
    return (
      <VLazyTeleport to={to} show={show}>
        {{
          default: () => {
            this.onRender?.()
            return withDirectives(
              <div {
                ...mergeProps(this.$attrs, {
                  class: [
                    `${mergedClsPrefix}-tour`,
                    this.themeClass,
                    this.namespace
                  ]
                })
              }
              >
                <TourMask
                  prefixCls={mergedClsPrefix}
                  showMask={mergedShowMask}
                  pos={pos}
                  target-area-clickable={targetAreaClickable}
                >
                </TourMask>
                {show && (
                  <TourContent
                    key={current}
                    show={show}
                    prefixCls={mergedClsPrefix}
                    reference={triggerTarget}
                    placement={mergedPlacement}
                    show-arrow={mergedShowArrow}
                    z-index={this.zIndex}
                  >
                    <TourSteps current={current}>
                      {$slots.default?.()}
                    </TourSteps>
                  </TourContent>
                )}
                {/* :current="current" @update-total="onUpdateTotal" */}
              </div>,
              [
                [zindexable, { zIndex: this.zIndex, enabled: this.show }]
              ]
            )
          }
        }}
      </VLazyTeleport>
    )
  }
})
