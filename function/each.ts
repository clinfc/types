type ForEachKey<D> = D extends ArrayLike<unknown> ? number : keyof D

type ForEachValue<D> = D extends ArrayLike<infer P> ? P : D extends { [k: string | number]: infer P } ? P : never

type ForEachThis<T, D> = T extends undefined ? D : T

export type ForEachCallback<D, K, V, T> = (
  this: ForEachThis<T, D>,
  current: { key: K; value: V },
  data: D
) => number | void

/**
 * 遍历数据的回调函数的返回值
 */
export enum ForEachReturn {
  /** 删除元素 */
  DELETE = 0,
  /** 终止遍历 */
  BREAK = 1,
  /** 删除元素并终止遍历 */
  DELETE_BREAK = 2,
}

/**
 * 可控的数组/对象遍历函数
 * @param data 被遍历的数组或对象
 * @param callback 遍历中每个元素执行的函数，该函数接收一至两个个参数。
 * @param thisArg 当执行回调函数 callback 时，用作 this 的值
 */
function each<D extends any[] | Record<any, any>, K = ForEachKey<D>, V = ForEachValue<D>, T = D>(
  data: D,
  callback: ForEachCallback<D, K, V, T>,
  thisArg?: T
) {
  const ThisArg = (thisArg ?? data) as ForEachThis<T, D>

  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      switch (callback.call(ThisArg, { key: i as ForEachKey<D>, value: data[i] }, data)) {
        case ForEachReturn.DELETE:
          data.splice(i--, 1)
          break
        case ForEachReturn.BREAK:
          return
        case ForEachReturn.DELETE_BREAK:
          data.splice(i, 1)
          return
      }
    }
  } else {
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        switch (callback.call(ThisArg, { key: key as unknown as K, value: data[key] as unknown as V }, data)) {
          case ForEachReturn.DELETE:
            Reflect.deleteProperty(data, key)
            break
          case ForEachReturn.BREAK:
            return
          case ForEachReturn.DELETE_BREAK:
            Reflect.deleteProperty(data, key)
            return
        }
      }
    }
  }
}

export const forEach = Object.assign(each, ForEachReturn)
