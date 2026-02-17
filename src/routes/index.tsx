import { createFileRoute } from '@tanstack/react-router'
import LandingPage from '@/components/landing'

function Index() {
  return <LandingPage />
}

export const Route = createFileRoute('/')({
  component: Index,
})
