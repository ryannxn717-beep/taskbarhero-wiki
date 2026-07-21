<script lang="ts">
  import {
    ACHIEVEMENTS,
    DATABASE_GROUPS,
    MECHANICS_ABILITY_GROUPS,
    MECHANICS_CRAFTING_SYSTEMS,
    MECHANICS_DELIVERY_TYPES,
    MECHANICS_ELEMENTS,
    MECHANICS_GEAR_TYPES,
    MECHANICS_MOD_SOURCES,
    MECHANICS_MOD_TYPES,
    MECHANICS_RARITIES,
    MECHANICS_STATS,
    MECHANICS_STATUS_EFFECTS,
    NEWS
  } from '$lib/content/reference-data';
  import type { ReferenceRouteModel } from '$lib/content/routes';

  type SortMode = 'default' | 'rarest' | 'common';
  type BuffKind = 'All' | 'Buff' | 'Debuff';
  type Phase5Section = 'buffs' | 'statusEffects' | 'statusEffectDetail' | 'pets';

  interface SourceRecord {
    id: string;
    slug?: string;
    name: string;
    image?: string | null;
    buffType?: string;
    durationSeconds?: number | null;
    source?: Record<string, unknown>;
  }

  interface Phase5Model {
    type: 'reference';
    path: string;
    title: string;
    section: Phase5Section;
    records?: readonly SourceRecord[];
    record?: SourceRecord;
  }

  interface PetFarmRow {
    stage: string;
    area: string;
    difficulty: string;
    rate: string;
  }

  interface PetPresentation {
    image: string;
    targetImage?: string;
    bonuses: readonly string[];
    unlock: string;
    target?: string;
    farms: readonly PetFarmRow[];
  }

  let { model }: { model: ReferenceRouteModel | Phase5Model } = $props();
  let achievementSort = $state<SortMode>('default');
  let achievementQuery = $state('');
  let buffKind = $state<BuffKind>('All');
  let buffQuery = $state('');

  const records = $derived('records' in model ? (model.records ?? []) : []);
  const detailRecord = $derived('record' in model ? model.record : undefined);

  const filteredAchievements = $derived.by(() => {
    const query = achievementQuery.trim().toLowerCase();
    const entries = ACHIEVEMENTS.filter((entry) =>
      !query || `${entry.title} ${entry.summary}`.toLowerCase().includes(query)
    );
    if (achievementSort === 'rarest') return [...entries].sort((a, b) => a.rate - b.rate || a.title.localeCompare(b.title));
    if (achievementSort === 'common') return [...entries].sort((a, b) => b.rate - a.rate || a.title.localeCompare(b.title));
    return entries;
  });

  const filteredBuffs = $derived.by(() => {
    const query = buffQuery.trim().toLowerCase();
    return records.filter((record) => {
      const kind = String(record.buffType ?? record.source?.BuffType ?? 'Buff');
      const stat = spacedWords(String(record.source?.STATTYPE ?? record.name.replace(/\s+(Buff|Debuff)$/i, '')));
      return (buffKind === 'All' || kind === buffKind) && (!query || stat.toLowerCase().includes(query));
    });
  });

  const statusColors: Readonly<Record<string, string>> = Object.freeze({
    chill: '#71dff6',
    freeze: '#2e8cff',
    ignite: '#ff9d00',
    shock: '#ffe43b',
    bleed: '#ff273c',
    stun: '#c51cff'
  });

  const statusDescriptions: Readonly<Record<string, string>> = Object.freeze({
    chill: 'Slows the target, reducing attack and movement speed. Builds toward Freeze.',
    freeze: 'Freezes the target and prevents it from acting for the duration.',
    ignite: 'Ignites the target and applies additional fire damage over time.',
    shock: 'Shocks the target and applies additional lightning damage.',
    bleed: 'Causes bleeding and applies additional physical damage over time.',
    stun: 'Stuns the target and interrupts its current action.'
  });

  const appliedBy: Readonly<Record<string, { name: string; slug: string }>> = Object.freeze({
    AttackSpeed: { name: 'Chill', slug: 'chill' },
    MovementSpeed: { name: 'Chill', slug: 'chill' },
    FireDamageAddition: { name: 'Ignite', slug: 'ignite' },
    LightningDamageAddition: { name: 'Shock', slug: 'shock' },
    PhysicalDamageAddition: { name: 'Bleed', slug: 'bleed' },
    DamageAddition: { name: 'Stun', slug: 'stun' }
  });

  const petPresentations: Readonly<Record<string, PetPresentation>> = Object.freeze({
    Bat: {
      image: '/game/content/monsters/BasicBat/BasicBat_Idle_character_0.png',
      targetImage: '/game/content/monsters/BasicBat/BasicBat_Idle_character_3.png',
      bonuses: ['10% Increased Common Chest Drop Chance Multiplier', '15% Increased Exp Gain'],
      unlock: 'Defeat 5,000 × Bat', target: 'Bat',
      farms: [
        { stage: 'A1–7', area: 'City Outskirts', difficulty: 'Torment', rate: '~204/run' },
        { stage: 'A1–8', area: 'Cemetery', difficulty: 'Torment', rate: '~172/run' },
        { stage: 'A1–7', area: 'City Outskirts', difficulty: 'Hell', rate: '~148/run' }
      ]
    },
    Watcher: {
      image: '/game/content/monsters/BeHolder/BeHolder_Idle_0.png',
      targetImage: '/game/content/monsters/GiantFly/GiantFly_Idle_character_4.png',
      bonuses: ['15% Increased Gold Per Kill'], unlock: 'Defeat 5,000 × Giant Fly', target: 'Giant Fly',
      farms: [
        { stage: 'A2–5', area: 'Scorching Dunes', difficulty: 'Torment', rate: '~228/run' },
        { stage: 'A2–5', area: 'Scorching Dunes', difficulty: 'Hell', rate: '~160/run' },
        { stage: 'A2–5', area: 'Scorching Dunes', difficulty: 'Nightmare', rate: '~114/run' }
      ]
    },
    'Burning Skeleton': {
      image: '/game/content/monsters/Skull/Skull_Idle_0.png',
      targetImage: '/game/content/monsters/FireElemental/FireElemental_Idle_character_2.png',
      bonuses: ['10% Increased Stage Boss Chest Drop Chance Multiplier'], unlock: 'Defeat 5,000 × Fire Elemental', target: 'Fire Elemental',
      farms: [
        { stage: 'A2–8', area: 'Sacred Tomb', difficulty: 'Torment', rate: '~120/run' },
        { stage: 'A2–9', area: "Pharaoh's Crypt", difficulty: 'Torment', rate: '~109/run' },
        { stage: 'A2–9', area: "Pharaoh's Crypt", difficulty: 'Hell', rate: '~80/run' }
      ]
    },
    'Blue Golem': {
      image: '/game/content/monsters/BlueGolem/BlueGolem_Idle_0.png',
      targetImage: '/game/content/monsters/FireGolem/FireGolem_Idle_character_2.png',
      bonuses: ['15% Increased Common Chest Drop Chance Multiplier'], unlock: 'Defeat 5,000 × Hell Golem', target: 'Hell Golem',
      farms: [
        { stage: 'A3–6', area: 'Burning Ravine', difficulty: 'Torment', rate: '~138/run' },
        { stage: 'A3–6', area: 'Burning Ravine', difficulty: 'Hell', rate: '~131/run' },
        { stage: 'A3–6', area: 'Burning Ravine', difficulty: 'Nightmare', rate: '~85/run' }
      ]
    },
    'Dark Spirit': {
      image: '/game/content/monsters/BlackSpirit/BlackSpirit_Idle_0.png',
      targetImage: '/game/content/monsters/Ghost/Ghost_Idle_character_2.png',
      bonuses: ['15% Increased Stage Boss Chest Drop Chance Multiplier'], unlock: 'Defeat 5,000 × Ghost', target: 'Ghost',
      farms: [
        { stage: 'A3–4', area: 'Frozen Glacier Cavern', difficulty: 'Torment', rate: '~135/run' },
        { stage: 'A3–4', area: 'Frozen Glacier Cavern', difficulty: 'Hell', rate: '~100/run' },
        { stage: 'A3–9', area: 'Core of the Abyss', difficulty: 'Torment', rate: '~88/run' }
      ]
    },
    Sword: { image: '/game/content/gear/sword/SWORD_300001.png', bonuses: ['15% Increased Exp Gain'], unlock: 'Purchase the Supporter Pack ↗', farms: [] },
    Butterfly: { image: '/game/content/monsters/Butterfly/Butterfly_Idle_3.png', bonuses: ['10% Increased Gold Per Kill'], unlock: 'Purchase the Supporter Pack ↗', farms: [] },
    Dragon: { image: '/game/content/monsters/DragonHatchling/DragonHatchling_Idle_character_0.png', bonuses: ['20% Increased Common Chest Drop Chance Multiplier', '15% Increased Gold Per Kill', '20% Increased Exp Gain'], unlock: 'Purchase the Supporter Pack ↗', farms: [] }
  });

  function spacedWords(value: string): string {
    return value.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim();
  }

  function titleWords(value: unknown): string {
    const text = spacedWords(String(value ?? ''));
    return text ? `${text.slice(0, 1).toUpperCase()}${text.slice(1).toLowerCase()}` : '—';
  }

  function buffStat(record: SourceRecord): string {
    return spacedWords(String(record.source?.STATTYPE ?? record.name.replace(/\s+(Buff|Debuff)$/i, '')));
  }

  function buffValue(source: Record<string, unknown> | undefined): string {
    const value = source?.Value;
    if (typeof value !== 'number') return '—';
    const modifier = String(source?.MODTYPE ?? 'FLAT').toUpperCase();
    return modifier === 'FLAT' ? `+${value.toLocaleString('en-US')}` : `+${value / 10}%`;
  }

  function statusBuffs(record: SourceRecord | undefined): readonly Record<string, unknown>[] {
    return Array.isArray(record?.source?.buffs) ? record.source.buffs as readonly Record<string, unknown>[] : [];
  }

  function duration(record: SourceRecord | undefined): string {
    return `${Number(record?.durationSeconds ?? 0).toFixed(1)}s`;
  }

  function petPresentation(record: SourceRecord): PetPresentation {
    return petPresentations[record.name] ?? {
      image: record.image ?? '', bonuses: ['Passive companion bonus'], unlock: 'Purchase the Supporter Pack ↗', farms: []
    };
  }
