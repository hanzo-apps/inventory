import { useState } from 'react'
import { useMutation } from '@hanzo/base/react'
import { YStack, XStack, H2, Text, Button, Input, Paragraph, Separator } from '@hanzo/gui'
import { type Item, STATUS, statusOf, deficit, reorderQty, tint, num, PANEL } from '../lib/stock'

function Metric({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <YStack gap={4} minWidth={104}>
      <Text fontSize={11} fontWeight="700" letterSpacing={0.6} color="$color11" opacity={0.6}>{label.toUpperCase()}</Text>
      <Text fontSize={30} fontWeight="900" color={color ?? '$color12'}>{value}</Text>
    </YStack>
  )
}

/**
 * Item detail — the maintenance surface for one SKU. Shows status, on-hand vs
 * reorder point and a suggested order size, and writes back to Base: receive or
 * pick units (adjust qty), change the reorder point, or delete the item.
 */
export function Detail({ item, onBack, refetch }: { item: Item; onBack: () => void; refetch: () => void }) {
  const update = useMutation('items', 'update')
  const remove = useMutation('items', 'delete')
  const [reorderInput, setReorderInput] = useState(String(num(item.reorder_at)))
  const [busy, setBusy] = useState(false)

  const st = statusOf(item)
  const meta = STATUS[st]
  const onHand = num(item.qty)

  async function setQty(next: number) {
    const qty = Math.max(next, 0)
    if (busy || qty === onHand) return
    setBusy(true)
    try {
      await update.mutate({ id: item.id, qty })
      refetch()
    } finally {
      setBusy(false)
    }
  }

  async function saveReorder() {
    const next = Math.max(Math.round(Number(reorderInput)) || 0, 0)
    if (busy || next === num(item.reorder_at)) return
    setBusy(true)
    try {
      await update.mutate({ id: item.id, reorder_at: next })
      refetch()
    } finally {
      setBusy(false)
    }
  }

  async function del() {
    if (busy) return
    setBusy(true)
    try {
      await remove.mutate({ id: item.id })
      refetch()
      onBack()
    } finally {
      setBusy(false)
    }
  }

  return (
    <YStack gap="$4" maxWidth={760} width="100%" alignSelf="center">
      <XStack>
        <Button size="$2" chromeless onPress={onBack}>← Inventory</Button>
      </XStack>

      {/* Header card */}
      <YStack gap="$4" padding="$5" borderWidth={1} borderColor="$borderColor" borderRadius="$6" backgroundColor={tint(meta.color, '10')} borderLeftWidth={4} borderLeftColor={meta.color}>
        <YStack gap="$2">
          <Text fontSize={12} fontWeight="700" letterSpacing={0.5} color="$color11" opacity={0.7}>{item.sku || 'NO SKU'}</Text>
          <H2 fontSize="$8" color="$color12">{item.name || 'Untitled item'}</H2>
          <XStack alignItems="center" gap={8} flexWrap="wrap">
            <YStack width={9} height={9} borderRadius={999} backgroundColor={meta.color} />
            <Text fontSize={13} fontWeight="700" color={meta.color}>{meta.label}</Text>
            {item.location ? <Text fontSize={13} color="$color11" opacity={0.7}>· {item.location}</Text> : null}
          </XStack>
        </YStack>

        <Separator />

        <XStack gap="$6" flexWrap="wrap">
          <Metric label="On hand" value={onHand} color={st === 'ok' ? '$color12' : meta.color} />
          <Metric label="Reorder at" value={num(item.reorder_at)} />
          {st !== 'ok' ? <Metric label="Short by" value={deficit(item)} color={meta.color} /> : null}
          {st !== 'ok' ? <Metric label="Suggest order" value={`+${reorderQty(item)}`} color={meta.color} /> : null}
        </XStack>
      </YStack>

      {/* Adjust stock */}
      <YStack gap="$3" padding="$4" borderWidth={1} borderColor="$borderColor" borderRadius="$6" backgroundColor={PANEL}>
        <Text fontSize={16} fontWeight="800" color="$color12">Adjust stock</Text>
        <Paragraph fontSize={13} opacity={0.6}>Receive or pick units — writes the new on-hand count to Base.</Paragraph>
        <XStack gap="$2" alignItems="center" flexWrap="wrap">
          <Button size="$3" disabled={busy || onHand <= 0} onPress={() => setQty(onHand - 10)}>−10</Button>
          <Button size="$3" disabled={busy || onHand <= 0} onPress={() => setQty(onHand - 1)}>−1</Button>
          <YStack minWidth={72} alignItems="center" paddingHorizontal="$3">
            <Text fontSize={22} fontWeight="900" color="$color12">{onHand}</Text>
          </YStack>
          <Button size="$3" theme="active" disabled={busy} onPress={() => setQty(onHand + 1)}>+1</Button>
          <Button size="$3" theme="active" disabled={busy} onPress={() => setQty(onHand + 10)}>+10</Button>
        </XStack>
        {update.error ? <Paragraph color="$red10">{update.error.message}</Paragraph> : null}
      </YStack>

      {/* Reorder point */}
      <YStack gap="$3" padding="$4" borderWidth={1} borderColor="$borderColor" borderRadius="$6" backgroundColor={PANEL}>
        <Text fontSize={16} fontWeight="800" color="$color12">Reorder point</Text>
        <Paragraph fontSize={13} opacity={0.6}>Flag this item Low when on-hand falls to or below this level.</Paragraph>
        <XStack gap="$2" alignItems="center">
          <Input width={120} value={reorderInput} placeholder="0" onChangeText={setReorderInput} onSubmitEditing={saveReorder} />
          <Button theme="active" disabled={busy} onPress={saveReorder}>Save</Button>
        </XStack>
      </YStack>

      {/* Danger */}
      <XStack justifyContent="flex-end">
        <Button size="$2" chromeless disabled={busy} onPress={del}>
          <Text color="$red10">Delete item</Text>
        </Button>
      </XStack>
    </YStack>
  )
}
