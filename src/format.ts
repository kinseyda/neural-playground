export function formatTimeString(ms: number): string {
  ms = Math.round(ms);
  let str = `${ms % 1000}ms`;
  if (ms > 1000) {
    str = `${Math.floor((ms / 1000) % 60)}s ${str}`;
  }
  if (ms > 1000 * 60) {
    str = `${Math.floor((ms / 1000 / 60) % 60)}m ${str}`;
  }
  if (ms > 1000 * 60 * 60) {
    str = `${Math.floor((ms / 1000 / 60 / 60) % 24)}h ${str}`;
  }
  if (ms > 1000 * 60 * 60 * 24) {
    str = `${Math.floor(ms / 1000 / 60 / 60 / 24)}d ${str}`;
  }
  return str;
}
