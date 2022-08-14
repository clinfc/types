import axios, { AxiosRequestConfig } from 'axios'
import { is } from './is'

type ResolveCallback = (value: any) => void

type RejectCallback = (reason?: any) => void

/**
 * 请求的 resolve 和 reject 函数缓存
 */
const RequestMap: Map<string, [ResolveCallback, RejectCallback][]> = new Map()

/**
 * 接口返回值的缓存
 */
const ResponseMap: Map<string, { timer: number; data: string }> = new Map()

/**
 * 设置/清除 缓存
 * @param key 由 url, method, params, data 四个字段组成的字符串
 * @param data 需要缓存的数据
 */
function setResponse(key: string, data?: any) {
  const old = ResponseMap.get(key)
  if (old && old.timer) {
    clearTimeout(old.timer)
  }

  ResponseMap.delete(key)

  if (is(data, 'undefined') || is(data, 'null')) return

  const timer = setTimeout(() => {
    ResponseMap.delete(key)
  }, 60000)

  ResponseMap.set(key, {
    timer,
    data: typeof data === 'object' ? JSON.stringify(data) : data,
  })
}

/**
 * 从缓存中拿去接口返回值
 * @param key 由 url, method, params, data 四个字段组成的字符串
 * @param resolve Promise 的 resovle 函数
 */
function resolveResponse(key: string, resolve: ResolveCallback) {
  if (!ResponseMap.has(key)) return false

  try {
    const { data } = ResponseMap.get(key)!
    resolve(JSON.parse(data))

    return true
  } catch (e) {
    setResponse(key)
    return false
  }
}

/**
 * 对传入的数据进行序列化
 * @param data 数据
 */
function serialize<T>(data: T): T {
  if (is(data, 'object')) {
    const temp: Record<string, any> = {}
    Object.keys(data)
      .sort()
      .forEach((key) => {
        temp[key] = serialize(Reflect.get(data, key))
      })
    return temp as T
  }

  if (is(data, 'array')) {
    return data.map(serialize) as unknown as T
  }

  return data
}

/**
 * 单一请求
 * @param config 请求参数
 */
export default function singleRequest<T>(config: AxiosRequestConfig) {
  return new Promise((resolve, reject) => {
    config = serialize(config)

    const key = JSON.stringify(config)

    if (resolveResponse(key, resolve)) return

    if (!RequestMap.has(key)) {
      RequestMap.set(key, [])
    }

    const list = RequestMap.get(key)!

    list.push([resolve, reject])

    if (list.length > 1) return

    axios(config).then(
      (response) => {
        setResponse(key, response)

        while (list.length) {
          resolveResponse(key, list.pop()![0])
        }
      },
      (error) => {
        while (list.length) {
          list.pop()![1](error)
        }
      }
    )
  }) as Promise<T>
}
