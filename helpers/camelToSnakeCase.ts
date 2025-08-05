import * as _ from 'lodash'

function camelToSnakeCase(str: string): string {
  return _.snakeCase(str)
}

export function convertKeysToSnakeCase<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeysToSnakeCase(item)) as unknown as T
  }

  if (!_.isPlainObject(obj) || obj === null) {
    return obj
  }

  return _.mapKeys(obj, (value: unknown, key: string) =>
    camelToSnakeCase(key)
  ) as T
}
