# WJE-136 供应链物流数据看板

基于 React 18、TypeScript、Vite、ECharts 5、Tailwind CSS、Zustand 与 Dexie.js 的纯前端物流监控与分析平台。项目覆盖物流总览、运输监控、仓库分析、车队追踪、成本分析五个页面，模拟数据会写入 IndexedDB，浏览器数据库不可用时回退到内存数据。

## 启动方式

```bash
npm install
npm run dev
```

访问地址：http://localhost:18706

生产构建：

```bash
npm run build
```

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite |
| 图表 | ECharts 5 |
| 样式 | Tailwind CSS + CSS Variables |
| 状态管理 | Zustand |
| 本地存储 | Dexie.js / IndexedDB |
| 路由 | React Router v6 |
| 图标 | lucide-react |

## 目录结构

```text
frontend/src/
├── api/                 # mockData.ts 模拟数据生成器
├── stores/              # shipmentStore, warehouseStore, fleetStore, costStore, themeStore
├── types/               # shipment, warehouse, fleet, cost, tracking, enums, errors
├── components/common/   # StatusBadge, StatCard, AlertBanner, StatusRing, Timeline, EmptyState
├── components/charts/   # ShipmentTrendChart, WarehouseHeatmap, FleetStatusChart, CostPieChart
├── hooks/               # useMockData, useChartTheme, useFilters
├── pages/               # Dashboard, ShipmentMonitor, WarehouseAnalytics, FleetTracking, CostAnalytics
├── router/              # React Router 配置
├── utils/               # formatDistance, formatWeight, db, date
├── constants/           # chartColors, regions
└── styles/              # theme.css, global.css
```

## 枚举出现位置

| 枚举 | 定义位置 | 主要消费位置 |
| --- | --- | --- |
| ShipmentStatus | `frontend/src/types/enums.ts` | `api/mockData.ts`, `pages/Dashboard.tsx`, `pages/ShipmentMonitor.tsx`, `components/common/StatusBadge.tsx` |
| TransportMode | `frontend/src/types/enums.ts` | `types/shipment.ts`, `api/mockData.ts`, `pages/ShipmentMonitor.tsx` |
| VehicleStatus | `frontend/src/types/enums.ts` | `types/fleet.ts`, `api/mockData.ts`, `pages/Dashboard.tsx`, `pages/FleetTracking.tsx`, `components/charts/FleetStatusChart.tsx` |
| CostType | `frontend/src/types/enums.ts` | `types/cost.ts`, `api/mockData.ts`, `pages/CostAnalytics.tsx`, `components/charts/CostPieChart.tsx` |
| TrackingEventType | `frontend/src/types/enums.ts` | `types/tracking.ts`, `api/mockData.ts` |
| Region | `frontend/src/types/enums.ts` | `types/warehouse.ts`, `constants/regions.ts`, `api/mockData.ts` |

## 页面说明

- `/dashboard`：物流总览仪表盘，展示在途运单、延误预警、仓库容量 TOP10、车辆状态环形图。
- `/shipments`：运输监控，按状态 Tab 查看运单列表、物流时间线和当前位置点。
- `/warehouse-analytics`：仓库分析，展示仓库/分区容量热力图与容量趋势。
- `/fleet`：车队追踪，按车辆状态筛选，查看地图点位、里程趋势和保养记录。
- `/cost-analytics`：成本分析，展示成本构成、趋势、单位成本和异常成本。

## License

MIT
