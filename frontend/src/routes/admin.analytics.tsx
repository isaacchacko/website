import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { type ChangeEvent, useState } from 'react'
import { fetchJson } from '../lib/api'

type AnalyticsSummary = {
  total_views_today: number
  total_views_week: number
  total_views_all_time: number
  top_pages: { path: string; count: number }[]
  top_referrers: { referrer: string; count: number }[]
  device_breakdown: { device: string; count: number }[]
  browser_breakdown: { browser: string; count: number }[]
}

type AnalyticsEventsPage = {
  items: {
    id: number
    path: string
    referrer?: string | null
    device_type?: string | null
    browser?: string | null
    country?: string | null
    duration_seconds?: number | null
    created_at: string
  }[]
  total: number
  page: number
  per_page: number
  pages: number
}

export const Route = createFileRoute('/admin/analytics')({
  component: AnalyticsAdminPage,
})

function AnalyticsAdminPage() {
  const [adminKey, setAdminKey] = useState('')

  const summaryQuery = useQuery({
    queryKey: ['analyticsSummary', { adminKey }],
    enabled: false,
    queryFn: () =>
      fetchJson<AnalyticsSummary>('/analytics/summary?days=7', {
        headers: { 'x-admin-key': adminKey },
      }),
  })

  const eventsQuery = useQuery({
    queryKey: ['analyticsEvents', { adminKey }],
    enabled: false,
    queryFn: () =>
      fetchJson<AnalyticsEventsPage>('/analytics/events?page=1&per_page=50', {
        headers: { 'x-admin-key': adminKey },
      }),
  })

  const onAdminKeyChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAdminKey(e.target.value)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <section>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          Analytics admin
        </h1>
        <p style={{ color: '#d1d5db' }}>
          View summary metrics and recent events from the FastAPI analytics endpoints.
        </p>
      </section>

      <section style={{ maxWidth: '24rem' }}>
        <label
          htmlFor="analytics-admin-key"
          style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
        >
          Admin API key
        </label>
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'flex-end',
          }}
        >
          <input
            id="analytics-admin-key"
            type="password"
            value={adminKey}
            onChange={onAdminKeyChange}
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid #4b5563',
              color: '#f9fafb',
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (!adminKey) return
              summaryQuery.refetch()
              eventsQuery.refetch()
            }}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid #14b8a6',
              backgroundColor: '#14b8a6',
              color: '#0f172a',
              fontWeight: 500,
              cursor: adminKey ? 'pointer' : 'default',
              opacity: adminKey ? 1 : 0.7,
            }}
          >
            Load analytics
          </button>
        </div>
      </section>

      {!adminKey && (
        <div
          style={{
            border: '1px solid #38bdf8',
            backgroundColor: '#0b1120',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '0.9rem',
          }}
        >
          <strong>Enter admin key</strong>
          <div>Provide the admin API key to load analytics data.</div>
        </div>
      )}

      {summaryQuery.isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>⏳</span>
          <span>Loading summary…</span>
        </div>
      )}

      {summaryQuery.isError && adminKey && (
        <div
          style={{
            border: '1px solid #b91c1c',
            backgroundColor: '#450a0a',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '0.9rem',
          }}
        >
          <strong>Could not load summary</strong>
        </div>
      )}

      {summaryQuery.data && (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Today</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {summaryQuery.data.total_views_today}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Last 7 days</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {summaryQuery.data.total_views_week}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>All time</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {summaryQuery.data.total_views_all_time}
            </div>
          </div>
        </div>
      )}

      {summaryQuery.data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <section>
            <h2 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
              Top pages (7 days)
            </h2>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.875rem',
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '0.5rem',
                      borderBottom: '1px solid #374151',
                    }}
                  >
                    Path
                  </th>
                  <th
                    style={{
                      textAlign: 'right',
                      padding: '0.5rem',
                      borderBottom: '1px solid #374151',
                    }}
                  >
                    Views
                  </th>
                </tr>
              </thead>
              <tbody>
                {summaryQuery.data.top_pages.map((p) => (
                  <tr key={p.path}>
                    <td style={{ padding: '0.4rem 0.5rem', borderBottom: '1px solid #111827' }}>
                      {p.path}
                    </td>
                    <td
                      style={{
                        padding: '0.4rem 0.5rem',
                        textAlign: 'right',
                        borderBottom: '1px solid #111827',
                      }}
                    >
                      {p.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h2 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Top referrers</h2>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.875rem',
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '0.5rem',
                      borderBottom: '1px solid #374151',
                    }}
                  >
                    Referrer
                  </th>
                  <th
                    style={{
                      textAlign: 'right',
                      padding: '0.5rem',
                      borderBottom: '1px solid #374151',
                    }}
                  >
                    Views
                  </th>
                </tr>
              </thead>
              <tbody>
                {summaryQuery.data.top_referrers.map((r) => (
                  <tr key={r.referrer}>
                    <td style={{ padding: '0.4rem 0.5rem', borderBottom: '1px solid #111827' }}>
                      {r.referrer || '(direct)'}
                    </td>
                    <td
                      style={{
                        padding: '0.4rem 0.5rem',
                        textAlign: 'right',
                        borderBottom: '1px solid #111827',
                      }}
                    >
                      {r.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h2 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Device breakdown</h2>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.875rem',
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '0.5rem',
                      borderBottom: '1px solid #374151',
                    }}
                  >
                    Device
                  </th>
                  <th
                    style={{
                      textAlign: 'right',
                      padding: '0.5rem',
                      borderBottom: '1px solid #374151',
                    }}
                  >
                    Count
                  </th>
                </tr>
              </thead>
              <tbody>
                {summaryQuery.data.device_breakdown.map((d) => (
                  <tr key={d.device}>
                    <td style={{ padding: '0.4rem 0.5rem', borderBottom: '1px solid #111827' }}>
                      {d.device || '(unknown)'}
                    </td>
                    <td
                      style={{
                        padding: '0.4rem 0.5rem',
                        textAlign: 'right',
                        borderBottom: '1px solid #111827',
                      }}
                    >
                      {d.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h2 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Browser breakdown</h2>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.875rem',
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '0.5rem',
                      borderBottom: '1px solid #374151',
                    }}
                  >
                    Browser
                  </th>
                  <th
                    style={{
                      textAlign: 'right',
                      padding: '0.5rem',
                      borderBottom: '1px solid #374151',
                    }}
                  >
                    Count
                  </th>
                </tr>
              </thead>
              <tbody>
                {summaryQuery.data.browser_breakdown.map((b) => (
                  <tr key={b.browser}>
                    <td style={{ padding: '0.4rem 0.5rem', borderBottom: '1px solid #111827' }}>
                      {b.browser || '(unknown)'}
                    </td>
                    <td
                      style={{
                        padding: '0.4rem 0.5rem',
                        textAlign: 'right',
                        borderBottom: '1px solid #111827',
                      }}
                    >
                      {b.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}

      {eventsQuery.isLoading && adminKey && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>⏳</span>
          <span>Loading events…</span>
        </div>
      )}

      {eventsQuery.data && (
        <section>
          <h2 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Recent events</h2>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem',
            }}
          >
            <thead>
              <tr>
                {[
                  'ID',
                  'Path',
                  'Referrer',
                  'Device',
                  'Browser',
                  'Country',
                  'Duration',
                  'Time',
                ].map((header) => (
                  <th
                    key={header}
                    style={{
                      textAlign: 'left',
                      padding: '0.5rem',
                      borderBottom: '1px solid #374151',
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {eventsQuery.data.items.map((e) => (
                <tr key={e.id}>
                  <td style={{ padding: '0.4rem 0.5rem', borderBottom: '1px solid #111827' }}>
                    #{e.id}
                  </td>
                  <td style={{ padding: '0.4rem 0.5rem', borderBottom: '1px solid #111827' }}>
                    {e.path}
                  </td>
                  <td style={{ padding: '0.4rem 0.5rem', borderBottom: '1px solid #111827' }}>
                    {e.referrer || '(direct)'}
                  </td>
                  <td style={{ padding: '0.4rem 0.5rem', borderBottom: '1px solid #111827' }}>
                    {e.device_type || '(unknown)'}
                  </td>
                  <td style={{ padding: '0.4rem 0.5rem', borderBottom: '1px solid #111827' }}>
                    {e.browser || '(unknown)'}
                  </td>
                  <td style={{ padding: '0.4rem 0.5rem', borderBottom: '1px solid #111827' }}>
                    {e.country || '(unknown)'}
                  </td>
                  <td style={{ padding: '0.4rem 0.5rem', borderBottom: '1px solid #111827' }}>
                    {e.duration_seconds != null ? `${e.duration_seconds}s` : '-'}
                  </td>
                  <td style={{ padding: '0.4rem 0.5rem', borderBottom: '1px solid #111827' }}>
                    {new Date(e.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}

