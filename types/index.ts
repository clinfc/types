/**
 * 从对象中获取值类型
 */
declare type ValueOf<T extends object, K = keyof T> = K extends keyof T ? T[K] : never

/**
 * 从数组中获取值类型
 */
declare type ArrayValudOf<T> = T extends ArrayLike<infer U> ? U : never

/**
 * 空值合并
 * @see https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator
 */
declare type Nullish<T, D> = T extends undefined | null ? D : T
