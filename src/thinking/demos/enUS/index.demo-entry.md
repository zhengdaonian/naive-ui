# Thinking

Think independently about problems and don't follow others blindly.

Available since `NEXT_VERSION`.

## 演示

```demo
basic.vue
splitters.vue
```

## API

### Thinking Props

| Name | Type | Default | Description | Version |
| --- | --- | --- | --- | --- |
| content | `string` | `''` | The content to be displayed and split into lines | NEXT_VERSION |
| splitters | `string` | `'/([. 。？！]+)(?![A-Za-z])/'` | Regular expression string used to split content into lines | NEXT_VERSION |
| gap | `string \| number` | `undefined` | For multi-line display, if the distance between lines is not set, the default value will be used. | NEXT_VERSION |
