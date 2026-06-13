import { MapPin } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyState, StatusBadge, Timeline } from '../components/common';
import { useFilters } from '../hooks/useFilters';
import { useShipmentStore } from '../stores/shipmentStore';
import { Shipment, TrackingEvent } from '../types';
import { SHIPMENT_STATUS_LABELS, TRANSPORT_MODE_LABELS, ShipmentStatus } from '../types/enums';
import { formatDateTime } from '../utils/date';
import { formatWeight } from '../utils/formatWeight';

type ShipmentFilter = ShipmentStatus | 'All';

export function ShipmentMonitor() {
  const shipments = useShipmentStore((state) => state.shipments);
  const trackingEvents = useShipmentStore((state) => state.trackingEvents);
  const { active, setActive } = useFilters<ShipmentFilter>('All');
  const filteredShipments = useMemo(
    () => (active === 'All' ? shipments : shipments.filter((shipment) => shipment.status === active)),
    [active, shipments],
  );
  const [selectedId, setSelectedId] = useState<string>();
  const selected = filteredShipments.find((shipment) => shipment.id === selectedId) ?? filteredShipments[0];
  const selectedEvents = trackingEvents
    .filter((event) => event.shipmentId === selected?.id)
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  return (
    <div className="space-y-6" data-page="shipments">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Shipment Monitor</p>
          <h1>运输监控</h1>
        </div>
        <p>按状态切换运单池，查看物流时间线和当前位置点。</p>
      </header>

      <div className="flex flex-wrap gap-2">
        <FilterButton active={active === 'All'} onClick={() => setActive('All')} label={`全部 ${shipments.length}`} />
        {Object.values(ShipmentStatus).map((status) => (
          <FilterButton
            active={active === status}
            key={status}
            label={`${SHIPMENT_STATUS_LABELS[status]} ${shipments.filter((shipment) => shipment.status === status).length}`}
            onClick={() => setActive(status)}
          />
        ))}
      </div>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="panel overflow-hidden">
          <div className="table-head grid-cols-[1.1fr_0.8fr_0.7fr_0.8fr]">
            <span>运单</span>
            <span>方式</span>
            <span>状态</span>
            <span>ETA</span>
          </div>
          <div className="max-h-[640px] overflow-auto">
            {filteredShipments.length === 0 ? (
              <EmptyState title="没有匹配运单" description="切换状态筛选查看其他运输单。" />
            ) : (
              filteredShipments.map((shipment) => (
                <button
                  className={`data-row grid-cols-[1.1fr_0.8fr_0.7fr_0.8fr] ${selected?.id === shipment.id ? 'is-selected' : ''}`}
                  key={shipment.id}
                  onClick={() => setSelectedId(shipment.id)}
                  type="button"
                >
                  <span>
                    <strong>{shipment.waybillNo}</strong>
                    <small>{shipment.cargoName} · {formatWeight(shipment.weightKg)}</small>
                  </span>
                  <span>{TRANSPORT_MODE_LABELS[shipment.mode]}</span>
                  <span><StatusBadge status={shipment.status} /></span>
                  <span>{formatDateTime(shipment.etaTime)}</span>
                </button>
              ))
            )}
          </div>
        </article>

        <ShipmentDetail shipment={selected} events={selectedEvents} />
      </section>
    </div>
  );
}

function FilterButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button className={`filter-button ${active ? 'is-active' : ''}`} onClick={onClick} type="button">
      {label}
    </button>
  );
}

function ShipmentDetail({ shipment, events }: { shipment?: Shipment; events: TrackingEvent[] }) {
  if (!shipment) {
    return <EmptyState title="暂无运单" description="模拟数据加载后会展示运单详情。" />;
  }

  return (
    <aside className="panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{shipment.waybillNo}</p>
          <h2 className="mt-1 text-xl font-semibold text-strong">{shipment.cargoName}</h2>
        </div>
        <StatusBadge status={shipment.status} />
      </div>

      <div className="mt-5 grid gap-3 rounded-lg border border-line bg-panel-muted p-4 text-sm md:grid-cols-2">
        <p><span className="text-muted">承运人：</span>{shipment.carrier}</p>
        <p><span className="text-muted">运输方式：</span>{TRANSPORT_MODE_LABELS[shipment.mode]}</p>
        <p><span className="text-muted">体积：</span>{shipment.volumeM3} m³</p>
        <p><span className="text-muted">发货仓：</span>{shipment.originWarehouseId}</p>
      </div>

      <div className="mt-5 rounded-lg border border-line bg-map p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-strong">
          <MapPin className="h-4 w-4 text-accent" />
          当前位置
        </div>
        <div className="relative mt-4 h-44 overflow-hidden rounded-md border border-line map-grid">
          <span
            className="absolute h-4 w-4 rounded-full border-2 border-white bg-red-600 shadow-lg"
            style={{
              left: `${((shipment.currentLocation.lng - 100) / 28) * 100}%`,
              top: `${(1 - (shipment.currentLocation.lat - 20) / 24) * 100}%`,
            }}
          />
        </div>
        <p className="mt-3 text-xs text-muted">
          坐标 {shipment.currentLocation.lat}, {shipment.currentLocation.lng}
        </p>
      </div>

      <div className="mt-6">
        <h3 className="mb-4 font-semibold text-strong">物流时间线</h3>
        {events.length > 0 ? <Timeline events={events} /> : <EmptyState title="暂无节点" description="该运单尚未产生物流节点。" />}
      </div>
    </aside>
  );
}
