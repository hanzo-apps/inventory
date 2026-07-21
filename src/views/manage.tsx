import { useState } from 'react'
import type { ReactNode } from 'react'
import { useMutation } from '@hanzo/base/react'
import { YStack, XStack, Input, Button, Text, Paragraph, Separator } from '@hanzo/gui'
import { type Item, statusOf, PANEL } from '../lib/stock'

/** Coerce a text field to a non-negative whole number of units. */
function count(v: string): number {
  return Math.max(Math.round(Number(v)) || 0, 0)
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <YStack gap="$1.5" flex={1} minWidth={150}>
      <Text fontSize={12} fontWeight="700" color="$color11" opacity={0.7}>{label}</Text>
      {children}
      {hint ? <Text fontSize={11} color="$color11" opacity={0.45}>{hint}</Text> : null}
    </YStack>
  )
}

/**
 * Manage — the item writer. Creates a SKU with its starting count, reorder point
 * and location as an org-scoped row in Base, then jumps back to the inventory
 * table. (Per-item edits and stock adjustments live on the item detail.)
 */
export function Manage({ items, refetch, onCreated }: { items: Item[]; refetch: () => void; onCreated: () => void }) {
  const add = useMutation('items', 'create')
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [qty, setQty] = useState('0')
  const [reorder, setReorder] = useState('0')
  const [location, setLocation] = useState('')

  const nameOk = name.trim().length > 0
  const flagged = items.filter((i) => statusOf(i) !== 'ok').length

  async function submit() {
    if (!nameOk || add.isLoading) return
    await add.mutate({
      sku: sku.trim(),
      name: name.trim(),
      qty: count(qty),
      reorder_at: count(reorder),
      location: location.trim(),
    })
    setSku('')
    setName('')
    setQty('0')
    setReorder('0')
    setLocation('')
    refetch()
    onCreated()
  }

  return (
    <YStack gap="$4" maxWidth={760} width="100%" alignSelf="center">
      <YStack gap="$3" padding="$4" borderWidth={1} borderColor="$borderColor" borderRadius="$6" backgroundColor={PANEL}>
        <YStack gap="$1">
          <Text fontSize={16} fontWeight="800" color="$color12">Add item</Text>
          <Paragraph fontSize={13} opacity={0.6}>
            Create a SKU with its starting count, reorder point and location. It writes an
            org-scoped row to Base and appears in the inventory table.
          </Paragraph>
        </YStack>
        <Separator />

        <XStack gap="$2" flexWrap="wrap">
          <Field label="SKU" hint="e.g. WGT-014">
            <Input value={sku} placeholder="WGT-014" onChangeText={setSku} />
          </Field>
          <Field label="Location" hint="bin / shelf / zone">
            <Input value={location} placeholder="A1·03" onChangeText={setLocation} />
          </Field>
        </XStack>

        <Field label="Item name">
          <Input value={name} placeholder="M6 Hex Bolt (100pk)" onChangeText={setName} onSubmitEditing={submit} />
        </Field>

        <XStack gap="$2" flexWrap="wrap">
          <Field label="On hand" hint="units in stock now">
            <Input value={qty} placeholder="0" onChangeText={setQty} />
          </Field>
          <Field label="Reorder at" hint="flag Low at or under this">
            <Input value={reorder} placeholder="0" onChangeText={setReorder} />
          </Field>
        </XStack>

        <XStack alignItems="center" gap="$3" flexWrap="wrap">
          <Button theme="active" disabled={!nameOk || add.isLoading} onPress={submit}>Add item</Button>
          <Text fontSize={12} opacity={0.5}>
            {items.length} item{items.length === 1 ? '' : 's'}{flagged ? ` · ${flagged} need attention` : ''}
          </Text>
        </XStack>
        {add.error ? <Paragraph color="$red10">{add.error.message}</Paragraph> : null}
      </YStack>
    </YStack>
  )
}
