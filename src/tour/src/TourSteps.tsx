import { h, defineComponent, computed, Transition, inject, ref, watchEffect, VNode } from "vue";
import { TourInjection, tourStepsProps } from "./interface";
import { VFollower } from "vueuc";
import { useConfig } from "../../_mixins";
import { isJsdom, useAdjustedTo } from "../../_utils";

export default defineComponent({
    name: 'TourSteps',
    inheritAttrs: false,
    props: tourStepsProps,
    setup(props, { slots, emit }) {
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

      function renderContentNode(): VNode | null {
        return (
          <div>
            123
          </div>
        )
      }
      return {
        displayed: displayedRef,
        namespace: namespaceRef,
        isMounted: NTour.isMountedRef,
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
          flip={this.flip}
          placement={this.placement}
          containerClass={this.namespace}
        >
          {{
            default: () => {
              return (
                <Transition
                  name="popover-transition"
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