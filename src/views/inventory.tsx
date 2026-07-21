import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { YStack, XStack, Text, Input, Paragraph } from '@hanzo/gui'
import { type Item, type StockStatus, STATUS, statusOf, statusRank, tint, num, AMBER, RED, PANEL, LINE } from '../lib/stock'

// Shared column geometry — header and rows read the same widths so cells align.
const COL_SKU = 122
const COL_LOC = 140
const COL_QTY = 92
const COL_REORDER = 96
const COL_STATUS = 118
const NAME_MIN = 180

type SortKey = 'name' | 'sku' | 'location' | 'qty' | 'reorder' | 'status'
type Sort = { key: SortKey; dir: 'asc' | 'desc' }

function accentFor(item: Item): string {
  const s = statusOf(item)
  return s === 'out' ? RED : s === 'low' ? AMBER : 'transparent'
}

function rowBg(item: Item, zebra: boolean): string {
  const s = statusOf(item)
  if (s === 'out') return tint(RED, '14')
  if (s === 'low') return tint(AMBER, '16')
  return zebra ? PANEL : 'transparent'
}

function Cell({ w, flex, align = 'left', children }: { w?: number; flex?: number; align?: 'left' | 'right'; children: ReactNode }) {
  return (
    <YStack
      width={w}
      flex={flex}
      minWidth={flex ? NAME_MIN : undefined}
      paddingHorizontal={12}
      justifyContent="center"
      alignItems={align === 'right' ? 'flex-end' : 'flex-start'}
    >
      {children}
    </YStack>
  )
}

function StatusPill({ status }: { status: StockStatus }) {
  const meta = STATUS[status]
  return (
    <XStack alignItems="center" gap={6} paddingHorizontal={9} paddingVertical={4} borderRadius={999} backgroundColor={tint(meta.color, '22')} borderWidth={1} borderColor={tint(meta.color, '3a')}>
      <YStack width={7} height={7} borderRadius={999} backgroundColor={meta.color} />
      <Text fontSize={11} fontWeight="700" color={meta.color} numberOfLines={1}>{meta.short}</Text>
    </XStack>
  )
}

function HeaderCell({ label, sortKey, align, w, flex, sort, onSort }: {
  label: string
  sortKey: SortKey
  align?: 'left' | 'right'
  w?: number
  flex?: number
  sort: Sort
  onSort: (k: SortKey) => void
}) {
  const active = sort.key === sortKey
  return (
    <XStack
      width={w}
      flex={flex}
      minWidth={flex ? NAME_MIN : undefined}
      height="100%"
      paddingHorizontal={12}
      alignItems="center"
      justifyContent={align === 'right' ? 'flex-end' : 'flex-start'}
      cursor="pointer"
      hoverStyle={{ backgroundColor: '#ffffff08' }}
      onPress={() => onSort(sortKey)}
    >
      <Text fontSize={11} fontWeight="700" letterSpacing={0.6} color="$color11" opacity={active ? 1 : 0.55}>
        {label.toUpperCase()}
      </Text>
      <Text fontSize={8} color="$color11" opacity={active ? 0.9 : 0} paddingLeft={4}>
        {sort.dir === 'asc' ? '▲' : '▼'}
      </Text>
    </XStack>
  )
}

function Row({ item, zebra, onOpen }: { item: Item; zebra: boolean; onOpen: () => void }) {
  const st = statusOf(item)
  const qtyColor = st === 'ok' ? '$color12' : STATUS[st].color
  return (
    <XStack
      width="100%"
      height={50}
      alignItems="center"
      cursor="pointer"
      borderBottomWidth={1}
      borderColor={LINE}
      borderLeftWidth={3}
      borderLeftColor={accentFor(item)}
      backgroundColor={rowBg(item, zebra)}
      hoverStyle={{ backgroundColor: st === 'ok' ? '#ffffff12' : rowBg(item, zebra) }}
      pressStyle={{ backgroundColor: '#ffffff16' }}
      onPress={onOpen}
    >
      <Cell w={COL_SKU}>
        <Text fontSize={12} fontWeight="700" letterSpacing={0.4} color="$color11" numberOfLines={1}>{item.sku || '—'}</Text>
      </Cell>
      <Cell flex={1}>
        <Text fontSize={14} fontWeight="600" color="$color12" numberOfLines={1}>{item.name || 'Untitled item'}</Text>
      </Cell>
      <Cell w={COL_LOC}>
        <Text fontSize={13} color="$color11" opacity={0.8} numberOfLines={1}>{item.location || '—'}</Text>
      </Cell>
      <Cell w={COL_QTY} align="right">
        <Text fontSize={16} fontWeight="800" color={qtyColor}>{num(item.qty)}</Text>
      </Cell>
      <Cell w={COL_REORDER} align="right">
        <Text fontSize={13} color="$color11" opacity={0.65}>{num(item.reorder_at)}</Text>
      </Cell>
      <Cell w={COL_STATUS}>
        <StatusPill status={st} />
      </Cell>
    </XStack>
  )
}

