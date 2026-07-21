<script lang="ts">
  import type { ContentKind, ContentRecord, StageRecord } from '$lib/content/schema';
  import { multiplier, stageActors, stageDrops, stageFirstClearRewards, stagePerWave, titleCase } from '$lib/content/stage-view';
  import StageRewardTable from './StageRewardTable.svelte';

  let {
    stage,
    lookup,
    hrefFor
  }: {
    stage: StageRecord;
    lookup: (kind: ContentKind, id: string) => ContentRecord | null;
    hrefFor: (record: ContentRecord) => string;
  } = $props();

  const actors = $derived(stageActors(stage));
  const drops = $derived(stageDrops(stage));
  const firstClearRewards = $derived(stageFirstClearRewards(stage));

  function monsterHref(key: string, slug: string): string {
    const record = lookup('monster', key);
    return record ? hrefFor(record) : slug ? `/monsters/${slug}` : '#';
  }

  function boxHref(id: string): string {
    const record = lookup('stageBox', id);
    return record ? hrefFor(record) : '#';
  }
</script>

<article class="stage-source-detail">
  <a class="stage-source-back" href="/stages">← Stages</a>
  <header class="stage-source-detail-heading">
    <div class="stage-source-meta"><span>Act {stage.act} | Stage {stage.number}</span><b>{titleCase(stage.difficulty)}</b></div>
    <h1>{stage.name}</h1>
    <div class="stage-source-summary"><span>{stage.waves ?? '—'} waves</span><span>{stagePerWave(stage)} / wave</span><span>Lv {stage.level}</span></div>
  </header>

  {#if actors.boss}
    <section class="stage-source-section" aria-label="Boss">
      <h2>BOSS</h2>
      <a class="stage-boss-card" href={monsterHref(actors.boss.key, actors.boss.slug)}>
        {#if actors.boss.portrait}<img src={actors.boss.portrait} alt="" />{/if}
        <div class="stage-boss-copy">
          <h3>{actors.boss.name}</h3>
          <div class="stage-boss-multipliers">
            <span class="element-chip">PHYSICAL</span>
            <span><img src="/game/ui/AllHeroAttackDamage.png" alt="" />Damage {multiplier(actors.boss.damageMultiplier)}</span>
            <span><b>HP</b> {multiplier(actors.boss.hpMultiplier)}</span>
            <span><img src="/game/ui/Icon_Gold.png" alt="" />Gold {multiplier(actors.boss.goldMultiplier)}</span>
            <span><b class="exp">Exp</b> {multiplier(actors.boss.expMultiplier)}</span>
          </div>
          <div class="stage-boss-values">
            <span><b>HP</b> {actors.boss.hp}</span>
            <span><img src="/game/ui/AllHeroAttackDamage.png" alt="" />{actors.boss.atk}</span>
            <span><img src="/game/ui/Icon_Gold.png" alt="" />{actors.boss.gold}</span>
            <span><b class="exp">Exp</b> {actors.boss.exp}</span>
          </div>
        </div>
      </a>
    </section>
  {/if}

  <section class="stage-source-section" aria-label="Monsters">
    <h2>MONSTERS ({actors.monsters.length})</h2>
    <div class="stage-monster-grid">
      {#each actors.monsters as monster}
        <a class="stage-monster-card" href={monsterHref(monster.key, monster.slug)}>
          {#if monster.portrait}<img src={monster.portrait} alt="" />{/if}
          <div>
            <strong>{monster.name}</strong>
            <small>{monster.spawnPct ?? '—'}% spawn</small>
            <p><span class="element-chip">PHYSICAL</span><span><b>HP</b> {monster.hp}</span><span><img src="/game/ui/AllHeroAttackDamage.png" alt="" />{monster.atk}</span><span><img src="/game/ui/Icon_Gold.png" alt="" />{monster.gold}</span><span><b class="exp">Exp</b> {monster.exp}</span></p>
          </div>
        </a>
      {/each}
    </div>
  </section>

  <section class="stage-source-section stage-source-loot" aria-label="Chests and loot">
    <h2>Chests &amp; loot</h2>
    <p>Clearing this stage drops these chests. Each one rolls a single random reward from its table below.</p>
    {#each drops as drop}
      <div class="stage-drop-section">
        <a class={`stage-drop-card drop-grade-${drop.boxGrade.toLowerCase()}`} href={boxHref(drop.boxId)}>
          <span class="stage-drop-icon">{#if drop.boxIcon}<img src={drop.boxIcon} alt="" />{/if}</span>
          <span class="stage-drop-copy">
            <small>{drop.label}{#if drop.rate > 0}<b>| {drop.rate.toFixed(1)}% drop</b>{/if}</small>
            <strong>{drop.boxName}</strong>
            <span>{drop.possibleRewards} possible rewards | open the chest page →</span>
          </span>
        </a>
        {#if drop.entries.length > 0}
          <StageRewardTable {drop} {lookup} {hrefFor} />
        {/if}
      </div>
    {/each}
  </section>

  {#if firstClearRewards.length > 0}
    <section class="stage-source-section stage-first-clear" aria-label="First-clear reward">
      <h2>FIRST-CLEAR REWARD</h2>
      <p>Guaranteed one-time reward the first time you beat this stage.</p>
      <div class="stage-first-clear-table">
        {#each firstClearRewards as reward}
          {@const record = lookup('stageBox', reward.itemId)}
          <div class="stage-first-clear-row">
            <b>{reward.chance.toFixed(1)}%</b>
            <div class="stage-first-clear-content">
              <div class="stage-first-clear-meta">
                <small class={`grade-${reward.grade.toLowerCase()}`}>{reward.grade}</small>
                {#if reward.heroId}<span>DLC | Hero {reward.heroId}</span>{/if}
              </div>
              <a class={`grade-${reward.grade.toLowerCase()}`} href={record ? hrefFor(record) : '#'}>
                {#if reward.icon}<img src={reward.icon} alt={reward.name} />{/if}
                <strong>{reward.name}</strong>
              </a>
            </div>
          </div>
        {/each}
      </div>
    </section>
  {/if}
</article>
