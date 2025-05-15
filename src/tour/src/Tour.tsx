import type { ThemeProps } from '../../_mixins'
import type {
  ExtractInternalPropTypes,
  ExtractPublicPropTypes,
  MaybeArray
} from '../../_utils'
import type {
  InternalRenderBody,
  InternalTourInst,
  TourTrigger
} from './interface'
import { zindexable } from 'vdirs'
import { useIsMounted, useMemo, useMergedState } from 'vooks'
import {
  cloneVNode,
  computed,
  type ComputedRef,
  type CSSProperties,
  defineComponent,
  h,
  type PropType,
  provide,
  type Ref,
  ref,
  type SlotsType,
  Text,
  toRef,
  Transition,
  type VNode,
  watchEffect,
  withDirectives
} from 'vue'
import {
  type BinderInst,
  type FollowerPlacement,
  VBinder,
  VLazyTeleport,
  VTarget
} from 'vueuc'
import { useConfig, useTheme, useThemeClass } from '../../_mixins'
import {
  call,
  getFirstSlotVNode,
  keep,
  useAdjustedTo
} from '../../_utils'
import { tourLight, type TourTheme } from '../styles'
import NTourBodyWrapper, { tourBodyProps } from './BodyWrapper'
import style from './styles/index.cssr'

export interface TriggerEventHandlers {
  onClick: (e: MouseEvent) => void
  onMouseenter: (e: MouseEvent) => void
  onMouseleave: (e: MouseEvent) => void
  onFocus: (e: FocusEvent) => void
  onBlur: (e: FocusEvent) => void
}

export interface TourInjection {
  zIndexRef: Ref<number | undefined>
  isMountedRef: Ref<boolean>
  internalRenderBodyRef: Ref<InternalRenderBody | undefined>
  extraClassRef: Ref<string[]>
}

export const tourProps = {
  ...(useTheme.props as ThemeProps<TourTheme>),
  show: Boolean,
  showArrow: {
    type: Boolean,
    default: true
  },
  to: [String, Object] as PropType<string | HTMLElement>,
  showMask: {
    type: [Boolean, String] as PropType<boolean | 'transparent'>,
    default: true
  },
  zIndex: Number,
  internalRenderBody: Function as PropType<InternalRenderBody>,
  internalExtraClass: {
    type: Array as PropType<string[]>,
    default: () => []
  },
}

export const tourStepProps = {
  target: {
    type: [String, Object, Function] as PropType<string | HTMLElement | (() => HTMLElement | null) | null> ,
  },
}

export default defineComponent({
  name: 'Tour',
  inheritAttrs: false,
  props: tourProps,
  // slots: Object as SlotsType<TourSlots>,
  __popover__: true,
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
        common: { cubicBezierEaseOut },
        self: { boxShadow, color, textColor }
      } = themeRef.value
      return {
        '--n-bezier-ease-out': cubicBezierEaseOut,
        '--n-box-shadow': boxShadow,
        '--n-color': color,
        '--n-text-color': textColor
      }
    })
    const themeClassHandle = inlineThemeDisabled
      ? useThemeClass('theme-class', undefined, cssVarsRef, props)
      : undefined

    const currentStep = ref<tourStepProps>()
    const currentTarget = computed(() => currentStep.value?.target)
    const mergedShowArrow = computed(
      () =>
        !!currentTarget.value && (currentStep.value?.showArrow ?? props.showArrow)
    )

    //     getTriggerElement,
    // handleKeydown,
    // handleMouseEnter,
    // handleMouseLeave,
    // handleClickOutside,
    // handleMouseMoveOutside,
    // setBodyInstance,
    // positionManuallyRef,
    //       extraClassRef: toRef(props, 'internalExtraClass'),
    // internalRenderBodyRef: toRef(props, 'internalRenderBody')
    provide<TourInjection>('NTour', {
      isMountedRef,
      zIndexRef: toRef(props, 'zIndex'),
      extraClassRef: toRef(props, 'internalExtraClass'),
      internalRenderBodyRef: toRef(props, 'internalRenderBody')
    })

    return {
      mergedClsPrefix: mergedClsPrefixRef,
      namespace: namespaceRef,
      cssVars: inlineThemeDisabled ? undefined : cssVarsRef,
      themeClass: themeClassHandle?.themeClass,
      onRender: themeClassHandle?.onRender,
      mergedShowArrow,
      isMounted: isMountedRef
    }
  },
  render() {
    const { mergedClsPrefix } = this
    return (
      <VLazyTeleport to={this.to} show={this.show}>
        {{
          default: () => {
            this.onRender?.()
            return withDirectives(
              <div
                role="none"
                ref="containerRef"
                class={[
                  `${mergedClsPrefix}-tour`,
                  this.themeClass,
                  this.namespace
                ]}
                style={this.cssVars as CSSProperties}
              >
                {this.showMask ? (
                  <Transition name="fade-in-transition" appear={this.isMounted}>
                    {{
                      default: () =>
                        this.show ? (
                          <div
                            aria-hidden
                            class={[
                              `${mergedClsPrefix}-tour-mask`,
                              this.showMask === 'transparent'
                              && `${mergedClsPrefix}-tour-mask--invisible`
                            ]}
                          />
                        ) : null
                    }}
                  </Transition>
                ) : null}
                
              </div>,
              [
                [
                  zindexable,
                  {
                    zIndex: this.zIndex,
                    enabled: this.show
                  }
                ]
              ]
            )
          }
        }}
      </VLazyTeleport>
    )
  }
})
