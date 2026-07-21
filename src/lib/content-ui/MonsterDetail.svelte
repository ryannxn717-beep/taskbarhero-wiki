<script lang="ts">
  import { untrack } from 'svelte';
  import type { MonsterRecord, StageRecord } from '$lib/content/schema';
  import { monsterAnimations, monsterAttack, monsterElement, monsterStat, titleCase } from '$lib/content/database-families';
  import { stageActors } from '$lib/content/stage-view';
  import './database-families.css';

  let {
    monster,
    stages,
    animations,
    hrefFor
  }: {
    monster: MonsterRecord;
    stages: readonly StageRecord[];
    animations: Record<string, unknown>;
    hrefFor: (stage: StageRecord) => string;
  } = $props();

  const modes = $derived(monsterAnimations(monster, animations));
  let selectedName = $state(untrack(() => modes[0]?.name ?? ''));
  const selected = $derived(modes.find((animation) => animation.name === selectedName) ?? modes[0]);
  const attack = $derived(monsterAttack(monster));
  const hp = $derived(monsterStat(monster, 'MaxLife'));
  const damage = $derived(monsterStat(monster, 'AttackDamage'));
  const speed = $derived(monsterStat(monster, 'AttackSpeed'));
  const movement = $derived(monsterStat(monster, 'MovementSpeed'));
  const spawnRows = $derived(stages.map((stage) => {
    const actors = stageActors(stage);
    const regular = actors.monsters.find((actor) => actor.key === monster.id || actor.slug === monster.slug);
    const boss = actors.boss && (actors.boss.key === monster.id || actors.boss.slug === monster.slug) ? actors.boss : null;
    const rate = regular?.spawnPct ?? (boss ? 100 : null);
    return {
      stage,
      rate,
      perClear: rate === null ? null : boss ? 1 : Math.round(stage.kills * rate / 100)
    };
  }).filter((row) => row.rate !== null));
</script>

<article class="monster-detail">
  <a class="monster-detail-back" href="/monsters" aria-label="Monsters">← Monsters</a>

  <div class="monster-detail-layout">
    <section class="monster-identity-card" aria-label={`${monster.name} identity`}>
      <div class="monster-animation-stage">
        {#if selected?.label === 'Idle' && monster.image}
          <img src={monster.image} alt={`${monster.name} Idle animation`} />
        {:else if selected}
          <span
            class="monster-detail-sprite"
            role="img"
            aria-label={`${monster.name} ${selected.label} animation`}
            style={`--sprite-sheet:url('${selected.sheet}');--sprite-frames:${selected.frames};--sprite-w:${selected.w * 6}px;--sprite-h:${selected.h * 6}px`}
          ></span>
        {:else if monster.image}
          <img src={monster.image} alt={monster.name} />
        {/if}
      </div>

      {#if modes.length > 0}
        <div class="monster-animation-tabs" aria-label="Animation mode">
          {#each modes as mode}
            <button
              type="button"
              class:active={selected?.name === mode.name}
              aria-pressed={selected?.name === mode.name}
              onclick={() => (selectedName = mode.name)}
            >{mode.label}</button>
          {/each}
        </div>
      {/if}

      <h1>{monster.name}</h1>
      <p>{titleCase(monster.monsterType)}</p>
    </section>

    <div class="monster-detail-facts">
      <p class="monster-description">{monster.name} is a monster with {hp} HP and {damage} attack. It rewards {monster.rewardGold} gold and {monster.rewardExp} EXP per kill.</p>

      <section class="monster-fact-section" aria-label="Combat stats">
        <h2>Combat Stats</h2>
        <div class="monster-stat-grid">
          <div><small>MAX LIFE</small><strong>{hp}</strong></div>
          <div><small><span aria-hidden="true">♞</span> ATTACK</small><strong>{damage}</strong></div>
          <div><small>ATK ELEMENT</small><strong>{monsterElement(monster)}</strong></div>
          <div><small><span aria-hidden="true">♞</span> ATK SPEED</small><strong>{speed}</strong></div>
          <div><small><span aria-hidden="true">♞</span> MOVE SPEED</small><strong>{movement}</strong></div>
          <div><small><span class="database-coin" aria-hidden="true">●</span> REWARD GOLD</small><strong>{monster.rewardGold}</strong></div>
          <div><small>REWARD EXP</small><strong>{monster.rewardExp}</strong></div>
        </div>
      </section>

      <section class="monster-fact-section" aria-label="Attack">
        <h2>Attack</h2>
        <div class="monster-stat-grid attack-stat-grid">
          <div><small>Kind</small><strong>{attack.activation}</strong></div>
          <div><small>Element</small><strong><span class="element-badge">{attack.element}</span></strong></div>
          <div><small>Range</small><strong>{attack.range}</strong></div>
          <div><small>Power</small><strong>{attack.power}%</strong></div>
        </div>
      </section>

      {#if stages.length > 0}
        <section class="monster-fact-section monster-spawns" aria-label="Where it spawns">
          <h2>Where It Spawns <small>| {stages.length}</small></h2>
          <div class="monster-stage-table-wrap">
            <table class="monster-stage-table" aria-label={`Where ${monster.name} spawns`}>
              <thead><tr><th>Stage</th><th>Spawn rate</th><th>~ / clear</th></tr></thead>
              <tbody>
                {#each spawnRows as row, index (row.stage.id)}
                  <tr>
                    <td>{#if index === 0}<span class="monster-first-stage" aria-hidden="true">★</span>{/if}<a href={hrefFor(row.stage)}>A{row.stage.act}-{row.stage.number}</a><small class={`monster-difficulty difficulty-${row.stage.difficulty.toLowerCase()}`}>{titleCase(row.stage.difficulty)}</small></td>
                    <td><div class="monster-spawn-rate-cell"><span><i data-testid="monster-spawn-rate" style={`width:${row.rate}%`}></i></span><strong>{row.rate}%</strong></div></td>
                    <td>{row.perClear}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </section>
      {/if}
    </div>
  </div>
</article>
