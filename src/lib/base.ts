import { BaseClient } from '@hanzo/base'
import { BASE_URL } from '../env'

/**
 * A Hanzo Base client acting as the signed-in user. Base is IAM-native: it
 * validates the hanzo.id JWT and enforces per-org isolation. BaseClient sends
 * `authStore.token` verbatim as the Authorization header, so we save the IAM
 * access token as `Bearer <jwt>`. `null` token → an anonymous client (queries
 * return empty until the user signs in).
 */
export function baseAs(iamToken: string | null): BaseClient {
  const client = new BaseClient(BASE_URL)
  if (iamToken) client.authStore.save(`Bearer ${iamToken}`, null)
  return client
}
