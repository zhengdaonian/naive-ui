<markdown>
# 滚动

你可以很简单的让 Log 滚到顶部或者底部。同时你可以控制这个滚动操作是否发出事件。
</markdown>

<script lang="ts" setup>
import type { LogInst } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { ref } from 'vue'

function log() {
  const l: string[] = []
  for (let i = 0; i < 10; ++i) {
    l.push(Math.random().toString(16))
  }
  return `${l.join('\n')}\n`
}

const message = useMessage()
const loadingRef = ref(false)
const logRef = ref(log())
const logInstRef = ref<LogInst | null>(null)

function handleRequireMore(from: 'top' | 'bottom') {
  message.info(`Require More from ${from}`)
  if (loadingRef.value)
    return
  loadingRef.value = true
  setTimeout(() => {
    if (from === 'top') {
      logRef.value = log() + logRef.value
    }
    else if (from === 'bottom') {
      logRef.value = logRef.value + log()
    }
    loadingRef.value = false
  }, 1000)
}

function handleReachTop() {
  message.info('Reach Top')
}

function handleReachBottom() {
  message.info('Reach Bottom')
}

function scrollTo(options: { position: 'bottom' | 'top', silent: boolean }) {
  logInstRef.value?.scrollTo(options)
}
</script>

<template>
  <n-space vertical>
    <n-button-group>
      <n-button @click="scrollTo({ position: 'bottom', silent: false })">
        滚动到底部
      </n-button>
      <n-button @click="scrollTo({ position: 'bottom', silent: true })">
        滚动到底部（无事件）
      </n-button>
      <n-button @click="scrollTo({ position: 'top', silent: false })">
        滚动到顶部
      </n-button>
      <n-button @click="scrollTo({ position: 'top', silent: true })">
        滚动到顶部（无事件）
      </n-button>
    </n-button-group>
    <n-log
      ref="logInstRef"
      :log="logRef"
      :loading="loadingRef"
      trim
      @require-more="handleRequireMore"
      @reach-top="handleReachTop"
      @reach-bottom="handleReachBottom"
    />
  </n-space>
</template>
