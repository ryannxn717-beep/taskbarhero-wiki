<script lang="ts">
  import { untrack } from 'svelte';
  import type { ToolDamageStage } from '$lib/tools/calculator-data';
  import { calculateDamage, type DamageInput } from '$lib/tools/damage';
  import './calculators.css';

  let { stages }: { stages: readonly ToolDamageStage[] } = $props();
  let mode = $state<'stage' | 'custom'>('stage');
  let selectedStage = $state('');
  let advanced = $state(false);
  let values = $state<DamageInput>(untrack(() => ({ attack: 0, multiplierPercent: 100, criticalChancePercent: 0, criticalDamagePercent: 150, defense: 0, resistancePercent: 0, mitigationPercent: 0, hitCount: 1 })));

  const calculation = $derived.by(() => {
    if (mode === 'stage' && !selectedStage) return { result: null, error: '' };
    try {
      return { result: calculateDamage(values), error: '' };
    } catch (error) {
      return { result: null, error: error instanceof Error ? error.message : String(error) };
    }
  });

  function chooseStage() {
    const stage = stages.find((row) => row.id === selectedStage);
    if (stage) values.attack = stage.enemyHit;
  }
  function reset() {
    mode = 'stage'; selectedStage = ''; advanced = false;
    values = { attack: 0, multiplierPercent: 100, criticalChancePercent: 0, criticalDamagePercent: 150, defense: 0, resistancePercent: 0, mitigationPercent: 0, hitCount: 1 };
  }
</script>

<article class="calculator-page damage-calculator">
  <header class="tool-intro-panel">
    <span>SURVIVABILITY</span>
    <h1>Damage Taken Calculator</h1>
    <p>See how hard enemies hit through your armor. Pick a retained stage or enter a custom incoming hit, then apply resistance and advanced mitigation.</p>
  </header>
  <div class="calculator-split damage-split">
    <section class="tool-control-card">
      <header><h2>Damage Taken Calculator</h2><b aria-hidden="true">✠</b></header>
      <div class="tool-card-body">
        <a class="tool-local-callout" href="/save-inspector">◉ Load your local save to auto-fill your armor and defenses.</a>
        <label>Your armor<input aria-label="Your armor" type="number" min="0" bind:value={values.defense} /></label>
        <div class="damage-mode"><span>Damage source</span><button class:active={mode === 'stage'} type="button" onclick={() => (mode = 'stage')}>By stage</button><button class:active={mode === 'custom'} type="button" onclick={() => (mode = 'custom')}>Custom</button></div>
        {#if mode === 'stage'}
          <label>Pick a stage<select aria-label="Damage source stage" bind:value={selectedStage} onchange={chooseStage}><option value="" disabled>Pick a stage</option>{#each stages as stage}<option value={stage.id}>{stage.name} · {stage.enemyHit}</option>{/each}</select></label>
        {:else}
          <label>Incoming damage<input aria-label="Incoming damage" type="number" min="0" bind:value={values.attack} /></label>
          <div class="damage-inline"><label>Hit multiplier %<input aria-label="Hit multiplier percent" type="number" min="0" bind:value={values.multiplierPercent} /></label><label>Hits<input aria-label="Hit count" type="number" min="1" bind:value={values.hitCount} /></label></div>
        {/if}
        <button class="advanced-toggle" type="button" aria-label="Advanced defenses" aria-expanded={advanced} onclick={() => (advanced = !advanced)}>Advanced defenses <span>⌄</span></button>
        {#if advanced}
          <div class="advanced-grid"><label>Resistance %<input aria-label="Resistance percent" type="number" min="0" max="100" bind:value={values.resistancePercent} /></label><label>Mitigation %<input aria-label="Mitigation percent" type="number" min="0" max="100" bind:value={values.mitigationPercent} /></label><label>Critical chance %<input aria-label="Critical chance percent" type="number" min="0" max="100" bind:value={values.criticalChancePercent} /></label><label>Critical damage %<input aria-label="Critical damage percent" type="number" min="100" bind:value={values.criticalDamagePercent} /></label></div>
        {/if}
        <button class="wiki-button tool-reset" type="button" aria-label="Reset damage calculator" onclick={reset}>Reset</button>
        {#if calculation.error}<p class="calculator-error" role="alert">{calculation.error}</p>{/if}
      </div>
    </section>
    <section class="tool-result-card damage-result" aria-live="polite">
      <header><h2>Damage you take</h2><b aria-hidden="true">☠</b></header>
      <div class="tool-result-body">
        {#if calculation.result}
          <strong class="damage-total">{calculation.result.expectedTotal.toFixed(2)}</strong><span>Expected total</span>
          <div class="damage-metrics"><p><span>Per hit</span><b>{calculation.result.expectedPerHit.toFixed(2)}</b></p><p><span>Non-critical</span><b>{calculation.result.nonCriticalPerHit.toFixed(2)}</b></p><p><span>Critical</span><b>{calculation.result.criticalPerHit.toFixed(2)}</b></p><p><span>Defense factor</span><b>{(calculation.result.defenseFactor * 100).toFixed(1)}%</b></p></div>
        {:else if calculation.error}<p>Correct the highlighted input to calculate damage.</p>
        {:else}<p>Pick a stage (or switch to Custom and enter a stage level and enemy hit) to see how much damage you take.</p>{/if}
      </div>
    </section>
  </div>
</article>
