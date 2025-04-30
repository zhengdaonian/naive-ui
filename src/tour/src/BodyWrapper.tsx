import type { DirectiveArguments, PropType, SlotsType, VNodeChild } from 'vue'
import { clickoutside } from 'vdirs'
import { computed, defineComponent, h, mergeProps, vShow, withDirectives } from 'vue'
import { type FollowerPlacement, VFocusTrap } from 'vueuc'

export const tourBodyWrapperProps = {
  show: {
    type: Boolean,
    required: true
  },
  placement: {
    type: String as PropType<FollowerPlacement>,
    required: true
  },
  trapFocus: {
    type: Boolean,
    default: true
  },
  autoFocus: {
    type: Boolean,
    default: true
  },
  showMask: {
    type: [Boolean, String] as PropType<boolean | 'transparent'>,
    required: true
  },
  onClickoutside: Function as PropType<(e: MouseEvent) => void>
} as const

export default defineComponent({
  name: 'NTourContent',
  inheritAttrs: false,
  props: tourBodyWrapperProps,
  slots: Object as SlotsType<any>,
  setup(props) {
    const bodyDirectivesRef = computed<DirectiveArguments>(() => {
      const { show } = props
      const directives: DirectiveArguments = [[vShow, show]]
      if (!props.showMask) {
        directives.push([
          clickoutside,
          props.onClickoutside,
          undefined as unknown as string,
          { capture: true }
        ])
      }
      return directives
    })

    return {
      bodyDirectives: bodyDirectivesRef,
    }
  },
  render() {
    return this.show
      ? withDirectives(
          <div role="none">
            <VFocusTrap
              disabled={!this.showMask || !this.trapFocus}
              active={this.show}
              autoFocus={this.autoFocus}
            >
              {{
                default: () =>
                  withDirectives(
                    h(
                      'div',
                      mergeProps(this.$attrs, {
                        role: 'tour',
                        ref: 'bodyRef',
                        'aria-modal': 'true'
                      }),
                      [
                        <div>123</div>
                      ]
                    ),
                    this.bodyDirectives
                  )
              }}
            </VFocusTrap>
          </div>,
          [
            [
              vShow,
              this.show
            ]
          ]
        )
      : null
  }
})
