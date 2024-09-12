/** Deletes any keys that are undefined */
export function prune(obj: object): void {
  const cast = obj as Record<string, unknown>;
  const keys = Object.keys(cast);
  keys.filter((k) => cast[k] === undefined).forEach((k) => delete cast[k]);
}
