import { defineComponent, inject, watch } from "vue";
import { tourInjectionKey, tourStepProps } from "./interface";

export default defineComponent({
    name: 'TourStep',
    props: tourStepProps,
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
            currentStep,
            current,
            total,
        } = inject(tourInjectionKey)

        watch(
            props,
            (val) => {
                currentStep.value = val
            },
            {
                immediate: true,
            }
        )
    },
    render() {
        return (
            <div>123</div>
        )
    }
})