import { Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <div>
      <nav> ... </nav>
      <Outlet />
    </div>
  ),
})
