<script lang="ts">
  import { cubeExpAtLevel, planCubeLeveling } from '$lib/tools/cube-leveling';
  import { gradeGoldAndExp, type CubeGrade } from '$lib/cube/data';
  import './calculators.css';

  let currentLevel = $state(5);
  let currentExp = $state(405);
  let targetLevel = $state(10);
  let itemGrade = $state<CubeGrade>('Rare');
  const calculation = $derived.by(() => {
    try {
      return { result: planCubeLeveling({ currentLevel, currentExp, targetLevel, itemGrade }), error: '' };
    } catch (error) {
      return { result: null, error: error instanceof Error ? error.message : String(error) };
    }
  });

  function syncLevel() { try { currentExp = cubeExpAtLevel(currentLevel); } catch { /* visible through result validation */ } }
  function reset() { currentLevel = 5; currentExp = 405; targetLevel = 10; itemGrade = 'Rare'; }
</script>

<article class="calculator-page cube-level-calculator">
  <header class="cube-level-copy">
    <h1>Cube leveling</h1>
    <p>Cube EXP comes from every item the Cube consumes — not just Alchemy. This local planner compares a retained grade yield with the frozen public milestone curve. The max Cube level is 100.</p>
    <h2>Level matching</h2>
    <p>Items close to the Cube level are normally more efficient in game. The reduced-data planner intentionally models grade yield and milestone totals only; it does not invent a private level-scaling formula.</p>
    <h2>EXP calculator</h2>
    <p>Choose a current level, total EXP, target and feed grade to calculate the deterministic item count and opportunity gold.</p>
  </header>

  <section class="cube-level-workbench" aria-label="Cube EXP calculator">
    <div class="cube-level-controls">
      <label>Current level<input aria-label="Current Cube level" type="number" min="1" max="99" bind:value={currentLevel} onchange={syncLevel} /></label>
      <label>Current total EXP<input aria-label="Current total EXP" type="number" min="0" bind:value={currentExp} /></label>
      <label>Target level<input aria-label="Target Cube level" type="number" min="2" max="100" bind:value={targetLevel} /></label>
      <label>Feed item grade<select aria-label="Feed item grade" bind:value={itemGrade}>{#each gradeGoldAndExp as row}<option value={row.grade}>{row.grade}</option>{/each}</select></label>
      <button class="wiki-button" type="button" aria-label="Reset Cube leveling calculator" onclick={reset}>Reset</button>
    </div>
    <p class="calculator-note">Local milestone estimate · sparse public milestones are linearly interpolated and clearly separated from live game state.</p>
    {#if calculation.error}<p class="calculator-error" role="alert">{calculation.error}</p>{/if}
    {#if calculation.result}
      <div class="cube-level-summary" aria-live="polite">
        <div><span>Required EXP</span><strong>{calculation.result.requiredExp.toLocaleString('en-US')}</strong></div>
        <div><span>{calculation.result.itemGrade} items</span><strong>{calculation.result.itemCount}</strong></div>
        <div><span>EXP overage</span><strong>{calculation.result.expOverage.toLocaleString('en-US')}</strong></div>
        <div><span>Opportunity gold</span><strong>{calculation.result.opportunityGold.toLocaleString('en-US')}</strong></div>
      </div>
      <div class="calculator-table-wrap"><table><thead><tr><th>Milestone</th><th>Total EXP</th><th>EXP from previous</th></tr></thead><tbody>{#each calculation.result.tierPath as row}<tr><td>Level {row.level}</td><td>{row.totalExp.toLocaleString('en-US')}</td><td>{row.expFromPrevious.toLocaleString('en-US')}</td></tr>{/each}</tbody></table></div>
    {/if}
  </section>
</article>
