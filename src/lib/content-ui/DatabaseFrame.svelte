<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    title,
    intro = '',
    count,
    countLabel = 'results',
    toolbar,
    children
  }: {
    title: string;
    intro?: string;
    count: number;
    countLabel?: string;
    toolbar?: Snippet;
    children?: Snippet;
  } = $props();

  const headingId = $derived(`database-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
</script>

<section class="database-frame" aria-labelledby={headingId}>
  <header class="database-heading">
    <h1 id={headingId}>{title}</h1>
    {#if intro}<p>{intro}</p>{/if}
  </header>

  <div class="database-toolbar" role="region" aria-label="Database controls">
    {#if toolbar}{@render toolbar()}{/if}
  </div>

  <p class="database-count" role="status" aria-label="Result count">{count.toLocaleString('en-US')} {countLabel}</p>
  {#if children}{@render children()}{/if}
</section>
