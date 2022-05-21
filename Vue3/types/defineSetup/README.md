# 独立声明 setup 函数

将 `setup` 函数从 `defineComponent` 中提出来，使其可以单独定义，但同时又有完整的类型推导。使得被单独定义的 `setup` 函数在使用时不会报错。

## defineSetup

使用 `defineSetup` 类型推导函数来完成 `setup` 函数的类型推导，与 `defineComponent` 有异曲同工之妙。

#### 定义 props、emits

```ts
// 独立声明的 defineComponent 的 props 属性
export const props = {
  value: String,
} as const

// 独立声明的 defineComponent 的 emits 属性
export const emits = [...(['update:value'] as const)]
```

#### 定义 setup

##### 依赖 `porps` 和 `emits` 进行类型推导的 `setup` 函数声明

```ts
export const setup = defineSetup(props, emits, (props, { emit }) => {
  // props.value 正常访问
  const lable = computed(() => props.value)

  function onChange(value: string) {
    // emit 会自动提示
    emit('update:value', value)
  }

  return { lable, onChange }
})
```

##### 只依赖 `props` 进行类型推导的 `setup` 函数声明

```ts
export const setup = defineSetup(props, null, (props, { emit }) => {
  // props.value 正常访问
  const lable = computed(() => props.value)

  function onChange(value: string) {
    // emit 不会报错也不会有自动提示
    emit('update:value', value)
  }

  return { lable, onChange }
})
```

##### 只依赖 `emits` 进行类型推导的 `setup` 函数声明

```ts
export const setup = defineSetup(null, emits, (props, { emit }) => {
  // props.value 报错
  const lable = computed(() => props.value)

  function onChange(value: string) {
    // emit 会自动提示
    emit('update:value', value)
  }

  return { lable, onChange }
})
```

##### 不依赖 `porps` 和 `emits` 进行类型推导的 `setup` 函数声明

```ts
export const setup = defineSetup(null, null, (props, { emit }) => {
  // props.value 报错
  const lable = computed(() => props.value)

  function onChange(value: string) {
    // emit 不会报错也不会有自动提示
    emit('update:value', value)
  }

  return { lable, onChange }
})
```

#### 引入 props、emits 和 setup

```ts
import { defineComponent } from 'vue'
import { props, emits, setup } from 'xxx.ts'

export default defineComponent({
  props,
  emits,
  setup,
})
```

## DefineSetup

使用 `TypeScript` 的类型直接定义 `setup` 函数的类型。_（不推荐，此方式必须提前定义 `setup` 函数的返回值类型，不够灵活）_

```ts
// 独立声明的 defineComponent 的 props 属性
export const props = {
  value: String,
} as const

// 独立声明的 defineComponent 的 emits 属性
export const emits = [...(['update:value'] as const)]

type R = {
  lable: ComputedRef<string>
  onChange: (value: string) => void
}

export const setup: DefineSetup<R, typeof props, typeof emits> = (props, { emit }) => {
  // props.value 正常访问
  const lable = computed(() => props.value)

  function onChange(value: string) {
    // emit 会自动提示
    emit('update:value', value)
  }

  return { lable, onChange }
}
```
