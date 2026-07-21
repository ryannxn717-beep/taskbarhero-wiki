<script lang="ts">
  import type { HeroRecord, PassiveSkillRecord, SkillRecord } from '$lib/content/schema';
  import {
    skillActivationLabel,
    formatPassiveSkillValue,
    skillAttributeMaxLevel,
    skillDetailFacts,
    skillDisplayName,
    skillHeroes,
    skillIcon,
    skillStatLabel
  } from '$lib/content/skill-view';

  let {
    skill,
    heroes
  }: {
    skill: SkillRecord | PassiveSkillRecord;
    heroes: readonly HeroRecord[];
  } = $props();

  const displayName = $derived(skillDisplayName(skill));
  const passive = $derived(skill.kind === 'passiveSkill');
  const icon = $derived(skill.kind === 'skill' ? skillIcon(skill) : null);
  const relatedHeroes = $derived(skillHeroes(skill, heroes));
  const facts = $derived(skillDetailFacts(skill, heroes));
  const maxLevel = $derived(skillAttributeMaxLevel(skill, heroes));
  const statLabel = $derived(skill.kind === 'passiveSkill' ? skillStatLabel(skill.source.STATTYPE ?? skill.stats[0]?.label) : '');
  const category = $derived(skill.kind === 'passiveSkill' ? `Passive | ${statLabel}` : skillActivationLabel(skill));
</script>

<article class="skill-detail" aria-label={`${displayName} details`}>
  <a class="detail-back skill-detail-back" href="/skills"><span aria-hidden="true">←</span> Skills</a>

  <div class="skill-detail-layout">
    <section class="skill-identity-card" class:passive-skill-identity={passive} aria-label={`${displayName} identity`}>
      <div class="skill-identity-art">
        {#if icon}<img src={icon} alt={displayName} />{/if}
      </div>
      <h1>{displayName}</h1>
      <p>{category}</p>
      <div class="skill-hero-chips" aria-label="Heroes">
        {#each relatedHeroes as hero (hero.id)}
          <a href={`/heroes/${hero.slug}`}><img src={hero.image ?? ''} alt="" /><span>{hero.name}</span></a>
        {/each}
      </div>
    </section>

    <section class="skill-detail-facts" aria-label="Skill details">
      <h2 class="item-detail-section-title"><span>Details</span></h2>
      <div class="skill-stat-tiles">
        {#each facts as fact (fact.label)}
          <div class="skill-stat-tile" role="group" aria-label={`${fact.label}: ${fact.value}`}>
            <small>{fact.label}</small>
            <strong>{fact.value}</strong>
          </div>
        {/each}
      </div>

      {#if skill.kind === 'passiveSkill'}
        <section class="passive-scaling" aria-labelledby="passive-scaling-title">
          <h2 class="item-detail-section-title" id="passive-scaling-title"><span>Per-level scaling</span></h2>
          <p>Each point adds <b>{formatPassiveSkillValue(skill)}</b> to <strong>{statLabel}</strong>, up to <em>Lv{maxLevel}</em>.</p>
          <div class="passive-scaling-table-wrap">
            <table class="passive-scaling-table" aria-label={`${displayName} per-level scaling`}>
              <thead><tr><th>Lv</th><th>Total bonus</th></tr></thead>
              <tbody>
                {#each Array.from({ length: maxLevel }, (_, index) => index + 1) as level (level)}
                  <tr><td>{level}{#if level === maxLevel} <small>Max</small>{/if}</td><td>{formatPassiveSkillValue(skill, level)}</td></tr>
                {/each}
              </tbody>
            </table>
          </div>
        </section>
      {/if}
    </section>
  </div>
</article>
