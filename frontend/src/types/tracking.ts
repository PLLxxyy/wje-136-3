import { TrackingEventType } from './enums';

export interface TrackingEvent {
  id: string;
  shipmentId: string;
  type: TrackingEventType;
  location: string;
  time: string;
  description: string;
}
