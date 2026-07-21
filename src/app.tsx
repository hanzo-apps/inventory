import type { ReactNode } from 'react'
import { useIam } from '@hanzo/iam/react'
import { YStack, Spinner } from '@hanzo/gui'
import { Callback } from './auth/callback'
import { SignedOut } from './views/signed-out'
import { Home } from './views/home'

function Center({ children }: { children: ReactNode }) {
  return (
    <YStack flex={1} minHeight="100vh" alignItems="center" justifyContent="center" backgroundColor="$background">
      {children}
    </YStack>
  )
}

/**
 * Top-level route + auth gate — no router dependency (one static SPA):
 *   /auth/callback  → finish the PKCE exchange, then land home
 *   signed out      → the Stockroom landing (sign in with Hanzo)
 *   signed in       → the stockroom (inventory table · item detail · alerts · manage)
 */
export function App() {
  const { isAuthenticated, isLoading } = useIam()

  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/auth/callback')) {
    return <Callback />
  }
  if (isLoading) {
    return (
      <Center>
        <Spinner size="large" />
      </Center>
    )
  }
  return isAuthenticated ? <Home /> : <SignedOut />
}
