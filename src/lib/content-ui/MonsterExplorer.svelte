<script lang="ts">
  import type { MonsterRecord } from '$lib/content/schema';
  import { monsterAnimations, monsterElement, monsterStat, titleCase } from '$lib/content/database-families';
  import './database-families.css';

  let {
    monsters,
    animations = {}
  }: {
    monsters: readonly MonsterRecord[];
    animations?: Record<string, unknown>;
  } = $props();

  let selectedType = $state('ALL');
  let query = $state('');
  const types = $derived([...new Set(monsters.map((monster) => monster.monsterType))]);
  const visible = $derived(monsters.filter((monster) => {
    if (selectedType !== 'ALL' && monster.monsterType !== selectedType) return false;
    return monster.name.toLowerCase().includes(query.trim().toLowerCase());
  }));
</script>

<section class="database-family-page monster-explorer" aria-labelledby="monster-explorer-heading">
  <header class="database-family-heading">
    <h1 id="monster-explorer-heading">Monsters</h1>
    <p>{monsters.length} enemies - stats, rewards and sprites. Hover a card to see it animate.</p>
  </header>

  <div class="monster-controls">
    <div class="database-filter-row monster-type-filter">
      <div>
        <button type="button" class:active={selectedType === 'ALL'} aria-pressed={selectedType === 'ALL'} onclick={() => (selectedType = 'ALL')}>All</button>
        {#each types as type}
          <button type="button" class:active={selectedType === type} aria-pressed={selectedType === type} onclick={() => (selectedType = type)}>{titleCase(type)}</button>
        {/each}
      </div>
    </div>
    <label class="database-name-search"><span class="sr-only">Filter by name</span><input type="search" aria-label="Filter by name" placeholder="Filter by name..." bind:value={query} /></label>
  </div>

  <p class="database-family-count compact-count" role="status" aria-label="Monster result count">{visible.length} {visible.length === 1 ? 'monster' : 'monsters'}</p>

  <div class="monster-card-grid">
    {#each visible as monster}
      {@const idle = monsterAnimations(monster, animations).find((animation) => animation.label === 'Idle')}
      <a class="monster-card" href={`/monsters/${monster.slug}`} aria-label={monster.name}>
        <span class="monster-card-art">
          {#if monster.image}<img src={monster.image} alt="" loading="lazy" />{/if}
          {#if idle}
            <span
              class="monster-list-sprite"
              role="img"
              aria-label={`${monster.name} Idle animation`}
              style={`--sprite-sheet:url('${idle.sheet}');--sprite-frames:${idle.frames};--sprite-w:${idle.w * 4}px;--sprite-h:${idle.h * 4}px`}
            ></span>
          {/if}
        </span>
        <span class="monster-card-copy">
          <small>{titleCase(monster.monsterType)}</small>
          <strong>{monster.name}</strong>
          <span class="monster-health"><b>HP</b> {monsterStat(monster, 'MaxLife')} <i aria-hidden="true">♞</i> {monsterStat(monster, 'AttackDamage')}</span>
          <span class="monster-attack"><small>ATK</small> <b>{monsterElement(monster)}</b></span>
        </span>
      </a>
    {/each}
  </div>
</section>
