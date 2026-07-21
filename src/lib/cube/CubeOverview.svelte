<script lang="ts">
  import {
    cubeGearTypeFactors,
    cubeItemLevelFactors,
    cubeItemTypeFactors,
    cubeLevelMilestones,
    cubeOperations,
    gradeGoldAndExp
  } from './data';
  import './cube.css';

  const cardOrder = ['synthesis', 'alchemy', 'crafting', 'decoration', 'engraving', 'inscription', 'extraction', 'offering'];
  const operationCards = cardOrder.map((slug) => cubeOperations.find((operation) => operation.slug === slug)!);
  const formatNumber = (value: number) => value.toLocaleString('en-US');
</script>

<article class="cube-page cube-overview">
  <header class="cube-copy-head">
    <h1>Cube</h1>
    <p>The Cube is Task Bar Hero's all-in-one crafting station. Level it up to unlock eight operations that transform, upgrade and enchant your gear.</p>
  </header>

  <section aria-labelledby="cube-operations-heading">
    <h2 id="cube-operations-heading">Operations</h2>
    <div class="cube-operation-grid">
      {#each operationCards as operation (operation.slug)}
        <a class="cube-operation-card" data-testid="cube-operation-card" href={operation.path}>
          <img src={operation.icon} alt="" />
          <span class="cube-operation-copy">
            <span class="cube-operation-name"><strong>{operation.name}</strong><small>{operation.unlockLevel === 0 ? 'Default' : `Cube Lv${operation.unlockLevel}`}</small></span>
            <span>{operation.summary}</span>
          </span>
        </a>
      {/each}
    </div>
  </section>

  <section aria-labelledby="cube-unlocks-heading">
    <h2 id="cube-unlocks-heading">Unlock progression</h2>
    <p class="cube-section-copy">Each operation unlocks at a cube level, for a one-time gold cost.</p>
    <div class="cube-table-wrap">
      <table class="cube-table cube-unlock-table">
        <thead><tr><th>Cube level</th><th>Operation</th><th>Cost</th></tr></thead>
        <tbody>
          {#each cubeOperations as operation (operation.slug)}
            <tr>
              <th>{operation.unlockLevel === 0 ? 'Default' : `Cube Lv${operation.unlockLevel}`}</th>
              <td><a href={operation.path}><img src={operation.icon} alt="" />{operation.name}</a></td>
              <td>{operation.unlockCost === 0 ? '—' : formatNumber(operation.unlockCost)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>

  <section class="cube-leveling" aria-labelledby="cube-leveling-heading">
    <h2 id="cube-leveling-heading">Cube leveling</h2>
    <p>Each item the Cube consumes is worth a base amount set by four factors, then scaled by how close the item's level is to the cube's, and finally boosted by any Cube EXP % bonus. The result is rounded down.</p>
    <div class="cube-formula">EXP = ⌊ grade × item lv × gear type × item type ⌋ × level match × (1 + Cube EXP %)</div>

    <h3>The four base factors</h3>
    <div class="cube-factor-grid">
      <article class="cube-factor-card">
        <span>Grade - base EXP</span>
        <table aria-label="Grade base EXP">
          <thead><tr><th>Grade</th><th>Cube EXP</th></tr></thead>
          <tbody>
            {#each gradeGoldAndExp as row (row.grade)}
              <tr data-testid="cube-grade-factor"><th class={`grade-${row.grade.toLowerCase()}`}>{row.grade}</th><td>{formatNumber(row.exp)}</td></tr>
            {/each}
          </tbody>
        </table>
      </article>

      <article class="cube-factor-card">
        <span>Item level</span>
        <p>Higher-level gear is worth far more — but only if its level is close to the cube's.</p>
        <table aria-label="Item level factors">
          <thead><tr><th>Item Lv</th><th>Factor</th></tr></thead>
          <tbody>
            {#each cubeItemLevelFactors as row (row.level)}
              <tr data-testid="cube-item-level-factor"><th>{row.level}</th><td>×{formatNumber(row.factor)}</td></tr>
            {/each}
          </tbody>
        </table>
      </article>

      <div class="cube-factor-stack">
        <article class="cube-factor-card">
          <span>Gear type</span>
          <p>Off-hands and accessories are worth more than weapons and armor pieces.</p>
          <table aria-label="Gear type factors">
            <thead><tr><th>Gear type</th><th>Factor</th></tr></thead>
            <tbody>
              {#each cubeGearTypeFactors as row (row.type)}
                <tr data-testid="cube-gear-type-factor"><th>{row.type}</th><td>×{row.factor}</td></tr>
              {/each}
            </tbody>
          </table>
        </article>
        <article class="cube-factor-card">
          <span>Item type</span>
          <p>Materials are worth far more than gear, level for level.</p>
          <table aria-label="Item type factors">
            <thead><tr><th>Item type</th><th>Factor</th></tr></thead>
            <tbody>
              {#each cubeItemTypeFactors as row (row.type)}
                <tr data-testid="cube-item-type-factor"><th>{row.type}</th><td>×{row.factor}</td></tr>
              {/each}
            </tbody>
          </table>
        </article>
      </div>
    </div>

    <a class="cube-callout-link cube-level-match" href="/tools/cube-leveling"><span>Level matching</span><strong>Open the interactive EXP calculator →</strong></a>

    <div class="cube-good-to-know">
      <h3>Good to know</h3>
      <ul>
        <li>There is no level requirement: you can always melt gear and gain some EXP — it is never exactly zero, just smaller for big level gaps.</li>
        <li>Level 100 gear loses its item-level factor entirely, so it grants very little Cube EXP — do not farm it for leveling.</li>
        <li>Rune and pet Cube EXP % bonuses multiply all the Cube EXP you gain.</li>
        <li>Alchemy gold uses the same grade, level and type factors as EXP, but without level matching.</li>
      </ul>
    </div>

    <h3>EXP to reach each cube level</h3>
    <div class="cube-exp-table-wrap">
      <table class="cube-table cube-exp-table" aria-label="EXP to reach each cube level">
        <thead><tr><th>Cube level</th><th>Total EXP</th></tr></thead>
        <tbody>
          {#each cubeLevelMilestones as milestone (milestone.level)}
            <tr><th>{milestone.level}</th><td>{formatNumber(milestone.totalExp)}</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
    <p class="cube-leveling-note">Each operation grants Cube EXP based on the grade of the items involved. The amount also depends on item level versus the cube level: items at or just above the cube level give the most EXP, while items far from it give almost none.</p>
  </section>
</article>
