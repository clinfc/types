export type DataMappingOpts = Record<string, string>

type DataMappingEntries<T, K extends keyof T = keyof T> = [K, T[K]][]

type DataMappingForward<T extends DataMappingOpts, D, M> = {
  [K in keyof T as T[K]]: K extends keyof D ? D[K] : never
} & (M extends true ? Omit<D, keyof T> : {})

type DataMappingBackward<T extends DataMappingOpts, D, M> = {
  [K in keyof T]: T[K] extends keyof D ? D[T[K]] : never
} & (M extends true ? Omit<D, ValueOf<T>> : {})

/**
 * 数据映射，将一个字段名映射成另一个字段名，支持正向映射和逆向映射
 * @param opts 字段映射对象
 */
export function useDataMapping<T extends DataMappingOpts>(opts: T) {
  const mapping = Object.entries(opts) as DataMappingEntries<T>

  /**
   * 按照映射关系，进行正向映射
   * @param data 被进行映射转换的数据
   * @param merge 是将不存在映射关系的键合并到返回结果中
   */
  function forward<D extends object, M extends boolean = true>(data: D, merge: M = true as M) {
    const temp = {} as DataMappingForward<T, D, M>

    const set = new Set(Object.keys(data)) as Set<PropertyKey>

    mapping.forEach(([k, nk]) => {
      set.delete(k)
      Reflect.set(temp, nk, Reflect.get(data, k))
    })

    if (merge) {
      set.forEach((k) => {
        Reflect.set(temp, k, Reflect.get(data, k))
      })
    }

    return temp
  }

  /**
   * 按照映射关系，进行逆向映射
   * @param data 被进行映射转换的数据
   * @param merge 是将不存在映射关系的键合并到返回结果中
   */
  function backward<D extends object, M extends boolean = true>(data: D, merge: M = true as M) {
    const temp = {} as DataMappingBackward<T, D, M>

    const set = new Set(Object.keys(data)) as Set<PropertyKey>

    mapping.forEach(([nk, k]) => {
      set.delete(k)
      Reflect.set(temp, nk, Reflect.get(data, k))
    })

    if (merge) {
      set.forEach((k) => {
        Reflect.set(temp, k, Reflect.get(data, k))
      })
    }

    return temp
  }

  return { forward, backward }
}
