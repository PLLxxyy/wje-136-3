export function formatDistance(valueKm: number): string {
  if (valueKm >= 10000) {
    return `${(valueKm / 10000).toFixed(1)}万 km`;
  }

  return `${Math.round(valueKm).toLocaleString('zh-CN')} km`;
}
