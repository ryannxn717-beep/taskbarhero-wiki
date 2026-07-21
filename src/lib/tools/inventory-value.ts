import type { LocalInventoryRow } from '$lib/local/save';
import type { MarketFamily, MarketQuote } from './market';

export type InventoryValueSort = 'value-desc' | 'quantity-desc' | 'name-asc';

export interface InventoryValueRow {
  itemId: number;
  quantity: number;
  name: string;
  href: string | null;
  image: string | null;
  family: MarketFamily | null;
  gradeId: MarketQuote['gradeId'] | null;
  unitPriceCents: number | null;
  subtotalCents: number | null;
  priceStatus: 'priced' | 'unavailable';
}

export interface InventoryValueResult {
  rows: readonly InventoryValueRow[];
  familyTotals: readonly { family: MarketFamily; subtotalCents: number }[];
  grandTotalCents: number;
  unpricedRows: number;
}

function compareRows(sort: InventoryValueSort, left: InventoryValueRow, right: InventoryValueRow) {
  let result = 0;
  if (sort === 'value-desc') result = (right.subtotalCents ?? -1) - (left.subtotalCents ?? -1);
  if (sort === 'quantity-desc') result = right.quantity - left.quantity;
  if (sort === 'name-asc') result = left.name.localeCompare(right.name);
  return result || left.itemId - right.itemId;
}

export function aggregateInventoryValue(
  inventory: readonly LocalInventoryRow[],
  quotes: readonly MarketQuote[],
  sort: InventoryValueSort
): InventoryValueResult {
  const quoteById = new Map<number, MarketQuote>();
  for (const quote of quotes) {
    if (quoteById.has(quote.itemId)) throw new Error(`duplicate quote for item ${quote.itemId}`);
    quoteById.set(quote.itemId, quote);
  }
  const rows = inventory.map((item) => {
    if (!Number.isSafeInteger(item.itemId) || item.itemId <= 0) {
      throw new Error(`itemId must be a positive safe integer; received ${item.itemId}`);
    }
    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1) {
      throw new Error(`quantity for item ${item.itemId} must be a positive safe integer; received ${item.quantity}`);
    }
    const quote = quoteById.get(item.itemId);
    if (!quote) return Object.freeze({
      itemId: item.itemId,
      quantity: item.quantity,
      name: `Item ${item.itemId}`,
      href: null,
      image: null,
      family: null,
      gradeId: null,
      unitPriceCents: null,
      subtotalCents: null,
      priceStatus: 'unavailable' as const
    });
    const subtotalCents = quote.priceCents * item.quantity;
    if (!Number.isSafeInteger(subtotalCents)) throw new Error(`subtotal for item ${item.itemId} is outside the safe range`);
    return Object.freeze({
      itemId: item.itemId,
      quantity: item.quantity,
      name: quote.name,
      href: quote.href,
      image: quote.image,
      family: quote.family,
      gradeId: quote.gradeId,
      unitPriceCents: quote.priceCents,
      subtotalCents,
      priceStatus: 'priced' as const
    });
  }).sort((left, right) => compareRows(sort, left, right));

  const totals = new Map<MarketFamily, number>([['gear', 0], ['material', 0]]);
  let grandTotalCents = 0;
  let unpricedRows = 0;
  for (const row of rows) {
    if (row.subtotalCents === null || row.family === null) {
      unpricedRows += 1;
      continue;
    }
    totals.set(row.family, (totals.get(row.family) ?? 0) + row.subtotalCents);
    grandTotalCents += row.subtotalCents;
  }
  const familyTotals = (['gear', 'material'] as const)
    .filter((family) => (totals.get(family) ?? 0) > 0)
    .map((family) => Object.freeze({ family, subtotalCents: totals.get(family) ?? 0 }));

  return Object.freeze({
    rows: Object.freeze(rows),
    familyTotals: Object.freeze(familyTotals),
    grandTotalCents,
    unpricedRows
  });
}
