import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, toastError } from './client'

type State = { loading: boolean; failed: 'offline' | 'server' | null }

/**
 * Runs `load` when the screen opens (and again on `reload`). `loading` is true until the first
 * answer; `failed` says whether it was a lost connection or a server error, for `ErrorState`.
 */
export function useRemote(load: () => Promise<unknown>) {
  const loader = useRef(load)
  useEffect(() => {
    loader.current = load
  })
  const [state, setState] = useState<State>({ loading: true, failed: null })

  const run = useCallback(
    () =>
      loader
        .current()
        .then(() => setState({ loading: false, failed: null }))
        .catch((error: unknown) => {
          toastError(error)
          const offline = error instanceof ApiError && error.slug === 'network'
          setState({ loading: false, failed: offline ? 'offline' : 'server' })
        }),
    [],
  )

  // The first load starts as `loading`, so nothing needs setting here
  useEffect(() => {
    void run()
  }, [run])

  const reload = useCallback(() => {
    setState({ loading: true, failed: null })
    return run()
  }, [run])

  return { ...state, reload }
}
