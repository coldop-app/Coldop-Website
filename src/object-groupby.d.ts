/**
 * Type declaration for Object.groupBy() (ES2024).
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy
 */
declare global {
  interface ObjectConstructor {
    groupBy<K extends PropertyKey, T>(
      items: Iterable<T>,
      callbackFn: (element: T, index: number) => K
    ): Partial<Record<K, T[]>>;
  }
}

export {};
