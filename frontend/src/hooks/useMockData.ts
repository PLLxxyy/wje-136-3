import { useEffect, useMemo, useState } from 'react';
import { createMockData } from '../api/mockData';
import { useCostStore } from '../stores/costStore';
import { useFleetStore } from '../stores/fleetStore';
import { useShipmentStore } from '../stores/shipmentStore';
import { useWarehouseStore } from '../stores/warehouseStore';
import { AppError } from '../types';
import { persistSnapshot } from '../utils/db';

export function useMockData() {
  const [loading, setLoading] = useState(true);
  const setShipments = useShipmentStore((state) => state.setShipments);
  const setTrackingEvents = useShipmentStore((state) => state.setTrackingEvents);
  const setShipmentError = useShipmentStore((state) => state.setShipmentError);
  const setWarehouses = useWarehouseStore((state) => state.setWarehouses);
  const setWarehouseError = useWarehouseStore((state) => state.setWarehouseError);
  const setFleet = useFleetStore((state) => state.setFleet);
  const setFleetError = useFleetStore((state) => state.setFleetError);
  const setCosts = useCostStore((state) => state.setCosts);
  const setCostError = useCostStore((state) => state.setCostError);

  const snapshot = useMemo(() => createMockData(), []);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        setShipments(snapshot.shipments);
        setTrackingEvents(snapshot.trackingEvents);
        setWarehouses(snapshot.warehouses);
        setFleet(snapshot.fleet);
        setCosts(snapshot.costs);
        await persistSnapshot(snapshot);
        if (!cancelled) {
          setShipmentError(undefined);
          setWarehouseError(undefined);
          setFleetError(undefined);
          setCostError(undefined);
        }
      } catch (cause) {
        const error: AppError = {
          code: 'INDEXEDDB_FAILED',
          message: '浏览器本地数据库不可用，当前使用内存中的模拟数据。',
          cause,
        };
        setShipmentError(error);
        setWarehouseError(error);
        setFleetError(error);
        setCostError(error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    hydrate();

    return () => {
      cancelled = true;
    };
  }, [
    setCostError,
    setCosts,
    setFleet,
    setFleetError,
    setShipmentError,
    setShipments,
    setTrackingEvents,
    setWarehouseError,
    setWarehouses,
    snapshot,
  ]);

  return { loading };
}
