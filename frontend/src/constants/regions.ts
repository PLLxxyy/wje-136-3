import { Region } from '../types/enums';

export const regionCoordinates: Record<Region, { lat: number; lng: number; hub: string }> = {
  [Region.East]: { lat: 31.2304, lng: 121.4737, hub: '上海枢纽' },
  [Region.South]: { lat: 23.1291, lng: 113.2644, hub: '广州枢纽' },
  [Region.North]: { lat: 39.9042, lng: 116.4074, hub: '北京枢纽' },
  [Region.Southwest]: { lat: 30.5728, lng: 104.0668, hub: '成都枢纽' },
  [Region.Northwest]: { lat: 34.3416, lng: 108.9398, hub: '西安枢纽' },
  [Region.Northeast]: { lat: 41.8057, lng: 123.4315, hub: '沈阳枢纽' },
  [Region.Central]: { lat: 30.5928, lng: 114.3055, hub: '武汉枢纽' },
};

export const regionList = Object.values(Region);
