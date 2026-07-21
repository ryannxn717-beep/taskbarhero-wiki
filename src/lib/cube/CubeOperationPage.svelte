<script lang="ts">
  import {
    craftingTiers,
    cubeOperations,
    enchantmentOperations,
    extractionCosts,
    gradeGoldAndExp,
    offeringCoins,
    synthesisOdds,
    type CubeGrade,
    type CubeOperationSlug
  } from './data';
  import './cube.css';

  let { slug }: { slug: CubeOperationSlug } = $props();
  const operation = $derived(cubeOperations.find((entry) => entry.slug === slug)!);
  const enchantment = $derived(enchantmentOperations.find((entry) => entry.slug === slug));
  const gearSlots = ['Main weapon', 'Sub weapon', 'Helmet', 'Armor', 'Gloves', 'Boots', 'Accessory'] as const;
  const slotIcons = [
    'Slot_Gear_MainWeapon_Active.png', 'Slot_Gear_SubWeapon_Active.png', 'Slot_Gear_Helmet_Active.png',
    'Slot_Gear_Armor_Active.png', 'Slot_Gear_Gloves_Active.png', 'Slot_Gear_Boots_Active.png',
    'Slot_Gear_Amulet_Active.png'
  ] as const;
  const craftingMaterials = ['Item_140003.png', 'Item_140004.png', 'Item_141002.png', 'Item_142002.png', 'Item_143002.png', 'Item_144002.png', 'Item_145002.png', 'Item_145002.png'] as const;
  const possibleItems = [72, 84, 96, 108, 120, 132, 144, 156] as const;
  const allGrades: readonly CubeGrade[] = ['Common', 'Uncommon', 'Rare', 'Legendary', 'Immortal', 'Arcana', 'Beyond', 'Celestial', 'Divine', 'Cosmic'];
  let selectedGearSlot = $state<(typeof gearSlots)[number]>('Main weapon');
  const formatNumber = (value: number) => value.toLocaleString('en-US');
  const gradeClass = (grade: CubeGrade) => `grade-${grade.toLowerCase()}`;
  const gradeHref = (grade: CubeGrade) => `/grades#${grade.toLowerCase()}`;
  const costIcon = '/game/ui/Icon_Gold.png';

  const sourceLead: Record<Exclude<CubeOperationSlug, 'crafting' | 'offering'>, string> = {
    synthesis: 'Synthesize 9 items of the same grade into one of a higher grade.',
    alchemy: 'Convert any item into gold. - Materials : Any 1~9 items - Result : Items consumed, gold obtained',
    decoration: 'Grants special stats to equipment. - Materials : Equipment with a Decoration slot x1 + Decoration Material x1 - Result : Random stat based on material',
    engraving: 'Grants special stats to equipment. - Materials : Equipment with an Engraving slot x1 + Engraving Material x1 - Result : Random stat based on material',
    inscription: 'Grants special stats to equipment. - Materials : Equipment with an Inscription slot x1 + Inscription Material x1 - Result : Random stat based on material',
    extraction: 'Removes stats applied to equipment. ※ Materials used to grant stats will not be returned.'
  };

  const sourceIntro: Record<Exclude<CubeOperationSlug, 'crafting' | 'offering'>, string> = {
    synthesis: 'Synthesis combines 9 items of the same grade and category into one item — usually one grade higher. The three categories (Gear, Accessory, Material) are synthesized separately.',
    alchemy: "Alchemy melts 1–9 items down into gold. The gold returned scales with each item's grade.",
    decoration: 'Place a piece of gear that has a free slot of this kind plus one matching material — the cube grants a random stat. Decoration, Engraving and Inscription each have their own slots and material pool.',
    engraving: 'Place a piece of gear that has a free slot of this kind plus one matching material — the cube grants a random stat. Decoration, Engraving and Inscription each have their own slots and material pool.',
    inscription: 'Place a piece of gear that has a free slot of this kind plus one matching material — the cube grants a random stat. Decoration, Engraving and Inscription each have their own slots and material pool.',
    extraction: 'Extraction removes a stat you previously applied to gear, freeing its slot. The materials used to apply it are not refunded.'
  };

  function chanceFor(coin: (typeof offeringCoins)[number], grade: CubeGrade): string {
    const value = coin.outcomes.find((outcome) => outcome.grade === grade)?.chance;
    return value === undefined ? '' : `${value}%`;
  }
</script>

