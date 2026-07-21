<script lang="ts">
  import { onMount } from 'svelte';
  import { TIER_LIST_RECORDS, type CommunityEntity, type TierLabel } from './data';
  import { createEmptyCommunityState, readCommunityState, toggleVote, writeCommunityState, type CommunityState, type VoteDirection } from './state';

  let { heroes }: { heroes: CommunityEntity[] } = $props();
  const record = TIER_LIST_RECORDS.find((entry) => entry.slug === 'end-game-0u8p9')!;
  let state = $state<CommunityState>(createEmptyCommunityState());
  const vote = $derived(state.votes['tier:end-game-0u8p9'] ?? 0);
  const heroBySlug = $derived(new Map(heroes.map((hero) => [hero.slug, hero])));
  const rows = ['S', 'A', 'B', 'C', 'D'] as TierLabel[];

  onMount(() => {
    state = readCommunityState(localStorage);
  });

  function voteTier(direction: VoteDirection) {
    state = toggleVote(state, 'tier:end-game-0u8p9', direction);
    writeCommunityState(localStorage, state);
  }
</script>

<article class="community-page tier-detail-page">
  <a class="community-back" href="/tier-lists">← All tier lists</a>
  <header class="detail-community-head tier-detail-head">
    <div class="detail-vote-stack"><button aria-label="Upvote tier list" aria-pressed={vote === 1} class:active={vote === 1} type="button" onclick={() => voteTier(1)}>▲</button><strong>{record.score + vote}</strong><button aria-label="Downvote tier list" aria-pressed={vote === -1} class:active={vote === -1} type="button" onclick={() => voteTier(-1)}>▼</button></div>
    <div class="detail-community-copy"><span class="community-kicker">{record.kind} · {record.version}</span><h1>{record.title}</h1><p>{record.description}</p><small>By <b>{record.author}</b> · {record.published}</small></div>
  </header>

  <section class="tier-board" aria-label="Hero tier board">
    {#each rows as label}
      <div class="tier-row tier-{label.toLowerCase()}" data-testid="tier-row">
        <strong>{label}</strong>
        <div class="tier-row-entities">
          {#each record.tiers?.[label] ?? [] as slug}
            {@const hero = heroBySlug.get(slug)}
            <a href={hero?.href ?? `/heroes/${slug}`}><span class="wiki-slot">{#if hero?.image}<img src={hero.image} alt={hero.name} />{/if}</span><b>{hero?.name ?? slug}</b></a>
          {:else}<span class="tier-empty-label">No heroes placed</span>{/each}
        </div>
      </div>
    {/each}
  </section>
  <p class="board-note">This frozen example preserves the source board interaction and layout. Votes are stored only in this browser.</p>
</article>
