import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/store-admin/login')({
  component: StoreAdminLoginPage,
})

function StoreAdminLoginPage() {
  return (
    <div className="p-4">
      <h1>Store Admin Login</h1>
      <p>Sign in to the store admin.</p>
    </div>
  )
}
