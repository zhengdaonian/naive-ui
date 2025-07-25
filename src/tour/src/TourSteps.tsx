import type { Placement, Strategy, VirtualElement } from '@floating-ui/dom'
import type { ThemeProps } from '../../_mixins'
import type { TourTheme } from '../styles'
import {
  computed,
  type CSSProperties,
  defineComponent,
  type DirectiveArguments,
  Fragment,
  h,
  inject,
  mergeProps,
  onBeforeUnmount,
  type PropType,
  provide,
  ref,
  toRef,
  Transition,
  type VNode,
  type VNodeChild,
  vShow,
  watchEffect,
  withDirectives
} from 'vue'
import {
  type FollowerInst,
  type FollowerPlacement,
  VFocusTrap,
  VFollower
} from 'vueuc'
import { useConfig, useTheme, useThemeClass } from '../../_mixins'
import {
  isJsdom,
  isSlotEmpty,
  resolveWrappedSlot,
  useAdjustedTo
} from '../../_utils'
import { drawerBodyInjectionKey } from '../../drawer/src/interface'
import { modalBodyInjectionKey } from '../../modal/src/interface'
import { tourLight } from '../styles'
import { useFloating } from './hooks/useFloating'
// import { tourBodyInjectionKey } from './interface'
import style from './styles/index.cssr'
import { type TourInjection, tourInjectionKey } from './Tour'

export const tourStrategies = ['absolute', 'fixed'] as const

export const tourBodyProps = {
  ...(useTheme.props as ThemeProps<TourTheme>),
  reference: {
    type: Object as PropType<HTMLElement | VirtualElement | null>,
    default: null,
  },
  placement: {
    type: String as PropType<Placement>,
    default: 'bottom',
  },
  strategy: {
    type: String as PropType<Strategy>,
    default: 'absolute',
  },
  offset: {
    type: Number,
    default: 10,
  },
  showArrow: Boolean,
  zIndex: {
    type: Number,
    default: 9998
  },
  // arrowClass: String,
  // arrowStyle: [String, Object] as PropType<string | CSSProperties>,
  // arrowWrapperClass: String,
  // arrowWrapperStyle: [String, Object] as PropType<string | CSSProperties>,
  // flip: Boolean,
  // placement: String as PropType<FollowerPlacement>,
  // contentClass: String,
  // contentStyle: [Object, String] as PropType<CSSProperties | string>,
  // headerClass: String,
  // headerStyle: [Object, String] as PropType<CSSProperties | string>,
  // footerClass: String,
  // footerStyle: [Object, String] as PropType<CSSProperties | string>,
}

interface RenderArrowProps {
  arrowClass: string | undefined
  arrowStyle: string | CSSProperties | undefined
  arrowWrapperClass: string | undefined
  arrowWrapperStyle: string | CSSProperties | undefined
  clsPrefix: string
}

export function renderArrow({
  arrowClass,
  arrowStyle,
  arrowWrapperClass,
  arrowWrapperStyle,
  clsPrefix
}: RenderArrowProps): VNode | null {
  return (
    <div
      key="__tour-arrow__"
      style={arrowWrapperStyle}
      class={[`${clsPrefix}-tour-arrow-wrapper`, arrowWrapperClass]}
    >
      <div
        class={[`${clsPrefix}-tour-arrow`, arrowClass]}
        style={arrowStyle}
      />
    </div>
  )
}

