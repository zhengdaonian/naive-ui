<markdown>
# 自定义内容

在里面插入一些自定义内容。
</markdown>

<script lang="ts" setup>
import { LockClosedOutline } from '@vicons/ionicons5'
</script>

<template>
  <n-space :size="24" align="center">
    <n-badge value="新">
      <n-avatar />
    </n-badge>
    <n-badge value="火">
      <n-avatar />
    </n-badge>
    <n-badge processing>
      <n-avatar />
      <template #value>
        <n-icon :component="LockClosedOutline" />
      </template>
    </n-badge>
  </n-space>
</template>
