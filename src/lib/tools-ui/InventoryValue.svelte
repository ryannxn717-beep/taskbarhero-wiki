<script lang="ts">
  import { onMount } from 'svelte';
  import { MAX_SAVE_BYTES, SaveValidationError, parseSaveText, type LocalSave } from '$lib/local/save';
  import { clearStoredSave, readStoredSave, writeStoredSave } from '$lib/local/storage';
  import { aggregateInventoryValue, type InventoryValueSort } from '$lib/tools/inventory-value';
  import type { MarketQuote } from '$lib/tools/market';
  import './market.css';

  let { quotes }: { quotes: readonly MarketQuote[] } = $props();
  let save = $state<LocalSave | null>(null);
  let sort = $state<InventoryValueSort>('value-desc');
  let errorMessage = $state('');
  let statusMessage = $state('');
  let fileInput = $state<HTMLInputElement>();

  const valuation = $derived(save ? aggregateInventoryValue(save.inventory, quotes, sort) : null);
  const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const titleCase = (value: string) => value.slice(0, 1).toUpperCase() + value.slice(1);

  onMount(() => {
    const stored = readStoredSave(window.localStorage);
    if (stored.status === 'valid') save = stored.save;
    if (stored.status === 'invalid') errorMessage = `Stored data could not be read: ${stored.message}`;
  });

  async function readFile(file: File) {
    errorMessage = '';
    statusMessage = '';
    if (file.size > MAX_SAVE_BYTES) {
      errorMessage = `Save is ${file.size} bytes and exceeds the ${MAX_SAVE_BYTES}-byte limit.`;
      return;
    }
    try {
      const parsed = parseSaveText(await file.text());
      writeStoredSave(window.localStorage, parsed);
      save = parsed;
      statusMessage = 'Inventory valued from a save stored only in this browser.';
    } catch (error) {
      errorMessage = error instanceof SaveValidationError || error instanceof Error
        ? error.message
        : String(error);
    }
  }

  async function onFileChange(event: Event) {
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (file) await readFile(file);
  }

  async function onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) await readFile(file);
  }

  function clearInventory() {
    clearStoredSave(window.localStorage);
    save = null;
    errorMessage = '';
    statusMessage = 'Local inventory save cleared.';
  }
</script>

<article class="inventory-page">
  <header class="inventory-heading">
    <h1>Inventory Value</h1>
    <p>Value retained items with <strong>Local snapshot prices — never uploaded.</strong></p>
  </header>

  {#if errorMessage}<p class="tool-feedback error" role="alert">{errorMessage}</p>{/if}
  {#if statusMessage}<p class="tool-feedback success" role="status">{statusMessage}</p>{/if}

  {#if !valuation}
    <section class="inventory-import" aria-labelledby="inventory-import-heading">
      <button
        class="inventory-drop"
        type="button"
        onclick={() => fileInput?.click()}
        ondragover={(event) => event.preventDefault()}
        ondrop={onDrop}
      >
        <span class="inventory-hero">HERO</span>
        <span class="inventory-gears" aria-hidden="true">⚙⚙</span>
        <strong id="inventory-import-heading">Drop a local save JSON here</strong>
        <span>The file stays in your browser and is never uploaded.</span>
        <span class="inventory-file-button">Choose file</span>
        <small>Maximum {MAX_SAVE_BYTES.toLocaleString('en-US')} bytes · JSON only</small>
      </button>
      <input bind:this={fileInput} class="sr-only" type="file" accept=".json,application/json" aria-label="Choose inventory save file" onchange={onFileChange} />
      <a class="inventory-inspector-link" href="/save-inspector">Open Save Inspector</a>
    </section>
  {:else}
    <section class="inventory-results" aria-labelledby="inventory-total-heading">
      <div class="inventory-summary">
        <div>
          <span id="inventory-total-heading">Inventory total</span>
          <strong>{money(valuation.grandTotalCents)}</strong>
          <small>{valuation.rows.length} owned rows · {valuation.unpricedRows} without a local quote</small>
        </div>
        {#each valuation.familyTotals as total}
          <div><span>{titleCase(total.family)}</span><strong>{money(total.subtotalCents)}</strong><small>Local subtotal</small></div>
        {/each}
      </div>

      <div class="inventory-toolbar">
        <label for="inventory-sort">Sort</label>
        <select id="inventory-sort" aria-label="Sort inventory value" bind:value={sort}>
          <option value="value-desc">Value: high first</option>
          <option value="quantity-desc">Quantity: high first</option>
          <option value="name-asc">Name: A–Z</option>
        </select>
        <button type="button" class="wiki-button" aria-label="Clear local inventory save" onclick={clearInventory}>Clear local save</button>
      </div>

      <div class="inventory-table-wrap">
        <table>
          <thead><tr><th>Item</th><th>Family</th><th>Qty</th><th>Unit</th><th>Subtotal</th></tr></thead>
          <tbody>
            {#each valuation.rows as row (row.itemId)}
              <tr>
                <td>
                  {#if row.href}<a href={row.href}>{row.name}</a>{:else}<span>{row.name}</span>{/if}
                  <small>#{row.itemId}</small>
                </td>
                <td>{row.family ? titleCase(row.family) : '—'}</td>
                <td>{row.quantity.toLocaleString('en-US')}</td>
                <td>{row.unitPriceCents === null ? 'Unavailable' : money(row.unitPriceCents)}</td>
                <td>{row.subtotalCents === null ? '—' : money(row.subtotalCents)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      {#if valuation.unpricedRows > 0}
        <p class="inventory-unavailable">Unavailable rows are retained in the table but excluded from the total.</p>
      {/if}
    </section>
  {/if}
</article>
