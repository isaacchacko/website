import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { fetchJson } from "../lib/api";

export const Route = createFileRoute("/leave-a-message")({
  component: Page
});

function Page() {

  const mutation = useMutation({
    mutationFn: (data: { name: string; message: string }) =>
      fetchJson('/guestbook/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  })

  function submitForm(e: HTMLFormElement) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get('name') || '').trim()
    const message = String(fd.get('message') || '').trim()
    const url = String(fd.get('url') || '').trim()
    if (!name || !message || !url) return
    mutation.mutate({ name, message })
  }

  return (
    <div
      style={{
        maxWidth: '48rem',
        margin: '0 auto',
        padding: '2rem 1rem',
      }}
    >
      <h1
        style={{
          fontSize: '2.25rem',
          fontWeight: 700,
          marginBottom: '1.5rem',
        }}
      >
        Leave a Message!
      </h1>
      <form onSubmit={e => {
        submitForm(e);
      }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label
              htmlFor="name"
              style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              placeholder="Who are you?"
              required
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid #4b5563',
                color: '#f9fafb',
              }}
            />
          </div>
          <div>
            <label
              htmlFor="message"
              style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              placeholder="What's your message?"
              required
              rows={4}
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
              htmlFor="url"
              style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
            >
              Website
            </label>
            <input
              id="url"
              name="url"
              placeholder="What's your return address?"
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
          <button
            type="submit"
            disabled={mutation.isPending}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: '1px solid #14b8a6',
              backgroundColor: mutation.isPending ? '#0f766e' : '#14b8a6',
              color: '#0f172a',
              fontWeight: 500,
              cursor: mutation.isPending ? 'default' : 'pointer',
              opacity: mutation.isPending ? 0.8 : 1,
            }}
          >
            Send
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
              <strong>Message sent!</strong>
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
              <strong>Something went wrong</strong>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
