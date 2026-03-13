import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchJson } from '../lib/api'
import { sanityCheck } from '../lib/sanity-check'

type HealthResponse = { status: string }
type StatusResponse = { text: string | null }

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: () => fetchJson<HealthResponse>('/health'),
    retry: 1,
    retryDelay: 1000,
  })

  const statusQuery = useQuery({
    queryKey: ['status'],
    queryFn: () => fetchJson<StatusResponse>('/status/'),
    retry: 1,
    retryDelay: 1000,
  })

  const isLoading = healthQuery.isLoading || statusQuery.isLoading
  const error = healthQuery.error || statusQuery.error

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>⏳</span>
          <span>Checking backend health…</span>
        </div>
      )}

      {error && (
        <div
          style={{
            border: '1px solid #b91c1c',
            backgroundColor: '#450a0a',
            padding: '1rem',
            borderRadius: '0.5rem',
          }}
        >
          <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
            Backend unreachable
          </strong>
          <div style={{ fontSize: '0.875rem' }}>
            {error instanceof Error
              ? error.message
              : 'Make sure the FastAPI server is running on port 3001.'}
            <br />
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              Check console for details. API base:{' '}
              {import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}
            </span>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <div
          style={{
            border: '1px solid #16a34a',
            backgroundColor: '#052e16',
            padding: '1rem',
            borderRadius: '0.5rem',
          }}
        >
          <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
            Health: {healthQuery.data?.status}
          </strong>
          <div>
            Current status:{' '}
            {statusQuery.data?.text ? statusQuery.data.text : 'No status set yet.'}
          </div>
        </div>
      )}

      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          Features
        </h2>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <Link to="/leave-a-message">
            <button
              type="button"
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '9999px',
                border: '1px solid #14b8a6',
                background: 'transparent',
                color: '#14b8a6',
                cursor: 'pointer',
              }}
            >
              Leave a message
            </button>
          </Link>
          <Link to="/library" search={{ page: 1, sort: 'recent', tag: undefined, item_type: undefined }}>
            <button
              type="button"
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '9999px',
                border: '1px solid #4b5563',
                background: 'transparent',
                color: '#e5e7eb',
                cursor: 'pointer',
              }}
            >
              Library
            </button>
          </Link>
          <Link to="/photos">
            <button
              type="button"
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '9999px',
                border: '1px solid #4b5563',
                background: 'transparent',
                color: '#e5e7eb',
                cursor: 'pointer',
              }}
            >
              Photos
            </button>
          </Link>
          <Link to="/spotify">
            <button
              type="button"
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '9999px',
                border: '1px solid #4b5563',
                background: 'transparent',
                color: '#e5e7eb',
                cursor: 'pointer',
              }}
            >
              Spotify Now Playing
            </button>
          </Link>
          <Link to="/admin/analytics">
            <button
              type="button"
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '9999px',
                border: '1px solid #4b5563',
                background: 'transparent',
                color: '#e5e7eb',
                cursor: 'pointer',
              }}
            >
              Analytics (admin)
            </button>
          </Link>
          <Link to="/admin/status">
            <button
              type="button"
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '9999px',
                border: '1px solid #4b5563',
                background: 'transparent',
                color: '#e5e7eb',
                cursor: 'pointer',
              }}
            >
              Status (admin)
            </button>
          </Link>
          <Link to="/admin/leave-a-message">
            <button
              type="button"
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '9999px',
                border: '1px solid #4b5563',
                background: 'transparent',
                color: '#e5e7eb',
                cursor: 'pointer',
              }}
            >
              Leave a message (admin)
            </button>
          </Link>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          Debug
        </h2>
        <button
          type="button"
          onClick={() => sanityCheck()}
          style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            border: '1px solid #4b5563',
            background: 'transparent',
            color: '#e5e7eb',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Run API Sanity Check
        </button>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
          Check browser console for detailed results
        </p>
      </section>
    </div>
  )
}
