// Author: [Digital39999](https://github.com/Digital39999)
export function formatBigNumbers(number: number) {
    if (number >= 1000000000) return (number / 1000000000).toFixed(2) + "B";
    if (number >= 1000000) return (number / 1000000).toFixed(2) + "M";
    if (number >= 1000) return (number / 1000).toFixed(2) + "K";
    return number.toString();
}
