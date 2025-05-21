import { computed, defineComponent, h, ref, toRef } from 'vue'
import { tourContentProps } from './interface'
// import { useFloating } from './hooks/useFloating'
import { VFocusTrap, VFollower } from 'vueuc'

export default defineComponent({
  name: 'TourContent',
  props: tourContentProps,
  setup(props) {
    const placement = toRef(props, 'placement')
    const strategy = toRef(props, 'strategy')
    const contentRef = ref<HTMLElement | null>(null)
    const arrowRef = ref<HTMLElement | null>(null)

    const side = computed(() => {
      return placement.value.split('-')[0]
    })

    // const { contentStyle, arrowStyle } = useFloating(
    //     toRef(props, 'reference'),
    //     contentRef,
    //     arrowRef,
    //     placement,
    //     strategy,
    //     toRef(props, 'offset'),
    //     toRef(props, 'zIndex'),
    //     toRef(props, 'showArrow')
    // )


    return {
      side
    }
  },
  render() {
    const { $slots, prefixCls, side } = this
    return (
      <div 
        ref="contentRef" 
        class={`${prefixCls}-tour-content`} 
        data-side={side} 
        tabindex="-1"
      >
        <VFocusTrap initialFocusTo="container" finalFocusTo="container" autoFocus>
          {$slots.default?.()}
        </VFocusTrap>
      </div>
    )
  }
})
