<script lang="ts">
  import { onMount } from 'svelte';
  import { BUILD_RECORDS, type CommunityEntity } from './data';
  import {
    createEmptyCommunityState,
    duplicateBuild,
    readCommunityState,
    toggleVote,
    writeCommunityState,
    type CommunityState,
    type VoteDirection
  } from './state';

  let { heroes, gear, runes = [] }: { heroes: CommunityEntity[]; gear: CommunityEntity[]; runes?: CommunityEntity[] } = $props();
  const build = BUILD_RECORDS[0];
  const moreBuilds = BUILD_RECORDS.slice(3, 6);
  const runeCategories = ['All', 'Combat', 'Defense', 'Chests', 'Gold', 'Experience', 'Inventory'];
  const statistics = [
    ['DPS', '736'], ['Attack Damage', '509'], ['Max HP', '725'], ['Armor', '3 046'],
    ['Attack Speed', '1.44'], ['Critical Chance', '2.0%'], ['Critical Damage', '140%'], ['Movement Speed', '1,388']
  ];
  const skillIcons: Record<string, string[]> = {
    priest: ['/game/skills/Skill_40101.png', '/game/skills/Skill_40201.png', '/game/skills/Skill_40301.png'],
    sorcerer: ['/game/skills/Skill_30101.png', '/game/skills/Skill_30201.png', '/game/skills/Skill_30301.png'],
    ranger: ['/game/skills/Skill_20101.png', '/game/skills/Skill_20201.png', '/game/skills/Skill_20301.png']
  };
  const petSlots = [
    { name: 'Dragon Hatchling', image: '/game/ui/DragonHatchling_Idle_character_0.png' },
    { name: 'Basic Slime', image: '/game/ui/BasicSlime_Idle_character_3.png' },
    { name: 'Empty pet slot', image: null },
    { name: 'Empty pet slot', image: null }
  ];

  let communityState = $state<CommunityState>(createEmptyCommunityState());
  let selectedHero = $state(build.heroes[0].slug);
  let selectedRuneCategory = $state('All');
  let runeQuery = $state('');
  let runeZoom = $state(1);
  let feedback = $state('');
  const vote = $derived(communityState.votes['build:3338'] ?? 0);
  const heroBySlug = $derived(new Map(heroes.map((hero) => [hero.slug, hero])));
  const selectedMember = $derived(build.heroes.find((member) => member.slug === selectedHero) ?? build.heroes[0]);
  const selectedHeroRecord = $derived(heroBySlug.get(selectedHero));
  const visibleRunes = $derived(runes.filter((rune, index) => {
    const queryMatches = !runeQuery.trim() || rune.name.toLowerCase().includes(runeQuery.trim().toLowerCase());
    const categoryMatches = selectedRuneCategory === 'All' || runeCategories[1 + (index % (runeCategories.length - 1))] === selectedRuneCategory;
    return queryMatches && categoryMatches;
  }));

  onMount(() => {
    communityState = readCommunityState(localStorage);
  });

  function persist(next: CommunityState) {
    communityState = next;
    writeCommunityState(localStorage, communityState);
  }

  function voteBuild(direction: VoteDirection) {
    persist(toggleVote(communityState, 'build:3338', direction));
  }

  function duplicate() {
    persist(duplicateBuild(communityState, { sourceId: build.id, title: `${build.title} copy` }));
    feedback = 'Saved as a local draft — no remote build was created.';
  }

  async function share() {
    const url = typeof window === 'undefined' ? '/builds/3338/lv70' : window.location.href;
    try {
      await navigator.clipboard?.writeText(url);
      feedback = 'Build link copied.';
    } catch {
      feedback = 'Copy unavailable. Use the current page address.';
    }
  }
</script>

