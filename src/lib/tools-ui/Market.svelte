<script lang="ts">
  import { SOURCE_GRADE_ORDER, type GradeId } from '$lib/content/schema';
  import {
    DEFAULT_MARKET_FILTER,
    filterMarketQuotes,
    type MarketFamily,
    type MarketQuote,
    type MarketSort
  } from '$lib/tools/market';
  import './market.css';

  let { quotes }: { quotes: readonly MarketQuote[] } = $props();
  let query = $state('');
  let family = $state<'all' | MarketFamily>('all');
  let gradeId = $state<'all' | GradeId>('all');
  let sort = $state<MarketSort>('volume-desc');
  let page = $state(1);

  const result = $derived(filterMarketQuotes(quotes, {
    query, family, gradeId, sort, page, pageSize: DEFAULT_MARKET_FILTER.pageSize
  }));
  const firstVisible = $derived(result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1);
  const lastVisible = $derived(Math.min(result.page * result.pageSize, result.total));

  const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const compact = (value: number) => value >= 1000
    ? `${(value / 1000).toFixed(value >= 10_000 ? 0 : 1)}k`
    : String(value);
  const titleCase = (value: string) => value.slice(0, 1) + value.slice(1).toLowerCase();

  function sparkPoints(history: readonly number[]): string {
    const minimum = Math.min(...history);
    const maximum = Math.max(...history);
    const span = Math.max(1, maximum - minimum);
    return history.map((value, index) => {
      const x = (index / (history.length - 1)) * 180;
      const y = 46 - ((value - minimum) / span) * 36;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }

  function resetFilters() {
    query = '';
    family = 'all';
    gradeId = 'all';
    sort = 'volume-desc';
    page = 1;
  }
</script>

<article class="market-page">
  <header class="market-heading">
    <div class="market-title-row">
      <h1>Market</h1><span class="market-beta" aria-hidden="true">BETA</span>
    </div>
    <p>Deterministic prices for retained Gear and Materials. <strong>Local snapshot — not live Steam data.</strong></p>
  </header>

  <section class="market-controls" aria-label="Market filters">
    <select aria-label="Market item family" bind:value={family} onchange={() => (page = 1)}>
      <option value="all">All</option>
      <option value="gear">Gear</option>
      <option value="material">Materials</option>
    </select>
    <select aria-label="Market grade" bind:value={gradeId} onchange={() => (page = 1)}>
      <option value="all">All grades</option>
      {#each SOURCE_GRADE_ORDER as grade}<option value={grade}>{titleCase(grade)}</option>{/each}
    </select>
    <select aria-label="Sort local market" bind:value={sort} onchange={() => (page = 1)}>
      <option value="volume-desc">Sort: 24h volume</option>
      <option value="price-asc">Price: low first</option>
      <option value="price-desc">Price: high first</option>
      <option value="change-desc">Change: high first</option>
      <option value="name-asc">Name: A–Z</option>
    </select>
    <input
      type="search"
      aria-label="Search local market"
      placeholder="Search..."
      bind:value={query}
      oninput={() => (page = 1)}
    />
    <button type="button" class="market-reset" aria-label="Reset market filters" onclick={resetFilters}>Reset</button>
  </section>

  <p class="market-count">
    Showing {firstVisible}–{lastVisible} of {result.total} {result.total === 1 ? 'item' : 'items'}
  </p>

  {#if result.rows.length > 0}
    <div class="market-grid">
      {#each result.rows as quote, index (quote.itemId)}
        <a class="market-card grade-{quote.gradeId.toLowerCase()}" href={quote.href} aria-label={quote.name}>
          <span class="market-rank">#{(result.page - 1) * result.pageSize + index + 1} Vol</span>
          <div class="market-image-frame">
            {#if quote.image}<img src={quote.image} alt="" />{:else}<span aria-hidden="true">?</span>{/if}
          </div>
          <svg class="market-spark" viewBox="0 0 180 52" role="img" aria-label={`${quote.name} local price history`}>
            <polyline points={sparkPoints(quote.history)} />
          </svg>
          <strong>{quote.name}</strong>
          <span class="market-grade">{titleCase(quote.gradeId)}</span>
          <div class="market-price-row">
            <b>{money(quote.priceCents)}</b>
            <span class:negative={quote.changePercent < 0} class:positive={quote.changePercent > 0}>
              {quote.changePercent > 0 ? '▲' : quote.changePercent < 0 ? '▼' : '—'} {Math.abs(quote.changePercent).toFixed(1)}%
            </span>
          </div>
          <div class="market-meta">
            <span><small>VOL</small>{compact(quote.volume24h)}</span>
            <span><small>SPREAD</small>{quote.spreadPercent.toFixed(1)}%</span>
          </div>
        </a>
      {/each}
    </div>
    <nav class="market-pagination" aria-label="Market pages">
      <button type="button" class="wiki-button" aria-label="Previous market page" disabled={result.page <= 1} onclick={() => (page -= 1)}>Previous</button>
      <span>Page {result.page} of {result.totalPages}</span>
      <button type="button" class="wiki-button" aria-label="Next market page" disabled={result.page >= result.totalPages} onclick={() => (page += 1)}>Next</button>
    </nav>
  {:else}
    <section class="market-empty">
      <h2>No local market items match</h2>
      <p>Change the filters or restore the complete retained-catalog snapshot.</p>
      <button type="button" class="wiki-button" onclick={resetFilters}>Reset market filters</button>
    </section>
  {/if}
</article>
