import { defineComponent, inject, onBeforeUnmount, watch } from 'vue'
// import { tourInjectionKey } from './interface'
// import { tourInjectionKey, tourStepProps } from "./interface";

export default defineComponent({
  name: 'TourStep',
  // props: tourStepProps,
  setup(props) {
    // showClose,
    // closeIcon,
    // mergedType,
    // ns,
    // slots: tourSlots,
    // updateModelValue,
    // onClose: tourOnClose,
    // onFinish: tourOnFinish,
    // onChange,
    const {
      increaseStep,
      decreaseStep
    } = inject(tourInjectionKey)

    onBeforeUnmount(() => {
      // decreaseStep(options)
    })
    // watch(
    //     props,
    //     (val) => {
    //         currentStep.value = val
    //     },
    //     {
    //         immediate: true,
    //     }
    // )
  },
  render() {
    return (
      <div>123</div>
    )
  }
})
