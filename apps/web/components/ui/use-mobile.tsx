import * as React from 'react'

const MOBILE_BREAKPOINT = 768

const subscribe = (onChange: () => void) => {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

const getSnapshot = () => window.innerWidth < MOBILE_BREAKPOINT

// No viewport on the server, so the first render (and hydration) is "desktop".
const getServerSnapshot = () => false

export const useIsMobile = () =>
  React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
