import { YStack, XStack, Text, Paragraph } from '@hanzo/gui'
import { type Item, STATUS, statusOf, reorderQty, tint, num, GREEN, lowStock } from '../lib/stock'

function Figure({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <YStack alignItems="flex-end" minWidth={72} gap={1}>
      <Text fontSize={18} fontWeight="900" color={color ?? '$color12'}>{value}</Text>
      <Text fontSize={10} color="$color11" opacity={0.6}>{label}</Text>
    </YStack>
  )
}

function AlertCard({ item, onOpen }: { item: Item; onOpen: () => void }) {
  const st = statusOf(item)
  const meta = STATUS[st]
  return (
    <XStack
      width="100%"
      alignItems="center"
      gap="$3"
      flexWrap="wrap"
      cursor="pointer"
      paddingVertical="$3"
      paddingHorizontal="$4"
      borderWidth={1}
      borderColor={tint(meta.color, '3a')}
      borderRadius="$6"
      borderLeftWidth={4}
      borderLeftColor={meta.color}
      backgroundColor={tint(meta.color, '12')}
      hoverStyle={{ backgroundColor: tint(meta.color, '1c') }}
      pressStyle={{ backgroundColor: tint(meta.color, '22') }}
      onPress={onOpen}
    >
      <YStack flex={1} minWidth={200} gap={3}>
        <XStack alignItems="center" gap={8}>
          <Text fontSize={11} fontWeight="700" letterSpacing={0.4} color="$color11" opacity={0.7}>{item.sku || 'NO SKU'}</Text>
          <XStack alignItems="center" gap={5} paddingHorizontal={8} paddingVertical={2} borderRadius={999} backgroundColor={tint(meta.color, '26')}>
            <YStack width={6} height={6} borderRadius={999} backgroundColor={meta.color} />
            <Text fontSize={10} fontWeight="700" color={meta.color}>{meta.short}</Text>
          </XStack>
        </XStack>
        <Text fontSize={15} fontWeight="700" color="$color12" numberOfLines={1}>{item.name || 'Untitled item'}</Text>
        {item.location ? <Text fontSize={12} color="$color11" opacity={0.6}>{item.location}</Text> : null}
      </YStack>
      <XStack gap="$5" alignItems="center" flexWrap="wrap">
        <Figure label="on hand" value={num(item.qty)} color={meta.color} />
        <Figure label="reorder at" value={num(item.reorder_at)} />
        <Figure label="suggest order" value={`+${reorderQty(item)}`} color={meta.color} />
      </XStack>
    </XStack>
  )
}

/**
 * Low-stock alerts — every item at or below its reorder point (Out first, then
 * the deepest shortfall), each with a suggested order size. Click one to open its
 * detail and receive stock. Empty when everything is above its reorder point.
 */
export function Alerts({ items, onOpen }: { items: Item[]; onOpen: (id: string) => void }) {
  const flagged = lowStock(items)
  const out = flagged.filter((i) => statusOf(i) === 'out').length

  if (flagged.length === 0) {
    return (
      <YStack alignItems="center" justifyContent="center" gap="$3" padding="$8" borderWidth={1} borderColor={tint(GREEN, '3a')} borderRadius="$6" backgroundColor={tint(GREEN, '12')}>
        <YStack width={54} height={54} borderRadius={999} alignItems="center" justifyContent="center" backgroundColor={tint(GREEN, '22')}>
          <Text fontSize={26} color={GREEN}>✓</Text>
        </YStack>
        <Paragraph fontSize={16} fontWeight="800" color="$color12">All stocked up</Paragraph>
        <Paragraph textAlign="center" opacity={0.6} maxWidth={380}>
          {items.length === 0
            ? 'Add items in Manage to start tracking stock levels.'
            : 'Every item is above its reorder point — nothing to reorder right now.'}
        </Paragraph>
      </YStack>
    )
  }

  return (
    <YStack gap="$3" maxWidth={880} width="100%" alignSelf="center">
      <Text fontSize={13} color="$color11" opacity={0.7}>
        {flagged.length} item{flagged.length === 1 ? '' : 's'} need attention{out ? ` · ${out} out of stock` : ''}
      </Text>
      {flagged.map((it) => (
        <AlertCard key={it.id} item={it} onOpen={() => onOpen(it.id)} />
      ))}
    </YStack>
  )
}
