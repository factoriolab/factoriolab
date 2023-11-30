export function orZero(x: number | null | undefined): number {
  return x ?? 0;
}

export function orEmpty(x: string | null | undefined): string {
  return x ?? '';
}
