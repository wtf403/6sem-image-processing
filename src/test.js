import { xyzToLab, rgbToXyz } from "./utils/RonvertColours/ronvertColours.js";

console.log(xyzToLab(rgbToXyz([255, 255, 255]))); // "100 0 0"
console.log(xyzToLab(rgbToXyz([0, 0, 0]))); // "0 0 0"
console.log(xyzToLab(rgbToXyz([255, 0, 0]))); // "53.24 80.09 67.2"
console.log(xyzToLab(rgbToXyz([0, 255, 0]))); // "87.73 -86.18 83.18"
console.log(xyzToLab(rgbToXyz([0, 0, 255]))); // "32.3 79.19 -107.86"
console.log(xyzToLab(rgbToXyz([255, 255, 0]))); // "97.14 -21.55 94.48"
console.log(xyzToLab(rgbToXyz([0, 255, 255]))); // "91.11 -48.08 -14.13"
console.log(xyzToLab(rgbToXyz([255, 0, 255]))); // "60.32 98.24 -60.84"

console.log(rgbToXyz([255, 255, 255])); // "95.05 100 108.88"
console.log(rgbToXyz([0, 0, 0])); // "0 0 0"
console.log(rgbToXyz([255, 0, 0])); // "41.24 21.26 1.93"
console.log(rgbToXyz([0, 255, 0])); // "35.76 71.52 11.43"
console.log(rgbToXyz([0, 0, 255])); // "18.05 7.22 95.03"
console.log(rgbToXyz([255, 255, 0])); // "87.74 92.15 11.92"
console.log(rgbToXyz([0, 255, 255])); // "74.71 89.62 107.86"
console.log(rgbToXyz([255, 0, 255])); // "58.96 29.48 94.48"
