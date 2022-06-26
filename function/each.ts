type ForEachKey<D> = D extends ArrayLike<unknown> ? number : keyof D

type ForEachData = any[] | Record<any, any>

/**
 * 遍历函数的回调函数
 * @param current 本次遍历的键和值构成的数组
 * @param data 正在被操作的数据源
 * @return undefined 本次回调函数执行完成后，不做任何操作
 * @return symbol 本次回调函数执行完成后，对该条数据进行删除操作，或停止遍历。具体值查看 ForEach 类型
 * @return other 其它数据的返回将进行数据替换
 */
type ForEachCallback<D extends ForEachData, T, K = ForEachKey<D>> = (
  this: Nullish<T, D>,
  current: { key: K; value: D[K] },
  data: D
) => void | symbol | D[K]

/**
 * 遍历数据的回调函数的返回值
 */
export const ForEach = {
  /** 删除元素 */
  DELETE: Symbol('zc_each_delete'),
  /** 终止遍历 */
  BREAK: Symbol('zc_each_break'),
  /** 删除元素并终止遍历 */
  DELETE_BREAK: Symbol('zc_each_delete_break'),
} as const

/**
 * 可控的数组/对象遍历
 * @param data 被遍历的数组或对象
 * @param callback 遍历中每个元素执行的函数，该函数接收一至两个个参数。
 * @param thisArg 当执行回调函数 callback 时，用作 this 的值
 */
function each<D extends ForEachData, T = D, K = ForEachKey<D>>(
  data: D,
  callback: ForEachCallback<D, T, K>,
  thisArg?: T
) {
  const ThisArg = (thisArg ?? data) as Nullish<T, D>

  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const result = callback.call(ThisArg, { key: i as unknown as K, value: data[i] }, data)
      switch (result) {
        case undefined:
          break
        case ForEach.DELETE:
          data.splice(i--, 1)
          break
        case ForEach.BREAK:
          return
        case ForEach.DELETE_BREAK:
          data.splice(i, 1)
          return
        default:
          data.splice(i, 1, result)
          break
      }
    }
  } else {
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        const result = callback.call(ThisArg, { key: key as unknown as K, value: data[key] as unknown as D[K] }, data)
        switch (result) {
          case undefined:
            break
          case ForEach.DELETE:
            Reflect.deleteProperty(data, key)
            break
          case ForEach.BREAK:
            return
          case ForEach.DELETE_BREAK:
            Reflect.deleteProperty(data, key)
            return
          default:
            Reflect.set(data, key, result)
            break
        }
      }
    }
  }
}

export const forEach = Object.assign(each, ForEach)
