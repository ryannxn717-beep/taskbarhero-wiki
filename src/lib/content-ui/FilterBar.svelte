<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    query,
    onQuery,
    onReset,
    children
  }: {
    query: string;
    onQuery: (query: string) => void;
    onReset: () => void;
    children?: Snippet;
  } = $props();
</script>

<div class="filter-bar">
  <label class="filter-field filter-search">
    <span>Name</span>
    <input
      type="search"
      value={query}
      placeholder="Search by name"
      oninput={(event) => onQuery(event.currentTarget.value)}
    />
  </label>
  {#if children}{@render children()}{/if}
  <button class="wiki-button filter-reset" type="button" onclick={onReset}>Reset filters</button>
</div>
