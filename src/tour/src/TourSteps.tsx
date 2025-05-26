import type { CSSProperties, VNode, VNodeChild } from 'vue'
import type { TourInjection } from './interface'
import { useIsMounted } from 'vooks'
import { computed, defineComponent, Fragment, h, inject, mergeProps, ref, Transition, watchEffect, withDirectives } from 'vue'
import { VFocusTrap, VFollower } from 'vueuc'
import { useConfig, useThemeClass } from '../../_mixins'
import { isJsdom, isSlotEmpty, resolveWrappedSlot, useAdjustedTo } from '../../_utils'
import { tourStepsProps } from './interface'

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
  name: 'TourSteps',
  inheritAttrs: false,
  props: tourStepsProps,
  setup(props, { slots, emit, attrs }) {
    const { namespaceRef, mergedClsPrefixRef, inlineThemeDisabled }
            = useConfig(props)

    const NTour = inject<TourInjection>('NTour') as TourInjection

    const followerEnabledRef = ref(props.show)
    const displayedRef = ref(false)
    watchEffect(() => {
      const { show } = props
      if (show && !isJsdom() && !props.internalDeactivateImmediately) {
        displayedRef.value = true
      }
    })

    const bodyRef = ref<HTMLElement | null>(null)
    function renderContentNode(): VNode | null {
      // const renderBody = NTour.internalRenderBodyRef.value
      const { value: mergedClsPrefix } = mergedClsPrefixRef
      // const { value: extraClass } = NTour.extraClassRef
      const { internalTrapFocus } = props
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
                    // props.headerClass
                  ]}
                  // style={props.headerStyle}
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
                    // props.contentClass
                  ]}
                  // style={props.contentStyle}
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
                    // props.footerClass
                  ]}
                  // style={props.footerStyle}
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
              // props.contentClass
            ]}
            // style={props.contentStyle}
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
      const contentNode: VNode = h(
        'div',
        mergeProps(
          {
            class: [
              `${mergedClsPrefix}-tour`,
              `${mergedClsPrefix}-tour-shared`,
              // themeClassHandle?.themeClass.value,
              // extraClass.map(v => `${mergedClsPrefix}-${v}`),
              {
                [`${mergedClsPrefix}-tour--show-header-or-footer`]:
                      hasHeaderOrFooter,
                // [`${mergedClsPrefix}-tour--raw`]: props.raw,
                // [`${mergedClsPrefix}-tour-shared--overlap`]: props.overlap,
                [`${mergedClsPrefix}-tour-shared--show-arrow`]:
                      props.showArrow,
                // [`${mergedClsPrefix}-tour-shared--center-arrow`]:
                //   props.arrowPointToCenter
              }
            ],
            ref: bodyRef,
            style: props.cssVars
            // onKeydown: NTour.handleKeydown,
            // onMouseenter: handleMouseEnter,
            // onMouseleave: handleMouseLeave
          },
          attrs
        ),
        internalTrapFocus ? (
          <VFocusTrap active={props.show} autoFocus>
            {{ default: renderContentInnerNode }}
          </VFocusTrap>
        ) : (
          renderContentInnerNode()
        )
      )

      return withDirectives(contentNode, [])
    }
    const isMountedRef = useIsMounted()
    return {
      displayed: displayedRef,
      namespace: namespaceRef,
      isMounted: isMountedRef,
      adjustedTo: useAdjustedTo(props),
      followerEnabled: followerEnabledRef,
      renderContentNode
    }
  },
  render() {
    return (
      <VFollower
        ref="followerRef"
        show={this.show}
        enabled={this.show}
        to={this.adjustedTo}
        placement={this.placement}
        containerClass={this.namespace}
        flip={this.flip}
        teleportDisabled={this.adjustedTo === useAdjustedTo.tdkey}
        width="target"
      >
        {{
          default: () => {
            return (
              <Transition
                name="tour-transition"
                appear={this.isMounted}
                // Don't use watch to enable follower, since the transition may
                // make position sync timing very subtle and buggy.
                onEnter={() => {
                  this.followerEnabled = true
                }}
                onAfterLeave={() => {
                  this.followerEnabled = false
                  this.displayed = false
                }}
              >
                {{
                  default: this.renderContentNode
                }}
              </Transition>
            )
          }
        }}
      </VFollower>
    )
  }
})
