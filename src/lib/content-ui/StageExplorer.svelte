<script lang="ts">
  import { untrack } from 'svelte';
  import type { ContentKind, ContentRecord, StageRecord } from '$lib/content/schema';
  import { stageActors, stageDrops, stagePerWave, titleCase } from '$lib/content/stage-view';
  import StageRewardTable from './StageRewardTable.svelte';

  let {
    stages,
    hrefFor,
    lookup = () => null
  }: {
    stages: readonly StageRecord[];
    hrefFor: (record: ContentRecord) => string;
    lookup?: (kind: ContentKind, id: string) => ContentRecord | null;
  } = $props();

  let selectedId = $state(untrack(() => stages[0]?.id ?? ''));
  let difficulty = $state(untrack(() => stages[0]?.difficulty ?? 'NORMAL'));
  let selectedAct = $state(untrack(() => stages[0]?.act ?? 1));
  let difficultyOpen = $state(false);
  const selected = $derived(stages.find((stage) => stage.id === selectedId) ?? stages[0]);
  const difficulties = $derived([...new Set(stages.map((stage) => stage.difficulty))]);
  const acts = $derived([...new Set(stages.filter((stage) => stage.difficulty === difficulty).map((stage) => stage.act))]);
  const visibleStages = $derived(stages.filter((stage) => stage.difficulty === difficulty && stage.act === selectedAct));
  const selectedActors = $derived(selected ? stageActors(selected) : { boss: null, monsters: [] });
  const selectedDrops = $derived(selected ? stageDrops(selected) : []);

  function chooseDifficulty(option: string) {
    difficulty = option;
    selectedAct = stages.find((stage) => stage.difficulty === option)?.act ?? 1;
    selectedId = stages.find((stage) => stage.difficulty === option && stage.act === selectedAct)?.id ?? '';
    difficultyOpen = false;
  }

  function chooseAct(act: number) {
    selectedAct = act;
    selectedId = stages.find((stage) => stage.difficulty === difficulty && stage.act === act)?.id ?? '';
  }

  function mapCoordinate(stage: StageRecord, key: 'x' | 'y'): number {
    const value = Number(stage.mapPosition[key]);
    return Number.isFinite(value) ? value * 100 : 50;
  }

  function dropHref(boxId: string): string {
    const box = lookup('stageBox', boxId);
    return box ? hrefFor(box) : selected ? hrefFor(selected) : '#';
  }
</script>

