import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/support')({
  component: SupportPage,
})

function SupportPage() {
  return (
    <div className="p-4">
      <h1>Support</h1>
      <p>Get in touch for support.</p>
    </div>
  )
}
