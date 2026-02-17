import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { useStore } from '@/stores/store';
import './index.css';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Create a new router instance with context
const router = createRouter({
  routeTree,
  context: {
    // auth will initially be undefined
    // We'll be passing down the auth state from within a React component
    auth: undefined!,
  },
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Inner component that provides auth context to the router
function InnerApp() {
  const { admin, token } = useStore();
  const isAuthenticated = !!(admin && token);

  return (
    <RouterProvider
      router={router}
      context={{
        auth: {
          isAuthenticated,
          admin,
          token,
        },
      }}
    />
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <InnerApp />
  </StrictMode>
);
