<script lang="ts">
  import type { ContentRecord } from '$lib/content/schema';
  import EntityCard from './EntityCard.svelte';

  let {
    records,
    hrefFor,
    onReset
  }: {
    records: readonly ContentRecord[];
    hrefFor: (record: ContentRecord) => string;
    onReset?: () => void;
  } = $props();
</script>

{#if records.length > 0}
  <div class="entity-grid" role="list" aria-label="Database results">
    {#each records as record (`${record.kind}:${record.id}`)}
      <div role="listitem"><EntityCard {record} href={hrefFor(record)} /></div>
    {/each}
  </div>
{:else}
  <div class="database-empty">
    <p>No matches</p>
    {#if onReset}<button class="wiki-button" type="button" onclick={onReset}>Reset</button>{/if}
  </div>
{/if}
