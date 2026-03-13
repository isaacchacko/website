import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { type SubmitEvent } from 'react'
import { fetchJson } from '../lib/api'

type LibrarySuggestionCreate = {
  title: string
  url: string
  note?: string | null
  item_type: string
  tags?: string | null
}

export const Route = createFileRoute('/library/suggest')({
  component: LibrarySuggestPage,
})

function LibrarySuggestPage() {
  const mutation = useMutation({
    mutationFn: (data: LibrarySuggestionCreate) =>
      fetchJson<{ message: string }>('/library/suggest', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  })

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const title = String(formData.get('title') || '').trim()
    const url = String(formData.get('url') || '').trim()
    const note = String(formData.get('note') || '').trim() || null
    const item_type = String(formData.get('item_type') || '').trim()
    const tags = String(formData.get('tags') || '').trim() || null

    if (!title || !url || !item_type) return

    mutation.mutate({ title, url, note, item_type, tags })
    e.currentTarget.reset()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <section>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          Suggest a library item
        </h1>
        <p style={{ color: '#d1d5db' }}>
          This hits the FastAPI /library/suggest endpoint.
        </p>
      </section>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit(e as unknown as SubmitEvent<HTMLFormElement>)
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label
              htmlFor="title"
              style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
            >
              Title <span style={{ color: '#f87171' }}>*</span>
            </label>
            <input
              id="title"
              name="title"
              required
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid #4b5563',
                backgroundColor: '#020617',
                color: '#f9fafb',
              }}
            />
          </div>
          <div>
            <label
              htmlFor="url"
              style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
            >
              URL <span style={{ color: '#f87171' }}>*</span>
            </label>
            <input
              id="url"
              name="url"
              placeholder="https://…"
              required
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid #4b5563',
                backgroundColor: '#020617',
                color: '#f9fafb',
              }}
            />
          </div>
          <div>
            <label
              htmlFor="item_type"
              style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
            >
              Type <span style={{ color: '#f87171' }}>*</span>
            </label>
            <input
              id="item_type"
              name="item_type"
              placeholder="book, article, video…"
              required
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid #4b5563',
                backgroundColor: '#020617',
                color: '#f9fafb',
              }}
            />
          </div>
          <div>
            <label
              htmlFor="note"
              style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
            >
              Note
            </label>
            <textarea
              id="note"
              name="note"
              rows={3}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid #4b5563',
                backgroundColor: '#020617',
                color: '#f9fafb',
                resize: 'vertical',
              }}
            />
          </div>
          <div>
            <label
              htmlFor="tags"
              style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
            >
              Tags (comma separated)
            </label>
            <input
              id="tags"
              name="tags"
              placeholder="ai, optimization, manufacturing"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid #4b5563',
                backgroundColor: '#020617',
                color: '#f9fafb',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={mutation.isPending}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: '1px solid #14b8a6',
              backgroundColor: '#14b8a6',
              color: '#0f172a',
              fontWeight: 500,
              cursor: mutation.isPending ? 'default' : 'pointer',
              opacity: mutation.isPending ? 0.8 : 1,
              alignSelf: 'flex-start',
            }}
          >
            Submit suggestion
          </button>
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
              <strong>Suggestion submitted</strong>
              <div>Thanks! Your suggestion will be reviewed.</div>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

