import type { DefineComponent, EmitsOptions, SetupContext } from 'vue'

type DefineSetupProps<T, S = DefineComponent<T, {}>['setup']> = S extends (props: infer P, arg: any) => any ? P : never

export type DefineSetup<
  Return,
  Props = {},
  Emits extends EmitsOptions = {},
  S = DefineComponent<Props, Return>['setup']
> = S extends ((props: infer P, arg: any) => any) | ((...args: any) => infer R)
  ? (props: P, ctx: SetupContext<Emits>) => R
  : never

/**
 * 类型推导，用于独立声明 defineComponent 的 setup 函数
 * @param props 独立声明的 defineComponent 的 props 属性
 * @param emits 独立声明的 defineComponent 的 emits 属性
 * @param setup 被声明的 defineComponent 的 setup 函数，会自动进行类型推导
 */
export function defineSetup<P extends unknown, E extends EmitsOptions | null, R>(
  props: P,
  emits: E,
  setup: (
    this: void,
    props: DefineSetupProps<P extends null ? {} : P>,
    ctx: SetupContext<E extends null ? string[] : E>
  ) => R
) {
  return setup as DefineSetup<R, P extends null ? {} : P, E extends null ? string[] : E>
}
