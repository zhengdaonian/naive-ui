<markdown>
# 选中行(单选)

在 `type='selection'` 的列，同时设置 `multiple=false` 来变成单选模式。
</markdown>

<script lang="ts" setup>
import type { DataTableColumns } from 'naive-ui'
import { ref } from 'vue'

interface RowData {
  key: number
  name: string
  age: number
  address: string
}

const data = Array.from({ length: 46 }).map((_, index) => ({
  name: `Edward King ${index}`,
  age: 32,
  address: `London, Park Lane no. ${index}`,
  key: index
}))

function createColumns(): DataTableColumns<RowData> {
  return [
    {
      type: 'selection',
      multiple: false,
      disabled(row: RowData) {
        return row.name === 'Edward King 3'
      }
    },
    {
      title: 'Name',
      key: 'name'
    },
    {
      title: 'Age',
      key: 'age'
    },
    {
      title: 'Address',
      key: 'address'
    }
  ]
}

const checkedRowKeysRef = ref([4, 1])
const checkedRowKeys = checkedRowKeysRef
const pagination = {
  pageSize: 6
}
const columns = createColumns()
</script>

<template>
  <n-data-table
    v-model:checked-row-keys="checkedRowKeys"
    :columns="columns"
    :data="data"
    :pagination="pagination"
  />
</template>
