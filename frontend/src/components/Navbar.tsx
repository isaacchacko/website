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
    <header
      style={{
        maxWidth: '100vh',
        paddingLeft: '2.5rem',
        paddingTop: '2.5rem',
      }}
    >
      <h1
        style={{
          fontSize: '4.5rem',
          fontFamily: 'Lateef, system-ui, sans-serif',
        }}
      >
        isaacchacko.com
      </h1>
    </header>
  )
}
