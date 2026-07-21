<script lang="ts">
  import { onMount } from 'svelte';
  import { filterTierLists, TIER_LIST_RECORDS, type CommunityEntity, type CommunityKind, type TierLabel } from './data';
  import { addTierDraft, createEmptyCommunityState, readCommunityState, writeCommunityState, type CommunityState } from './state';

  let { heroes }: { heroes: CommunityEntity[] } = $props();
  let communityState = $state<CommunityState>(createEmptyCommunityState());
  let kind = $state<CommunityKind>('Heroes');
  let composerOpen = $state(false);
  let title = $state('');
  let description = $state('');
  let error = $state('');
  const records = $derived(filterTierLists(TIER_LIST_RECORDS, { kind, version: 'v1.00.17' }));
  const heroBySlug = $derived(new Map(heroes.map((hero) => [hero.slug, hero])));

  onMount(() => {
    communityState = readCommunityState(localStorage);
  });

  function saveTier(event: SubmitEvent) {
    event.preventDefault();
    const tiers = Object.fromEntries((['S', 'A', 'B', 'C', 'D'] as TierLabel[]).map((label) => [label, label === 'S' && heroes[0] ? [heroes[0].slug] : []])) as Record<TierLabel, string[]>;
    try {
      communityState = addTierDraft(communityState, { title, description, tiers });
      writeCommunityState(localStorage, communityState);
      title = '';
      description = '';
      error = '';
      composerOpen = false;
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'Unable to save tier list';
    }
  }
</script>

<section class="community-page tier-index-page">
  <header class="community-heading action-heading tier-heading"><div><span class="community-kicker">COMMUNITY RANKINGS</span><h1>Tier Lists</h1><p>Rank heroes and compare retained community lists.</p></div><div class="heading-actions"><button class="community-button" type="button">My tier lists</button><button class="community-button gold" aria-label="New tier list" type="button" onclick={() => (composerOpen = true)}>＋ New tier list</button></div></header>

  <div class="tier-toolbar">
    <div class="community-tabs" aria-label="Tier list types">
      {#each ['Heroes', 'Materials', 'Skills'] as value}
        <button aria-label={`${value} tier lists`} class:active={kind === value} type="button" onclick={() => (kind = value as CommunityKind)}>{value}</button>
      {/each}
    </div>
    <label>Version<select><option>v1.00.17</option></select></label>
  </div>

  {#if kind === 'Heroes' && communityState.drafts.tierLists.length}
    <div class="tier-card-grid local-tier-grid">
      {#each communityState.drafts.tierLists as draft}<article class="tier-card local-card"><span class="local-chip">LOCAL DRAFT</span><h2>{draft.title}</h2><p>{draft.description}</p><small>Only visible in this browser</small></article>{/each}
    </div>
  {/if}

  <div class="tier-card-grid">
    {#each records as record}
      <a class="tier-card" data-testid="tier-card" href={record.slug === 'end-game-0u8p9' ? `/tier-lists/${record.slug}` : '/tier-lists'}>
        <div class="tier-card-score">▲ <strong>{record.score}</strong></div>
        <h2>{record.title}</h2><p>{record.description || 'A retained community ranking.'}</p>
        <div class="tier-avatars">{#each record.heroSlugs.slice(0, 5) as slug}{@const hero = heroBySlug.get(slug)}<span>{#if hero?.image}<img src={hero.image} alt={hero.name} />{:else}{slug.slice(0, 1)}{/if}</span>{/each}</div>
        <small>By <b>{record.author}</b> · {record.published}</small>
      </a>
    {:else}
      <div class="community-empty wide"><strong>No retained {kind} tier lists</strong><p>The public sample did not retain examples for this category. Create a local draft instead.</p></div>
    {/each}
  </div>
</section>

{#if composerOpen}
  <div class="community-modal-backdrop"><form class="community-modal small" aria-label="Local tier list composer" onsubmit={saveTier}>
    <div class="community-panel-title">NEW TIER LIST</div><p class="modal-disclosure">Creates a browser-local Heroes draft. No public ranking is posted.</p>
    <label>Tier list title<input aria-label="Tier list title" maxlength="80" bind:value={title} /></label>
    <label>Tier list description<textarea aria-label="Tier list description" rows="4" maxlength="220" bind:value={description}></textarea></label>
    {#if error}<p class="community-error" role="alert">{error}</p>{/if}
    <div class="modal-actions"><button class="community-button" type="button" onclick={() => (composerOpen = false)}>Cancel</button><button class="community-button gold" type="submit">Save local tier list</button></div>
  </form></div>
{/if}
