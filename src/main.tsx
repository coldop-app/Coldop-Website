import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { useStore } from '@/stores/store'
import './index.css'

function InnerApp() {
  const admin = useStore((state) => state.admin)
  const token = useStore((state) => state.token)
  const auth = {
    isAuthenticated: !!(admin && token),
    admin,
    token,
  }
  return <RouterProvider router={router} context={{ auth }} />
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement)
  root.render(
    <StrictMode>
      <InnerApp />
    </StrictMode>,
  )
}
