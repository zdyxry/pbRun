export type TimeRangeDays = 30 | 90 | 180;

export const TIME_RANGE_DAYS_OPTIONS: TimeRangeDays[] = [30, 90, 180];

export function getDateRangeFromDays(days: TimeRangeDays): { startDate: string; endDate: string } {
  const now = new Date();
  const endDate = now.toISOString().split('T')[0];
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  const startDate = start.toISOString().split('T')[0];
  return { startDate, endDate };
}

export function parseTimeRangeDays(param: string | null): TimeRangeDays {
  const n = param != null ? parseInt(param, 10) : NaN;
  if (n === 30 || n === 90 || n === 180) return n;
  return 30;
}

/** 某月 startDate/endDate（用于 API 查询） */
export function monthToRange(yearMonth: string): { startDate: string; endDate: string } {
  const [y, m] = yearMonth.split('-').map(Number);
  const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const endDate = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { startDate, endDate };
}
