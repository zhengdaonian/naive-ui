<markdown>
# 基础用法

使用 `n-tour` 组件来创建一个简单的引导步骤。
</markdown>

<script lang="ts" setup>
import { EllipsisHorizontal } from '@vicons/ionicons5'
import { ref } from 'vue'

const ref1 = ref()
const ref2 = ref()
const ref3 = ref()

const current = ref(0)

const steps = [
  {
    target: '#step1',
    title: '开始漫游',
    content: '虽然你已经知道了它的用途，但还是告诉你，点了它之后就可以开始漫游了'
  },
  {
    target: '#step2',
    title: '开始漫游',
    content: '虽然你已经知道了它的用途，但还是告诉你，点了它之后就可以开始漫游了'
  },
]

const active = ref(false)
function handleOpen() {
  active.value = !active.value
}
</script>

<template>
  <n-button type="primary" @click="handleOpen()">
    Begin Tour
  </n-button>

  {{ active }}
  {{ current }}
  <n-tour v-model:show="active" v-model:current="current" :steps="steps" :show-arrow="true">
  </n-tour>
  <n-divider />

  <n-space>
    <n-button  id="step1" ref="ref1" @click="current += 1">
      Upload
    </n-button>
    <n-button id="step2" ref="ref2" type="primary" @click="active = false">
      Save
    </n-button>
    <n-button ref="ref3">
      <template #icon>
        <n-icon><EllipsisHorizontal /></n-icon>
      </template>
    </n-button>
  </n-space>
</template>