<article class="cube-page cube-operation-page" class:crafting-source-page={slug === 'crafting'} class:offering-source-page={slug === 'offering'}>
  {#if slug === 'crafting'}
    <header class="crafting-source-header">
      <h1>Crafting</h1>
      <p>Pick a gear slot, load the required materials and the Cube returns one random gear piece of that slot. Grade and level are rolled from the odds shown.</p>
    </header>
  {:else if slug === 'offering'}
    <header class="offering-source-header">
      <h1>Offering</h1>
      <p>A Cube function (unlocks at Cube Lv 20): spend an Anniversary Coin plus a gold fee for one random piece of gear. Each coin rolls a different grade distribution - exact odds datamined from the drop tables.</p>
    </header>
  {:else}
    <a class="cube-back" href="/cube">← Cube</a>
    <header class="cube-operation-hero">
      <img src={operation.icon} alt="" />
      <h1>{operation.name}</h1>
      <span>{operation.unlockLevel === 0 ? 'Default' : `Cube Lv${operation.unlockLevel}`}</span>
      {#if operation.unlockCost > 0}<strong><img src={costIcon} alt="" />{formatNumber(operation.unlockCost)}</strong>{/if}
    </header>
    <p class="cube-lead">{sourceLead[slug as Exclude<CubeOperationSlug, 'crafting' | 'offering'>]}</p>
    <p class="cube-operation-intro">{sourceIntro[slug as Exclude<CubeOperationSlug, 'crafting' | 'offering'>]}</p>
  {/if}

  {#if slug === 'synthesis'}
    <section aria-labelledby="synthesis-odds-heading">
      <h2 id="synthesis-odds-heading">Grade-up odds</h2>
      <p class="cube-section-copy">Result grade per input grade. Below Immortal, synthesis always grades up; from Immortal up it can stay the same grade (a fail).</p>
      <div class="cube-table-wrap"><table class="cube-table cube-odds-table"><thead><tr><th>Input</th><th>Result grade &amp; odds</th></tr></thead><tbody>{#each synthesisOdds as row (row.inputGrade)}<tr data-testid="synthesis-row"><th><a class={`grade-chip ${gradeClass(row.inputGrade)}`} href={gradeHref(row.inputGrade)}>9 × {row.inputGrade}</a></th><td><div class="cube-outcomes">{#each row.outcomes as outcome}<a class={`grade-chip ${gradeClass(outcome.grade)}`} href={gradeHref(outcome.grade)}><strong>{outcome.chance}%</strong> {outcome.grade}{#if outcome.note}<small>{outcome.note}</small>{/if}</a>{/each}</div></td></tr>{/each}</tbody></table></div>
      <h2>Recipe tiers</h2><p class="cube-section-copy">Each tier covers a material-level range and unlocks with Cube progression.</p>
      <div class="cube-table-wrap"><table class="cube-table"><thead><tr><th>Tier</th><th>Material levels</th><th>Cube level</th><th>Cost</th></tr></thead><tbody>{#each craftingTiers as tier}<tr><th>{tier.tier}</th><td>{tier.levelRange}</td><td>{tier.cubeLevel}</td><td>{tier.cost ? formatNumber(tier.cost) : '—'}</td></tr>{/each}</tbody></table></div>
    </section>
  {:else if slug === 'alchemy'}
    <section aria-labelledby="alchemy-values-heading">
      <h2 id="alchemy-values-heading">Gold &amp; EXP per grade</h2>
      <div class="cube-table-wrap"><table class="cube-table alchemy-table" aria-label="Gold and Cube EXP per grade"><thead><tr><th>Grade</th><th>Gold</th><th>Cube EXP</th></tr></thead><tbody>{#each gradeGoldAndExp as row}<tr data-testid="alchemy-row"><th class={gradeClass(row.grade)}>{row.grade}</th><td><img src={costIcon} alt="" />{formatNumber(row.gold)}</td><td>{formatNumber(row.exp)}</td></tr>{/each}</tbody></table></div>
      <p class="cube-section-copy cube-table-note">Base values shown. Rune and pet bonuses (Cube Alchemy Gold %) increase the gold you actually receive.</p>
    </section>
  {:else if slug === 'crafting'}
    <section aria-label="Crafting recipes">
      <div class="cube-slot-tabs" role="group" aria-label="Gear slot">
        {#each gearSlots as gearSlot, index}<button type="button" class:active={selectedGearSlot === gearSlot} onclick={() => (selectedGearSlot = gearSlot)}><img src={`/game/ui/${slotIcons[index]}`} alt="" />{gearSlot}</button>{/each}
      </div>
      <div class="crafting-tier-grid">
        {#each craftingTiers as tier, index (tier.tier)}
          <article class="crafting-tier-card" data-testid="crafting-tier">
            <header><strong>Tier {tier.tier}</strong><span>{tier.levelRange}</span></header>
            <div class="crafting-source-flow"><span class="crafting-material"><img src={`/game/content/items/materials/${craftingMaterials[index]}`} alt="" /></span><b>→</b><span class="crafting-result">?</span><div><h3>1 × {selectedGearSlot}</h3><small>Random roll</small></div></div>
            <div class="crafting-probability-bar" data-testid="crafting-probability-bar">{#each tier.outcomes as outcome}<span class={gradeClass(outcome.grade)} style={`width:${outcome.chance}%`}></span>{/each}</div>
            <div class="crafting-legend">{#each tier.outcomes as outcome}<span class={gradeClass(outcome.grade)}><b></b><strong>{outcome.chance}%</strong> {outcome.grade}</span>{/each}</div>
            <p class="crafting-possible">▸ {possibleItems[index]} possible items</p>
          </article>
        {/each}
      </div>
    </section>
  {:else if enchantment}
    <section aria-labelledby="enchant-slots-heading">
      <h2 id="enchant-slots-heading">Slots per gear grade</h2>
      <p class="cube-section-copy">Only gear of these grades has slots of this type — higher grades have more.</p>
      <div class="cube-grade-strip">{#each enchantment.slotGrades as entry}<a class={`grade-chip ${gradeClass(entry.grade)}`} href={gradeHref(entry.grade)}>{entry.grade} ×{entry.slots}</a>{/each}</div>
      <h2>Stat pool</h2>
      <p class="cube-section-copy">Which stat a material grants depends on the gear slot it's applied to. The tier (T1–T10) scales with the material's tier.</p>
      <div class="cube-table-wrap"><table class="cube-table enchantment-table"><thead><tr><th>Stat</th>{#if slug === 'inscription'}<th>All gear</th>{:else}<th>Weapon</th><th>Armor</th><th>Accessory</th>{/if}</tr></thead><tbody>{#each enchantment.statPool as row}<tr><th>{row.stat}</th>{#if slug === 'inscription'}<td>{row.all ?? '│'}</td>{:else}<td>{row.weapon ?? '│'}</td><td>{row.armor ?? '│'}</td><td>{row.accessory ?? '│'}</td>{/if}</tr>{/each}</tbody></table></div>
    </section>
  {:else if slug === 'extraction'}
    <section aria-labelledby="extraction-cost-heading">
      <h2 id="extraction-cost-heading">Extraction cost</h2>
      <p class="cube-section-copy">Gold cost to remove a stat, by the stat's tier and type. Identical for weapons, armor and accessories.</p>
      <div class="cube-table-wrap"><table class="cube-table extraction-table"><thead><tr><th>Stat tier</th><th>Decoration</th><th>Engraving</th><th>Inscription</th></tr></thead><tbody>{#each extractionCosts as row}<tr><th>{row.tier}</th><td><img src={costIcon} alt="" />{formatNumber(row.decoration)}</td><td><img src={costIcon} alt="" />{formatNumber(row.engraving)}</td><td><img src={costIcon} alt="" />{formatNumber(row.inscription)}</td></tr>{/each}</tbody></table></div>
    </section>
  {:else if slug === 'offering'}
    <div class="offering-grade-key">{#each allGrades as grade}<span class={gradeClass(grade)}>{grade}</span>{/each}</div>
    <div class="cube-table-wrap offering-table-wrap"><table class="cube-table offering-table" aria-label="Offering coin probabilities"><thead><tr><th>#</th><th>Coin</th><th>Cost</th>{#each allGrades as grade}<th class={gradeClass(grade)}>{grade}</th>{/each}</tr></thead><tbody>{#each offeringCoins as coin}<tr data-testid="offering-row"><td>{coin.rank}</td><th><img src={`/game/content/items/materials/Item_${160000 + coin.rank}.png`} alt={coin.name} /><a href={`/materials#${coin.materialId}`}>{coin.name}</a></th><td><img src={costIcon} alt="" />{formatNumber(coin.cost)}</td>{#each allGrades as grade}<td class={`${gradeClass(grade)} offering-probability`}>{chanceFor(coin, grade)}</td>{/each}</tr>{/each}</tbody></table></div>
  {/if}

  <section class="cube-notes" aria-labelledby="cube-notes-heading">
    <h2 id="cube-notes-heading">Details &amp; subtleties</h2>
    <ul><li>All displayed data comes from the retained public snapshot and deterministic local tables.</li><li>The local copy never consumes an item, charges gold, or writes to a source account.</li><li>Use <a href="/grades">Grades</a>, <a href="/materials">Materials</a>, and <a href="/gear">Gear</a> to inspect the retained 200-Gear sample.</li></ul>
  </section>
</article>
