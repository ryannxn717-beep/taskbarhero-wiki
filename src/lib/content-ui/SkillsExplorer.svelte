<script lang="ts">
  import type { ContentRecord, HeroRecord, PassiveSkillRecord, SkillRecord } from '$lib/content/schema';
  import {
    isNamedActiveSkill,
    formatPassiveSkillValue,
    skillActivationLabel,
    skillAttributeMaxLevel,
    skillDisplayName,
    skillHeroes,
    skillIcon,
    skillStatLabel,
    skillTitleCase,
    type SkillEntry
  } from '$lib/content/skill-view';

  type Mode = 'active' | 'passive';

  let {
    skills,
    heroes,
    hrefFor
  }: {
    skills: readonly SkillEntry[];
    heroes: readonly HeroRecord[];
    hrefFor: (record: ContentRecord) => string;
  } = $props();

  let mode = $state<Mode>('active');
  let heroId = $state('all');
  let namedOnly = $state(true);
  let query = $state('');

  const namedActiveCount = $derived(skills.filter(isNamedActiveSkill).length);
  const passiveCount = $derived(skills.filter((skill) => skill.kind === 'passiveSkill').length);
  const filtered = $derived(skills.filter((skill) => {
    if (mode === 'active' && skill.kind !== 'skill') return false;
    if (mode === 'passive' && skill.kind !== 'passiveSkill') return false;
    if (heroId !== 'all' && !skill.heroIds.includes(heroId)) return false;
    if (mode === 'active' && namedOnly && !isNamedActiveSkill(skill)) return false;
    if (query.trim() && !skillDisplayName(skill).toLowerCase().includes(query.trim().toLowerCase())) return false;
    return true;
  }));

  function firstHero(skill: SkillEntry): HeroRecord | null {
    return skillHeroes(skill, heroes)[0] ?? null;
  }

  function passiveStat(skill: PassiveSkillRecord): string {
    return skillStatLabel(skill.source.STATTYPE ?? skill.stats[0]?.label);
  }
</script>

<section class="skills-explorer" aria-label="Skills database">
  <header class="skills-index-header">
    <span class="skills-eyebrow">Combat</span>
    <h1>Skills</h1>
    <p>{namedActiveCount} active skills &amp; {passiveCount} passive bonuses - unlocked through each hero’s attribute tree.</p>
  </header>

  <div class="skills-mode" aria-label="Skill type">
    <button type="button" class:active={mode === 'active'} aria-pressed={mode === 'active'} onclick={() => (mode = 'active')}>Active skills</button>
    <button type="button" class:active={mode === 'passive'} aria-pressed={mode === 'passive'} onclick={() => (mode = 'passive')}>Passive skills</button>
  </div>

  <div class="skills-filters">
    <div class="skills-hero-filters" aria-label="Hero filters">
      <button type="button" class:active={heroId === 'all'} aria-pressed={heroId === 'all'} onclick={() => (heroId = 'all')}>All heroes</button>
      {#each heroes as hero (hero.id)}
        <button type="button" class:active={heroId === hero.id} aria-label={hero.name} aria-pressed={heroId === hero.id} onclick={() => (heroId = hero.id)}>
          <img src={hero.image ?? ''} alt={hero.name} /><span>{hero.name}</span>
        </button>
      {/each}
    </div>
    <button type="button" class="skills-named-filter" class:active={namedOnly} aria-pressed={namedOnly} onclick={() => (namedOnly = !namedOnly)}>Named only</button>
    <label class="skills-search"><span class="sr-only">Skill name</span><input type="search" aria-label="Skill name" bind:value={query} placeholder="Filter by name.." /></label>
  </div>

  <p class="skills-count" role="status" aria-label="Skill result count">{filtered.length} skills</p>

  <div class="skills-table-wrap" role="region" aria-label="Skills table">
    <table class="skills-table">
      <caption>Skills</caption>
      {#if mode === 'active'}
        <thead><tr><th>Name</th><th>Hero</th><th>Activation</th><th>Element</th><th>Range</th><th>Max Lv</th></tr></thead>
        <tbody>
          {#each filtered as entry (entry.kind + entry.id)}
            {@const skill = entry as SkillRecord}
            {@const hero = firstHero(skill)}
            {@const icon = skillIcon(skill)}
            <tr>
              <td><a class="skills-name-link" href={hrefFor(skill)}>{#if icon}<img src={icon} alt="" />{/if}<span>{skillDisplayName(skill)}</span></a></td>
              <td>{#if hero}<a class="skills-hero-link" href={`/heroes/${hero.slug}`}><img src={hero.image ?? ''} alt="" /><span>{hero.name}</span></a>{:else}—{/if}</td>
              <td>{skillActivationLabel(skill)}</td>
              <td>{skillTitleCase(skill.source.DamageType ?? skill.element)}</td>
              <td class="skills-numeric">{skill.range}</td>
              <td class="skills-numeric">{skillAttributeMaxLevel(skill, heroes)}</td>
            </tr>
          {/each}
        </tbody>
      {:else}
        <thead><tr><th>Name</th><th>Hero</th><th>Stat</th><th class="skills-numeric">Per level</th><th class="skills-numeric">Max Lv</th><th class="skills-numeric">At max</th></tr></thead>
        <tbody>
          {#each filtered as entry (entry.kind + entry.id)}
            {@const skill = entry as PassiveSkillRecord}
            {@const hero = firstHero(skill)}
            {@const icon = skillIcon(skill)}
            {@const maxLevel = skillAttributeMaxLevel(skill, heroes)}
            <tr>
              <td><a class="skills-name-link" href={hrefFor(skill)}>{#if icon}<img class="passive-skill-icon" src={icon} alt="" />{/if}<span>{skillDisplayName(skill)}</span></a></td>
              <td>{#if hero}<a class="skills-hero-link" href={`/heroes/${hero.slug}`}><img src={hero.image ?? ''} alt="" /><span>{hero.name}</span></a>{:else}—{/if}</td>
              <td>{passiveStat(skill)}</td>
              <td class="skills-numeric skills-passive-per-level">{formatPassiveSkillValue(skill)}</td>
              <td class="skills-numeric">{maxLevel}</td>
              <td class="skills-numeric skills-passive-at-max">{formatPassiveSkillValue(skill, maxLevel)}</td>
            </tr>
          {/each}
        </tbody>
      {/if}
    </table>
  </div>
</section>
