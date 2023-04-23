import type { ComponentCustomOptions } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate, type RouteLocationNormalized, type RouteMeta } from 'vue-router'

interface BindRouteStoreOptions<T> {
  /**
   * 从缓存中读取数据
   */
  read: (data: T | undefined) => void
  /**
   * 将数据写入缓存中
   */
  write: () => T | void | Promise<T | void>
}

/**
 * 判断 from 页面是否为 to 页面的子页面
 * @param routeMetaKey 路由 meta 中的键名，用于判断 from 页面是否为 to 页面的子页面
 */
function validator(to: RouteLocationNormalized, from: RouteLocationNormalized, routeMetaKey: keyof RouteMeta) {
  return from.meta[routeMetaKey] === to.name
}

/**
 * 路由缓存池
 */
const store = new Map<string, any>()

/**
 * 创建一个由 keyword 控制的路由 store 缓存实例
 * @param keyword 用于数据缓存的唯一键
 * @param currentRouteMetaKey 路由 meta 中的键名
 */
export function useRouteStore(keyword: string, routeMetaKey: keyof RouteMeta) {
  keyword = [keyword, routeMetaKey].join('-')

  /**
   * 路由钩子函数
   */
  const beforeRouteEnter: ComponentCustomOptions['beforeRouteEnter'] = (to, from) => {
    if (!validator(to, from, routeMetaKey)) {
      store.delete(keyword)
    }
  }

  /**
   * 绑定路由 store 的读写方法
   * @param options 配置对象
   */
  function bindRouteStore<T>(options: BindRouteStoreOptions<T>) {
    const { read, write } = options

    read(store.get(keyword))

    // 离开页面时
    onBeforeRouteLeave((to, from) => {
      // 前往子页面，缓存数据
      if (validator(to, from, routeMetaKey)) {
        const promise = write()
        if (promise instanceof Promise) {
          promise.then((data) => store.set(keyword, data))
        } else {
          store.set(keyword, promise)
        }
      }
      // 否则，清除数据
      else {
        store.delete(keyword)
      }
    })
  }

  return { beforeRouteEnter, bindRouteStore }
}
