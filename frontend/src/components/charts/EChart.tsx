import * as echarts from 'echarts';
import { useEffect, useRef, useState } from 'react';
import { useThemeStore } from '../../stores/themeStore';
import { AlertBanner } from '../common';

interface EChartProps {
  option: Record<string, unknown>;
  height?: number;
  className?: string;
}

export function EChart({ option, height = 280, className = '' }: EChartProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const [error, setError] = useState<string>();
  const themeMode = useThemeStore((state) => state.mode);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    try {
      chartRef.current?.dispose();
      chartRef.current = echarts.init(ref.current, themeMode === 'dark' ? 'dark' : undefined);
      chartRef.current.setOption(option as echarts.EChartsOption, true);
      setError(undefined);
    } catch (cause) {
      console.error('CHART_RENDER_FAILED', cause);
      setError('图表渲染失败，数据面板仍可继续使用。');
    }

    const resize = () => chartRef.current?.resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, [option, themeMode]);

  if (error) {
    return <AlertBanner tone="danger" title="图表异常" message={error} />;
  }

  return <div className={className} ref={ref} style={{ height, width: '100%' }} />;
}
