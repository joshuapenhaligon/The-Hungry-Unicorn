import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { token, logout } = useAuth()
  const [open, setOpen] = useState(false)

  // Darker by default, invert on hover for contrast
  const base =
    'px-3 py-2 rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300'

  // Force this color even if your global `a {}` rules exist
  const idle   = '!text-purple-900'

  // High-contrast hover (white text on dark pill)
  const hover  = 'hover:bg-purple-700 hover:!text-white'

  // Active state even bolder
  const active = '!text-white bg-purple-800'

  return (
    <header className="sticky top-0 z-40 w-full font-playfair">
      {/* shimmer bar */}
      <div className="h-1 w-full bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300" />
      {/* solid, high-contrast surface */}
      <nav className="w-full bg-white shadow-sm border-b border-purple-100/60">
        <div className="mx-auto max-w-7xl px-4">
          {/* relative row so the center menu can be absolutely centered */}
          <div className="relative flex h-16 items-center justify-between">

            {/* Left: brand */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🦄</span>
              <span className="text-xl font-extrabold tracking-tight text-purple-950">
                The Hungry Unicorn
              </span>
            </Link>

            {/* Center: ABSOLUTELY centered links */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-6">
              <NavLink
                to="/"
                className={({ isActive }) => `${base} ${hover} ${isActive ? active : idle}`}
              >
                Home
              </NavLink>

              <NavLink
                to="/availability"
                className={({ isActive }) => `${base} ${hover} ${isActive ? active : idle}`}
              >
                Availability
              </NavLink>

              <NavLink
                to="/lookup"
                className={({ isActive }) => `${base} ${hover} ${isActive ? active : idle}`}
              >
                Manage Booking
              </NavLink>

              {token && (
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) => `${base} ${hover} ${isActive ? active : idle}`}
                >
                  Dashboard
                </NavLink>
              )}
            </div>

            {/* Right: auth actions */}
            <div className="hidden md:flex items-center gap-2">
              {!token ? (
                <NavLink
                  to="/login"
                  className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-pink-600 to-purple-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
                >
                  Owner Login
                </NavLink>
              ) : (
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-full text-sm font-semibold text-gray-900 bg-gray-100 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
                >
                  Log Out
                </button>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-900 hover:bg-purple-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
              onClick={() => setOpen(v => !v)}
              aria-label="Toggle navigation"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                {open ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="md:hidden border-t border-purple-100">
            <div className="space-y-1 px-4 py-3">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `${base} block ${isActive ? active : idle}`
                }
                onClick={() => setOpen(false)}
              >
                Home
              </NavLink>
              <NavLink
                to="/availability"
                className={({ isActive }) =>
                  `${base} block ${isActive ? active : idle}`
                }
                onClick={() => setOpen(false)}
              >
                Availability
              </NavLink>
              <NavLink
                to="/lookup"
                className={({ isActive }) =>
                  `${base} block ${isActive ? active : idle}`
                }
                onClick={() => setOpen(false)}
              >
                Manage Booking
              </NavLink>
              {token && (
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `${base} block ${isActive ? active : idle}`
                  }
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </NavLink>
              )}
              {!token ? (
                <NavLink
                  to="/login"
                  className="block mt-2 px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-pink-600 to-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
                  onClick={() => setOpen(false)}
                >
                  Owner Login
                </NavLink>
              ) : (
                <button
                  onClick={() => { logout(); setOpen(false) }}
                  className="mt-2 w-full px-4 py-2 rounded-full text-sm font-semibold text-gray-900 bg-gray-100 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
                >
                  Log Out
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
