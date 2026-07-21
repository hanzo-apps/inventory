import { YStack } from '@hanzo/gui'
import { AMBER } from '../lib/stock'

/**
 * The Stockroom mark: three shelf rows racked in a crate, the bottom shelf amber
 * — the low-stock signal the whole app is built around.
 */
export function Logo({ size = 30 }: { size?: number }) {
  const pad = Math.round(size * 0.18)
  const gap = Math.max(Math.round(size * 0.1), 2)
  const rowH = (size - pad * 2 - gap * 2) / 3
  const radius = Math.max(rowH / 3, 1)
  return (
    <YStack
      width={size}
      height={size}
      borderRadius={Math.round(size / 4)}
      backgroundColor="#1b1f27"
      borderWidth={1}
      borderColor="#ffffff22"
      padding={pad}
      gap={gap}
      justifyContent="center"
    >
      <YStack height={rowH} borderRadius={radius} backgroundColor="#8b93a4" />
      <YStack height={rowH} borderRadius={radius} backgroundColor="#8b93a4" />
      <YStack height={rowH} borderRadius={radius} backgroundColor={AMBER} />
    </YStack>
  )
}
