import { createFileRoute, Link } from '@tanstack/react-router'

function About() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">About Coldop</h1>
      <p className="text-muted-foreground max-w-prose text-center mb-6">
        This is the about page. You can add your company info, team, or mission
        here.
      </p>
      <Link
        to="/"
        className="text-primary underline underline-offset-4 hover:no-underline"
      >
        Back to home
      </Link>
    </div>
  )
}

export const Route = createFileRoute('/about')({
  component: About,
})