export default defineComponent({
  name: 'TourBody',
  inheritAttrs: false,
  props: tourBodyProps,
  setup(props, { slots, attrs }) {
    const { mergedClsPrefixRef }
              = inject(tourInjectionKey)!
    // const { namespaceRef, mergedClsPrefixRef, inlineThemeDisabled }
    //   = useConfig(props)
    // const followerRef = ref<FollowerInst | null>(null)
    // const NTour = inject<TourInjection>('NTour') as TourInjection
    // const bodyRef = ref<HTMLElement | null>(null)
    // const followerEnabledRef = ref(props.show)
    // const displayedRef = ref(false)
    // watchEffect(() => {
    //   const { show } = props
    //   if (show && !isJsdom()) {
    //     displayedRef.value = true
    //   }
    // })
    // const directivesRef = computed<DirectiveArguments>(() => {
    //   const directives: DirectiveArguments = []
    //   if (
    //     (displayedRef.value)
    //   ) {
    //     directives.push([vShow, props.show])
    //   }
    //   return directives
    // })

    // const cssVarsRef = computed(() => {
    //   const {
    //     common: { cubicBezierEaseInOut, cubicBezierEaseIn, cubicBezierEaseOut },
    //     self: {
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

    //   return {
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
    //     '--n-space-arrow': spaceArrow
    //   }
    // })
    // const styleRef = computed(() => {
    //   const style: CSSProperties[] = []
    //   if (!inlineThemeDisabled) {
    //     style.push(cssVarsRef.value)
    //   }
    //   return style
    // })
    // const themeClassHandle = inlineThemeDisabled
    //   ? useThemeClass('tour', undefined, cssVarsRef, props)
    //   : undefined
    // // NTour.setBodyInstance({
    // //   syncPosition
    // // })
    // // onBeforeUnmount(() => {
    // //   NTour.setBodyInstance(null)
    // // })
    // // function syncPosition(): void {
    // //   followerRef.value?.syncPosition()
    // // }
    // // provide(tourBodyInjectionKey, bodyRef)
    // provide(drawerBodyInjectionKey, null)
    // provide(modalBodyInjectionKey, null)

    const contentRef = ref()
    const arrowRef = ref<HTMLElement | null>(null)
    const placement = ref(props.placement)
    const strategy = ref(props.strategy)

    const { contentStyle, arrowStyle } = useFloating(
      toRef(props, 'reference'),
      contentRef,
      arrowRef,
      placement,
      strategy,
      toRef(props, 'offset'),
      toRef(props, 'zIndex'),
      toRef(props, 'showArrow')
    )

    function renderContentNode(): VNode | null {
      // themeClassHandle?.onRender()
      let contentNode: VNode
      // const renderBody = NTour.internalRenderBodyRef.value
      const { value: mergedClsPrefix } = mergedClsPrefixRef
      if (true) {
        // const { value: extraClass } = NTour.extraClassRef
        const hasHeaderOrFooter
          = !isSlotEmpty(slots.header) || !isSlotEmpty(slots.footer)
        const renderContentInnerNode = (): VNodeChild[] => {
          const body = hasHeaderOrFooter ? (
            <>
              {resolveWrappedSlot(slots.header, (children) => {
                return children ? (
                  <div
                    class={[
                      `${mergedClsPrefix}-tour__header`,
                      props.headerClass
                    ]}
                    style={props.headerStyle}
                  >
                    {children}
                  </div>
                ) : null
              })}
              {resolveWrappedSlot(slots.default, (children) => {
                return children ? (
                  <div
                    class={[
                      `${mergedClsPrefix}-tour__content`,
                      props.contentClass
                    ]}
                    style={props.contentStyle}
                  >
                    {slots}
                  </div>
                ) : null
              })}
              {resolveWrappedSlot(slots.footer, (children) => {
                return children ? (
                  <div
                    class={[
                      `${mergedClsPrefix}-tour__footer`,
                      props.footerClass
                    ]}
                    style={props.footerStyle}
                  >
                    {children}
                  </div>
                ) : null
              })}
            </>
          ) : (
            <div
              class={[
                `${mergedClsPrefix}-tour__content`,
                props.contentClass
              ]}
              style={props.contentStyle}
            >
              {slots}
            </div>
          )
          const arrow = props.showArrow
            ? renderArrow({
                arrowClass: props.arrowClass,
                arrowStyle: props.arrowStyle,
                arrowWrapperClass: props.arrowWrapperClass,
                arrowWrapperStyle: props.arrowWrapperStyle,
                clsPrefix: mergedClsPrefix
              })
            : null
          return [body, arrow]
        }
        contentNode = h(
          'div',
          mergeProps(
            {
              class: [
                `${mergedClsPrefix}-tour`,
                `${mergedClsPrefix}-tour-shared`,
              // themeClassHandle?.themeClass.value,
              // extraClass.map(v => `${mergedClsPrefix}-${v}`),
              // {
              //   [`${mergedClsPrefix}-tour--show-header-or-footer`]:
              //     hasHeaderOrFooter,
              //   [`${mergedClsPrefix}-tour--raw`]: props.raw,
              //   [`${mergedClsPrefix}-tour-shared--show-arrow`]:
              //     props.showArrow,
              // }
              ],
              // ref: bodyRef,
              style: contentStyle.value
            },
            attrs
          ),
          <VFocusTrap autoFocus>
            {{ default: renderContentInnerNode }}
          </VFocusTrap>
        )
      }
      else {
        contentNode = renderBody(
          [
            `${mergedClsPrefix}-tour-shared`,
            themeClassHandle?.themeClass.value,
            props.showArrow && `${mergedClsPrefix}-tour-shared--show-arrow`,
          ],
          bodyRef,
          contentStyle.value
        )
      }
      return withDirectives(contentNode, [])
    }

    return {
      contentStyle,
      arrowStyle,
      // displayed: displayedRef,
      // namespace: namespaceRef,
      // // isMounted: NTour.isMountedRef,
      // // zIndex: NTour.zIndexRef,
      // followerRef,
      // adjustedTo: useAdjustedTo(props),
      // followerEnabled: followerEnabledRef,
      renderContentNode
    }
  },
  render() {
    return this.renderContentNode()
  }
})
