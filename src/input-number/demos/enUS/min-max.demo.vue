<markdown>
# Min and max

You can set minimum and maximum values too.
</markdown>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref(null)
</script>

<template>
  <n-space vertical>
    <n-input-number
      v-model:value="value"
      placeholder="Min"
      :min="-3"
      :max="5"
    />
    <n-input-number
      v-model:value="value"
      placeholder="Max"
      :min="-5"
      :max="3"
    />
  </n-space>
</template>
