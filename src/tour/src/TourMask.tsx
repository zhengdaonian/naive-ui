import { h, defineComponent, inject, computed, CSSProperties } from "vue";
import { tourInjectionKey, tourMaskProps } from "./public-types";

export default defineComponent({
    name: 'TourMask',
    inheritAttrs: false,
    props: tourMaskProps,
    setup(props) {
        const NTour = inject(tourInjectionKey)!

        const radius = computed(() => props.pos?.radius ?? 2)
        const roundInfo = computed(() => {
            const v = radius.value
            const baseInfo = `a${v},${v} 0 0 1`
            return {
                topRight: `${baseInfo} ${v},${v}`,
                bottomRight: `${baseInfo} ${-v},${v}`,
                bottomLeft: `${baseInfo} ${-v},${-v}`,
                topLeft: `${baseInfo} ${v},${-v}`,
            }
        })

        const path = computed(() => {
        const width = window.innerWidth
        const height = window.innerHeight
        const info = roundInfo.value
        const _path = `M${width},0 L0,0 L0,${height} L${width},${height} L${width},0 Z`
        const _radius = radius.value
        return props.pos
            ? `${_path} M${props.pos.left + _radius},${props.pos.top} h${
            props.pos.width - _radius * 2
            } ${info.topRight} v${props.pos.height - _radius * 2} ${
            info.bottomRight
            } h${-props.pos.width + _radius * 2} ${info.bottomLeft} v${
            -props.pos.height + _radius * 2
            } ${info.topLeft} z`
            : _path
        })

        const pathStyle = computed<CSSProperties>(() => {
            return {
                fill: 'rgba(0,0,0,0.5)',
                pointerEvents: 'auto',
                cursor: 'auto',
            }
        })
        return {
            mergedClsPrefix: NTour.mergedClsPrefixRef,
            path,
            pathStyle
        }
    },
    render() {
        const { mergedClsPrefix } = this
        return (
            <div
                class={[
                    `${mergedClsPrefix}-tour-mask`,
                ]}
            >
                <svg style="width: 100%; height: 100%">
                    <path class={`${mergedClsPrefix}-tour-hollow`} style={this.pathStyle} d={this.path} />
                </svg>
            </div>
        )
    }
})