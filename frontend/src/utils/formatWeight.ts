export function formatWeight(valueKg: number): string {
  if (valueKg >= 1000) {
    return `${(valueKg / 1000).toFixed(1)} t`;
  }

  return `${Math.round(valueKg).toLocaleString('zh-CN')} kg`;
}
