<script lang="ts">
  import type { GearFilter } from '$lib/content/repository';
  import type { GradeId } from '$lib/content/schema';
  import {
    GEAR_GROUP_OPTIONS,
    GEAR_RARITY_OPTIONS,
    GEAR_STAT_OPTIONS
  } from '$lib/content/gear-options';

  let {
    filter,
    onPatch,
    onReset
  }: {
    filter: GearFilter;
    onPatch: (patch: Partial<GearFilter>) => void;
    onReset: () => void;
  } = $props();

  const rarityColors: Record<GradeId, string> = {
    COMMON: '#e8eaf1',
    UNCOMMON: '#39d72f',
    RARE: '#2c8cff',
    LEGENDARY: '#ffa31a',
    IMMORTAL: '#ff334d',
    ARCANA: '#d83cff',
    BEYOND: '#ff3f92',
    CELESTIAL: '#57d8ff',
    DIVINE: '#ffe84f',
    COSMIC: '#ffffff'
  };

  function toggle<T extends string>(values: T[], value: T): T[] {
    return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
  }
</script>

<fieldset class="gear-filter-panel" aria-label="Gear filters">
  <div class="gear-filter-row">
    <div class="gear-filter-label"><span aria-hidden="true">●</span> Rarity</div>
    <div class="filter-buttons gear-rarity-buttons">
      <button type="button" class:active={filter.gradeIds.length === 0} aria-label="All rarities" onclick={() => onPatch({ gradeIds: [] })}>All</button>
      {#each GEAR_RARITY_OPTIONS as option}
        <button
          type="button"
          class:active={filter.gradeIds.includes(option.id)}
          aria-pressed={filter.gradeIds.includes(option.id)}
          aria-label={`${option.label} rarity`}
          style:--rarity-color={rarityColors[option.id]}
          onclick={() => onPatch({ gradeIds: toggle(filter.gradeIds, option.id) })}
        >{option.label}</button>
      {/each}
    </div>
  </div>

  <div class="gear-filter-row">
    <div class="gear-filter-label"><span aria-hidden="true">●</span> Type</div>
    <div class="filter-buttons">
      <button type="button" class:active={filter.gearGroups.length === 0} aria-label="All types" onclick={() => onPatch({ gearGroups: [] })}>All</button>
      {#each GEAR_GROUP_OPTIONS as option}
        <button
          type="button"
          class:active={filter.gearGroups.includes(option.id)}
          aria-pressed={filter.gearGroups.includes(option.id)}
          aria-label={`${option.label} type`}
          onclick={() => onPatch({ gearGroups: toggle(filter.gearGroups, option.id) })}
        >{option.label}</button>
      {/each}
    </div>
  </div>

  <div class="gear-filter-row gear-stat-row">
    <div class="gear-filter-label"><span aria-hidden="true">●</span> Stat</div>
    <div class="filter-buttons">
      <button type="button" class:active={filter.statTypes.length === 0} aria-label="All stats" onclick={() => onPatch({ statTypes: [] })}>All</button>
      {#each GEAR_STAT_OPTIONS as option}
        <button
          type="button"
          class:active={filter.statTypes.includes(option.id)}
          aria-pressed={filter.statTypes.includes(option.id)}
          aria-label={`${option.label} stat`}
          onclick={() => onPatch({ statTypes: toggle(filter.statTypes, option.id) })}
        >{option.label}</button>
      {/each}
    </div>
  </div>

  <div class="gear-filter-row gear-level-row">
    <div class="gear-filter-label"><span aria-hidden="true">●</span> Level</div>
    <div class="gear-level-controls">
      <output aria-label="Minimum level value">MIN {filter.minLevel ?? 1}</output>
      <div class="gear-dual-range">
        <label>
          <span class="sr-only">Minimum level</span>
          <input type="range" min="1" max="55" value={filter.minLevel ?? 1} aria-label="Minimum level" oninput={(event) => onPatch({ minLevel: Math.min(Number(event.currentTarget.value), filter.maxLevel ?? 55) })} />
        </label>
        <label>
          <span class="sr-only">Maximum level</span>
          <input type="range" min="1" max="55" value={filter.maxLevel ?? 55} aria-label="Maximum level" oninput={(event) => onPatch({ maxLevel: Math.max(Number(event.currentTarget.value), filter.minLevel ?? 1) })} />
        </label>
      </div>
      <output class="sr-only" aria-label="Maximum level value">MAX {filter.maxLevel ?? 55}</output>
      <button class="gear-reset" type="button" aria-label="Reset filters" onclick={onReset}>Reset</button>
    </div>
  </div>

  <div class="gear-filter-row gear-find-row">
    <div class="gear-filter-label"><span aria-hidden="true">●</span> Find</div>
    <div class="gear-find-controls">
      <label class="gear-name-search">
        <span class="sr-only">Name</span>
        <input type="search" value={filter.query} aria-label="Name" placeholder="Filter by name.." oninput={(event) => onPatch({ query: event.currentTarget.value })} />
      </label>
      <label class="obtainable-filter" class:active={filter.obtainable === 'yes'}>
        <input class="sr-only" type="checkbox" checked={filter.obtainable === 'yes'} onchange={(event) => onPatch({ obtainable: event.currentTarget.checked ? 'yes' : 'all' })} />
        <span aria-hidden="true">✓</span> Obtainable only
      </label>
    </div>
  </div>
</fieldset>