</script>

{#if model.section === 'buffs'}
  <section class="source-reference-page buffs-page">
    <header class="source-reference-header"><h1>Buffs &amp; Debuffs</h1><p>29 stat modifiers applied by skills and status effects.</p></header>
    <div class="source-filter-toolbar">
      <div class="source-filter-buttons" aria-label="Buff kind">
        {#each ['All', 'Buff', 'Debuff'] as kind}
          <button type="button" class:active={buffKind === kind} aria-pressed={buffKind === kind} onclick={() => (buffKind = kind as BuffKind)}>{kind}</button>
        {/each}
      </div>
      <label><span class="sr-only">Filter by stat</span><input type="search" aria-label="Filter by stat" bind:value={buffQuery} placeholder="Filter by stat.." /></label>
    </div>
    <div class="source-table-wrap buffs-table-wrap">
      <table class="source-table buffs-table" aria-label="Buffs and debuffs">
        <thead><tr><th>Stat</th><th>Kind</th><th>Modifier</th><th>Value</th><th>Applied by</th></tr></thead>
        <tbody>{#each filteredBuffs as record (record.id)}
          {@const statKey = String(record.source?.STATTYPE ?? '')}
          {@const kind = String(record.buffType ?? record.source?.BuffType ?? 'Buff')}
          <tr><td>{buffStat(record)}</td><td class:source-buff={kind === 'Buff'} class:source-debuff={kind === 'Debuff'}>{kind}</td><td>{titleWords(record.source?.MODTYPE)}</td><td>{buffValue(record.source)}</td><td>{#if appliedBy[statKey] && kind === 'Debuff'}<a href={`/status-effects/${appliedBy[statKey].slug}`}>{appliedBy[statKey].name}</a>{:else}<span>—</span>{/if}</td></tr>
        {/each}</tbody>
      </table>
    </div>
  </section>
{:else if model.section === 'statusEffects'}
  <section class="source-reference-page status-index-page">
    <header class="source-reference-header"><h1>Status Effects</h1><p>The 6 elemental ailments enemies and heroes can inflict.</p></header>
    <div class="source-status-grid">
      {#each records as record (record.id)}
        {@const key = record.slug ?? record.name.toLowerCase()}
        <a href={`/status-effects/${key}`} class="source-status-card" style={`--status-color:${statusColors[key] ?? '#ffbd3b'}`} data-testid="status-effect-card">
          <h2>{record.name}</h2><small>Duration {duration(record)}</small>
          {#if statusBuffs(record).length}<div><span>Applies</span>{#each statusBuffs(record) as buff}<p><b>{spacedWords(String(buff.STATTYPE ?? ''))}</b><strong>{buffValue(buff)}</strong></p>{/each}</div>{/if}
        </a>
      {/each}
    </div>
  </section>
{:else if model.section === 'statusEffectDetail' && detailRecord}
  <article class="source-status-detail" style={`--status-color:${statusColors[detailRecord.slug ?? ''] ?? '#71dff6'}`}>
    <a class="detail-back" href="/status-effects">← Status Effects</a>
    <div class="source-status-detail-grid">
      <section class="source-status-identity"><h1>{detailRecord.name}</h1><p>{duration(detailRecord)} <span>|</span> Init Duration</p></section>
      <section class="source-status-facts">
        <p class="source-status-description">{statusDescriptions[detailRecord.slug ?? ''] ?? detailRecord.name}</p>
        <h2 class="source-section-title">Parameters</h2>
        <div class="source-status-duration"><small>Duration</small><strong>{duration(detailRecord)}</strong></div>
        <h2 class="source-section-title">Stat effects applied</h2>
        <div class="source-table-wrap"><table class="source-table status-applied-table" aria-label="Stat effects applied"><thead><tr><th>Stat</th><th>Kind</th><th>Modifier</th><th>Value</th></tr></thead><tbody>{#each statusBuffs(detailRecord) as buff}<tr><td>{spacedWords(String(buff.STATTYPE ?? ''))}</td><td class="source-debuff">{titleWords(buff.BuffType ?? 'Debuff')}</td><td>{titleWords(buff.MODTYPE)}</td><td>{buffValue(buff)}</td></tr>{/each}</tbody></table></div>
      </section>
    </div>
  </article>
{:else if model.section === 'pets'}
  <section class="source-reference-page pets-page">
    <header class="source-reference-header"><h1>Pets</h1><p>8 companions and their passive bonuses.</p></header>
    <div class="source-pet-grid">
      {#each records as record (record.id)}
        {@const presentation = petPresentation(record)}
        <article class="source-pet-card" data-testid="pet-card" aria-label={record.name}>
          <div class="source-pet-card-inner" data-testid={`pet-card-${record.slug ?? record.name.toLowerCase().replace(/\s+/g, '-')}`}>
            <header><img src={presentation.image} alt="" /><h2>{record.name}</h2></header>
            <section><small>Bonus</small>{#each presentation.bonuses as bonus}<p class="pet-bonus">{@html bonus.replace(/^(\d+%)/, '<strong>$1</strong>')}</p>{/each}</section>
            <section><small>Unlock</small><p class="pet-unlock">{#if presentation.targetImage}<img src={presentation.targetImage} alt={`${presentation.target ?? record.name} unlock target`} />{/if}<span>{presentation.unlock}</span></p></section>
            {#if presentation.farms.length}<section><small>Best farm</small><div class="pet-farm-list">{#each presentation.farms as farm}<div data-testid="pet-farm-row"><b>{farm.stage}</b><span>{farm.area}</span><small>{farm.difficulty}</small><strong>{farm.rate}</strong></div>{/each}</div></section>{/if}
          </div>
        </article>
      {/each}
    </div>
  </section>
{:else if model.section === 'mechanics'}
  <article class="source-reference-page mechanics-page">
    <header class="source-reference-header mechanics-header"><span>Reference</span><h1>Game Mechanics</h1><p>The full stat, damage, and ability model recovered from the game code and enums.</p></header>
    <div class="mechanics-sections">
      <section class="mechanics-source-section">
        <h2>How stats stack</h2>
        <div class="mechanics-source-panel">
          <p>Every stat is built from modifiers in three layers, which is why the same effect can be flat, additive, or multiplicative. See <a href="/buffs">Buffs</a>.</p>
          <code>final = (base + Σ Flat) × (1 + Σ Additive) × Π (1 + each Multiplicative)</code>
          <p>Flat: added straight to the base value.</p>
          <p>Additive: all summed together, then applied once as (1 + sum).</p>
          <p>Multiplicative: each modifier applies on its own, so they compound.</p>
          <p>Modifiers come from 8 sources, layered in order: Base, Item, Attribute, Passive, Account Status (runes), Status Effect, Buff Skill, Environment.</p>
        </div>
      </section>

      <section class="mechanics-source-section">
        <h2>Damage &amp; critical hits</h2>
        <div class="mechanics-source-panel">
          <p>Each hit deals your Attack Damage, then rolls for a critical:</p>
          <code>roll r ∈ [0,1) | if r &lt; CritChance → damage ×= CritDamage</code>
          <p>Crit Damage is a direct multiplier. Over many hits your effective DPS is:</p>
          <code>DPS = AttackSpeed × AttackDamage × (1 + CritChance × (CritDamage − 1))</code>
          <p>Final damage is then scaled by delivery type. Melee, projectile, area, and summon damage each have their own increase stat.</p>
          <p class="mechanics-note">Crit Chance and Attack Speed have no hard cap in the engine; cooldown reduction, resistances, dodge, and block are capped.</p>
        </div>
      </section>

      <section class="mechanics-source-section">
        <h2>Taking damage: mitigation order</h2>
        <div class="mechanics-source-panel">
          <p>Incoming damage runs through this pipeline, in order:</p>
          <ol class="mechanics-list">
            <li><b>Dodge and Elemental Dodge:</b> chance to take 0 damage.</li>
            <li><b>Block and Elemental Block:</b> on success, take half damage.</li>
            <li><b>Resistance:</b> reduces elemental damage by resist%. Negative resistance increases damage taken.</li>
            <li><b>Armor:</b> physical mitigation with diminishing returns, scaled by hit size and stage level.</li>
            <li><b>Damage Reduction:</b> multiplies by (1 - value).</li>
            <li><b>Damage Absorption:</b> subtracts a flat amount.</li>
            <li><b>Floor:</b> every hit deals at least 1 damage.</li>
          </ol>
        </div>
      </section>

      <section class="mechanics-source-section">
        <h2>Armor: the physical mitigation formula</h2>
        <div class="mechanics-source-panel">
          <p>Armor only reduces physical damage. Fire, cold, lightning, and chaos use resistances instead. The simple mental model:</p>
          <code>Reduction ≈ Armor / (Armor + 14 × StageLevel + 12) — capped at 75%</code>
          <p>It is a diminishing-returns curve against a threshold that rises with the stage. The exact code form also lets big hits pierce armor:</p>
          <code>Reduction = Armor² / ( Armor² + (14·StageLevel + 12) × (Armor + 0.4·Damage) )</code>
          <code>damage taken = Damage × (1 − Reduction)</code>
          <ul class="mechanics-list">
            <li>50% reduction when your Armor equals 14 × StageLevel + 12.</li>
            <li>Hard cap 75%, reached around 3× that threshold; beyond it extra armor is wasted.</li>
            <li>The threshold grows by +14 per stage level, so armor must keep scaling.</li>
            <li>Big hits partially pierce armor: 0.4 × Damage is added to the threshold.</li>
          </ul>
          <p class="mechanics-note">Recovered from Unit.gnl to ug.jir in the decompiled game code; constants verified from the binary.</p>
        </div>
      </section>

      <section class="mechanics-source-section">
        <h2>Elemental resistance: how it really works</h2>
        <div class="mechanics-source-panel">
          <p>Resistance is linear, unlike armor. Effective resistance is the element resistance plus All-Elemental Resistance, then it scales damage:</p>
          <code>effRes = ElementResist + AllElementalResist (capped by Max &lt;Element&gt; Resistance)</code>
          <code>damage taken = Damage × (1 − effRes / 100)</code>
          <ul class="mechanics-list">
            <li>1 point of resistance means 1% less damage of that element; the divisor is 100, not 1000.</li>
            <li>There is no built-in cap. The only ceiling is the Max Fire/Cold/Lightning/Chaos Resistance stat.</li>
            <li>Negative resistance hurts. If your net resistance drops below 0, damage is multiplied by (1 + abs(res)/100).</li>
            <li>Resistance applies before generic Damage Reduction and flat Damage Absorption, and it does not affect physical damage. See <a href="/runes">Runes</a>.</li>
          </ul>
          <p class="mechanics-note">Recovered from Unit.gnl to ug.jiq / ug.jio / ug.jip; resistance divisor 100 verified from the binary.</p>
        </div>
      </section>

      <section class="mechanics-source-section">
        <h2>Progression &amp; idle economy</h2>
        <div class="mechanics-card-grid">
          <div class="mechanics-source-card"><small>Offline reward</small><p>Accrues at most 8 hours (28,800 s) of rewards, no matter how long you are away.</p><p>Being away about 30 days or more, a clock-tamper guard, gives 0.</p><p>Each Offline Reward Gold/EXP rune adds +10%, stacking additively.</p><p>Offline level-ups use the same XP table as online play.</p></div>
          <div class="mechanics-source-card"><small>Drop chance &amp; levels</small><p>A stage drop rate is a probability on a /1000 scale: 160 means 16%.</p><p>Drop Chance runes add a flat bonus; Percent runes multiply it.</p><p>Player level is a fixed table from 1 to 100. Level 100 needs 1,997,771,834 XP; there is no prestige or rebirth system.</p></div>
        </div>
      </section>

      <section class="mechanics-source-section">
        <h2>Skills &amp; the Cube: less-obvious rules</h2>
        <div class="mechanics-card-grid">
          <div class="mechanics-source-card"><small>Skill activation</small><p>Aura skills activate immediately when equipped.</p><p>Base-attack skills fire faster with Attack Speed.</p><p>Cooldown skills recharge faster with Cast Speed.</p></div>
          <div class="mechanics-source-card"><small>Cube level gates</small><p>Immortal synthesis unlocks at Cube Lv10.</p><p>Celestial synthesis unlocks at Cube Lv50.</p><p>The Cube runs 8 operations; see <a href="/crafting">Crafting</a>.</p></div>
        </div>
      </section>

      <section class="mechanics-source-section">
        <h2>Hidden stacking stats</h2>
        <div class="mechanics-source-panel">
          <p>The code defines stacking-buff stats that never surface in any in-game table. Each has MaxStack and StackChance:</p>
          <div class="mechanics-outline-chips">{#each ['Courage', 'Feral', 'Focus', 'Toughness'] as stat}<span>{stat}</span>{/each}</div>
        </div>
      </section>

      <section class="mechanics-source-section">
        <h2>Stat modifier model</h2>
        <div class="mechanics-card-grid">
          <div class="mechanics-source-card"><small>Mod types (stacking layers)</small><div class="mechanics-solid-chips">{#each MECHANICS_MOD_TYPES as type}<span>{type}</span>{/each}</div></div>
          <div class="mechanics-source-card"><small>Mod sources (8)</small><div class="mechanics-solid-chips">{#each MECHANICS_MOD_SOURCES as source}<span>{source}</span>{/each}</div></div>
        </div>
      </section>

      <section class="mechanics-source-section">
        <h2>Damage model</h2>
        <div class="mechanics-card-grid">
          <div class="mechanics-source-card"><small>Delivery types</small><div class="mechanics-solid-chips">{#each MECHANICS_DELIVERY_TYPES as type}<span>{type}</span>{/each}</div></div>
          <div class="mechanics-source-card"><small>Elements</small><div class="mechanics-solid-chips">{#each MECHANICS_ELEMENTS as element}<span>{element}</span>{/each}</div></div>
        </div>
      </section>

      <section class="mechanics-source-section">
        <h2>Status Effects</h2>
        <div class="mechanics-link-chips">{#each MECHANICS_STATUS_EFFECTS as effect}<a href={`/status-effects/${effect.toLowerCase()}`}>{effect}</a>{/each}</div>
      </section>

      <section class="mechanics-source-section">
        <h2>All stats (63)</h2>
        <div class="mechanics-stat-cloud">{#each MECHANICS_STATS as stat}<span data-testid="mechanics-stat-chip">{stat}</span>{/each}</div>
      </section>

      <div class="mechanics-card-grid mechanics-reference-grid">
        <div class="mechanics-source-card"><small>Gear types (20)</small><div class="mechanics-solid-chips">{#each MECHANICS_GEAR_TYPES as type}<span>{type}</span>{/each}</div></div>
        <div class="mechanics-source-card"><small>Crafting systems</small><div class="mechanics-solid-chips">{#each MECHANICS_CRAFTING_SYSTEMS as system}<a href="/crafting">{system}</a>{/each}</div></div>
      </div>

      <section class="mechanics-source-section">
        <h2>Rarity ladder</h2>
        <div class="mechanics-rarity-ladder">{#each MECHANICS_RARITIES as rarity}<div data-testid="mechanics-rarity" style={`--rarity-color:${rarity.color}`}><span></span><b>{rarity.name}</b></div>{/each}</div>
      </section>

      <section class="mechanics-source-section">
        <h2>Ability roster (from decompiled combat classes)</h2>
        <div class="mechanics-ability-grid">{#each MECHANICS_ABILITY_GROUPS as group}<section data-testid="mechanics-ability-group"><h3>{group.name} <span>({group.abilities.length})</span></h3><div>{#each group.abilities as ability}<p>{ability}</p>{/each}</div></section>{/each}</div>
      </section>
    </div>
  </article>
{:else if model.section === 'achievements'}
  <section class="source-reference-page achievements-page">
    <header class="source-reference-header"><h1>Achievements</h1><p>56 Steam achievements with live global unlock rates.</p></header>
    <div class="achievement-toolbar source-achievement-toolbar"><div class="view-switch" aria-label="Achievement order"><button type="button" class:active={achievementSort === 'default'} aria-pressed={achievementSort === 'default'} onclick={() => (achievementSort = 'default')}>Default</button><button type="button" class:active={achievementSort === 'rarest'} aria-pressed={achievementSort === 'rarest'} onclick={() => (achievementSort = 'rarest')}>Rarest</button><button type="button" class:active={achievementSort === 'common'} aria-pressed={achievementSort === 'common'} onclick={() => (achievementSort = 'common')}>Most common</button></div><label><span class="sr-only">Filter achievements</span><input type="search" aria-label="Filter achievements" bind:value={achievementQuery} placeholder="Filter achievements.." /></label></div>
    <ul class="achievement-grid" aria-label="Achievements">{#each filteredAchievements as achievement (achievement.id)}<li id={achievement.id} class="achievement-card"><img src={achievement.icon} alt={achievement.title} /><div><h2>{achievement.title}</h2><p>{achievement.summary}</p><div class="achievement-rate"><span style={`width:${achievement.rate}%`}></span></div><strong>{achievement.rate.toFixed(1)}%</strong></div></li>{/each}</ul>
  </section>
{:else if model.section === 'news'}
  <section class="source-reference-page news-page">
    <header class="source-reference-header"><h1>News</h1><p>Patch notes and announcements, pulled from the game Steam page.</p></header>
    <ul class="news-list" aria-label="News articles">{#each NEWS as article (article.id)}<li id={article.id}><a href={`/news/${article.id}`}><img class="news-thumbnail" data-testid="news-thumbnail" src="/game/content/news/header.jpg" alt="" /><div class="news-copy"><div class="news-meta"><span>{article.category}</span><time>{article.date}</time><small>| {article.author}</small></div><h2>{article.title}</h2><p>{article.summary}</p><strong>Read more →</strong></div></a></li>{/each}</ul>
  </section>
{:else}
  <section class="source-reference-page database-directory-page">
    <header class="source-reference-header"><h1>Database</h1><p>Every table extracted from the game - 45 datasets, 14,637 rows, all browsable.</p></header>
    <div class="database-groups">{#each DATABASE_GROUPS as group (group.title)}<section><h2>{group.title}</h2><div class="dataset-links">{#each group.datasets as dataset (`${group.title}:${dataset.label}`)}<a id={dataset.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')} href={dataset.href} aria-label={`${dataset.label} ${dataset.count.toLocaleString('en-US')}`}><span>{dataset.label}</span><strong>{dataset.count.toLocaleString('en-US')}</strong></a>{/each}</div></section>{/each}</div>
  </section>
{/if}
