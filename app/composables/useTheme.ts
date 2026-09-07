const THEME_KEY = 'smartjob-theme'

const theme = ref<'light' | 'dark'>('light')

function apply(value: 'light' | 'dark') {
  theme.value = value
  if (import.meta.client) {
    document.documentElement.classList.toggle('dark', value === 'dark')
    localStorage.setItem(THEME_KEY, value)
  }
}

export function useTheme() {
  function init() {
    if (!import.meta.client) return
    const stored = localStorage.getItem(THEME_KEY)
    const preferred = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    apply(preferred)
  }

  function toggle() {
    apply(theme.value === 'dark' ? 'light' : 'dark')
  }

  return { theme, init, toggle }
}
