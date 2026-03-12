import { Link, useRouterState } from '@tanstack/react-router'

const LINKS = [
  { to: '/' as const, label: 'Home' },
  { to: '/projects' as const, label: 'Projects' },
  { to: '/photos' as const, label: 'Photos' },
  { to: '/library' as const, label: 'Library' },
  { to: '/arch' as const, label: 'Arch' },
  { to: '/about' as const, label: 'About' },
  { to: '/leave-a-message' as const, label: 'Leave a Message' },
]

export function Navbar() {
  const { location } = useRouterState()
  const currentPath = location.pathname

  return (
    <header className="navbar">
      <nav className="navbar__inner">

        <div className="navbar__links">
          {LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={
                currentPath === link.to
                  ? 'navbar__link navbar__link--active'
                  : 'navbar__link'
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
