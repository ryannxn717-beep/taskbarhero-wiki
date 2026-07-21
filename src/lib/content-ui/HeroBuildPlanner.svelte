<script lang="ts">
  import { untrack } from 'svelte';
  import type { HeroRecord, SkillRecord } from '$lib/content/schema';

  type Attribute = Record<string, unknown>;

  let {
    hero,
    skills = [],
    level = 1
  }: {
    hero: HeroRecord;
    skills?: readonly SkillRecord[];
    level?: number;
  } = $props();
  let selectedLevel = $state(untrack(() => level));
  let allocations = $state<Record<string, number>>(untrack(() => greedyAllocations(level)));
  const tiers = $derived.by(() => {
    const grouped = new Map<number, Attribute[]>();
    for (const attribute of hero.attributes as Attribute[]) {
      const requirement = requirementOf(attribute);
      grouped.set(requirement, [...(grouped.get(requirement) ?? []), attribute]);
    }
    return [...grouped.entries()]
      .sort(([left], [right]) => left - right)
      .map(([requirement, attributes], index) => ({ number: index + 1, requirement, attributes }));
  });
  const budget = $derived(Math.max(1, Math.floor(selectedLevel)));
  const spent = $derived(Object.values(allocations).reduce((total, value) => total + value, 0));
  const available = $derived(budget - spent);

  function keyOf(attribute: Attribute): string {
    return String(attribute.key ?? 'unknown');
  }

  function maxOf(attribute: Attribute): number {
    const value = Number(attribute.maxLevel);
    return Number.isFinite(value) ? Math.max(1, value) : 1;
  }

  function requirementOf(attribute: Attribute): number {
    const value = Number(attribute.groupReq);
    return Number.isFinite(value) ? Math.max(0, value) : 0;
  }

  function nameOf(attribute: Attribute): string {
    const passive = attribute.passive as Record<string, unknown> | undefined;
    const active = attribute.activeSkill as Record<string, unknown> | undefined;
    return String(passive?.name_i18n ?? active?.name_i18n ?? `Attribute ${keyOf(attribute)}`);
  }

  function typeOf(attribute: Attribute): string {
    return String(attribute.type) === 'ACTIVESKILL' ? 'Active' : 'Passive';
  }

  function iconOf(attribute: Attribute): string {
    const passive = attribute.passive as Record<string, unknown> | undefined;
    const active = attribute.activeSkill as Record<string, unknown> | undefined;
    if (active?.key) return `/game/skills/Skill_${active.key}.png`;
    return `/game/skills/Passive_${String(passive?.stat ?? 'AttackDamage')}.png`;
  }

  function valueOf(attribute: Attribute): string {
    const passive = attribute.passive as Record<string, unknown> | undefined;
    const active = attribute.activeSkill as Record<string, unknown> | undefined;
    const allocated = allocations[keyOf(attribute)] ?? 0;
    if (active?.key) {
      const skill = skills.find((entry) => entry.id === String(active.key));
      const levels = Array.isArray(skill?.source.levels)
        ? skill.source.levels as Record<string, unknown>[]
        : [];
      const current = levels.find((entry) => Number(entry.level) === allocated);
      const value = Number(current?.value);
      return Number.isFinite(value) ? value.toLocaleString('en-US') : '';
    }
    const raw = String(passive?.value ?? '');
    const match = raw.match(/^([+-]?)(\d+(?:\.\d+)?)(.*)$/);
    if (!match) return raw;
    const total = Number(match[2]) * allocated;
    return `${match[1]}${Number.isInteger(total) ? total : total.toFixed(1)}${match[3]}`;
  }

  function greedyAllocations(pointBudget: number): Record<string, number> {
    const next: Record<string, number> = {};
    let assigned = 0;
    for (const attribute of hero.attributes as Attribute[]) {
      if (assigned < requirementOf(attribute)) continue;
      const amount = Math.min(maxOf(attribute), Math.max(0, pointBudget - assigned));
      if (amount > 0) next[keyOf(attribute)] = amount;
      assigned += amount;
      if (assigned >= pointBudget) break;
    }
    return next;
  }

  function add(attribute: Attribute) {
    const key = keyOf(attribute);
    const current = allocations[key] ?? 0;
    if (available <= 0 || spent < requirementOf(attribute) || current >= maxOf(attribute)) return;
    allocations[key] = current + 1;
  }

  function subtract(attribute: Attribute) {
    const key = keyOf(attribute);
    allocations[key] = Math.max(0, (allocations[key] ?? 0) - 1);
  }

  function maxOut() {
    allocations = greedyAllocations(budget);
  }

  function reset() {
    allocations = {};
  }

  function setLevel(value: number) {
    selectedLevel = Math.min(100, Math.max(1, Math.floor(value)));
    allocations = greedyAllocations(selectedLevel);
  }
