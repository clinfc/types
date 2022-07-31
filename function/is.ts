interface TypeMap {
  number: number
  string: string
  boolean: boolean
  undefined: undefined
  null: null
  bigint: BigInt
  symbol: Symbol
  object: object
  array: Array<unknown>
  date: Date
  map: Map<unknown, unknown>
  set: Set<unknown>
  weakmap: WeakMap<object, unknown>
  weakset: WeakSet<object>
  function: Function
  regexp: RegExp
}

export function is<T extends keyof TypeMap>(tar: any, type: T): tar is TypeMap[T] {
  return (
    Object.prototype.toString
      .call(tar)
      .replace(/(\[.+?\s|\])/g, '')
      .toLowerCase() === type
  )
}
