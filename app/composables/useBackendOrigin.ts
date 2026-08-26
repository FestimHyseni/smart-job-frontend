export function useBackendOrigin() {
  const config = useRuntimeConfig()
  const origin = config.public.apiBase.replace(/\/api\/?$/, '')

  function resolveUrl(path: string | null | undefined) {
    if (!path) return null
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    return `${origin}${path}`
  }

  return { origin, resolveUrl }
}
