<markdown>
  # 连接线
  </markdown>

<script lang="ts" setup>
import type { TreeOption } from 'naive-ui'
import { repeat } from 'seemly'
import { ref } from 'vue'

function createData(level = 4, baseKey = ''): TreeOption[] | undefined {
  if (!level)
    return undefined
  return repeat(6 - level, undefined).map((_, index) => {
    const key = `${baseKey}${level}${index}`
    return {
      label: createLabel(level),
      key,
      children: createData(level - 1, key)
    }
  })
}

function createLabel(level: number): string {
  if (level === 4)
    return '道生一'
  if (level === 3)
    return '一生二'
  if (level === 2)
    return '二生三'
  if (level === 1)
    return '三生万物'
  return ''
}

const showLine = ref(false)
const data = createData()
const defaultExpandedKeys = ref(['40', '4030', '403020'])
</script>

<template>
  <n-space vertical>
    <n-switch v-model:value="showLine" />
    <n-tree
      :show-line="showLine"
      :default-expanded-keys="defaultExpandedKeys"
      :data="data"
      checkable
      expand-on-click
      selectable
    />
  </n-space>
</template>
