import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchJson, type ApiError } from '../lib/api'

type SpotifyNowPlaying = {
  is_playing: boolean
  track?: string
  artist?: string[]
  artist_uri?: string[]
  album?: string
  album_uri?: string
  image?: string | null
  progress?: number | null
  duration?: number
  explicit?: boolean
  popularity?: number
  track_url?: string
}

export const Route = createFileRoute('/spotify/')({
  component: SpotifyPage,
})

function SpotifyPage() {
  const query = useQuery({
    queryKey: ['spotifyNowPlaying'],
    queryFn: () => fetchJson<SpotifyNowPlaying>('/spotify/now-playing'),
    retry: false,
  })

  const refetch = () => query.refetch()

  const data = query.data
  const isPlaying = data?.is_playing
  const artistNames = data?.artist?.join(', ')
  const progressPct =
    data?.progress != null && data?.duration
      ? Math.min(100, Math.max(0, (data.progress / data.duration) * 100))
      : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Spotify now playing</h1>

      {query.isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>⏳</span>
          <span>Fetching track…</span>
        </div>
      )}

      {query.error && (
        <div
          style={{
            border: '1px solid #b91c1c',
            backgroundColor: '#450a0a',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '0.9rem',
          }}
        >
          <strong>Could not fetch now playing</strong>
          <div>
            {(query.error as ApiError).status === 503
              ? 'Spotify data is temporarily unavailable.'
              : 'Check that the backend and Spotify integration are configured.'}
          </div>
        </div>
      )}

      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {data.image && (
              <img
                src={data.image}
                alt={data.track ?? 'Album art'}
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '0.5rem',
                  objectFit: 'cover',
                }}
              />
            )}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.25rem',
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>
                  {data.track ?? (isPlaying ? 'Unknown track' : 'Nothing playing')}
                </span>
                {data.explicit && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.1rem 0.35rem',
                      borderRadius: '0.375rem',
                      backgroundColor: '#b91c1c',
                      color: '#f9fafb',
                    }}
                  >
                    E
                  </span>
                )}
              </div>
              <p style={{ color: '#d1d5db' }}>
                {artistNames || 'Unknown artist'}
                {data.album && ` — ${data.album}`}
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  marginTop: '0.25rem',
                  fontSize: '0.875rem',
                  color: '#9ca3af',
                }}
              >
                <span>{isPlaying ? 'Now playing' : 'Paused'}</span>
                {data.popularity != null && <span>Popularity: {data.popularity}</span>}
              </div>
            </div>
          </div>

          {progressPct != null && (
            <div>
              <div
                style={{
                  height: '6px',
                  borderRadius: '9999px',
                  backgroundColor: '#374151',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progressPct}%`,
                    backgroundColor: '#22c55e',
                    transition: 'width 0.2s linear',
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  marginTop: '0.25rem',
                }}
              >
                <span>
                  {Math.floor((data!.progress ?? 0) / 1000)}s /{' '}
                  {Math.floor((data!.duration ?? 0) / 1000)}s
                </span>
                {data.track_url && (
                  <a
                    href={data.track_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#4ade80' }}
                  >
                    Open in Spotify
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={refetch}
        style={{
          alignSelf: 'flex-start',
          padding: '0.5rem 0.75rem',
          borderRadius: '9999px',
          border: '1px solid #4b5563',
          backgroundColor: 'transparent',
          color: '#e5e7eb',
          cursor: 'pointer',
        }}
      >
        Refresh
      </button>
    </div>
  )
}

