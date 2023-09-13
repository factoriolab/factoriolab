const start = Date.now();
let temp = Date.now();
export function logTime(msg: string): void {
  const now = Date.now();
  const stepTime = now - temp;
  const allTime = now - start;
  temp = now;

  console.log(allTime, stepTime, msg);
}

export function logWarn(msg: string): void {
  console.log(`\x1b[33m${msg}\x1b[0m`);
}
