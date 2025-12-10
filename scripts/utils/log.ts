const start = Date.now();
let temp = Date.now();
export function logTime(msg: string): void {
  const now = Date.now();
  const stepTime = now - temp;
  const allTime = now - start;
  temp = now;

  console.log(formatTime(allTime), formatTime(stepTime), msg);
}

export function logWarn(msg: string): void {
  console.log(`\x1b[33m${msg}\x1b[0m`);
}

function formatTime(milliseconds: number): string {
  const seconds = milliseconds / 1000;
  const duration = [
    Math.floor(seconds / 60 / 60),
    Math.floor((seconds / 60) % 60),
    Math.floor(seconds % 60),
  ]
    .join(':')
    .replace(/\b(\d)\b/g, '0$1');
  return `\x1b[33m${duration}\x1b[0m`;
}
