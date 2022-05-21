type OrFromArrayLike<T> = T extends ArrayLike<infer U> ? U : never

export function omit<T, K extends keyof T>(data: T, ...keys: K[]) {
  const temp: Omit<T, OrFromArrayLike<typeof keys>> = { ...data }
  keys.forEach((key) => Reflect.deleteProperty(temp, key))
  return temp
}
