<script lang="ts">
  import type { HeroRecord, SkillRecord } from '$lib/content/schema';
  import { heroArt, heroDps, heroRoleLabel, heroStatusDisplay, heroUnlockLabel, heroWeapon } from '$lib/content/hero-view';
  import HeroBuildPlanner from './HeroBuildPlanner.svelte';

  let {
    hero,
    heroes,
    skills = []
  }: {
    hero: HeroRecord;
    heroes: readonly HeroRecord[];
    skills?: readonly SkillRecord[];
  } = $props();
  const status = $derived(heroStatusDisplay(hero, heroes));
</script>

<article class="hero-detail" aria-label={`${hero.name} details`}>
  <a class="detail-back hero-detail-back" href="/heroes"><span aria-hidden="true">←</span> Heroes</a>
  <div class="hero-detail-layout">
    <section class="hero-identity-card" aria-label={`${hero.name} identity`}>
      <img src={heroArt(hero)} alt={hero.name} />
      <h1>{hero.name}</h1>
      <p class="hero-class-name">{hero.role}</p>
      <p class="hero-role-tag">{heroRoleLabel(hero)}</p>
      <dl class="hero-weapons">
        <div><dt>Main Weapon</dt><dd>{heroWeapon(hero, 'MainWeaponGearType')}</dd></div>
        <div><dt>Off-hand</dt><dd>{heroWeapon(hero, 'SubWeaponGearType')}</dd></div>
      </dl>
      <p class="hero-unlock"><span>Unlock</span> {heroUnlockLabel(hero)}</p>
    </section>

    <div class="hero-detail-facts">
      <blockquote>{hero.summary}</blockquote>
      <section class="hero-status-section" aria-labelledby="hero-status-title">
        <h2 class="item-detail-section-title" id="hero-status-title"><span>Status</span></h2>
        <div class="hero-status-card">
          <header>
            <div><small>{hero.name} | {heroRoleLabel(hero)}</small><strong>{hero.name}</strong></div>
            <div class="hero-dps"><small>DPS</small><strong>{heroDps(hero)}</strong></div>
          </header>
          <div class="hero-status-grid">
            {#each status as stat}
              <div class="hero-status-stat tone-{stat.tone}" class:is-best={stat.best}>
                <img src={`/game/content/heroes/stats/${stat.key}.png`} alt="" />
                <span class="hero-status-name">{stat.name}</span>
                {#if stat.best}<small>★ Best</small>{/if}
                <strong>{stat.value}</strong>
                {#if stat.rankPercent !== null}
                  <span class="hero-status-rank" style={`width: ${stat.rankPercent}%`}></span>
                {/if}
              </div>
            {/each}
          </div>
        </div>
        <p class="hero-status-note">Base values (level 1, no gear). The gold underline shows how each stat ranks across the six heroes; gear, runes and the tree below scale them up.</p>
      </section>
      <section class="hero-planner-section" aria-labelledby="hero-planner-title">
        <h2 class="item-detail-section-title" id="hero-planner-title"><span>Build Planner</span></h2>
        <HeroBuildPlanner {hero} {skills} level={50} />
      </section>
    </div>
  </div>
</article>
