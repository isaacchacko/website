import { createFileRoute, Link, useSearch } from '@tanstack/react-router'
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

type LibraryPage = {
  items: LibraryItemPublic[]
  total: number
  page: number
  per_page: number
  pages: number
}

type TagWithCount = {
  id: number
  name: string
  count: number
}

export const Route = createFileRoute('/library')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      page: Number(search.page ?? 1),
      sort: String(search.sort ?? 'recent'),
      tag: (search.tag as string | undefined) ?? undefined,
      item_type: (search.item_type as string | undefined) ?? undefined,
    }
  },
  component: LibraryPageComponent,
})

function LibraryPageComponent() {
  const search = useSearch({ from: '/library' })
  const { page, sort, tag, item_type } = search

  const tagsQuery = useQuery({
    queryKey: ['libraryTags'],
    queryFn: () => fetchJson<TagWithCount[]>('/library/tags'),
  })

  const itemsQuery = useQuery({
    queryKey: ['library', { page, sort, tag, item_type }],
    queryFn: () =>
      fetchJson<LibraryPage>(
        `/library/?page=${page}&per_page=20&sort=${sort}` +
          (tag ? `&tag=${encodeURIComponent(tag)}` : '') +
          (item_type ? `&item_type=${encodeURIComponent(item_type)}` : ''),
      ),
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Reading library</h1>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Sort</p>
          <select
            value={sort}
            onChange={(e) => {
              window.location.assign(
                `/library?sort=${e.target.value}` +
                  (tag ? `&tag=${encodeURIComponent(tag)}` : '') +
                  (item_type
                    ? `&item_type=${encodeURIComponent(item_type)}`
                    : ''),
              )
            }}
            style={{
              padding: '0.5rem',
              borderRadius: '0.375rem',
              border: '1px solid #4b5563',
              backgroundColor: '#111827',
              color: 'white',
              fontSize: '0.875rem',
            }}
          >
            <option value="recent">Most recent</option>
            <option value="alpha">Alphabetical</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>

      <section>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            alignItems: 'center',
          }}
        >
          {tagsQuery.isLoading && <span style={{ fontSize: '0.875rem' }}>Loading tags…</span>}
          {tagsQuery.data?.map((t) => (
            <Link
              key={t.id}
              to="/library"
              search={{ ...search, tag: t.name, page: 1 }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.1rem 0.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  backgroundColor: tag === t.name ? '#0f766e' : '#111827',
                  color: tag === t.name ? '#e5e7eb' : '#d1d5db',
                  border: tag === t.name ? '1px solid #14b8a6' : '1px solid transparent',
                }}
              >
                {t.name} ({t.count})
              </span>
            </Link>
          ))}
        </div>
      </section>

      {itemsQuery.isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>⏳</span>
          <span>Loading items…</span>
        </div>
      )}

      {itemsQuery.isError && (
        <p style={{ color: '#feb2b2' }}>Could not load library items.</p>
      )}

      {itemsQuery.data && itemsQuery.data.items.length === 0 && (
        <p style={{ color: '#9ca3af' }}>No items match these filters.</p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
        }}
      >
        {itemsQuery.data?.items.map((item) => (
          <Link
            key={item.id}
            to="/library/$itemId"
            params={{ itemId: String(item.id) }}
            search={{} as any}
          >
            <div
              style={{
                border: '1px solid #374151',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                backgroundColor: '#030712',
              }}
            >
              {item.cover_image_url && (
                <img
                  src={
                    item.cover_image_url.startsWith('http')
                      ? item.cover_image_url
                      : `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}${item.cover_image_url}`
                  }
                  alt={item.title}
                  style={{
                    borderRadius: '0.5rem',
                    marginBottom: '0.5rem',
                    maxHeight: '200px',
                    objectFit: 'cover',
                    width: '100%',
                  }}
                />
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.25rem',
                }}
              >
                <span style={{ fontWeight: 600 }}>{item.title}</span>
                <span
                  style={{
                    display: 'inline-flex',
                    padding: '0.1rem 0.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    backgroundColor: '#111827',
                  }}
                >
                  {item.item_type}
                </span>
              </div>
              {item.rating != null && item.show_rating && (
                <p style={{ fontSize: '0.875rem', color: '#facc15' }}>
                  Rating: {item.rating}/5
                </p>
              )}
              <p
                style={{
                  marginTop: '0.25rem',
                  fontSize: '0.875rem',
                  color: '#d1d5db',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                } as React.CSSProperties}
              >
                {item.note}
              </p>
              <div
                style={{
                  marginTop: '0.5rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.35rem',
                }}
              >
                {item.tags.map((tagName) => (
                  <span
                    key={tagName}
                    style={{
                      display: 'inline-flex',
                      padding: '0.1rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      backgroundColor: '#111827',
                    }}
                  >
                    {tagName}
                  </span>
                ))}
              </div>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  marginTop: '0.5rem',
                }}
              >
                {new Date(item.created_at).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {itemsQuery.data && itemsQuery.data.pages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '1rem',
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={() =>
              (window.location.href = `/library?page=${Math.max(
                1,
                page - 1,
              )}&sort=${sort}`)
            }
            disabled={page <= 1}
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid #4b5563',
              backgroundColor: 'transparent',
              color: '#e5e7eb',
              cursor: page <= 1 ? 'default' : 'pointer',
              opacity: page <= 1 ? 0.7 : 1,
              fontSize: '0.875rem',
            }}
          >
            Previous
          </button>
          <span style={{ fontSize: '0.875rem' }}>
            Page {itemsQuery.data.page} of {itemsQuery.data.pages}
          </span>
          <button
            type="button"
            onClick={() =>
              (window.location.href = `/library?page=${Math.min(
                itemsQuery.data!.pages,
                page + 1,
              )}&sort=${sort}`)
            }
            disabled={page >= itemsQuery.data.pages}
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid #4b5563',
              backgroundColor: 'transparent',
              color: '#e5e7eb',
              cursor: page >= itemsQuery.data.pages ? 'default' : 'pointer',
              opacity: page >= itemsQuery.data.pages ? 0.7 : 1,
              fontSize: '0.875rem',
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

