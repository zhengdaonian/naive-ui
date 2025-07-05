# Thinking

要独立思考问题，不要人云亦云。

自 `NEXT_VERSION` 开始提供。

## 演示

```demo
basic.vue
splitters.vue
```

## API

### Thinking Props

| 名称 | 类型 | 默认值 | 说明 | 版本 |
| --- | --- | --- | --- | --- |
| content | `string` | `''` | 要显示并分割成行的内容 | NEXT_VERSION |
| splitters | `string` | `'/([. 。？！]+)(?![A-Za-z])/'` | 用于将内容分割成行的正则表达式字符串 | NEXT_VERSION |
| gap | `string \| number` | `undefined` | 多行显示，行与行之间的距离，如果不设定将使用默认值 | NEXT_VERSION |
