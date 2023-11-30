export function orZero(x: number | null | undefined): number {
  return x ?? 0;
}

export function orString(x: string | null | undefined): string {
  return x ?? '';
}

export function orEmpty<T>(x: T[] | null | undefined): T[] {
  return x ?? [];
}
