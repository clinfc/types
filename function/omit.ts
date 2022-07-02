/**
 * 对 TypeScript 类型推导 Omit 的 JavaScript 实现
 * @param data 数据源
 * @param keys 被剔除的键
 */
export function omit<T, K extends keyof T>(data: T, keys: K[]) {
  const temp: Omit<T, ArrayValudOf<typeof keys>> = { ...data }
  keys.forEach((key) => Reflect.deleteProperty(temp, key))
  return temp
}
