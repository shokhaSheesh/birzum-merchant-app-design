import { useEffect, useState } from 'react'

/** The current time, refreshed every `everyMs`, for countdowns shown in minutes. */
export function useNow(everyMs = 30_000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), everyMs)
    return () => clearInterval(id)
  }, [everyMs])
  return now
}
