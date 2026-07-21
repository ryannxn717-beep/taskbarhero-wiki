<script lang="ts">
  import { onMount } from 'svelte';
  import {
    BUILD_RECORDS,
    filterBuilds,
    type BuildCategory,
    type BuildSort,
    type CommunityEntity
  } from './data';
  import {
    createEmptyCommunityState,
    duplicateBuild,
    readCommunityState,
    writeCommunityState,
    type CommunityState
  } from './state';

  let { heroes }: { heroes: CommunityEntity[] } = $props();
  let communityState = $state<CommunityState>(createEmptyCommunityState());
  let sort = $state<BuildSort>('top');
  let version = $state<'all' | 'v1.00.17'>('v1.00.17');
  let query = $state('');
  let category = $state<'all' | BuildCategory>('all');
  let heroSlug = $state('all');
  let minLevel = $state('');
  let maxLevel = $state('');
  let composerOpen = $state(false);
  let draftTitle = $state('New local build');
  let error = $state('');
  let visibleLimit = $state(4);

  const heroBySlug = $derived(new Map(heroes.map((hero) => [hero.slug, hero])));
  const categories: BuildCategory[] = ['General', 'Campaign', 'Boss', 'Farming', 'Speed Farm', 'Beginner', 'Endgame'];
  const skillIcons = [
    '/game/skills/Skill_20101.png', '/game/skills/Skill_20201.png', '/game/skills/Skill_30101.png',
    '/game/skills/Skill_30201.png', '/game/skills/Skill_40101.png', '/game/skills/Skill_40201.png',
    '/game/skills/Skill_50101.png', '/game/ui/AdditionalGold.png', '/game/ui/AllHeroAttackDamage.png'
  ];
  const results = $derived(filterBuilds(BUILD_RECORDS, {
    sort,
    version,
    query,
    category,
    heroSlug,
    minLevel: minLevel === '' ? null : Number(minLevel),
    maxLevel: maxLevel === '' ? null : Number(maxLevel)
  }));
  const visibleResults = $derived(results.slice(0, visibleLimit));

  onMount(() => {
    communityState = readCommunityState(localStorage);
  });

  function saveBuild(event: SubmitEvent) {
    event.preventDefault();
    try {
      communityState = duplicateBuild(communityState, { sourceId: '3338', title: draftTitle });
      writeCommunityState(localStorage, communityState);
      composerOpen = false;
      error = '';
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'Unable to save build';
    }
  }

  function resetFilters() {
    sort = 'top';
    version = 'v1.00.17';
    query = '';
    category = 'all';
    heroSlug = 'all';
    minLevel = '';
    maxLevel = '';
    visibleLimit = 4;
  }
</script>

