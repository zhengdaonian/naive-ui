<markdown>
# 基础用法
</markdown>

<script lang="ts" setup>
import type { NumberAnimationInst } from 'naive-ui'
import { ref } from 'vue'

const numberAnimationInstRef = ref<NumberAnimationInst | null>(null)
function handleClick() {
  numberAnimationInstRef.value?.play()
}
</script>

<template>
  <n-statistic label="你一共处理了" tabular-nums>
    <n-number-animation ref="numberAnimationInstRef" :from="0" :to="12039" />
    <template #suffix>
      条群消息
    </template>
  </n-statistic>
  <n-space vertical>
    花时间、花精力、花心思，愿你每一份努力都不负所望
    <n-button @click="handleClick">
      播放
    </n-button>
  </n-space>
</template>
