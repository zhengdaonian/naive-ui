# 漫游式引导 Tour

用于分步引导用户了解产品功能的气泡组件。 用来引导用户并介绍产品

自 `NEXT_VERSION` 开始提供。

## 演示

```demo
basic.vue
```

## API

### Tour Props

| 名称 | 类型 | 默认值 | 说明 | 版本 |
| --- | --- | --- | --- | --- |
| to | `string \| HTMLElement` | `body` | 模态的挂载位置 |  |
| bottom | `number \| string` | `undefined` | 按钮组的 CSS `bottom` 属性 |  |
| placement | `'top-start' \| 'top' \| 'top-end' \| 'right-start' \| 'right' \| 'right-end' \| 'bottom-start' \| 'bottom' \| 'bottom-end' \| 'left-start' \| 'left' \| 'left-end'` | `'top'` | tour 的弹出位置 |  |
| show-arrow | `boolean` | `true` | 是否显示箭头 |  |
| show-mask | `boolean \| 'transparent'` | true | 是否显示遮罩，如果设为 'transparent' 会展示透明遮罩，如果设为 false 会禁用 trap-focus |  |
| target-area-clickable | `boolean` | `true` | 启用蒙层时，target 元素区域是否可以点击。 |  |
