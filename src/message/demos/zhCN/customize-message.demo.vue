<markdown>
# 自定义信息渲染

有些人表示特别想用 Alert 来当成 Message，当然换个别的也行。
</markdown>

<script lang="ts" setup>
import type { MessageRenderMessage } from 'naive-ui'
import { NAlert, useMessage } from 'naive-ui'
import { h } from 'vue'

const renderMessage: MessageRenderMessage = (props) => {
  const { type } = props
  return h(
    NAlert,
    {
      closable: props.closable,
      onClose: props.onClose,
      type: type === 'loading' ? 'default' : type,
      title: '你看你手上拿的是什么啊',
      style: {
        boxShadow: 'var(--n-box-shadow)',
        maxWidth: 'calc(100vw - 32px)',
        width: '480px'
      }
    },
    {
      default: () => props.content
    }
  )
}

const { error } = useMessage()

function handleClick() {
  error('那东西我们早就不屑啦，哈哈哈', {
    render: renderMessage,
    closable: true
  })
}
</script>

<template>
  <n-button @click="handleClick">
    No Party For Cao Dong
  </n-button>
</template>
