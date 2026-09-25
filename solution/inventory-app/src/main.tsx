import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { FluentProvider, webLightTheme, webDarkTheme } from '@fluentui/react-components'
import './index.css'
import App from './App.tsx'

function Root() {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  const [dark, setDark] = useState(media.matches)
  useEffect(() => {
    const onChange = (e: MediaQueryListEvent) => setDark(e.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [media])
  return (
    <FluentProvider theme={dark ? webDarkTheme : webLightTheme} style={{ minHeight: '100vh' }}>
      <App />
    </FluentProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
