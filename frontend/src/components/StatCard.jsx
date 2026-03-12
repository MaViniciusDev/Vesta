import { forwardRef } from 'react'

const StatCard = forwardRef(function StatCard(
  { icon, title, value, trend, trendColor = 'emerald', onClick },
  ref,
) {
  const trendClasses =
    trendColor === 'red'
      ? 'text-red-600 bg-red-50 dark:bg-red-900/30'
      : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30'

  const iconBgClass =
    trendColor === 'red'
      ? 'bg-red-50 dark:bg-red-900/30 text-red-500'
      : 'bg-primary/10 text-primary'

  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag
      ref={ref}
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`flex w-full flex-col gap-2 rounded-xl border border-primary/10 bg-white p-5 text-left shadow-sm dark:bg-slate-900${
        onClick ? ' active:scale-[0.98] transition-transform cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`material-symbols-outlined rounded-lg p-1.5 text-xl ${iconBgClass}`}>{icon}</span>
        <div className="flex items-center gap-1">
          {trend ? (
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${trendClasses}`}>{trend}</span>
          ) : null}
          {onClick ? (
            <span className="material-symbols-outlined text-base text-slate-300">chevron_right</span>
          ) : null}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <p className={`text-2xl font-bold tracking-tight${trendColor === 'red' && value > 0 ? ' text-red-600 dark:text-red-400' : ' text-slate-900 dark:text-slate-100'}`}>
          {value ?? '--'}
        </p>
      </div>
    </Tag>
  )
})

export default StatCard



