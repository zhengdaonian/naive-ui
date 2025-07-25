import type { CSSProperties, PropType } from 'vue'
import type { PosInfo } from './interface'
import { computed, defineComponent, h, inject } from 'vue'
import { usePreventScroll } from './hooks/usePreventScroll'
import { tourInjectionKey } from './Tour'

export const tourMaskProps = {
  zIndex: {
    type: Number
  },
  pos: {
    type: Object as PropType<PosInfo | null>,
  },
  fill: {
    type: String,
    default: 'rgba(0,0,0,0.5)',
  },
  targetAreaClickable: {
    type: Boolean,
    default: true,
  },
}

export default defineComponent({
  name: 'TourMask',
  props: tourMaskProps,
  setup(props) {
    const { mergedClsPrefixRef }
          = inject(tourInjectionKey)!

    usePreventScroll()

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
        fill: props.fill,
        pointerEvents: 'auto',
        cursor: 'auto',
      }
    })

    return {
      mergedClsPrefixRef,
      path,
      pathStyle
    }
  },
  render() {
    const { mergedClsPrefixRef, path, pathStyle, pos, targetAreaClickable } = this
    return (
      <div
        class={`${mergedClsPrefixRef}-tour-mask`}
        style={{
          pointerEvents: pos && targetAreaClickable ? 'none' : 'auto',
        }}
      >
        <svg style={{ width: '100%', height: '100%', zIndex: this.zIndex }}>
          <path class={`${mergedClsPrefixRef}-tour-hollow`} style={pathStyle} d={path} />
        </svg>
      </div>
    )
  }
})
