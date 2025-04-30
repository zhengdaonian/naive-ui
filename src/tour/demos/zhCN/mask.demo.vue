<markdown>
# 非模态

使用 :mask="false" 可以将引导变为非模态。
</markdown>

<script lang="ts" setup>
import { EllipsisHorizontal } from '@vicons/ionicons5'
import { ref } from 'vue'

const ref1 = ref()
const ref2 = ref()
const ref3 = ref()

const active = ref(false)
function handleOpen() {
  active.value = true
}

const steps = [
  {
    title: 'Upload File',
    description: 'Put  your files here.',
    target: () => ref1.value
  }
]
</script>

<template>
  <n-button type="primary" @click="handleOpen()">
    Begin Tour
  </n-button>

  <n-divider />

  <n-space>
    <n-button ref="ref1">
      Upload
    </n-button>
    <n-button ref="ref2" type="primary">
      Save
    </n-button>
    <n-button ref="ref3">
      <template #icon>
        <n-icon><EllipsisHorizontal /></n-icon>
      </template>
    </n-button>
  </n-space>
  <n-tour v-model:show="active" :show-mask="false" :steps="steps" />
</template>
