<script lang="ts">
  import type { GearRecord, StageBoxRecord } from '$lib/content/schema';
  import { DROP_SCENARIOS, itemDropCards, itemStatusLines, type DropScenario } from '$lib/content/item-detail';

  let { gear, boxes }: { gear: GearRecord; boxes: readonly StageBoxRecord[] } = $props();

  let scenario = $state<DropScenario>('base');
  const drops = $derived(itemDropCards(gear, boxes));
  const status = $derived(itemStatusLines(gear));

  const titleCase = (value: string) => value.toLowerCase().replace(/(^|[_\s-]+)([a-z])/g, (_match, gap: string, letter: string) => `${gap ? ' ' : ''}${letter.toUpperCase()}`);
  const scenarioLabel = (value: DropScenario) => value === 'base' ? 'Base' : `+ ${titleCase(value)}`;
  const chanceLabel = (value: number) => `${value.toFixed(1)}%`;
  const stageChanceLabel = (value: number) => `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)}%`;
</script>

<article class="item-detail" aria-label={`${gear.name} details`}>
  <a class="detail-back item-detail-back" href="/gear"><span aria-hidden="true">←</span> Gear</a>

  <div class="item-detail-overview">
    <section class="item-identity-card" aria-label={`${gear.name} identity`}>
      {#if gear.image}<img src={gear.image} alt={gear.name} />{/if}
      <h1>{gear.name}</h1>
      <p class="item-rarity">{titleCase(gear.gradeId)}</p>
      <p class="item-market">Steam Market | Untradable</p>
      <dl class="item-meta">
        <div><dt>Type</dt><dd>Gear</dd></div>
        <div><dt>Slot</dt><dd>{titleCase(gear.gearType)}</dd></div>
        <div><dt>Lv</dt><dd>{gear.level}</dd></div>
      </dl>
    </section>

    <div class="item-detail-facts">
      <section class="item-fact-section" aria-labelledby="item-resell-title">
        <h2 class="item-detail-section-title" id="item-resell-title"><span>Resell Value</span></h2>
        <div class="item-value-grid">
          <div class="item-value-card">
            <span>Alchemy Gold</span>
            <strong><span class="coin-dot" aria-hidden="true"></span>{gear.sellGold}</strong>
          </div>
          <div class="item-value-card">
            <span>Cube Exp</span>
            <strong>{gear.cubeExp}</strong>
          </div>
        </div>
        <p class="item-fact-note">Gold and Cube EXP gained from breaking this item down in the Cube.</p>
      </section>

      <section class="item-fact-section" aria-labelledby="item-status-title">
        <h2 class="item-detail-section-title" id="item-status-title"><span>Status</span></h2>
        {#if status.length > 0}
          <div class="item-value-grid item-status-grid">
            {#each status as line}
              <div class="item-value-card">
                <span>{line.label} <small>{line.qualifier}</small></span>
                <strong>{line.value}</strong>
              </div>
            {/each}
          </div>
        {:else}
          <p class="item-no-status">No fixed base status.</p>
        {/if}
        <p class="item-fact-note">Base stats come from the gear type and scale with item level; inherent stats are extra rolls fixed to this item.</p>
      </section>
    </div>
  </div>

  <section class="item-drop-section" aria-labelledby="item-found-title">
    <h2 class="item-detail-section-title" id="item-found-title"><span>Found in <b>{drops.length}</b> {drops.length === 1 ? 'chest' : 'chests'}</span></h2>
    {#if drops.length > 0}
      <p class="item-fact-note">Each chest drops at the stages below; the % is the chance it contains this item when opened.</p>
      <div class="item-scenario-controls" aria-label="Owned Heroes">
        <span>Owned Heroes</span>
        {#each DROP_SCENARIOS as option}
          <button
            type="button"
            class:active={scenario === option}
            aria-pressed={scenario === option}
            aria-label={titleCase(option)}
            onclick={() => (scenario = option)}
          >{scenarioLabel(option)}</button>
        {/each}
      </div>
      <div class="item-drop-grid">
        {#each drops as drop (drop.box.id)}
          <article class="item-drop-card">
            <header>
              <a class="item-drop-image" href={`/items/${drop.box.slug}`}>
                {#if drop.box.image}<img src={drop.box.image} alt="" />{/if}
              </a>
              <div>
                <a class="item-drop-name" href={`/items/${drop.box.slug}`}>{drop.box.name}</a>
                <small class:boss={drop.via === 'boss'}>{titleCase(drop.via)}</small>
              </div>
              <strong>{chanceLabel(drop.chances[scenario])}<small>to contain</small></strong>
            </header>
            <div class="item-stage-tags">
              {#each drop.stages as stage (`${drop.box.id}:${stage.key}`)}
                <span>{stage.label} <b>{stageChanceLabel(stage.percent)}</b></span>
              {/each}
            </div>
          </article>
        {/each}
      </div>
    {:else}
      <p class="item-drop-empty">This item is not obtainable from any known stage chest.</p>
    {/if}
  </section>
</article>
