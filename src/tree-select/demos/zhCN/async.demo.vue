<markdown>
# 异步加载

使用 `on-load` 回调来加载数据。异步加载时，所有 `isLeaf` 为 `false` 并且 `children` 不为数组的节点会被视为未加载的节点。
</markdown>

<script lang="ts" setup>
import type { TreeSelectOption } from 'naive-ui'
import { ref } from 'vue'

function getChildren(option: TreeSelectOption) {
  const children = []
  for (let i = 0; i <= (option as { depth: number }).depth; ++i) {
    children.push({
      label: `${option.label}-${i}`,
      key: `${option.label}-${i}`,
      depth: (option as { depth: number }).depth + 1,
      isLeaf: option.depth === 3
    })
  }
  return children
}

const checkStrategy = ref<'all' | 'parent' | 'child'>('all')
const cascade = ref(false)
const showPath = ref(true)
const value = ref(null)
const options = ref([
  {
    label: 'l-0',
    key: 'v-0',
    depth: 1,
    isLeaf: false
  }
])

function handleLoad(option: TreeSelectOption) {
  return new Promise<void>((resolve) => {
    window.setTimeout(() => {
      option.children = getChildren(option)
      resolve()
    }, 1000)
  })
}
</script>

<template>
  <n-space vertical>
    <n-space align="center">
      <n-radio-group v-model:value="checkStrategy">
        <n-radio-button value="all">
          All
        </n-radio-button>
        <n-radio-button value="parent">
          Parent
        </n-radio-button>
        <n-radio-button value="child">
          Child
        </n-radio-button>
      </n-radio-group>
      <n-space><n-switch v-model:value="showPath" />Show Path</n-space>
      <n-space><n-switch v-model:value="cascade" />Cascade </n-space>
    </n-space>
    <n-tree-select
      v-model:value="value"
      multiple
      checkable
      :options="options"
      :cascade="cascade"
      :check-strategy="checkStrategy"
      :show-path="showPath"
      :allow-checking-not-loaded="cascade"
      :on-load="handleLoad"
    />
  </n-space>
</template>
