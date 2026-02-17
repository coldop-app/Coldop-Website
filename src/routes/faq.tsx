import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/faq')({
  component: FAQPage,
})

function FAQPage() {
  return (
    <div className="p-4">
      <h1>FAQ</h1>
      <p>Frequently asked questions.</p>
    </div>
  )
}
