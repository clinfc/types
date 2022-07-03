export type DataClassifiedExtractionPropKey = string | number

/**
 * 数据提取时的格式化函数
 */
type DataClassifiedExtractionFormat<
  T extends Record<DataClassifiedExtractionPropKey, unknown> = Record<DataClassifiedExtractionPropKey, unknown>,
  K extends keyof T = keyof T,
  R = T[K]
> = (data: { valueKey: K; row: T; index: number }) => R

/**
 * 数据提取时的提取配置对象
 */
export interface DataClassifiedExtractionOpt {
  /** 格式化值 */
  format?: DataClassifiedExtractionFormat
  /** 需要被合并到最终对象的数据 */
  [k: PropertyKey]: any
}

/**
 * 数据提取函数的初始化配置项（useDataClassifiedExtraction 的参数）
 */
export type DataClassifiedExtractionOpts =
  | ArrayLike<DataClassifiedExtractionPropKey>
  | Record<DataClassifiedExtractionPropKey, DataClassifiedExtractionOpt>

type DataClassifiedExtractionTransformData<O extends DataClassifiedExtractionOpts> = O extends ArrayLike<infer K>
  ? Record<K extends DataClassifiedExtractionPropKey ? K : never, unknown>
  : Record<keyof O, unknown>

/**
 * 数据提取函数的最终返回结果
 */
type DataClassifiedExtractionTransformResult<
  O extends DataClassifiedExtractionOpts,
  D extends DataClassifiedExtractionTransformData<O> = DataClassifiedExtractionTransformData<O>,
  K extends keyof D = keyof D
> = O extends ArrayLike<infer K1>
  ? Record<
      K1 extends keyof D ? K1 : never,
      {
        labelKey: K
        valueKey: K1
        data: { label: D[K]; value: K1 extends keyof D ? D[K1] : never }[]
      }
    >
  : {
      [K2 in keyof D as K2 extends keyof O ? K2 : never]: K2 extends keyof O
        ? {
            labelKey: K
            valueKey: K2
            data: { label: D[K]; value: O[K2] extends { format: (...args: any[]) => infer R } ? R : D[K2] }[]
          } & Omit<O[K2], 'format'>
        : never
    }

/**
 * 默认的数据格式化函数
 */
const valueFormat: DataClassifiedExtractionFormat = ({ valueKey, row }) => Reflect.get(row, valueKey)

/**
 * 数据提取初始化函数
 * @param opts 初始化配置项
 * @example
 *  interface Row {
 *    date: string
 *    earning: number
 *    expenditure: number
 *    surplus: number
 *  }
 *
 *  const data: Row[] = [
 *    {date: '22-10', earning: 4500, expenditure: 2400, surplus: 2100 },
 *    {date: '22-11', earning: 4500, expenditure: 2600, surplus: 1900 },
 *    {date: '22-12', earning: 4500, expenditure: 3200, surplus: 1300 },
 *  ]
 *
 *  const { transform: transformMap  } = useDataClassifiedExtraction({
 *    earning: { label: '收入' },
 *    expenditure: { label: '支出' },
 *    surplus: {
 *      label: '结余',
 *      format({ valueKey, row }) {
 *        return `${row[valueKey]}`
 *      }
 *    },
 *  })
 *
 *  const ndm = transformMap(data, 'date')
 *
 *  const { transform: transformArray } = useDataClassifiedExtraction(['earning', 'expenditure', 'surplus'] as const)
 *
 *  const nda = transformArray(data, 'date')
 */
export function useDataClassifiedExtraction<O extends DataClassifiedExtractionOpts>(opts: O) {
  const entries: [DataClassifiedExtractionPropKey, null | object][] = []
  const formats: Record<DataClassifiedExtractionPropKey, DataClassifiedExtractionFormat> = {}

  if (Array.isArray(opts)) {
    opts.forEach((valueKey) => {
      entries.push([valueKey, null])
      formats[valueKey] = valueFormat
    })
  } else {
    Object.entries(opts).forEach(([valueKey, { format, ...fields }]) => {
      entries.push([valueKey, fields])
      formats[valueKey] = format ?? valueFormat
    })
  }

  /**
   * 数据提取函数
   * @param data 被提取的数据
   * @param labelKey 以该属性作为提取关键字
   */
  function transform<D extends DataClassifiedExtractionTransformData<O>, K extends keyof D = keyof D>(
    data: D[],
    labelKey: K
  ) {
    const map = {} as DataClassifiedExtractionTransformResult<O, D, K>

    data.forEach((row, index) => {
      entries.forEach(([valueKey, fields]) => {
        const label = Reflect.get(row, labelKey)!
        const value = Reflect.get(formats, valueKey)({ valueKey, row, index })
        if (Reflect.has(map, valueKey)) {
          const item = Reflect.get(map, valueKey)
          item.data.push({ label, value })
        } else {
          Reflect.set(map, valueKey, { labelKey, valueKey, data: [{ label, value }], ...fields })
        }
      })
    })

    return map
  }

  return { transform }
}
