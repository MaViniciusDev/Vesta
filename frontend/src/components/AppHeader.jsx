import { Link } from 'react-router-dom'

function AppHeader({
  title,
  subtitle,
  showBack = false,
  rightIcon = 'notifications',
  onRightClick,
  showRightAction = true,
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-primary/10 bg-white px-4 py-4 dark:bg-slate-900">
      <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3">
        {showBack ? (
          <Link
            to="/"
            className="flex size-10 items-center justify-center rounded-full text-primary hover:bg-primary/10"
            aria-label="Voltar para dashboard"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center overflow-hidden rounded-lg bg-primary/10">
              <img src="/icon-192.png" alt="Logo Vesta" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <h1 className="text-xs font-bold uppercase tracking-wider text-primary/60">Vesta</h1>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</p>
            </div>
          </div>
        )}

        {showBack ? (
          <h1 className="flex-1 text-center text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h1>
        ) : null}

        {showRightAction ? (
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            onClick={onRightClick}
            aria-label="Acoes"
          >
            <span className="material-symbols-outlined">{rightIcon}</span>
          </button>
        ) : (
          <div className="size-10" aria-hidden="true" />
        )}
      </div>
      {subtitle ? (
        <p className="mx-auto mt-1 w-full max-w-md px-14 text-center text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      ) : null}
    </header>
  )
}

export default AppHeader
