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

const active = ref(false)
function handleOpen() {
  active.value = !active.value
}
</script>

<template>
  <n-button type="primary" @click="handleOpen()">
    Begin Tour
  </n-button>

  <n-tour v-model:show="active" :show-arrow="true">
    <n-tour-step :target="ref1?.$el" title="Upload File">
      <img
        style="width: 240px"
        src="https://element-plus.org/images/element-plus-logo.svg"
        alt="tour.png"
      >
      <div>Put you files here.</div>
    </n-tour-step>
  </n-tour>
  {{ active }}
  <n-divider />

  <n-space>
    <n-button id="step1" ref="ref1">
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
  <!-- <n-tour v-model:show="active" :current="currentStep" :steps="steps">
    <el-tour-step :target="ref1?.$el" title="Upload File">
      <img
        style="width: 240px"
        src="https://element-plus.org/images/element-plus-logo.svg"
        alt="tour.png"
      >
      <div>Put you files here.</div>
    </el-tour-step>
    <el-tour-step
      :target="ref2?.$el"
      title="Save"
      description="Save your changes"
    />
    <el-tour-step
      :target="ref3?.$el"
      title="Other Actions"
      description="Click to see other"
    />
  </n-tour> -->
</template>
