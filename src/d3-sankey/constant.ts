export function constant<T>(x: T): () => T {
  return (): T => x;
}
