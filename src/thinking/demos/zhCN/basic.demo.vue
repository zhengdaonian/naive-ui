<markdown>
# 基础用法
</markdown>

<script lang="ts" setup>
import { ref } from 'vue'

const content = ref(
  '首先，我需要理解问题。然后，我将分析需求。最后，我将实现解决方案。'
)
</script>

<template>
  <n-thinking :content="content">
    已深度思考
  </n-thinking>
</template>