<section class="stage-source-index" aria-label="Stage explorer">
  <header class="stage-index-heading">
    <h1>Stages</h1>
    <p>3 acts | 4 difficulties | 120 stages - monsters, bosses and loot tables.</p>
  </header>

  <div class="stage-source-grid">
    <div class="stage-map-column">
      <div class="stage-difficulty-select">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={difficultyOpen}
          onclick={() => (difficultyOpen = !difficultyOpen)}
        >{titleCase(difficulty)} <span>▼</span></button>
        {#if difficultyOpen}
          <div class="stage-difficulty-menu" role="listbox" aria-label="Difficulty">
            {#each difficulties as option}
              <button
                type="button"
                role="option"
                aria-selected={difficulty === option}
                onclick={() => chooseDifficulty(option)}
              >{titleCase(option)}</button>
            {/each}
          </div>
        {/if}
      </div>

      <div class="stage-act-tabs" role="tablist" aria-label="Acts">
        {#each acts as act}
          <button
            type="button"
            role="tab"
            aria-selected={selectedAct === act}
            aria-controls="stage-map-panel"
            class:active={selectedAct === act}
            onclick={() => chooseAct(act)}
          ><span>ACT {act}</span></button>
        {/each}
      </div>

      <div class="stage-map-frame" id="stage-map-panel" role="tabpanel">
        <div class="stage-map-canvas">
          <img src={`/game/ui/Act${selectedAct}_Bg.png`} alt={`Act ${selectedAct} map`} draggable="false" />
          <span class="stage-map-act">ACT {selectedAct}</span>
          <nav aria-label="Stage map">
            {#each visibleStages as stage}
              <button
                type="button"
                class:active={selected?.id === stage.id}
                class:boss={stage.number === 10}
                aria-label={stage.name}
                aria-pressed={selected?.id === stage.id}
                style={`left:${mapCoordinate(stage, 'x')}%;top:${mapCoordinate(stage, 'y')}%`}
                onclick={() => (selectedId = stage.id)}
              >
                {#if selected?.id === stage.id}
                  <img class="stage-active-base" src="/game/world/StageIcon_Occupied_Base.png" alt="" />
                  <span class="stage-active-flag" aria-hidden="true"></span>
                {/if}
                <span class="stage-node-label">[{selectedAct}-{stage.number}]</span>
              </button>
            {/each}
          </nav>
        </div>
      </div>
      <p class="stage-map-help">Act {selectedAct} | {titleCase(difficulty)} - click a node to inspect it.</p>
    </div>

    {#if selected}
      <section class="stage-source-preview" aria-label="Selected stage">
        <header>
          <div>
            <p>ACT {selected.act}-{selected.number} | Lv {selected.level}</p>
            <h2>{selected.name}</h2>
          </div>
          <a href={hrefFor(selected)}>Full page ↗</a>
        </header>

        <div class="stage-preview-stats">
          <div><span>WAVES</span><strong>{selected.waves ?? '—'}</strong></div>
          <div><span>MOBS / WAVE</span><strong>{stagePerWave(selected)}</strong></div>
          <div><span>MOB TYPES</span><strong>{selectedActors.monsters.length}</strong></div>
        </div>

        {#if selectedActors.monsters.length > 0}
          <section class="stage-preview-section">
            <h3><span>MONSTERS</span></h3>
            <div class="stage-preview-table">
              <div class="stage-preview-table-head"><span>MONSTER</span><span>SPAWN</span><span>ELEMENT</span><span>HP</span><span>ATK</span></div>
              {#each selectedActors.monsters as monster}
                <div class="stage-preview-table-row">
                  <span>{#if monster.portrait}<img src={monster.portrait} alt="" />{/if}<b>{monster.name}</b></span>
                  <span>{monster.spawnPct ?? '—'}%</span><span class="element-chip">PHYSICAL</span><span>{monster.hp}</span><span>{monster.atk}</span>
                </div>
              {/each}
            </div>
          </section>
        {/if}

        {#if selectedActors.boss}
          <section class="stage-preview-section">
            <h3><span>BOSS</span></h3>
            <article class="stage-preview-boss">
              {#if selectedActors.boss.portrait}<img src={selectedActors.boss.portrait} alt="" />{/if}
              <div><strong>{selectedActors.boss.name}</strong><span class="element-chip">PHYSICAL</span><small>HP {selectedActors.boss.hp} · ATK {selectedActors.boss.atk} · Gold {selectedActors.boss.gold} · Exp {selectedActors.boss.exp}</small></div>
            </article>
          </section>
        {/if}

        {#if selectedDrops.length > 0}
          <section class="stage-preview-section stage-preview-loot">
            <h3><span>CHESTS &amp; LOOT</span></h3>
            {#each selectedDrops as drop}
              <a class={`stage-preview-drop-card drop-grade-${drop.boxGrade.toLowerCase()}`} href={dropHref(drop.boxId)}>
                {#if drop.boxIcon}<img src={drop.boxIcon} alt="" />{/if}
                <span><small>{drop.label} · {drop.rate.toFixed(1)}% drop</small><strong>{drop.boxName}</strong></span>
              </a>
              {#if drop.entries.length > 0}
                <StageRewardTable {drop} {lookup} {hrefFor} />
              {/if}
            {/each}
          </section>
        {/if}
      </section>
    {/if}
  </div>

  <nav class="stage-source-navigation" aria-label="Stages">
    <h2>Stages</h2>
    <ul>
      {#each stages as stage}
        <li><a href={hrefFor(stage)}>{stage.name}</a></li>
      {/each}
    </ul>
  </nav>
</section>
