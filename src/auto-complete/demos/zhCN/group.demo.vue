<markdown>
# 成组
</markdown>

<script lang="ts" setup>
import { computed, ref } from 'vue'

const valueRef = ref('')
const value = valueRef
const options = computed(() => {
  return [
    ['谷歌', '@gmail.com'],
    ['网易', '@163.com'],
    ['腾讯', '@qq.com']
  ].map((emailInfo) => {
    return {
      type: 'group',
      label: emailInfo[0],
      key: emailInfo[0],
      children: [valueRef.value.split('@')[0] + emailInfo[1]]
    }
  })
})
</script>

<template>
  <n-auto-complete
    v-model:value="value"
    :options="options"
    placeholder="邮箱"
  />
</template>
