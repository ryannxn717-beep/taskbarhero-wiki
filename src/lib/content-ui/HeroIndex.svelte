<script lang="ts">
  import type { HeroRecord } from '$lib/content/schema';
  import { heroArt, heroRoleLabel, heroStat } from '$lib/content/hero-view';

  let { heroes }: { heroes: readonly HeroRecord[] } = $props();
</script>

<section class="hero-index" aria-label="Heroes">
  <header class="hero-index-heading">
    <h1>Heroes</h1>
    <p>The {heroes.length} playable classes - stats, weapons and skills.</p>
  </header>
  <div class="hero-showcase-grid">
    {#each heroes as hero (hero.id)}
      <a class="hero-showcase-card" href={`/heroes/${hero.slug}`} aria-label={`${hero.name} — ${heroRoleLabel(hero)}`}>
        <img src={heroArt(hero)} alt={hero.name} />
        <strong>{hero.name}</strong>
        <small>{hero.role}</small>
        <div class="hero-quick-stats">
          <span class="hero-quick-hp">HP {heroStat(hero, 'MaxHp')}</span>
          <span class="hero-quick-attack" aria-label={`Attack Damage ${heroStat(hero, 'AttackDamage')}`}><img src="/game/content/runes/AllHeroAttackDamage.png" alt="" />{heroStat(hero, 'AttackDamage')}</span>
          <span class="hero-quick-armor" aria-label={`Armor ${heroStat(hero, 'Armor')}`}><img src="/game/content/runes/AllHeroArmor.png" alt="" />{heroStat(hero, 'Armor')}</span>
        </div>
      </a>
    {/each}
  </div>
</section>
