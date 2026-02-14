import Link from 'next/link';

export default function ActivityNotFound() {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
        活动不存在
      </div>
      <Link
        href="/list"
        className="text-blue-600 hover:underline dark:text-blue-400"
      >
        返回运动记录
      </Link>
    </div>
  );
}