<article class="community-page build-detail-page">
  <a class="community-back" href="/builds">← All builds</a>
  <header class="detail-community-head">
    <div class="detail-vote-stack">
      <button aria-label="Upvote build" aria-pressed={vote === 1} class:active={vote === 1} type="button" onclick={() => voteBuild(1)}>▲</button>
      <strong>{build.score + vote}</strong>
      <button aria-label="Downvote build" aria-pressed={vote === -1} class:active={vote === -1} type="button" onclick={() => voteBuild(-1)}>▼</button>
    </div>
    <div class="detail-community-copy"><span class="community-kicker">{build.category} · {build.version}</span><h1>{build.title}</h1><p>{build.summary}</p><small>By <b>{build.author}</b> · {build.published} · 3 heroes</small></div>
    <div class="detail-actions"><button class="community-button" aria-label="Share build" type="button" onclick={share}>↗ Share</button><button class="community-button gold" aria-label="Duplicate build" type="button" onclick={duplicate}>⧉ Duplicate build</button></div>
  </header>
  {#if feedback}<p class="local-feedback" role="status">{feedback}</p>{/if}

  <div class="hero-build-tabs" role="tablist" aria-label="Build heroes">
    {#each build.heroes as member}
      {@const hero = heroBySlug.get(member.slug)}
      <button class:active={selectedHero === member.slug} type="button" role="tab" aria-selected={selectedHero === member.slug} onclick={() => (selectedHero = member.slug)}>
        {#if hero?.image}<img src={hero.image} alt="" />{/if}<span>{hero?.name ?? member.slug}<b>Lv. {member.level}</b></span>
      </button>
    {/each}
  </div>

  <section class="selected-hero-card" aria-label="Selected build hero">
    {#if selectedHeroRecord?.image}<img src={selectedHeroRecord.image} alt="" />{/if}
    <div><strong>{selectedHeroRecord?.name ?? selectedHero}</strong><small>{selectedHero.toUpperCase()} · Lv{selectedMember.level}</small></div>
  </section>

  <section class="build-workbench">
    <div class="build-loadout-column">
      <div class="community-panel">
        <div class="community-panel-title">ACTIVE SKILLS</div>
        <div class="build-skill-strip">
          {#each skillIcons[selectedHero] ?? [] as image, index}<span class="wiki-slot"><img src={image} alt={`Skill ${index + 1}`} /></span>{/each}
        </div>
      </div>
      <div class="community-panel">
        <div class="community-panel-title">EQUIPMENT <small>{Math.min(gear.length, 10)}/10</small></div>
        <div class="build-gear-grid">
          {#each Array(10) as _, index}
            {@const item = gear[index]}
            <span data-testid="build-equipment-slot" class="equipment-slot-wrap">
              {#if item}
                <a data-testid="build-gear" class="wiki-slot" href={item.href} title={item.name}>{#if item.image}<img src={item.image} alt={item.name} />{/if}</a>
                <small>{item.name}</small>
              {:else}
                <span class="wiki-slot empty" aria-label="Empty equipment slot"></span><small>Empty</small>
              {/if}
            </span>
          {/each}
        </div>
      </div>
    </div>

    <div class="community-panel skill-tree-panel">
      <div class="community-panel-title">SKILLS</div>
      <div class="skill-level-track">
        {#each [0, 10, 20, 30, 40, 50, 60, 70] as level}<span>Lv{level}</span>{/each}
      </div>
      <div class="skill-tree-grid">
        {#each Array(24) as _, index}
          <span class:lit={index % 3 !== 2} class="skill-node">{#if index < (skillIcons[selectedHero]?.length ?? 0)}<img src={skillIcons[selectedHero][index]} alt="" />{:else}<b>{index % 5 === 0 ? '10/10' : index + 1}</b>{/if}</span>
        {/each}
      </div>
      <p>Selected skill progression · switch heroes above to inspect each loadout</p>
    </div>
  </section>

  <section class="community-panel build-stats-panel" aria-label="Build statistics">
    <div class="build-section-heading"><strong>STATS</strong><button type="button">DETAILS</button></div>
    <div class="build-stat-grid">
      {#each statistics as stat}<div><small>{stat[0]}</small><b>{stat[1]}</b></div>{/each}
    </div>
  </section>

  <section class="community-panel build-runes-panel" aria-label="Build runes">
    <div class="build-section-heading"><strong>RUNES <small>{runes.length} retained examples</small></strong><span>197 source nodes · local sample</span></div>
    <div class="build-rune-workspace">
      <div class="rune-builder-canvas-column">
        <div class="rune-builder-controls">
          <button type="button" aria-label="Zoom rune tree in" onclick={() => (runeZoom = Math.min(1.4, runeZoom + .1))}>+</button>
          <button type="button" aria-label="Zoom rune tree out" onclick={() => (runeZoom = Math.max(.7, runeZoom - .1))}>−</button>
          <button type="button" onclick={() => (runeZoom = 1)}>Reset</button>
        </div>
        <label class="build-rune-search">Search runes<input type="search" placeholder="Search rune, stat or id…" bind:value={runeQuery} /></label>
        <div class="build-rune-map" role="application" aria-label="Build rune tree">
          <div class="rune-map-inner" style={`transform: scale(${runeZoom})`}>
            {#each runes.slice(0, 18) as rune, index}
              <a href={rune.href} title={rune.name} style={`--x:${12 + ((index * 29) % 76)}%;--y:${10 + ((index * 37) % 78)}%`}>
                {#if rune.image}<img src={rune.image} alt="" />{:else}<span>◆</span>{/if}
              </a>
            {/each}
          </div>
          <small>Drag to pan · Scroll to zoom · Select a rune</small>
        </div>
      </div>

      <div class="selected-runes-column">
        <div class="rune-selection-summary"><span>{visibleRunes.length} shown</span><b>346,400,050 gold</b></div>
        <div class="rune-category-tabs" aria-label="Rune categories">
          {#each runeCategories as category}<button type="button" class:active={selectedRuneCategory === category} onclick={() => (selectedRuneCategory = category)}>{category}</button>{/each}
        </div>
        <div class="selected-rune-list">
          {#each visibleRunes as rune, index}
            <a data-testid="build-rune" href={rune.href}>
              {#if rune.image}<img src={rune.image} alt="" />{/if}
              <span><strong>{rune.name}</strong><small>{index % 2 ? 'All Hero Attack Speed +5%' : 'All Hero Attack Damage +10%'}</small><em>{index % 3 ? 'Combat' : 'Utility'} · {(index + 1) * 50_000} gold</em></span>
              <b>Lv{1 + (index % 5)}/5</b>
            </a>
          {:else}
            <p class="rune-builder-empty">No sampled runes match this filter.</p>
          {/each}
        </div>
      </div>
    </div>
  </section>

  <section class="community-panel build-pets-panel" aria-label="Build pets">
    <div class="build-section-heading"><strong>PETS <small>4</small></strong></div>
    <div class="build-pet-grid">
      {#each petSlots as pet}<span class="wiki-slot" title={pet.name}>{#if pet.image}<img src={pet.image} alt={pet.name} />{/if}</span>{/each}
    </div>
  </section>

  <section class="build-text-section">
    <h2>Strategy</h2>
    <p>The author did not provide a strategy for this build. Use the hero tabs, skill paths, equipment, statistics and sampled rune workspace above as the complete retained loadout reference.</p>
  </section>

  <section class="build-text-section build-discussion">
    <h2>Discussion</h2>
    <p><strong>Local discussion preview.</strong> Sign-in and public comments are not connected; the examples below remain on this site.</p>
    <div class="build-comment"><span class="profile-avatar">L</span><div><b>LateGamePlayer</b><small> retained English example</small><p>The three-hero setup is a good baseline. Swap the heal skill only after the Priest can keep the formation alive.</p><a href="#discussion">Reply</a></div></div>
    <div class="build-comment reply"><span class="profile-avatar">R</span><div><b>RangerMain</b><small> retained English example</small><p>I use life steal on accessories when the stage outscales the listed armor benchmark.</p></div></div>
  </section>

  <section class="more-builds-section">
    <h2>More builds</h2>
    <div class="more-build-list">
      {#each moreBuilds as entry}
        <a href="/builds" class="more-build-card">
          <div><span class="community-kicker">{entry.category} · {entry.version}</span><strong>{entry.title}</strong><small>{entry.heroes.length} heroes · {entry.author} · {entry.published}</small></div>
          <div class="more-build-party">
            {#each entry.heroes as member}{@const hero = heroBySlug.get(member.slug)}<span>{#if hero?.image}<img src={hero.image} alt="" />{/if}<b>Lv{member.level}</b></span>{/each}
          </div>
          <em>★ {entry.score}</em>
        </a>
      {/each}
    </div>
  </section>
</article>
