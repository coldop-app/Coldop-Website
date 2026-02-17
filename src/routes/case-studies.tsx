import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/case-studies')({
  component: CaseStudiesPage,
})

function CaseStudiesPage() {
  return (
    <div className="p-4">
      <h1>Case Studies</h1>
      <p>Explore our case studies.</p>
    </div>
  )
}
