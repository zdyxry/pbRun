'use client';

import type { PaceZoneStat } from '@/app/lib/types';
import { formatPace } from '@/app/lib/format';

interface PaceZoneMetricsTableProps {
  data: PaceZoneStat[];
}

const PACE_ZONE_NAMES: Record<number, string> = {
  1: 'Z1(轻松)',
  2: 'Z2(有氧)',
  3: 'Z3(节奏)',
  4: 'Z4(乳酸阈)',
  5: 'Z5(VoMax)',
};

const PACE_ZONE_COLORS: Record<number, string> = {
  1: 'bg-green-100 dark:bg-green-900',
  2: 'bg-blue-100 dark:bg-blue-900',
  3: 'bg-yellow-100 dark:bg-yellow-900',
  4: 'bg-orange-100 dark:bg-orange-900',
  5: 'bg-red-100 dark:bg-red-900',
};

function formatPaceRange(paceMin: number, paceMax: number): string {
  if (paceMax >= 9999) return `${formatPace(paceMin, false)}+`;
  if (paceMin <= 0) return `< ${formatPace(paceMax, false)}`;
  return `${formatPace(paceMax, false)}–${formatPace(paceMin, false)}`;
}

export default function PaceZoneMetricsTable({ data }: PaceZoneMetricsTableProps) {
  const rows = data.filter((r) => r.zone >= 1 && r.zone <= 5).sort((a, b) => a.zone - b.zone);

  if (rows.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        暂无配速区间数据
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-white dark:bg-zinc-900">
      <table className="w-full min-w-[260px] text-sm border-collapse">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-700">
            <th className="w-36 min-w-[9rem] px-3 py-2.5 text-left font-medium text-zinc-800 dark:text-zinc-200">配速区间</th>
            <th className="px-3 py-2.5 text-center font-medium text-zinc-800 dark:text-zinc-200">心率</th>
            <th className="px-3 py-2.5 text-center font-medium text-zinc-800 dark:text-zinc-200">步频</th>
            <th className="px-3 py-2.5 text-right font-medium text-zinc-800 dark:text-zinc-200">步幅</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.zone}
              className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <td className="w-36 min-w-[9rem] px-3 py-2">
                <span className={`block w-full rounded px-1.5 py-0.5 ${PACE_ZONE_COLORS[row.zone]}`}>
                  <span className="block leading-tight font-medium text-zinc-800 dark:text-zinc-200">{PACE_ZONE_NAMES[row.zone]}</span>
                  <span className="block text-xs leading-tight text-zinc-600 dark:text-zinc-400">
                    {formatPaceRange(row.pace_min_sec_per_km, row.pace_max_sec_per_km)}
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-500"> /km</span>
                  </span>
                </span>
              </td>
              <td className="px-3 py-2 text-center tabular-nums text-zinc-800 dark:text-zinc-200">
                {row.avg_heart_rate != null ? Math.round(row.avg_heart_rate) : '--'}
              </td>
              <td className="px-3 py-2 text-center tabular-nums text-zinc-800 dark:text-zinc-200">
                {row.avg_cadence != null ? row.avg_cadence.toFixed(0) : '--'}
              </td>
              <td className="px-3 py-2 text-right tabular-nums">
                {row.avg_stride_length != null ? (
                  <>
                    {row.avg_stride_length.toFixed(2)}
                    <span className="ml-0.5 text-xs text-zinc-500 dark:text-zinc-400">m</span>
                  </>
                ) : '--'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
