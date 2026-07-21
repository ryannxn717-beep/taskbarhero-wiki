<script lang="ts">
  import { untrack } from 'svelte';
  import type { ToolHeroOption } from '$lib/tools/calculator-data';
  import { scoreBestInSlot, type BisGearCandidate, type BisWeights } from '$lib/tools/bis';
  import './calculators.css';

  let { gear, heroes }: { gear: readonly BisGearCandidate[]; heroes: readonly ToolHeroOption[] } = $props();
  let heroId = $state(untrack(() => heroes[0]?.id ?? ''));
  let weights = $state<BisWeights>({ attack: 3, defense: 1, utility: 1 });
  const calculation = $derived.by(() => {
    try {
      return { result: scoreBestInSlot(gear, { heroId, weights }), error: '' };
    } catch (error) {
      return { result: null, error: error instanceof Error ? error.message : String(error) };
    }
  });

  function preset(next: BisWeights) { weights = next; }
</script>

<article class="calculator-page bis-calculator">
  <header class="tool-intro-panel">
    <span>GEAR RANKINGS</span>
    <h1>Best-in-Slot Finder</h1>
    <p>The best retained gear for every slot — ranked with your attack, survival and utility weights, with an explanation for every score.</p>
  </header>

  <section class="bis-controls" aria-label="Best-in-slot controls">
    <label>Hero
      <select aria-label="Best-in-slot hero" bind:value={heroId}>{#each heroes as hero}<option value={hero.id}>{hero.name}</option>{/each}</select>
    </label>
    <div class="bis-presets"><span>Goal</span>
      <button type="button" aria-label="DPS weights" onclick={() => preset({ attack: 3, defense: 1, utility: 1 })}>DPS</button>
      <button type="button" aria-label="Survival weights" onclick={() => preset({ attack: 1, defense: 3, utility: 1 })}>Survival</button>
      <button type="button" aria-label="Utility weights" onclick={() => preset({ attack: 1, defense: 1, utility: 3 })}>Stat</button>
    </div>
    <label>Attack weight<input aria-label="Attack weight" type="number" min="0" max="1000" bind:value={weights.attack} /></label>
    <label>Defense weight<input aria-label="Defense weight" type="number" min="0" max="1000" bind:value={weights.defense} /></label>
    <label>Utility weight<input aria-label="Utility weight" type="number" min="0" max="1000" bind:value={weights.utility} /></label>
  </section>

  <a class="tool-local-callout bis-save-callout" href="/save-inspector">◉ Load your local save to compare owned gear and exact upgrade candidates.</a>
  <p class="bis-method">Rankings score retained item templates. <b>Weighted contribution</b> = normalized preference × local base/inherent stat projection. Random enchant rolls and live account data are not modeled.</p>
  {#if calculation.error}<p class="calculator-error" role="alert">{calculation.error}</p>{/if}

  <div class="bis-results" aria-live="polite">
    {#each calculation.result?.bestBySlot ?? [] as row}
      <article>
        <span class="bis-slot">{row.slot}</span>
        <div><small>BEST PICK</small><a href={row.href}>{row.name}</a><strong>{row.score.toFixed(2)} local score</strong></div>
        <details><summary>Score breakdown</summary>{#each row.contributions as entry}<p>{entry.stat}: {entry.raw.toFixed(1)} × {entry.weight.toFixed(2)} = {entry.score.toFixed(2)}</p>{/each}</details>
      </article>
    {/each}
  </div>
</article>
