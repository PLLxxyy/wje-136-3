import { CostType } from './enums';

export interface CostEntry {
  id: string;
  shipmentId: string;
  type: CostType;
  amount: number;
  date: string;
  note: string;
}
