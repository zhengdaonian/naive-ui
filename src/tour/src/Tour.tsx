import type { CSSProperties, PropType, } from 'vue'
import type { TourTheme } from '../styles/light'
import { zindexable } from 'vdirs'
import { useIsMounted } from 'vooks'
import {
  computed,
  defineComponent,
  h,
  Transition,
  withDirectives
} from 'vue'
import { type FollowerPlacement, VLazyTeleport } from 'vueuc'
import { type ThemeProps, useConfig, useTheme, useThemeClass } from '../../_mixins'
import { call, type MaybeArray } from '../../_utils'
import tourLight from '../styles/light'
import NTourBodyWrapper from './BodyWrapper'
import style from './styles/index.cssr'

export const tourProps = {
  ...(useTheme.props as ThemeProps<TourTheme>),
  to: {
    type: [String, Object] as PropType<string | HTMLElement>,
    default: 'body',
  },
  placement: {
    type: String as PropType<FollowerPlacement>,
    default: 'top'
  },
  show: {
    type: Boolean as PropType<boolean>,
    default: true
  },
  unstableShowMask: {
    type: Boolean,
    default: true
  },
  showArrow: {
    type: Boolean,
    default: true,
  },
  arrowClass: String,
  arrowStyle: [String, Object] as PropType<string | CSSProperties>,
  contentClass: String,
  contentStyle: [Object, String] as PropType<CSSProperties | string>,
  showMask: {
    type: [Boolean, String] as PropType<boolean | 'transparent'>,
    default: true
  },
  type: {
    type: String as PropType<'default' | 'primary'>,
    default: 'default'
  },
  current: {
    type: Number,
    default: 0
  },
  maskClosable: {
    type: Boolean,
    default: true
  },
  onMaskClick: Function as PropType<(e: MouseEvent) => void>,
  scrollIntoViewOptions: {
    type: [Boolean, Object] as PropType<boolean | ScrollIntoViewOptions>,
    default: () => ({
      block: 'center',
    }),
  },
  'onUpdate:show': [Function, Array] as PropType<
    MaybeArray<(value: boolean) => void>
  >,
  onUpdateShow: [Function, Array] as PropType<
    MaybeArray<(value: boolean) => void>
  >,
  zIndex: Number
} as const

export default defineComponent({
  name: 'Tour',
  inheritAttrs: false,
  props: tourProps,
  setup(props) {
    const { mergedClsPrefixRef, namespaceRef, inlineThemeDisabled } = useConfig(props)
    const isMountedRef = useIsMounted()
    const themeRef = useTheme(
      'Tour',
      '-tour',
      style,
      tourLight,
      props,
      mergedClsPrefixRef
    )
    const cssVarsRef = computed<Record<string, string>>(() => {
      const {
        common: { cubicBezierEaseIn, cubicBezierEaseOut },
        self: {}
      } = themeRef.value
      return {
        '--n-bezier-out': cubicBezierEaseOut,
        '--n-bezier-in': cubicBezierEaseIn,
      }
    })
    const themeClassHandle = inlineThemeDisabled
      ? useThemeClass('theme-class', undefined, cssVarsRef, props)
      : undefined

    function doUpdateShow(show: boolean): void {
      const { onUpdateShow, 'onUpdate:show': _onUpdateShow } = props
      if (onUpdateShow)
        call(onUpdateShow, show)
      if (_onUpdateShow)
        call(_onUpdateShow, show)
    }

    function handleMaskClick(e: MouseEvent): void {
      const { onMaskClick, maskClosable } = props
      if (maskClosable) {
        doUpdateShow(false)
      }
      if (onMaskClick)
        onMaskClick(e)
    }

    function handleOutsideClick(e: MouseEvent): void {
      handleMaskClick(e)
    }

    return {
      mergedClsPrefix: mergedClsPrefixRef,
      namespace: namespaceRef,
      cssVars: inlineThemeDisabled ? undefined : cssVarsRef,
      themeClass: themeClassHandle?.themeClass,
      handleMaskClick,
      onRender: themeClassHandle?.onRender,
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
                class={[
                  `${mergedClsPrefix}-tour-container`,
                  this.namespace,
                  this.themeClass
                ]}
                style={this.cssVars as CSSProperties}
                role="none"
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
                            onClick={this.handleMaskClick}
                          />
                        ) : null
                    }}
                  </Transition>

                ) : null}
                <NTourBodyWrapper
                  {...this.$attrs}
                  ref="bodyWrapper"
                  show={this.show}
                  showMask={this.showMask}
                  onClickoutside={this.handleOutsideClick}
                >
                  {this.$slots}
                </NTourBodyWrapper>
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
