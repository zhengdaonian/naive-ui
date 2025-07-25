<markdown>
# 步骤用法

使用 `n-tour-step` 组件来创建多个步骤的引导。
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
  <n-tour v-model:show="active">
    <n-tour-step
      title="Upload File"
      description="Put  your files here."
      :target="ref1"
    />
  </n-tour>
</template>
