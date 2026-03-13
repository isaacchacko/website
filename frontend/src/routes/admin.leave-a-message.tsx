import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type SubmitEvent, useState } from 'react'
import { fetchJson } from '../lib/api'

type GuestbookEntryPublic = {
  id: number
  name: string
  message: string
  website?: string | null
  is_approved: boolean
  is_rejected: boolean
  created_at: string
}

type GuestbookPage = {
  items: GuestbookEntryPublic[]
  total: number
  page: number
  per_page: number
  pages: number
}

export const Route = createFileRoute('/admin/leave-a-message')({
  component: LeaveAMessageAdminPage,
})

function LeaveAMessageAdminPage() {
  const [adminKey, setAdminKey] = useState('')
  const queryClient = useQueryClient()

  const entriesQuery = useQuery({
    queryKey: ['guestbook-admin', { adminKey }],
    enabled: false,
    queryFn: () =>
      fetchJson<GuestbookPage>('/guestbook/?page=1&per_page=50', {
        headers: { 'x-admin-key': adminKey },
      }),
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) =>
      fetchJson(`/guestbook/${id}/approve`, {
        method: 'PATCH',
        headers: { 'x-admin-key': adminKey },
      }),
    onSuccess: () => {
      // Query is manually controlled (enabled: false), so explicitly refetch
      entriesQuery.refetch()
      queryClient.invalidateQueries({ queryKey: ['guestbook-admin'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: number) =>
      fetchJson(`/guestbook/${id}/reject`, {
        method: 'PATCH',
        headers: { 'x-admin-key': adminKey },
      }),
    onSuccess: () => {
      entriesQuery.refetch()
      queryClient.invalidateQueries({ queryKey: ['guestbook-admin'] })
    },
  })

  const handleKeySubmit = (e: SubmitEvent) => {
    e.preventDefault()
    if (!adminKey) return
    entriesQuery.refetch()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <section>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          Leave-a-message admin
        </h1>
        <p style={{ color: '#d1d5db' }}>
          Approve or delete guestbook entries using the admin API key.
        </p>
      </section>

      <form
        onSubmit={handleKeySubmit}
        style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem' }}
      >
        <div>
          <label
            htmlFor="admin-key"
            style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
          >
            Admin API key
          </label>
          <input
            id="admin-key"
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid #4b5563',
              color: '#f9fafb',
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: '9999px',
            border: '1px solid #14b8a6',
            backgroundColor: '#14b8a6',
            color: '#0f172a',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Load entries
        </button>
      </form>

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
          <div>Provide the admin API key to manage entries.</div>
        </div>
      )}

      {entriesQuery.isLoading && (
        <p style={{ color: '#9ca3af' }}>Loading entries…</p>
      )}

      {entriesQuery.isError && adminKey && (
        <div
          style={{
            border: '1px solid #b91c1c',
            backgroundColor: '#450a0a',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '0.9rem',
          }}
        >
          <strong>Could not load entries</strong>
          <div>Check that the admin key is correct and the backend is running.</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {entriesQuery.data?.items.map((entry) => (
          <div
            key={entry.id}
            style={{
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              backgroundColor: '#030712',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.25rem',
              }}
            >
              <span style={{ fontWeight: 600 }}>{entry.name}</span>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                #{entry.id}{' '}
                {entry.is_rejected
                  ? '(rejected)'
                  : entry.is_approved
                    ? '(approved)'
                    : '(pending review)'}
              </span>
            </div>
            <p style={{ marginBottom: '0.5rem' }}>{entry.message}</p>
            {entry.website && (
              <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#5eead4' }}>
                <a href={entry.website} target="_blank" rel="noopener noreferrer">
                  {entry.website}
                </a>
              </p>
            )}
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              {new Date(entry.created_at).toLocaleString()}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => approveMutation.mutate(entry.id)}
                disabled={approveMutation.isPending}
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  border: entry.is_approved && !entry.is_rejected
                    ? '1px solid #14b8a6'
                    : '1px solid #4b5563',
                  backgroundColor: entry.is_approved && !entry.is_rejected
                    ? '#14b8a6'
                    : 'transparent',
                  color: entry.is_approved && !entry.is_rejected ? '#0f172a' : '#e5e7eb',
                  fontSize: '0.8rem',
                  cursor: approveMutation.isPending ? 'default' : 'pointer',
                  opacity: approveMutation.isPending ? 0.7 : 1,
                }}
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => rejectMutation.mutate(entry.id)}
                disabled={rejectMutation.isPending}
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  border: entry.is_rejected ? '1px solid #ef4444' : '1px solid #4b5563',
                  backgroundColor: entry.is_rejected ? '#ef4444' : 'transparent',
                  color: entry.is_rejected ? '#0f172a' : '#e5e7eb',
                  fontSize: '0.8rem',
                  cursor: rejectMutation.isPending ? 'default' : 'pointer',
                  opacity: rejectMutation.isPending ? 0.7 : 1,
                }}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