/**
 * The inventory table: a dense, sortable, searchable grid of every SKU. Rows flag
 * themselves — amber when on-hand is at/under the reorder point, red at zero —
 * and a click opens the item detail. The only reader of the `items` collection.
 */
export function Inventory({ items, onOpen }: { items: Item[]; onOpen: (id: string) => void }) {
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<Sort>({ key: 'status', dir: 'asc' })

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const list = needle
      ? items.filter(
          (i) =>
            i.name.toLowerCase().includes(needle) ||
            i.sku.toLowerCase().includes(needle) ||
            i.location.toLowerCase().includes(needle),
        )
      : items.slice()
    const dir = sort.dir === 'asc' ? 1 : -1
    list.sort((a, b) => {
      let c = 0
      switch (sort.key) {
        case 'sku': c = a.sku.localeCompare(b.sku); break
        case 'location': c = a.location.localeCompare(b.location); break
        case 'qty': c = num(a.qty) - num(b.qty); break
        case 'reorder': c = num(a.reorder_at) - num(b.reorder_at); break
        case 'status': c = statusRank(a) - statusRank(b); break
        default: c = a.name.localeCompare(b.name)
      }
      if (c === 0) c = a.name.localeCompare(b.name)
      return c * dir
    })
    return list
  }, [items, q, sort])

  const onSort = (key: SortKey) =>
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))

  if (items.length === 0) {
    return (
      <YStack alignItems="center" justifyContent="center" gap="$3" padding="$8" borderWidth={1} borderColor="$borderColor" borderRadius="$6" backgroundColor={PANEL}>
        <Text fontSize={40}>📦</Text>
        <Paragraph fontSize={16} fontWeight="700" color="$color12">No items yet</Paragraph>
        <Paragraph textAlign="center" opacity={0.6} maxWidth={380}>
          Head to Manage to add your first SKU — a name, quantity on hand, a reorder
          point and a location — and it lands here.
        </Paragraph>
      </YStack>
    )
  }

  return (
    <YStack gap="$3" width="100%">
      <XStack alignItems="center" justifyContent="space-between" gap="$3" flexWrap="wrap">
        <Input flex={1} minWidth={220} maxWidth={380} size="$3" value={q} placeholder="Search SKU, item or location…" onChangeText={setQ} />
        <Text fontSize={12} color="$color11" opacity={0.6}>
          {rows.length} of {items.length} {items.length === 1 ? 'item' : 'items'}
        </Text>
      </XStack>

      <YStack width="100%" borderWidth={1} borderColor="$borderColor" borderRadius="$6" overflow="hidden" backgroundColor="$background">
        {/* header */}
        <XStack width="100%" height={40} alignItems="center" backgroundColor={PANEL} borderBottomWidth={1} borderColor="$borderColor" borderLeftWidth={3} borderLeftColor="transparent">
          <HeaderCell label="SKU" sortKey="sku" w={COL_SKU} sort={sort} onSort={onSort} />
          <HeaderCell label="Item" sortKey="name" flex={1} sort={sort} onSort={onSort} />
          <HeaderCell label="Location" sortKey="location" w={COL_LOC} sort={sort} onSort={onSort} />
          <HeaderCell label="On hand" sortKey="qty" w={COL_QTY} align="right" sort={sort} onSort={onSort} />
          <HeaderCell label="Reorder" sortKey="reorder" w={COL_REORDER} align="right" sort={sort} onSort={onSort} />
          <HeaderCell label="Status" sortKey="status" w={COL_STATUS} sort={sort} onSort={onSort} />
        </XStack>
        {rows.map((item, i) => (
          <Row key={item.id} item={item} zebra={i % 2 === 1} onOpen={() => onOpen(item.id)} />
        ))}
      </YStack>
    </YStack>
  )
}
