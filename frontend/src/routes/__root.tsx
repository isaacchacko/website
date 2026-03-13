import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Navbar } from '../components/Navbar'

export const Route = createRootRoute({
  component: () => (
    <div
      style={{
        minHeight: '100vh',
      }}
    >
      <Navbar />
      <main
        style={{
          maxWidth: '56rem',
          margin: '0 auto',
          padding: '2rem 1rem',
        }}
      >
        <Outlet />
      </main>
    </div>
  ),
})
