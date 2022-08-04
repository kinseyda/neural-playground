function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function componentToHex(c: number) {
  const hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function getColorScale(colorScaleType: string, level: number): string {
  switch (colorScaleType) {
    case "green red":
      return get3Color("#15b115", "#ffa500", "#ff0000", level);
    case "blue orange":
      return get3Color("#4444f9", "#ffff00", "#ffa500", level);
    case "mono":
      return get3Color("#ffffff", "#808080", "#000000", level);
  }
  return "#000000";
}

export function get2Color(c1: string, c2: string, level: number): string {
  const c1RGB = hexToRgb(c1) || { r: 0, g: 0, b: 0 };
  const c2RGB = hexToRgb(c2) || { r: 255, g: 255, b: 255 };
  return rgbToHex(
    Math.floor(c1RGB.r + (c2RGB.r - c1RGB.r) * level),
    Math.floor(c1RGB.g + (c2RGB.g - c1RGB.g) * level),
    Math.floor(c1RGB.b + (c2RGB.b - c1RGB.b) * level)
  );
}

export function get3Color(
  c1: string,
  c2: string,
  c3: string,
  level: number
): string {
  if (level <= 0.5) return get2Color(c1, c2, level * 2);
  else return get2Color(c2, c3, (level - 0.5) * 2);
}
