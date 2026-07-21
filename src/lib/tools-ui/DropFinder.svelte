<script lang="ts">
  import { untrack } from 'svelte';
  import type { ToolItemOption } from '$lib/tools/calculator-data';
  import { findItemDrops, type DropSource } from '$lib/tools/drops';
  import './calculators.css';

  let { sources, items }: { sources: readonly DropSource[]; items: readonly ToolItemOption[] } = $props();
  function firstAvailableItemId() {
    const retainedIds = new Set(items.map((item) => item.itemId));
    return sources.flatMap((source) => source.entries).find((entry) => retainedIds.has(entry.itemId))?.itemId ?? items[0]?.itemId ?? 0;
  }
  let mode = $state<'item' | 'stage'>('item');
  let itemId = $state(untrack(firstAvailableItemId));
  let query = $state('');
  let difficulty = $state('all');
  let act = $state<'all' | number>('all');
  let stageId = $state(untrack(() => sources[0]?.stageId ?? ''));

  const filteredItems = $derived.by(() => {
    const matches = items.filter((item) => !query.trim() || item.name.toLowerCase().includes(query.trim().toLowerCase()));
    const visible = matches.slice(0, 80);
    const selected = items.find((item) => item.itemId === itemId);
    return selected && !visible.some((item) => item.itemId === selected.itemId)
      ? [selected, ...visible.slice(0, 79)]
      : visible;
  });
  const difficulties = $derived([...new Set(sources.map((source) => source.difficulty))].sort());
  const acts = $derived([...new Set(sources.map((source) => source.act))].sort((a, b) => a - b));
  const stages = $derived([...new Map(sources.map((source) => [source.stageId, { id: source.stageId, name: source.stageName, href: source.stageHref }])).values()]);
  const calculation = $derived.by(() => {
    try {
      return { result: findItemDrops(sources, { itemId, difficulty, act }), error: '' };
    } catch (error) {
      return { result: null, error: error instanceof Error ? error.message : String(error) };
    }
  });
  const stageSources = $derived(sources.filter((source) => source.stageId === stageId));
  const stageItemIds = $derived([...new Set(stageSources.flatMap((source) => source.entries.map((entry) => entry.itemId)))]);
  const itemById = $derived(new Map(items.map((item) => [item.itemId, item])));
  const stageItems = $derived(stageItemIds.map((id) => itemById.get(id)).filter((item) => item !== undefined));
  const selectedStage = $derived(stages.find((stage) => stage.id === stageId));
</script>

<article class="calculator-page drop-calculator">
  <header class="drop-heading"><h1>Drop Finder</h1><p>Where does it drop? Search a retained item to see its boxes and stages, or browse a stage loot table.</p></header>
  <div class="drop-modes"><button class:active={mode === 'item'} type="button" onclick={() => (mode = 'item')}>By item</button><button class:active={mode === 'stage'} type="button" aria-label="Browse by stage" onclick={() => (mode = 'stage')}>By stage</button></div>

  {#if mode === 'item'}
    <div class="drop-filters">
      <input aria-label="Search Drop Finder items" type="search" placeholder="Search gear, materials, boxes..." bind:value={query} />
      <select aria-label="Drop Finder item" bind:value={itemId}>{#each filteredItems as item}<option value={item.itemId}>{item.name}</option>{/each}</select>
      <select aria-label="Drop Finder difficulty" bind:value={difficulty}><option value="all">All difficulties</option>{#each difficulties as value}<option value={value}>{value}</option>{/each}</select>
      <select aria-label="Drop Finder act" bind:value={act}><option value="all">All acts</option>{#each acts as value}<option value={value}>Act {value}</option>{/each}</select>
    </div>
    {#if calculation.error}<p class="calculator-error" role="alert">{calculation.error}</p>{/if}
    <div class="drop-layout" aria-live="polite">
      <div class="drop-source-list">
        {#each calculation.result?.rows ?? [] as row}
          <a href={row.boxHref}><span aria-hidden="true">▣</span><div><strong>{row.boxName}</strong><small>{row.difficulty} · Act {row.act} · {row.stageName}</small></div><b>{row.perClearChancePercent.toFixed(2)}%</b></a>
        {:else}<p>No retained source found for this item and filter.</p>{/each}
      </div>
      <section class="drop-detail">
        {#if calculation.result?.rows[0]}
          <span>BEST LOCAL SOURCE</span><h2>{calculation.result.rows[0].boxName}</h2><p>{calculation.result.rows[0].itemChancePercent.toFixed(2)}% inside the box and {calculation.result.rows[0].boxRatePercent.toFixed(2)}% box rate.</p><a href={calculation.result.rows[0].stageHref}>{calculation.result.rows[0].stageName}</a>
        {:else}<p>Pick an item to see where it drops.</p>{/if}
      </section>
    </div>
  {:else}
    <div class="drop-stage-browser">
      <label>Stage<select aria-label="Drop Finder stage" bind:value={stageId}>{#each stages as stage}<option value={stage.id}>{stage.name}</option>{/each}</select></label>
      {#if selectedStage}<a class="stage-route-link" href={selectedStage.href}>{selectedStage.name}</a>{/if}
      <div class="drop-stage-items">{#each stageItems as item}<a href={item.href}>{item.name}</a>{/each}</div>
    </div>
  {/if}
</article>
