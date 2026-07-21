import { useIam } from '@hanzo/iam/react'
import { YStack, XStack, H1, Paragraph, Text, Button } from '@hanzo/gui'
import { Logo } from './brand'
import { AMBER, RED, GREEN, PANEL, tint } from '../lib/stock'

/** One illustrative row in the preview table (static — not live data). */
interface PreviewRow {
  sku: string
  name: string
  loc: string
  qty: number
  reorder: number
  status: 'ok' | 'low' | 'out'
}

// A small, illustrative stockroom — the same row styling the real table uses, so
// the hero shows the product faithfully (amber Low rows, a red Out row).
const PREVIEW: PreviewRow[] = [
  { sku: 'WGT-014', name: 'M6 Hex Bolt (100pk)', loc: 'A1·03', qty: 240, reorder: 80, status: 'ok' },
  { sku: 'WGT-051', name: 'Nitrile Gloves, L', loc: 'B4·11', qty: 24, reorder: 40, status: 'low' },
  { sku: 'PKG-233', name: 'Kraft Mailer 6×9', loc: 'C2·07', qty: 0, reorder: 50, status: 'out' },
  { sku: 'WGT-087', name: 'Thermal Roll 80mm', loc: 'A3·02', qty: 12, reorder: 20, status: 'low' },
  { sku: 'CBL-006', name: 'USB-C Cable 1m', loc: 'D1·14', qty: 320, reorder: 60, status: 'ok' },
]

const COLOR: Record<PreviewRow['status'], string> = { ok: GREEN, low: AMBER, out: RED }
const SHORT: Record<PreviewRow['status'], string> = { ok: 'OK', low: 'LOW', out: 'OUT' }

function Head({ children }: { children: string }) {
  return (
    <Text fontSize={10} fontWeight="700" letterSpacing={0.6} color="#8a92a2">
      {children.toUpperCase()}
    </Text>
  )
}

function PreviewTable() {
  return (
    <YStack borderWidth={1} borderColor="#ffffff1c" borderRadius={16} overflow="hidden" backgroundColor="#0d0f13">
      {/* header */}
      <XStack height={38} alignItems="center" backgroundColor="#ffffff08" borderBottomWidth={1} borderColor="#ffffff14" borderLeftWidth={3} borderLeftColor="transparent">
        <YStack width={92} paddingHorizontal={12}><Head>SKU</Head></YStack>
        <YStack flex={1} paddingHorizontal={12}><Head>Item</Head></YStack>
        <YStack width={72} paddingHorizontal={12} alignItems="flex-end"><Head>On hand</Head></YStack>
        <YStack width={66} paddingHorizontal={12} alignItems="flex-start"><Head>Status</Head></YStack>
      </XStack>
      {/* rows */}
      {PREVIEW.map((r, i) => {
        const c = COLOR[r.status]
        const last = i === PREVIEW.length - 1
        const bg =
          r.status === 'out'
            ? tint(RED, '14')
            : r.status === 'low'
              ? tint(AMBER, '16')
              : i % 2 === 1
                ? '#ffffff05'
                : 'transparent'
        return (
          <XStack
            key={r.sku}
            height={46}
            alignItems="center"
            backgroundColor={bg}
            borderBottomWidth={last ? 0 : 1}
            borderColor="#ffffff10"
            borderLeftWidth={3}
            borderLeftColor={r.status === 'ok' ? 'transparent' : c}
          >
            <YStack width={92} paddingHorizontal={12}>
              <Text fontSize={12} fontWeight="700" letterSpacing={0.4} color="#c7ccd6" numberOfLines={1}>{r.sku}</Text>
            </YStack>
            <YStack flex={1} paddingHorizontal={12}>
              <Text fontSize={13} fontWeight="600" color="#f2f4f8" numberOfLines={1}>{r.name}</Text>
              <Text fontSize={11} color="#8a92a2" numberOfLines={1}>{r.loc} · reorder at {r.reorder}</Text>
            </YStack>
            <YStack width={72} paddingHorizontal={12} alignItems="flex-end">
              <Text fontSize={15} fontWeight="800" color={r.status === 'ok' ? '#f2f4f8' : c}>{r.qty}</Text>
            </YStack>
            <YStack width={66} paddingHorizontal={12} alignItems="flex-start">
              <XStack alignItems="center" gap={5} paddingHorizontal={8} paddingVertical={3} borderRadius={999} backgroundColor={tint(c, '22')} borderWidth={1} borderColor={tint(c, '3a')}>
                <YStack width={6} height={6} borderRadius={999} backgroundColor={c} />
                <Text fontSize={10} fontWeight="700" color={c}>{SHORT[r.status]}</Text>
              </XStack>
            </YStack>
          </XStack>
        )
      })}
    </YStack>
  )
}

function FeatureChip({ children }: { children: string }) {
  return (
    <XStack alignItems="center" gap={7} paddingHorizontal={12} paddingVertical={7} borderRadius={999} borderWidth={1} borderColor="$borderColor" backgroundColor={PANEL}>
      <Text fontSize={13} color="$color12">{children}</Text>
    </XStack>
  )
}

/**
 * Signed-out landing — the honest public view (the tracker itself needs sign-in).
 * One action: PKCE sign-in with Hanzo (hanzo.id). No local credential form.
 */
export function SignedOut() {
  const { login, isLoading } = useIam()

  return (
    <YStack flex={1} minHeight="100vh" alignItems="center" justifyContent="center" padding="$6" backgroundColor="$background">
      <XStack maxWidth={1120} width="100%" gap="$8" flexWrap="wrap" alignItems="center" justifyContent="center">
        {/* Copy + CTA */}
        <YStack flex={1} minWidth={340} gap="$5" paddingVertical="$4">
          <XStack alignItems="center" gap="$3">
            <Logo size={40} />
            <YStack>
              <Text fontSize={22} fontWeight="800" color="$color12">Stockroom</Text>
              <Text fontSize={12} color="$color11" opacity={0.6}>Inventory &amp; Reordering</Text>
            </YStack>
          </XStack>

          <H1 fontSize={46} lineHeight={50} fontWeight="900" color="$color12">
            Know what&apos;s low before you run out.
          </H1>

          <Paragraph fontSize={17} lineHeight={26} opacity={0.7} maxWidth={520}>
            A dense stockroom for real inventory. Track every SKU by quantity and
            location, watch on-hand counts against reorder points, and let low stock
            flag itself in amber before it becomes a stockout.
          </Paragraph>

          <XStack gap="$2" flexWrap="wrap">
            <FeatureChip>Dense stock table</FeatureChip>
            <FeatureChip>Low-stock alerts</FeatureChip>
            <FeatureChip>Reorder points</FeatureChip>
          </XStack>

          <XStack gap="$3" alignItems="center" flexWrap="wrap">
            <Button size="$5" theme="active" disabled={isLoading} onPress={() => login()}>
              {isLoading ? 'Loading…' : 'Sign in with Hanzo'}
            </Button>
            <Text fontSize={13} opacity={0.5}>Items stored per-org in Hanzo Base.</Text>
          </XStack>
        </YStack>

        {/* Illustrative preview */}
        <YStack flex={1} minWidth={380} gap="$2" paddingVertical="$4">
          <Text fontSize={11} fontWeight="700" color="$color11" opacity={0.5} letterSpacing={1}>PREVIEW</Text>
          <PreviewTable />
        </YStack>
      </XStack>
    </YStack>
  )
}
