import type { ThemeProps } from '../../_mixins'
import type { TourTheme } from '../styles'
import type { TourTrigger } from './interface'
import type { TourInjection } from './Tour'
import { getPreciseEventTarget } from 'seemly'
import { clickoutside, mousemoveoutside } from 'vdirs'
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
  watch,
  watchEffect,
  withDirectives
} from 'vue'
import {
  type FollowerInst,
  type FollowerPlacement,
  VFocusTrap,
  VFollower
} from 'vueuc'
import { NxScrollbar } from '../../_internal/scrollbar'
import { useConfig, useTheme, useThemeClass } from '../../_mixins'
import {
  formatLength,
  isJsdom,
  isSlotEmpty,
  resolveWrappedSlot,
  useAdjustedTo
} from '../../_utils'
import { drawerBodyInjectionKey } from '../../drawer/src/interface'
import { modalBodyInjectionKey } from '../../modal/src/interface'
import { tourLight } from '../styles'
import { tourBodyInjectionKey } from './interface'
import style from './styles/index.cssr'

export const tourBodyProps = {
  ...(useTheme.props as ThemeProps<TourTheme>),
  to: useAdjustedTo.propTo,
  show: Boolean,
  trigger: String as PropType<TourTrigger>,
  showArrow: Boolean,
  delay: Number,
  duration: Number,
  raw: Boolean,
  arrowPointToCenter: Boolean,
  arrowClass: String,
  arrowStyle: [String, Object] as PropType<string | CSSProperties>,
  arrowWrapperClass: String,
  arrowWrapperStyle: [String, Object] as PropType<string | CSSProperties>,
  x: Number,
  y: Number,
  flip: Boolean,
  overlap: Boolean,
  placement: String as PropType<FollowerPlacement>,
  width: [Number, String] as PropType<number | 'trigger'>,
  keepAliveOnHover: Boolean,
  scrollable: Boolean,
  contentClass: String,
  contentStyle: [Object, String] as PropType<CSSProperties | string>,
  headerClass: String,
  headerStyle: [Object, String] as PropType<CSSProperties | string>,
  footerClass: String,
  footerStyle: [Object, String] as PropType<CSSProperties | string>,
  // private
  internalDeactivateImmediately: Boolean,
  onClickoutside: Function as PropType<(e: MouseEvent) => void>,
  internalTrapFocus: Boolean,
  internalOnAfterLeave: Function as PropType<() => void>,
  // deprecated
  minWidth: Number,
  maxWidth: Number
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
    return {

    }
  },
  render() {
    return (
      <div>123</div>
    )
  }
})
