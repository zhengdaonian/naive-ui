import { Component, defineComponent, isVNode, VNode } from "vue";
import { tourStepsProps } from "./interface";
import { isArray } from "lodash-es";

export const flattedChildren = (
  children: FlattenVNodes | VNode | VNodeNormalizedChildren
): FlattenVNodes => {
  const vNodes = isArray(children) ? children : [children]
  const result: FlattenVNodes = []

  vNodes.forEach((child) => {
    if (isArray(child)) {
      result.push(...flattedChildren(child))
    } else if (isVNode(child) && child.component?.subTree) {
      result.push(child, ...flattedChildren(child.component.subTree))
    } else if (isVNode(child) && isArray(child.children)) {
      result.push(...flattedChildren(child.children))
    } else if (isVNode(child) && child.shapeFlag === 2) {
      // @ts-ignore
      result.push(...flattedChildren(child.type()))
    } else {
      result.push(child)
    }
  })
  return result
}


export default defineComponent({
    name: 'TourSteps',
    props: tourStepsProps,
    emits: ['update-total'],
    setup(props, { slots, emit }) {
        let cacheTotal = 0

        return () => {
          const children = slots.default?.()!
          const result: VNode[] = []
          let total = 0

          function filterSteps(children?: FlattenVNodes) {
              if (!isArray(children)) return;
              (children as VNode[]).forEach((item) => {
                  const name = ((item?.type || {}) as Component)?.name

                  if (name === 'ElTourStep') {
                      result.push(item)
                      total += 1
                  }
              })
          }

          if (children.length) {
              filterSteps(flattedChildren(children![0]?.children))
          }

          if (cacheTotal !== total) {
              cacheTotal = total
              emit('update-total', total)
          }

          if (result.length) {
              return result[props.current]
          }
          return null
        }
    }
})