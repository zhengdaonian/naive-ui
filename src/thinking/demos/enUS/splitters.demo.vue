<markdown>
# Splitters

Different splitters can be used to split content into different ways.
</markdown>

<script lang="ts" setup>
import { ref } from 'vue'

const content = ref(
  'First step: analyze the problem. Second step: design solution. Third step: implement code. Fourth step: test thoroughly. Fifth step: deploy.'
)
</script>

<template>
  <n-space vertical>
    <n-thinking :content="content" splitters="/(step:)/" />
  </n-space>
</template>
