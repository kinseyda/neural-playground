export function sigmoid(n: number) {
  return 1 / (1 + Math.E ** (-1 * n));
}

export function sigmoidDerivative(n: number) {
  return sigmoid(n) * (1 - sigmoid(n));
}

export function reLu(n: number): number {
  return Math.max(0, n);
}

export function reLuDerivative(n: number) {
  return n > 0 ? 1 : 0;
}
