import { CalendarClock, GaugeCircle, Navigation } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EChart, FleetStatusChart } from '../components/charts';
import { EmptyState, StatCard, StatusBadge, StatusRing } from '../components/common';
import { statusColors } from '../constants/chartColors';
import { useChartTheme } from '../hooks/useChartTheme';
import { useFilters } from '../hooks/useFilters';
import { useFleetStore } from '../stores/fleetStore';
import { useShipmentStore } from '../stores/shipmentStore';
import { FleetVehicle } from '../types';
import { VEHICLE_STATUS_LABELS, VehicleStatus } from '../types/enums';
import { formatDate, formatDateTime } from '../utils/date';
import { formatDistance } from '../utils/formatDistance';

type FleetFilter = VehicleStatus | 'All';

export function FleetTracking() {
  const fleet = useFleetStore((state) => state.fleet);
  const shipments = useShipmentStore((state) => state.shipments);
  const { active, setActive } = useFilters<FleetFilter>('All');
  const filteredFleet = useMemo(() => (active === 'All' ? fleet : fleet.filter((vehicle) => vehicle.status === active)), [active, fleet]);
  const [selectedPlate, setSelectedPlate] = useState<string>();
  const selected = filteredFleet.find((vehicle) => vehicle.plateNo === selectedPlate) ?? filteredFleet[0];
  const activeShipment = shipments.find((shipment) => shipment.id === selected?.currentShipmentId);
  const segments = Object.values(VehicleStatus).map((status) => ({
    label: VEHICLE_STATUS_LABELS[status],
    value: fleet.filter((vehicle) => vehicle.status === status).length,
    color: statusColors[status],
  }));

  return (
    <div className="space-y-6" data-page="fleet">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Fleet Tracking</p>
          <h1>车队追踪</h1>
        </div>
        <p>筛选车辆状态，查看点位、里程趋势和保养窗口。</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="车辆总数" value={fleet.length} helper="干线与城配车辆" icon={<Navigation className="h-5 w-5" />} />
        <StatCard label="执行中" value={fleet.filter((vehicle) => vehicle.status === VehicleStatus.OnRoute).length} helper="已绑定运单" icon={<GaugeCircle className="h-5 w-5" />} />
        <StatCard label="7 日内保养" value={fleet.filter((vehicle) => new Date(vehicle.nextMaintenanceDate).getTime() < Date.now() + 7 * 86400000).length} helper="需提前排班" trend="up" icon={<CalendarClock className="h-5 w-5" />} />
      </section>

      <div className="flex flex-wrap gap-2">
        <FilterButton active={active === 'All'} label={`全部 ${fleet.length}`} onClick={() => setActive('All')} />
        {Object.values(VehicleStatus).map((status) => (
          <FilterButton
            active={active === status}
            key={status}
            label={`${VEHICLE_STATUS_LABELS[status]} ${fleet.filter((vehicle) => vehicle.status === status).length}`}
            onClick={() => setActive(status)}
          />
        ))}
      </div>

      <section className="grid gap-5 xl:grid-cols-[1fr_1.05fr]">
        <article className="panel overflow-hidden">
          <div className="table-head grid-cols-[0.7fr_0.7fr_0.7fr_0.8fr]">
            <span>车牌</span>
            <span>车型</span>
            <span>状态</span>
            <span>里程</span>
          </div>
          <div className="max-h-[520px] overflow-auto">
            {filteredFleet.map((vehicle) => (
              <button
                className={`data-row grid-cols-[0.7fr_0.7fr_0.7fr_0.8fr] ${selected?.plateNo === vehicle.plateNo ? 'is-selected' : ''}`}
                key={vehicle.plateNo}
                onClick={() => setSelectedPlate(vehicle.plateNo)}
                type="button"
              >
                <span><strong>{vehicle.plateNo}</strong><small>{vehicle.currentShipmentId ?? '未绑定运单'}</small></span>
                <span>{vehicle.vehicleType}</span>
                <span><StatusBadge status={vehicle.status} /></span>
                <span>{formatDistance(vehicle.mileageKm)}</span>
              </button>
            ))}
          </div>
        </article>

        <article className="panel p-5">
          <div className="section-title">
            <h2>车辆位置地图</h2>
            <span>{filteredFleet.length} 个点位</span>
          </div>
          <div className="relative h-[360px] overflow-hidden rounded-lg border border-line bg-map map-grid">
            {filteredFleet.map((vehicle) => (
              <span
                className="absolute h-3.5 w-3.5 rounded-full border-2 border-white shadow-lg"
                key={vehicle.plateNo}
                style={{
                  background: statusColors[vehicle.status],
                  left: `${((vehicle.currentLocation.lng - 100) / 28) * 100}%`,
                  top: `${(1 - (vehicle.currentLocation.lat - 20) / 24) * 100}%`,
                }}
                title={vehicle.plateNo}
              />
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <article className="panel p-5">
          <div className="section-title">
            <h2>车辆状态</h2>
            <span>环形汇总</span>
          </div>
          <StatusRing segments={segments} totalLabel="车辆总数" />
          <FleetStatusChart fleet={fleet} />
        </article>

        <VehicleDetail vehicle={selected} activeShipment={activeShipment} />
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

function VehicleDetail({ vehicle, activeShipment }: { vehicle?: FleetVehicle; activeShipment?: { waybillNo: string; destinationAddress: string } }) {
  const theme = useChartTheme();

  if (!vehicle) {
    return <EmptyState title="暂无车辆" description="切换筛选条件查看车辆详情。" />;
  }

  const option = {
    color: [theme.palette[1]],
    tooltip: {
      trigger: 'axis',
      backgroundColor: theme.tooltipBg,
      borderColor: theme.tooltipBorder,
      textStyle: { color: theme.textColor },
    },
    grid: { left: 40, right: 20, top: 20, bottom: 28 },
    xAxis: {
      type: 'category',
      data: vehicle.mileageTrend.map((point) => formatDate(point.date)),
      axisLabel: { color: theme.mutedTextColor },
      axisLine: { lineStyle: { color: theme.gridColor } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: theme.mutedTextColor },
      splitLine: { lineStyle: { color: theme.gridColor } },
    },
    series: [
      {
        name: '累计里程',
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.12 },
        data: vehicle.mileageTrend.map((point) => point.mileageKm),
      },
    ],
  };

  return (
    <article className="panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{vehicle.vehicleType}</p>
          <h2 className="mt-1 text-xl font-semibold text-strong">{vehicle.plateNo}</h2>
        </div>
        <StatusBadge status={vehicle.status} />
      </div>
      <div className="mt-5 grid gap-3 rounded-lg border border-line bg-panel-muted p-4 text-sm md:grid-cols-2">
        <p><span className="text-muted">当前运单：</span>{activeShipment?.waybillNo ?? '无'}</p>
        <p><span className="text-muted">目的地：</span>{activeShipment?.destinationAddress ?? '待调度'}</p>
        <p><span className="text-muted">上次保养：</span>{formatDateTime(vehicle.lastMaintenanceDate)}</p>
        <p><span className="text-muted">下次保养：</span>{formatDateTime(vehicle.nextMaintenanceDate)}</p>
      </div>
      <div className="mt-5">
        <div className="section-title">
          <h2>里程趋势</h2>
          <span>{formatDistance(vehicle.mileageKm)}</span>
        </div>
        <EChart option={option} height={250} />
      </div>
    </article>
  );
}
