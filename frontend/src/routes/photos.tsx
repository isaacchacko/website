import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { fetchJson } from '../lib/api'

type PhotoPublic = {
  id: number
  filename: string
  original_filename: string
  caption?: string | null
  uploaded_at: string
  url: string
}

type PhotosPage = {
  items: PhotoPublic[]
  total: number
  page: number
  per_page: number
  pages: number
}

export const Route = createFileRoute('/photos')({
  component: PhotosPageComponent,
})

function PhotosPageComponent() {
  const [page, setPage] = useState(1)

  const photosQuery = useQuery({
    queryKey: ['photos', { page }],
    queryFn: () =>
      fetchJson<PhotosPage>(`/photos/?page=${page}&per_page=12`),
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Photo gallery</h1>

      {photosQuery.isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>⏳</span>
          <span>Loading photos…</span>
        </div>
      )}

      {photosQuery.isError && (
        <p style={{ color: '#feb2b2' }}>Could not load photos.</p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '1rem',
        }}
      >
        {photosQuery.data?.items.map((photo) => {
          const imageUrl = photo.url.startsWith('http')
            ? photo.url
            : `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}${photo.url}`
          console.log("imageUrl: ", imageUrl);
          return (
            <div
              key={photo.id}
              style={{
                border: '1px solid #374151',
                borderRadius: '0.5rem',
                padding: '0.5rem',
                backgroundColor: '#030712',
              }}
            >
              <img
                src={imageUrl}
                alt={photo.original_filename}
                style={{
                  borderRadius: '0.5rem',
                  objectFit: 'cover',
                  width: '100%',
                  height: '200px',
                }}
              />
              <div
                style={{
                  marginTop: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  {photo.original_filename}
                </span>
                {photo.caption && (
                  <span
                    style={{
                      fontSize: '0.875rem',
                      color: '#d1d5db',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    } as React.CSSProperties}
                  >
                    {photo.caption}
                  </span>
                )}
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  {new Date(photo.uploaded_at).toLocaleString()}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  File: {photo.original_filename}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {photosQuery.data && photosQuery.data.pages > 1 && (
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
            onClick={() => setPage((p) => Math.max(1, p - 1))}
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
            Page {photosQuery.data.page} of {photosQuery.data.pages}
          </span>
          <button
            type="button"
            onClick={() =>
              setPage((p) =>
                photosQuery.data ? Math.min(photosQuery.data.pages, p + 1) : p,
              )
            }
            disabled={!photosQuery.data || page >= photosQuery.data.pages}
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid #4b5563',
              backgroundColor: 'transparent',
              color: '#e5e7eb',
              cursor:
                !photosQuery.data || page >= photosQuery.data.pages
                  ? 'default'
                  : 'pointer',
              opacity:
                !photosQuery.data || page >= photosQuery.data.pages ? 0.7 : 1,
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

