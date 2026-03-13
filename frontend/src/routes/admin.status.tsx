import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { type SubmitEvent, useState } from 'react'
import { fetchJson } from '../lib/api'

type StatusCreate = {
  text: string
}

export const Route = createFileRoute('/admin/status')({
  component: StatusAdminPage,
})

function StatusAdminPage() {
  const [adminKey, setAdminKey] = useState('')

  const mutation = useMutation({
    mutationFn: (text: string) =>
      fetchJson<StatusCreate>('/status/', {
        method: 'POST',
        headers: { 'x-admin-key': adminKey },
        body: JSON.stringify({ text }),
      }),
  })

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const text = String(formData.get('text') || '').trim()
    if (!text) return
    mutation.mutate(text)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <section>
        <div
          style={{
            border: '1px solid #38bdf8',
            backgroundColor: '#0b1120',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '0.9rem',
          }}
        >
          <strong>Update status banner</strong>
          <div>This calls POST /status/ with the admin API key.</div>
        </div>
      </section>

      <div style={{ maxWidth: '24rem' }}>
        <label
          htmlFor="admin-key-status"
          style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
        >
          Admin API key
        </label>
        <input
          id="admin-key-status"
          type="password"
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.375rem',
            border: '1px solid #4b5563',
            color: '#f9fafb',
          }}
        />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit(e as unknown as SubmitEvent<HTMLFormElement>)
        }}
      >
        <div>
          <label
            htmlFor="status-text"
            style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
          >
            New status text <span style={{ color: '#f87171' }}>*</span>
          </label>
          <textarea
            id="status-text"
            name="text"
            rows={3}
            required
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid #4b5563',
              color: '#f9fafb',
              resize: 'vertical',
            }}
          />
        </div>
        <button
          type="submit"
          disabled={!adminKey || mutation.isPending}
          style={{
            marginTop: '0.75rem',
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            border: '1px solid #14b8a6',
            backgroundColor: !adminKey ? '#0f766e' : '#14b8a6',
            color: '#0f172a',
            fontWeight: 500,
            cursor: !adminKey || mutation.isPending ? 'default' : 'pointer',
            opacity: !adminKey || mutation.isPending ? 0.7 : 1,
          }}
        >
          Save status
        </button>
      </form>

      {mutation.isSuccess && (
        <div
          style={{
            border: '1px solid #16a34a',
            backgroundColor: '#052e16',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '0.9rem',
          }}
        >
          <strong>Status updated</strong>
        </div>
      )}

      {mutation.isError && (
        <div
          style={{
            border: '1px solid #b91c1c',
            backgroundColor: '#450a0a',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '0.9rem',
          }}
        >
          <strong>Could not update status</strong>
        </div>
      )}
    </div>
  )
}

