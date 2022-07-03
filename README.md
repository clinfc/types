# TypeScript 收藏

## useDataClassifiedExtraction

以下两种写法有何差异

```ts
type Result<O> = O extends ArrayLike<infer P> ? (P extends string | number ? Record<P, unknown> : never) : never
```

```ts
type Result<O> = O extends ArrayLike<infer P> ? Record<P extends string | number ? P : never, unknown> : never
```
