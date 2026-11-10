import { toast } from '@/shared/lib/toast'

const BASE = '/api/v1'
const APP = 'merchant'
const LANG_KEY = 'birzum.lang'
const TOKEN_KEY = 'birzum.token'

/** A failed call: the server's error (slug, code, details) or a network failure (slug "network"). */
export class ApiError extends Error {
  slug: string
  code: number
  status: number
  details?: Record<string, string>

  constructor(
    message: string,
    slug: string,
    code: number,
    status: number,
    details?: Record<string, string>,
  ) {
    super(message)
    this.slug = slug
    this.code = code
    this.status = status
    this.details = details
  }
}

type Envelope<T> = {
  success: boolean
  data?: T
  error?: { code: number; slug: string; message: string; details?: Record<string, string> }
}

// The UI language is kept by the I18nProvider in localStorage; the API answers in the same one.
function uiLang() {
  try {
    return localStorage.getItem(LANG_KEY) === 'ru' ? 'ru' : 'uz'
  } catch {
    return 'uz'
  }
}

// There is no merchant login yet, so normally there is no token. When the login appears, it
// stores the access token here and every call carries it.
function token() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

type Options = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  query?: Record<string, string | number | undefined>
  body?: unknown
  signal?: AbortSignal
}

/** Calls `/api/v1{path}` and returns the envelope's `data`. Throws `ApiError` otherwise. */
export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const { method = 'GET', query, body, signal } = options
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const url = `${BASE}${path}${params.size > 0 ? `?${params}` : ''}`

  const headers: Record<string, string> = { 'X-App': APP, 'Accept-Language': uiLang() }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const bearer = token()
  if (bearer) headers.Authorization = `Bearer ${bearer}`

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause
    throw new ApiError('Server bilan aloqa yoʻq', 'network', 0, 0)
  }

  let envelope: Envelope<T> | null = null
  try {
    envelope = (await response.json()) as Envelope<T>
  } catch {
    // not JSON, handled below
  }
  if (!response.ok || !envelope?.success) {
    const error = envelope?.error
    throw new ApiError(
      error?.message ?? `HTTP ${response.status}`,
      error?.slug ?? 'http_error',
      error?.code ?? 0,
      response.status,
      error?.details,
    )
  }
  return envelope.data as T
}

/** Shows an API failure with the server's own message, in the toast. */
export function toastError(error: unknown) {
  if (error instanceof DOMException && error.name === 'AbortError') return
  const message = error instanceof ApiError ? error.message : String(error)
  const details =
    error instanceof ApiError && error.details
      ? ` (${Object.entries(error.details)
          .map(([field, reason]) => `${field}: ${reason}`)
          .join(', ')})`
      : ''
  toast(`${message}${details}`, 'error')
}
