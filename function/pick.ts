/**
 * 对 TypeScript 类型推导 Pick 的 JavaScript 实现
 * @param data 数据源
 * @param keys 被保留的键
 */
export function pick<T, K extends keyof T>(data: T, keys: K[]) {
  const temp = {} as Pick<T, ArrayValudOf<typeof keys>>
  keys.forEach((key) => Reflect.set(temp, key, data[key]))
  return temp
}
