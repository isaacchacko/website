import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchJson } from '../lib/api'

type LibraryItemPublic = {
  id: number
  title: string
  url: string
  note?: string | null
  rating?: number | null
  show_rating: boolean
  cover_image_url?: string | null
  item_type: string
  created_at: string
  updated_at?: string | null
  tags: string[]
}

export const Route = createFileRoute('/library/$itemId')({
  validateSearch: (): Record<string, never> => ({}),
  component: LibraryItemPage,
})

function LibraryItemPage() {
  const { itemId } = Route.useParams()

  const itemQuery = useQuery({
    queryKey: ['libraryItem', itemId],
    queryFn: () =>
      fetchJson<LibraryItemPublic>(`/library/${encodeURIComponent(itemId)}`),
  })

  if (itemQuery.isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span>⏳</span>
        <span>Loading item…</span>
      </div>
    )
  }

  if (itemQuery.isError || !itemQuery.data) {
    return <p style={{ color: '#feb2b2' }}>Could not load library item.</p>
  }

  const item = itemQuery.data

  const imageUrl = item.cover_image_url
    ? item.cover_image_url.startsWith('http')
      ? item.cover_image_url
      : `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}${item.cover_image_url}`
    : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Link
        to="/library"
        search={{ page: 1, sort: 'recent', tag: undefined, item_type: undefined }}
      >
        <button
          type="button"
          style={{
            fontSize: '0.875rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            border: 'none',
            background: 'transparent',
            color: '#e5e7eb',
            cursor: 'pointer',
          }}
        >
          ← Back to library
        </button>
      </Link>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
            }}
          >
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{item.title}</h1>
            <span
              style={{
                display: 'inline-flex',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                backgroundColor: '#111827',
                fontSize: '0.75rem',
              }}
            >
              {item.item_type}
            </span>
          </div>
          {item.rating != null && item.show_rating && (
            <p style={{ color: '#facc15', marginBottom: '0.5rem' }}>
              Rating: {item.rating}/5
            </p>
          )}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#5eead4',
                display: 'block',
                marginBottom: '0.5rem',
                wordBreak: 'break-all',
              }}
            >
              {item.url}
            </a>
          )}
          <p style={{ color: '#e5e7eb', marginBottom: '0.5rem' }}>{item.note}</p>
          <div style={{ marginBottom: '0.5rem' }}>
            {item.tags.map((t) => (
              <span
                key={t}
                style={{
                  display: 'inline-flex',
                  padding: '0.1rem 0.5rem',
                  borderRadius: '9999px',
                  backgroundColor: '#111827',
                  fontSize: '0.75rem',
                  marginRight: '0.5rem',
                  marginBottom: '0.25rem',
                }}
              >
                {t}
              </span>
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              fontSize: '0.875rem',
              color: '#9ca3af',
            }}
          >
            <span>Created: {new Date(item.created_at).toLocaleString()}</span>
            {item.updated_at && item.updated_at !== item.created_at && (
              <span>Updated: {new Date(item.updated_at).toLocaleString()}</span>
            )}
          </div>
        </div>
        {imageUrl && (
          <div style={{ maxWidth: '400px', marginLeft: '1rem' }}>
            <img
              src={imageUrl}
              alt={item.title}
              style={{
                borderRadius: '0.5rem',
                maxWidth: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

