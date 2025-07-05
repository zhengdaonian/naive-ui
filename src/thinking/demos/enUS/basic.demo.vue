<markdown>
# Basic
</markdown>

<script lang="ts" setup>
import { ref } from 'vue'

const content = ref(
  'First, I need to understand the problem. Then, I will analyze the requirements. Finally, I will implement the solution.'
)
</script>

<template>
  <n-space vertical>
    <n-thinking :content="content" />
  </n-space>
</template>
