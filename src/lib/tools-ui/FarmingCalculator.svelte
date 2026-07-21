<script lang="ts">
  import { untrack } from 'svelte';
  import type { ToolItemOption } from '$lib/tools/calculator-data';
  import { rankFarmingStages, type FarmingStageCandidate } from '$lib/tools/farming';
  import './calculators.css';

  let { stages, items }: { stages: readonly FarmingStageCandidate[]; items: readonly ToolItemOption[] } = $props();
  function firstAvailableItemId() {
    const retainedIds = new Set(items.map((item) => item.itemId));
    return stages.flatMap((stage) => stage.drops).find((drop) => retainedIds.has(drop.itemId))?.itemId ?? items[0]?.itemId ?? 0;
  }
  let targetItemId = $state(untrack(firstAvailableItemId));
  let secondsPerClear = $state(12);

  const calculation = $derived.by(() => {
    try {
      return { result: rankFarmingStages(stages, { targetItemId, secondsPerClear }), error: '' };
    } catch (error) {
      return { result: null, error: error instanceof Error ? error.message : String(error) };
    }
  });

  function reset() {
    targetItemId = firstAvailableItemId();
    secondsPerClear = 12;
  }
</script>

<article class="calculator-page farming-calculator">
  <header class="tool-intro-panel">
    <span>PORTAL ROUTE OPTIMIZER</span>
    <h1>Farming Planner</h1>
    <p>Rank the best stage for your target item and current clear speed using the retained drop, chest and reward tables.</p>
  </header>

  <div class="calculator-split farming-split">
    <section class="tool-control-card" aria-labelledby="farming-model-title">
      <header><div><span>ROUTE CALIBRATION</span><h2 id="farming-model-title">Clear-time model</h2></div><b aria-hidden="true">◉ 💎</b></header>
      <div class="tool-card-body">
        <a class="tool-local-callout" href="/save-inspector">◉ Import a local save to keep your planning in this browser.</a>
        <label>Target item
          <select aria-label="Target farming item" bind:value={targetItemId}>
            {#each items as item}<option value={item.itemId}>{item.name}</option>{/each}
          </select>
        </label>
        <label>Seconds per clear
          <input aria-label="Seconds per clear" type="number" min="1" max="3600" step="1" bind:value={secondsPerClear} />
        </label>
        <button class="wiki-button tool-reset" type="button" aria-label="Reset farming planner" onclick={reset}>Reset calibration</button>
        {#if calculation.error}<p class="calculator-error" role="alert">{calculation.error}</p>{/if}
        <p class="calculator-note">Local model · chest rate × item share × clears per minute. No private account or source API.</p>
      </div>
    </section>

    <section class="tool-result-card" aria-labelledby="farming-result-title" aria-live="polite">
      <header><div><span>LOCAL RANKING</span><h2 id="farming-result-title">Best farming routes</h2></div><b aria-hidden="true">💎</b></header>
      <div class="tool-result-body">
        {#if calculation.result?.rows.length}
          <p class="tool-result-lead">{calculation.result.rows.length} retained {calculation.result.rows.length === 1 ? 'route' : 'routes'} ranked for this target.</p>
          <ol class="farming-ranking">
            {#each calculation.result.rows.slice(0, 12) as row, index}
              <li>
                <span class="rank-number">#{index + 1}</span>
                <div><a href={row.href}>{row.name}</a><small>{row.difficulty} · Act {row.act} · {row.clearsPerExpected.toFixed(1)} clears expected</small></div>
                <strong>{row.expectedPerMinute.toFixed(2)} drops/min</strong>
                <em>{row.goldPerMinute.toFixed(0)} gold/min</em>
              </li>
            {/each}
          </ol>
        {:else if !calculation.error}
          <div class="tool-empty"><strong>—</strong><p>No retained stage exposes this target. Try another item.</p></div>
        {/if}
      </div>
    </section>
  </div>
</article>
