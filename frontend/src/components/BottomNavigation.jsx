import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', icon: 'home', label: 'Inicio' },
  { to: '/cadastro', icon: 'package_2', label: 'Cadastro' },
  { to: '/bipagem', icon: 'barcode_scanner', label: 'Bipagem' },
]

function BottomNavigation() {
  return (
    <nav className="sticky bottom-0 z-20 border-t border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900 pb-safe-area">
      <div className="mx-auto flex w-full max-w-md items-center justify-around px-4 py-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-slate-400 hover:text-primary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`material-symbols-outlined ${isActive ? 'fill-1' : ''}`}>{link.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-tighter">{link.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNavigation

