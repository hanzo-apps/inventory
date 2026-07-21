import type { BaseRecord } from '@hanzo/base/react'

/**
 * The single org-scoped Base collection behind Stockroom (see schema.sql). Base
 * adds id/created/updated/owner/org; these are the domain columns the app
 * reads/writes. Numeric fields can arrive as strings over the wire, so always
 * read them through `num()`.
 */
export interface Item extends BaseRecord {
  sku: string
  name: string
  qty: number
  reorder_at: number
  location: string
}

/** Warehouse palette — a calm slate base with three status signals. */
export const AMBER = '#f59e0b' // low stock
export const RED = '#ef4444' // out of stock
export const GREEN = '#22c55e' // in stock
export const PANEL = '#ffffff08'
export const LINE = '#ffffff14'

export type StockStatus = 'out' | 'low' | 'ok'

/** Status metadata: the label and signal hue for each stock state. */
export const STATUS: Record<StockStatus, { label: string; short: string; color: string }> = {
  out: { label: 'Out of stock', short: 'OUT', color: RED },
  low: { label: 'Low stock', short: 'LOW', color: AMBER },
  ok: { label: 'In stock', short: 'OK', color: GREEN },
}

/** Coerce a possibly-string/undefined Base numeric field to a finite number. */
export function num(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

/** Status from on-hand vs reorder point: Out at zero, Low at/under the point. */
export function statusOf(item: { qty: number; reorder_at: number }): StockStatus {
  const qty = num(item.qty)
  if (qty <= 0) return 'out'
  if (qty <= num(item.reorder_at)) return 'low'
  return 'ok'
}

/** Rank for sorting/attention: Out (0) before Low (1) before In stock (2). */
export function statusRank(item: { qty: number; reorder_at: number }): number {
  const s = statusOf(item)
  return s === 'out' ? 0 : s === 'low' ? 1 : 2
}

/** How far on-hand sits below the reorder point (0 when at or above it). */
export function deficit(item: { qty: number; reorder_at: number }): number {
  return Math.max(num(item.reorder_at) - num(item.qty), 0)
}

/** Urgency for the Alerts view: Out floats to the top, then the deepest deficit
 *  first, so the most exposed SKUs lead the list. */
export function severity(item: Item): number {
  if (statusOf(item) === 'out') return Number.MAX_SAFE_INTEGER
  return deficit(item)
}

/** Suggested reorder quantity — bring stock up to twice the reorder point (a
 *  simple, transparent par level), at least one unit. */
export function reorderQty(item: { qty: number; reorder_at: number }): number {
  const par = Math.max(num(item.reorder_at) * 2, num(item.reorder_at) + 1)
  return Math.max(par - num(item.qty), 1)
}

/** Items needing attention (Low or Out), most urgent first. */
export function lowStock(items: Item[]): Item[] {
  return items.filter((i) => statusOf(i) !== 'ok').sort((a, b) => severity(b) - severity(a))
}

/** Total units on hand across a set of items. */
export function totalUnits(items: Item[]): number {
  return items.reduce((sum, i) => sum + num(i.qty), 0)
}

/** A translucent tint (hex8) of a 6-digit hex for row/badge fills. */
export function tint(hex: string, alpha = '26'): string {
  return /^#[0-9a-fA-F]{6}$/.test(hex) ? `${hex}${alpha}` : hex
}