<section class="community-page builds-page">
  <header class="community-heading action-heading">
    <div><span class="community-kicker">COMMUNITY LOADOUTS</span><h1>Builds</h1><p>Browse retained hero setups or keep a draft in this browser.</p></div>
    <button class="community-button gold" type="button" onclick={() => (composerOpen = true)}>＋ Create a build</button>
  </header>

  <div class="community-tabs build-sort-tabs" aria-label="Build sorting">
    <button class:active={sort === 'top'} type="button" onclick={() => (sort = 'top')}>▲ Top</button>
    <button class:active={sort === 'trending'} type="button" onclick={() => (sort = 'trending')}>⌁ Trending</button>
    <button class:active={sort === 'new'} type="button" onclick={() => (sort = 'new')}>✦ New</button>
  </div>

  <div class="build-filter-panel">
    <div class="build-filter-primary">
      <label>Game version<select bind:value={version}><option value="v1.00.17">v1.00.17</option><option value="all">All versions</option></select></label>
      <label class="filter-search">Search<input aria-label="Search builds" type="search" placeholder="Search builds..." bind:value={query} /></label>
    </div>
    <div class="source-filter-buttons category-buttons" aria-label="Build categories">
      <button class:active={category === 'all'} type="button" onclick={() => (category = 'all')}>All</button>
      {#each categories as value}<button class:active={category === value} type="button" onclick={() => (category = value)}>{value}</button>{/each}
    </div>
    <div class="build-filter-secondary">
      <div class="source-filter-buttons hero-filter-buttons" aria-label="Build heroes">
        <button class:active={heroSlug === 'all'} type="button" onclick={() => (heroSlug = 'all')}>All</button>
        {#each heroes as hero}<button class:active={heroSlug === hero.slug} type="button" title={hero.name} onclick={() => (heroSlug = hero.slug)}>{#if hero.image}<img src={hero.image} alt={hero.name} />{:else}{hero.name.slice(0, 1)}{/if}</button>{/each}
      </div>
      <label class="sr-only">Hero<select aria-label="Build hero" bind:value={heroSlug}><option value="all">All heroes</option>{#each heroes as hero}<option value={hero.slug}>{hero.name}</option>{/each}</select></label>
      <label>Min level<input aria-label="Minimum hero level" type="number" min="0" max="999" placeholder="Min Lv" bind:value={minLevel} /></label>
      <label>Max level<input aria-label="Maximum hero level" type="number" min="0" max="999" placeholder="Max Lv" bind:value={maxLevel} /></label>
      <button class="community-button filter-reset" type="button" onclick={resetFilters}>Reset</button>
    </div>
  </div>

  <div class="results-line"><strong>{results.length}</strong> retained builds {#if communityState.drafts.builds.length}<span>· {communityState.drafts.builds.length} local draft(s)</span>{/if}</div>

  <div class="build-list">
    {#each visibleResults as build}
      <a class="build-card" data-testid="build-card" href={build.id === '3338' ? `/builds/${build.id}/${build.slug}` : '/builds'}>
        <div class="build-card-main">
          <div class="build-card-head"><span>{build.category}</span><i>{build.version}</i><h2>{build.title}</h2></div>
          <small>{build.heroes.length} heroes · By <b>{build.author}</b> · {build.published}</small>
          <p>{build.summary}</p>
          <div class="build-party">
            {#each build.heroes as member, memberIndex}
              {@const hero = heroBySlug.get(member.slug)}
              <div class="build-loadout-row">
                <span class="build-hero" title={`${hero?.name ?? member.slug} level ${member.level}`}>{#if hero?.image}<img src={hero.image} alt={hero.name} />{/if}<b>Lv{member.level}</b></span>
                <span class="mini-skill-row">{#each skillIcons.slice(memberIndex, memberIndex + 8) as icon}<i><img src={icon} alt="" /></i>{/each}</span>
              </div>
            {/each}
          </div>
        </div>
        <div class="build-vote"><span>★</span><strong>{build.score}</strong></div>
      </a>
    {:else}
      <div class="community-empty"><strong>No builds found</strong><p>Change or reset the filters to show the retained examples.</p></div>
    {/each}
  </div>
  {#if visibleLimit < results.length}<button class="community-button build-load-more" type="button" onclick={() => (visibleLimit += 4)}>Load more builds ({results.length - visibleLimit})</button>{/if}
</section>

{#if composerOpen}
  <div class="community-modal-backdrop">
    <form class="community-modal small" aria-label="Local build composer" onsubmit={saveBuild}>
      <div class="community-panel-title">CREATE A BUILD</div>
      <p class="modal-disclosure">Creates a browser-local draft from the retained LV70 structure.</p>
      <label>Build title<input aria-label="Build title" maxlength="80" bind:value={draftTitle} /></label>
      {#if error}<p class="community-error" role="alert">{error}</p>{/if}
      <div class="modal-actions"><button class="community-button" type="button" onclick={() => (composerOpen = false)}>Cancel</button><button class="community-button gold" type="submit">Save local build</button></div>
    </form>
  </div>
{/if}
