/** Simple memoization function for single-input, single-output functions */
export function memoize<I, O>(fn: (i: I) => O): (i: I) => O {
  const cache = new Map<I, O>();
  return (i: I): O => {
    let o = cache.get(i);
    if (o != null) return o;

    o = fn(i);
    cache.set(i, o);
    return o;
  };
}
