<markdown>
# Basic
</markdown>

<script lang="ts" setup>
import { IosAirplane } from '@vicons/ionicons4'
</script>

<template>
  <n-space vertical :size="12">
    <n-alert title="Default Text" type="default">
      <template #icon>
        <n-icon>
          <IosAirplane />
        </n-icon>
      </template>
      Gee it's good to be back home
    </n-alert>
    <n-alert title="Info Text" type="info">
      Gee it's good to be back home
    </n-alert>
    <n-alert title="Success Text" type="success">
      Leave it till tomorrow to unpack my case
    </n-alert>
    <n-alert title="Warning Text" type="warning">
      Honey disconnect the phone
    </n-alert>
    <n-alert title="Error Text" type="error">
      I'm back in the U.S.S.R.
    </n-alert>
  </n-space>
</template>