</script>

<section class="build-planner" aria-label="Build planner">
  <header class="planner-header">
    <div class="planner-level-value">
      <small>Hero level</small>
      <strong>{selectedLevel}</strong>
    </div>
    <label class="planner-level">
      <span class="sr-only">Level</span>
      <input type="range" min="1" max="100" value={selectedLevel} aria-label="Hero level" oninput={(event) => setLevel(Number(event.currentTarget.value))} />
    </label>
    <div class="planner-points">
      <small>Skill points</small>
      <strong>{spent}<span>/{budget}</span></strong>
    </div>
    <div class="planner-progress" aria-hidden="true"><span style={`width:${Math.min(100, (spent / budget) * 100)}%`}></span></div>
    <div class="planner-actions">
      <button class="wiki-button" type="button" onclick={maxOut}>Max Out</button>
      <button class="wiki-button" type="button" aria-label="Reset build" onclick={reset}>Reset</button>
    </div>
    <p>1 point per level | tiers unlock as you spend</p>
    <span class="sr-only">{available} points available</span>
  </header>

  <div class="planner-tiers">
    {#each tiers as tier}
      <section class="planner-tier" class:locked={spent < tier.requirement} aria-label={`Tier ${tier.number}`}>
        <header>
          <b>TIER {tier.number}</b>
          <span>{tier.requirement === 0 ? 'available from start' : `${tier.requirement} points to unlock`}</span>
          {#if spent < tier.requirement}<strong>LOCKED</strong>{/if}
        </header>
        <div>
          {#each tier.attributes as attribute (keyOf(attribute))}
            <article
              class="planner-skill"
              class:locked={spent < requirementOf(attribute)}
              class:complete={(allocations[keyOf(attribute)] ?? 0) === maxOf(attribute)}
              class:active-skill={typeOf(attribute) === 'Active'}
            >
              <img src={iconOf(attribute)} alt={nameOf(attribute)} />
              <div class="planner-skill-copy">
                <h3>{nameOf(attribute)}</h3>
                <small>{typeOf(attribute)} | Max Lv{maxOf(attribute)}</small>
              </div>
              <div class="planner-stepper">
                <button type="button" aria-label={`Decrease ${nameOf(attribute)}`} disabled={(allocations[keyOf(attribute)] ?? 0) === 0} onclick={() => subtract(attribute)}>−</button>
                <output>{allocations[keyOf(attribute)] ?? 0} / {maxOf(attribute)}</output>
                <button
                  type="button"
                  aria-label={`Increase ${nameOf(attribute)}`}
                  disabled={spent < requirementOf(attribute) || available === 0 || (allocations[keyOf(attribute)] ?? 0) >= maxOf(attribute)}
                  onclick={() => add(attribute)}
                >+</button>
              </div>
              {#if valueOf(attribute)}<strong class="planner-skill-value">{valueOf(attribute)}</strong>{/if}
            </article>
          {/each}
        </div>
      </section>
    {/each}
  </div>
</section>
