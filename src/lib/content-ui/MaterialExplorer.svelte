<script lang="ts">
  import type { GradeId, MaterialRecord } from '$lib/content/schema';
  import { SOURCE_GRADE_ORDER } from '$lib/content/schema';
  import { effectRange, effectSlotLabel, effectTier, materialEffectGroups, statLabel, titleCase } from '$lib/content/database-families';
  import './database-families.css';

  let {
    materials,
    mode = 'materials'
  }: {
    materials: readonly MaterialRecord[];
    mode?: 'materials' | 'effects';
  } = $props();

  let selectedType = $state('ALL');
  let selectedGrade = $state<GradeId | 'ALL'>('ALL');
  let selectedSlot = $state('ALL');
  let statFilterOpen = $state(false);
  let selectedStat = $state('ALL');

  const sourceMaterials = $derived(mode === 'effects' ? materials.filter((material) => material.hasEffects) : materials);
  const types = $derived([...new Set(sourceMaterials.map((material) => material.materialType))]);
  const slots = $derived([...new Set(sourceMaterials.flatMap((material) => materialEffectGroups(material).map((group) => group.slot).filter((slot) => slot !== 'ALL')))]);
  const stats = $derived([...new Set(sourceMaterials.flatMap((material) => materialEffectGroups(material).flatMap((group) => group.effects.map((effect) => effect.stat))))]);
  const visible = $derived(sourceMaterials.filter((material) => {
    if (selectedType !== 'ALL' && material.materialType !== selectedType) return false;
    if (mode === 'materials' && selectedGrade !== 'ALL' && material.gradeId !== selectedGrade) return false;
    if (mode === 'effects' && selectedSlot !== 'ALL' && !materialEffectGroups(material).some((group) => group.slot === selectedSlot || group.slot === 'ALL')) return false;
    if (mode === 'effects' && selectedStat !== 'ALL' && !materialEffectGroups(material).some((group) => group.effects.some((effect) => effect.stat === selectedStat))) return false;
    return true;
  }));

  const heading = $derived(mode === 'effects' ? 'Material Effects' : 'Materials');
  const countCopy = $derived(mode === 'effects'
    ? `${sourceMaterials.length} materials`
    : `${materials.length} crafting & enhancement materials.`);

  function chooseType(type: string) {
    selectedType = type;
  }

  function chooseGrade(grade: GradeId | 'ALL') {
    selectedGrade = grade;
  }
</script>

<section class="database-family-page material-explorer" data-mode={mode} aria-labelledby="material-explorer-heading">
  <header class="database-family-heading">
    <h1 id="material-explorer-heading">{heading}</h1>
    {#if mode === 'effects'}
      <p>Each material and every stat it can grant - by slot and tier. Filter by the stats you want to min-max.</p>
    {:else}
      <p>{countCopy}</p>
    {/if}
  </header>

  <div class="database-filter-stack" aria-label={`${heading} filters`}>
    <div class="database-filter-row">
      <span>Type</span>
      <div>
        <button type="button" class:active={selectedType === 'ALL'} aria-pressed={selectedType === 'ALL'} onclick={() => chooseType('ALL')}>All</button>
        {#each types as type}
          <button
            type="button"
            class:active={selectedType === type}
            aria-pressed={selectedType === type}
            aria-label={`${titleCase(type)} type`}
            onclick={() => chooseType(type)}
          >{titleCase(type)}</button>
        {/each}
      </div>
    </div>

    {#if mode === 'materials'}
      <div class="database-filter-row">
        <span>Rarity</span>
        <div>
          <button type="button" class:active={selectedGrade === 'ALL'} aria-pressed={selectedGrade === 'ALL'} onclick={() => chooseGrade('ALL')}>All</button>
          {#each SOURCE_GRADE_ORDER as grade}
            <button
              type="button"
              class="grade-filter grade-tone-{grade.toLowerCase()}"
              class:active={selectedGrade === grade}
              aria-pressed={selectedGrade === grade}
              aria-label={`${titleCase(grade)} rarity`}
              onclick={() => chooseGrade(grade)}
            >{titleCase(grade)}</button>
          {/each}
        </div>
      </div>
    {:else}
      <div class="database-filter-row">
        <span>Slot</span>
        <div>
          <button type="button" class:active={selectedSlot === 'ALL'} aria-pressed={selectedSlot === 'ALL'} onclick={() => (selectedSlot = 'ALL')}>All</button>
          {#each slots as slot}
            <button type="button" class:active={selectedSlot === slot} aria-pressed={selectedSlot === slot} onclick={() => (selectedSlot = slot)}>{titleCase(slot)}</button>
          {/each}
        </div>
      </div>
      <div class="database-filter-row stat-filter-row">
        <span>Stats</span>
        <div>
          <button type="button" aria-label="Add stat filter" aria-expanded={statFilterOpen} onclick={() => (statFilterOpen = !statFilterOpen)}>+ Add stat..</button>
          {#if statFilterOpen}
            <button type="button" class:active={selectedStat === 'ALL'} onclick={() => (selectedStat = 'ALL')}>Any stat</button>
            {#each stats as stat}
              <button type="button" class:active={selectedStat === stat} onclick={() => (selectedStat = stat)}>{statLabel(stat)}</button>
            {/each}
          {/if}
        </div>
      </div>
    {/if}
  </div>

  <p
    class="database-family-count"
    role="status"
    aria-label={mode === 'effects' ? 'Material effect result count' : 'Material result count'}
  >{visible.length} {visible.length === 1 ? 'material' : 'materials'}</p>

  {#if mode === 'materials'}
    <div class="material-card-grid">
      {#each visible as material}
        <a class="material-card grade-tone-{material.gradeId.toLowerCase()}" href={`/materials/${material.slug}`} aria-label={material.name}>
          <span class="material-card-art">{#if material.image}<img src={material.image} alt="" loading="lazy" />{/if}</span>
          <span class="material-card-copy">
            <small>{titleCase(material.materialType)}</small>
            <strong>{material.name}</strong>
          </span>
        </a>
      {/each}
    </div>
  {:else}
    <div class="effect-card-grid">
      {#each visible as material}
        <article class="effect-card" aria-label={`${material.name} effects`}>
          <header>
            {#if material.image}<span><img src={material.image} alt="" loading="lazy" /></span>{/if}
            <div><h2>{material.name}</h2><p>{titleCase(material.gradeId)} | {titleCase(material.materialType)}</p></div>
          </header>
          {#each materialEffectGroups(material) as group}
            {#if selectedSlot === 'ALL' || selectedSlot === group.slot || group.slot === 'ALL'}
              <section>
                <h3>{effectSlotLabel(group.slot)}</h3>
                {#each group.effects as effect}
                  {#if selectedStat === 'ALL' || selectedStat === effect.stat}
                    <p><span>{statLabel(effect.stat)}</span><strong>{effectRange(effect)}</strong><small>{effectTier(effect)}</small></p>
                  {/if}
                {/each}
              </section>
            {/if}
          {/each}
        </article>
      {/each}
    </div>
  {/if}
</section>
