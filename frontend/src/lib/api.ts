const API_BASE =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export type ApiError = Error & { status?: number }

export async function fetchJson<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${path}`
  
  // Debug logging in dev
  if (import.meta.env.DEV) {
    console.log(`[API] ${options.method || 'GET'} ${url}`)
  }

  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    })

    if (!res.ok) {
      const err: ApiError = new Error(
        `Request failed: ${res.status} ${res.statusText} (${url})`,
      )
      err.status = res.status
      if (import.meta.env.DEV) {
        console.error(`[API Error]`, err.message)
      }
      throw err
    }

    // Handle 204 No Content
    if (res.status === 204) {
      if (import.meta.env.DEV) {
        console.log(`[API] Success: 204 No Content`)
      }
      return undefined as T
    }

    const data = await res.json()
    if (import.meta.env.DEV) {
      console.log(`[API] Success:`, data)
    }
    return data as T
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkErr: ApiError = new Error(
        `Network error: Cannot reach API at ${API_BASE}. Is the backend running?`,
      )
      if (import.meta.env.DEV) {
        console.error(`[API Network Error]`, networkErr.message)
      }
      throw networkErr
    }
    throw error
  }
}

