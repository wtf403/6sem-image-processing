export function extractRGB(rgbString) {
  const regex = /(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})/;
  const matches = rgbString.match(regex);

  if (matches && matches.length === 4) {
    const R = parseInt(matches[1]);
    const G = parseInt(matches[2]);
    const B = parseInt(matches[3]);
    return [R, G, B];
  } else {
    return null;
  }
}

// Convert RGB to XYZ
export function rgbToXyz(rgb) {
  let r = rgb[0] / 255;
  let g = rgb[1] / 255;
  let b = rgb[2] / 255;

  // sRGB reverse gamma-correction
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  // Convert to XYZ
  const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
  const z = r * 0.0193339 + g * 0.119192 + b * 0.9503041;

  return [(x * 100).toFixed(2), (y * 100).toFixed(2), (z * 100).toFixed(2)];
}

export function rgbToHex(r, g, b) {
  // Convert an individual color component to hex
  const toHex = (color) => color.toString(16).padStart(2, "0");

  // Concatenate the converted color components
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert RGB to Lab
export function xyzToLab(xyz) {
  const [x, y, z] = xyz;

  // Коэффициенты для преобразования
  const xn = 95.047;
  const yn = 100.0;
  const zn = 108.883;

  const fx = x / xn;
  const fy = y / yn;
  const fz = z / zn;

  const epsilon = 0.008856;
  const kappa = 903.3;

  const f = (t) => (t > epsilon ? Math.pow(t, 1 / 3) : (kappa * t + 16) / 116);

  const L = 116 * f(fy) - 16;
  const a = 500 * (f(fx) - f(fy));
  const b = 200 * (f(fy) - f(fz));

  return [L.toFixed(2), a.toFixed(2), b.toFixed(2)];
}
// Calculate contrast between two colors
export function calculateContrast(color1, color2) {
  const rgb1 = color1.map((channel) => channel / 255);
  const rgb2 = color2.map((channel) => channel / 255);
  const L1 = calculateLuminance(rgb1);
  const L2 = calculateLuminance(rgb2);
  const contrast = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  return contrast >= 4.5
    ? `${contrast.toFixed(2)}:1`
    : `${contrast.toFixed(2)}:1 (not enough contrast)`;
}

export function calculateLuminance(rgb) {
  const [R, G, B] = rgb.map((channel) => {
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
