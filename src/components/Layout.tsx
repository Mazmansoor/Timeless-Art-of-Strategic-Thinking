import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext.tsx';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user } = usePlatform();

  const navLinks = [
    { to: '/learn', label: 'Learn' },
    { to: '/strategy-lab', label: 'Strategy Lab' },
    { to: '/library', label: 'Library' },
    { to: '/for-teams', label: 'For Teams' },
    { to: '/book', label: 'The Book' },
  ];

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#1B1E23]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-[#0D1B2A] focus:text-[#FAF7F0] focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 bg-[#FAF7F0]/95 backdrop-blur-sm border-b border-[#E2DACB]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-8">
          <Link
            to="/"
            onClick={closeMobile}
            className="font-serif text-base sm:text-lg font-semibold tracking-tight text-[#0D1B2A] whitespace-nowrap shrink-0 truncate max-w-[230px] sm:max-w-none"
          >
            The Timeless Art of Strategic Thinking
          </Link>

          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#3C424D]"
          >
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 ${
                    isActive
                      ? 'border-[#9A742B] text-[#0D1B2A]'
                      : 'border-transparent hover:border-[#C9BEA8] hover:text-[#0D1B2A]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/workspace"
              onClick={closeMobile}
              className={`hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 ${
                location.pathname.startsWith('/workspace')
                  ? 'bg-[#162A40] text-[#FAF7F0]'
                  : 'bg-[#0D1B2A] text-[#FAF7F0] hover:bg-[#162A40]'
              }`}
            >
              {user ? 'My Workspace' : 'My Workspace'}
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-md border border-[#E2DACB] text-[#0D1B2A] hover:bg-[#F3EEE3]"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-[#E2DACB] bg-[#FAF7F0] px-5 py-4 space-y-2">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `block py-2.5 text-base font-medium border-b border-[#EFE9DC] ${
                    isActive ? 'text-[#0D1B2A]' : 'text-[#525866]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/workspace"
              onClick={closeMobile}
              className="block mt-3 text-center px-4 py-3 text-sm font-medium rounded-md bg-[#0D1B2A] text-[#FAF7F0]"
            >
              My Workspace
            </Link>
          </div>
        )}
      </header>

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-[#E2DACB] bg-[#F3EEE3] text-[#1B1E23] mt-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-3">
            <p className="font-serif text-lg font-semibold text-[#0D1B2A]">
              The Timeless Art of Strategic Thinking
            </p>
            <p className="text-sm text-[#525866] max-w-md leading-relaxed">
              Understand the situation. Make a defensible choice. Shape what comes next. An editorial
              curriculum, analytical workbench, and continuing decision portfolio by Mazhar Mansoor.
            </p>
            <p className="text-xs text-[#6B7280] pt-1">
              Six Parts · Twenty-Four Canonical Subjects · Part I (Awaken) Live
            </p>
          </div>

          <div className="md:col-span-3 space-y-2.5">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#525866]">Platform</p>
            <ul className="space-y-2 text-sm text-[#1B1E23]">
              <li>
                <Link to="/learn" className="hover:underline underline-offset-4">
                  Curriculum &amp; Modules
                </Link>
              </li>
              <li>
                <Link to="/strategy-lab" className="hover:underline underline-offset-4">
                  Strategy Lab Tools
                </Link>
              </li>
              <li>
                <Link to="/library" className="hover:underline underline-offset-4">
                  Reference Library &amp; Cases
                </Link>
              </li>
              <li>
                <Link to="/workspace" className="hover:underline underline-offset-4">
                  Decision Portfolio
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-2.5">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#525866]">
              Programs, Standards &amp; Governance
            </p>
            <ul className="space-y-2 text-sm text-[#1B1E23]">
              <li>
                <Link to="/about" className="hover:underline underline-offset-4">
                  About Mazhar Mansoor
                </Link>
              </li>
              <li>
                <Link to="/programs" className="hover:underline underline-offset-4">
                  Guided Programs &amp; Commercial Model
                </Link>
              </li>
              <li>
                <Link to="/sources" className="hover:underline underline-offset-4">
                  Sources &amp; Editorial Standards
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:underline underline-offset-4">
                  Privacy, Terms &amp; Support
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-[#525866] hover:text-[#0D1B2A] hover:underline underline-offset-4">
                  Administration
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#E2DACB] py-5 px-5 sm:px-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#525866]">
          <span>© {new Date().getFullYear()} Mazhar Mansoor · The Timeless Art of Strategic Thinking</span>
          <span>Free tools accessible without sign-in · Private workspaces isolated server-side</span>
        </div>
      </footer>
    </div>
  );
}
