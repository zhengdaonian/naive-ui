<markdown>
# 分割规则

不同的 splitters 可以用来以不同的方式分割内容。
</markdown>

<script lang="ts" setup>
import { ref } from 'vue'

const content = ref(
  '第一步：分析问题。第二步：设计解决方案。第三步：实现代码。第四步：彻底测试。第五步：部署上线。'
)
</script>

<template>
  <n-space vertical>
    <n-thinking :content="content" splitters="/(步：)/" />
  </n-space>
</template>
