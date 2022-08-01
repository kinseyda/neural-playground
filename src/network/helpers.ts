export function oneHotOutput(outputClass: number, classes: number): number[] {
  return Array.from({ length: classes }, (_, i) => (i == outputClass ? 1 : 0));
}

export function getHottest(arr: number[]) {
  return arr.indexOf(Math.max(...arr));
}

export function toBinary(num: number, length: number): string {
  const arr = [];
  let cur = num;
  for (let i = 0; i < length; i++) {
    const curPos = 2 ** (length - 1 - i);
    if (cur - curPos >= 0) {
      arr.push(1);
      cur -= curPos;
    } else {
      arr.push(0);
    }
  }
  return arr.join("");
}
export function toDecimal(num: string): number {
  return parseInt(num, 2);
}

export function numToBinList(num: number, length: number): number[] {
  return Array.from(toBinary(num, length)).map((x) => parseInt(x));
}

export function binListToNum(binList: number[]): number {
  return toDecimal(binList.join(""));
}
