import type { SlotsType } from 'vue'
import { defineComponent } from 'vue'

export const tourBodyWrapperProps = {
  show: {
    type: Boolean,
    required: true
  }
} as const

export default defineComponent({
  name: 'TourBody',
  inheritAttrs: false,
  props: tourBodyWrapperProps,
  slots: Object as SlotsType<any>,
  setup(props) {
  }
})
