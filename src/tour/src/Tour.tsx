import type { CSSProperties, PropType, } from 'vue'
import type { TourTheme } from '../styles/light'
import { zindexable } from 'vdirs'
import {
  computed,
  defineComponent,
  h,
  Transition,
  withDirectives
} from 'vue'
import { type FollowerPlacement, VLazyTeleport } from 'vueuc'
import { type ThemeProps, useConfig, useTheme, useThemeClass } from '../../_mixins'
import tourLight from '../styles/light'
import NTourBodyWrapper from './BodyWrapper'
import style from './styles/index.cssr'

export const tourProps = {
  ...(useTheme.props as ThemeProps<TourTheme>),
  show: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  unstableShowMask: {
    type: Boolean,
    default: true
  },
  to: {
    type: [String, Object] as PropType<string | HTMLElement>,
    default: 'body',
  },
  showArrow: {
    type: Boolean,
    default: true,
  },
  arrowClass: String,
  arrowStyle: [String, Object] as PropType<string | CSSProperties>,
  placement: {
    type: String as PropType<FollowerPlacement>,
    default: 'top'
  },
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
  scrollIntoViewOptions: {
    type: [Boolean, Object] as PropType<boolean | ScrollIntoViewOptions>,
    default: () => ({
      block: 'center',
    }),
  },
  zIndex: Number
} as const

export default defineComponent({
  name: 'Tour',
  inheritAttrs: false,
  props: tourProps,
  setup(props) {
    const { mergedClsPrefixRef, namespaceRef, inlineThemeDisabled } = useConfig(props)
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
        self: {},
        common: {}
      } = themeRef.value
      return {

      }
    })
    const themeClassHandle = inlineThemeDisabled
      ? useThemeClass('theme-class', undefined, cssVarsRef, props)
      : undefined
    return {
      mergedClsPrefix: mergedClsPrefixRef,
      namespace: namespaceRef,
      cssVars: inlineThemeDisabled ? undefined : cssVarsRef,
      themeClass: themeClassHandle?.themeClass,
      onRender: themeClassHandle?.onRender
    }
  },

  render() {
    const { mergedClsPrefix } = this
    return (
      <VLazyTeleport to={this.to} show={this.show}>
        {{
          default: () => {
            this.onRender?.()
            const { unstableShowMask } = this
            return withDirectives(
              <div
                role="none"
                ref="containerRef"
                class={[
                  `${mergedClsPrefix}-tour-container`,
                  this.themeClass,
                  this.namespace
                ]}
                style={this.cssVars as CSSProperties}
              >
                <NTourBodyWrapper
                  {...this.$attrs}
                  ref="bodyWrapper"
                  show={this.show}
                  renderMask={
                    unstableShowMask
                      ? () => (
                          <Transition
                            name="fade-in-transition"
                            key="mask"
                            appear={this.internalAppear ?? this.isMounted}
                          >
                            {{
                              default: () => {
                                return this.show ? (
                                  <div
                                    aria-hidden
                                    ref="containerRef"
                                    class={`${mergedClsPrefix}-modal-mask`}
                                    onClick={this.handleClickoutside}
                                  />
                                ) : null
                              }
                            }}
                          </Transition>
                        )
                      : undefined
                  }
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
