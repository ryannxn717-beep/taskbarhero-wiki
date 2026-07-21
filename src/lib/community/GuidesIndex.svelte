<script lang="ts">
  import { onMount } from 'svelte';
  import { GUIDE_RECORDS } from './data';
  import {
    addGuideDraft,
    createEmptyCommunityState,
    readCommunityState,
    writeCommunityState,
    type CommunityState
  } from './state';

  let communityState = $state<CommunityState>(createEmptyCommunityState());
  let composerOpen = $state(false);
  let title = $state('');
  let summary = $state('');
  let body = $state('');
  let error = $state('');

  onMount(() => {
    communityState = readCommunityState(localStorage);
  });

  function saveDraft(event: SubmitEvent) {
    event.preventDefault();
    try {
      communityState = addGuideDraft(communityState, { title, summary, body });
      writeCommunityState(localStorage, communityState);
      title = '';
      summary = '';
      body = '';
      error = '';
      composerOpen = false;
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'Unable to save this draft';
    }
  }
</script>

<section class="community-page guides-page">
  <header class="community-heading action-heading">
    <div>
      <span class="community-kicker">PLAYER KNOWLEDGE</span>
      <h1>Guides</h1>
      <p>Community-written strategies, progression notes and hero builds.</p>
    </div>
    <button class="community-button gold" aria-label="Write a guide" type="button" onclick={() => (composerOpen = true)}>✎ Write a guide</button>
  </header>

  <div class="guide-grid">
    {#each communityState.drafts.guides as guide}
      <article class="guide-card local-card" data-testid="guide-card">
        <div class="guide-thumb initial"><span>{guide.title.slice(0, 1)}</span></div>
        <div class="guide-card-copy">
          <span class="local-chip">LOCAL DRAFT</span>
          <h2>{guide.title}</h2>
          <p>{guide.summary}</p>
          <small>Only visible in this browser</small>
        </div>
      </article>
    {/each}
    {#each GUIDE_RECORDS as guide}
      <a class="guide-card" data-testid="guide-card" href={guide.slug === 'ranger-archer-solo-build-guide' ? `/guides/${guide.slug}` : '/guides'}>
        <div class:initial={!guide.image} class="guide-thumb">
          {#if guide.image}<img src={guide.image} alt="" />{:else}<span>{guide.initial}</span>{/if}
        </div>
        <div class="guide-card-copy">
          <h2>{guide.title}</h2>
          <p>{guide.summary}</p>
          <small>By <b>{guide.author}</b> · {guide.published}</small>
        </div>
      </a>
    {/each}
  </div>
</section>

{#if composerOpen}
  <div class="community-modal-backdrop">
    <form class="community-modal" aria-label="Local guide composer" onsubmit={saveDraft}>
      <div class="community-panel-title">WRITE A GUIDE</div>
      <p class="modal-disclosure">Saved only in this browser. This draft is not published.</p>
      <label>Guide title<input aria-label="Guide title" maxlength="80" bind:value={title} /></label>
      <label>Guide summary<textarea aria-label="Guide summary" rows="3" maxlength="220" bind:value={summary}></textarea></label>
      <label>Guide body<textarea aria-label="Guide body" rows="7" maxlength="5000" bind:value={body}></textarea></label>
      {#if error}<p class="community-error" role="alert">{error}</p>{/if}
      <div class="modal-actions">
        <button class="community-button" type="button" onclick={() => (composerOpen = false)}>Cancel</button>
        <button class="community-button gold" type="submit">Save local draft</button>
      </div>
    </form>
  </div>
{/if}
