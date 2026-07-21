<script lang="ts">
  import type { StageBoxRecord } from '$lib/content/schema';
  import { titleCase } from '$lib/content/database-families';
  import './database-families.css';

  let { boxes }: { boxes: readonly StageBoxRecord[] } = $props();
  let query = $state('');
  const visible = $derived(boxes.filter((box) => box.name.toLowerCase().includes(query.trim().toLowerCase())));
  const isDeleted = (box: StageBoxRecord) => box.source.deleted === true;
</script>

<section class="database-family-page stage-box-explorer" aria-labelledby="stage-box-heading">
  <header class="database-family-heading">
    <h1 id="stage-box-heading">Stage Boxes</h1>
    <p>{boxes.length} loot chests dropped by stages - open one to see its drop table.</p>
  </header>

  <p class="stage-box-note">v1.00.12: each box type now drops on a server-enforced cooldown (seconds, shown per box), and its rewards are validated server-side.</p>

  <div class="database-name-search">
    <label><span class="sr-only">Filter by name</span><input type="search" aria-label="Filter by name" placeholder="Filter by name..." bind:value={query} /></label>
  </div>

  <p class="database-family-count compact-count" role="status" aria-label="Stage Box result count">{visible.length} {visible.length === 1 ? 'box' : 'boxes'}</p>

  <div class="stage-box-grid">
    {#each visible as box}
      <a class="stage-box-card grade-tone-{box.gradeId.toLowerCase()}" class:deleted={isDeleted(box)} href={`/stage-boxes/${box.slug}`} aria-label={box.name}>
        {#if isDeleted(box)}<span class="stage-box-deleted">NO LONGER OBTAINABLE</span>{/if}
        <span class="stage-box-art">{#if box.image}<img src={box.image} alt="" loading="lazy" />{/if}</span>
        <span class="stage-box-copy">
          <small>{titleCase(box.gradeId)}</small>
          <strong>{box.name}</strong>
          <span>#{box.id}</span>
        </span>
      </a>
    {/each}
  </div>
</section>
