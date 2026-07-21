import { useState } from 'react'
import { useIam } from '@hanzo/iam/react'
import { useQuery } from '@hanzo/base/react'
import { YStack, XStack, Text, Button, Paragraph, Spinner } from '@hanzo/gui'
import { type Item, statusOf, totalUnits, lowStock, tint, AMBER, RED } from '../lib/stock'
import { Logo } from './brand'
import { Inventory } from './inventory'
import { Alerts } from './alerts'
import { Manage } from './manage'
import { Detail } from './detail'

type Tab = 'inventory' | 'alerts' | 'manage'

function TabButton({ label, badge, active, onPress }: { label: string; badge?: number; active: boolean; onPress: () => void }) {
  return (
    <Button size="$3" chromeless={!active} theme={active ? 'active' : undefined} backgroundColor={active ? undefined : 'transparent'} onPress={onPress}>
      <XStack alignItems="center" gap={6}>
        <Text fontSize={14} fontWeight="700" color={active ? undefined : '$color11'}>{label}</Text>
        {badge ? (
          <XStack minWidth={18} height={18} paddingHorizontal={5} borderRadius={999} alignItems="center" justifyContent="center" backgroundColor={tint(AMBER, '30')}>
            <Text fontSize={10} fontWeight="800" color={AMBER}>{badge}</Text>
          </XStack>
        ) : null}
      </XStack>
    </Button>
  )
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <YStack flex={1} minWidth={130} gap={4} padding="$3" borderWidth={1} borderColor="$borderColor" borderRadius="$5" backgroundColor="#ffffff06">
      <Text fontSize={11} fontWeight="700" letterSpacing={0.6} color="$color11" opacity={0.6}>{label.toUpperCase()}</Text>
      <Text fontSize={26} fontWeight="900" color={color ?? '$color12'}>{value}</Text>
    </YStack>
  )
}

/** Signed-in shell: brand bar + Inventory / Alerts / Manage tabs, a KPI strip,
 *  and a per-item detail leg. Owns the single `items` query the views read. */
export function Home() {
  const { user, logout } = useIam()
  const who = user?.displayName || user?.name || user?.email || 'you'

  const itemsQ = useQuery<Item>('items', { sort: 'name', realtime: false })
  const items = itemsQ.data

  const [tab, setTab] = useState<Tab>('inventory')
  const [openId, setOpenId] = useState<string | null>(null)
  const open = openId ? items.find((i) => i.id === openId) ?? null : null

  const flagged = lowStock(items)
  const lowCount = items.filter((i) => statusOf(i) === 'low').length
  const outCount = items.filter((i) => statusOf(i) === 'out').length

  const go = (t: Tab) => {
    setOpenId(null)
    setTab(t)
  }

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor="$background">
      {/* Brand + tabs bar */}
      <XStack alignItems="center" justifyContent="space-between" gap="$4" paddingHorizontal="$5" paddingVertical="$3" borderBottomWidth={1} borderColor="$borderColor" flexWrap="wrap">
        <XStack alignItems="center" gap="$3">
          <Logo />
          <YStack>
            <Text fontSize={18} fontWeight="800" color="$color12">Stockroom</Text>
            <Text fontSize={11} color="$color11" opacity={0.6}>Inventory &amp; Reordering</Text>
          </YStack>
        </XStack>

        <XStack alignItems="center" gap="$2" flexWrap="wrap">
          <TabButton label="Inventory" active={tab === 'inventory' && !open} onPress={() => go('inventory')} />
          <TabButton label="Alerts" badge={flagged.length} active={tab === 'alerts' && !open} onPress={() => go('alerts')} />
          <TabButton label="Manage" active={tab === 'manage' && !open} onPress={() => go('manage')} />
          <Button size="$3" chromeless onPress={() => logout()}>Sign out</Button>
        </XStack>
      </XStack>

      {/* Body */}
      <YStack padding="$5" gap="$4" maxWidth={1180} width="100%" alignSelf="center">
        {itemsQ.isLoading ? (
          <XStack gap="$2" alignItems="center" opacity={0.6} paddingVertical="$6" justifyContent="center">
            <Spinner /> <Text>Loading stock…</Text>
          </XStack>
        ) : itemsQ.error ? (
          <Paragraph color="$red10">
            Couldn’t reach Base ({itemsQ.error.message}). Confirm VITE_HANZO_BASE_URL and that you’re signed in.
          </Paragraph>
        ) : open ? (
          <Detail key={open.id} item={open} onBack={() => setOpenId(null)} refetch={itemsQ.refetch} />
        ) : (
          <>
            {/* KPI strip */}
            <XStack gap="$3" flexWrap="wrap">
              <Stat label="SKUs" value={items.length} />
              <Stat label="Units on hand" value={totalUnits(items)} />
              <Stat label="Low" value={lowCount} color={lowCount ? AMBER : undefined} />
              <Stat label="Out" value={outCount} color={outCount ? RED : undefined} />
            </XStack>

            <Paragraph fontSize={13} opacity={0.55}>Signed in as {who}</Paragraph>

            {tab === 'inventory' ? (
              <Inventory items={items} onOpen={setOpenId} />
            ) : tab === 'alerts' ? (
              <Alerts items={items} onOpen={setOpenId} />
            ) : (
              <Manage items={items} refetch={itemsQ.refetch} onCreated={() => setTab('inventory')} />
            )}
          </>
        )}
      </YStack>
    </YStack>
  )
}
